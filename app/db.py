import secrets
import sqlite3
import threading

from . import config

_lock = threading.Lock()
_conn: sqlite3.Connection | None = None


def conn() -> sqlite3.Connection:
    global _conn
    if _conn is None:
        _conn = sqlite3.connect(config.DB_PATH, check_same_thread=False)
        _conn.row_factory = sqlite3.Row
    return _conn


def init():
    with _lock:
        c = conn()
        c.executescript(
            """
            CREATE TABLE IF NOT EXISTS settings (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS services (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                host TEXT NOT NULL,
                port INTEGER NOT NULL,
                sort INTEGER NOT NULL DEFAULT 0
            );
            CREATE TABLE IF NOT EXISTS service_state (
                service_id INTEGER PRIMARY KEY,
                online INTEGER NOT NULL,
                since REAL NOT NULL,
                last_check REAL NOT NULL
            );
            """
        )
        c.commit()
    if get_setting("clash_token") is None:
        set_setting("clash_token", secrets.token_hex(8))
    if get_setting("refresh_interval") is None:
        set_setting("refresh_interval", str(config.DEFAULT_REFRESH_INTERVAL))


def get_setting(key: str, default: str | None = None) -> str | None:
    with _lock:
        row = conn().execute("SELECT value FROM settings WHERE key=?", (key,)).fetchone()
    return row["value"] if row else default


def set_setting(key: str, value: str):
    with _lock:
        conn().execute(
            "INSERT INTO settings(key,value) VALUES(?,?) "
            "ON CONFLICT(key) DO UPDATE SET value=excluded.value",
            (key, value),
        )
        conn().commit()


def refresh_interval() -> int:
    try:
        v = int(get_setting("refresh_interval", str(config.DEFAULT_REFRESH_INTERVAL)))
    except (TypeError, ValueError):
        v = config.DEFAULT_REFRESH_INTERVAL
    return max(config.MIN_REFRESH_INTERVAL, min(config.MAX_REFRESH_INTERVAL, v))


def list_services() -> list[dict]:
    with _lock:
        rows = conn().execute(
            """
            SELECT s.id, s.name, s.host, s.port,
                   st.online, st.since, st.last_check
            FROM services s LEFT JOIN service_state st ON st.service_id = s.id
            ORDER BY s.sort, s.id
            """
        ).fetchall()
    return [dict(r) for r in rows]


def add_service(name: str, host: str, port: int) -> int:
    with _lock:
        cur = conn().execute(
            "INSERT INTO services(name,host,port) VALUES(?,?,?)", (name, host, port)
        )
        conn().commit()
        return cur.lastrowid


def update_service(sid: int, name: str, host: str, port: int):
    with _lock:
        conn().execute(
            "UPDATE services SET name=?, host=?, port=? WHERE id=?", (name, host, port, sid)
        )
        # 主机或端口变了，旧的在线时长不再有意义，探测循环会重建状态
        conn().execute("DELETE FROM service_state WHERE service_id=?", (sid,))
        conn().commit()


def delete_service(sid: int):
    with _lock:
        conn().execute("DELETE FROM services WHERE id=?", (sid,))
        conn().execute("DELETE FROM service_state WHERE service_id=?", (sid,))
        conn().commit()


def set_service_state(sid: int, online: bool, now: float):
    with _lock:
        row = conn().execute(
            "SELECT online, since FROM service_state WHERE service_id=?", (sid,)
        ).fetchone()
        if row is None or bool(row["online"]) != online:
            since = now
        else:
            since = row["since"]
        conn().execute(
            "INSERT INTO service_state(service_id,online,since,last_check) VALUES(?,?,?,?) "
            "ON CONFLICT(service_id) DO UPDATE SET online=excluded.online, "
            "since=excluded.since, last_check=excluded.last_check",
            (sid, int(online), since, now),
        )
        conn().commit()
