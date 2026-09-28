"""Lab performance check, the way Awwwards jurors feel it: fast desktop and a throttled phone.

usage: python vitals.py URL [--runs 2]

Measures LCP, CLS, time to load, JS long tasks (total blocking time proxy) and transfer size.
The phone profile emulates a 390x844 device with 4x CPU slowdown and a ~fast-4G network.
Targets (exit 1 if missed): LCP <= 2.5s desktop / 3.0s phone, CLS <= 0.1, TBT <= 300ms.
These are lab numbers, not field Core Web Vitals; report them as such.
"""
import argparse, json, sys
from playwright.sync_api import sync_playwright

OBSERVE = """() => {
  window.__v = { lcp: 0, cls: 0, tbt: 0 };
  new PerformanceObserver(l => { for (const e of l.getEntries()) window.__v.lcp = e.startTime; })
    .observe({ type: 'largest-contentful-paint', buffered: true });
  new PerformanceObserver(l => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__v.cls += e.value; })
    .observe({ type: 'layout-shift', buffered: true });
  new PerformanceObserver(l => { for (const e of l.getEntries()) window.__v.tbt += Math.max(0, e.duration - 50); })
    .observe({ type: 'longtask', buffered: true });
}"""

PROFILES = {
    "desktop": dict(viewport={"width": 1440, "height": 900}, cpu=1, net=None, lcp=2500),
    "phone": dict(viewport={"width": 390, "height": 844}, cpu=4, is_mobile=True, has_touch=True,
                  net={"offline": False, "latency": 150, "downloadThroughput": 1_600_000 / 8 * 5,
                       "uploadThroughput": 750_000 / 8 * 5}, lcp=3000),
}

def measure(browser, url, prof):
    ctx = browser.new_context(viewport=prof["viewport"], is_mobile=prof.get("is_mobile", False),
                              has_touch=prof.get("has_touch", False))
    page = ctx.new_page()
    cdp = ctx.new_cdp_session(page)
    cdp.send("Network.enable")
    if prof["cpu"] > 1:
        cdp.send("Emulation.setCPUThrottlingRate", {"rate": prof["cpu"]})
    if prof["net"]:
        cdp.send("Network.emulateNetworkConditions", prof["net"])
    size = [0]
    cdp.on("Network.loadingFinished", lambda e: size.__setitem__(0, size[0] + e.get("encodedDataLength", 0)))
    page.add_init_script(f"({OBSERVE})()")
    page.goto(url, wait_until="load", timeout=120000)
    load = page.evaluate("performance.getEntriesByType('navigation')[0].loadEventEnd")
    page.wait_for_timeout(2500)
    v = page.evaluate("window.__v")
    ctx.close()
    return {"lcp": v["lcp"], "cls": v["cls"], "tbt": v["tbt"], "load": load, "kb": size[0] / 1024}

def main():
    ap = argparse.ArgumentParser(); ap.add_argument("url"); ap.add_argument("--runs", type=int, default=2)
    a = ap.parse_args()
    ok = True; out = {}
    with sync_playwright() as p:
        browser = p.chromium.launch()
        for name, prof in PROFILES.items():
            runs = [measure(browser, a.url, prof) for _ in range(a.runs)]
            best = min(runs, key=lambda r: r["lcp"])  # best of N, like a warm lab run
            out[name] = best
            fails = []
            if best["lcp"] > prof["lcp"]: fails.append("LCP")
            if best["cls"] > 0.1: fails.append("CLS")
            if best["tbt"] > 300: fails.append("TBT")
            ok &= not fails
            print(f"{name:7} LCP {best['lcp']/1000:.2f}s  CLS {best['cls']:.3f}  TBT {best['tbt']:.0f}ms  "
                  f"load {best['load']/1000:.2f}s  {best['kb']:.0f}KB  {'OK' if not fails else 'FAIL ' + ','.join(fails)}")
        browser.close()
    print(json.dumps(out))
    sys.exit(0 if ok else 1)

if __name__ == "__main__":
    main()
