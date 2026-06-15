"""转发到路由器 mihomo Clash RESTful API + 流式 SSE 端点。"""

import json
import os

import httpx
from fastapi import APIRouter, Request, Response
from fastapi.responses import StreamingResponse

CLASH_API_BASE = os.getenv("CLASH_API_BASE", "http://192.168.5.1:9999").rstrip("/")
CLASH_API_SECRET = os.getenv("CLASH_API_SECRET", "")
STREAM_PATHS = {"traffic", "logs", "memory"}

router = APIRouter(prefix="/api/clash/api")


# 必须在 catch-all passthrough 之前定义，否则会被 /{path:path} 抢去
@router.get("/logs_buffered")
async def logs_buffered():
    """先发回最近 24h 的缓存日志，然后实时推送新日志。前端用 EventSource 直读。"""
    from . import clash_logs

    async def gen():
        for entry in clash_logs.collector.snapshot():
            yield f"data: {json.dumps(entry, ensure_ascii=False)}\n\n".encode("utf-8")
        q = clash_logs.collector.subscribe()
        try:
            while True:
                entry = await q.get()
                yield f"data: {json.dumps(entry, ensure_ascii=False)}\n\n".encode("utf-8")
        except (GeneratorExit, Exception):
            return
        finally:
            clash_logs.collector.unsubscribe(q)

    return StreamingResponse(gen(), media_type="text/event-stream", headers={
        "Cache-Control": "no-cache",
        "X-Accel-Buffering": "no",
    })


def _headers() -> dict:
    return {"Authorization": f"Bearer {CLASH_API_SECRET}"} if CLASH_API_SECRET else {}


@router.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH"])
async def passthrough(path: str, request: Request):
    url = f"{CLASH_API_BASE}/{path}"
    qs = str(request.url.query)
    if qs:
        url += "?" + qs

    # newline-delimited JSON 流（mihomo 不发标准 SSE，我们包成 SSE 给浏览器 EventSource 用）
    if request.method == "GET" and path.split("/")[0] in STREAM_PATHS:
        async def gen():
            client = httpx.AsyncClient(timeout=None)
            try:
                async with client.stream("GET", url, headers=_headers()) as r:
                    async for line in r.aiter_lines():
                        if line:
                            yield f"data: {line}\n\n".encode("utf-8")
            except (httpx.HTTPError, GeneratorExit):
                return
            finally:
                await client.aclose()
        return StreamingResponse(gen(), media_type="text/event-stream", headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        })

    body = await request.body()
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            r = await client.request(
                request.method, url,
                content=body if body else None,
                headers={**_headers(), **({"Content-Type": "application/json"} if body else {})},
            )
    except httpx.HTTPError as e:
        return Response(
            content=f'{{"error":"clash api unreachable: {e!s}"}}',
            status_code=502, media_type="application/json",
        )
    ct = r.headers.get("Content-Type", "application/json")
    return Response(content=r.content, status_code=r.status_code, media_type=ct)
