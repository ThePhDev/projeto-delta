"""Screenshot a page at several viewports and audit responsiveness.

usage: python shoot.py URL OUTDIR [--viewports desktop,mobile] [--full] [--settle MS]

Viewports: desktop 1440x900, laptop 1280x800, tablet 768x1024, mobile 390x844, small 360x740.
Before each shot the page is scrolled top->bottom->top (fires scroll-triggered
animations), then CSS/WAAPI animations are finished so shots are deterministic.
Writes OUTDIR/<viewport>.png and OUTDIR/report.json; prints a short summary.
"""
import argparse, json, sys
from pathlib import Path
from PIL import Image
from playwright.sync_api import sync_playwright

VIEWPORTS = {
    "desktop": (1440, 900), "laptop": (1280, 800), "tablet": (768, 1024),
    "mobile": (390, 844), "small": (360, 740),
}

AUDIT_JS = """(isMobile) => {
  const vw = document.documentElement.clientWidth, out = [];
  if (document.documentElement.scrollWidth > vw + 1)
    out.push(`horizontal scroll: page is ${document.documentElement.scrollWidth}px wide on a ${vw}px viewport`);
  const seen = new Set();
  // Overflow inside a clipping/scrolling ancestor (marquees, carousels) is intentional.
  const clipped = el => { for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
    const o = getComputedStyle(p).overflowX; if (o !== 'visible') return true; } return false; };
  for (const el of document.querySelectorAll('body *')) {
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || cs.position === 'fixed') continue;
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) continue;
    const tag = el.tagName.toLowerCase() + (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\\s+/)[0] : '');
    if (r.right > vw + 1 && !el.closest('svg, [data-allow-overflow]') && !clipped(el)) {
      const k = 'ovf' + tag; if (!seen.has(k)) { seen.add(k); out.push(`overflows right edge by ${Math.round(r.right - vw)}px: ${tag}`); }
    }
    const direct = [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim());
    if (direct && parseFloat(cs.fontSize) < 12) {
      const k = 'fs' + tag; if (!seen.has(k)) { seen.add(k); out.push(`text under 12px (${cs.fontSize}): ${tag}`); }
    }
    if (isMobile && el.matches('a, button, [role=button], input, select, textarea') && (r.width < 40 || r.height < 40)) {
      const k = 'tap' + tag; if (!seen.has(k)) { seen.add(k); out.push(`tap target ${Math.round(r.width)}x${Math.round(r.height)} (<40px): ${tag}`); }
    }
    if (el.tagName === 'IMG' && !el.hasAttribute('alt')) out.push(`img without alt: ${el.src.slice(-40)}`);
  }
  return out.slice(0, 40);
}"""

def settle(page, ms, scroll):
    if scroll:
        h = page.evaluate("document.documentElement.scrollHeight")
        for y in range(0, h, 400):
            page.evaluate(f"window.scrollTo(0,{y})"); page.wait_for_timeout(60)
        page.evaluate("window.scrollTo(0,0)")
    page.wait_for_timeout(ms)
    page.evaluate("document.getAnimations().forEach(a => { try { a.finish() } catch (e) {} })")
    # JS-driven motion (GSAP etc.) isn't reachable via getAnimations: wait until the DOM
    # stops changing visually. Canvas/video keep moving forever, so hide them while checking.
    page.add_style_tag(content="canvas,video{visibility:hidden!important}")
    page.evaluate("document.head.lastElementChild.id='__settle'")
    prev = None
    for _ in range(40):
        cur = page.screenshot()
        if cur == prev:
            break
        prev = cur; page.wait_for_timeout(300)
    page.evaluate("document.getElementById('__settle').remove()")
    page.wait_for_timeout(150)

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("url"); ap.add_argument("outdir")
    ap.add_argument("--viewports", default="desktop,mobile",
                    help="names from VIEWPORTS or custom WxH, e.g. 1920x1080 (use the reference's width)")
    ap.add_argument("--full", action="store_true", help="full-page screenshot instead of first screen")
    ap.add_argument("--settle", type=int, default=1500, help="ms to wait for intro animations")
    ap.add_argument("--no-scroll", action="store_true",
                    help="skip the scroll pass (use for first-screen diffs when scroll-linked effects don't reset)")
    a = ap.parse_args()
    out = Path(a.outdir); out.mkdir(parents=True, exist_ok=True)
    report = {}
    with sync_playwright() as p:
        browser = p.chromium.launch()
        for name in a.viewports.split(","):
            w, h = VIEWPORTS[name] if name in VIEWPORTS else map(int, name.lower().split("x"))
            mobile = w < 768
            ctx = browser.new_context(viewport={"width": w, "height": h}, device_scale_factor=1,
                                      is_mobile=mobile, has_touch=mobile)
            page = ctx.new_page(); errors = []
            page.on("pageerror", lambda e: errors.append(str(e)))
            page.on("console", lambda m: m.type == "error" and errors.append(m.text))
            page.goto(a.url, wait_until="networkidle")
            settle(page, a.settle, not a.no_scroll)
            page.screenshot(path=str(out / f"{name}.png"), full_page=a.full)
            # token-cheap copy for viewing: 1000px wide JPEG (read this, not the PNG)
            im = Image.open(out / f"{name}.png").convert("RGB")
            im.thumbnail((1000, 4000)); im.save(out / f"{name}.view.jpg", quality=72)
            issues = page.evaluate(AUDIT_JS, mobile)
            report[name] = {"size": [w, h], "errors": errors[:10], "issues": issues}
            ctx.close()
        browser.close()
    (out / "report.json").write_text(json.dumps(report, indent=2), encoding="utf-8")
    bad = 0
    for name, r in report.items():
        n = len(r["errors"]) + len(r["issues"]); bad += n
        print(f"{name} {r['size'][0]}x{r['size'][1]}: {n} problem(s)")
        for line in (r["errors"] + r["issues"])[:8]:
            print("   -", line)
    sys.exit(1 if bad else 0)

if __name__ == "__main__":
    main()
