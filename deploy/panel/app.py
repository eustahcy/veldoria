"""Veldoria Panel — start/stop/restart/kopie zapasowe gry Veldoria.

Działa natywnie na hoście (systemd), poza Dockerem: dzięki temu pokazuje
"gra leży" i nadal ma przycisk Start. Steruje wyłącznie projektem compose
`veldoria` — nie dotyka stosu Metin2 działającego na tym samym VPS.

Konfiguracja z /etc/veldoria-panel.env (systemd EnvironmentFile):
  VELDORIA_DIR, PANEL_PORT, PANEL_PASSWORD_HASH, PANEL_SECRET_KEY
"""
import hashlib
import hmac
import json
import os
import re
import secrets
import subprocess
import threading
import time
import urllib.request
from datetime import datetime
from pathlib import Path

from flask import (Flask, abort, jsonify, redirect, render_template_string,
                   request, send_file, session, url_for)

# --- konfiguracja ------------------------------------------------------------
BASE = Path(os.environ.get("VELDORIA_DIR", "/opt/veldoria"))
COMPOSE = ["docker", "compose", "-f", str(BASE / "app/deploy/docker-compose.yml"),
           "--env-file", str(BASE / ".env")]
BACKUP_DIR = BASE / "backups"
BACKUP_SCRIPT = BASE / "app/deploy/backup.sh"
PANEL_ENV_FILE = Path("/etc/veldoria-panel.env")
PASSWORD_HASH = os.environ.get("PANEL_PASSWORD_HASH", "")
GAME_URL = "http://127.0.0.1:" + os.environ.get("GAME_PORT", "3002")

app = Flask(__name__)
app.secret_key = os.environ.get("PANEL_SECRET_KEY") or secrets.token_hex(32)
app.config.update(SESSION_COOKIE_HTTPONLY=True, SESSION_COOKIE_SAMESITE="Strict",
                  PERMANENT_SESSION_LIFETIME=12 * 3600)


# --- hasło -------------------------------------------------------------------
def hash_password(password, salt=None):
    salt = salt or secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt.encode(), 310_000).hex()
    return f"{salt}:{digest}"


def check_password(password):
    if ":" not in PASSWORD_HASH:
        return False
    salt, digest = PASSWORD_HASH.split(":", 1)
    return hmac.compare_digest(hash_password(password, salt).split(":", 1)[1], digest)


def set_password(new_password):
    global PASSWORD_HASH
    PASSWORD_HASH = hash_password(new_password)
    lines = PANEL_ENV_FILE.read_text().splitlines() if PANEL_ENV_FILE.exists() else []
    lines = [l for l in lines if not l.startswith("PANEL_PASSWORD_HASH=")]
    lines.append(f"PANEL_PASSWORD_HASH={PASSWORD_HASH}")
    PANEL_ENV_FILE.write_text("\n".join(lines) + "\n")
    os.chmod(PANEL_ENV_FILE, 0o600)


# --- blokada po nieudanych logowaniach (5 prób / 15 min na IP) ---------------
_fails = {}
_fails_lock = threading.Lock()


def locked_for(ip):
    with _fails_lock:
        count, until = _fails.get(ip, (0, 0))
        return max(0, int(until - time.time())) if count >= 5 else 0


def register_fail(ip):
    with _fails_lock:
        count, until = _fails.get(ip, (0, 0))
        if until and until < time.time():
            count = 0
        count += 1
        _fails[ip] = (count, time.time() + 15 * 60)


# --- CSRF / auth -------------------------------------------------------------
def csrf_token():
    if "csrf" not in session:
        session["csrf"] = secrets.token_hex(16)
    return session["csrf"]


@app.before_request
def guard():
    if request.endpoint in ("login", "static"):
        return None
    if not session.get("auth"):
        if request.path.startswith("/api/"):
            return jsonify(error="Nie zalogowano"), 401
        return redirect(url_for("login"))
    if request.method == "POST":
        token = request.headers.get("X-CSRF") or request.form.get("csrf")
        if not token or not hmac.compare_digest(token, session.get("csrf", "")):
            abort(403)
    return None


# --- polecenia ---------------------------------------------------------------
def run(cmd, timeout=60):
    try:
        p = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout)
        return p.returncode, (p.stdout + p.stderr).strip()
    except subprocess.TimeoutExpired:
        return 124, "Przekroczono czas"
    except FileNotFoundError as e:
        return 127, str(e)


ACTIONS = {
    "start":      ("Start gry",          COMPOSE + ["up", "-d"]),
    "stop":       ("Stop gry",           COMPOSE + ["stop", "app"]),
    "restart":    ("Restart gry",        COMPOSE + ["restart", "app"]),
    "restart-db": ("Restart bazy",       COMPOSE + ["restart", "db"]),
    "rebuild":    ("Przebudowa i start", COMPOSE + ["up", "-d", "--build", "app"]),
    "backup":     ("Kopia bazy",         ["/bin/sh", str(BACKUP_SCRIPT)]),
}
_action = {"name": None, "label": None, "started": None, "finished": None, "code": None, "output": ""}
_action_lock = threading.Lock()


def _run_action(name):
    label, cmd = ACTIONS[name]
    env = dict(os.environ, VELDORIA_DIR=str(BASE))
    try:
        p = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, env=env)
        for line in p.stdout:
            _action["output"] = (_action["output"] + line)[-20000:]
        code = p.wait()
    except Exception as e:  # noqa: BLE001 — pokazujemy operatorowi, cokolwiek to jest
        _action["output"] += f"\n{e}"
        code = 1
    _action.update(code=code, finished=datetime.now().strftime("%H:%M:%S"))
    with open(BASE / "panel-actions.log", "a") as f:
        f.write(f"{datetime.now():%Y-%m-%d %H:%M:%S} {label} → kod {code}\n")
    _action_lock.release()


# --- status ------------------------------------------------------------------
def containers():
    code, out = run(COMPOSE + ["ps", "-a", "--format", "json"], timeout=20)
    result = {}
    if code == 0 and out:
        items = json.loads(out) if out.startswith("[") else [json.loads(l) for l in out.splitlines() if l.strip()]
        for c in items:
            result[c.get("Service")] = {"state": c.get("State"), "status": c.get("Status"),
                                        "health": c.get("Health", ""), "name": c.get("Name")}
    return result


def container_stats(names):
    if not names:
        return {}
    code, out = run(["docker", "stats", "--no-stream", "--format", "{{json .}}", *names], timeout=20)
    stats = {}
    if code == 0:
        for line in out.splitlines():
            try:
                s = json.loads(line)
                stats[s["Name"]] = {"cpu": s.get("CPUPerc"), "mem": s.get("MemUsage")}
            except (ValueError, KeyError):
                pass
    return stats


def game_stats():
    try:
        with urllib.request.urlopen(GAME_URL + "/api/auth/stats", timeout=3) as r:
            return json.loads(r.read())
    except Exception:  # noqa: BLE001 — gra nie odpowiada = po prostu brak danych
        return None


def host_stats():
    load = os.getloadavg()
    mem = {}
    for line in Path("/proc/meminfo").read_text().splitlines():
        k, v = line.split(":", 1)
        mem[k] = int(v.split()[0]) // 1024
    st = os.statvfs("/")
    return {"load": [round(x, 2) for x in load],
            "mem_used": mem["MemTotal"] - mem["MemAvailable"], "mem_total": mem["MemTotal"],
            "disk_free_gb": round(st.f_bavail * st.f_frsize / 1e9, 1),
            "disk_total_gb": round(st.f_blocks * st.f_frsize / 1e9, 1)}


def backups():
    BACKUP_DIR.mkdir(parents=True, exist_ok=True)
    files = sorted(BACKUP_DIR.glob("veldoria-*.sql.gz"), key=lambda p: p.stat().st_mtime, reverse=True)
    return [{"name": f.name, "size_kb": f.stat().st_size // 1024,
             "date": datetime.fromtimestamp(f.stat().st_mtime).strftime("%Y-%m-%d %H:%M")} for f in files]


# --- widoki ------------------------------------------------------------------
@app.route("/login", methods=["GET", "POST"])
def login():
    ip = request.remote_addr or "?"
    error = None
    if request.method == "POST":
        wait = locked_for(ip)
        if wait:
            error = f"Za dużo prób. Spróbuj za {wait // 60 + 1} min."
        elif check_password(request.form.get("password", "")):
            session.clear()
            session.permanent = True
            session["auth"] = True
            with _fails_lock:
                _fails.pop(ip, None)
            return redirect(url_for("index"))
        else:
            register_fail(ip)
            error = "Nieprawidłowe hasło"
    return render_template_string(LOGIN_HTML, error=error)


@app.route("/logout")
def logout():
    session.clear()
    return redirect(url_for("login"))


@app.route("/")
def index():
    return render_template_string(MAIN_HTML, csrf=csrf_token(), actions=ACTIONS)


@app.route("/api/status")
def api_status():
    c = containers()
    names = [v["name"] for v in c.values() if v.get("state") == "running"]
    return jsonify(containers=c, stats=container_stats(names), game=game_stats(),
                   host=host_stats(), backups=backups()[:15],
                   action={k: v for k, v in _action.items() if k != "output"})


@app.route("/api/action/<name>", methods=["POST"])
def api_action(name):
    if name not in ACTIONS:
        abort(404)
    if not _action_lock.acquire(blocking=False):
        return jsonify(error=f"Trwa już: {_action['label']}"), 409
    _action.update(name=name, label=ACTIONS[name][0], started=datetime.now().strftime("%H:%M:%S"),
                   finished=None, code=None, output="")
    threading.Thread(target=_run_action, args=(name,), daemon=True).start()
    return jsonify(ok=True)


@app.route("/api/action-log")
def api_action_log():
    return jsonify(_action)


@app.route("/api/logs")
def api_logs():
    service = request.args.get("service", "app")
    if service not in ("app", "db"):
        abort(400)
    lines = min(max(int(request.args.get("lines", 200)), 10), 2000)
    _, out = run(COMPOSE + ["logs", "--no-color", "--timestamps", "--tail", str(lines), service], timeout=20)
    return jsonify(log=out)


@app.route("/backups/<name>")
def download_backup(name):
    if not re.fullmatch(r"veldoria-\d{8}-\d{6}\.sql\.gz", name):
        abort(404)
    path = BACKUP_DIR / name
    if not path.exists():
        abort(404)
    return send_file(path, as_attachment=True)


@app.route("/settings", methods=["POST"])
def settings():
    cur, new, rep = (request.form.get(k, "") for k in ("current", "new", "repeat"))
    if not check_password(cur):
        msg = "Obecne hasło jest nieprawidłowe"
    elif len(new) < 10:
        msg = "Nowe hasło musi mieć co najmniej 10 znaków"
    elif new != rep:
        msg = "Hasła nie są identyczne"
    else:
        set_password(new)
        msg = "Hasło zmienione"
    return render_template_string(MAIN_HTML, csrf=csrf_token(), actions=ACTIONS, flash=msg)


# --- szablony ----------------------------------------------------------------
STYLE = """
<style>
:root{--bg:#0f1410;--card:#172019;--line:#2a3a2c;--fg:#e4ead8;--muted:#8fa08a;--gold:#d4a43a;
--ok:#4ade80;--bad:#f87171;--warn:#fbbf24}
*{box-sizing:border-box}body{margin:0;font:14px/1.5 system-ui,sans-serif;background:var(--bg);color:var(--fg)}
header{display:flex;justify-content:space-between;align-items:center;padding:14px 20px;border-bottom:1px solid var(--line)}
h1{font-size:18px;margin:0;color:var(--gold)}h2{font-size:14px;margin:0 0 10px;color:var(--muted);text-transform:uppercase;letter-spacing:.05em}
main{max-width:1100px;margin:0 auto;padding:20px;display:grid;gap:16px;grid-template-columns:repeat(auto-fit,minmax(320px,1fr))}
.card{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:16px}.wide{grid-column:1/-1}
.row{display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px dashed var(--line)}.row:last-child{border:0}
.big{font-size:28px;font-weight:700}.muted{color:var(--muted)}
.ok{color:var(--ok)}.bad{color:var(--bad)}.warn{color:var(--warn)}
button,.btn{background:#24321f;color:var(--fg);border:1px solid var(--line);border-radius:6px;padding:8px 12px;cursor:pointer;font:inherit;text-decoration:none}
button:hover{border-color:var(--gold)}button.danger{border-color:#5a2a2a}button:disabled{opacity:.5;cursor:wait}
.btns{display:flex;flex-wrap:wrap;gap:8px}
pre{background:#0a0d0a;border:1px solid var(--line);border-radius:6px;padding:10px;max-height:420px;overflow:auto;font-size:12px;white-space:pre-wrap;word-break:break-all;margin:0}
input{background:#0a0d0a;color:var(--fg);border:1px solid var(--line);border-radius:6px;padding:8px;width:100%;margin:4px 0 10px;font:inherit}
table{width:100%;border-collapse:collapse}td{padding:4px 0;border-bottom:1px dashed var(--line)}
.flash{background:#24321f;border:1px solid var(--gold);padding:10px;border-radius:6px;grid-column:1/-1}
</style>"""

LOGIN_HTML = """<!doctype html><html lang="pl"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>Veldoria Panel</title>""" + STYLE + """</head>
<body><main style="max-width:360px;display:block;margin-top:12vh"><div class="card">
<h1 style="margin-bottom:14px">⚔ Veldoria Panel</h1>
{% if error %}<p class="bad">{{ error }}</p>{% endif %}
<form method="post"><label>Hasło<input type="password" name="password" autofocus required></label>
<button type="submit" style="width:100%">Zaloguj</button></form></div></main></body></html>"""

MAIN_HTML = """<!doctype html><html lang="pl"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>Veldoria Panel</title>""" + STYLE + """</head>
<body><header><h1>⚔ Veldoria Panel</h1><a class="btn" href="/logout">Wyloguj</a></header>
<main>
{% if flash %}<div class="flash">{{ flash }}</div>{% endif %}
<div class="card"><h2>Gra</h2>
  <div class="big" id="game-state">…</div>
  <div class="row"><span>Online</span><b id="online">–</b></div>
  <div class="row"><span>Konta</span><b id="accounts">–</b></div>
  <div class="row"><span>Kontener gry</span><span id="app-status">–</span></div>
  <div class="row"><span>Baza danych</span><span id="db-status">–</span></div>
</div>
<div class="card"><h2>Zasoby</h2>
  <div class="row"><span>Gra CPU / RAM</span><span id="app-res">–</span></div>
  <div class="row"><span>Baza CPU / RAM</span><span id="db-res">–</span></div>
  <div class="row"><span>VPS load</span><span id="load">–</span></div>
  <div class="row"><span>VPS RAM</span><span id="mem">–</span></div>
  <div class="row"><span>Dysk wolny</span><span id="disk">–</span></div>
</div>
<div class="card"><h2>Sterowanie</h2>
  <div class="btns">
  {% for key, (label, _) in actions.items() %}
    <button data-action="{{ key }}" {% if key in ('stop','restart-db','rebuild') %}class="danger"{% endif %}>{{ label }}</button>
  {% endfor %}
  </div>
  <p class="muted" id="action-state" style="margin:12px 0 6px">Brak uruchomionych akcji</p>
  <pre id="action-log" style="max-height:200px;display:none"></pre>
</div>
<div class="card wide"><h2>Logi</h2>
  <div class="btns" style="margin-bottom:10px">
    <button data-logs="app">Gra</button><button data-logs="db">Baza</button>
    <label class="muted" style="display:flex;gap:6px;align-items:center"><input type="checkbox" id="follow" style="width:auto;margin:0"> odświeżaj co 5 s</label>
  </div>
  <pre id="logs">Wybierz źródło logów.</pre>
</div>
<div class="card"><h2>Kopie zapasowe bazy</h2>
  <p class="muted" style="margin-top:0">Automatycznie codziennie o 04:30, trzymane 30 najnowszych.</p>
  <table id="backups"></table>
</div>
<div class="card"><h2>Hasło panelu</h2>
  <form method="post" action="/settings"><input type="hidden" name="csrf" value="{{ csrf }}">
  <input type="password" name="current" placeholder="Obecne hasło" required>
  <input type="password" name="new" placeholder="Nowe hasło (min. 10 znaków)" required minlength="10">
  <input type="password" name="repeat" placeholder="Powtórz nowe hasło" required>
  <button type="submit">Zmień hasło</button></form>
</div>
</main>
<script>
const CSRF = {{ csrf|tojson }};
const $ = id => document.getElementById(id);
const CONFIRM = {stop:'Zatrzymać grę? Gracze zostaną rozłączeni.', restart:'Zrestartować grę?',
  'restart-db':'Zrestartować bazę? Gra na chwilę straci połączenie.', rebuild:'Przebudować obraz i uruchomić grę ponownie?'};
function stateTxt(c){ if(!c) return '<span class="bad">brak</span>';
  const cls = c.state==='running' ? (c.health && c.health!=='healthy' ? 'warn':'ok') : 'bad';
  return `<span class="${cls}">${c.state}${c.health?' ('+c.health+')':''}</span>`; }
async function refresh(){
  const r = await fetch('/api/status'); if(r.status===401){location='/login';return;}
  const s = await r.json(), app = s.containers.app, db = s.containers.db;
  const up = s.game !== null;
  $('game-state').innerHTML = up ? '<span class="ok">● Działa</span>' : '<span class="bad">● Nie odpowiada</span>';
  $('online').textContent = up ? s.game.online : '–'; $('accounts').textContent = up ? s.game.total : '–';
  $('app-status').innerHTML = stateTxt(app); $('db-status').innerHTML = stateTxt(db);
  const st = n => { const x = n && s.stats[n.name]; return x ? `${x.cpu} / ${x.mem.split('/')[0]}` : '–'; };
  $('app-res').textContent = st(app); $('db-res').textContent = st(db);
  $('load').textContent = s.host.load.join(' / ');
  $('mem').textContent = `${s.host.mem_used} / ${s.host.mem_total} MB`;
  $('disk').textContent = `${s.host.disk_free_gb} / ${s.host.disk_total_gb} GB`;
  $('backups').innerHTML = s.backups.length ? s.backups.map(b =>
    `<tr><td><a class="btn" style="padding:2px 8px" href="/backups/${b.name}">⬇</a> ${b.date}</td><td class="muted" style="text-align:right">${b.size_kb} KB</td></tr>`).join('')
    : '<tr><td class="muted">Brak kopii</td></tr>';
  const a = s.action;
  if (a.name) $('action-state').innerHTML = a.finished
    ? `${a.label}: zakończono ${a.finished} — ${a.code===0?'<span class="ok">OK</span>':'<span class="bad">błąd (kod '+a.code+')</span>'}`
    : `<span class="warn">${a.label}: trwa (od ${a.started})…</span>`;
  document.querySelectorAll('[data-action]').forEach(b => b.disabled = !!(a.name && !a.finished));
  if (a.name && !a.finished) pollAction();
}
let polling = false;
async function pollAction(){ if(polling) return; polling = true;
  const log = $('action-log'); log.style.display='block';
  while(true){ const a = await (await fetch('/api/action-log')).json();
    log.textContent = a.output || '…'; log.scrollTop = log.scrollHeight;
    if(a.finished){ break; } await new Promise(r=>setTimeout(r,1000)); }
  polling = false; refresh(); }
document.querySelectorAll('[data-action]').forEach(b => b.onclick = async () => {
  const name = b.dataset.action; if (CONFIRM[name] && !confirm(CONFIRM[name])) return;
  const r = await fetch('/api/action/'+name, {method:'POST', headers:{'X-CSRF':CSRF}});
  if (!r.ok) { alert((await r.json()).error || 'Błąd'); return; }
  refresh(); pollAction(); });
let logSrc = null;
async function loadLogs(){ if(!logSrc) return;
  const r = await (await fetch('/api/logs?service='+logSrc+'&lines=300')).json();
  const p = $('logs'); const bottom = p.scrollTop + p.clientHeight >= p.scrollHeight - 20;
  p.textContent = r.log || '(pusto)'; if(bottom) p.scrollTop = p.scrollHeight; }
document.querySelectorAll('[data-logs]').forEach(b => b.onclick = () => { logSrc = b.dataset.logs; loadLogs(); });
setInterval(()=>{ if($('follow').checked) loadLogs(); }, 5000);
refresh(); setInterval(refresh, 10000);
</script></body></html>"""
