# Prompt Kit: Figma-shot screens (no-reference projects)

This is the **v2 standard the user approved** (2026-09-25): flat color bands, owned palette and fonts, isometric vector hero with "+" hotspots, labeled image placeholders, minimal surface with content behind interaction. The paper/texture (v1.5.1) and all-typography (v1.5.2) variants were rejected; do not bring them back.

## 000. Method v1.9 (current, approved direction 2026-09-26): real references as style images
The v1.7/v1.8 restraint went too far ("same fonts, no 3D icons, no creative type, cold dead colors, no rich UI"). What the user wants is the **craft level of real Figma designs** (the 7 in `references/creative-minimal/`, also in `C:\Users\amigi\Downloads\Referencias`): warm, lively pastel palette taken from the business's world; **one family of soft 3D icons** with the same light; illustrated art with personality (a sticker-collage panorama with a wavy cut-out edge, or a flower wreath framing a gallery); **floating UI cards with real data**; stat tiles with gradient tops; colorful bento panels; **pill buttons with relief** (top highlight, soft inner shadow, 2px darker bottom edge); a serif + italic-serif + rounded-sans type mix with a grey second headline line; and a **giant colorful wordmark** in the footer.
1. **Attach the references, don't just describe them.** Upload 2–3 of the 7 that fit the business with `sites\flora_upload.py` (Wandor for places and venues; Mugic and ShipSphere for 3D icons, bento and relief; Finley and Oriel for fintech and apps). Pass them as `image_urls` to **`is2i-gpt-image-2-5-sunburst`** (the user's generator) with `resolution: "2k"` and `quality: "high"`. Use aspect `1:2` for the full desktop page and `16:9` for 4 iPhones. Template: `sites\flora_gen_v8.py`.
2. The prompt says the references are **for style and craft only** (never copy their brands or text), names the only brand explicitly, and lists every section with its real copy, palette hexes, the 3D icon list and the type mix.
3. After generating, check for invented facts and signs, and list them to the user. Build with design tokens underneath (see §00) so the lively look stays consistent in code.

## 00. Method v1.8: AI draws the art, code draws the layout (use for the BUILD, not for the reference image)
The user rejected AI-generated full layouts for **inconsistent type, spacing and fonts**. An image model has no type system or grid, so every section gets a different style. Real designers lay out in Figma with fixed tokens and commission only the illustrations. So:
1. **Image model = illustrations only.** Generate the hero illustration alone (see §0 for the style), get it approved, then generate 3–5 **isolated vignettes** of the same drawing using the hero as the image reference (plain paper background, no text, no UI). Cut the backgrounds out with a color-distance alpha matte so the art floats on the page.
2. **Layout = a code comp (a "Figma frame").** Build a static HTML comp with **design tokens**: one type scale (for example 12 · 14 · 16 · 20 · 32 · 88 · 104), one spacing scale on an 8px grid, the same section padding everywhere, a 12-column grid, and **real self-hosted fonts that have true italics** (check the font's styles first; Gambarino has no italic, so the browser fakes it, which is a typographic error; Zodiak, Erode and Sentient from Fontshare do have them). Every heading of the same level uses the same class.
3. **Render and send** the desktop full page (1440) and 4 phone screens (390, composed in iPhone frames with a status-bar safe area) **for approval before the animated build**. Changes are made in the tokens, so they stay consistent everywhere.
4. Prompt packs for full-page images (below) are still available when the user explicitly wants an AI mood image, but they are no longer the default reference for building.

## 0. Premium craft (v1.7)
The v2 outputs were judged **"too generative, not creative, not a professional designer's work."** Their structure stays: color bands, an isometric hero with "+" hotspots, labeled placeholders, and content behind interaction. The **dose** changes. Premium = **restraint + micro-detail**.
1. **Palette: 1 + neutrals + 1.** One brand hue in 2–3 tonal steps (dark, mid, pale), two neutrals (warm paper and ink), and **one accent used on under 5% of the area** (the primary button, one active state, one highlighted word). Bands alternate between tonal steps of the same hue and the paper. Never a rainbow of saturated bands.
2. **One authored illustration.** The hero art is the only illustration, drawn as a fine **architectural axonometric**: 0.75px ink linework, flat muted fills, soft ambient occlusion and one light. No cartoon look. **No 3D clip-art icons in cards.** Cards use typography, a number or a 1.5px line icon from one consistent set.
3. **One typographic gesture per page.** A high-contrast serif display (with an italic for one word) and a neo-grotesk for UI, in **two sizes that matter**: huge (140–200px) and small (13–16px), with almost nothing in between. No outlined words, curved text or stacked lockups in every section.
4. **Micro-detail is where "designer" shows.** Every section carries 3–5 of these: hairline 1px rules on the grid; small captions under placeholders ("Fig. 02, Piscina, 8 × 4 m"); tabular numerals for facts (10.000 m², 51 vagas, 16 leitos); a tiny arrow ↗ on links; a measured annotation line on the hero art ("80 m" with end ticks); a hotspot legend; an aligned meta row (endereço · horário · telefone) in small type; subtle 4–8px radii; shadows so soft you notice them only on hover cards.
5. **Negative space is the luxury.** 55–65% of each shot is empty paper. Content hangs on an asymmetric 12-column grid (text on columns 1–5, art on 7–12). Nothing is centered by default.
6. **Decoration diet.** No petals, confetti, waves on every edge, sparkles or drop-shadowed stickers. Allow **one** band transition shape per page (for example, a single soft curve after the hero), and make every other band edge straight.
7. **Detail budget: shots, not a whole page.** Image models spread detail across the canvas, so a 10-section page comes out shallow. Generate **one section per image** at high resolution (a "Figma frame, zoomed in"): 1 hero shot, then 1 shot per key section, then an optional overview. Each shot prompt is short, concrete and measured (positions, sizes, counts), not a list of adjectives.
8. **Hero first, then everything references it** (learned 2026-09-26). Generate and approve the hero shot alone. Then generate the desktop page and the mobile screens **with the approved hero attached as the image reference** (FLORA/Qwen: `is2i-qwen-image-2-1-is2i` + `reference_node_ids`). Without it, each shot invents its own look and the sections come out lifeless.
9. **The one illustration travels as vignettes.** "One authored illustration" doesn't mean the other sections go bare. Every section gets a **zoomed-in detail of the same drawing** (the house, the gazebo, a table under the pergola, the pool) in place of icons or empty boxes. Photo placeholders can also show a vignette of the same place drawn in the same line style.
10. **Resolution check.** At tall ratios (9:21), Qwen via FLORA returns only ~416×1024. Use the full-page image as a layout guide, take detail from the hero shot, and upscale (Magnific Precision, 134 credits) only if the user wants a sharp print.
11. **Name the craft, not the vibe.** Useful terms: "editorial layout", "Swiss grid", "architectural axonometric drawing", "hairline rules", "tabular figures", "optical margin alignment", "generous negative space", "restrained palette", "Awwwards Site of the Day quality, designed by an independent studio". Useless terms: "beautiful", "modern", "stunning", "vibrant".

When the user asks for a site or app **without a reference image**, deliver a **prompt pack** that generates the reference screens (desktop + mobile) **before any code**. Never skip it, even when the client already has real photos: the user considers these prompts essential. Wait for the user to choose:
- **A) Generate the images** and send them back → the build continues on **Path A** (pixel by pixel from the generated screens).
- **B) "build"** → the pack becomes the spec: its style block, sections and copy go into `direction.md` and the build follows Path B.

The screens must read as **a finished Figma frame or a Dribbble/Behance shot**, a designer's definitive UI print, and never as a photo mockup of the place.

## 1. Style DNA ("creative, designed by a person")
1. **No photorealism of the business.** Every photo slot is an **image placeholder**: a flat tinted block with a thin outline, a small image icon and a caption saying what goes there ("FOTO: pergolado com primavera, horizontal 4:3"). The generator must not invent the place, people, food or products. Real photos come from the client later.
2. **Brave, owned color.** Build a palette from the business's world, not the AI default (no beige + terracotta + sage by habit, no purple-blue gradients). Pick one dominant hue, one surprising accent and a dark anchor. Name each hex and its role (background, surface, text, accent, section band).
3. **Color that travels.** Each section sits on its own color band from the palette. The page is a sequence of color fields, and the prompt describes how one field hands off to the next: a diagonal wipe, a curved edge, an overlapping card that straddles the two colors, or a gradient seam.
4. **Typography with character.** Never the usual AI stack (Inter, Poppins, Montserrat, Playfair, "a geometric sans"). Choose a display face with personality from dafont.com first (check the license), then from foundries like Fontshare, Pangram Pangram, Velvetyne, Collletttivo or ATF. Examples: condensed grotesk, wide expanded sans, stencil, chunky soft serif, variable display with ink traps. Pair it with a quiet text face. Use big scale contrast (display 120–200px desktop), mixed weights inside one headline and tight tracking. Name the fonts in the prompt.
5. **Illustration system with depth.** Instead of photos, the art is **detailed vector illustration**: layered shapes with light direction, soft shadows, highlights and gradients for volume, and a few **3D objects** (isometric or soft 3D render style) that belong to the business. The same light direction and palette appear everywhere. They are drawn to be animated as seamless loops later.
6. **Minimal surface, deep content.** Each screen shows only the essentials: one headline, a short line and one action. Everything else about the business still exists, but it sits behind interaction: expandable cards, "+" hotspots on an illustration, tabs, accordions, a drawer. The shot shows 1–2 of these in the open state so the builder knows the pattern.
7. **Generous space.** Wide vertical rhythm between sections (160–240px on desktop), a clear 12-column grid, and a lot of calm area around each focal element.
8. **Real product fragments.** Buttons, chips, a date picker, a WhatsApp preview bubble and a price or capacity tag, with believable text in the user's language. No lorem ipsum or gibberish.
9. **Mobile is designed, not squeezed.** The same color bands, typography and illustrations recomposed for 390px, with a thumb-reachable sticky action and the same interaction patterns (accordions, sheets). The mobile image shows the screens **inside realistic iPhone mockups** (front view, not tilted).

## 2. Build the pack
Research the business first (site, Instagram, Google, marketplaces) and list the real facts. Then fill these in and show them to the user in 5–7 lines:
`BRAND` (name + one-line truth) · `MODE` · `PALETTE` (hex + role each) · `TYPE` (display + text, with source) · `ILLUSTRATION` (the vector/3D system and its light) · `SIGNATURE` (the one idea only this business could have) · `DISCLOSURE` (what hides behind which interaction) · `SCREENS`.

### 2.1 Style block (paste into every prompt, unchanged)
```
Style: finished Figma UI frame / Dribbble shot of a real website, crisp flat UI, designed by a senior human designer, not a photo mockup.
All photo areas are EMPTY IMAGE PLACEHOLDERS: flat {PLACEHOLDER_TINT} blocks with a 1px outline, a small image icon and a short label describing the photo that will go there. Do not render any photograph.
Palette: {PALETTE with roles}. Each section is a full-width color band; transitions between bands are {TRANSITION}.
Typography: display "{DISPLAY}" huge (120-200px), mixed weights, tight tracking; text "{TEXT}" small and calm. Clear hierarchy, strong scale contrast.
Illustrations: detailed vector art with one light source from {LIGHT}, soft shadows, highlights, gradients for volume and depth, plus a few soft-3D objects: {OBJECTS}. Same style everywhere.
Minimal layout with deep content: only essentials visible, extra info behind "+" hotspots, expandable cards and accordions (show one opened).
Generous spacing (160-240px between sections), 12-column grid, pixel-perfect alignment, readable real {LANGUAGE} copy.
```

### 2.2 Negative block (append to every prompt)
```
Avoid: photorealistic photos of the place, people, food or rooms; stock photography; AI-default fonts (Inter, Poppins, Montserrat, Playfair);
beige + terracotta + sage by default; purple-blue gradients; glassmorphism; generic SaaS template; identical icon cards; emoji icons;
tiny gibberish text; lorem ipsum; misaligned grid; heavy drop shadows; gradient text; eyebrow labels above headings; watermark; tilted device mockups.
```

### 2.3 Screen prompts
One prompt per screen: `{STYLE}` + canvas + section-by-section content with the real copy, the band color of each section and how it transitions to the next + `{NEGATIVE}`.

**Desktop (presentation shot):**
```
{STYLE}
Canvas: 1440px-wide full landing page for {BRAND} shown as a Dribbble presentation: two long page columns side by side on a neutral backdrop.
Sections top to bottom (band color → transition → next):
1. Nav on {COLOR}: wordmark, 4-5 links, one action pill.
2. Hero on {COLOR}: huge headline "{HEADLINE}", one short line, one primary pill; signature illustration {SIGNATURE} (vector + soft 3D, lit from {LIGHT}); one image placeholder labeled "{PHOTO_1}". Transition: {TRANSITION_1}.
3..N. {SECTION}: {essentials only}; {what is behind the interaction, one item shown open}; placeholders labeled {PHOTOS}. Transition: {TRANSITION_N}.
N+1. Booking/contact block with the real controls (date picker, chips, WhatsApp preview bubble).
N+2. Footer on {DARK}: 4 small columns with real contact data, giant wordmark in the display font.
{NEGATIVE}
```

**Mobile (3–4 screens in one image):**
```
{STYLE}
Canvas: 4 realistic iPhone 16 Pro mockups in a row, front view, straight (not tilted), natural titanium frame, Dynamic Island, thin even bezels, soft contact shadow under each phone, on a flat {BACKDROP} studio background. Each screen shows the {BRAND} site at 390x844, rendered flat and crisp inside the phone (the UI itself stays a clean Figma-style design; only the device is realistic).
Screen 1 hero · Screen 2 signature interaction open (hotspot/accordion) · Screen 3 {content} · Screen 4 booking with sticky action.
Same bands, fonts and illustrations as desktop; 44px tap targets; 20px margins.
{NEGATIVE}
```

### 2.4 Section shot (v1.7 default: one per key section)
```
DELIVERABLE: One zoomed-in Figma frame of a single website section, 1440x900 (16:10), exported flat and razor-sharp, as an Awwwards Site of the Day would present it. Nothing else in the image.
LAYOUT: {band color}; asymmetric 12-column grid with faint 1px hairlines at the column edges; {what sits on columns 1-5} / {what sits on 7-12}; 55-65% empty space.
TYPE: "{DISPLAY}" serif at {size}px for "{HEADLINE}" (the word "{WORD}" in italic); "{UI}" neo-grotesk 14px for everything else; tabular figures for numbers.
CONTENT: {exact elements with exact text, counts and positions}.
MICRO-DETAILS: {3-5 from Premium craft §4, concrete}.
ACCENT: {ACCENT hex} only on {the one element}.
AVOID: 3D clip-art icons, cartoon style, more than {N} colors, outlined or curved text, waves, petals, confetti, stickers, heavy shadows, centered hero, stock photos, gibberish text.
```

## 3. Per-tool notes (creative generators first)
- **GPT Image 2.5 (the user's generator):** use `quality: high` for shots with little text and `xhigh` for form or table shots. Use 1536x1024 (or 2160x1350 final) for section shots. Iterate one change at a time, feeding back the previous image, and restate the palette and fonts in every edit.
- **Midjourney v7:** best for creative layouts. Put the style block last and add `--ar 2:3 --style raw --stylize 250 --chaos 15`. Use `--sref` with a Dribbble shot you like to lock the style. Text will be approximate, so treat it as layout and mood.
- **Ideogram 3 / Recraft v3:** best for legible UI text and vector-style art. Recraft: use a "vector illustration" or "digital illustration" style for the art.
- **GPT Image / ChatGPT:** paste as is, portrait 1024x1536, ask for "legible text, empty image placeholders".
- **Nano Banana (Gemini):** generate desktop first, then "same brand, now the mobile screens".
- **Figma Make / Google Stitch / v0:** paste the section list as the brief; they output editable frames, good for option A.

## 4. Deliver to the user
One message per item, easy to copy:
1. The 5–7 line concept (with the researched facts that will appear).
2. The **hero shot** prompt, then **3–5 section shot** prompts (§2.4), each as its own message and also together as a .txt file. Optionally add the full-page overview prompt, clearly marked as an overview only.
3. The mobile prompt (also as a .txt file).
4. One line: "Generate and send the images back (I'll clone them pixel by pixel, replacing the placeholders with the real photos), or reply 'build'."
Record the pack in `qa/prompt-pack.md`.

## 5. Checks before sending
- No prompt asks for a photo; every photo slot is a labeled placeholder.
- Palette and fonts are named, owned and not the AI default; each section has its band color and transition.
- Content is complete (every real fact has a home) but the visible surface is minimal; the disclosure pattern is described.
- Illustrations specify light direction, depth and the 3D objects; they can loop.
- Same style block and negative block in every prompt; desktop and mobile describe the same brand; copy is real, humanized, no em-dashes.
