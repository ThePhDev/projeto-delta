# Motion Craft: human-level UI motion repertoire

This is a **repertoire, not a template.** Use these techniques to give interfaces the feel of hand-tuned, Dribbble-level motion. Pick what serves the design, and never apply all of them at once. The motion budget in SKILL.md still decides where motion goes.

Code: [scripts/motion/springs.js](scripts/motion/springs.js). It's an ES module with closed-form springs, sums of springs for retargeting, liquid edges, rubber-band, drag-then-release, content swap and a beat grid. Every function is a pure function of time, so the same code runs live UI and frame-exact video renders.

## 1. Principles (why it feels human)
1. **One shape, never cut.** Continuity beats transitions. When a control changes role (button → loader → check → toast), morph the **same element**: size, radius, color. Swap only its content. The eye tracks one object, which reads as intentional. On the web, use shared-element morphs (a persistent container, the View Transitions API, or FLIP) instead of mounting a new component.
2. **Springs, not curves.** Parametrize with `duration` + `bounce`. For UI chrome, use **bounce 0–0.2** (at most ~1.5% overshoot). Bounce above 0.3 reads as cartoonish. Measured overshoot per value is in the springs.js header.
3. **Retarget without jumps.** A value whose target changes mid-flight is the **sum of one spring per change**. It stays continuous and keeps its momentum, and it's still a pure function of time (`retarget`).
4. **Two edges, two springs (liquid).** For tab indicators, toggle knobs and selection pills, the leading edge rides a faster spring than the trailing edge. The shape stretches toward its destination, then contracts. That's the "liquid" look (`liquidEdges`).
5. **Direct manipulation.** While the pointer is down, the value **is** the pointer position (1:1, no easing). Past the limits it rubber-bands (`rubberBand`). On release it springs from where it was, **carrying the release velocity** (`dragThenRelease`). A drag that eases or snaps while held feels fake.
6. **Content swaps never overlap.** Inside a morphing container, the old content exits fast (about 120ms: fade, blur 4–6px, scale 0.96), then the new content enters after a small gap on a spring (`swap`). Text needs its own enter and exit timing, or two labels mush together mid-morph.
7. **Rhythm.** In showcases and reels, events land on a beat grid (for example 120 BPM = 0.5s per beat, `beat(n)`). In product UI, rhythm means **consistent durations per role**: micro 150–250ms, morphs 300–450ms, page-level 500–700ms.
8. **Restraint list.** No bouncy easing, particle bursts, glows, gradients on UI chrome, mismatched icon strokes, dead time, or anything that reads as a template.

## 2. Engineering rules
- **Seekable by design.** Compute every style from `t` inside one `seek(t)` or render function, with no CSS transitions, timers or state carried between frames. Live UI just calls it from `requestAnimationFrame`, and video capture calls it per frame. HyperFrames needs exactly this kind of seek-safe logic.
- **Never put `will-change` on anything a camera or zoom scales.** Text gets rasterized and turns blurry. Add it only to small, unscaled layers, and remove it after the animation.
- **Loops:** the last frame equals the first, **including the cursor position and velocity**, or the loop stutters.
- **Accessibility:** under `prefers-reduced-motion`, morphs become instant state changes with a 150ms opacity crossfade, and drags still work 1:1 without spring-back overshoot.
- **Performance:** animate transform, opacity, filter and clip-path. For size and radius morphs, use a scale plus inverse-scale on the content (FLIP), or `clip-path: inset(... round r)`, instead of animating width, height or border-radius on large elements.

## 3. Showcase / reel mode (motion demos as video)
When the user asks for a **UI motion reel or showcase video**, render it with the **HyperFrames** skills (the user's video framework; never Remotion). Apply the principles above and the brief template below. Render one still per beat first, and fix anything that is off the grid, cramped or hard to read before the full render.

### Brief template (improved version of the user's reference prompt)
```
<inputs>
Ask for: 8-12 UI states the shape becomes; palette (pure black/white, or one accent hex); a royalty-free ~120 BPM track (e.g. Mixkit, commercial use OK); aspect (1:1 1440, 9:16 1080x1920 or 16:9).
</inputs>
<direction>
Dribbble-level UI motion. One shape, never cut: every state is the same element morphing size, radius and color; content swaps with a short blur (exit 120ms, gap 40ms, enter spring 220ms).
A cursor drives every change with real clicks and drags (press = 0.96 scale on the target, cursor dips 1px).
Light warm-gray canvas (#EEECE8), black/white components, one UI font (Geist), one icon set with one stroke width.
Springs everywhere (bounce <= 0.2); camera zooms so each state fills ~70% of the frame, using the same spring family as the UI.
Every 8th beat is a "breath": a held pose with only micro motion, so the rhythm has phrasing instead of a wall of events.
Last frame == first frame (cursor position and velocity included) so it loops.
Banned: bouncy easing, particles, glows, gradients on UI chrome, mismatched strokes, dead time, template looks.
</direction>
<structure>
{BPM} BPM, {BARS} bars; one event per beat except the breaths. State list with beat numbers, e.g.
Button (1) → loader (2-3) → check (4) → dynamic island (5) → music player, play/pause morph (6-7) → scrub progress (8) →
volume slider stretching past max with rubber-band (9-10) → toggle flips on the downbeat (11) → knob becomes a liquid tab indicator (12-13) →
tabs open into a chart that draws itself + hover tooltip (14-16) → collapses into ⌘K (17) → type to filter (18-19) → enter (20) → toast (21-22) → back to the button (23-24, breath) → loop.
</structure>
<build>
1. Seek-safe composition (HyperFrames): every style is a pure function of t; no CSS transitions or timers.
2. Closed-form springs (springs.js); retargets are sums of springs; the tab indicator and toggle knob use two-edge liquid springs.
3. Drags are direct manipulation with rubber-band; release springs back carrying the release velocity.
4. Analyze the track (numpy/librosa) for the beat grid and the first downbeat; place every UI sound (click, tick, whoosh <= -18 dB under the music) on its measured peak.
5. Motion blur: 4 subframes per frame blended (ffmpeg tmix) at 60fps, or the renderer's native motion blur.
6. Render one still per beat first; fix anything off-grid, cramped or unreadable; then render the full loop and check the seam.
</build>
<gotchas>
No will-change on scaled layers. Swapped text needs its own exit/enter timing. The last frame must match the first, cursor velocity included.
</gotchas>
<start>
Ask for the inputs, then show the state list on the beat grid before writing any code.
</start>
```

## 4. Signature effects for Experience / Persuade pages
Big "wow" techniques for portfolios, launches and art-directed landings. Use **one** as the page's signature, never in Operate or Read screens.
| Effect | How | Notes |
|---|---|---|
| **Dither** (1-bit / ordered Bayer look) | Post-processing pass: a full-screen shader thresholds luminance against a Bayer matrix. React Bits `Dither` is ready to port | Pairs with a mono palette + one accent; animate the threshold on scroll or hover |
| **ASCII rendering** | Render the 3D scene to a low-res target and map luminance to a glyph atlas in a shader (React Bits `ASCIIText` / `FaultyTerminal` as starting points) | Keep the glyph cell ≥ 8px so it reads as type, not noise; real text stays real DOM for accessibility |
| **Folding 3D mesh** (paper or cloth bending) | three.js with **TSL** (node materials, WebGPU with a WebGL fallback): bend vertices along an axis in the vertex stage, driven by a GSAP timeline or scroll | The **backface shows a different texture** (flip the UVs on `!frontFacing`), so a fold reveals a "back side" of the content |
| **Cursor distortion** | Pass the pointer position (smoothed with a `LiveSpring`) as a uniform, and displace vertices or UVs with a radial falloff | Falloff radius ~15–25% of the viewport; disable on touch, where there's no hover |
| **Page transitions** | The **View Transitions API** (`next-view-transitions` in Next.js, `document.startViewTransition` in vanilla) + CSS keyframes on `::view-transition-old/new`; shared elements get a `view-transition-name` so they morph between pages | This is the "one shape, never cut" principle across routes; keep it ≤ 500ms and honor reduced motion |
Budget: the effect must hold **60fps on a mid phone** (`vitals.py` TBT ≤ 300ms). Lazy-load the WebGL chunk after first paint, and ship a static poster frame under reduced motion or no WebGL.

## 5. Using it in normal sites (not reels)
Borrow **one or two** techniques per project where they fit:
- a CTA that morphs into its loading and success states (one shape)
- a liquid tab or segmented-control indicator
- sliders and carousels with 1:1 drag, rubber-band and a velocity-carrying release
- a toggle knob with two-edge stretch
- a ⌘K palette that grows out of the button that opened it
- toasts that emerge from the element that caused them
Keep everything else quiet. One authored moment beats ten effects.
