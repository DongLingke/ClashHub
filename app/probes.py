import asyncio
import re
import time

import httpx

from . import db

CN_SITES = [
    "https://www.baidu.com",
    "https://www.qq.com",
    "https://www.taobao.com",
    "https://www.jd.com",
    "https://www.bilibili.com",
    "https://www.163.com",
    "https://weibo.com",
    "https://www.aliyun.com",
    "https://www.zhihu.com",
    "https://www.douyin.com",
]

INTL_SITES = [
    "https://www.google.com/generate_204",
    "https://www.youtube.com",
    "https://github.com",
    "https://www.cloudflare.com",
    "https://www.wikipedia.org",
    "https://x.com",
    "https://www.facebook.com",
    "https://www.instagram.com",
    "https://www.reddit.com",
    "https://openai.com",
]

IP_APIS = [
    "https://4.ipw.cn",
    "https://myip.ipip.net",
    "https://api.ip.sb/ip",
    "https://api.ipify.org",
]

network_state: dict = {
    "ip": None,
    "cn_percent": None,
    "intl_percent": None,
    "cn_detail": [],
    "intl_detail": [],
    "checked_at": None,
}


async def _check_site(client: httpx.AsyncClient, url: str) -> dict:
    host = re.sub(r"^https?://", "", url).split("/")[0]
    try:
        await client.head(url, timeout=3.0)
        return {"site": host, "ok": True}
    except httpx.HTTPError:
        return {"site": host, "ok": False}


async def _fetch_public_ip(client: httpx.AsyncClient) -> str | None:
    for api in IP_APIS:
        try:
            r = await client.get(api, timeout=5.0)
            m = re.search(r"\d{1,3}(?:\.\d{1,3}){3}", r.text)
            if m:
                return m.group(0)
        except httpx.HTTPError:
            continue
    return None


async def probe_network():
    headers = {"User-Agent": "Mozilla/5.0 (ClashHub probe)"}
    async with httpx.AsyncClient(headers=headers, follow_redirects=False) as client:
        ip_task = _fetch_public_ip(client)
        cn_tasks = [_check_site(client, u) for u in CN_SITES]
        intl_tasks = [_check_site(client, u) for u in INTL_SITES]
        results = await asyncio.gather(ip_task, *cn_tasks, *intl_tasks)
    ip = results[0]
    cn = results[1 : 1 + len(CN_SITES)]
    intl = results[1 + len(CN_SITES) :]
    network_state.update(
        ip=ip,
        cn_percent=round(100 * sum(r["ok"] for r in cn) / len(cn)),
        intl_percent=round(100 * sum(r["ok"] for r in intl) / len(intl)),
        cn_detail=cn,
        intl_detail=intl,
        checked_at=time.time(),
    )


async def _check_tcp(host: str, port: int) -> bool:
    try:
        _, writer = await asyncio.wait_for(asyncio.open_connection(host, port), timeout=2.0)
        writer.close()
        try:
            await writer.wait_closed()
        except OSError:
            pass
        return True
    except (OSError, asyncio.TimeoutError):
        return False


async def probe_services():
    services = db.list_services()
    results = await asyncio.gather(*(_check_tcp(s["host"], s["port"]) for s in services))
    now = time.time()
    for s, online in zip(services, results):
        db.set_service_state(s["id"], online, now)


async def network_loop():
    while True:
        try:
            await probe_network()
        except Exception:
            pass
        await asyncio.sleep(db.refresh_interval())


async def services_loop():
    while True:
        try:
            await probe_services()
        except Exception:
            pass
        await asyncio.sleep(db.refresh_interval())
