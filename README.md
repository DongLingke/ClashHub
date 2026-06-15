# ClashHub

内网服务器状态面板 + Clash 配置编辑器。运行在 `192.168.5.55:5010`。

## 功能

- **网络状态**：公网 IP、国内 10 站连通率、国外 10 站连通率（服务器视角，后台按设置的间隔探测，默认 30s）
- **服务监控**：在设置里配置 主机/端口/服务名，TCP 探测在线状态与在线时长（状态历史存 SQLite，重启不丢）
- **Clash 编辑器**：
  - 远程订阅链接：`/clash/<token>/Router.yaml|Company.yaml`，内网 Clash 客户端直接导入
  - 手动更新密钥：拉订阅 → 只替换两份配置的 `proxies` 段 → 写入路由器 `192.168.5.1:/tmp/ShellCrash/config.yaml` → `crash -s restart`
  - 规则快捷编辑：只动 `rules` 段，按注释/空行分组，支持增删、排序、筛选；保存后可选下发路由器
  - 备份恢复：订阅更新 / 规则保存 / 恢复前自动备份，每份配置保留最近 10 份
- **三套 UI**（液态玻璃 / Notion / 莫兰迪）× 深浅色（可跟随系统），适配手机
- 外观存浏览器本地，刷新间隔等存服务端

## 本地开发

```bash
python3 -m venv venv
./venv/bin/pip install -r requirements.txt
./venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 5010 --reload
```

## 部署到 192.168.5.55

```bash
# 1. 同步代码（在开发机执行；venv/data 不要同步）
rsync -av --exclude venv --exclude data --exclude __pycache__ \
    ./ root@192.168.5.55:/opt/ClashHub/

# 2. 服务器上建环境
cd /opt/ClashHub
python3 -m venv venv
./venv/bin/pip install -r requirements.txt

# 3. 检查 .env（路由器地址、密码、重启命令）

# 4. systemd 托管
cp deploy/clashhub.service /etc/systemd/system/
systemctl daemon-reload
systemctl enable --now clashhub
```

访问 `http://192.168.5.55:5010`。

## 注意事项

- 路由器下发依赖 `.env` 中的 `ROUTER_*` 配置；`crash` 不在非交互 shell PATH 时会回退到
  `/tmp/ShellCrash/start.sh restart`，首次部署后先用 Clash 页右上角「下发」按钮验证一次。
- 订阅链接带随机 token（存 SQLite `settings` 表），重置删掉 `data/app.db` 里的 `clash_token` 即可。
- `Router.yaml` / `Company.yaml` 含节点密钥，已加入 `.gitignore`；备份在 `data/backups/`。
- 测试：`./venv/bin/python tests/e2e.py`（需先起服务；测试会改写 yaml，结束前自行恢复，
  且所有下发选项均不勾选，不会碰路由器）。
