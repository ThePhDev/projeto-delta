---
name: ph-design-skill
description: Use when creating, redesigning, styling, cloning or reviewing ANY user-facing interface, with or without a reference image. Covers websites, landing pages, portfolios, web apps, mobile app screens, PWAs, dashboards, study apps, HTML artifacts, single components, small visual tweaks to one element ("make this button prettier", "deixa mais bonito"), and reference images or screenshots to rebuild ("copy this", "clone this design", "pixel perfect", "idêntico", "transforma essa imagem em site/app"). Load it first, before impeccable or frontend-design, and before writing the first line of UI code.
---

# PH_Design_Skill

## Overview
This is the user's house style for anything with a UI, with or without a reference image. Every project gets a deliberate design (or a measured pixel-perfect copy of the reference), equal care on desktop and mobile, motion that feels crafted (Emil Kowalski's bar), human copy, a quality **gauntlet**, and a preview link. It doesn't matter if the project is small.

**Done = one full gauntlet round with zero failures + a working public preview link.** Not "looks close".

## One-shot contract (read first, every build)
The user's goal: "build it for business X from these references" and the site ships complete in one pass. The user reviews the result, so the process can't be used to cut corners. Every item below is **mandatory**. Write each one's status in `qa/gauntlet.md` before delivery (done / N/A plus the reason):
1. **Style source:** the user's own Figma references (`Downloads\Referencias`, see prompt-kit §000) set the finish level. A cloned image only gives layout and palette.
2. **Storytelling:** one continuous story. Each scene **turns into** the next (shared-element morph, a camera move, colour wash, an object that carries over), never stacked sections with hard cuts. Sketch the story in 5–8 beats in `direction.md` first.
3. **Construction:** nothing is in place on arrival. An intro builds the page, and each scene assembles as it enters.
4. **Motion design assets:** use HyperFrames (`/hyperframes`, `/motion-graphics`; for a launch or brand film follow `no-slop-motion`, and borrow its story thread, world rules, brand motifs and banned-defaults list for the site's storytelling too) for the intro, loaders, transitions and animated 2D/3D icons where video beats code. Code animation stays GSAP/three.js.
5. **Interactivity:** every hero object and icon reacts to the pointer on desktop and to the finger on phones (drag, tilt, tap bursts), not only on hover.
6. **Mobile = app:** a bottom tab bar, detailed icons, app-like sheets and gestures, and an identity that adapts per screen (not a squeezed desktop).
7. **Editorial type:** mix families and styles inside a single phrase (upright serif + italic + sans, as in "Ideas / that *move* the / World"), with deliberate framing, distortion and spacing. It should look like a Figma/Twitter design template, not a component library.
8. **Colour and light:** build the palette with the `color-palette` and `color-expert` skills (OKLCH ramps, no generic AI hues). Add a lighting layer on top: bloom and glow, light rays, grain, colour washes between scenes.
9. **3D finish:** follow the `threejs-*` skills. Use a studio HDRI, real glass (transmission), contact shadows, textured and shader-driven surfaces, and solid modelled pieces (never clipped shells). Use FLORA-generated GLB when procedural modelling can't reach the reference.
10. **Copy:** every visible line goes through `humanizer`. No exceptions, including cloned text that you adapt.
11. **Review:** run the gauntlet with critics every time, plus an overlap check (no text on text, no text over busy art without a scrim) at 1920, 1440, 1280, 390 and 360 widths, and a recorded scroll video watched before sending.
12. **Show the product, not a metaphor** (from Kirill's Sider before/after, 2026-09-27): feature cards hold a live mini-scene of the product (window chrome, chips, a result card, the model or tool that did it) instead of an abstract line icon. Headlines carry **inline icon chips** between words. Each item gets its own colour identity (icon, chip, tinted glow in the card corner), and cards have layered depth: a floating mockup over a soft tinted field.
13. **UI taste pass:** run the `ui-taste` skill (Uizze playbooks: new-work, craft, polish, overdrive, audit) as the last design pass, and `ios-design` for app screens and the phone layout.

## Token economy (lean run, same quality bar)
**Size the run first** and write the tier at the top of `qa/gauntlet.md`:
| Tier | When | Process |
|---|---|---|
| **S** | Tweak to one component or a visual fix in an existing UI | No prompt pack and no subagents. Checks: `impeccable detect`, `shoot.py --viewports desktop,mobile`, and only the matching `vendor/better/*` file. Label it self-review. |
| **M** | One page or one screen set | Prompt pack. Gates 1–7, with **one combined critic subagent** covering gates 2, 5 and 7 in a single call. Jury of 3 (not 5) unless the user asks for the full jury. |
| **L** | Full site or app, or anything delivered to a client | The full process and the full 5-juror jury. |
- **Read by section, never whole.** `taste-reference.md` (16k words), `react-bits-catalog.md`, the Impeccable references and `vendor/` are loaded only at the step that names them. Grep the heading, then Read with offset/limit. Never re-read a file you already have.
- **Numbers before pixels.** Decide from `diff.py`, `shoot.py` `report.json`, `vitals.py` and `impeccable detect` output first. Look at images only where the numbers point: open the `*.view.jpg` copies (1000px wide, which `shoot.py` writes), and use `palette.py --crop` for details. Never view full-resolution page PNGs.
- **Lean subagents.** Pass file paths, not pasted content. Ask for findings only, in the `ID | gate | location | severity | evidence | fix` format, max ~250 words. Run critics and jurors on `sonnet` and mechanical checks on `haiku`. Put independent critics in one message so they run in parallel.
- **Batch the work.** Collect every finding of a round, fix them in one pass of small `Edit`s, rebuild once, and re-check only the failed gates plus anything the fix could affect.
- **Write once, point after.** `spec.md`, `direction.md` and `prompt-pack.md` are written once and referenced by path in later steps and prompts.
- **Short user updates.** 1–2 lines per milestone; the long report is sent once, at delivery.

## Tools (`python ~/.claude/skills/ph-design-skill/scripts/<script>`)
| Script | Use |
|---|---|
| `palette.py IMG [--at X,Y] [--crop X0,Y0,X1,Y1 out.png [--scale 1]]` | size, dominant hex colors, exact pixel colors, 2x zoom crops, asset extraction |
| `shoot.py URL OUTDIR --viewports desktop,laptop,tablet,mobile,small,1920x1080 [--full] [--no-scroll]` | settled screenshots + responsive audit (`report.json`, exit 1 on issues). Named: desktop 1440, laptop 1280, tablet 768, mobile 390, small 360; any `WxH` works |
| `diff.py REF SHOT OUT [--exclude X0,Y0,X1,Y1 ...]` | match %, height drift, worst grid cells, heatmap + side-by-side |
| `publish.py DIST_DIR_or_PORT` / `publish.py stop` | Cloudflare quick tunnel, prints verified public URL |
| `vitals.py URL` | lab LCP, CLS, TBT, load time and weight on a fast desktop and a throttled phone (4x CPU, 4G); exit 1 when targets are missed |
| `impeccable detect --json <src>` (`~/.claude/skills/impeccable/scripts/impeccable.cmd` on Windows) | Impeccable's static anti-pattern detector: AI-slop signatures and quality problems, with file and line |

Work in `C:\Users\amigi\ClaudeTelegram\sites\<name>\` (Vite + TS; GSAP for motion). Keep `ref/` (reference, if any) and `qa/` (spec, shots, diffs, gauntlet log).

## Route
- **Reference image or screenshot** → Path A.
- **No reference** → Path B.
- **Existing site or app to improve** → first run the Redesign Protocol (taste §11: detect the mode, audit before touching, preservation rules), then Path B from the Direction step onward.
Both paths then share Taste, Mobile, Motion, Copy, Gauntlet and Deliver.

## Mode and craft floor (from Impeccable, always on)
- **Pick the mode per surface** (not per product) and write it in `spec.md` or `direction.md`:
  - **Persuade:** landing pages, marketing, pricing.
  - **Experience:** portfolios, showcases.
  - **Read:** docs, articles, study material.
  - **Operate:** apps, dashboards, tools.
  The mode sets the motion budget: Persuade and Experience get the cinematic directive; Operate and Read put scanability and consistency first, with brand in the precise details.
- **Before the first UI edit**, read `~/.claude/skills/impeccable/reference/craft-floor.md` and build to it.
  - *Verify* list: contrast, depth, spacing, type measure and tracking, one authored motion moment instead of identical entrances, all states, **themed browser surfaces** (selection, caret, scrollbars, focus rings, underline offset, tabular numerals) and copy.
  - *Refuse* list: eyebrow/kicker labels above headings, gradient text, same-size icon cards as the page structure, hero-metric template, decorative glass, colored side borders, costume monospace, emoji icons, fake grid backgrounds.
- **Polish layer: exact values from Emil Kowalski and Jakub Krehel, always on.** Read [vendor/emil/SKILL.md](vendor/emil/SKILL.md) (design-engineering philosophy: the invisible details, when to animate, component polish) and `vendor/better/*` by topic, **only the file for the step at hand**:
  - `better-ui`: concentric radius (outer = inner + padding), optical alignment, shadows for elevation and borders for structure, icon swaps (scale 0.25→1, opacity 0→1, blur 4px→0), 1px image outlines at 10% black or white, `scale(0.96)` on press, subtle exits, transitions named per property, no transitions during a theme switch.
  - `better-typography`: scale, wrapping, OpenType and tabular numbers.
  - `better-colors`: palette generation, OKLCH tokens and contrast.
  - `better-layout`: grouping, alignment and progressive disclosure.
  - `better-accessibility`: focus, hit areas, ARIA and reduced motion.
  - `better-writing`: product microcopy, used alongside humanizer.
  - `break`: renders a component in every state and scenario; use it for the gate 3/7 stress test.
  - `interface-review`: the review format for the combined critic.
  - `explain-interface/from-an-image.md`: decomposing a reference in Path A step 1.
  For simple interactive state changes (hover, press, open/close), use CSS transitions, which are interruptible. The pure-function-of-time rule in motion-craft.md is for choreography, scroll scenes and reels.
- **Product and UX layer: CodeMakers-Design by Bueno / Code Makers** (local only in `vendor/codemakers/`, gitignored; it has no license, so it is never published). Use it when the job has real product behavior. Open `vendor/codemakers/INDEX.md` for the map, then **one chapter at a time**:
  - `references/component-cookbook.md`: 36 component contracts with every state (rest, hover, focus, pressed, disabled, loading, empty, error, success). Use it on every interactive component in gate 3/7.
  - `forms-workflows.md`: validation, multi-step forms, autosave, recovery.
  - `product-playbooks.md`: 12 product types.
  - `layout-recipes.md`: 14 page structures.
  - `visual-debugging.md`: symptom, cause, fix.
  - `responsive-adaptation.md` and `interaction-accessibility.md`.
  - Studies (Apple, BMW, Air, Slush, LUNCH, Flying Papers) via `reference-synthesis.md`. Read `reference-normalization.md` before reusing their tokens.
  - Search the library (32 styles, 24 palettes, 24 type pairs, 24 patterns): `python vendor/codemakers/scripts/search_design.py "<query>" --domain styles|palettes|typography|patterns|studies`.
  - Check contrast: `python vendor/codemakers/scripts/contrast_check.py "#fg" "#bg"`.
  - Its honesty rule also applies here: no invented testimonials, metrics, clients or scarcity; demo data is labeled as demo.
- **The brief wins:** pinned fonts, palettes and eras beat any default here. Refining keeps the current identity; a redesign replaces it completely, so never polish the look you're discarding.

## Taste layer (the user's original tasteskill, always on)
[taste-reference.md](taste-reference.md) is the user's own anti-slop design skill. Read the named sections when the step comes up; don't load it all at once.
1. **Design Read + dials before building** (§0–1). Write one line with the design read and set `DESIGN_VARIANCE / MOTION_INTENSITY / VISUAL_DENSITY`. The baseline is **8 / 10 / 4**. Infer variance and density from the brief; motion stays at 10 unless the user or accessibility says otherwise. Record them in `spec.md` or `direction.md`.
2. **Brief names a design system** (Material, Fluent, Carbon, Radix, shadcn, Primer, GOV.UK, USWDS, Polaris, Atlassian, Bootstrap): use the official packages (§2 and Appendix A). Don't imitate them by hand.
3. **Cinematic directive for sites, portfolios and marketing pages** (§5.E–5.G): GSAP-led choreography like a motion-design video, a **custom animated SVG cursor** on fine-pointer desktops that **still looks like a pointer arrow** (brand-styled arrow, tip = hotspot, with effects around it such as a trail, click ripple, press scale, a hover label chip and magnetic pull; never a dot, blob or circle; see the §5.F PH override), and **every visible SVG animated with intent**. A generic entrance repeated everywhere does not count. The Motion budget table below still governs frequently used controls.
4. **Hard rules during the build:** layout discipline (§4.7), page theme lock and dark mode (§4.11, §8), and performance and accessibility guardrails (§6).
5. **AI tells are banned** (§9), including the **em-dash ban** (§9.G) in all UI text, "Jane Doe" placeholder content, and fake social proof.
6. **Final pre-flight** (§14) runs as the checklist inside the gauntlet.

## Path A — rebuild a reference, pixel by pixel
Eyeballing gets you ~85%. The last 15% only comes from measuring.
1. **Read the reference like a spec.** Run `palette.py`, then crop and zoom every region (nav, hero, cards, footer). Write `qa/spec.md` with: canvas width, grid/columns, spacing scale, colors (hex), type (sizes, weights, line-heights, letter-spacing), radii, shadows, icons and images. Use the real text from the image, and only invent text where the image has none. Fonts: see Type.
   **Photos, illustrations and logos:** use the user's own asset if they have one. **Never crop art out of the reference** (the user rejected it: crops look pasted, break the atmosphere and freeze the page). Recreate every illustration, 3D object and painted backdrop in code, with the same light and palette and an idle loop: three.js for objects (one shared renderer), a fragment shader for painted scenes (landscapes, fog, light), layered SVG for flat art. The only exceptions are real photos of the client's business (labeled placeholders until they arrive) and logos. Never grab random web images.
2. **Decide the target.** The reference is a composition, not a fixed width: the build is **fluid and full-bleed on every screen** (vw/svh/clamp, no max-width column), and each section becomes a **scene** (sticky/pinned, scroll-driven choreography, an intro that constructs the page). Copying the static layout 1:1 at the reference's pixel width was rejected as "everything already in place".
    For a desktop reference, build that width first and design the mobile version (see Mobile). A phone-screen reference is an **app**: 390px, `100dvh`, safe areas, bottom nav, 44px touch targets. Give it its own desktop layout, don't stretch the phone screen. If the user sends phone mockups, follow them screen by screen.
3. **Static clone first, no motion.** Use semantic HTML, CSS variables from the spec, `clamp()` type and a real grid.
4. **Measure loop.** `shoot.py --viewports <refW>x<refH-or-900> --no-scroll` (or `--full` for a full-page reference) at the **reference's exact width**. Never diff a 1440 shot against a 1920 reference. Then `diff.py` → open `-side.png` → fix the **worst cell** first. Canvas, WebGL, video and swapped photos go in `--exclude`. Repeat until **match ≥ 97%**, height drift ≤ 8px, and no worst cell > 10%.
5. Continue with Mobile → Motion (the final frame must re-pass step 4) → Copy (text copied verbatim from the reference stays as-is) → Gauntlet → Deliver.

## Path B — design from scratch
0. **Prompt pack first (always, for sites and apps, no exceptions).** Research the business, then follow [prompt-kit.md](prompt-kit.md): the concept plus the desktop and mobile prompts that generate **Figma/Dribbble-grade screens with labeled image placeholders instead of photos**, an owned palette and typography, color bands per section and vector/3D illustration with depth. **Send it and stop until the user answers.** They generate the images and send them back → **Path A** on those images (placeholders become the client's real photos); or they reply "build" → continue below, using the pack as the direction. Having real client photos is no reason to skip it. Skip it only for small tweaks to an existing UI.
1. **Direction.** Before coding, write 5 lines in `qa/direction.md`: audience, mood (3 adjectives), palette (hex), type pairing, and one signature idea (the thing people remember). Use `frontend-design` and `impeccable` to pick a direction that isn't templated. Offer 2-3 directions only when the user asks to compare; `prototype` renders them side by side.
2. Build desktop and mobile together (see Mobile). Then Motion → Copy → Gauntlet (gate 1 = "matches direction.md"; gate 2 = a critic zooming on spacing rhythm, alignment, radii, shadows and icon weight) → Deliver.

## Type (both paths)
**Don't start with Google Fonts.** Identify the real typeface: use WhatTheFont or the Font Squirrel/Fontspring Matcherator on a crop. Search **https://www.dafont.com/pt/** first (the user's favorite source), then the foundry's own site, Fontshare, Font Squirrel or the designer's site. Google Fonts is only a fallback. Many dafont fonts are personal-use only: check the license and tell the user. Self-host the files as woff2 in `assets/fonts` with `@font-face`. With a reference, render 2-3 candidates with the same heading text, diff them against the crop, and keep the lowest delta. Check glyph coverage for everything the content needs: accents, Ω/Δ/Σ, math symbols. Use one family per role (display, body, labels/data), the same everywhere.

## Mobile (both paths, always)
**Mobile gets full care every time, even when the reference only shows a desktop.** Plan the 390px version in `qa/spec.md` or `direction.md` before coding: header, navigation, hero, grids, cards, forms and footer. Keep the same identity, illustrations, type hierarchy and spacing rhythm, and never just shrink or stack. Everything must look regular and tidy: consistent gutters, aligned edges, even spacing, centered where it makes sense, otherwise clearly on a grid. For apps and PWAs apply `mobile-native`: safe areas, `100dvh`, no tap flash or sticky hover, inputs ≥16px. Verify with `shoot.py --viewports tablet,mobile,small --full`: fix every report issue and look at each screenshot.

## Content, space and section flow (both paths)
- **All the business, little on screen.** Research everything true about the business (services, spaces, capacity, prices if public, hours, address, policies, FAQs, reviews) and give every fact a home. The visible surface stays minimal: a headline, one line and one action per section. The rest lives behind interaction: "+" hotspots on the illustration, expandable cards, tabs, accordions, drawers and sheets that open with animation (height via `grid-template-rows`, content with blur/opacity, focus moved inside, Escape closes). Nothing essential may exist only behind hover.
- **Space.** Sections breathe: 160–240px between them on desktop and 96–128px on phones, with more space above a heading than below it. One focal element per viewport.
- **Color flow.** Each section has its own color band from the palette, and the band changes as you scroll: the background color is interpolated by a ScrollTrigger between neighbors, or the edge between two bands is a wipe, curve or clip-path reveal. Text and UI colors swap with the band so contrast stays AA. The transition is part of the choreography, not a hard cut.

## Illustration and SVG standard (both paths)
- SVGs are **illustrations, not icons blown up**: several layers, a single light direction, gradients for volume, soft shadow shapes, highlights and rim light, and depth through overlap, scale and atmospheric tint (far = lighter, bluer). Build them with `<linearGradient>`/`<radialGradient>`, `<filter>` for soft shadows only when cheap, and grouped layers (`sky`, `far`, `mid`, `near`, `light`).
- **Some elements in 3D**: three.js (low-poly, flat-shaded or toon, same palette and light) or CSS 3D/isometric layers, lazy-loaded and paused off screen.
- **Continuous loops like a GIF**: every illustration has at least one seamless idle loop (leaves swaying, water rippling, sun rays turning, clouds drifting, a 3D object rotating or bobbing). Loops use `repeat: -1` with matching first and last frames (or yoyo), run on transform/opacity, pause when off screen or the tab is hidden, and stop under `prefers-reduced-motion` (show the rest pose).
- Detail goes where the eye lands: the hero and the signature illustration get the richest layers; secondary icons stay one consistent line system.

## Motion (both paths)
The user likes a lot of motion: GSAP, scroll-driven sections, custom cursors, 3D. Emil's rule decides **where** it goes:
| Surface | Motion budget |
|---|---|
| Hero, section reveals, marketing moments, first load | Expressive: choreography, stagger, scroll scenes, WebGL, cursor effects |
| Frequently used UI (buttons, menus, tabs, forms, lists) | Fast and subtle: 150–250ms, ease-out, interruptible, never blocks input |
| Keyboard/repeated actions | None or instant |
- **Human-level motion repertoire:** [motion-craft.md](motion-craft.md) plus `scripts/motion/springs.js`. It covers one shape that morphs instead of cutting, closed-form springs (bounce ≤ 0.2), sums of springs for retargeting, two-edge liquid indicators, 1:1 drag with rubber-band and a velocity-carrying release, and non-overlapping content swaps. Borrow 1–2 per project as the authored moment. For UI motion reels or showcase videos, use its reel brief with HyperFrames.
- Build with `animate`. Apply `emil-design-eng` polish, and use `apple-design` for springs, drag, sheets and gestures. Name effects with `animation-vocabulary` before building.
- **React Bits** (217 animated components: text effects, backgrounds, cursor effects (only as layers around the arrow), galleries, micro-interactions) → [react-bits-catalog.md](react-bits-catalog.md). Check it before hand-building an effect. React projects: `npx shadcn@latest add @react-bits/<Name>-TS-TW`. Vanilla/Vite projects: port from the local source. Customize colors and timing, and never ship demo defaults.
- Only transform, opacity and filter. Respect `prefers-reduced-motion`. Afterwards run `review-animations`; on an existing project, `find-animation-opportunities` shows what's missing.
- Libraries (charts, OTP, drag and drop, toasts) → `pick-ui-library`.

## Copy, Gauntlet, Deliver (both paths)
- **Copy:** real, specific text in the user's language, passed through `humanizer`.
- **Gauntlet:** run [gauntlet.md](gauntlet.md). Any failure → fix → restart from gate 1.
- **Deliver:** `npm run build` → `publish.py dist` → send the URL plus desktop and mobile screenshots (`shoot.py`). With a reference, also report the final match % and anything excluded.

## Common Mistakes
| Mistake | Fix |
|---|---|
| UI code before `spec.md` / `direction.md` exists | Write it first |
| Skipping the prompt pack because the client has photos, or building before the user answers | Always send the pack and wait |
| Prompts that ask the generator for photos of the place | Labeled image placeholders only; real photos come from the client |
| Every fact dumped on the page | Minimal surface, details behind accordions, hotspots and sheets |
| Flat single-color SVGs, frozen after the entrance | Layers, light, depth, some 3D, and a seamless idle loop |
| Cropping illustrations out of the reference | Rebuild them in code (three.js / shader / SVG), animated |
| Declaring "pixel perfect" from memory of the image | Only `diff.py` numbers count |
| Fixing random spots | Always fix the worst cell first; re-diff after each batch |
| Diffing mid-animation | Shots come from `shoot.py` (it settles and finishes animations) |
| Mobile left for the end, or desktop squeezed | Plan it before coding, with the same care; review phone screenshots screen by screen |
| First Google Font that looks close | Identify the real face; Google Fonts is the fallback |
| Font lacks glyphs and silently falls back | Check coverage for all content before choosing |
| Same entrance animation on every element; motion on high-frequency UI | Follow the motion budget table |
| Library component shipped with demo defaults | Retune colors, timing and scale to the design |
| User in a hurry, so critics get skipped | Never skip gates. Dispatch the critics for gates 2, 5 and 7 in parallel and send progress updates |
| Autoplay carousel breaks diffs | Start on slide 1, pause on hover/focus, stop under reduced motion |
| Vite preview returns 403 on the link | `preview/server.allowedHosts: [".trycloudflare.com"]` |
| Raw HTML through the tunnel is blank on phones | Doctype, `<meta charset="utf-8">`, viewport meta; keep non-ASCII out of JS regexes; test the public URL in Playwright |
