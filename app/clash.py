"""Clash 配置文件的读写：只对 proxies / rules 段做行级替换，其余内容保持原样。"""

import re
import shutil
import time
from pathlib import Path

import yaml

from . import config

INDENT = "    "

BACKUP_REASONS = {
    "sub_update": "订阅更新",
    "rules_edit": "规则修改",
    "raw_edit": "原文修改",
    "restore_auto": "恢复前自动备份",
    "manual": "手动备份",
}


def file_path(key: str) -> Path:
    if key not in config.CLASH_FILES:
        raise KeyError(f"未知配置文件: {key}")
    return config.CLASH_DIR / config.CLASH_FILES[key]


def read_text(key: str) -> str:
    return file_path(key).read_text(encoding="utf-8")


def _section_range(lines: list[str], section: str) -> tuple[int, int]:
    """返回 [start, end) 行号区间，包含 'section:' 这一行本身。"""
    start = None
    for i, line in enumerate(lines):
        if re.match(rf"^{re.escape(section)}\s*:", line):
            start = i
            break
    if start is None:
        raise ValueError(f"配置中找不到顶层 {section} 段")
    end = len(lines)
    for j in range(start + 1, len(lines)):
        if re.match(r"^[A-Za-z0-9_-]+\s*:", lines[j]):
            end = j
            break
    return start, end


def get_section(key: str, section: str) -> str:
    lines = read_text(key).splitlines()
    s, e = _section_range(lines, section)
    return "\n".join(lines[s:e])


def replace_section(key: str, section: str, new_block: str) -> str:
    """替换段落并返回完整新文本（不落盘，由调用方校验后写入）。"""
    text = read_text(key)
    lines = text.splitlines()
    s, e = _section_range(lines, section)
    new_lines = lines[:s] + new_block.splitlines() + lines[e:]
    out = "\n".join(new_lines)
    if text.endswith("\n"):
        out += "\n"
    return out


def validate_and_write(key: str, new_text: str):
    data = yaml.safe_load(new_text)
    if not isinstance(data, dict) or "proxies" not in data or "rules" not in data:
        raise ValueError("生成的配置不是合法的 clash YAML")
    file_path(key).write_text(new_text, encoding="utf-8")


# ---------- proxies ----------

def serialize_proxies(proxies: list[dict]) -> str:
    lines = ["proxies:"]
    for p in proxies:
        one = yaml.dump(
            p, default_flow_style=True, allow_unicode=True, sort_keys=False, width=10**9
        ).strip()
        lines.append(f"{INDENT}- {one}")
    return "\n".join(lines)


def extract_proxies_from_subscription(text: str) -> list[dict]:
    data = yaml.safe_load(text)
    if not isinstance(data, dict) or not isinstance(data.get("proxies"), list):
        raise ValueError("订阅内容不是 clash 配置格式（找不到 proxies）")
    proxies = data["proxies"]
    if not proxies:
        raise ValueError("订阅中的 proxies 为空")
    return proxies


# ---------- rules ----------

def parse_rules(key: str) -> list[dict]:
    """把 rules 段解析成结构化条目：comment / rule / blank / raw。

    空行是分组边界（连续空行合并为一个），前端按 comment/blank 切分分组。
    """
    block = get_section(key, "rules").splitlines()[1:]
    entries: list[dict] = []
    for line in block:
        stripped = line.strip()
        if not stripped:
            if entries and entries[-1]["t"] not in ("blank", "comment"):
                entries.append({"t": "blank"})
            continue
        if stripped.startswith("#"):
            entries.append({"t": "comment", "text": stripped.lstrip("#").strip()})
            continue
        if stripped.startswith("- "):
            body = stripped[2:].strip()
            if (body.startswith("'") and body.endswith("'")) or (
                body.startswith('"') and body.endswith('"')
            ):
                body = body[1:-1]
            parts = [p.strip() for p in body.split(",")]
            if len(parts) == 2 and parts[0] == "MATCH":
                entries.append({"t": "rule", "type": "MATCH", "value": "", "policy": parts[1], "extra": ""})
            elif len(parts) >= 3:
                entries.append({
                    "t": "rule",
                    "type": parts[0],
                    "value": parts[1],
                    "policy": parts[2],
                    "extra": ",".join(parts[3:]),
                })
            else:
                entries.append({"t": "raw", "text": stripped})
            continue
        entries.append({"t": "raw", "text": stripped})
    return entries


def serialize_rules(entries: list[dict]) -> str:
    lines = ["rules:"]
    for i, e in enumerate(entries):
        if e["t"] == "blank":
            if lines[-1] != "":
                lines.append("")
        elif e["t"] == "comment":
            if i > 0 and lines[-1] != "":
                lines.append("")
            lines.append(f"{INDENT}# {e['text'].strip()}")
        elif e["t"] == "rule":
            if e["type"] == "MATCH":
                body = f"MATCH,{e['policy']}"
            else:
                body = f"{e['type']},{e['value']},{e['policy']}"
                if e.get("extra"):
                    body += f",{e['extra']}"
            lines.append(f"{INDENT}- '{body}'")
        else:
            lines.append(f"{INDENT}{e['text']}")
    return "\n".join(lines)


def get_policies(key: str) -> list[str]:
    data = yaml.safe_load(read_text(key))
    groups = [g["name"] for g in data.get("proxy-groups", []) if isinstance(g, dict) and "name" in g]
    return groups + ["DIRECT", "REJECT"]


# ---------- 备份 ----------

def _backup_dir(key: str) -> Path:
    d = config.BACKUP_DIR / key
    d.mkdir(parents=True, exist_ok=True)
    return d


def create_backup(key: str, reason: str) -> str:
    ts = time.strftime("%Y%m%d-%H%M%S")
    name = f"{ts}_{reason}.yaml"
    shutil.copy2(file_path(key), _backup_dir(key) / name)
    prune_backups(key)
    return name


def prune_backups(key: str):
    files = sorted(_backup_dir(key).glob("*.yaml"), key=lambda p: p.name, reverse=True)
    for old in files[config.MAX_BACKUPS:]:
        old.unlink()


def list_backups(key: str) -> list[dict]:
    out = []
    for p in sorted(_backup_dir(key).glob("*.yaml"), key=lambda p: p.name, reverse=True):
        m = re.match(r"^(\d{8}-\d{6})_(.+)\.yaml$", p.name)
        if not m:
            continue
        ts = time.mktime(time.strptime(m.group(1), "%Y%m%d-%H%M%S"))
        out.append({
            "id": p.name,
            "time": ts,
            "reason": BACKUP_REASONS.get(m.group(2), m.group(2)),
            "size": p.stat().st_size,
        })
    return out


def restore_backup(key: str, backup_id: str) -> None:
    src = _backup_dir(key) / backup_id
    if not src.is_file() or src.parent != _backup_dir(key) or "/" in backup_id:
        raise FileNotFoundError("备份不存在")
    content = src.read_text(encoding="utf-8")
    yaml.safe_load(content)
    create_backup(key, "restore_auto")
    file_path(key).write_text(content, encoding="utf-8")
