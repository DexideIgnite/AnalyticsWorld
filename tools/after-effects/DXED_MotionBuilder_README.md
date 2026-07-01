# DXED Motion Builder — After Effects Script

`DXED_MotionBuilder.jsx` is a motion-design assistant for **Adobe After Effects**.
It's a real ExtendScript / ScriptUI panel — no HTML, no React, no Node — that helps
you build DXED.app promo edits fast: intro sequences, beat-synced animation, text
presets, screenshot/app-window presets, rounded shape packs, transitions, flashes,
camera bumps, and a full start-to-end promo builder.

Every action runs inside a single undo group — press **Ctrl/Cmd+Z** to revert it.

---

## 1. How to install it

1. Copy `DXED_MotionBuilder.jsx` into the After Effects **ScriptUI Panels** folder:
   - **Windows:** `C:\Program Files\Adobe\Adobe After Effects <ver>\Support Files\Scripts\ScriptUI Panels\`
   - **macOS:** `/Applications/Adobe After Effects <ver>/Scripts/ScriptUI Panels/`
2. Open **Preferences → Scripting & Expressions** and enable
   **"Allow Scripts to Write Files and Access Network"** (needed for the recipe export
   and for expression-driven float motion).
3. **Restart** After Effects.

## 2. How to open it

- **Docked panel (recommended):** `Window → DXED_MotionBuilder.jsx`. Drag it into your
  workspace to dock it like any native panel.
- **Floating window (no install):** `File → Scripts → Run Script File…` and pick the
  `.jsx`. It opens as a floating palette.

## 3. How to use it — step by step

The panel has three zones:

- **Easy Mode** (top): pick a **Style** and **Energy**, then hit a one-click button.
- **Advanced Mode**: tick *Show advanced controls* to expose Duration, Delay,
  Direction, Bounce, Glow, Blur, Flash strength, Scale, Position distance, Marker
  offset, Random seed, and an *Apply to* target.
- **Tabs**: Quick Build · Beat Sync · Text · Window · Shape · Transitions ·
  Flash/Impact · Recipe.

**Quick start:**
1. Open a comp (or let a builder button create one).
2. In **Easy Mode**, choose a Style (e.g. *Clean Premium*) and Energy (e.g. *Hype*).
   These set glow/flash/bounce/duration defaults automatically.
3. Select the layer(s) you want to animate.
4. Click a button. For example, select a title and click **Animate Selected Text**.

**Style presets:** Clean Premium · Fast Hype · Dark Tech · Creator Energy ·
Apple-Level Clean · Crypto Project.
**Energy levels:** Clean · Medium · Hype · Insane (scale timing, flash, and bounce).

**The Preset Engine** combines Motion Type × Direction × Easing × Visual Style ×
Glow × Blur × Bounce × Flash × Duration × Marker Behavior — the header shows the total
number of available combinations.

## 4. How to place markers and beat sync

1. Play the comp and tap **`*` on the numpad** on each beat to drop comp markers
   (or use the **Beat Sync** tab → *Add Beat Markers* with an interval + count).
2. Select the layer(s) you want to pulse.
3. Click **Beat Sync Selected Layers** (Easy Mode or Beat Sync tab).
4. The script reads the comp markers and adds scale-pulse keyframes aligned to each
   marker, with a **stronger hit on every 4th marker** and optional flashes.

Beat Sync controls (Beat Sync tab):
- **Marker offset** — nudge every hit earlier/later.
- **Anim length** — how long each pulse lasts after its marker.
- **Behavior** — Every Marker · Alternate · Every 4th Strong · Random.
- **Flash on strong markers** — white/purple flash on the 4th-beat accents.

Related buttons:
- **Auto Edit To Markers** — distributes selected layers across marker segments, adds
  intro + exit animation per segment, flashes on strong markers, and a camera bump every
  4th marker. It confirms before touching more than 6 layers and keeps existing keys.
- **Add Flash On Markers** / **Add Camera Bumps (4th)**.

## 5. How to make a screenshot into a DXED window

1. Import your screenshot/image (or a precomp) and add it to the comp.
2. Select that layer.
3. Go to the **Window** tab, pick a preset (Floating Browser, Rounded App, Glass UI,
   Dark Tech, 3D Tilt, Zoom In, Slide In, Bounce In, Glow Border, Flash Transition, …),
   tick **Glow border / Camera push / Shine sweep**, then click **Make Screenshot Window**.
   (Or just hit **Make Screenshot Window** in Easy Mode for the default look.)

The script builds a premium app window around your screenshot:
- rounded browser frame behind it, browser traffic-light dots, purple glow border,
  soft drop shadow;
- a controller null so the whole window animates as one unit (position/scale/opacity/
  rotation keyframes per preset);
- subtle continuous float, optional camera push, and an optional shine sweep.

## 6. How to build a full DXED promo sequence

1. *(Optional)* Select a logo/text layer and/or screenshot layers first — the builder
   will use them in the intro and window scenes. If nothing is selected, it uses
   styled placeholders.
2. Pick your **Style** and **Energy** in Easy Mode.
3. Click **Build Full DXED Promo Sequence** (Easy Mode or Quick Build tab).

It creates a new 1920×1080 / 30fps comp with these scenes, each with an intro, a hold,
an exit, a marker at its start, and a transition into the next:

1. **DXED Logo Intro** — logo/text scale-pop + purple glow pulse, glow ring, accent bar, flash out
2. **Hero Text** — "This is DXED." slams in over depth layers
3. **Website Window Reveal** — screenshot becomes a glowing app window, camera push + shine
4. **Creator Section** — "Post. Build. Connect." with floating UI cards
5. **Community Section** — "Find your community." with community chips animating in
6. **Project Section** — "Projects can build here too." with a premium slow reveal (placed later, not first)
7. **Final CTA** — "Join DXED." + "DXED.app" glow outro

After building, a readable **motion recipe** is saved to the comp comment and to a hidden
guide text layer. Use the **Recipe** tab → **Export Motion Recipe** to also save a `.txt`
summary (comp name, scenes, marker times, per-layer animations, timing).

---

## Panel reference

**Easy Mode buttons:** Create DXED Intro · Build Full Promo · Beat Sync Selected ·
Animate Selected Text · Make Screenshot Window · Add Flash On Markers ·
Add Rounded Shapes · Export Motion Recipe.

**Quick Build tab:** Build Full DXED Promo Sequence · Auto Edit To Markers ·
Randomize Preset · Make It More Premium · Make It More Hype · Clean Up Motion ·
Add Camera Bumps.

**Text tab presets:** Fade Up/Down, Slide Left/Right, Scale Pop, Bounce In, Blur Reveal,
Glow Reveal, Text Slam, Kinetic Word Pop, Letter-by-Letter, Word-by-Word, Flash Text,
Tracking Spread, Smooth Premium Reveal, Hard Beat Impact. Works on selected text layers;
creates a DXED-worded text layer if none is selected.

**Shape tab presets:** Rounded Rectangle Card, Floating Pill, Circle Glow, Background
Blobs, Grid Lines, Animated Border, Glow Ring, Purple Accent Bar, UI Chip, Soft Gradient
Card, Shape Wipe, Rounded Mask Transition, Background Depth Layers — plus **Add Rounded
Shape Pack**.

**Transitions tab:** Fade, Blur Fade, White/Purple Flash, Glow Wipe, Slide Wipe, Rounded
Rectangle Wipe, Circle Reveal, Zoom Flash, Whip Pan, Glitch Cut, RGB Split Cut, UI Card
Wipe, Window Push, Hard Beat Cut, Smooth Apple Fade — apply at the current time or on all
markers.

**Flash/Impact tab:** Soft/Hard/Purple/White Flash, Glow Burst, Camera Bump, Beat Shake,
Bass Pulse, Chromatic Split, Blur Hit, UI Ripple, Text Impact, Window Impact, Edge Glow —
apply at current time or on markers (adjustment layers created as needed).

## DXED brand

- Main purple `#8B5CF6` · Deep background `#060610` · Dark navy `#0A0A1A` ·
  Blue accent `#3B82F6` · White text · Soft purple glow.
- A `hexToRGB()` helper converts hex to After Effects RGB (0–1) values.

## Robustness

The script checks for an open comp, selected layers, layer type (text vs image), and the
presence/absence of markers before acting, and shows a clear message instead of crashing.
Tested against After Effects CS6+ ExtendScript. No third-party dependencies.
