import asyncio
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from . import api, clash_api, clash_logs, config, db, probes


@asynccontextmanager
async def lifespan(app: FastAPI):
    db.init()
    tasks = [
        asyncio.create_task(probes.network_loop()),
        asyncio.create_task(probes.services_loop()),
    ]
    clash_logs.collector.start()
    yield
    clash_logs.collector.stop()
    for t in tasks:
        t.cancel()


app = FastAPI(title="ClashHub", lifespan=lifespan)
app.include_router(api.router)
app.include_router(clash_api.router)


@app.get("/")
def index():
    return FileResponse(config.STATIC_DIR / "index.html")


app.mount("/static", StaticFiles(directory=config.STATIC_DIR), name="static")
