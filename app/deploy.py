"""把 Router.yaml 下发到路由器 (ShellCrash) 并重启服务。"""

import shlex
import time

import paramiko

from . import config

# 路由器的 dropbear 只提供 ssh-rsa 主机密钥；paramiko 3+ 默认禁用，这里启用。
if "ssh-rsa" not in paramiko.Transport._preferred_keys:
    paramiko.Transport._preferred_keys = ("ssh-rsa",) + paramiko.Transport._preferred_keys
    paramiko.Transport._preferred_pubkeys = ("ssh-rsa",) + paramiko.Transport._preferred_pubkeys


def _step(steps: list, name: str, ok: bool, detail: str = ""):
    steps.append({"name": name, "ok": ok, "detail": detail.strip()[:500]})


def restart_router_clash() -> dict:
    """只执行重启命令，不动配置——给「重启服务」按钮用。"""
    steps: list[dict] = []
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    try:
        client.connect(
            config.ROUTER_HOST, port=config.ROUTER_PORT, username=config.ROUTER_USER,
            password=config.ROUTER_PASSWORD, timeout=8,
            look_for_keys=False, allow_agent=False,
        )
        _step(steps, "连接路由器", True, f"{config.ROUTER_USER}@{config.ROUTER_HOST}")
    except Exception as e:
        _step(steps, "连接路由器", False, str(e))
        return {"ok": False, "steps": steps}
    try:
        stdin, stdout, stderr = client.exec_command(config.ROUTER_RESTART_CMD, timeout=60)
        rc = stdout.channel.recv_exit_status()
        out = stdout.read().decode("utf-8", "replace")
        err = stderr.read().decode("utf-8", "replace")
        ok = rc == 0
        _step(steps, "重启 clash 服务", ok, (err or out) if not ok else out)
        return {"ok": ok, "steps": steps, "time": time.time()}
    finally:
        client.close()


def deploy_to_router(content: str) -> dict:
    steps: list[dict] = []
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    try:
        client.connect(
            config.ROUTER_HOST,
            port=config.ROUTER_PORT,
            username=config.ROUTER_USER,
            password=config.ROUTER_PASSWORD,
            timeout=8,
            look_for_keys=False,
            allow_agent=False,
        )
        _step(steps, "连接路由器", True, f"{config.ROUTER_USER}@{config.ROUTER_HOST}")
    except Exception as e:
        _step(steps, "连接路由器", False, str(e))
        return {"ok": False, "steps": steps}

    try:
        # 先备份路由器上当前的配置到本地（只保留最近一份）
        try:
            _, stdout, _ = client.exec_command(f"cat {shlex.quote(config.ROUTER_CONFIG_PATH)}")
            remote_old = stdout.read().decode("utf-8", "replace")
            if remote_old.strip():
                (config.DATA_DIR / "router-remote-last.yaml").write_text(remote_old, encoding="utf-8")
        except Exception:
            pass

        # 经 stdin 写入，避免依赖路由器上的 sftp 子系统
        cmd = f"cat > {shlex.quote(config.ROUTER_CONFIG_PATH)}"
        stdin, stdout, stderr = client.exec_command(cmd)
        stdin.write(content)
        stdin.channel.shutdown_write()
        rc = stdout.channel.recv_exit_status()
        err = stderr.read().decode("utf-8", "replace")
        if rc != 0:
            _step(steps, "写入配置", False, err or f"exit {rc}")
            return {"ok": False, "steps": steps}
        _step(steps, "写入配置", True, config.ROUTER_CONFIG_PATH)

        stdin, stdout, stderr = client.exec_command(config.ROUTER_RESTART_CMD, timeout=60)
        rc = stdout.channel.recv_exit_status()
        out = stdout.read().decode("utf-8", "replace")
        err = stderr.read().decode("utf-8", "replace")
        if rc != 0:
            _step(steps, "重启 clash 服务", False, (err or out) or f"exit {rc}")
            return {"ok": False, "steps": steps}
        _step(steps, "重启 clash 服务", True, out)
        return {"ok": True, "steps": steps, "time": time.time()}
    finally:
        client.close()
