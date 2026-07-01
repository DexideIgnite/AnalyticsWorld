# Motion Design Studio — After Effects Script

`MotionDesignStudio.jsx` is a dockable ScriptUI panel that automates motion-design
work in Adobe After Effects. Select layers, click a button — it animates position,
scale, rotation, opacity, anchor point, easing, motion blur, and adds physics /
procedural expressions. Every action is a single undo step.

## Install

1. Copy `MotionDesignStudio.jsx` into your AE **ScriptUI Panels** folder:
   - **Windows:** `C:\Program Files\Adobe\Adobe After Effects <ver>\Support Files\Scripts\ScriptUI Panels\`
   - **macOS:** `/Applications/Adobe After Effects <ver>/Scripts/ScriptUI Panels/`
2. Enable **Preferences → Scripting & Expressions → "Allow Scripts to Write Files and Access Network"**.
3. Restart AE. Open the panel from **Window → MotionDesignStudio.jsx** (dockable).

Prefer not to install? Use **File → Scripts → Run Script File…** and pick the
`.jsx` to get a floating window instead.

## What it does

**Timing (global):** set a default `Duration` and `Ease %` used by every button.

**Animate In / Out**
- Fade In / Fade Out
- Pop / Scale In (with overshoot)
- Slide In from left / right / up / down (distance in px)
- Spin by any number of degrees

**Custom Move** — animate the current transform value *from* an offset you type
(ΔX, ΔY, ΔScale, ΔRotation, ΔOpacity), auto-eased.

**Physics & Procedural (expressions)**
- Overshoot / spring settle on Position or Scale
- Velocity-reactive Bounce
- Inertia smooth-follow
- Wiggle
- Breathe (sine scale)
- Loop Cycle / Ping-Pong
- Auto-Fade at layer head & tail
- Clear all expressions

**Utilities**
- Anchor → Center (compensates position so nothing jumps)
- Ease All Keys (Easy-Ease every animated transform property)
- Reverse Keys
- Motion Blur on/off (also enables comp motion blur)
- Sequence Layers (time stagger)
- Stagger Keyframes (cascade existing keys)
- Time Stretch %

## Notes

- Works on one or many selected layers at once.
- Animations start at the current-time indicator.
- Tested against AE CS6+ (ExtendScript). No external dependencies.
