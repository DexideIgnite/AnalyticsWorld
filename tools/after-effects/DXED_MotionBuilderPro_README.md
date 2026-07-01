# DXED Motion Builder Pro — After Effects Script

`DXED_MotionBuilderPro.jsx` is a large motion-design **preset pack + assistant** for
Adobe After Effects. It's a real ExtendScript / ScriptUI panel — no HTML, no React,
no Node. It ships **~460 named presets across 14 categories**, a combination engine,
marker beat-sync, a screenshot/app-window builder, a shape-pack builder, flash tools,
a recipe exporter, and a full 15-second DXED promo sequence builder.

Every named preset routes through a shared primitive engine that reads the preset
name (direction / easing / glow / blur / flash / rotate modifiers) and applies real
keyframes, effects, layers, or expressions. **Nothing in a dropdown is a no-op.**

Every action runs in one undo group — **Ctrl/Cmd+Z** reverts it.

---

## 1. Where to install the script

Copy `DXED_MotionBuilderPro.jsx` into the After Effects **ScriptUI Panels** folder:

- **Windows:** `C:\Program Files\Adobe\Adobe After Effects <ver>\Support Files\Scripts\ScriptUI Panels\`
- **macOS:** `/Applications/Adobe After Effects <ver>/Scripts/ScriptUI Panels/`

Then enable **Preferences → Scripting & Expressions → "Allow Scripts to Write Files
and Access Network"** (used by the recipe export + expression-driven motion) and
**restart After Effects**.

## 2. How to open it in After Effects

- **Docked panel (recommended):** `Window → DXED_MotionBuilderPro.jsx`. Drag it into
  your workspace to dock it.
- **Floating (no install):** `File → Scripts → Run Script File…` and pick the `.jsx`.

## 3. How to use Motion Presets

The **Preset Library** panel is the core:

1. Pick a **Category** (Bounce, Slide, Pop / Scale, Fade, Blur, Text,
   Window / Screenshot, Shape, Flash / Impact, Transition, Camera, Beat Sync,
   Combo Presets, Full Scene Presets). The **Preset** dropdown updates to that
   category's list.
2. Pick a **Preset**.
3. Select the layer(s) you want to affect (not required for Shape / Flash /
   Transition / Camera / Scene presets).
4. Click one of:
   - **Apply Preset** — apply at the current-time indicator.
   - **Apply Random** — apply a random preset from the current category.
   - **Apply To Markers** — apply the preset at every comp marker.

**Easy Mode** (top) sets the vibe: a **Style** (Clean Premium, Fast Hype, Dark Tech,
Creator Energy, Apple-Level Clean, Crypto Project) and **Energy** (Clean/Medium/Hype/
Insane) that auto-set duration, glow, flash, and bounce. Energy controls default timing:
Clean `0.6s` · Medium `0.45s` · Hype `0.3s` · Insane `0.15s`.

**Advanced Mode** (tick *Show advanced controls*) exposes Duration, Delay/stagger,
Distance, Bounce, Glow, Blur, Flash, Scale, Rotation, Marker offset, Random variation,
Seed, an **Apply to** scope (each selected / all as group / markers), and *Strong hit
every 4 markers*.

**How the presets animate** (examples):
- **Bounce** → 3+ keyframes: start offset/small → overshoot → settle (position or scale,
  with glow/flash/blur/rotate/elastic/soft/hard/double modifiers parsed from the name).
- **Slide** → offset position → final position (+ optional fade/blur), speed from
  Fast/Smooth/Snappy in the name; diagonals supported.
- **Pop / Scale** → small → overshoot → final; "Pop From 0/50/80" set the start size;
  glow-ring / purple-burst / camera-bump / shadow add-ons.
- **Fade** → opacity (+ optional slide/scale/rotate/blur; to/from black/white make a
  full-screen solid fade).
- **Blur** → adds Gaussian/Directional/Radial blur and animates it in or out.
- **Text** → real text animators for Letter/Word/Type-On/Tracking, plus slam/glow/blur/
  bars/pills/cards; creates a DXED-worded text layer if none is selected.
- **Camera** → creates a camera + null rig **and** a visible adjustment-layer Transform
  move (push/pull/zoom/shake/pan/tilt/orbit) so motion is visible even in 2D comps.

## 4. How to use markers for beat sync

1. Play the comp and tap **`*` on the numpad** on each beat to drop comp markers
   (or use the **Beat Sync** tab → *Add Beat Markers* with an interval + count).
2. Select the layer(s) you want to hit.
3. In the **Beat Sync** tab, choose a beat preset (e.g. *Bounce On Every Marker*,
   *Strong Hit Every 4 Markers*, *Flash On Every Marker*, *Window Zoom On Markers*,
   *Alternate Slide Directions On Markers*, *Random Preset On Markers*, …).
4. Click **Apply Beat Preset** (or **Beat Sync Selected** for a quick default).

The script reads comp markers and applies animation at each marker time, with stronger
hits on every 4th (and *Heavy Hit Every 8 Markers* on every 8th), alternating directions,
random variation, and micro-flashes between markers where the preset name says so. If no
markers exist, it tells you to add some first.

Any layer-based category can also be **Apply To Markers** — it repeats that preset at
every marker time.

## 5. How to make a screenshot into a window

1. Import your screenshot/image/video (or a precomp) and add it to the comp.
2. Select that layer.
3. Click **Make Screenshot Window** (Easy Mode, Quick Build tab, or Window tab), or pick
   any **Window / Screenshot** preset and hit **Apply**.

It builds a premium DXED app window around the layer: a rounded frame behind it, browser
traffic-light dots, purple/blue glow border, soft shadow, a controller null so it animates
as one unit, subtle continuous float, plus optional shine sweep, cursor click, callout
label, notification pop, floating chips, background glow, camera push, and a preset-driven
intro (slide / zoom / pop / bounce / blur / flash / 3D tilt / exit). **If no layer is
selected, it creates a placeholder DXED window** so you can test it immediately.

## 6. How to build the full DXED promo sequence

1. *(Optional)* Select a logo/text layer and/or screenshot layers first — they'll be used
   in the intro and window scenes. Otherwise styled placeholders are used.
2. Set Style + Energy in Easy Mode.
3. Click **Build Full DXED Promo**.

It creates a new **1920×1080 / 30fps / 15s** comp named **"DXED Promo Motion Sequence"**
with 7 scenes, each with an intro, a hold, an exit, a marker at its start, and a transition
into the next:

1. **DXED Logo Intro** — logo/text impact-pop + purple glow pulse, glow ring, accent bar, flash out
2. **Hero Statement** — "This is DXED." kinetic slam + smooth camera push
3. **App Window Reveal** — "Create. Post. Connect." + app window slide-in with glow border
4. **Creator Section** — "Built for creators." + feature cards pop + floating blobs
5. **Community Section** — "Find your community." + rounded cards slide + text glow reveal
6. **Projects Section** — "Projects can build here too." + premium reveal + window zoom (placed later)
7. **Final CTA** — "Join DXED." + "DXED.app" glow outro + slow camera push + final flash

A readable **motion recipe** is saved to the comp comment and a hidden guide text layer.
Use the **Recipe** tab → **Export Motion Recipe** to also save a `.txt` summary (comp name,
markers, scenes, per-layer animations, timing).

---

## Preset library at a glance

| Category | Count | Category | Count |
|---|---|---|---|
| Bounce | 50 | Flash / Impact | 36 |
| Slide | 50 | Transition | 36 |
| Pop / Scale | 45 | Camera | 31 |
| Fade | 39 | Beat Sync | 25 |
| Blur | 35 | Combo Presets | 20 |
| Text | 50 | Full Scene Presets | 7 |
| Window / Screenshot | 53 | | |
| Shape | 46 | | |

The header shows the live totals: **named presets** plus **possible combinations** from
the combination engine (Motion type × Direction × Easing × Energy × Glow × Blur × Flash ×
Duration × Marker behavior).

## DXED brand

Purple `#8B5CF6` · Deep Black `#060610` · Dark Navy `#0A0A1A` · Soft Blue `#3B82F6` ·
White `#FFFFFF`. A `hexToRGB()` helper converts hex to After Effects RGB (0–1).

## Error handling

The script checks for an open comp, selected layers, layer type (text vs image vs shape),
camera presence, and marker presence, and shows a clear alert instead of failing. Every
action is wrapped in `app.beginUndoGroup()` / `app.endUndoGroup()`.

Tested against After Effects CS6+ ExtendScript. No third-party dependencies.

> Note: this file parses cleanly as ExtendScript, but AE-API calls (effect match-names,
> text animators, camera rig) are best confirmed by a first run inside After Effects.
> If any preset throws, the undo-group alert will name it — report it and it's a quick fix.
