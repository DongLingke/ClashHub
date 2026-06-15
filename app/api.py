import time

import httpx
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import PlainTextResponse
from pydantic import BaseModel, Field

from . import clash, config, db, deploy, probes

router = APIRouter()


# ---------- 状态 ----------

@router.get("/api/status/network")
def network_status():
    return probes.network_state


@router.get("/api/services")
def services():
    now = time.time()
    out = []
    for s in db.list_services():
        item = {"id": s["id"], "name": s["name"], "host": s["host"], "port": s["port"]}
        if s["online"] is None:
            item["status"] = "unknown"
        else:
            item["status"] = "online" if s["online"] else "offline"
            item["duration"] = now - s["since"]
            item["last_check"] = s["last_check"]
        out.append(item)
    return out


class ServiceIn(BaseModel):
    name: str = Field(min_length=1, max_length=64)
    host: str = Field(min_length=1, max_length=255)
    port: int = Field(ge=1, le=65535)


@router.post("/api/services")
async def add_service(body: ServiceIn):
    sid = db.add_service(body.name.strip(), body.host.strip(), body.port)
    await probes.probe_services()
    return {"id": sid}


@router.put("/api/services/{sid}")
async def update_service(sid: int, body: ServiceIn):
    db.update_service(sid, body.name.strip(), body.host.strip(), body.port)
    await probes.probe_services()
    return {"ok": True}


@router.delete("/api/services/{sid}")
def delete_service(sid: int):
    db.delete_service(sid)
    return {"ok": True}


# ---------- 设置 ----------

@router.get("/api/settings")
def get_settings():
    return {
        "refresh_interval": db.refresh_interval(),
        "sub_url": db.get_setting("sub_url", ""),
    }


class SettingsIn(BaseModel):
    refresh_interval: int = Field(ge=config.MIN_REFRESH_INTERVAL, le=config.MAX_REFRESH_INTERVAL)


@router.put("/api/settings")
def put_settings(body: SettingsIn):
    db.set_setting("refresh_interval", str(body.refresh_interval))
    return {"ok": True}


# ---------- Clash ----------

@router.get("/api/clash/meta")
def clash_meta(request: Request):
    token = db.get_setting("clash_token")
    base = f"{request.url.scheme}://{request.url.netloc}"
    files = []
    for key, name in config.CLASH_FILES.items():
        files.append({
            "key": key,
            "name": name,
            "sub_url": f"{base}/clash/{token}/{name}",
            "policies": clash.get_policies(key),
        })
    return {"files": files}


@router.get("/clash/{token}/{name}")
def clash_subscription(token: str, name: str):
    if token != db.get_setting("clash_token"):
        raise HTTPException(404)
    for key, fname in config.CLASH_FILES.items():
        if fname == name:
            return PlainTextResponse(
                clash.read_text(key),
                media_type="text/yaml; charset=utf-8",
                headers={"Content-Disposition": f"attachment; filename={fname}"},
            )
    raise HTTPException(404)


@router.get("/api/clash/{key}/raw")
def get_raw(key: str):
    _check_key(key)
    return {"text": clash.read_text(key)}


class RawIn(BaseModel):
    text: str = Field(min_length=1)
    deploy: bool = True


@router.put("/api/clash/{key}/raw")
def put_raw(key: str, body: RawIn):
    _check_key(key)
    clash.create_backup(key, "raw_edit")
    try:
        clash.validate_and_write(key, body.text)
    except Exception as e:
        raise HTTPException(400, f"YAML 不合法: {e}")
    result = {"ok": True, "deploy": None}
    if body.deploy and key == "router":
        result["deploy"] = deploy.deploy_to_router(clash.read_text("router"))
    return result


@router.get("/api/clash/{key}/rules")
def get_rules(key: str):
    _check_key(key)
    return {"entries": clash.parse_rules(key), "policies": clash.get_policies(key)}


class RulesIn(BaseModel):
    entries: list[dict]
    deploy: bool = True


@router.put("/api/clash/{key}/rules")
def put_rules(key: str, body: RulesIn):
    _check_key(key)
    block = clash.serialize_rules(body.entries)
    new_text = clash.replace_section(key, "rules", block)
    clash.create_backup(key, "rules_edit")
    try:
        clash.validate_and_write(key, new_text)
    except Exception as e:
        raise HTTPException(400, f"规则不合法: {e}")
    result = {"ok": True, "deploy": None}
    if body.deploy and key == "router":
        result["deploy"] = deploy.deploy_to_router(clash.read_text("router"))
    return result


class SubUpdateIn(BaseModel):
    url: str = Field(min_length=4)
    deploy: bool = True


@router.post("/api/clash/update-proxies")
def update_proxies(body: SubUpdateIn):
    steps = []
    try:
        r = httpx.get(
            body.url,
            headers={"User-Agent": "clash.meta/v1.18 (ClashHub)"},
            timeout=20,
            follow_redirects=True,
        )
        r.raise_for_status()
        proxies = clash.extract_proxies_from_subscription(r.text)
        steps.append({"name": "拉取订阅", "ok": True, "detail": f"{len(proxies)} 个节点"})
    except Exception as e:
        steps.append({"name": "拉取订阅", "ok": False, "detail": str(e)[:300]})
        return {"ok": False, "steps": steps}

    block = clash.serialize_proxies(proxies)
    for key in config.CLASH_FILES:
        try:
            new_text = clash.replace_section(key, "proxies", block)
            clash.create_backup(key, "sub_update")
            clash.validate_and_write(key, new_text)
            steps.append({"name": f"更新 {config.CLASH_FILES[key]}", "ok": True, "detail": ""})
        except Exception as e:
            steps.append({"name": f"更新 {config.CLASH_FILES[key]}", "ok": False, "detail": str(e)[:300]})
            return {"ok": False, "steps": steps}

    db.set_setting("sub_url", body.url)
    result = {"ok": True, "steps": steps, "deploy": None}
    if body.deploy:
        result["deploy"] = deploy.deploy_to_router(clash.read_text("router"))
        result["ok"] = result["deploy"]["ok"]
    return result


@router.post("/api/clash/deploy")
def manual_deploy():
    return deploy.deploy_to_router(clash.read_text("router"))


@router.post("/api/clash/restart")
def restart_clash():
    return deploy.restart_router_clash()


# ---------- 备份 ----------

@router.get("/api/clash/{key}/backups")
def backups(key: str):
    _check_key(key)
    return clash.list_backups(key)


class RestoreIn(BaseModel):
    backup_id: str
    deploy: bool = True


@router.post("/api/clash/{key}/restore")
def restore(key: str, body: RestoreIn):
    _check_key(key)
    try:
        clash.restore_backup(key, body.backup_id)
    except FileNotFoundError:
        raise HTTPException(404, "备份不存在")
    except Exception as e:
        raise HTTPException(400, f"备份内容不合法: {e}")
    result = {"ok": True, "deploy": None}
    if body.deploy and key == "router":
        result["deploy"] = deploy.deploy_to_router(clash.read_text("router"))
    return result


def _check_key(key: str):
    if key not in config.CLASH_FILES:
        raise HTTPException(404, "未知配置文件")
