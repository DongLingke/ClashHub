"""路由器 Clash 日志后台收集器：常驻订阅 `/logs`，缓存 24h，对前端 SSE 广播。"""

import asyncio
import json
import time
from collections import deque

import httpx

from .clash_api import CLASH_API_BASE, _headers

MAX_BUFFER = 10000
MAX_AGE = 24 * 3600  # 24 小时
RETRY_INTERVAL = 5
LEVEL = "info"


class LogCollector:
    def __init__(self):
        self.buf: deque = deque(maxlen=MAX_BUFFER)
        self.subscribers: list[asyncio.Queue] = []
        self._task: asyncio.Task | None = None

    def start(self):
        if self._task and not self._task.done():
            return
        self._task = asyncio.create_task(self._run(), name="clash-logs-collector")

    def stop(self):
        if self._task:
            self._task.cancel()
            self._task = None

    async def _run(self):
        url = f"{CLASH_API_BASE}/logs?level={LEVEL}"
        while True:
            try:
                async with httpx.AsyncClient(timeout=None) as client:
                    async with client.stream("GET", url, headers=_headers()) as r:
                        if r.status_code != 200:
                            raise RuntimeError(f"HTTP {r.status_code}")
                        async for line in r.aiter_lines():
                            if not line.strip():
                                continue
                            try:
                                d = json.loads(line)
                            except json.JSONDecodeError:
                                continue
                            entry = {
                                "ts": time.time(),
                                "type": d.get("type", "info"),
                                "payload": d.get("payload", ""),
                            }
                            self._prune()
                            self.buf.append(entry)
                            self._broadcast(entry)
            except asyncio.CancelledError:
                return
            except Exception:
                pass
            try:
                await asyncio.sleep(RETRY_INTERVAL)
            except asyncio.CancelledError:
                return

    def _prune(self):
        cutoff = time.time() - MAX_AGE
        while self.buf and self.buf[0]["ts"] < cutoff:
            self.buf.popleft()

    def _broadcast(self, entry: dict):
        dead = []
        for q in self.subscribers:
            try:
                q.put_nowait(entry)
            except asyncio.QueueFull:
                dead.append(q)
        for q in dead:
            try:
                self.subscribers.remove(q)
            except ValueError:
                pass

    def snapshot(self) -> list[dict]:
        self._prune()
        return list(self.buf)

    def subscribe(self) -> asyncio.Queue:
        q: asyncio.Queue = asyncio.Queue(maxsize=4000)
        self.subscribers.append(q)
        return q

    def unsubscribe(self, q: asyncio.Queue):
        try:
            self.subscribers.remove(q)
        except ValueError:
            pass


collector = LogCollector()
