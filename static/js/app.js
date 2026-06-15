"use strict";

/* ===== 工具 ===== */

const $ = (s, el = document) => el.querySelector(s);
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const SVG = (paths, vb = "0 0 24 24") =>
  `<svg class="ic" viewBox="${vb}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;
const I = {
  gear: SVG('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.08a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h.08a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.08a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>'),
  back: SVG('<path d="M19 12H5M12 19l-7-7 7-7"/>'),
  right: SVG('<path d="M5 12h14M12 5l7 7-7 7"/>'),
  bolt: SVG('<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>'),
  copy: SVG('<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>'),
  trash: SVG('<polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>'),
  plus: SVG('<path d="M12 5v14M5 12h14"/>'),
  chev: SVG('<polyline points="6 9 12 15 18 9"/>'),
  up: SVG('<polyline points="18 15 12 9 6 15"/>'),
  pencil: SVG('<path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>'),
  refresh: SVG('<polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>'),
  check: SVG('<polyline points="20 6 9 17 4 12"/>'),
  x: SVG('<path d="M18 6L6 18M6 6l12 12"/>'),
  archive: SVG('<polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/>'),
  router: SVG('<rect x="2" y="14" width="20" height="6" rx="2"/><line x1="6" y1="18" x2="6.01" y2="18"/><line x1="10" y1="18" x2="10.01" y2="18"/><line x1="15" y1="10" x2="15" y2="14"/><path d="M17.84 7.17a4 4 0 0 0-5.66 0"/><path d="M20.66 4.34a8 8 0 0 0-11.31 0"/>'),
  coffee: SVG('<path d="M17 8h1a4 4 0 0 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8z"/><line x1="6" y1="2" x2="6" y2="4"/><line x1="10" y1="2" x2="10" y2="4"/><line x1="14" y1="2" x2="14" y2="4"/>'),
  branch: SVG('<circle cx="6" cy="6" r="2.5"/><circle cx="6" cy="18" r="2.5"/><circle cx="18" cy="12" r="2.5"/><path d="M6 8.5v7"/><path d="M6 12h6.5a3 3 0 0 0 3-3"/>'),
  terminal: SVG('<polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/>'),
  activity: SVG('<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>'),
  power: SVG('<path d="M18.36 6.64a9 9 0 1 1-12.73 0"/><line x1="12" y1="2" x2="12" y2="12"/>'),
  up: SVG('<polyline points="18 15 12 9 6 15"/>'),
  down: SVG('<polyline points="6 9 12 15 18 9"/>'),
  arrowUp: SVG('<line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/>'),
  arrowDown: SVG('<line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/>'),
  search: SVG('<circle cx="11" cy="11" r="7"/><line x1="20" y1="20" x2="16.65" y2="16.65"/>'),
  save: SVG('<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>'),
  code: SVG('<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>'),
  send: SVG('<path d="M22 2L11 13M22 2l-7 20-4-9-9-4 22-7z"/>'),
  link: SVG('<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>'),
  key: SVG('<path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>'),
  globe: SVG('<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>'),
  server: SVG('<rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/>'),
};
const icon = (name, cls) => cls ? I[name].replace('class="ic"', `class="${cls}"`) : I[name];

async function apiGet(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error((await r.json().catch(() => ({}))).detail || `HTTP ${r.status}`);
  return r.json();
}
async function apiSend(url, method, body) {
  const r = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body != null ? JSON.stringify(body) : undefined,
  });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d.detail || `HTTP ${r.status}`);
  return d;
}

let toastTimer;
function toast(msg, type = "ok") {
  const t = $("#toast");
  t.textContent = msg;
  t.className = `toast show ${type}`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 2800);
}

function confirmDialog({ title, msg = "", check = null, checked = true, danger = false, okText = "确认" }) {
  return new Promise(resolve => {
    const ov = document.createElement("div");
    ov.className = "overlay";
    ov.innerHTML = `<div class="modal small">
      <h3>${esc(title)}</h3>
      ${msg ? `<p class="dim">${esc(msg)}</p>` : ""}
      ${check ? `<label class="checkrow"><input type="checkbox" class="cd-check" ${checked ? "checked" : ""}> ${esc(check)}</label>` : ""}
      <div class="modal-actions"><button class="btn cd-cancel">取消</button><button class="btn primary ${danger ? "danger" : ""} cd-ok">${esc(okText)}</button></div>
    </div>`;
    document.body.appendChild(ov);
    const done = ok => {
      const cb = $(".cd-check", ov);
      ov.remove();
      resolve({ ok, checked: cb ? cb.checked : false });
    };
    $(".cd-cancel", ov).onclick = () => done(false);
    $(".cd-ok", ov).onclick = () => done(true);
    ov.addEventListener("click", e => { if (e.target === ov) done(false); });
  });
}

async function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    try { await navigator.clipboard.writeText(text); return; } catch (e) { /* 降级到 execCommand */ }
  }
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.style.cssText = "position:absolute;left:-9999px";
  document.body.appendChild(ta);
  ta.select();
  try { document.execCommand("copy"); } finally { ta.remove(); }
  return Promise.resolve();
}

function fmtDuration(sec) {
  if (sec == null) return "";
  const m = Math.floor(sec / 60), h = Math.floor(m / 60), d = Math.floor(h / 24);
  if (d > 0) return `${d}d ${h % 24}h`;
  if (h > 0) return `${h}h ${m % 60}m`;
  if (m > 0) return `${m}m`;
  return "<1m";
}
const pad = n => String(n).padStart(2, "0");
function fmtTime(ts) {
  const d = new Date(ts * 1000);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function debounce(fn, ms) {
  let t;
  return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
}

/* ===== 外观 ===== */

// 每个主题带一个迷你预览：bg 背景 · fg 文字色 · ac 强调色，仅用于设置里的选择卡
const THEMES = [
  { k: "glass", label: "液态玻璃", bg: "linear-gradient(135deg,#cfe0ff,#ffd6ec 55%,#c7f0e6)", fg: "#161a26", ac: "#0a7cff" },
  { k: "notion", label: "Notion", bg: "#ffffff", fg: "#37352f", ac: "#2383e2" },
  { k: "morandi", label: "莫兰迪", bg: "#ece8e1", fg: "#4a463f", ac: "#7e9183" },
  { k: "terminal", label: "终端", bg: "#070d07", fg: "#33ff66", ac: "#33ff66" },
  { k: "ink", label: "水墨", bg: "#efe9db", fg: "#211d16", ac: "#b23b2e" },
  { k: "ocean", label: "海浪", bg: "linear-gradient(180deg,#c7ecef,#ecead4 70%,#f1e3c2)", fg: "#103a42", ac: "#0e9aa0" },
  { k: "sunset", label: "黄昏", bg: "linear-gradient(180deg,#3a1a5e,#7a2a6a 55%,#e87b54)", fg: "#fdeaf6", ac: "#ff5db4" },
];
const MODES = [["light", "浅色"], ["dark", "深色"], ["auto", "跟随系统"]];

function applyAppearance() {
  const t = localStorage.msi_theme || "glass";
  const m = localStorage.msi_mode || "auto";
  const dark = m === "dark" || (m === "auto" && matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.dataset.theme = t;
  document.documentElement.dataset.mode = dark ? "dark" : "light";
}
matchMedia("(prefers-color-scheme: dark)").addEventListener("change", applyAppearance);

/* ===== 全局状态 ===== */

const S = {
  settings: { refresh_interval: 30, sub_url: "" },
  network: null,
  netHist: { cn: [], intl: [] },
  services: [],
  traffic: null,
  meta: null,
  fileKey: "router",
  rg: null,
  backups: [],
  timer: null,
};

/* ===== 路由器实时流（Clash Overview） ===== */

const HIST = 60;
const OV = {
  traffic: Array.from({ length: HIST }, () => ({ up: 0, down: 0 })),
  memory: new Array(HIST).fill(0),
  conn: new Array(HIST).fill(0),
  cur: { up: 0, down: 0, mem: 0, oslimit: 0, conn: 0, ulTotal: 0, dlTotal: 0 },
  es_traffic: null, es_memory: null, conn_timer: null,
};

function pushHist(arr, v) {
  arr.push(v);
  if (arr.length > HIST) arr.shift();
}

/* ===== 仪表盘 ===== */

function fmtBytes(n) {
  if (!n) return "0 B";
  const u = ["B", "K", "M", "G", "T"];
  let i = 0;
  while (n >= 1024 && i < u.length - 1) { n /= 1024; i++; }
  return `${n.toFixed(n >= 100 || i === 0 ? 0 : n >= 10 ? 1 : 2)} ${u[i]}`;
}

function pushPctHist(key, val) {
  if (val == null) return;
  const arr = S.netHist[key];
  if (!arr.length) S.netHist[key] = new Array(HIST).fill(val);
  else { arr.push(val); if (arr.length > HIST) arr.shift(); }
}

function miniSpark(buf, kind) {
  if (!buf || !buf.length) return `<span class="mini-spark"></span>`;
  const W = 100, H = 22;
  const pts = _polyPoints(buf, 100, W, H, 1);
  return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" class="mini-spark">
    <polygon points="0,${H} ${pts} ${W},${H}" class="sp-fill ${kind}"/>
    <polyline points="${pts}" class="sp-line ${kind}"/>
  </svg>`;
}

function updateNetworkCard() {
  const el = $("#net-card");
  if (!el) return;
  const n = S.network;
  pushPctHist("cn", n ? n.cn_percent : null);
  pushPctHist("intl", n ? n.intl_percent : null);
  const pctRow = (label, p, hist) => {
    if (p == null) {
      return `<div class="netstat"><span class="lab">${label}</span><span class="val mono pct pending">—</span></div>`;
    }
    const cls = p >= 80 ? "ok" : p >= 40 ? "warn" : "bad";
    return `<div class="netstat with-spark"><span class="lab">${label}</span>${miniSpark(hist, cls)}<span class="val mono pct ${cls}">${p}%</span></div>`;
  };
  el.innerHTML = `<div class="netstat-list">
      <div class="netstat"><span class="lab">公网 IP</span><span class="val mono${n && n.ip ? "" : " pending"}">${n && n.ip ? esc(n.ip) : "检测中…"}</span></div>
      ${pctRow("公网连通性", n ? n.cn_percent : null, S.netHist.cn)}
      ${pctRow("外网连通性", n ? n.intl_percent : null, S.netHist.intl)}
    </div>`;
}

/* ===== Clash 实时流（traffic / memory / connections） ===== */

function startStreams() {
  stopStreams();
  // 流量 SSE
  try {
    const es = new EventSource("/api/clash/api/traffic");
    es.onmessage = e => {
      try {
        const d = JSON.parse(e.data);
        const v = { up: d.up || 0, down: d.down || 0 };
        OV.cur.up = v.up; OV.cur.down = v.down;
        pushHist(OV.traffic, v);
        S.traffic = { ...v, at: Date.now() };
        updateNetworkCard();
        renderOverview();
      } catch {}
    };
    es.onerror = () => { try { es.close(); } catch {} OV.es_traffic = null; };
    OV.es_traffic = es;
  } catch {}
  // 内存 SSE
  try {
    const es = new EventSource("/api/clash/api/memory");
    es.onmessage = e => {
      try {
        const d = JSON.parse(e.data);
        OV.cur.mem = d.inuse || 0;
        OV.cur.oslimit = d.oslimit || 0;
        pushHist(OV.memory, OV.cur.mem);
        renderOverview();
      } catch {}
    };
    es.onerror = () => { try { es.close(); } catch {} OV.es_memory = null; };
    OV.es_memory = es;
  } catch {}
  // 连接数轮询（顺手取累计上下行）
  const pollConn = async () => {
    try {
      const r = await fetch("/api/clash/api/connections");
      if (!r.ok) return;
      const d = await r.json();
      OV.cur.conn = (d.connections || []).length;
      OV.cur.ulTotal = d.uploadTotal || 0;
      OV.cur.dlTotal = d.downloadTotal || 0;
      pushHist(OV.conn, OV.cur.conn);
      renderOverview();
    } catch {}
  };
  pollConn();
  OV.conn_timer = setInterval(pollConn, 2000);
}

function stopStreams() {
  if (OV.es_traffic) { try { OV.es_traffic.close(); } catch {} OV.es_traffic = null; }
  if (OV.es_memory) { try { OV.es_memory.close(); } catch {} OV.es_memory = null; }
  if (OV.conn_timer) { clearInterval(OV.conn_timer); OV.conn_timer = null; }
}

/* ----- sparkline 渲染 ----- */

function _polyPoints(vals, max, w, h, pad = 1) {
  const n = vals.length;
  const innerH = h - pad * 2;
  return vals.map((v, i) => {
    const x = (i / (n - 1)) * w;
    const y = h - pad - (v / max) * innerH;
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  }).join(" ");
}

function sparkTraffic(buf) {
  const W = 100, H = 32;
  const ups = buf.map(p => p.up), dns = buf.map(p => p.down);
  const max = Math.max(...ups, ...dns, 1024);
  const upPts = _polyPoints(ups, max, W, H);
  const dnPts = _polyPoints(dns, max, W, H);
  return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" class="spark">
    <polygon points="0,${H} ${dnPts} ${W},${H}" class="sp-fill ok"/>
    <polygon points="0,${H} ${upPts} ${W},${H}" class="sp-fill bad"/>
    <polyline points="${dnPts}" class="sp-line ok"/>
    <polyline points="${upPts}" class="sp-line bad"/>
  </svg>`;
}

function sparkSingle(buf, kind) {
  const W = 100, H = 32;
  const max = Math.max(...buf, 1);
  const pts = _polyPoints(buf, max, W, H);
  return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" class="spark">
    <polygon points="0,${H} ${pts} ${W},${H}" class="sp-fill ${kind}"/>
    <polyline points="${pts}" class="sp-line ${kind}"/>
  </svg>`;
}

function renderOverview() {
  const el = $("#overview-card");
  if (!el) return;
  const c = OV.cur;
  el.innerHTML = `
    <div class="ov-grid">
      <div class="ov-block">
        <div class="ov-head">
          <span class="ov-lab">流量</span>
          <span class="ov-now mono">
            <span class="ok">↓ ${fmtBytes(c.down)}/s</span>
            <span class="bad">↑ ${fmtBytes(c.up)}/s</span>
          </span>
        </div>
        ${sparkTraffic(OV.traffic)}
      </div>
      <div class="ov-block">
        <div class="ov-head">
          <span class="ov-lab">内存</span>
          <span class="ov-now mono warn">${fmtBytes(c.mem)}</span>
        </div>
        ${sparkSingle(OV.memory, "warn")}
      </div>
      <div class="ov-block">
        <div class="ov-head">
          <span class="ov-lab">连接</span>
          <span class="ov-now mono accent">${c.conn}</span>
        </div>
        ${sparkSingle(OV.conn, "accent")}
      </div>
    </div>
    <div class="ov-stats">
      <div class="ov-stat"><span class="ov-stat-lab">上传速度</span><span class="ov-stat-val mono">${fmtBytes(c.up)}/s</span></div>
      <div class="ov-stat"><span class="ov-stat-lab">下载速度</span><span class="ov-stat-val mono">${fmtBytes(c.down)}/s</span></div>
      <div class="ov-stat"><span class="ov-stat-lab">活动连接</span><span class="ov-stat-val mono">${c.conn}</span></div>
      <div class="ov-stat"><span class="ov-stat-lab">上传总量</span><span class="ov-stat-val mono">${fmtBytes(c.ulTotal)}</span></div>
      <div class="ov-stat"><span class="ov-stat-lab">下载总量</span><span class="ov-stat-val mono">${fmtBytes(c.dlTotal)}</span></div>
    </div>`;
}

function updateServicesCard() {
  const list = $("#svc-list");
  if (!list) return;
  if (!S.services.length) {
    list.innerHTML = `<p class="empty">还没有服务，去「设置」里添加</p>`;
    return;
  }
  list.innerHTML = S.services.map(s => {
    const dot = s.status === "online" ? "ok" : s.status === "offline" ? "bad" : "unk";
    const right = s.status === "online" ? fmtDuration(s.duration)
      : s.status === "offline" ? `<span class="bad-t">${fmtDuration(s.duration)}</span>` : "检测中…";
    return `<div class="svc-row"><span class="dot ${dot}"></span><span class="svc-name">${esc(s.name)}</span><span class="svc-up mono">${right}</span></div>`;
  }).join("");
}

async function refreshStatus() {
  try {
    const [net, svc] = await Promise.all([apiGet("/api/status/network"), apiGet("/api/services")]);
    S.network = net;
    S.services = svc;
    updateNetworkCard();
    updateServicesCard();
  } catch (e) { /* 网络抖动时静默，下个周期重试 */ }
}

function startPolling() {
  clearInterval(S.timer);
  S.timer = setInterval(refreshStatus, Math.max(5, S.settings.refresh_interval) * 1000);
}

/* ===== 设置弹窗 ===== */

async function reloadServices() {
  S.services = await apiGet("/api/services");
  updateServicesCard();
}

function openSettings() {
  const ov = document.createElement("div");
  ov.className = "overlay";
  ov.innerHTML = `<div class="modal">
    <div class="modal-head"><h3>设置</h3><button class="btn icon ghost st-close">${icon("x")}</button></div>
    <h4>主题</h4>
    <div class="theme-grid" id="seg-theme">${THEMES.map(t => `
      <button class="theme-tile" data-v="${t.k}">
        <span class="tt-prev" style="background:${t.bg}"><span class="tt-aa" style="color:${t.fg}">Aa</span><span class="tt-dot" style="background:${t.ac}"></span></span>
        <span class="tt-name">${t.label}</span>
      </button>`).join("")}</div>
    <div class="form-row"><span>明暗模式</span><div class="seg" id="seg-mode">${MODES.map(([k, l]) => `<button data-v="${k}">${l}</button>`).join("")}</div></div>
    <h4>刷新</h4>
    <div class="form-row"><span>状态刷新间隔（秒）</span><div class="inline"><input class="input num" id="st-interval" type="number" min="5" max="3600" value="${S.settings.refresh_interval}"><button class="btn" id="st-interval-save">保存</button></div></div>
    <h4>服务管理</h4>
    <div id="st-services"></div>
    <div class="svc-add">
      <input class="input" id="sa-name" placeholder="服务名">
      <input class="input" id="sa-host" placeholder="主机 / IP">
      <input class="input num" id="sa-port" type="number" min="1" max="65535" placeholder="端口">
      <button class="btn" id="sa-add">${icon("plus")} 添加</button>
    </div>
  </div>`;
  document.body.appendChild(ov);

  const close = () => ov.remove();
  $(".st-close", ov).onclick = close;
  ov.addEventListener("click", e => { if (e.target === ov) close(); });

  const syncSeg = (id, val) => {
    $(`#${id}`, ov).querySelectorAll("button").forEach(b => b.classList.toggle("on", b.dataset.v === val));
  };
  syncSeg("seg-theme", localStorage.msi_theme || "glass");
  syncSeg("seg-mode", localStorage.msi_mode || "auto");
  $("#seg-theme", ov).onclick = e => {
    const b = e.target.closest("button");
    if (!b) return;
    localStorage.msi_theme = b.dataset.v;
    applyAppearance();
    syncSeg("seg-theme", b.dataset.v);
  };
  $("#seg-mode", ov).onclick = e => {
    const b = e.target.closest("button");
    if (!b) return;
    localStorage.msi_mode = b.dataset.v;
    applyAppearance();
    syncSeg("seg-mode", b.dataset.v);
  };

  $("#st-interval-save", ov).onclick = async () => {
    const v = parseInt($("#st-interval", ov).value, 10);
    if (!(v >= 5 && v <= 3600)) { toast("间隔需在 5–3600 秒之间", "err"); return; }
    try {
      await apiSend("/api/settings", "PUT", { refresh_interval: v });
      S.settings.refresh_interval = v;
      startPolling();
      updateNetworkCard();
      toast("已保存刷新间隔");
    } catch (e) { toast(e.message, "err"); }
  };

  function renderRows() {
    const box = $("#st-services", ov);
    box.innerHTML = S.services.length ? "" : `<p class="dim empty">暂无服务</p>`;
    S.services.forEach(s => {
      const row = document.createElement("div");
      row.className = "st-svc-row";
      const show = () => {
        row.innerHTML = `<span class="svc-name">${esc(s.name)}</span><span class="mono dim">${esc(s.host)}:${s.port}</span><span class="spacer"></span>
          <button class="btn icon ghost">${icon("pencil")}</button><button class="btn icon ghost">${icon("trash")}</button>`;
        const [eb, db] = row.querySelectorAll("button");
        eb.onclick = edit;
        db.onclick = async () => {
          const c = await confirmDialog({ title: `删除服务「${s.name}」？`, danger: true, okText: "删除" });
          if (!c.ok) return;
          try {
            await apiSend(`/api/services/${s.id}`, "DELETE");
            await reloadServices();
            renderRows();
            toast("已删除");
          } catch (e) { toast(e.message, "err"); }
        };
      };
      const edit = () => {
        row.innerHTML = `<input class="input" value="${esc(s.name)}"><input class="input" value="${esc(s.host)}"><input class="input num" type="number" value="${s.port}">
          <button class="btn icon ghost">${icon("check")}</button><button class="btn icon ghost">${icon("x")}</button>`;
        const [ni, hi, pi] = row.querySelectorAll("input");
        const [ok, cancel] = row.querySelectorAll("button");
        ok.onclick = async () => {
          if (!ni.value.trim() || !hi.value.trim() || !(+pi.value >= 1)) { toast("请填写完整", "err"); return; }
          try {
            await apiSend(`/api/services/${s.id}`, "PUT", { name: ni.value.trim(), host: hi.value.trim(), port: +pi.value });
            await reloadServices();
            renderRows();
            toast("已保存");
          } catch (e) { toast(e.message, "err"); }
        };
        cancel.onclick = show;
      };
      show();
      box.appendChild(row);
    });
  }
  renderRows();

  $("#sa-add", ov).onclick = async () => {
    const name = $("#sa-name", ov).value.trim(), host = $("#sa-host", ov).value.trim(), port = +$("#sa-port", ov).value;
    if (!name || !host || !(port >= 1 && port <= 65535)) { toast("请填写服务名、主机和端口", "err"); return; }
    try {
      await apiSend("/api/services", "POST", { name, host, port });
      $("#sa-name", ov).value = $("#sa-host", ov).value = $("#sa-port", ov).value = "";
      await reloadServices();
      renderRows();
      toast("已添加");
    } catch (e) { toast(e.message, "err"); }
  };
}

/* ===== Clash 编辑器页 ===== */

const RULE_TYPES = ["DOMAIN", "DOMAIN-SUFFIX", "DOMAIN-KEYWORD", "IP-CIDR", "IP-CIDR6", "IP-ASN", "GEOIP", "GEOSITE", "PROCESS-NAME", "DST-PORT", "SRC-IP-CIDR", "MATCH"];
const IP_TYPES = new Set(["IP-CIDR", "IP-CIDR6", "IP-ASN", "GEOIP", "SRC-IP-CIDR"]);

async function render() {
  if (!S.meta) {
    try { S.meta = await apiGet("/api/clash/meta"); }
    catch (e) { $("#view").innerHTML = `<p class="dim empty">加载失败：${esc(e.message)}</p>`; return; }
  }
  const file = S.meta.files.find(f => f.key === S.fileKey);
  const fileIcon = { router: "router", company: "coffee" };
  $("#view").innerHTML = `
  <div class="stack">
    <header class="appbar">
      <div class="seg icons" id="seg-file">${S.meta.files.map(f => `<button data-v="${f.key}" data-seg="1" class="${f.key === S.fileKey ? "on" : ""}" aria-label="${esc(f.name)}" title="${esc(f.name)}">${icon(fileIcon[f.key] || "archive")}</button>`).join("")}</div>
      <span class="spacer"></span>
      <button class="btn ghost" id="open-proxies">${icon("branch")}<span class="lbl">代理</span></button>
      <button class="btn ghost" id="open-logs">${icon("terminal")}<span class="lbl">日志</span></button>
      <button class="btn ghost" id="open-conns">${icon("activity")}<span class="lbl">连接</span></button>
      <span class="vdiv"></span>
      <button class="btn icon ghost" id="open-settings" aria-label="设置" title="设置">${icon("gear")}</button>
    </header>
    <div class="grid hero">
      <section class="card overview-card" id="overview-card"><p class="empty">加载中…</p></section>
      <div class="hero-right">
        <section class="card" id="net-card"></section>
        <section class="card svc-card"><h2 class="card-h">服务状态</h2><div id="svc-list"></div></section>
      </div>
    </div>
    <section class="card">
      <div class="card-head">
        <h2 class="card-h">规则编辑</h2>
        <span class="spacer"></span>
        <div class="rule-actions" id="rule-actions">
          <button class="btn icon" id="rules-raw-toggle" title="原文编辑" aria-label="原文编辑">${icon("code")}</button>
          <button class="btn icon" id="rules-save" title="保存${S.fileKey === "router" ? "并下发" : ""}" aria-label="保存">${icon("save")}</button>
          <button class="btn icon" id="grp-add" title="添加分组" aria-label="添加分组">${icon("plus")}</button>
          <div class="rule-search" id="rule-search">
            <input class="input" id="rule-filter" type="search" aria-label="筛选规则">
            <button class="btn icon" id="rule-search-btn" title="搜索" aria-label="搜索">${icon("search")}</button>
          </div>
        </div>
      </div>
      <div id="rule-groups"><p class="empty">加载中…</p></div>
      <div class="steps" id="rules-steps"></div>
    </section>
    <div class="grid g13">
      <section class="card sub-card">
        <div class="sub-line">
          <span class="sub-lab">订阅链接</span>
          <span></span>
          <button class="btn icon" id="copy-url" aria-label="复制订阅链接" title="复制订阅链接">${icon("copy")}</button>
        </div>
        <div class="sub-line">
          <span class="sub-lab">更新密钥</span>
          <span></span>
          <div class="sub-expand" id="sub-expand">
            <input class="input mono" id="sub-input" value="${esc(S.settings.sub_url || "")}" placeholder="">
            <button class="btn icon" id="sub-update" aria-label="更新订阅并下发" title="更新订阅并下发">${icon("refresh")}</button>
          </div>
        </div>
        <div class="sub-line">
          <span class="sub-lab">重启服务</span>
          <span></span>
          <button class="btn icon" id="restart-now" aria-label="重启 clash 服务" title="重启 clash 服务">${icon("power")}</button>
        </div>
        <div class="steps" id="sub-steps"></div>
      </section>
      <section class="card backup-card">
        <h2 class="card-h">备份与恢复</h2>
        <div id="backup-list" class="backup-scroll"><p class="empty">加载中…</p></div>
      </section>
    </div>
  </div>`;

  updateNetworkCard();
  updateServicesCard();
  $("#open-settings").onclick = openSettings;
  $("#open-proxies").onclick = openProxies;
  $("#open-logs").onclick = openLogs;
  $("#open-conns").onclick = openConnections;
  $("#restart-now").onclick = restartClash;
  $("#seg-file").addEventListener("click", async e => {
    const b = e.target.closest("button[data-seg='1']");
    if (!b || b.dataset.v === S.fileKey) return;
    if (S.rg && S.rg.dirty) {
      const c = await confirmDialog({ title: "规则有未保存的修改", msg: "切换文件将丢弃未保存的修改，继续？", okText: "切换" });
      if (!c.ok) return;
    }
    S.fileKey = b.dataset.v;
    S.rg = null;
    render();
  });
  $("#copy-url").onclick = async () => { await copyText(file.sub_url); toast("已复制订阅链接"); };
  setupSubExpand();
  $("#rules-save").onclick = () => (S.rg && S.rg.rawMode) ? saveRaw() : saveRules();
  $("#rules-raw-toggle").onclick = toggleRawMode;
  $("#grp-add").onclick = () => {
    if (!S.rg) return;
    S.rg.groups.push({ title: "新分组", rules: [], collapsed: false });
    markDirty();
    renderRuleGroups();
  };
  setupRuleSearch();
  $("#rule-filter").oninput = debounce(renderRuleGroups, 200);

  loadRules();
  loadBackups();
}

function setupSubExpand() {
  const exp = $("#sub-expand"), inp = $("#sub-input"), btn = $("#sub-update");
  if (!exp) return;
  const open = () => { exp.classList.add("open"); setTimeout(() => inp.focus(), 50); };
  const close = () => { exp.classList.remove("open"); };
  btn.onclick = async () => {
    if (!exp.classList.contains("open")) { open(); return; }
    if (!inp.value.trim()) { toast("请先输入订阅 URL", "err"); return; }
    await subUpdate();
  };
  inp.addEventListener("blur", () => { if (!inp.value.trim()) close(); });
  inp.addEventListener("keydown", e => {
    if (e.key === "Escape") { inp.blur(); close(); }
    else if (e.key === "Enter") { e.preventDefault(); btn.click(); }
  });
}

function setupRuleSearch() {
  const actions = $("#rule-actions");
  const wrap = $("#rule-search");
  const inp = $("#rule-filter");
  const btn = $("#rule-search-btn");
  const open = () => {
    actions.classList.add("search-open");
    wrap.classList.add("open");
    setTimeout(() => inp.focus(), 50);
  };
  const close = () => {
    inp.value = "";
    renderRuleGroups();
    actions.classList.remove("search-open");
    wrap.classList.remove("open");
  };
  btn.onclick = () => { if (!wrap.classList.contains("open")) open(); };
  inp.addEventListener("blur", () => { if (!inp.value) close(); });
  inp.addEventListener("keydown", e => { if (e.key === "Escape") { inp.blur(); close(); } });
}

function groupEntries(entries) {
  const groups = [];
  let cur = null;
  const open = title => { cur = { title, rules: [], collapsed: true }; groups.push(cur); };
  entries.forEach(e => {
    if (e.t === "comment") open(e.text);
    else if (e.t === "blank") { if (cur && cur.rules.length) open(null); }
    else {
      if (!cur) open(null);
      cur.rules.push(e.t === "rule"
        ? { type: e.type, value: e.value, policy: e.policy, extra: e.extra || "" }
        : { raw: e.text });
    }
  });
  return groups.filter(g => g.rules.length || g.title != null);
}

function flattenGroups() {
  const entries = [];
  S.rg.groups.forEach((g, i) => {
    const title = (g.title || "").trim();
    if (title) entries.push({ t: "comment", text: title });
    else if (i > 0) entries.push({ t: "blank" });
    g.rules.forEach(r => {
      entries.push(r.raw != null
        ? { t: "raw", text: r.raw }
        : { t: "rule", type: r.type, value: r.value, policy: r.policy, extra: r.extra || "" });
    });
  });
  return entries;
}

async function loadRules() {
  try {
    const d = await apiGet(`/api/clash/${S.fileKey}/rules`);
    S.rg = { groups: groupEntries(d.entries), policies: d.policies, dirty: false, rawMode: false };
    const sb = $("#rules-save");
    if (sb) sb.classList.remove("dirty");
    renderRuleGroups();
  } catch (e) {
    const box = $("#rule-groups");
    if (box) box.innerHTML = `<p class="dim empty">加载失败：${esc(e.message)}</p>`;
  }
}

/* ----- 原文编辑模式（YAML 整文件） ----- */

async function toggleRawMode() {
  const goRaw = !(S.rg && S.rg.rawMode);
  if (S.rg && S.rg.dirty) {
    const c = await confirmDialog({
      title: goRaw ? "切到原文编辑？" : "切回规则编辑？",
      msg: "当前有未保存的修改，切换会丢弃。",
      okText: "切换",
    });
    if (!c.ok) return;
  }
  const btn = $("#rules-raw-toggle");
  if (goRaw) {
    btn.disabled = true;
    try {
      const d = await apiGet(`/api/clash/${S.fileKey}/raw`);
      S.rg = { rawMode: true, rawText: d.text, dirty: false };
      btn.classList.add("on");
      renderRawEditor();
    } catch (e) {
      toast("加载原文失败：" + e.message, "err");
    } finally { btn.disabled = false; }
  } else {
    btn.classList.remove("on");
    $("#rule-actions").classList.remove("raw");
    loadRules();
  }
}

function renderRawEditor() {
  const box = $("#rule-groups");
  if (!box) return;
  $("#rule-actions").classList.add("raw");
  box.innerHTML = `<textarea id="rules-raw" class="rules-raw mono" spellcheck="false">${esc(S.rg.rawText)}</textarea>`;
  const ta = $("#rules-raw");
  ta.oninput = () => {
    S.rg.rawText = ta.value;
    markDirty();
  };
}

async function saveRaw() {
  if (!S.rg || !S.rg.rawMode) return;
  const text = S.rg.rawText;
  if (!text.trim()) { toast("内容为空", "err"); return; }
  const isRouter = S.fileKey === "router";
  const fname = S.meta.files.find(f => f.key === S.fileKey).name;
  const c = await confirmDialog({
    title: `保存原文到 ${fname}？`,
    msg: "服务端会用 YAML 解析器校验；保存前自动备份。",
    check: isRouter ? "同时下发到路由器并重启 clash" : null,
    checked: true, okText: "保存",
  });
  if (!c.ok) return;
  const btn = $("#rules-save");
  btn.disabled = true;
  btn.classList.add("loading");
  try {
    const res = await apiSend(`/api/clash/${S.fileKey}/raw`, "PUT", { text, deploy: isRouter && c.checked });
    showSteps($("#rules-steps"), res.deploy ? res.deploy.steps : []);
    if (res.deploy && !res.deploy.ok) toast("已保存，但下发路由器失败", "err");
    else toast(isRouter && c.checked ? "已保存并下发" : "已保存");
    S.rg.dirty = false;
    btn.classList.remove("dirty");
    loadBackups();
  } catch (e) { toast(e.message, "err"); }
  finally { btn.disabled = false; btn.classList.remove("loading"); }
}

function markDirty() {
  if (!S.rg) return;
  S.rg.dirty = true;
  const sb = $("#rules-save");
  if (sb) sb.classList.add("dirty");
}

function updateCount() {
  const el = $("#rule-count");
  if (el && S.rg) el.textContent = `${S.rg.groups.reduce((n, g) => n + g.rules.length, 0)} 条`;
}

function renderRuleGroups() {
  const box = $("#rule-groups");
  if (!box || !S.rg) return;
  const f = ($("#rule-filter")?.value || "").trim().toLowerCase();
  box.innerHTML = "";
  S.rg.groups.forEach(g => {
    const matched = f
      ? g.rules.filter(r => (r.raw != null ? r.raw : `${r.type} ${r.value} ${r.policy}`).toLowerCase().includes(f))
      : g.rules;
    if (f && !matched.length) return;

    const sec = document.createElement("div");
    sec.className = "rgroup";
    const head = document.createElement("div");
    head.className = "rg-head";
    head.innerHTML = `
      <button class="btn icon ghost rg-caret ${(!f && g.collapsed) ? "closed" : ""}">${icon("chev")}</button>
      <input class="rg-title" value="${esc(g.title ?? "")}" placeholder="未命名分组">
      <span class="chip rg-count">${g.rules.length}</span>
      <span class="spacer"></span>
      <span class="rg-tools">
        <button class="btn icon ghost" title="添加规则">${icon("plus")}</button>
        <button class="btn icon ghost" title="删除分组">${icon("trash")}</button>
      </span>`;
    const body = document.createElement("div");
    body.className = "rg-body";
    if (!f && g.collapsed) body.style.display = "none";
    matched.forEach(r => body.appendChild(ruleRow(g, r, !!f)));

    const [caretB, addB, delB] = head.querySelectorAll("button");
    caretB.onclick = () => {
      if (f) return;
      g.collapsed = !g.collapsed;
      body.style.display = g.collapsed ? "none" : "";
      caretB.classList.toggle("closed", g.collapsed);
    };
    head.querySelector(".rg-title").onchange = e => { g.title = e.target.value.trim() || null; markDirty(); };
    addB.onclick = () => {
      g.collapsed = false;
      body.style.display = "";
      caretB.classList.remove("closed");
      const r = { type: "DOMAIN-SUFFIX", value: "", policy: S.rg.policies[0] || "DIRECT", extra: "" };
      g.rules.push(r);
      markDirty();
      body.appendChild(ruleRow(g, r, false));
      head.querySelector(".rg-count").textContent = g.rules.length;
      updateCount();
      const inp = body.lastChild.querySelector(".r-val");
      if (inp) inp.focus();
    };
    delB.onclick = async () => {
      const c = await confirmDialog({
        title: `删除分组${g.title ? `「${g.title}」` : ""}？`,
        msg: g.rules.length ? `组内 ${g.rules.length} 条规则将一并删除` : "",
        danger: true, okText: "删除",
      });
      if (!c.ok) return;
      S.rg.groups.splice(S.rg.groups.indexOf(g), 1);
      markDirty();
      renderRuleGroups();
    };

    sec.append(head, body);
    box.appendChild(sec);
  });
  if (!box.children.length) box.innerHTML = `<p class="dim empty">${f ? "没有匹配的规则" : "暂无规则"}</p>`;
  updateCount();
}

function ruleRow(g, r, filtered) {
  const row = document.createElement("div");
  row.className = "rrow";
  const btns = `<div class="rbtns">${filtered ? "" : `<button class="btn icon ghost rb" data-a="up">${icon("up")}</button><button class="btn icon ghost rb" data-a="down">${icon("chev")}</button>`}<button class="btn icon ghost rb" data-a="del">${icon("trash")}</button></div>`;

  if (r.raw != null) {
    row.innerHTML = `<input class="input mono grow" value="${esc(r.raw)}">${btns}`;
    row.querySelector("input").onchange = e => { r.raw = e.target.value; markDirty(); };
  } else {
    const types = RULE_TYPES.includes(r.type) ? RULE_TYPES : [r.type, ...RULE_TYPES];
    const pols = S.rg.policies.includes(r.policy) ? S.rg.policies : [r.policy, ...S.rg.policies];
    row.innerHTML = `
      <select class="input r-type">${types.map(t => `<option ${t === r.type ? "selected" : ""}>${esc(t)}</option>`).join("")}</select>
      <input class="input mono r-val" value="${esc(r.value)}" placeholder="匹配内容" ${r.type === "MATCH" ? "disabled" : ""}>
      <select class="input r-pol">${pols.map(p => `<option ${p === r.policy ? "selected" : ""}>${esc(p)}</option>`).join("")}</select>
      <label class="nr ${IP_TYPES.has(r.type) ? "" : "hidden"}" title="no-resolve"><input type="checkbox" ${r.extra === "no-resolve" ? "checked" : ""}>nr</label>
      ${btns}`;
    const tSel = row.querySelector(".r-type"), vInp = row.querySelector(".r-val"), pSel = row.querySelector(".r-pol");
    const nrLab = row.querySelector(".nr"), nrCb = nrLab.querySelector("input");
    tSel.onchange = () => {
      r.type = tSel.value;
      vInp.disabled = r.type === "MATCH";
      if (r.type === "MATCH") { r.value = ""; vInp.value = ""; }
      nrLab.classList.toggle("hidden", !IP_TYPES.has(r.type));
      if (!IP_TYPES.has(r.type)) { r.extra = ""; nrCb.checked = false; }
      markDirty();
    };
    vInp.onchange = () => { r.value = vInp.value.trim(); markDirty(); };
    pSel.onchange = () => { r.policy = pSel.value; markDirty(); };
    nrCb.onchange = () => { r.extra = nrCb.checked ? "no-resolve" : ""; markDirty(); };
  }

  row.querySelectorAll(".rb").forEach(b => {
    b.onclick = () => {
      const i = g.rules.indexOf(r);
      if (b.dataset.a === "del") {
        g.rules.splice(i, 1);
        const head = row.closest(".rgroup")?.querySelector(".rg-count");
        if (head) head.textContent = g.rules.length;
        row.remove();
        markDirty();
        updateCount();
      } else if (b.dataset.a === "up" && i > 0) {
        [g.rules[i - 1], g.rules[i]] = [g.rules[i], g.rules[i - 1]];
        row.parentNode.insertBefore(row, row.previousElementSibling);
        markDirty();
      } else if (b.dataset.a === "down" && i < g.rules.length - 1) {
        [g.rules[i + 1], g.rules[i]] = [g.rules[i], g.rules[i + 1]];
        row.parentNode.insertBefore(row.nextElementSibling, row);
        markDirty();
      }
    };
  });
  return row;
}

function showSteps(el, steps) {
  if (!el) return;
  el.innerHTML = (steps || []).map(s =>
    `<div class="step ${s.ok ? "ok" : "bad"}">${icon(s.ok ? "check" : "x")}<span>${esc(s.name)}</span>${s.detail ? `<span class="dim sd" title="${esc(s.detail)}">${esc(s.detail)}</span>` : ""}</div>`
  ).join("");
}

async function saveRules() {
  if (!S.rg) return;
  for (const g of S.rg.groups) {
    for (const r of g.rules) {
      if (r.raw == null && r.type !== "MATCH" && !r.value) { toast("有规则的匹配内容为空，请填写或删除", "err"); return; }
    }
  }
  const isRouter = S.fileKey === "router";
  const fname = S.meta.files.find(f => f.key === S.fileKey).name;
  const c = await confirmDialog({
    title: `保存规则到 ${fname}？`,
    msg: "保存前会自动备份当前文件",
    check: isRouter ? "同时下发到路由器并重启 clash" : null,
    checked: true, okText: "保存",
  });
  if (!c.ok) return;
  const btn = $("#rules-save");
  btn.disabled = true;
  btn.classList.add("loading");
  try {
    const res = await apiSend(`/api/clash/${S.fileKey}/rules`, "PUT", { entries: flattenGroups(), deploy: isRouter && c.checked });
    showSteps($("#rules-steps"), res.deploy ? res.deploy.steps : []);
    if (res.deploy && !res.deploy.ok) toast("已保存，但下发路由器失败", "err");
    else toast(isRouter && c.checked ? "已保存并下发" : "已保存");
    await loadRules();
    loadBackups();
  } catch (e) {
    toast(e.message, "err");
  } finally {
    btn.disabled = false;
    btn.classList.remove("loading");
  }
}

async function subUpdate() {
  const url = $("#sub-input").value.trim();
  if (!/^https?:\/\//.test(url)) { toast("请输入合法的订阅 URL", "err"); return; }
  const c = await confirmDialog({
    title: "更新密钥？",
    msg: "将拉取订阅并替换 Router.yaml 与 Company.yaml 的 proxies 部分（替换前自动备份）",
    check: "完成后下发路由器并重启 clash",
    checked: true, okText: "开始更新",
  });
  if (!c.ok) return;
  const btn = $("#sub-update");
  btn.disabled = true;
  btn.classList.add("loading");
  try {
    const res = await apiSend("/api/clash/update-proxies", "POST", { url, deploy: c.checked });
    showSteps($("#sub-steps"), [...res.steps, ...(res.deploy ? res.deploy.steps : [])]);
    res.ok ? toast("更新完成") : toast("更新未完全成功，请查看步骤详情", "err");
    S.settings.sub_url = url;
    loadBackups();
  } catch (e) {
    toast(e.message, "err");
  } finally {
    btn.disabled = false;
    btn.classList.remove("loading");
  }
}

async function manualDeploy() {
  const c = await confirmDialog({
    title: "下发到路由器？",
    msg: "将把当前 Router.yaml 写入 路由器 /tmp/ShellCrash/config.yaml 并重启 clash",
    okText: "下发",
  });
  if (!c.ok) return;
  const btn = $("#deploy-now");
  btn.disabled = true;
  try {
    const res = await apiSend("/api/clash/deploy", "POST");
    showSteps($("#sub-steps"), res.steps);
    res.ok ? toast("下发完成") : toast("下发失败，请查看步骤详情", "err");
  } catch (e) {
    toast(e.message, "err");
  } finally {
    btn.disabled = false;
  }
}

async function loadBackups() {
  const box = $("#backup-list");
  try { S.backups = await apiGet(`/api/clash/${S.fileKey}/backups`); }
  catch (e) { S.backups = []; }
  if (!box) return;
  if (!S.backups.length) { box.innerHTML = `<p class="empty">暂无备份</p>`; return; }
  box.innerHTML = S.backups.map(b =>
    `<div class="bk-row"><span class="mono bk-time">${fmtTime(b.time)}</span><span class="badge">${esc(b.reason)}</span><span class="mono bk-size">${(b.size / 1024).toFixed(1)} KB</span><span class="spacer"></span><button class="btn sm" data-id="${esc(b.id)}">恢复</button></div>`
  ).join("");
  box.querySelectorAll("button").forEach(btn => { btn.onclick = () => restoreBackup(btn.dataset.id); });
}

async function restoreBackup(id) {
  const b = S.backups.find(x => x.id === id);
  if (!b) return;
  const isRouter = S.fileKey === "router";
  const fname = S.meta.files.find(f => f.key === S.fileKey).name;
  const c = await confirmDialog({
    title: "恢复备份？",
    msg: `将把 ${fname} 恢复到 ${fmtTime(b.time)}（${b.reason}）的版本，当前文件会先自动备份`,
    check: isRouter ? "恢复后下发到路由器并重启 clash" : null,
    checked: true, okText: "恢复", danger: true,
  });
  if (!c.ok) return;
  try {
    const res = await apiSend(`/api/clash/${S.fileKey}/restore`, "POST", { backup_id: id, deploy: isRouter && c.checked });
    if (res.deploy && !res.deploy.ok) toast("已恢复，但下发路由器失败", "err");
    else toast("已恢复");
    S.rg = null;
    loadRules();
    loadBackups();
  } catch (e) {
    toast(e.message, "err");
  }
}

/* ===== 入口 ===== */

async function init() {
  applyAppearance();
  try { S.settings = await apiGet("/api/settings"); } catch (e) { /* 用默认值 */ }
  await render();
  refreshStatus();
  startPolling();
  startStreams();
  renderOverview();
}
init();

/* ===== 重启服务 ===== */

async function restartClash() {
  const c = await confirmDialog({
    title: "重启路由器 Clash 服务？",
    msg: "代理会短暂中断（约 5–10 秒），不会修改任何配置。",
    okText: "重启",
  });
  if (!c.ok) return;
  const btn = $("#restart-now");
  btn.disabled = true;
  btn.classList.add("loading");
  try {
    const res = await apiSend("/api/clash/restart", "POST");
    showSteps($("#sub-steps"), res.steps);
    res.ok ? toast("已重启 clash 服务") : toast("重启失败，请查看步骤详情", "err");
    // 重启会断 SSE，等几秒再重新订阅
    stopStreams();
    setTimeout(startStreams, 8000);
  } catch (e) {
    toast(e.message, "err");
  } finally {
    btn.disabled = false;
    btn.classList.remove("loading");
  }
}

/* ===== 代理 / 日志 / 连接 模态 ===== */

function openPage({ title, body, head = "", onClose }) {
  const ov = document.createElement("div");
  ov.className = "overlay";
  ov.innerHTML = `<div class="modal page">
    <div class="modal-head">
      <h3>${esc(title)}</h3>
      <div class="page-head-tools">${head}</div>
      <button class="btn icon ghost mp-close" aria-label="关闭">${icon("x")}</button>
    </div>
    <div class="page-body">${body}</div>
  </div>`;
  document.body.appendChild(ov);
  const close = () => { onClose && onClose(); ov.remove(); };
  ov.querySelector(".mp-close").onclick = close;
  ov.addEventListener("click", e => { if (e.target === ov) close(); });
  document.addEventListener("keydown", function onkey(e) {
    if (e.key === "Escape") { document.removeEventListener("keydown", onkey); close(); }
  });
  return ov;
}

/* ----- 代理 ----- */

const PROXY_MODES = [["rule", "规则"], ["global", "全局"], ["direct", "直连"]];

async function openProxies() {
  let cfg = null;
  try { const r = await fetch("/api/clash/api/configs"); if (r.ok) cfg = await r.json(); } catch {}
  const curMode = (cfg && cfg.mode || "rule").toLowerCase();
  const modeSeg = `<div class="seg" id="proxy-mode">${PROXY_MODES.map(([k, l]) =>
    `<button data-v="${k}" class="${k === curMode ? "on" : ""}">${l}</button>`).join("")}</div>`;
  const ov = openPage({ title: "代理", head: modeSeg, body: `<p class="empty">加载中…</p>` });
  ov.querySelector("#proxy-mode").onclick = async e => {
    const b = e.target.closest("button[data-v]");
    if (!b || b.classList.contains("on")) return;
    const m = b.dataset.v;
    try {
      const r = await fetch("/api/clash/api/configs", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: m }),
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      ov.querySelectorAll("#proxy-mode button").forEach(x => x.classList.toggle("on", x === b));
      toast(`已切换为${PROXY_MODES.find(([k]) => k === m)[1]}模式`);
    } catch (e) { toast("切换失败：" + e.message, "err"); }
  };
  let data;
  try {
    const r = await fetch("/api/clash/api/proxies");
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    data = await r.json();
  } catch (e) {
    ov.querySelector(".page-body").innerHTML = `<p class="empty">无法连接 Clash API：${esc(e.message)}</p>`;
    return;
  }
  const groups = Object.values(data.proxies).filter(p =>
    ["Selector", "URLTest", "Fallback", "LoadBalance"].includes(p.type)
  );
  if (!groups.length) {
    ov.querySelector(".page-body").innerHTML = `<p class="empty">未找到代理组</p>`;
    return;
  }
  ov.querySelector(".page-body").innerHTML = groups.map(g => proxyGroupHtml(g, data.proxies)).join("");
  ov.querySelectorAll(".pg-node").forEach(n => {
    n.onclick = async () => {
      const group = n.closest(".pg").dataset.name;
      const name = n.dataset.name;
      try {
        const r = await fetch(`/api/clash/api/proxies/${encodeURIComponent(group)}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name }),
        });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        n.closest(".pg").querySelectorAll(".pg-node").forEach(x => x.classList.toggle("on", x === n));
        toast(`已切换至 ${name}`);
      } catch (e) { toast("切换失败：" + e.message, "err"); }
    };
  });
  ov.querySelectorAll(".pg-test").forEach(b => {
    b.onclick = async () => {
      const group = b.closest(".pg").dataset.name;
      b.disabled = true;
      b.textContent = "测试中…";
      try {
        const r = await fetch(`/api/clash/api/group/${encodeURIComponent(group)}/delay?timeout=5000&url=${encodeURIComponent("http://www.gstatic.com/generate_204")}`);
        const d = await r.json();
        const card = b.closest(".pg");
        Object.entries(d).forEach(([name, ms]) => {
          const node = card.querySelector(`.pg-node[data-name="${CSS.escape(name)}"]`);
          if (!node) return;
          const delayEl = node.querySelector(".pg-delay");
          if (!delayEl) return;
          delayEl.textContent = ms > 0 ? `${ms}ms` : "—";
          delayEl.className = "pg-delay " + (ms <= 0 ? "bad" : ms < 200 ? "ok" : ms < 500 ? "warn" : "bad");
        });
      } catch (e) { toast("测速失败：" + e.message, "err"); }
      finally { b.disabled = false; b.textContent = "测速"; }
    };
  });
}

function proxyGroupHtml(g, all) {
  const opts = (g.all || []).map(name => {
    const p = all[name] || {};
    const last = p.history && p.history.length ? p.history[p.history.length - 1] : null;
    const ms = last ? last.delay : 0;
    const dcls = ms <= 0 ? "bad" : ms < 200 ? "ok" : ms < 500 ? "warn" : "bad";
    return `<div class="pg-node ${name === g.now ? "on" : ""}" data-name="${esc(name)}">
      <span class="pg-name">${esc(name)}</span>
      <span class="pg-type dim">${esc(p.type || "")}</span>
      <span class="pg-delay ${dcls}">${ms > 0 ? ms + "ms" : "—"}</span>
    </div>`;
  }).join("");
  return `<section class="pg" data-name="${esc(g.name)}">
    <div class="pg-head">
      <span class="pg-title">${esc(g.name)}</span>
      <span class="chip">${esc(g.type)}</span>
      <span class="pg-now mono dim">→ ${esc(g.now || "")}</span>
      <span class="spacer"></span>
      <button class="btn sm pg-test">测速</button>
    </div>
    <div class="pg-nodes">${opts}</div>
  </section>`;
}

/* ----- 日志 ----- */

function openLogs() {
  let es = null, paused = false, buf = [];
  const ov = openPage({
    title: "日志",
    head: `<span id="lg-count" class="dim mono" style="font-size:11px"></span>
           <button class="btn sm" id="lg-clear">清空显示</button>
           <button class="btn sm" id="lg-pause">暂停</button>`,
    body: `<pre id="lg-output" class="logbox"></pre>`,
    onClose: () => { if (es) es.close(); },
  });
  const out = ov.querySelector("#lg-output");
  const cnt = ov.querySelector("#lg-count");
  const fmtTs = ts => {
    const d = new Date((ts || Date.now() / 1000) * 1000);
    const pad = n => String(n).padStart(2, "0");
    return `${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  };
  const render = () => {
    out.textContent = buf.join("\n");
    out.scrollTop = out.scrollHeight;
    cnt.textContent = `${buf.length} 条`;
  };
  const append = (line) => {
    buf.push(line);
    // 上限 6000 行，覆盖近 24h 的典型流量
    if (buf.length > 6000) buf.splice(0, buf.length - 6000);
    if (!paused) render();
  };
  try {
    es = new EventSource("/api/clash/api/logs_buffered");
    es.onmessage = e => {
      try {
        const d = JSON.parse(e.data);
        append(`[${fmtTs(d.ts)}] ${(d.type || "").toUpperCase().padEnd(5)} ${d.payload || ""}`);
      } catch { append(e.data); }
    };
    es.onerror = () => append("[流错误] 与 Clash 日志通道断开");
  } catch (e) {
    append("无法订阅日志：" + e.message);
  }
  ov.querySelector("#lg-clear").onclick = () => { buf = []; render(); };
  const pb = ov.querySelector("#lg-pause");
  pb.onclick = () => {
    paused = !paused;
    pb.textContent = paused ? "继续" : "暂停";
    if (!paused) render();
  };
}

/* ----- 连接 ----- */

async function openConnections() {
  let timer = null;
  const ov = openPage({
    title: "连接",
    head: `<span id="cn-stats" class="mono dim"></span>
           <button class="btn sm danger-text" id="cn-killall">关闭全部</button>`,
    body: `<div id="cn-list"><p class="empty">加载中…</p></div>`,
    onClose: () => { clearInterval(timer); },
  });
  const list = ov.querySelector("#cn-list");
  const stats = ov.querySelector("#cn-stats");
  const tick = async () => {
    try {
      const r = await fetch("/api/clash/api/connections");
      const d = await r.json();
      const conns = (d.connections || []).slice().sort((a, b) =>
        (b.upload + b.download) - (a.upload + a.download)
      );
      stats.textContent = `${conns.length} 条 · ↑${fmtBytes(d.uploadTotal || 0)} ↓${fmtBytes(d.downloadTotal || 0)}`;
      if (!conns.length) { list.innerHTML = `<p class="empty">暂无活动连接</p>`; return; }
      list.innerHTML = conns.slice(0, 200).map(c => {
        const m = c.metadata || {};
        const host = m.host || m.destinationIP || "?";
        const dport = m.destinationPort ? ":" + m.destinationPort : "";
        const chain = (c.chains || []).slice().reverse().join(" → ");
        const proc = (m.processPath || "").split("/").pop() || "";
        return `<div class="cn-row" data-id="${esc(c.id)}">
          <div class="cn-main">
            <span class="cn-host mono">${esc(host)}${esc(dport)}</span>
            ${proc ? `<span class="chip">${esc(proc)}</span>` : ""}
            <span class="chip">${esc(m.network || "tcp")}</span>
            <span class="dim mono">${esc(c.rule || "")}</span>
          </div>
          <div class="cn-sub">
            <span class="mono dim">${esc(m.sourceIP || "")} → ${esc(chain || "?")}</span>
            <span class="spacer"></span>
            <span class="mono">↑${fmtBytes(c.upload)} ↓${fmtBytes(c.download)}</span>
            <button class="btn icon ghost cn-kill" aria-label="关闭" title="关闭">${icon("x")}</button>
          </div>
        </div>`;
      }).join("");
      list.querySelectorAll(".cn-kill").forEach(b => {
        b.onclick = async () => {
          const id = b.closest(".cn-row").dataset.id;
          try { await fetch(`/api/clash/api/connections/${id}`, { method: "DELETE" }); } catch {}
        };
      });
    } catch (e) {
      list.innerHTML = `<p class="empty">无法获取连接：${esc(e.message)}</p>`;
    }
  };
  tick();
  timer = setInterval(tick, 2000);
  ov.querySelector("#cn-killall").onclick = async () => {
    const c = await confirmDialog({ title: "关闭全部活动连接？", danger: true, okText: "关闭" });
    if (!c.ok) return;
    try { await fetch("/api/clash/api/connections", { method: "DELETE" }); toast("已关闭"); } catch (e) { toast(e.message, "err"); }
  };
}
