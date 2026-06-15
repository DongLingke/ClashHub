import os
from pathlib import Path

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

DATA_DIR = BASE_DIR / "data"
BACKUP_DIR = DATA_DIR / "backups"
STATIC_DIR = BASE_DIR / "static"
DB_PATH = DATA_DIR / "app.db"

# 两份 clash 配置放在项目根目录
CLASH_DIR = BASE_DIR
CLASH_FILES = {
    "router": "Router.yaml",
    "company": "Company.yaml",
}
MAX_BACKUPS = 10

ROUTER_HOST = os.getenv("ROUTER_HOST", "192.168.5.1")
ROUTER_PORT = int(os.getenv("ROUTER_PORT", "22"))
ROUTER_USER = os.getenv("ROUTER_USER", "root")
ROUTER_PASSWORD = os.getenv("ROUTER_PASSWORD", "")
ROUTER_CONFIG_PATH = os.getenv("ROUTER_CONFIG_PATH", "/tmp/ShellCrash/config.yaml")
# 非交互 SSH 里 `crash` alias 不展开，必须用 menu.sh 的绝对路径
ROUTER_RESTART_CMD = os.getenv(
    "ROUTER_RESTART_CMD",
    "/data/other_vol/ShellCrash/menu.sh -s restart",
)

DEFAULT_REFRESH_INTERVAL = 30
MIN_REFRESH_INTERVAL = 5
MAX_REFRESH_INTERVAL = 3600

DATA_DIR.mkdir(exist_ok=True)
BACKUP_DIR.mkdir(exist_ok=True)
