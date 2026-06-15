#!/usr/bin/env bash
# ClashHub 启动 / 重启脚本
#
#   ./run.sh           # 启动；如果已在运行则先停掉再启动（=重启）
#   HOST=127.0.0.1 PORT=5010 ./run.sh   # 自定义监听
#
# 启动成功 退出码 0；失败 退出码 1，并打印最近的日志。

# 被 sh / dash / ash 调用时自动改用 bash 重新执行（pipefail 等是 bashism）
if [ -z "${BASH_VERSION:-}" ]; then
    if command -v bash >/dev/null 2>&1; then
        exec bash "$0" "$@"
    fi
    echo "需要 bash 才能运行 run.sh，请先安装 bash 或直接用 ./run.sh" >&2
    exit 1
fi

set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

HOST="${HOST:-0.0.0.0}"
PORT="${PORT:-5010}"
PID_FILE="data/run.pid"
LOG_FILE="data/run.log"
UVICORN="./venv/bin/uvicorn"
HEALTH_URL="http://127.0.0.1:${PORT}/api/settings"
WAIT_MAX_S=12          # 启动检测最长等待秒数
GRACE_STOP_S=5         # 旧进程优雅退出宽限秒数

C_RESET=$'\033[0m'
C_RED=$'\033[31m'
C_GRN=$'\033[32m'
C_YEL=$'\033[33m'
C_DIM=$'\033[2m'

log()  { printf '%s[ClashHub]%s %s\n'      "$C_DIM" "$C_RESET" "$*"; }
ok()   { printf '%s[ClashHub] ✓ %s%s\n'    "$C_GRN" "$*"  "$C_RESET"; }
warn() { printf '%s[ClashHub] ! %s%s\n'    "$C_YEL" "$*"  "$C_RESET" >&2; }
err()  { printf '%s[ClashHub] ✗ %s%s\n'    "$C_RED" "$*"  "$C_RESET" >&2; }

# ---------- 前置检查 / 自动安装 ----------

if [[ ! -f app/main.py ]]; then
    err "找不到 app/main.py — 请在项目根目录运行此脚本（当前 $SCRIPT_DIR）"
    exit 1
fi

# 1. venv：缺失就自动建并装依赖
ensure_venv() {
    if [[ -x "$UVICORN" ]]; then return 0; fi
    if ! command -v python3 >/dev/null 2>&1; then
        err "找不到 python3，请先安装：apt install python3 python3-venv  /  yum install python3"
        exit 1
    fi
    log "venv 不存在，自动创建..."
    if ! python3 -m venv venv 2>/tmp/clashhub-venv.err; then
        err "venv 创建失败："; cat /tmp/clashhub-venv.err >&2
        err "Debian/Ubuntu 上可能要先：apt install python3-venv"
        exit 1
    fi
    log "venv 已建好，安装依赖（首次会下载几十 MB，请耐心）..."
    ./venv/bin/pip install -q --disable-pip-version-check --upgrade pip
    if ! ./venv/bin/pip install -q --disable-pip-version-check -r requirements.txt; then
        err "依赖安装失败，请检查网络或代理设置"
        exit 1
    fi
    ok "依赖安装完成"
}

# 2. .env：缺失就从样例复制，提示编辑后再跑
ensure_env() {
    if [[ -f .env ]]; then return 0; fi
    if [[ ! -f .env.example ]]; then
        err "找不到 .env 也找不到 .env.example，请补齐配置文件"
        exit 1
    fi
    cp .env.example .env
    warn ".env 已从 .env.example 创建，但还未填路由器密码等"
    warn "请先编辑：  vi .env       然后再运行：  ./run.sh"
    exit 1
}

# 3. Clash 配置文件：缺失只警告，不阻拦启动
check_clash_files() {
    local missing=()
    [[ -f Router.yaml ]]  || missing+=("Router.yaml")
    [[ -f Company.yaml ]] || missing+=("Company.yaml")
    if (( ${#missing[@]} > 0 )); then
        warn "缺少 Clash 配置文件：${missing[*]}"
        warn "服务仍会启动，但订阅链接和规则编辑会报错"
        warn "请从开发机拷过来，例如：  scp dev:/path/to/Router.yaml ./"
    fi
}

ensure_venv
ensure_env
check_clash_files

mkdir -p data

# ---------- 停止已运行的实例 ----------

is_alive() { kill -0 "$1" 2>/dev/null; }

stop_pid() {
    local pid="$1" name="${2:-}"
    is_alive "$pid" || return 0
    log "停止进程 $pid${name:+ ($name)}"
    kill "$pid" 2>/dev/null || true
    local i=0 stop_max=$((GRACE_STOP_S * 4))
    while is_alive "$pid" && (( i < stop_max )); do
        sleep 0.25; ((i++))
    done
    if is_alive "$pid"; then
        warn "${GRACE_STOP_S}s 内未退出，发送 SIGKILL"
        kill -9 "$pid" 2>/dev/null || true
        sleep 0.3
    fi
}

# 1) 从 PID 文件停
if [[ -f "$PID_FILE" ]]; then
    OLD_PID="$(cat "$PID_FILE" 2>/dev/null || true)"
    [[ -n "$OLD_PID" ]] && stop_pid "$OLD_PID" "run.pid"
    rm -f "$PID_FILE"
fi

# 2) 端口兜底：如果还有别的进程占着 PORT，强制释放
PORT_HOLDERS="$(lsof -ti :"$PORT" -sTCP:LISTEN 2>/dev/null || true)"
if [[ -n "${PORT_HOLDERS:-}" ]]; then
    warn "端口 $PORT 仍被占用：${PORT_HOLDERS//$'\n'/, } — 强制释放"
    # shellcheck disable=SC2086
    kill -9 $PORT_HOLDERS 2>/dev/null || true
    sleep 0.5
fi

# ---------- 启动新进程 ----------

log "启动 uvicorn  host=${HOST}  port=${PORT}"
: > "$LOG_FILE"   # 截断旧日志
nohup "$UVICORN" app.main:app --host "$HOST" --port "$PORT" \
    >> "$LOG_FILE" 2>&1 &
NEW_PID=$!
disown "$NEW_PID" 2>/dev/null || true
echo "$NEW_PID" > "$PID_FILE"

# ---------- 健康检查 ----------

start_ts=$(date +%s)
ready=0
while :; do
    if ! is_alive "$NEW_PID"; then break; fi          # 进程死了
    if curl -sf -m 1 -o /dev/null "$HEALTH_URL"; then
        ready=1; break
    fi
    if (( $(date +%s) - start_ts >= WAIT_MAX_S )); then break; fi
    sleep 0.3
done

if (( ready == 1 )); then
    DISPLAY_HOST="$HOST"
    [[ "$HOST" == "0.0.0.0" ]] && DISPLAY_HOST="$(hostname -I 2>/dev/null | awk '{print $1}')"
    [[ -z "${DISPLAY_HOST:-}" ]] && DISPLAY_HOST="127.0.0.1"
    ok "启动成功 (PID $NEW_PID)"
    log "    日志   $LOG_FILE"
    log "    访问   http://${DISPLAY_HOST}:${PORT}/"
    log "    停止   kill $NEW_PID    或    kill \$(cat $PID_FILE)"
    exit 0
fi

# ---------- 启动失败：报错并打印日志 ----------

if ! is_alive "$NEW_PID"; then
    err "进程已退出（PID $NEW_PID）"
    rm -f "$PID_FILE"
else
    err "${WAIT_MAX_S}s 内未通过健康检查（$HEALTH_URL）"
    err "进程仍在运行，PID $NEW_PID — 请检查日志后手动 kill"
fi
printf '%s---- 最近日志 (%s) ----%s\n' "$C_DIM" "$LOG_FILE" "$C_RESET" >&2
tail -n 40 "$LOG_FILE" >&2 || true
printf '%s-------------------------%s\n' "$C_DIM" "$C_RESET" >&2
exit 1
