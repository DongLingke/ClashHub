"""端到端验证：无头 Chromium 走一遍主要 UI 流程。

不触发路由器下发（所有确认弹窗里的下发选项都取消勾选）。
运行前后由外层脚本负责 yaml 快照与恢复。
"""

import json
import threading
import urllib.request
from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path

from playwright.sync_api import sync_playwright

BASE = "http://127.0.0.1:5010"
SHOTS = "/tmp/msi_shots"
PROJ = Path(__file__).resolve().parent.parent

MOCK_SUB = """proxies:
    - { name: 'TEST 节点A', type: ss, server: 1.2.3.4, port: 443, cipher: aes-128-gcm, password: testpass }
    - { name: 'TEST 节点B', type: ss, server: 5.6.7.8, port: 443, cipher: aes-128-gcm, password: testpass }
"""


class MockSub(BaseHTTPRequestHandler):
    def do_GET(self):
        body = MOCK_SUB.encode()
        self.send_response(200)
        self.send_header("Content-Type", "text/yaml")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, *a):
        pass


def api(path):
    with urllib.request.urlopen(BASE + path) as r:
        return json.loads(r.read())


def rules_count():
    d = api("/api/clash/router/rules")
    return sum(1 for e in d["entries"] if e["t"] in ("rule", "raw"))


def put_settings(interval):
    req = urllib.request.Request(
        BASE + "/api/settings",
        data=json.dumps({"refresh_interval": interval}).encode(),
        method="PUT", headers={"Content-Type": "application/json"},
    )
    urllib.request.urlopen(req).read()


def main():
    # 快照：测试会改写 yaml 与设置，结束时恢复
    yaml_before = {n: (PROJ / n).read_text(encoding="utf-8") for n in ("Router.yaml", "Company.yaml")}
    interval_before = api("/api/settings")["refresh_interval"]
    backups_before = {k: {p.name for p in (PROJ / "data" / "backups" / k).glob("*.yaml")}
                      for k in ("router", "company")
                      if (PROJ / "data" / "backups" / k).is_dir()} or {"router": set(), "company": set()}
    try:
        return run()
    finally:
        for n, text in yaml_before.items():
            (PROJ / n).write_text(text, encoding="utf-8")
        put_settings(interval_before)
        for k in ("router", "company"):
            d = PROJ / "data" / "backups" / k
            if d.is_dir():
                for p in d.glob("*.yaml"):
                    if p.name not in backups_before.get(k, set()):
                        p.unlink()
        print("已恢复 yaml / 设置，清理测试备份")


def run():
    srv = HTTPServer(("127.0.0.1", 5099), MockSub)
    threading.Thread(target=srv.serve_forever, daemon=True).start()

    failures = []
    js_errors = []

    def check(name, cond):
        print(("PASS " if cond else "FAIL ") + name)
        if not cond:
            failures.append(name)

    base_rules = rules_count()

    with sync_playwright() as p:
        browser = p.chromium.launch()
        ctx = browser.new_context(viewport={"width": 1280, "height": 920})
        pg = ctx.new_page()
        pg.on("pageerror", lambda e: js_errors.append(f"pageerror: {e}"))
        pg.on("console", lambda m: js_errors.append(f"console: {m.text}")
              if m.type == "error" and "favicon" not in m.text else None)

        # ---- 首页（单页：状态 + 规则编辑 + 订阅 + 备份）----
        pg.goto(BASE)
        pg.wait_for_selector("#net-card", timeout=8000)
        pg.wait_for_timeout(2500)
        check("首页:设置图标", pg.locator("#open-settings").count() == 1)
        check("首页:网络状态卡", pg.locator("#net-card").count() == 1)
        check("首页:服务状态卡", "服务状态" in pg.content())
        check("首页:文件切换按钮", pg.locator("button[data-seg='1']").count() == 2)
        check("首页:三个工具入口", pg.locator("#open-proxies").count() == 1 and pg.locator("#open-logs").count() == 1 and pg.locator("#open-conns").count() == 1)
        check("首页:重启按钮", pg.locator("#restart-now").count() == 1)
        check("首页:备份滚动", pg.locator(".backup-scroll").count() == 1)
        check("首页:订阅链接", "/clash/" in api("/api/clash/meta")["files"][0]["sub_url"])
        check("首页:分组渲染", pg.locator(".rgroup").count() >= 3)
        check("首页:备份区域", pg.locator("#backup-list").count() == 1)
        pg.screenshot(path=f"{SHOTS}/01_home_glass_light.png", full_page=True)

        # 卡片顺序：状态 grid → 规则编辑 → 订阅密钥+备份 grid
        order = pg.evaluate("""() => {
          const cards = [...document.querySelectorAll('.stack > .card, .stack > .grid')];
          return cards.map(c => c.classList.contains('grid') ? 'grid'
            : (c.querySelector('h2')?.textContent || '').trim().slice(0, 4));
        }""")
        check("首页:卡片顺序hero→规则→订阅备份grid",
              order == ["grid", "规则编辑", "grid"])
        check("首页:overview卡片", pg.locator("#overview-card").count() == 1)
        check("首页:三个sparkline", pg.locator("#overview-card .spark").count() == 3)
        check("首页:五个统计数字", pg.locator("#overview-card .ov-stat").count() == 5)

        # 复制订阅链接
        pg.click("#copy-url")
        pg.wait_for_timeout(300)
        check("首页:复制提示", "已复制" in pg.locator("#toast").inner_text())

        # ---- 设置弹窗:外观/间隔/服务 ----
        pg.click("#open-settings")
        pg.wait_for_selector(".modal")
        pg.screenshot(path=f"{SHOTS}/02_settings.png")

        pg.click('#seg-mode button[data-v="dark"]')
        check("设置:切深色", pg.evaluate("document.documentElement.dataset.mode") == "dark")
        pg.fill("#st-interval", "15")
        pg.click("#st-interval-save")
        pg.wait_for_timeout(400)
        check("设置:保存间隔", api("/api/settings")["refresh_interval"] == 15)

        pg.fill("#sa-name", "本服务")
        pg.fill("#sa-host", "127.0.0.1")
        pg.fill("#sa-port", "5010")
        pg.click("#sa-add")
        pg.wait_for_timeout(800)
        check("设置:添加服务", any(s["name"] == "本服务" for s in api("/api/services")))
        pg.click(".st-close")
        pg.wait_for_timeout(600)
        check("首页:服务在线", pg.locator("#svc-list .dot.ok").count() >= 1)
        pg.screenshot(path=f"{SHOTS}/03_home_glass_dark.png", full_page=True)

        # 其他主题截图
        for theme, shot in [("notion", "04_home_notion_dark.png"), ("morandi", "05_home_morandi_dark.png")]:
            pg.click("#open-settings")
            pg.wait_for_selector(".modal")
            pg.click(f'#seg-theme button[data-v="{theme}"]')
            pg.click(".st-close")
            pg.screenshot(path=f"{SHOTS}/{shot}", full_page=True)
        pg.click("#open-settings")
        pg.wait_for_selector(".modal")
        pg.click('#seg-theme button[data-v="glass"]')
        pg.click('#seg-mode button[data-v="light"]')
        pg.click(".st-close")
        pg.screenshot(path=f"{SHOTS}/06_home_top.png")

        # 文件切换
        pg.click('button[data-seg="1"][data-v="company"]')
        pg.wait_for_timeout(800)
        check("clash:切换文件", pg.locator('button[data-seg="1"][data-v="company"].on').count() == 1)
        pg.click('button[data-seg="1"][data-v="router"]')
        pg.wait_for_timeout(800)

        # ---- 规则编辑:展开/筛选/增删/保存(不下发) ----
        first = pg.locator(".rgroup").first
        first.locator(".rg-head button").nth(0).click()  # 展开
        pg.wait_for_timeout(200)
        check("规则:展开分组", first.locator(".rrow").count() > 0)
        pg.screenshot(path=f"{SHOTS}/07_rules_open.png")

        pg.click("#rule-search-btn")
        pg.wait_for_timeout(350)
        pg.fill("#rule-filter", "claude.ai")
        pg.wait_for_timeout(500)
        check("规则:筛选", pg.locator(".rrow").count() <= 5 and pg.locator(".rrow").count() >= 1)
        pg.press("#rule-filter", "Escape")
        pg.wait_for_timeout(400)

        first = pg.locator(".rgroup").first
        first.locator(".rg-head button").nth(1).click()  # 添加规则
        pg.wait_for_timeout(200)
        newrow = first.locator(".rrow").last
        newrow.locator(".r-val").fill("test.example.com")
        pg.keyboard.press("Tab")
        pg.click("#rules-save")
        pg.wait_for_selector(".cd-ok")
        cb = pg.locator(".cd-check")
        if cb.count():
            cb.uncheck()  # 不下发路由器
        pg.click(".cd-ok")
        pg.wait_for_timeout(1500)
        check("规则:保存后+1", rules_count() == base_rules + 1)
        backups = api("/api/clash/router/backups")
        check("备份:规则修改已备份", len(backups) >= 1 and backups[0]["reason"] == "规则修改")

        # ---- 备份恢复(不下发) ----
        pg.wait_for_timeout(500)
        check("备份:列表渲染", pg.locator(".bk-row").count() >= 1)
        pg.screenshot(path=f"{SHOTS}/08_backups.png")
        pg.locator(".bk-row").first.locator("button").click()
        pg.wait_for_selector(".cd-ok")
        cb = pg.locator(".cd-check")
        if cb.count():
            cb.uncheck()
        pg.click(".cd-ok")
        pg.wait_for_timeout(1500)
        check("备份:恢复后规则还原", rules_count() == base_rules)

        # ---- 订阅更新(不下发) ----
        pg.evaluate("""() => {
          document.querySelector('#sub-expand').classList.add('open');
          const i = document.querySelector('#sub-input');
          i.value = 'http://127.0.0.1:5099/sub.yaml';
          i.dispatchEvent(new Event('input'));
        }""")
        pg.wait_for_timeout(150)
        pg.locator("#sub-update").click(force=True)
        pg.wait_for_selector(".cd-ok")
        cb = pg.locator(".cd-check")
        if cb.count():
            cb.uncheck()
        pg.click(".cd-ok")
        pg.wait_for_timeout(2500)
        steps_text = pg.locator("#sub-steps").inner_text()
        check("订阅:步骤显示", "拉取订阅" in steps_text and "Router.yaml" in steps_text and "Company.yaml" in steps_text)
        router_text = (PROJ / "Router.yaml").read_text(encoding="utf-8")
        company_text = (PROJ / "Company.yaml").read_text(encoding="utf-8")
        check("订阅:Router替换", "TEST 节点A" in router_text)
        check("订阅:Company替换", "TEST 节点A" in company_text)
        check("订阅:rules未动", "DOMAIN-SUFFIX,claude.ai" in router_text)
        check("订阅:dns未动", "fake-ip" in router_text)
        pg.screenshot(path=f"{SHOTS}/09_sub_steps.png")

        # ---- 手机端 ----
        mp = ctx.new_page()
        mp.set_viewport_size({"width": 375, "height": 812})
        mp.goto(BASE)
        mp.wait_for_selector("#net-card")
        mp.wait_for_timeout(1500)
        mp.screenshot(path=f"{SHOTS}/10_mobile_home.png", full_page=True)
        mp.close()

        # ---- 清理:通过 API 删服务 ----
        for s in api("/api/services"):
            if s["name"] == "本服务":
                req = urllib.request.Request(BASE + f"/api/services/{s['id']}", method="DELETE")
                urllib.request.urlopen(req).read()
        check("清理:删服务", not any(s["name"] == "本服务" for s in api("/api/services")))

        browser.close()

    srv.shutdown()
    print()
    if js_errors:
        print("JS ERRORS:")
        for e in js_errors[:20]:
            print(" ", e)
    print(f"\n{'=' * 40}\n{len(failures)} failures" + (f": {failures}" if failures else " — ALL PASS"))
    return 1 if (failures or js_errors) else 0


if __name__ == "__main__":
    raise SystemExit(main())
