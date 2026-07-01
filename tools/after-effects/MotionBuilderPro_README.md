# Motion Builder Pro — universal After Effects motion-design panel

`MotionBuilderPro.jsx` is a general-purpose motion-design assistant + preset pack
for Adobe After Effects (ExtendScript / ScriptUI — no HTML/React/Node). Use it for
YouTube/TikTok intros, app & product promos, creator content, gaming edits, music &
lyric videos, social ads, brand launches, portfolio reels — anything beat-synced to
comp markers. DXED is just **one** optional profile, not the whole tool.

Every action runs in one undo group (Ctrl/Cmd+Z reverts it).

## Install & open
1. Copy `MotionBuilderPro.jsx` to the AE **ScriptUI Panels** folder
   (`…/Support Files/Scripts/ScriptUI Panels/` on Windows, `…/Scripts/ScriptUI Panels/` on macOS).
2. Preferences → Scripting & Expressions → enable *Allow Scripts to Write Files and Access Network*.
3. Restart AE → `Window → MotionBuilderPro.jsx`. (Or `File → Scripts → Run Script File…`.)

## Project & Brand (top panel)
- **Project Name** → names the built comp (`<name> - 30s Edit`).
- **Project Style Profile** (14 options incl. Universal, Clean/Dark Tech, App/Creator/
  Gaming/Music/Lyric/Product/Social/Crypto/Minimal/Neon, and **DXED Brand Profile**).
  Picking one sets colors, default text pack, promo type, and density.
- **Brand Name / CTA / Primary / BG / Accent / Glow** are editable hex/text fields —
  click **Apply Brand Settings**. Default brand is “Your Brand” / “yourwebsite.com”.

## The 14 tabs
1. **Quick Build** — build promo, make window, shape pack, marker actions, flashes, sync text, QA.
2. **30s Promo Builder** — Promo Style, Density (Minimal/Normal/Full/Insane), Beat Sync Mode
   (Existing markers / Generate / Marker-Bin roles), Scene Mode, Promo Type + build / premium /
   hype / replace-text / replace-windows / re-sync / export.
3. **Comp Marker Bin** — Scan, a role table (#/Time/Comment/Role/Scene/Action), Auto-Label,
   add default/0.5s/strong-every-4/drop-every-8 markers, Clear Generated, **Apply Marker
   Actions**, Build Promo From Bin, and a **role→action mapping** dropdown for all 10 roles
   (Beat, Text Pop, Flash, Strong Hit, Camera Bump, Window Hit, Scene Change, Drop, Outro Hit, Custom).
   Your own marker comments (“Flash”, “Drop”, “Text”, “Window”, “Camera”…) are respected.
4. **Text Queue** — a Text Pack dropdown (App/Product/Creator/Gaming/Music/Lyric/Social/
   Crypto/Minimal/DXED/Custom), a Scene/Text/Preset table, add/remove lines, and Sync
   Text To Markers (every / every strong / per scene) + Clean/Hype text modes. `[Brand Name]`
   and `[CTA]` tokens auto-fill from your brand.
5. **Project Assets** — 10 universal slots (Logo, Screenshot/Window 1–3, Product, Background,
   Extra, Video, Character, Outro Logo). *Use Selected* assigns the selected layer; slots are
   used automatically in the promo (Logo → Scene 1 & 7, Screenshot 1 → Scene 3, etc.).
6. **Motion Presets** — Bounce/Slide/Pop/Fade/Blur/Beat Sync/Combo.
7. **Text Presets** · 8. **Window Presets** — turn a selected screenshot (or Screenshot slot 1)
   into a flat *or* a glowing **3D webpage window** (layers at real Z depths + glow border +
   back-glow + shadow). 18 3D movement presets: Hover, Hover Around, Sway L↔R, Turn L→R /
   R→L, Tilt Reveal, Stand Up, Card Flip In, Turn In, Parallax Push, Pull Back, Orbit,
   Floating Depth, Left/Right Pass, Glow Pulse Hover, Corner Peek, Depth Zoom (+ Random 3D).
   · 9. **Shape Presets** (+ shape packs) ·
   10. **Transitions** · 11. **Flash / Impact** · 12. **Camera** — each: category→preset,
   Apply / Random / To Markers.
13. **Preset Preview** — Create Demo Comp, Preview Selected/Random/Category, Clear Demo.
14. **Export Recipe** — a `.txt` + a hidden **Motion Recipe** guide layer (project, profile,
   brand, text queue, asset slots, marker roles/actions, presets, timing, windows, CTA).

## Marker-based 30-second promo
1. Place comp markers on the beat (numpad `*`), or use the Marker Bin to generate them.
2. Pick a Profile, load a Text Pack (or type your own in the Text Queue), fill Asset slots.
3. **Build Full 30s Promo** → a 1920×1080/30fps/30s comp with 7 scenes, each with a
   background glow, 2–5 marker-synced text moments, supporting cards/windows, flashes,
   camera moves, and a scene transition. **Density** controls how packed each scene is.
   Every 4th marker = strong hit + camera bump; every 8th / scene boundary = transition.

## Presets feel distinct
Names route through a shared engine that reads direction/easing/glow/blur/flash/rotate from
the name, so e.g. *Bounce Up* moves up into place, *Bounce Slam* drops fast with an impact
flash, *Elastic Bounce* settles over 5 keyframes, *Window Bounce In* builds a full framed
window, *Text Bounce In* adds a tracking shift, and shape packs stagger multiple shapes.

> Parses cleanly as ExtendScript; AE-API calls (effects, text animators, camera, markers,
> multi-column listboxes) are best confirmed on a first run. Any preset that throws is named
> in the undo-group alert — report it and it's a quick fix.
