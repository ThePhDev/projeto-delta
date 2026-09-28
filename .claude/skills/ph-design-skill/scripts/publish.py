"""Publish a local site through a Cloudflare quick tunnel and print the public URL.

usage: python publish.py DIR_OR_PORT        # serve a folder (e.g. dist/) or tunnel an existing port
       python publish.py stop               # stop servers/tunnels started by this script

Needs cloudflared on PATH (or ~/bin). No account needed; the URL changes every run and
lives while the processes run. Vite dev/preview must allow the host:
  preview/server: { allowedHosts: [".trycloudflare.com"] }
"""
import json, os, re, shutil, socket, subprocess, sys, tempfile, time
from pathlib import Path

STATE = Path(tempfile.gettempdir()) / "publish-tunnels.json"
FLAGS = 0x00000008 | 0x00000200 if os.name == "nt" else 0  # DETACHED_PROCESS | NEW_PROCESS_GROUP

def free_port():
    s = socket.socket(); s.bind(("127.0.0.1", 0)); p = s.getsockname()[1]; s.close(); return p

def spawn(cmd, **kw):
    return subprocess.Popen(cmd, creationflags=FLAGS, stdin=subprocess.DEVNULL, **kw)

def load():
    return json.loads(STATE.read_text()) if STATE.exists() else []

def stop():
    for pid in load():
        subprocess.run(["taskkill", "/F", "/T", "/PID", str(pid)] if os.name == "nt" else ["kill", str(pid)],
                       capture_output=True)
    STATE.unlink(missing_ok=True); print("stopped")

def main():
    target = sys.argv[1] if len(sys.argv) > 1 else "."
    if target == "stop":
        return stop()
    pids = load()
    if target.isdigit():
        port = int(target)
    else:
        port = free_port()
        srv = spawn([sys.executable, "-m", "http.server", str(port), "--bind", "127.0.0.1",
                     "--directory", str(Path(target).resolve())],
                    stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        pids.append(srv.pid)
    exe = shutil.which("cloudflared") or str(Path.home() / "bin" / "cloudflared.exe")
    log = Path(tempfile.gettempdir()) / f"cloudflared-{port}.log"
    with open(log, "w") as fh:
        cf = spawn([exe, "tunnel", "--url", f"http://localhost:{port}"], stdout=fh, stderr=fh)
    pids.append(cf.pid); STATE.write_text(json.dumps(pids))

    url = None
    for _ in range(60):
        time.sleep(1)
        m = re.search(r"https://[a-z0-9-]+\.trycloudflare\.com", log.read_text(errors="ignore"))
        if m: url = m.group(0); break
    if not url:
        sys.exit(f"no tunnel URL after 60s; see {log}")

    # Local DNS caches the new host as missing for a while; verify through Cloudflare DoH instead.
    code = "000"
    for _ in range(20):
        r = subprocess.run(["curl", "-s", "-o", os.devnull, "-w", "%{http_code}", "--max-time", "15",
                            "--doh-url", "https://1.1.1.1/dns-query", url + "/"], capture_output=True, text=True)
        code = r.stdout.strip()
        if code == "200": break
        time.sleep(3)
    print(url)
    print(f"status {code} (port {port})" + ("" if code == "200" else " -> 403 usually means allowedHosts is missing"))

if __name__ == "__main__":
    main()
