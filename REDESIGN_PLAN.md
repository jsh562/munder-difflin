# Munder Difflin — Landing Redesign Plan (cubicle-inspired)

> Goal: re-skin the marketing site (`docs/index.html`) and rewrite `docs/DESIGN.md`
> to a **light, warm-paper, monospace, neo-brutalist** system in the lineage of
> [cubicle.run](https://cubicle.run). Direction chosen: **"Close to cubicle"** — match
> the palette and component language closely, while keeping MD's own identity
> (maroon brand mark, the name, the GOD/hive/MemPalace story, and the real product footage).
>
> This is a deliberate **reversal** of the current DESIGN.md (which is dark, flat, rounded,
> "no offset shadows, no square corners"). The new doc replaces it wholesale.

---

## 0. What cubicle does (observed, with exact tokens)

| Aspect | cubicle.run |
|---|---|
| Canvas | white `#FFF` body + cream bands `#F5F2E8` / `#F5ECD7` / `#FFFEF5`; dark band `#1B1B1B` for final CTA |
| Ink | `#1B1B1B` (text **and** borders) |
| Type | **JetBrains Mono** headings/labels/UI (hero 68px / 600 / −1.7px tracking); **Geist** sans body |
| Eyebrow | 11px mono, +3px tracking, UPPERCASE, faint ink |
| Cards | `border: 3px solid #1B1B1B`, `border-radius: 0`, `box-shadow: 10px 10px 0 #1B1B1B` |
| Buttons | square, `2px solid #1B1B1B`, yellow `#FFCA54` fill (primary) / sky `#72C2DF` (alt), mono 700 |
| Accents | yellow `#FFCA54` CTA, sky-blue `#72C2DF` headline highlight, pastel color-blocks (lilac/peach/mint/tan) per feature card |
| Structure | numbered feature cards (`01 / TEAM`): pastel top holds a mini-UI mockup, white bottom holds mono title + body; dark metadata chips; dotted-texture dark final CTA; integrations logo grid |

MD already shares the most important DNA: **JetBrains Mono**, a **gold ≈ cubicle-yellow** accent,
a **pixel-art office product**, and an **Office/paper-company** theme. "Munder Difflin is a paper
company" makes the cream-paper canvas thematically *more* on-brand than the current dark theme.

---

## 1. New design tokens (`:root`)

```css
:root {
  /* canvas & surfaces (light, warm paper) */
  --paper:    #FFFDF7;   /* body */
  --cream:    #F5F2E8;   /* primary band */
  --cream-2:  #F5ECD7;   /* alt band */
  --white:    #FFFFFF;   /* card bodies */
  --ink-band: #1B1B1B;   /* dark final-CTA band + dark video panels */

  /* ink (text + borders are the same near-black) */
  --ink:       #1B1B1B;
  --ink-dim:   #57544C;  /* body/secondary */
  --ink-faint: #8A867A;  /* eyebrows, meta */

  /* accents */
  --yellow: #FFCA54;     /* primary CTA (== MD gold, kept) */
  --sky:    #72C2DF;     /* headline highlight + alt CTA */
  --maroon: #B23A4E;     /* MD signature — brand mark + rare emphasis */
  --maroon-deep: #6E1423;

  /* pastel card tints (one per feature) */
  --lilac: #E4DEFB;  --peach: #FBDDBE;  --mint: #D6F3E1;
  --tan:   #F1E6CC;  --rose:  #FBE0DF;  --sky-soft: #DCEFF7;

  /* neo-brutalist depth — hard offset shadows, NO blur */
  --shadow-card: 10px 10px 0 var(--ink);
  --shadow-btn:   4px 4px 0 var(--ink);
  --shadow-chip:  3px 3px 0 var(--ink);

  /* geometry */
  --border: 2px solid var(--ink);
  --border-bold: 3px solid var(--ink);
  --radius: 0px;               /* square everywhere */

  --font-mono: "JetBrains Mono", ui-monospace, "SF Mono", Menlo, monospace;
  --font-sans: "Geist", "Inter", -apple-system, system-ui, sans-serif;

  --maxw: 1200px; --pad-x: 24px;
}
```

**Fonts:** add **Geist** (400/500) + keep **JetBrains Mono** (400/500/700) in the Google
Fonts `<link>`. Inter becomes fallback only.

**Motion:** neo-brutalist press on hover — `transform: translate(-2px,-2px)` and shadow grows
(`4px→6px` btn, `10px→14px` card). Keep reveal-on-scroll and the video IntersectionObserver.
All disabled under `prefers-reduced-motion`.

---

## 2. Component restyle

| Component | New treatment |
|---|---|
| **Button (primary)** | square, `--border`, `--yellow` fill, `--ink` text, mono 700, `--shadow-btn`, press-on-hover |
| **Button (ghost)** | square, `--border`, `--white` fill, `--ink` text, `--shadow-btn` |
| **Button (alt)** | sky `--sky` fill (used on the dark final-CTA band) |
| **Card** | `--white` body, `--border-bold`, square, `--shadow-card`. Feature cards = pastel top block (mini-UI/video) + white bottom (label + title + body) |
| **Eyebrow** | 11px mono, +3px tracking, UPPERCASE, `--ink-faint`, optional leading `—` |
| **Chip / badge** | `--ink` fill, `--white` mono UPPERCASE text, square, optional `--shadow-chip` |
| **Window / media frame** | `--border-bold`, square, black title bar (white mono title + 3 dots), video/terminal inside |
| **Numbered label** | `01 / THE SIMULATION` — mono, `--ink-faint`, above each feature title |
| **Focus** | 2px `--ink` (or `--sky`) square outline, 2px offset |

---

## 3. `docs/index.html` — section-by-section

> Same content/sections and the 4 videos stay. This is a **re-skin + restructure**, not a rewrite
> of the message. Order: `nav → hero → why → what → how → claude → open source → install → support → FINAL CTA (new) → footer`.

1. **Nav** — cream/paper bg, 2px black bottom border on scroll. Maroon square `MD` mark + `MUNDER DIFFLIN` mono wordmark. Links in ink. Right: ghost `★ Star` + yellow `⤓ Download` (square, black border).

2. **Hero** — cream bg with a faint dotted/grid paper texture.
   - Bordered mono chip: `⚡ LOCAL · OPEN SOURCE · macOS`.
   - H1 `Local Multi-Agent Harness` (JetBrains Mono, ~64px, −1.7px) with **one word in sky-blue** (`Multi-Agent` highlighted), rest ink.
   - Sub in Geist, `--ink-dim`.
   - CTA row: yellow `Download free · macOS` + ghost `★ Star on GitHub`.
   - Trust line.
   - **Hero video** below the CTA: `hero.webm` in a 3px-black square window with a black title bar (`munder-difflin — the floor` + live chip). (Already below CTA — keep.)

3. **Why** (3 problem cards) — 3-up neo-brutalist cards, each a different pastel tint (rose / lilac / peach), square emoji tile + mono H3 + body. Hard offset shadows.

4. **What** (statement) — big mono statement on cream, ink with **gold + maroon + sky** highlights on the key nouns (`hive mind`, `long-term memory`, `GOD orchestrator`). Keep the widened `max-width: 38ch`.

5. **How** (3 rows → cubicle feature cards) — each row = pastel color-block panel holding the **video** + white panel with numbered label + mono title + body:
   - `01 / THE SIMULATION` — sky-soft tint — `how-agents.webm`
   - `02 / THE MEMORY` — lilac tint — `how-mempalace.webm`
   - `03 / THE ORCHESTRATION` — peach/tan tint — `how-god-hive.webm`
   - Videos keep their dark backgrounds → read like cubicle's dark terminal panels inside light cards. 

6. **Claude ecosystem** — keep the 2 cards, restyle neo-brutalist; **add an integrations-style logo grid** (cubicle's strongest borrowed pattern): "Plugs into Claude Code, your skills, and MCP servers" → square bordered tiles (Claude Code, MCP, skills, hooks, subscription). Terminal block restyled as a dark panel inside a black-bordered card.

7. **Open source** — bordered blockquote on cream, mono, with the MIT line; yellow + ghost CTAs.

8. **Install** — dark terminal panel (`#1B1B1B`) inside a 3px-black square card on cream; mono tokens (teal/gold/mint) preserved.

9. **Support + patrons** — neo-brutalist cards; OnlyGains / AnimeBlip patrons as square bordered cards with hard shadow.

10. **FINAL CTA band (NEW)** — full-width dark `#1B1B1B` band with dotted texture (cubicle's closer). Big mono headline e.g. *"Run your own office of agents."* with a **sky-blue** word, sub, and a **yellow** square CTA. MD currently lacks this high-converting closer.

11. **Footer** — cream, mono, copyright left + links + `hello@…` email right (underlined). Keep parody disclaimer.

---

## 4. `docs/DESIGN.md` — rewrite map

The current doc is the *anti-cubicle*; it must be replaced, not patched. Rewrite:

- **Header/Direction** — "light, warm-paper, monospace, neo-brutalist, in the lineage of cubicle.run; keeps MD's maroon mark + Office parody for identity."
- **§1 Principles** — invert: paper canvas; mono-forward; hard offset shadows + square corners as the depth language; one playful accent system (yellow CTA + sky highlight + pastel feature tints); product-led via real footage.
- **§2 Color** — new token table above (paper/cream/ink/yellow/sky/maroon/pastels).
- **§3 Type** — JetBrains Mono display/labels + Geist body; add Geist to font loading.
- **§4 Spacing/radius/depth** — `radius: 0`; hard offset shadows (`4/10px 0`); 2–3px ink borders.
- **§5 Components** — square neo-brutalist buttons/cards/chips/windows + press-on-hover.
- **§6 "How it works"** — pastel feature cards holding the videos (keep on-screen-only playback).
- **§7 Layout** — add the dark final-CTA band; integrations grid; light section bands (cream/white alternating, one dark band).
- **§9 A11y** — ink-on-cream contrast; yellow CTA AAA with ink text; **sky-blue used only on large display text** (low contrast at body size); square focus rings.
- **§11 Asset inventory** — videos stay "Used"; note posters; maroon mark retained.
- Bump *Last updated*.

---

## 5. Build order & verification

1. Rewrite `:root` tokens + base + nav + buttons; swap fonts. QA in browser (light render).
2. Hero (chip, sky highlight, square video window).
3. Why / What / How (pastel feature cards + videos).
4. Claude / OSS / Install / Support / patrons.
5. Add dark final-CTA band + footer.
6. Rewrite `docs/DESIGN.md`.
7. QA pass: desktop + mobile screenshots over `python3 -m http.server`, check no horizontal overflow, contrast on yellow/sky, all 4 videos still play, focus rings, reduced-motion.

**Self-contained:** `docs/index.html` is one file with an inline `<style>`. Changes are large but
contained; videos, IntersectionObserver, and reveal logic are reused as-is.

---

## 6. Risks / decisions

- **Looks-like-a-clone risk** (chosen direction is "close"). Mitigations baked in: keep maroon
  brand mark + name, keep gold (not cubicle's exact yellow is fine — they're near-identical), keep
  MD's own copy + GOD/hive/MemPalace story + real pixel footage. Don't copy cubicle's section wording.
- **Sky-blue contrast** — only on large headline words, never body.
- **Hard reversal of DESIGN.md** — intended; old doc is replaced.
- **Geist dependency** — adds one font family; falls back to Inter if it fails to load.
```
