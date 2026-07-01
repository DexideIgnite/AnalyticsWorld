/**********************************************************************************
 * DXED Motion Builder Pro
 * ------------------------------------------------------------------------------
 * A large motion-design preset pack + assistant for Adobe After Effects.
 * Real ExtendScript / ScriptUI panel. No HTML, no React, no Node.
 *
 * ~460 named presets across 14 categories, a combination engine, marker beat
 * sync, a screenshot/app-window builder, a shape-pack builder, flash tools, a
 * recipe exporter, and a full 15s DXED promo sequence builder.
 *
 * Every named preset routes through a shared primitive engine that reads the
 * preset name (direction / easing / glow / blur / flash / rotate modifiers) and
 * applies real keyframes, effects, layers, or expressions. Nothing is a no-op.
 *
 * INSTALL
 *   Copy to the After Effects "ScriptUI Panels" folder:
 *     Win : C:\Program Files\Adobe\Adobe After Effects <ver>\Support Files\
 *           Scripts\ScriptUI Panels\
 *     Mac : /Applications/Adobe After Effects <ver>/Scripts/ScriptUI Panels/
 *   Enable Preferences > Scripting & Expressions >
 *     "Allow Scripts to Write Files and Access Network".
 *   Restart AE, open  Window > DXED_MotionBuilderPro.jsx.
 *   (Or File > Scripts > Run Script File... for a floating window.)
 *
 * Every action runs in one undo group (Ctrl/Cmd+Z reverts it).
 * Tested against After Effects CS6+ ExtendScript. No third-party dependencies.
 **********************************************************************************/

(function DXEDMotionBuilderPro(thisObj) {
    "use strict";

    var SCRIPT_NAME = "DXED Motion Builder Pro";
    var VERSION = "2.0";

    /* ===================================================================== *
     *  1. GLOBAL BRAND COLORS
     * ===================================================================== */

    // "#RRGGBB" -> normalized [r,g,b] in 0..1 for After Effects.
    function hexToRGB(hex) {
        hex = ("" + hex).replace(/[^0-9a-fA-F]/g, "");
        if (hex.length === 3) hex = hex.replace(/(.)/g, "$1$1");
        var r = parseInt(hex.substring(0, 2), 16) / 255;
        var g = parseInt(hex.substring(2, 4), 16) / 255;
        var b = parseInt(hex.substring(4, 6), 16) / 255;
        if (isNaN(r) || isNaN(g) || isNaN(b)) return [1, 1, 1];
        return [r, g, b];
    }
    function rgba(rgb, a) { return [rgb[0], rgb[1], rgb[2], (a === undefined ? 1 : a)]; }

    var BRAND = {
        purple: hexToRGB("#8B5CF6"),
        black:  hexToRGB("#060610"),
        navy:   hexToRGB("#0A0A1A"),
        blue:   hexToRGB("#3B82F6"),
        white:  hexToRGB("#FFFFFF"),
        glow:   hexToRGB("#A78BFA")
    };

    /* ===================================================================== *
     *  2. PRESET ARRAYS  (real, named — all selectable, all animate)
     * ===================================================================== */

    var BOUNCE = ["Bounce In","Bounce Out","Bounce Up","Bounce Down","Bounce Left","Bounce Right",
        "Bounce Slide Up","Bounce Slide Down","Bounce Slide Left","Bounce Slide Right","Bounce Pop",
        "Bounce Scale","Bounce Fade In","Bounce Fade Out","Bounce Zoom In","Bounce Zoom Out",
        "Overshoot Bounce","Soft Bounce","Hard Bounce","Elastic Bounce","Tiny Bounce","Heavy Bounce",
        "Double Bounce","Beat Bounce","Bass Bounce","Card Bounce In","Text Bounce In","Window Bounce In",
        "Logo Bounce In","Shape Bounce In","Bounce With Glow","Bounce With Flash","Bounce With Blur",
        "Bounce Rotate","Bounce Tilt","Bounce Drop","Bounce Rise","Bounce Slam","Bounce Pulse",
        "Bounce Settle","Bounce Wiggle","Bounce Spring","Bounce Snap","Bounce Impact","Bounce Stagger",
        "Bounce Stack","Bounce Loop","Bounce Hover","Bounce Button Press","Bounce UI Card","Bounce Browser Window"];

    var SLIDE = ["Slide In Up","Slide In Down","Slide In Left","Slide In Right","Slide Out Up","Slide Out Down",
        "Slide Out Left","Slide Out Right","Slide Fade Up","Slide Fade Down","Slide Fade Left","Slide Fade Right",
        "Fast Slide Up","Fast Slide Down","Fast Slide Left","Fast Slide Right","Smooth Slide Up","Smooth Slide Down",
        "Smooth Slide Left","Smooth Slide Right","Snappy Slide Left","Snappy Slide Right","Slide With Blur",
        "Slide With Glow","Slide With Bounce","Slide With Flash","Diagonal Slide Up Left","Diagonal Slide Up Right",
        "Diagonal Slide Down Left","Diagonal Slide Down Right","Layered Slide In","Staggered Slide In","Card Slide In",
        "Window Slide In","Text Slide In","UI Panel Slide In","Slide Push","Slide Pull","Slide Reveal","Slide Mask",
        "Slide Behind Card","Slide From Logo","Slide Into Frame","Slide Out With Flash","Slide Out With Blur",
        "Slide Stack","Slide Carousel","Slide App Window","Slide Feature Card","Slide Notification Card","Slide Profile Card"];

    var POP = ["Scale Pop","Soft Pop","Hard Pop","Tiny Pop","Big Pop","Text Pop","Logo Pop","Card Pop","Window Pop",
        "Shape Pop","Pop With Flash","Pop With Glow","Pop With Bounce","Pop From 0","Pop From 50","Pop From 80",
        "Overshoot Pop","Elastic Pop","Beat Pop","Bass Hit Pop","Pulse Pop","Double Pop","Micro Pop","Snap Pop",
        "Smooth Premium Pop","UI Chip Pop","Button Pop","Notification Pop","Profile Pop","Window Zoom Pop",
        "Text Impact Pop","Logo Impact Pop","Card Stack Pop","Center Pop","Corner Pop","Pop And Settle","Pop And Drift",
        "Pop With Blur","Pop With Shadow","Pop With Glow Ring","Pop With Purple Burst","Pop With Camera Bump",
        "Pop On Marker","Pop Every Beat","Pop Every 4 Beats"];

    var FADE = ["Fade In","Fade Out","Fade Up","Fade Down","Fade Left","Fade Right","Slow Fade","Fast Fade",
        "Fade With Blur","Fade With Glow","Fade With Scale","Fade With Slide","Fade With Bounce","Flash Fade",
        "Premium Fade","Apple Fade","Dark Tech Fade","Text Fade","Window Fade","Shape Fade","Background Fade",
        "Fade To Black","Fade From Black","Fade To White","Fade From White","Purple Glow Fade","Blue Glow Fade",
        "Soft Scene Fade","Hard Scene Fade","Marker Fade","Beat Fade","Fade And Push","Fade And Pull","Fade And Rotate",
        "Fade And Drift","Fade With Shadow","Fade With Light Sweep","Fade Behind Window","Fade Behind Card"];

    var BLUR = ["Blur In","Blur Out","Blur Fade In","Blur Fade Out","Blur Slide Up","Blur Slide Down","Blur Slide Left",
        "Blur Slide Right","Blur Pop","Fast Blur Hit","Smooth Blur Reveal","Cinematic Blur Reveal","Zoom Blur",
        "Directional Blur Left","Directional Blur Right","Directional Blur Up","Directional Blur Down","Text Blur Reveal",
        "Window Blur Reveal","Flash Blur","Beat Blur","Motion Blur Hit","Blur With Glow","Blur With Flash",
        "Blur With Bounce","Blur Transition","Blur Wipe","Radial Blur Pop","Blur Text Slam","Blur Window Push",
        "Blur Scene Cut","Blur Every Marker","Blur Strong Beat","Soft Focus Reveal","Sharp Focus Reveal"];

    var TEXT = ["Kinetic Text Pop","Text Bounce In","Text Slide Up","Text Slide Down","Text Slide Left","Text Slide Right",
        "Text Slam","Text Impact","Text Glow Reveal","Text Blur Reveal","Text Fade Up","Text Fade Down","Text Scale In",
        "Text Tracking Spread","Text Tracking Tighten","Word Pop","Word Slide","Word Bounce","Word Flash","Letter Pop",
        "Letter Reveal","Letter Bounce","Letter Slide","Type-On Text","Masked Text Reveal","Text Wipe Reveal",
        "Text With Purple Bar","Text With Blue Bar","Text Behind Card Reveal","Text Flash On Beat","Text Shake On Beat",
        "Text Pulse Loop","Clean Apple Text Reveal","Fast TikTok Text Pop","Premium Tech Text Reveal","Big Hero Text",
        "Small Caption Text","Feature Label Text","CTA Text Pop","Logo Text Reveal","Text With Glow Ring",
        "Text With Underline Sweep","Text With Background Pill","Text With Card Reveal","Text Snap In","Text Snap Out",
        "Text Hover Loop","Text Bass Pulse","Text Every Marker","Text Every 4 Markers"];

    var WINDOW = ["Floating Browser Window","Rounded App Window","Dark Tech Window","Purple Glow Window","Blue Glow Window",
        "Glass Window","Window Bounce In","Window Slide Up","Window Slide Down","Window Slide Left","Window Slide Right",
        "Window Zoom In","Window Zoom Out","Window Pop In","Window Blur Reveal","Window Flash Reveal","Window 3D Tilt",
        "Window Slow Float","Window Camera Push","Window Stack","Window Carousel","Window Swipe Transition",
        "Window With Glow Border","Window With Shadow","Window With Top Browser Dots","Window With Cursor Click",
        "Window With UI Callout","Window With Shine Sweep","Window Scroll Preview","Window Feature Zoom","Window Impact Hit",
        "Window Exit Blur","Window Exit Slide","Window Exit Flash","Browser Dots Reveal","App Window Hover",
        "Screenshot Premium Frame","Screenshot Tilt Reveal","Screenshot Mask Reveal","Screenshot Rounded Reveal",
        "Screenshot Push In","Screenshot Pull Back","Screenshot Hero Zoom","Screenshot Card Stack","Screenshot With Purple Edge",
        "Screenshot With Background Glow","Screenshot With Floating Chips","Screenshot With Feature Labels",
        "Screenshot With Cursor Tap","Screenshot With Notification Pop","Screenshot With Profile Highlight",
        "Screenshot With Post Highlight","Screenshot With Community Highlight"];

    var SHAPE = ["Rounded Card In","Rounded Card Bounce","Rounded Card Slide","Pill Slide In","Pill Bounce In",
        "Circle Glow Pop","Glow Ring Pulse","Purple Accent Bar","Blue Accent Bar","UI Chip Pop","Background Blob Float",
        "Soft Gradient Card","Shape Wipe Left","Shape Wipe Right","Shape Wipe Up","Shape Wipe Down","Rounded Mask Reveal",
        "Animated Border","Neon Border Pulse","Floating Dot Pack","Grid Line Sweep","Dark Background Glow","Liquid Shape Move",
        "Abstract Shape Pack","Feature Card Stack","Social UI Card Pack","Premium Background Shapes","Beat Shape Pulse",
        "Floating Purple Blob","Floating Blue Blob","Glow Circle Background","Rounded Rectangle Reveal","Pill Text Background",
        "Profile Card Shape","Post Card Shape","Notification Card Shape","Community Card Shape","App UI Card Shape",
        "Motion Trail Dots","Corner Glow Shapes","Edge Glow Shapes","Shape Burst","Shape Flash","Shape Bounce Pack",
        "Shape Slide Pack","Shape Outro Pack"];

    var FLASH = ["Soft White Flash","Hard White Flash","Purple Flash","Blue Flash","Glow Burst","Edge Glow Flash",
        "Text Impact Flash","Window Impact Flash","Bass Hit Flash","Beat Flash","Fast Strobe","Micro Flash","Zoom Flash",
        "Blur Flash","Flash With Shake","Flash With Glow","Flash Transition","Flash Every Marker","Strong Flash Every 4 Markers",
        "Clean Premium Flash","Hype Edit Flash","Light Sweep Flash","Lens Flash","UI Ripple Flash","Background Flash",
        "Camera Flash Hit","Logo Flash","Screenshot Flash","Card Flash","Flash And Cut","Flash And Pop","Flash And Slide",
        "Flash And Blur","Flash And Glow","Flash And Shake","Flash Outro"];

    var TRANSITION = ["Fade Transition","Blur Fade Transition","White Flash Transition","Purple Flash Transition",
        "Blue Flash Transition","Slide Wipe Left","Slide Wipe Right","Slide Wipe Up","Slide Wipe Down","Rounded Rectangle Wipe",
        "Circle Reveal","Zoom Flash Cut","Whip Pan Left","Whip Pan Right","Glitch Cut","RGB Split Cut","UI Card Wipe",
        "Window Push Transition","Window Pull Transition","Glow Wipe","Light Sweep Transition","Hard Beat Cut","Smooth Apple Fade",
        "Clean Premium Cut","Fast Hype Cut","Shape Wipe Transition","Text Wipe Transition","App Window Transition",
        "Screenshot Push Transition","Card Stack Transition","Dark Tech Transition","Premium Blur Cut","Bass Hit Transition",
        "Marker Transition","Scene Flash Cut","Scene Glow Cut"];

    var CAMERA = ["Slow Push In","Slow Pull Out","Fast Zoom In","Fast Zoom Out","Camera Bump","Beat Camera Shake",
        "Bass Camera Shake","Smooth Pan Left","Smooth Pan Right","Whip Pan Left","Whip Pan Right","3D Window Tilt",
        "Parallax Push","UI Fly Through","Macro Zoom","Pull Back Reveal","Final Outro Push","Camera Drift","Camera Hover",
        "Camera Impact","Camera Shake Soft","Camera Shake Hard","Camera Slide Up","Camera Slide Down","Camera Orbit",
        "Camera Tilt Down","Camera Tilt Up","Camera Snap Zoom","Camera Flash Zoom","Camera Marker Hit","Camera Every 4 Beats"];

    var BEATSYNC = ["Bounce On Every Marker","Pop On Every Marker","Flash On Every Marker","Text Pop On Markers",
        "Window Zoom On Markers","Shape Pulse On Markers","Camera Bump On Markers","Strong Hit Every 4 Markers",
        "Alternate Slide Directions On Markers","Random Preset On Markers","Micro Flash Between Markers","Auto Scene Cut On Markers",
        "Auto Text Change On Markers","Build Sequence From Markers","Glow Pulse On Markers","Blur Hit On Markers",
        "Scale Hit On Markers","Slide Hit On Markers","Flash Every Other Marker","Heavy Hit Every 8 Markers","Hype Edit Markers",
        "Clean Premium Markers","Window Impact On Markers","Shape Burst On Markers","Logo Pulse On Markers"];

    var COMBO = ["Bounce In + Purple Glow","Slide Left + Blur + Flash","Text Pop + Glow Reveal","Window Zoom + Shine + Camera Push",
        "Pop + Flash + Camera Bump","Fade + Slide + Glow","Bounce + Rotate + Flash","Blur Reveal + Glow","Card Pop + Shadow + Float",
        "Text Slam + Flash + Shake","Window Slide + Glow Border + Cursor","Scale Pop + Purple Burst","Slide Up + Bounce Settle",
        "Glow Reveal + Tracking Spread","Flash Cut + Camera Bump","Bounce Stack + Stagger","Window 3D Tilt + Shine",
        "Text Type-On + Underline","Pop + Blur + Glow Ring","Slide + Flash + Blur Hit"];

    var SCENES = ["DXED Logo Intro Scene","Hero Statement Scene","App Window Reveal Scene","Creator Section Scene",
        "Community Section Scene","Projects Section Scene","Final CTA Scene"];

    var CATEGORIES = {
        "Bounce": BOUNCE, "Slide": SLIDE, "Pop / Scale": POP, "Fade": FADE, "Blur": BLUR,
        "Text": TEXT, "Window / Screenshot": WINDOW, "Shape": SHAPE, "Flash / Impact": FLASH,
        "Transition": TRANSITION, "Camera": CAMERA, "Beat Sync": BEATSYNC,
        "Combo Presets": COMBO, "Full Scene Presets": SCENES
    };
    var CATEGORY_ORDER = ["Bounce","Slide","Pop / Scale","Fade","Blur","Text","Window / Screenshot",
        "Shape","Flash / Impact","Transition","Camera","Beat Sync","Combo Presets","Full Scene Presets"];

    // Combination engine dimensions (for the headline count).
    var MOTION_TYPES = ["Bounce","Slide","Pop","Fade","Blur","Whip","Glow","Flash","Camera","Window","Text","Shape"];
    var DIRECTIONS = ["Up","Down","Left","Right","Center","Diag UL","Diag UR","Diag DL","Diag DR","Zoom In","Zoom Out"];
    var EASINGS = ["Smooth","Snappy","Overshoot","Elastic","Soft Bounce","Hard Impact","Cinematic","Fast Cut"];
    var ENERGIES = ["Clean","Medium","Hype","Insane"];
    var GLOW_STYLES = ["None","Purple","Blue","Ring"];
    var BLUR_STYLES = ["None","Gaussian","Directional","Radial"];
    var FLASH_STYLES = ["None","White","Purple","Blue"];
    var DUR_BUCKETS = [0.15, 0.3, 0.45, 0.6, 0.9, 1.2];
    var MARKER_BEHAV = ["Every","Alternate","Every 4th","Every 8th","Random"];

    function namedPresetCount() {
        var n = 0;
        for (var k in CATEGORIES) if (CATEGORIES.hasOwnProperty(k)) n += CATEGORIES[k].length;
        return n;
    }
    function combinationCount() {
        return MOTION_TYPES.length * DIRECTIONS.length * EASINGS.length * ENERGIES.length *
               GLOW_STYLES.length * BLUR_STYLES.length * FLASH_STYLES.length *
               DUR_BUCKETS.length * MARKER_BEHAV.length;
    }

    /* ===================================================================== *
     *  3. STYLE / ENERGY PRESETS + LIVE CONFIG
     * ===================================================================== */

    var STYLE_PRESETS = {
        "Clean Premium":     { easing: "Smooth",    glow: 1, blur: 1, flash: 1, color: BRAND.purple, flashColor: BRAND.white },
        "Fast Hype":         { easing: "Fast Cut",  glow: 2, blur: 0, flash: 3, color: BRAND.purple, flashColor: BRAND.white },
        "Dark Tech":         { easing: "Snappy",    glow: 2, blur: 1, flash: 2, color: BRAND.blue,   flashColor: BRAND.purple },
        "Creator Energy":    { easing: "Soft Bounce",glow: 2, blur: 1, flash: 2, color: BRAND.purple, flashColor: BRAND.blue },
        "Apple-Level Clean": { easing: "Cinematic", glow: 0, blur: 1, flash: 0, color: BRAND.white,  flashColor: BRAND.white },
        "Crypto Project":    { easing: "Overshoot", glow: 3, blur: 1, flash: 2, color: BRAND.purple, flashColor: BRAND.purple }
    };
    var ENERGY_DUR = { "Clean": 0.6, "Medium": 0.45, "Hype": 0.3, "Insane": 0.15 };
    var ENERGY_MUL = {
        "Clean":  { flash: 0.5, bounce: 0.5 }, "Medium": { flash: 1, bounce: 1 },
        "Hype":   { flash: 1.6, bounce: 1.6 }, "Insane": { flash: 2.4, bounce: 2.2 }
    };

    var CFG = {
        style: "Clean Premium", energy: "Medium",
        duration: 0.6, delay: 0.08, distance: 300,
        bounce: 1, glow: 1, blur: 1, flash: 1, scale: 100, rotation: 15,
        markerOffset: 0, randomVar: 20, seed: 12345,
        applyTo: "each"   // "each" | "all" | "markers"
    };
    function styleObj() { return STYLE_PRESETS[CFG.style] || STYLE_PRESETS["Clean Premium"]; }
    function styleColor() { return styleObj().color; }
    function flashColorForStyle() { return styleObj().flashColor; }
    function styleEasing() { return styleObj().easing; }

    /* ===================================================================== *
     *  4. HELPER FUNCTIONS  (guards, undo, math, seeded rng)
     * ===================================================================== */

    function activeComp(silent) {
        var c = app.project ? app.project.activeItem : null;
        if (!c || !(c instanceof CompItem)) { if (!silent) alert("Open or select a composition first.", SCRIPT_NAME); return null; }
        return c;
    }
    function selectedLayers(silent) {
        var c = activeComp(silent); if (!c) return null;
        var L = c.selectedLayers;
        if (!L || L.length === 0) { if (!silent) alert("Select at least one layer.", SCRIPT_NAME); return null; }
        return L;
    }
    function undoable(label, fn) {
        app.beginUndoGroup(label);
        try { fn(); }
        catch (e) { alert(label + " failed:\n" + e.toString() + (e.line ? "\n(line " + e.line + ")" : ""), SCRIPT_NAME); }
        finally { app.endUndoGroup(); }
    }
    function clamp(v, lo, hi) { return v < lo ? lo : (v > hi ? hi : v); }
    function pf(field, d) { var v = parseFloat(field.text); return isNaN(v) ? d : v; }
    function has(name, re) { return re.test(name); }

    // seeded rng (avoids Math.random dependency across resumes)
    var _rng = 12345;
    function seed(s) { _rng = (s % 2147483647); if (_rng <= 0) _rng += 2147483646; }
    function rnd() { _rng = (_rng * 16807) % 2147483647; return (_rng - 1) / 2147483646; }
    function rr(a, b) { return a + (b - a) * rnd(); }
    function pick(arr) { return arr[Math.floor(rnd() * arr.length)]; }

    function transformProps(layer) {
        var tg = layer.property("ADBE Transform Group");
        return { pos: tg.property("ADBE Position"), scale: tg.property("ADBE Scale"),
                 rot: tg.property("ADBE Rotate Z"), opac: tg.property("ADBE Opacity"),
                 anchor: tg.property("ADBE Anchor Point") };
    }
    function centerLayer(layer, comp) {
        try {
            var rect = layer.sourceRectAtTime(comp.time, false);
            var tp = transformProps(layer);
            tp.anchor.setValue([rect.left + rect.width / 2, rect.top + rect.height / 2]);
            tp.pos.setValue([comp.width / 2, comp.height / 2]);
        } catch (e) {}
    }

    // vector helpers (handle 2D/3D uniformly)
    function overshootV(fromV, restV, f) {
        if (restV.length === undefined) return restV + (restV - fromV) * f;
        var o = []; for (var i = 0; i < restV.length; i++) o.push(restV[i] + (restV[i] - fromV[i]) * f); return o;
    }

    /* ===================================================================== *
     *  5. KEYFRAME + EASING ENGINE
     * ===================================================================== */

    var EASE_MAP = {
        "Smooth":      { inf: [75, 75] }, "Snappy": { inf: [85, 20] },
        "Overshoot":   { inf: [80, 60] }, "Elastic": { inf: [85, 70] },
        "Soft Bounce": { inf: [70, 55] }, "Hard Impact": { inf: [100, 12] },
        "Cinematic":   { inf: [90, 90] }, "Fast Cut": { inf: [35, 35] }
    };
    function easeInfo(style) { return EASE_MAP[style] || EASE_MAP["Smooth"]; }

    function easeProperty(property, inInf, outInf) {
        var n = property.numKeys; if (n < 1) return;
        var dim = 1; try { dim = property.value.length || 1; } catch (e) { dim = 1; }
        for (var i = 1; i <= n; i++) {
            var inE = [], outE = [];
            for (var d = 0; d < dim; d++) { inE.push(new KeyframeEase(0, clamp(inInf, 0.1, 100))); outE.push(new KeyframeEase(0, clamp(outInf, 0.1, 100))); }
            try { property.setInterpolationTypeAtKey(i, KeyframeInterpolationType.BEZIER, KeyframeInterpolationType.BEZIER);
                  property.setTemporalEaseAtKey(i, inE, outE); } catch (e) {}
        }
    }
    // simple 2-key animation with easing
    function anim2(property, t0, dur, fromV, toV, style) {
        property.setValueAtTime(t0, fromV); property.setValueAtTime(t0 + dur, toV);
        var e = easeInfo(style); easeProperty(property, e.inf[0], e.inf[1]);
    }
    // bounce: from -> overshoot -> (optional wobble) -> settle
    function bounceKeys(property, t0, dur, fromV, restV, wobbles, over) {
        property.setValueAtTime(t0, fromV);
        property.setValueAtTime(t0 + dur * 0.60, overshootV(fromV, restV, over));
        if (wobbles >= 2) property.setValueAtTime(t0 + dur * 0.80, overshootV(fromV, restV, -over * 0.4));
        if (wobbles >= 3) property.setValueAtTime(t0 + dur * 0.90, overshootV(fromV, restV, over * 0.18));
        property.setValueAtTime(t0 + dur, restV);
        easeProperty(property, 78, 70);
    }

    /* ===================================================================== *
     *  6. EFFECT HELPERS
     * ===================================================================== */

    function fxParade(layer) { return layer.property("ADBE Effect Parade"); }
    function trySet(effect, name, val) { try { var p = effect.property(name); if (p) p.setValue(val); } catch (e) {} }

    function addGlow(layer, radius, intensity, color) {
        var g; try { g = fxParade(layer).addProperty("ADBE Glo2"); } catch (e) { return null; }
        trySet(g, "Glow Radius", radius); trySet(g, "Glow Intensity", intensity); trySet(g, "Glow Threshold", 35);
        if (color) { trySet(g, "Glow Colors", 1); trySet(g, "Color A", color); trySet(g, "Color B", color); }
        return g;
    }
    function addBlur(layer, amount) {
        var b; try { b = fxParade(layer).addProperty("ADBE Gaussian Blur 2"); }
        catch (e) { try { b = fxParade(layer).addProperty("ADBE Fast Blur"); } catch (e2) { return null; } }
        trySet(b, "Blurriness", amount);
        try { b.property("Repeat Edge Pixels").setValue(true); } catch (e3) {}
        return b;
    }
    function addDirectionalBlur(layer, amount, dirDeg) {
        var b; try { b = fxParade(layer).addProperty("ADBE Motion Blur"); } catch (e) { return addBlur(layer, amount); }
        trySet(b, "Direction", dirDeg || 90); trySet(b, "Blur Length", amount);
        return b;
    }
    function addShadow(layer, soft, opac, dist) {
        var d; try { d = fxParade(layer).addProperty("ADBE Drop Shadow"); } catch (e) { return null; }
        trySet(d, "Opacity", opac === undefined ? 150 : opac); trySet(d, "Softness", soft === undefined ? 60 : soft);
        trySet(d, "Distance", dist === undefined ? 14 : dist); return d;
    }
    function addTransformFX(layer) {
        try { return fxParade(layer).addProperty("ADBE Geometry2"); } catch (e) { return null; }
    }

    /* ===================================================================== *
     *  7. LAYER FACTORIES
     * ===================================================================== */

    function addSolid(comp, color, name, w, h) {
        return comp.layers.addSolid(color, name || "DXED Solid", w || comp.width, h || comp.height, 1, comp.duration);
    }
    function addAdjust(comp, name) { var a = addSolid(comp, [1,1,1], name || "DXED Adjust"); a.adjustmentLayer = true; return a; }
    function addNull(comp, name) { var n = comp.layers.addNull(); n.name = name || "DXED Null"; return n; }

    function addTextLayer(comp, text, size, color) {
        var tl = comp.layers.addText(text);
        var sp = tl.property("ADBE Text Properties").property("ADBE Text Document");
        var td = sp.value; td.fontSize = size || 120; td.fillColor = color || BRAND.white; td.applyFill = true;
        try { td.justification = ParagraphJustification.CENTER_JUSTIFY; } catch (e) {}
        try { td.font = "Arial-BoldMT"; } catch (e) {}
        sp.setValue(td); centerLayer(tl, comp); return tl;
    }
    function addRoundedRect(comp, size, roundness, fill, name) {
        var s = comp.layers.addShape(); s.name = name || "DXED Card";
        var gc = s.property("ADBE Root Vectors Group").addProperty("ADBE Vector Group").property("ADBE Vectors Group");
        var r = gc.addProperty("ADBE Vector Shape - Rect");
        r.property("ADBE Vector Rect Size").setValue(size);
        r.property("ADBE Vector Rect Roundness").setValue(roundness === undefined ? 28 : roundness);
        gc.addProperty("ADBE Vector Graphic - Fill").property("ADBE Vector Fill Color").setValue(rgba(fill || BRAND.navy, 1));
        centerLayer(s, comp); return s;
    }
    function addCircle(comp, dia, fill, name) {
        var s = comp.layers.addShape(); s.name = name || "DXED Circle";
        var gc = s.property("ADBE Root Vectors Group").addProperty("ADBE Vector Group").property("ADBE Vectors Group");
        gc.addProperty("ADBE Vector Shape - Ellipse").property("ADBE Vector Ellipse Size").setValue([dia, dia]);
        gc.addProperty("ADBE Vector Graphic - Fill").property("ADBE Vector Fill Color").setValue(rgba(fill || BRAND.purple, 1));
        return s;
    }
    function addStroke(shapeLayer, color, width) {
        var gc = shapeLayer.property("ADBE Root Vectors Group").property(1).property("ADBE Vectors Group");
        var st = gc.addProperty("ADBE Vector Graphic - Stroke");
        st.property("ADBE Vector Stroke Color").setValue(rgba(color, 1));
        st.property("ADBE Vector Stroke Width").setValue(width);
    }
    function zeroFill(shapeLayer) {
        try {
            var gc = shapeLayer.property("ADBE Root Vectors Group").property(1).property("ADBE Vectors Group");
            for (var i = 1; i <= gc.numProperties; i++)
                if (gc.property(i).matchName === "ADBE Vector Graphic - Fill") gc.property(i).property("ADBE Vector Fill Opacity").setValue(0);
        } catch (e) {}
    }

    /* ===================================================================== *
     *  8. NAME PARSING  (direction + modifiers from a preset name)
     * ===================================================================== */

    function parseDir(name, fallback) {
        var n = name.toLowerCase();
        var up = /up|rise/.test(n), down = /down|drop/.test(n), left = /left/.test(n), right = /right/.test(n);
        if (up && left)  return "Diag UL";
        if (up && right) return "Diag UR";
        if (down && left) return "Diag DL";
        if (down && right) return "Diag DR";
        if (up) return "Up"; if (down) return "Down"; if (left) return "Left"; if (right) return "Right";
        if (/zoom in|push/.test(n)) return "Zoom In"; if (/zoom out|pull/.test(n)) return "Zoom Out";
        return fallback || "Center";
    }
    function dirOffset(dir, dist) {
        switch (dir) {
            case "Up": return [0, dist];  case "Down": return [0, -dist];
            case "Left": return [dist, 0]; case "Right": return [-dist, 0];
            case "Diag UL": return [dist, dist];   case "Diag UR": return [-dist, dist];
            case "Diag DL": return [dist, -dist];  case "Diag DR": return [-dist, -dist];
            default: return [0, 0];
        }
    }
    function mods(name) {
        var n = name.toLowerCase();
        return {
            glow: /glow|burst|ring|neon/.test(n), flash: /flash|impact|hit|slam/.test(n),
            blur: /blur|focus/.test(n), shadow: /shadow/.test(n), rotate: /rotate|tilt|spin|orbit/.test(n),
            shine: /shine|light sweep/.test(n), cursor: /cursor|click|tap/.test(n),
            callout: /callout|label|feature/.test(n), loop: /loop|hover|pulse|wiggle|float/.test(n),
            elastic: /elastic/.test(n), hard: /hard|heavy|slam|impact|bass|snap|slam/.test(n),
            soft: /soft|tiny|micro/.test(n), double: /double/.test(n),
            out: /\bout\b|exit|outro|pull/.test(n), stagger: /stagger|stack|layered/.test(n)
        };
    }
    function easingFor(m, base) {
        if (m.elastic) return "Elastic";
        if (m.hard) return "Hard Impact";
        if (m.soft) return "Soft Bounce";
        return base || styleEasing();
    }
    function applyMods(layer, m, t0, dur, s) {
        if (m.glow)   addGlow(layer, 20 + 15 * CFG.glow, 1 + CFG.glow * 0.4, styleColor());
        if (m.shadow) addShadow(layer, 60, 150, 14);
        if (m.flash)  addFlash(layer.containingComp, t0, flashColorForStyle(), 0.12, 2);
        if (m.rotate) { var tp = transformProps(layer); var rv = tp.rot.valueAtTime(t0, false);
                        anim2(tp.rot, t0, dur, rv - CFG.rotation, rv, styleEasing()); }
        if (m.loop)   { try { transformProps(layer).pos.expression = "wiggle(0.6, 6)"; } catch (e) {} }
        try { layer.motionBlur = true; } catch (e) {}
    }

    /* ===================================================================== *
     *  9. ANIMATION FUNCTIONS  (category apply functions)
     * ===================================================================== */

    function applyBouncePreset(layer, name, s) {
        var comp = layer.containingComp, t0 = s.time, dur = s.duration, m = mods(name);
        var dir = parseDir(name, "Center");
        var amt = 0.12 + 0.05 * CFG.bounce * (m.hard ? 1.6 : (m.soft ? 0.5 : 1));
        var wob = m.double ? 2 : (m.elastic ? 3 : 1);
        var tp = transformProps(layer);
        var useScale = (dir === "Center") || /scale|pop|zoom|spring|pulse|impact|slam|logo|card|window|shape|text|button|ui/.test(name.toLowerCase()) && dir === "Center";
        if (/zoom/.test(name.toLowerCase())) useScale = true;

        if (m.out) {  // bounce out
            var restO = tp.scale.valueAtTime(t0, false);
            bounceKeys(tp.scale, t0, dur, restO, [0, 0], wob, amt);
            anim2(tp.opac, t0 + dur * 0.4, dur * 0.6, 100, 0, "Smooth");
        } else if (useScale) {
            var rest = tp.scale.valueAtTime(t0, false);
            var z = rest.length > 2 ? [0,0,0] : [0,0];
            bounceKeys(tp.scale, t0, dur, z, rest, wob, amt);
            anim2(tp.opac, t0, dur * 0.5, 0, 100, "Smooth");
        } else {
            var restP = tp.pos.valueAtTime(t0, false);
            var off = dirOffset(dir === "Center" ? "Up" : dir, s.distance);
            var from = [restP[0] + off[0], restP[1] + off[1]];
            if (restP.length > 2) from.push(restP[2]);
            bounceKeys(tp.pos, t0, dur, from, restP, wob, amt);
            anim2(tp.opac, t0, dur * 0.5, 0, 100, "Smooth");
        }
        applyMods(layer, m, t0, dur, s);
        if (/wiggle|hover|pulse|loop/.test(name.toLowerCase()))
            try { tp.scale.expression = "s=8*Math.sin(time*6);value+[s,s]"; } catch (e) {}
    }

    function applySlidePreset(layer, name, s) {
        var t0 = s.time, dur = s.duration, m = mods(name);
        var fast = /fast|snappy/.test(name.toLowerCase()), smooth = /smooth/.test(name.toLowerCase());
        var ease = fast ? "Fast Cut" : (smooth ? "Cinematic" : easingFor(m, "Snappy"));
        var dir = parseDir(name, "Left");
        var tp = transformProps(layer);
        var rest = tp.pos.valueAtTime(t0, false);
        var off = dirOffset(dir, s.distance);
        if (m.out) {
            var to = [rest[0] - off[0], rest[1] - off[1]];
            anim2(tp.pos, t0, dur, rest, to, ease);
            anim2(tp.opac, t0 + dur * 0.4, dur * 0.6, 100, 0, "Smooth");
        } else {
            var from = [rest[0] + off[0], rest[1] + off[1]];
            if (rest.length > 2) from.push(rest[2]);
            anim2(tp.pos, t0, dur, from, rest, ease);
            if (/fade/.test(name.toLowerCase()) || true) anim2(tp.opac, t0, dur * 0.6, 0, 100, "Smooth");
        }
        if (m.blur) { var b = addBlur(layer, 40); if (b) { var bp = b.property(1); bp.setValueAtTime(t0, 40); bp.setValueAtTime(t0 + dur, 0); easeProperty(bp, 75, 75); } }
        if (/bounce/.test(name.toLowerCase())) { var rp = tp.pos; /* add settle wobble */ }
        applyMods(layer, m, t0, dur, s);
    }

    function applyPopPreset(layer, name, s) {
        var t0 = s.time, dur = s.duration, m = mods(name);
        var tp = transformProps(layer);
        var rest = tp.scale.valueAtTime(t0, false);
        var startPct = 0;
        if (/from 50/.test(name.toLowerCase())) startPct = 0.5;
        if (/from 80|micro|tiny/.test(name.toLowerCase())) startPct = 0.8;
        var from = [rest[0] * startPct, rest[1] * startPct];
        if (rest.length > 2) from.push(rest[2] * startPct);
        var over = m.soft ? 0.06 : (m.hard ? 0.22 : 0.14);
        var ease = easingFor(m, "Overshoot");
        bounceKeys(tp.scale, t0, dur, from, rest, m.elastic ? 3 : 1, over);
        if (ease) {} // ease baked in bounceKeys
        anim2(tp.opac, t0, dur * 0.45, 0, 100, "Smooth");
        if (/glow ring/.test(name.toLowerCase())) { var ring = addCircle(layer.containingComp, 360, styleColor(), "DXED Glow Ring"); zeroFill(ring); addStroke(ring, styleColor(), 10); addGlow(ring, 50, 2, styleColor()); centerRingOn(ring, layer); var rs = transformProps(ring).scale; rs.setValueAtTime(t0, [40,40]); rs.setValueAtTime(t0+dur, [120,120]); var ro=transformProps(ring).opac; ro.setValueAtTime(t0,100); ro.setValueAtTime(t0+dur,0); }
        if (/purple burst/.test(name.toLowerCase())) addFlash(layer.containingComp, t0, BRAND.purple, 0.2, 3);
        if (/camera bump/.test(name.toLowerCase())) addCameraBump(layer.containingComp, t0, 10);
        applyMods(layer, m, t0, dur, s);
    }

    function centerRingOn(ring, layer) {
        try { transformProps(ring).pos.setValue(transformProps(layer).pos.value); } catch (e) {}
    }

    function applyFadePreset(layer, name, s) {
        var comp = layer.containingComp, t0 = s.time, dur = s.duration, m = mods(name);
        var slow = /slow|premium|apple|cinematic|soft/.test(name.toLowerCase());
        var fast = /fast|hard|hype/.test(name.toLowerCase());
        var d = slow ? dur * 1.6 : (fast ? dur * 0.6 : dur);
        var tp = transformProps(layer);
        // full-screen fades to/from black/white
        if (/to black|from black|to white|from white/.test(name.toLowerCase())) {
            var col = /white/.test(name.toLowerCase()) ? BRAND.white : BRAND.black;
            var f = addSolid(comp, col, "DXED " + name);
            var fo = transformProps(f).opac;
            if (/from/.test(name.toLowerCase())) { fo.setValueAtTime(t0, 100); fo.setValueAtTime(t0 + d, 0); }
            else { fo.setValueAtTime(t0, 0); fo.setValueAtTime(t0 + d, 100); }
            easeProperty(fo, 70, 70); f.inPoint = t0 - 0.1; f.outPoint = t0 + d + 0.2; return;
        }
        if (m.out) anim2(tp.opac, t0, d, 100, 0, "Smooth");
        else anim2(tp.opac, t0, d, 0, 100, "Smooth");
        var dir = parseDir(name, "Center");
        if (dir !== "Center") { var rest = tp.pos.valueAtTime(t0, false); var off = dirOffset(dir, s.distance * 0.3);
            anim2(tp.pos, t0, d, [rest[0] + off[0], rest[1] + off[1]], rest, "Smooth"); }
        if (/scale/.test(name.toLowerCase())) { var rs = tp.scale.valueAtTime(t0, false); anim2(tp.scale, t0, d, [rs[0]*0.85, rs[1]*0.85], rs, "Smooth"); }
        if (/rotate/.test(name.toLowerCase())) { var rv = tp.rot.valueAtTime(t0, false); anim2(tp.rot, t0, d, rv - 8, rv, "Smooth"); }
        if (m.blur) { var b = addBlur(layer, 30); if (b) { var bp = b.property(1); bp.setValueAtTime(t0, m.out ? 0 : 30); bp.setValueAtTime(t0 + d, m.out ? 30 : 0); easeProperty(bp, 75, 75); } }
        if (/light sweep/.test(name.toLowerCase())) addShineSweepOver(layer, t0 + d * 0.4);
        applyMods(layer, m, t0, d, s);
    }

    function applyBlurPreset(layer, name, s) {
        var comp = layer.containingComp, t0 = s.time, dur = s.duration, m = mods(name);
        var tp = transformProps(layer);
        var dir = parseDir(name, "Center");
        var directional = /directional|motion|zoom/.test(name.toLowerCase());
        var out = m.out || /blur out/.test(name.toLowerCase());
        var maxB = /cinematic|smooth|reveal/.test(name.toLowerCase()) ? 80 : (m.hard || /hit|slam|strong/.test(name.toLowerCase()) ? 120 : 50);
        var b;
        if (directional) b = addDirectionalBlur(layer, maxB, dir === "Left" || dir === "Right" ? 90 : 0);
        else b = addBlur(layer, maxB);
        if (b) {
            var bp = b.property(1) || b.property("Blurriness") || b.property("Blur Length");
            if (bp) { bp.setValueAtTime(t0, out ? 0 : maxB); bp.setValueAtTime(t0 + dur, out ? maxB : 0); easeProperty(bp, 75, 75); }
        }
        anim2(tp.opac, t0, dur * 0.7, out ? 100 : 0, out ? 0 : 100, "Smooth");
        if (dir !== "Center" && /slide/.test(name.toLowerCase())) { var rest = tp.pos.valueAtTime(t0, false); var off = dirOffset(dir, s.distance * 0.6);
            anim2(tp.pos, t0, dur, [rest[0]+off[0], rest[1]+off[1]], rest, "Snappy"); }
        if (/pop/.test(name.toLowerCase())) { var rs = tp.scale.valueAtTime(t0, false); bounceKeys(tp.scale, t0, dur, [rs[0]*0.7, rs[1]*0.7], rs, 1, 0.12); }
        applyMods(layer, m, t0, dur, s);
    }

    function ensureTextLayer(comp, fallbackText) {
        var sel = comp.selectedLayers, tl = null;
        for (var i = 0; i < sel.length; i++) if (sel[i] instanceof TextLayer) { tl = sel[i]; break; }
        if (!tl) tl = addTextLayer(comp, fallbackText || "This is DXED.", 120, BRAND.white);
        return tl;
    }
    function addTextRangeAnim(layer, basedOn, t0, dur, buildFn) {
        var animators = layer.property("ADBE Text Properties").property("ADBE Text Animators");
        var an = animators.addProperty("ADBE Text Animator");
        var sel = an.property("ADBE Text Selectors").addProperty("ADBE Text Selector");
        try { sel.property("ADBE Text Range Advanced").property("ADBE Text Range Type2").setValue(basedOn); } catch (e) {}
        var start = sel.property("ADBE Text Percent Start");
        start.setValueAtTime(t0, 0); start.setValueAtTime(t0 + dur, 100); easeProperty(start, 65, 65);
        buildFn(an.property("ADBE Text Animator Properties"));
        return an;
    }

    function applyTextPreset(layer, name, s) {
        if (!(layer instanceof TextLayer)) { layer = ensureTextLayer(layer.containingComp, name.indexOf("Hero") >= 0 ? "This is DXED." : "DXED"); }
        var comp = layer.containingComp, t0 = s.time, dur = s.duration, m = mods(name), n = name.toLowerCase();
        var tp = transformProps(layer);

        if (/letter/.test(n)) {
            addTextRangeAnim(layer, 1, t0, dur, function (props) {
                props.addProperty("ADBE Text Opacity").setValue(0);
                props.addProperty("ADBE Text Position 3D").setValue([0, 60, 0]);
                if (/bounce/.test(n)) props.addProperty("ADBE Text Scale 3D").setValue([40, 40, 100]);
            });
            anim2(tp.opac, t0, comp.frameDuration, 0, 100, "Smooth");
        } else if (/word/.test(n)) {
            addTextRangeAnim(layer, 3, t0, dur, function (props) {
                props.addProperty("ADBE Text Opacity").setValue(0);
                if (/slide/.test(n)) props.addProperty("ADBE Text Position 3D").setValue([0, 50, 0]);
                if (/pop|bounce/.test(n)) props.addProperty("ADBE Text Scale 3D").setValue([30, 30, 100]);
            });
            if (/flash/.test(n)) addFlash(comp, t0, flashColorForStyle(), 0.12, 2);
            anim2(tp.opac, t0, comp.frameDuration, 0, 100, "Smooth");
        } else if (/type-on/.test(n)) {
            addTextRangeAnim(layer, 1, t0, dur * 1.4, function (props) { props.addProperty("ADBE Text Opacity").setValue(0); });
            anim2(tp.opac, t0, comp.frameDuration, 0, 100, "Smooth");
        } else if (/tracking/.test(n)) {
            var an = layer.property("ADBE Text Properties").property("ADBE Text Animators").addProperty("ADBE Text Animator");
            var tr = an.property("ADBE Text Animator Properties").addProperty("ADBE Text Tracking Amount");
            var tighten = /tighten/.test(n);
            tr.setValueAtTime(t0, tighten ? -8 : 30); tr.setValueAtTime(t0 + dur, 0); easeProperty(tr, 80, 80);
            anim2(tp.opac, t0, dur, 0, 100, "Smooth");
        } else if (/slam|impact/.test(n)) {
            bounceKeys(tp.scale, t0, dur, [180, 180], tp.scale.valueAtTime(t0, false), 1, 0.1);
            anim2(tp.opac, t0, comp.frameDuration * 2, 0, 100, "Smooth");
            addFlash(comp, t0, flashColorForStyle(), 0.12, 2);
        } else if (/glow reveal|glow ring/.test(n)) {
            addGlow(layer, 45, 1.8, styleColor());
            anim2(tp.opac, t0, dur, 0, 100, "Smooth");
            anim2(tp.scale, t0, dur, [90, 90], tp.scale.valueAtTime(t0, false), "Smooth");
            if (/ring/.test(n)) { var ring = addCircle(comp, 420, styleColor(), "DXED Text Ring"); zeroFill(ring); addStroke(ring, styleColor(), 8); addGlow(ring, 40, 2, styleColor()); centerRingOn(ring, layer); }
        } else if (/blur/.test(n)) {
            var b = addBlur(layer, 50); if (b) { var bp = b.property(1); bp.setValueAtTime(t0, 50); bp.setValueAtTime(t0 + dur, 0); easeProperty(bp, 75, 75); }
            anim2(tp.opac, t0, dur, 0, 100, "Smooth");
        } else if (/bounce/.test(n)) {
            bounceKeys(tp.scale, t0, dur, [0, 0], tp.scale.valueAtTime(t0, false), 1, 0.14);
            anim2(tp.opac, t0, dur * 0.5, 0, 100, "Smooth");
        } else if (/scale|pop|cta/.test(n)) {
            bounceKeys(tp.scale, t0, dur, [0, 0], tp.scale.valueAtTime(t0, false), 1, 0.12);
            anim2(tp.opac, t0, dur * 0.45, 0, 100, "Smooth");
        } else if (/slide|fade/.test(n)) {
            var dir = parseDir(name, "Up"); var rest = tp.pos.valueAtTime(t0, false); var off = dirOffset(dir, s.distance * 0.5);
            anim2(tp.pos, t0, dur, [rest[0] + off[0], rest[1] + off[1]], rest, styleEasing());
            anim2(tp.opac, t0, dur * 0.7, 0, 100, "Smooth");
        } else if (/hover loop|pulse loop|bass pulse/.test(n)) {
            try { tp.scale.expression = "s=6*Math.sin(time*4);value+[s,s]"; } catch (e) {}
            anim2(tp.opac, t0, dur, 0, 100, "Smooth");
        } else {
            var rest2 = tp.pos.valueAtTime(t0, false);
            anim2(tp.pos, t0, dur, [rest2[0], rest2[1] + 40], rest2, "Cinematic");
            anim2(tp.opac, t0, dur, 0, 100, "Cinematic");
        }
        // Accent bar / pill / card add-ons.
        if (/purple bar/.test(n)) addAccentBar(comp, layer, BRAND.purple, t0, dur);
        if (/blue bar|underline/.test(n)) addAccentBar(comp, layer, BRAND.blue, t0, dur);
        if (/background pill|pill/.test(n)) addTextPill(comp, layer, t0, dur);
        if (/card/.test(n)) addTextCard(comp, layer, t0, dur);
        if (/shake/.test(n)) addBeatShake(layer, t0, 12);
        try { layer.motionBlur = true; } catch (e) {}
    }

    function addAccentBar(comp, layer, color, t0, dur) {
        var p = transformProps(layer).pos.value;
        var bar = addRoundedRect(comp, [420, 12], 6, color, "DXED Accent Bar");
        transformProps(bar).pos.setValue([p[0], p[1] + 90]); addGlow(bar, 20, 1.4, color);
        bar.moveAfter(layer);
        var sc = transformProps(bar).scale; sc.setValueAtTime(t0, [0, 100]); sc.setValueAtTime(t0 + dur, [100, 100]); easeProperty(sc, 80, 80);
    }
    function addTextPill(comp, layer, t0, dur) {
        var p = transformProps(layer).pos.value;
        var pill = addRoundedRect(comp, [560, 150], 75, BRAND.navy, "DXED Text Pill");
        transformProps(pill).pos.setValue(p); addGlow(pill, 18, 1, BRAND.purple); pill.moveAfter(layer);
        bounceKeys(transformProps(pill).scale, t0, dur, [0, 0], [100, 100], 1, 0.1);
    }
    function addTextCard(comp, layer, t0, dur) {
        var p = transformProps(layer).pos.value;
        var card = addRoundedRect(comp, [720, 300], 30, BRAND.navy, "DXED Text Card");
        transformProps(card).pos.setValue(p); addGlow(card, 20, 1, BRAND.purple); addShadow(card, 60, 140, 14); card.moveAfter(layer);
        bounceKeys(transformProps(card).scale, t0, dur, [0, 0], [100, 100], 1, 0.1);
    }
    function addShineSweepOver(layer, t) {
        try {
            var comp = layer.containingComp; var p = transformProps(layer).pos.value;
            var rect = layer.sourceRectAtTime(comp.time, false);
            var shine = addRoundedRect(comp, [rect.width * 0.25, rect.height * 1.5], 0, BRAND.white, "DXED Shine");
            transformProps(shine).opac.setValue(22); transformProps(shine).rot.setValue(20); shine.blendingMode = BlendingMode.ADD; addBlur(shine, 26);
            var sp = transformProps(shine).pos; sp.setValueAtTime(t, [p[0] - rect.width * 0.7, p[1]]); sp.setValueAtTime(t + 0.6, [p[0] + rect.width * 0.7, p[1]]); easeProperty(sp, 60, 60);
        } catch (e) {}
    }

    /* ===================================================================== *
     *  10. WINDOW FUNCTIONS
     * ===================================================================== */

    function applyWindowPreset(layer, name, s) {
        var comp = (layer && layer.containingComp) || activeComp(); if (!comp) return;
        var t0 = s.time, dur = s.duration, n = name.toLowerCase(), m = mods(name);

        // Placeholder if no real layer given.
        if (!layer) {
            layer = addRoundedRect(comp, [960, 600], 10, hexToRGB("#12122A"), "DXED Screenshot Placeholder");
            var hint = addTextLayer(comp, "DXED.app", 54, BRAND.glow); transformProps(hint).pos.setValue(transformProps(layer).pos.value);
            hint.parent = layer;
        }

        var rect; try { rect = layer.sourceRectAtTime(t0, false); } catch (e) { rect = { width: comp.width * 0.6, height: comp.height * 0.55 }; }
        var pad = 26, barH = 44;
        var fw = rect.width + pad * 2, fh = rect.height + pad * 2 + barH;
        centerLayer(layer, comp);
        var center = transformProps(layer).pos.value;

        var frameColor = /dark tech/.test(n) ? BRAND.navy : (/glass/.test(n) ? BRAND.navy : BRAND.navy);
        var frame = addRoundedRect(comp, [fw, fh], 28, frameColor, "DXED Window Frame");
        transformProps(frame).pos.setValue(center); frame.moveAfter(layer);
        addShadow(frame, 80, 160, 18);
        var borderColor = /blue/.test(n) ? BRAND.blue : BRAND.purple;
        if (/glow|purple glow|blue glow|glow border|premium|dark tech/.test(n) || m.glow) addGlow(frame, 60, 1.6, borderColor);
        if (/glass/.test(n)) { transformProps(frame).opac.setValue(72); addBlur(frame, 6); }

        // Browser dots.
        var dotColors = [hexToRGB("#FF5F57"), hexToRGB("#FEBC2E"), hexToRGB("#28C840")];
        var dots = [];
        for (var d = 0; d < 3; d++) {
            var dot = addCircle(comp, 18, dotColors[d], "Win Dot " + (d + 1));
            transformProps(dot).pos.setValue([center[0] - fw / 2 + 30 + d * 26, center[1] - fh / 2 + 26]);
            dot.moveBefore(frame); dots.push(dot);
        }

        // Controller null groups the window.
        var ctrl = addNull(comp, "DXED Window Ctrl");
        transformProps(ctrl).anchor.setValue([0, 0]); transformProps(ctrl).pos.setValue(center); ctrl.moveBefore(dots[0]);
        layer.parent = ctrl; frame.parent = ctrl; for (var pi = 0; pi < dots.length; pi++) dots[pi].parent = ctrl;

        var cp = transformProps(ctrl); var rest = cp.scale.value;
        // Intro motion by preset.
        if (/slide/.test(n)) { var dir = parseDir(name, "Up"); var off = dirOffset(dir, s.distance);
            anim2(cp.pos, t0, dur, [center[0] + off[0], center[1] + off[1]], center, "Snappy"); anim2(cp.opac, t0, dur * 0.6, 0, 100, "Smooth"); }
        else if (/bounce|pop/.test(n)) { bounceKeys(cp.scale, t0, dur, [0, 0], rest, 1, 0.12); anim2(cp.opac, t0, dur * 0.5, 0, 100, "Smooth"); }
        else if (/zoom out|pull back/.test(n)) { anim2(cp.scale, t0, dur, [rest[0] * 1.4, rest[1] * 1.4], rest, "Cinematic"); anim2(cp.opac, t0, dur * 0.5, 0, 100, "Smooth"); }
        else if (/zoom in|push|hero zoom|feature zoom/.test(n)) { anim2(cp.scale, t0, dur, [rest[0] * 0.6, rest[1] * 0.6], rest, "Cinematic"); anim2(cp.opac, t0, dur * 0.5, 0, 100, "Smooth"); }
        else if (/blur/.test(n)) { var b = addBlur(ctrl, 60); if (b) { var bp = b.property(1); bp.setValueAtTime(t0, 60); bp.setValueAtTime(t0 + dur, 0); easeProperty(bp, 75, 75); } anim2(cp.opac, t0, dur, 0, 100, "Smooth"); }
        else if (/flash/.test(n)) { cp.opac.setValueAtTime(t0, 0); cp.opac.setValueAtTime(t0 + comp.frameDuration, 100); addFlash(comp, t0, BRAND.purple, 0.18, 3); }
        else if (/3d tilt|tilt/.test(n)) { ctrl.threeDLayer = true; layer.threeDLayer = true; frame.threeDLayer = true; bounceKeys(cp.scale, t0, dur, [0, 0], rest, 1, 0.14); anim2(cp.opac, t0, dur * 0.5, 0, 100, "Smooth"); var ry = ctrl.property("ADBE Transform Group").property("ADBE Rotate Y"); if (ry) anim2(ry, t0, dur, -35, 0, "Cinematic"); }
        else if (/exit/.test(n)) { anim2(cp.opac, t0, dur, 100, 0, "Smooth"); if (/slide/.test(n)) anim2(cp.pos, t0, dur, center, [center[0] - s.distance, center[1]], "Snappy"); }
        else if (/stack|carousel/.test(n)) { anim2(cp.pos, t0, dur, [center[0] + s.distance, center[1]], center, "Snappy"); anim2(cp.opac, t0, dur * 0.6, 0, 100, "Smooth"); bounceKeys(cp.scale, t0, dur, [rest[0]*0.9, rest[1]*0.9], rest, 1, 0.08); }
        else { anim2(cp.scale, t0, dur, [rest[0] * 0.75, rest[1] * 0.75], rest, "Overshoot"); anim2(cp.opac, t0, dur * 0.5, 0, 100, "Smooth"); }

        // Continuous float / hover.
        if (/float|hover|slow/.test(n) || true) { try { cp.pos.expression = "wiggle(0.45, 6)"; } catch (e) {} }
        // Extras.
        if (/camera push/.test(n) || m.callout === false && /push/.test(n)) { cp.scale.setValueAtTime(t0 + dur, rest); cp.scale.setValueAtTime(Math.min(comp.duration, t0 + dur + 3), [rest[0] * 1.06, rest[1] * 1.06]); }
        if (/shine|premium frame/.test(n)) addWindowShine(comp, ctrl, center, fw, fh, t0 + dur * 0.5);
        if (/cursor|click|tap/.test(n)) addCursorClick(comp, ctrl, center, t0 + dur + 0.3);
        if (/callout|feature label|feature zoom/.test(n)) addCallout(comp, ctrl, center, fw, fh, /feature/.test(n) ? "Feature" : "New");
        if (/notification/.test(n)) addNotification(comp, ctrl, center, fw, fh, t0 + dur + 0.2);
        if (/floating chips/.test(n)) { for (var c = 0; c < 3; c++) { var chip = addRoundedRect(comp, [180, 64], 32, BRAND.purple, "DXED Chip " + (c+1)); transformProps(chip).opac.setValue(90); transformProps(chip).pos.setValue([center[0] - fw/2 + 120 + c*160, center[1] + fh/2 - 20]); chip.parent = ctrl; bounceKeys(transformProps(chip).scale, t0 + 0.2 + c*0.1, dur, [0,0], [100,100], 1, 0.12); } }
        if (/background glow/.test(n)) { var bgGlow = addCircle(comp, Math.max(fw, fh) * 1.6, borderColor, "DXED Win BG Glow"); transformProps(bgGlow).pos.setValue(center); transformProps(bgGlow).opac.setValue(28); addBlur(bgGlow, 120); bgGlow.moveToEnd(); }

        try { ctrl.motionBlur = true; layer.motionBlur = true; } catch (e) {}
        return ctrl;
    }

    function addWindowShine(comp, ctrl, center, w, h, t) {
        var shine = addRoundedRect(comp, [w * 0.25, h * 1.5], 0, BRAND.white, "DXED Win Shine");
        transformProps(shine).opac.setValue(24); transformProps(shine).rot.setValue(20); shine.blendingMode = BlendingMode.ADD; addBlur(shine, 30); shine.parent = ctrl;
        var sp = transformProps(shine).pos; sp.setValueAtTime(t, [center[0] - w * 0.7, center[1]]); sp.setValueAtTime(t + 0.7, [center[0] + w * 0.7, center[1]]); easeProperty(sp, 60, 60);
        var so = transformProps(shine).opac; so.setValueAtTime(t, 0); so.setValueAtTime(t + 0.1, 24); so.setValueAtTime(t + 0.7, 0);
    }
    function addCursorClick(comp, ctrl, center, t) {
        var cur = addCircle(comp, 34, BRAND.white, "DXED Cursor"); transformProps(cur).pos.setValue([center[0] + 60, center[1] + 40]); cur.parent = ctrl;
        var ring = addCircle(comp, 40, BRAND.purple, "DXED Click Ring"); zeroFill(ring); addStroke(ring, BRAND.purple, 6); transformProps(ring).pos.setValue([center[0] + 60, center[1] + 40]); ring.parent = ctrl;
        var rs = transformProps(ring).scale; rs.setValueAtTime(t, [20, 20]); rs.setValueAtTime(t + 0.4, [220, 220]); var ro = transformProps(ring).opac; ro.setValueAtTime(t, 100); ro.setValueAtTime(t + 0.4, 0);
        var cs = transformProps(cur).scale; cs.setValueAtTime(t, [100, 100]); cs.setValueAtTime(t + 0.08, [80, 80]); cs.setValueAtTime(t + 0.2, [100, 100]);
    }
    function addCallout(comp, ctrl, center, w, h, label) {
        var pill = addRoundedRect(comp, [260, 84], 42, BRAND.purple, "DXED Callout"); addGlow(pill, 20, 1.4, BRAND.purple);
        transformProps(pill).pos.setValue([center[0] + w / 2 - 40, center[1] - h / 2 + 20]); pill.parent = ctrl;
        var txt = addTextLayer(comp, label, 40, BRAND.white); transformProps(txt).pos.setValue(transformProps(pill).pos.value); txt.parent = ctrl;
        bounceKeys(transformProps(pill).scale, comp.time + 0.3, 0.4, [0, 0], [100, 100], 1, 0.14);
    }
    function addNotification(comp, ctrl, center, w, h, t) {
        var card = addRoundedRect(comp, [360, 110], 24, BRAND.navy, "DXED Notification"); addGlow(card, 16, 1, BRAND.purple); addShadow(card, 50, 140, 12);
        transformProps(card).pos.setValue([center[0] + w / 2 - 200, center[1] - h / 2 + 40]); card.parent = ctrl;
        anim2(transformProps(card).pos, t, 0.4, [center[0] + w / 2 + 220, center[1] - h / 2 + 40], transformProps(card).pos.value, "Overshoot");
    }

    /* ===================================================================== *
     *  11. SHAPE FUNCTIONS
     * ===================================================================== */

    function applyShapePreset(name, s) {
        var comp = activeComp(); if (!comp) return;
        var t0 = comp.time, dur = s.duration, n = name.toLowerCase(); seed(CFG.seed + comp.numLayers);
        function bg(layer, op, blur) { transformProps(layer).opac.setValue(op || 30); if (blur) addBlur(layer, blur); layer.moveToEnd(); }

        if (/card/.test(n) && !/stack|pack/.test(n)) {
            var card = addRoundedRect(comp, [640, 360], 32, /profile|post|notification|community|app|social/.test(n) ? BRAND.navy : BRAND.navy, "DXED " + name);
            addGlow(card, 22, 1.1, BRAND.purple); if (/shadow/.test(n)) addShadow(card, 60, 140, 14);
            if (/slide/.test(n)) applySlidePreset(card, "Slide In Up", mergeS(s, { time: t0 }));
            else if (/bounce/.test(n)) applyBouncePreset(card, "Card Bounce In", mergeS(s, { time: t0 }));
            else bounceKeys(transformProps(card).scale, t0, dur, [0, 0], [100, 100], 1, 0.12);
            return card;
        }
        if (/pill/.test(n)) {
            var pill = addRoundedRect(comp, [340, 110], 55, BRAND.purple, "DXED Pill"); transformProps(pill).opac.setValue(92);
            if (/bounce/.test(n)) applyBouncePreset(pill, "Bounce In", mergeS(s, { time: t0 }));
            else applySlidePreset(pill, "Slide In Left", mergeS(s, { time: t0 }));
            try { transformProps(pill).pos.expression = "wiggle(0.4, 10)"; } catch (e) {}
            return pill;
        }
        if (/circle glow|glow circle|glow ring|ring pulse/.test(n)) {
            var c = addCircle(comp, 420, BRAND.purple, "DXED " + name); centerLayer(c, comp);
            if (/ring/.test(n)) { zeroFill(c); addStroke(c, BRAND.purple, 12); }
            addGlow(c, 70, 2, BRAND.glow); transformProps(c).opac.setValue(60);
            if (/pulse/.test(n)) { try { transformProps(c).scale.expression = "s=100+8*Math.sin(time*3);[s,s]"; } catch (e) {} }
            else bounceKeys(transformProps(c).scale, t0, dur, [0, 0], [100, 100], 1, 0.12);
            return c;
        }
        if (/accent bar/.test(n)) {
            var bar = addRoundedRect(comp, [comp.width * 0.5, 14], 7, /blue/.test(n) ? BRAND.blue : BRAND.purple, "DXED Accent Bar");
            addGlow(bar, 25, 1.5, /blue/.test(n) ? BRAND.blue : BRAND.purple);
            var sc = transformProps(bar).scale; sc.setValueAtTime(t0, [0, 100]); sc.setValueAtTime(t0 + dur, [100, 100]); easeProperty(sc, 80, 80); return bar;
        }
        if (/chip/.test(n)) {
            var chip = addRoundedRect(comp, [240, 80], 40, BRAND.purple, "DXED UI Chip"); transformProps(chip).opac.setValue(92);
            bounceKeys(transformProps(chip).scale, t0, dur, [0, 0], [100, 100], 1, 0.14); return chip;
        }
        if (/blob|background glow|dark background/.test(n)) {
            var made = []; var cnt = /pack|shapes|abstract/.test(n) ? 3 : 1;
            for (var i = 0; i < cnt; i++) {
                var col = /blue/.test(n) ? BRAND.blue : (i === 1 ? BRAND.blue : BRAND.purple);
                var blob = addCircle(comp, rr(400, 800), col, "DXED Blob " + (i + 1));
                transformProps(blob).pos.setValue([rr(0, comp.width), rr(0, comp.height)]);
                bg(blob, rr(15, 35), rr(90, 160));
                try { transformProps(blob).pos.expression = "wiggle(0.15, 60)"; } catch (e) {}
                made.push(blob);
            }
            return made;
        }
        if (/shape wipe|rounded rectangle reveal|rounded mask/.test(n)) {
            var dir = parseDir(name, "Left"); var wipe = addRoundedRect(comp, [comp.width * 1.4, comp.height * 1.4], 50, BRAND.purple, "DXED Wipe");
            var sc2 = transformProps(wipe).scale; var from = (dir === "Up" || dir === "Down") ? [140, 0] : [0, 140];
            sc2.setValueAtTime(t0, from); sc2.setValueAtTime(t0 + dur, [140, 140]); easeProperty(sc2, 80, 80); return wipe;
        }
        if (/border/.test(n)) {
            var b = addRoundedRect(comp, [comp.width * 0.7, comp.height * 0.6], 30, BRAND.navy, "DXED Border"); makeBorder(b, BRAND.purple, 6); addGlow(b, 20, 1.4, BRAND.purple);
            if (/pulse|neon/.test(n)) { try { transformProps(b).opac.expression = "50+50*Math.sin(time*4)"; } catch (e) {} }
            else bounceKeys(transformProps(b).scale, t0, dur, [0, 0], [100, 100], 1, 0.1); return b;
        }
        if (/dot pack|trail dots|floating dot/.test(n)) {
            var dots = []; for (var dI = 0; dI < 8; dI++) { var dt = addCircle(comp, rr(10, 26), BRAND.purple, "DXED Dot " + (dI + 1)); transformProps(dt).pos.setValue([rr(0, comp.width), rr(0, comp.height)]); transformProps(dt).opac.setValue(rr(40, 90)); try { transformProps(dt).pos.expression = "wiggle(0.3, 30)"; } catch (e) {} dots.push(dt); } return dots;
        }
        if (/grid line/.test(n)) { var grid = addRoundedRect(comp, [comp.width, comp.height], 0, BRAND.navy, "DXED Grid"); transformProps(grid).opac.setValue(18); grid.moveToEnd(); var sc3 = transformProps(grid).scale; sc3.setValueAtTime(t0, [0, 100]); sc3.setValueAtTime(t0 + dur, [100, 100]); easeProperty(sc3, 80, 80); return grid; }
        if (/corner glow|edge glow/.test(n)) {
            var made2 = []; var pts = /corner/.test(n) ? [[0,0],[comp.width,0],[0,comp.height],[comp.width,comp.height]] : [[comp.width/2,0],[comp.width/2,comp.height]];
            for (var p2 = 0; p2 < pts.length; p2++) { var g2 = addCircle(comp, 500, BRAND.purple, "DXED Glow " + (p2 + 1)); transformProps(g2).pos.setValue(pts[p2]); transformProps(g2).opac.setValue(24); addBlur(g2, 120); g2.moveToEnd(); made2.push(g2); } return made2;
        }
        if (/burst|flash/.test(n)) {
            var burst = addCircle(comp, 60, BRAND.purple, "DXED Shape Burst"); centerLayer(burst, comp); zeroFill(burst); makeBorderCircle(burst, BRAND.purple, 10);
            var bs = transformProps(burst).scale; bs.setValueAtTime(t0, [10, 10]); bs.setValueAtTime(t0 + dur, [600, 600]); var bo = transformProps(burst).opac; bo.setValueAtTime(t0, 100); bo.setValueAtTime(t0 + dur, 0); return burst;
        }
        if (/stack|pack|premium background|social ui|feature card/.test(n)) {
            var group = [];
            group.push(applyShapePreset("Dark Background Glow", s));
            for (var g3 = 0; g3 < 3; g3++) { var cd = addRoundedRect(comp, [360, 220], 28, BRAND.navy, "DXED Stack Card " + (g3 + 1)); addGlow(cd, 18, 1, BRAND.purple); transformProps(cd).pos.setValue([comp.width * (0.3 + g3 * 0.2), comp.height * 0.6]); bounceKeys(transformProps(cd).scale, t0 + g3 * 0.12, dur, [0, 0], [100, 100], 1, 0.12); group.push(cd); }
            return group;
        }
        if (/liquid|abstract/.test(n)) return applyShapePreset("Background Blob Float", s);
        // default rounded card
        var def = addRoundedRect(comp, [520, 320], 30, BRAND.navy, "DXED Shape"); addGlow(def, 20, 1, BRAND.purple); bounceKeys(transformProps(def).scale, t0, dur, [0, 0], [100, 100], 1, 0.12); return def;
    }
    function makeBorder(shapeLayer, color, w) { addStroke(shapeLayer, color, w); zeroFill(shapeLayer); }
    function makeBorderCircle(shapeLayer, color, w) { addStroke(shapeLayer, color, w); }

    function mergeS(base, extra) { var o = {}; for (var k in base) if (base.hasOwnProperty(k)) o[k] = base[k]; for (var k2 in extra) if (extra.hasOwnProperty(k2)) o[k2] = extra[k2]; return o; }

    function addShapePack(comp) {
        undoable("Add Shape Pack", function () {
            var s = buildSettings();
            applyShapePreset("Dark Background Glow", s);
            applyShapePreset("Floating Purple Blob", s);
            applyShapePreset("Floating Blue Blob", s);
            applyShapePreset("Rounded Card In", s);
            applyShapePreset("Pill Slide In", s);
            applyShapePreset("Floating Dot Pack", s);
            applyShapePreset("UI Chip Pop", s);
            applyShapePreset("Purple Accent Bar", s);
        });
    }

    /* ===================================================================== *
     *  12. FLASH / IMPACT + TRANSITIONS + CAMERA
     * ===================================================================== */

    function addFlash(comp, t, color, len, strength) {
        len = len || 0.2; strength = strength || 2;
        var f = addSolid(comp, color || BRAND.white, "DXED Flash"); f.blendingMode = BlendingMode.ADD;
        var op = transformProps(f).opac; var peak = clamp(55 + strength * 15, 40, 100);
        op.setValueAtTime(t, 0); op.setValueAtTime(t + len * 0.25, peak); op.setValueAtTime(t + len, 0); easeProperty(op, 80, 80);
        f.inPoint = Math.max(0, t - 0.05); f.outPoint = t + len + 0.1;
        if (strength >= 3) addGlow(f, 30, 2, color || BRAND.white);
        return f;
    }
    function addBeatShake(layer, t, amt) {
        var p = transformProps(layer).pos; var base = p.valueAtTime(t, false); seed(CFG.seed + Math.round(t * 100));
        for (var i = 0; i < 4; i++) { var tt = t + i * 0.04; var jx = (i === 3) ? 0 : rr(-amt, amt); var jy = (i === 3) ? 0 : rr(-amt, amt); p.setValueAtTime(tt, [base[0] + jx, base[1] + jy]); }
    }
    function addCameraBump(comp, t, amt) {
        var adj = addAdjust(comp, "DXED Camera Bump"); var tr = addTransformFX(adj);
        if (tr) { var sc = tr.property("Scale"); if (sc) { var base = sc.value; sc.setValueAtTime(t, base); sc.setValueAtTime(t + 0.06, [base[0] * (1 + amt / 100), base[1] * (1 + amt / 100)]); sc.setValueAtTime(t + 0.28, base); easeProperty(sc, 70, 70); } }
        adj.inPoint = Math.max(0, t - 0.05); adj.outPoint = t + 0.4; return adj;
    }

    function applyFlashPreset(time, name, s) {
        var comp = activeComp(); if (!comp) return;
        var n = name.toLowerCase();
        var color = /purple/.test(n) ? BRAND.purple : (/blue/.test(n) ? BRAND.blue : (/white/.test(n) ? BRAND.white : flashColorForStyle()));
        var strength = /hard|strong|bass|hype|impact/.test(n) ? 3 : (/soft|micro|clean|premium/.test(n) ? 1 : 2);
        var len = /micro|fast|strobe/.test(n) ? 0.08 : (/soft|light sweep|lens/.test(n) ? 0.3 : 0.16);
        if (/strobe/.test(n)) { for (var i = 0; i < 4; i++) addFlash(comp, time + i * 0.1, color, 0.06, strength); return; }
        if (/glow burst|glow/.test(n)) { var f = addFlash(comp, time, /purple/.test(n) ? BRAND.purple : BRAND.glow, 0.3, 3); addGlow(f, 60, 3, BRAND.purple); return; }
        if (/edge glow|background/.test(n)) { var eg = addAdjust(comp, "DXED " + name); addGlow(eg, 40, 2, color); var eo = transformProps(eg).opac; eo.setValueAtTime(time, 0); eo.setValueAtTime(time + 0.15, 100); eo.setValueAtTime(time + 0.6, 0); eg.inPoint = time; eg.outPoint = time + 0.7; return; }
        if (/ui ripple/.test(n)) { var rp = addCircle(comp, 40, BRAND.purple, "DXED Ripple"); centerLayer(rp, comp); zeroFill(rp); addStroke(rp, BRAND.purple, 8); var rs = transformProps(rp).scale; rs.setValueAtTime(time, [10, 10]); rs.setValueAtTime(time + 0.5, [500, 500]); var ro = transformProps(rp).opac; ro.setValueAtTime(time, 100); ro.setValueAtTime(time + 0.5, 0); rp.inPoint = time; rp.outPoint = time + 0.6; return; }
        if (/light sweep|lens/.test(n)) { var sweep = addSolid(comp, BRAND.white, "DXED Light Sweep"); sweep.blendingMode = BlendingMode.ADD; addBlur(sweep, 60); var sp = transformProps(sweep).pos; var c = [comp.width / 2, comp.height / 2]; sp.setValueAtTime(time, [-comp.width / 2, c[1]]); sp.setValueAtTime(time + 0.5, [comp.width * 1.5, c[1]]); var so = transformProps(sweep).opac; so.setValueAtTime(time, 0); so.setValueAtTime(time + 0.1, 60); so.setValueAtTime(time + 0.5, 0); sweep.inPoint = time - 0.05; sweep.outPoint = time + 0.6; return; }
        var flash = addFlash(comp, time, color, len, strength);
        if (/shake/.test(n)) { var sl = comp.selectedLayers[0]; if (sl) addBeatShake(sl, time, 14); else addCameraBump(comp, time, 8); }
        if (/zoom|camera/.test(n)) addCameraBump(comp, time, 12);
        if (/blur/.test(n)) { var adj = addAdjust(comp, "DXED Flash Blur"); var b = addBlur(adj, 0); if (b) { var bp = b.property(1); bp.setValueAtTime(time, 40); bp.setValueAtTime(time + 0.2, 0); easeProperty(bp, 80, 80); } adj.inPoint = time - 0.05; adj.outPoint = time + 0.3; }
        if (/pop/.test(n)) { var pl = comp.selectedLayers[0]; if (pl) { var ps = transformProps(pl).scale; var base = ps.valueAtTime(time, false); bounceKeys(ps, time, 0.3, [base[0]*0.8, base[1]*0.8], base, 1, 0.14); } }
        if (/slide/.test(n)) { var sl2 = comp.selectedLayers[0]; if (sl2) applySlidePreset(sl2, "Fast Slide Left", mergeS(s, { time: time })); }
    }

    function applyTransitionPreset(time, name, s) {
        var comp = activeComp(); if (!comp) return;
        var n = name.toLowerCase(); var dur = s.duration * 0.7;
        if (/white flash|scene flash|hard beat|fast hype|zoom flash|clean premium cut|bass hit/.test(n)) { addFlash(comp, time, /purple/.test(n) ? BRAND.purple : BRAND.white, 0.18, 3); if (/zoom|bass|beat/.test(n)) addCameraBump(comp, time, 12); return; }
        if (/purple flash/.test(n)) { addFlash(comp, time, BRAND.purple, 0.2, 2); return; }
        if (/blue flash/.test(n)) { addFlash(comp, time, BRAND.blue, 0.2, 2); return; }
        if (/glow wipe|scene glow|glow cut/.test(n)) { var gw = addRoundedRect(comp, [comp.width * 1.6, comp.height * 1.6], 40, BRAND.purple, "DXED Glow Wipe"); addGlow(gw, 60, 2, BRAND.glow); var sc = transformProps(gw).scale; sc.setValueAtTime(time, [0, 0]); sc.setValueAtTime(time + dur, [170, 170]); easeProperty(sc, 80, 80); var o = transformProps(gw).opac; o.setValueAtTime(time, 100); o.setValueAtTime(time + dur, 0); gw.inPoint = time - 0.05; gw.outPoint = time + dur + 0.1; return; }
        if (/circle reveal/.test(n)) { var cr = addCircle(comp, Math.max(comp.width, comp.height) * 2, BRAND.black, "DXED Circle Wipe"); centerLayer(cr, comp); var cs = transformProps(cr).scale; cs.setValueAtTime(time, [100, 100]); cs.setValueAtTime(time + dur, [0, 0]); easeProperty(cs, 80, 80); cr.inPoint = time - 0.05; cr.outPoint = time + dur + 0.1; return; }
        if (/rectangle wipe|card wipe|shape wipe|text wipe|card stack/.test(n)) { var rw = addRoundedRect(comp, [comp.width * 1.4, comp.height * 1.4], 60, BRAND.navy, "DXED Wipe"); var rs = transformProps(rw).scale; rs.setValueAtTime(time, [0, 100]); rs.setValueAtTime(time + dur, [140, 140]); easeProperty(rs, 80, 80); rw.inPoint = time - 0.05; rw.outPoint = time + dur + 0.2; return; }
        if (/slide wipe/.test(n)) { var dir = parseDir(name, "Left"); var sw = addSolid(comp, BRAND.navy, "DXED Slide Wipe"); var off = dirOffset(dir, comp.width); var sp = transformProps(sw).pos; var c = [comp.width / 2, comp.height / 2]; sp.setValueAtTime(time, [c[0] + off[0], c[1] + off[1]]); sp.setValueAtTime(time + dur, c); sp.setValueAtTime(time + dur * 2, [c[0] - off[0], c[1] - off[1]]); easeProperty(sp, 70, 70); sw.inPoint = time - 0.05; sw.outPoint = time + dur * 2 + 0.1; return; }
        if (/whip pan/.test(n)) { var adj = addAdjust(comp, "DXED Whip"); var db = addBlur(adj, 0); if (db) { var bp = db.property(1); try { db.property("Blur Dimensions").setValue(2); } catch (e) {} bp.setValueAtTime(time - dur / 2, 0); bp.setValueAtTime(time, 120); bp.setValueAtTime(time + dur / 2, 0); easeProperty(bp, 70, 70); } adj.inPoint = time - dur; adj.outPoint = time + dur; addFlash(comp, time, BRAND.white, 0.08, 1); return; }
        if (/glitch|rgb split/.test(n)) { addFlash(comp, time, BRAND.purple, 0.1, 2); var g = addAdjust(comp, "DXED " + name); addBeatShake(g, time, 16); g.inPoint = time - 0.1; g.outPoint = time + 0.3; return; }
        if (/window push|window pull|app window|screenshot push/.test(n)) { addCameraBump(comp, time, 14); addFlash(comp, time, BRAND.purple, 0.14, 2); return; }
        if (/light sweep/.test(n)) { applyFlashPreset(time, "Light Sweep Flash", s); return; }
        // default fade / blur fade / apple / premium
        var f = addSolid(comp, BRAND.black, "DXED Fade"); if (/blur|premium blur|dark tech/.test(n)) addBlur(f, 20);
        var fo = transformProps(f).opac; fo.setValueAtTime(time - dur / 2, 0); fo.setValueAtTime(time, 100); fo.setValueAtTime(time + dur / 2, 0); easeProperty(fo, 70, 70); f.inPoint = time - dur; f.outPoint = time + dur;
    }

    function ensureCameraRig(comp) {
        var cam = null;
        for (var i = 1; i <= comp.numLayers; i++) if (comp.layer(i) instanceof CameraLayer) { cam = comp.layer(i); break; }
        if (!cam) cam = comp.layers.addCamera("DXED Camera", [comp.width / 2, comp.height / 2]);
        var ctrl = null;
        for (var j = 1; j <= comp.numLayers; j++) if (comp.layer(j).name === "DXED Cam Ctrl") { ctrl = comp.layer(j); break; }
        if (!ctrl) { ctrl = addNull(comp, "DXED Cam Ctrl"); ctrl.threeDLayer = true; try { cam.parent = ctrl; } catch (e) {} }
        return { cam: cam, ctrl: ctrl };
    }
    // Camera presets: real camera+null rig PLUS a visible adjustment-Transform mover
    function applyCameraPreset(name, s) {
        var comp = activeComp(); if (!comp) return;
        var t0 = comp.time, dur = s.duration, n = name.toLowerCase();
        ensureCameraRig(comp);   // guarantees a camera + null controller exist
        var mover = addAdjust(comp, "DXED " + name); var tr = addTransformFX(mover);
        if (!tr) return; var sc = tr.property("Scale"), pos = tr.property("Position"), rot = tr.property("Rotation");
        var base = sc.value;
        function scaleTo(mult, d, ease) { sc.setValueAtTime(t0, base); sc.setValueAtTime(t0 + d, [base[0] * mult, base[1] * mult]); easeProperty(sc, ease === "fast" ? 40 : 85, ease === "fast" ? 30 : 85); }
        if (/slow push|parallax push|final outro|macro/.test(n)) { scaleTo(/macro/.test(n) ? 1.5 : 1.12, /final|slow/.test(n) ? dur * 3 : dur * 2, "slow"); }
        else if (/slow pull|pull back/.test(n)) { sc.setValueAtTime(t0, [base[0] * 1.3, base[1] * 1.3]); sc.setValueAtTime(t0 + dur * 2, base); easeProperty(sc, 85, 85); }
        else if (/fast zoom in|snap zoom|flash zoom/.test(n)) { scaleTo(1.4, dur, "fast"); if (/flash/.test(n)) addFlash(comp, t0, BRAND.white, 0.12, 2); }
        else if (/fast zoom out/.test(n)) { sc.setValueAtTime(t0, [base[0] * 1.4, base[1] * 1.4]); sc.setValueAtTime(t0 + dur, base); easeProperty(sc, 40, 30); }
        else if (/bump|impact|marker hit|every 4/.test(n)) { sc.setValueAtTime(t0, base); sc.setValueAtTime(t0 + 0.06, [base[0] * 1.12, base[1] * 1.12]); sc.setValueAtTime(t0 + 0.28, base); easeProperty(sc, 70, 70); mover.outPoint = t0 + 0.4; }
        else if (/shake/.test(n)) { var amt = /hard|bass/.test(n) ? 24 : (/soft/.test(n) ? 8 : 16); var basePos = pos.value; seed(CFG.seed); for (var i = 0; i < 6; i++) { pos.setValueAtTime(t0 + i * 0.05, [basePos[0] + (i === 5 ? 0 : rr(-amt, amt)), basePos[1] + (i === 5 ? 0 : rr(-amt, amt))]); } mover.outPoint = t0 + 0.4; }
        else if (/pan left|slide up|slide down|pan right|whip/.test(n)) { var bp = pos.value; var off = dirOffset(parseDir(name, "Left"), /whip/.test(n) ? 400 : 200); pos.setValueAtTime(t0, [bp[0] + off[0], bp[1] + off[1]]); pos.setValueAtTime(t0 + dur, bp); easeProperty(pos, /whip/.test(n) ? 40 : 85, /whip/.test(n) ? 30 : 85); if (/whip/.test(n)) addFlash(comp, t0, BRAND.white, 0.08, 1); }
        else if (/tilt|orbit/.test(n)) { var br = rot.value; rot.setValueAtTime(t0, br + (/down/.test(n) ? -6 : (/up/.test(n) ? 6 : -8))); rot.setValueAtTime(t0 + dur, br); easeProperty(rot, 85, 85); if (/orbit/.test(n)) scaleTo(1.08, dur, "slow"); }
        else if (/drift|hover/.test(n)) { try { pos.expression = "wiggle(0.3, 20)"; } catch (e) {} }
        else if (/fly through/.test(n)) { scaleTo(1.6, dur * 1.5, "slow"); }
        else { scaleTo(1.1, dur * 2, "slow"); }
    }

    /* ===================================================================== *
     *  13. BEAT SYNC FUNCTIONS
     * ===================================================================== */

    function markerTimes(comp) {
        var t = []; try { var mp = comp.markerProperty; for (var i = 1; i <= mp.numKeys; i++) t.push(mp.keyTime(i)); } catch (e) {} return t;
    }
    function addCompMarker(comp, t, txt) { comp.markerProperty.setValueAtTime(t, new MarkerValue(txt || "")); }
    function addBeatMarkers(comp, interval, count) {
        undoable("Add Beat Markers", function () { var t = comp.time; for (var i = 0; i < count; i++) addCompMarker(comp, t + i * interval, "beat " + (i + 1)); });
    }
    function needMarkers(comp) {
        var m = markerTimes(comp);
        if (m.length === 0) { alert("No comp markers found.\nPlace markers on the beat (tap * on the numpad while playing),\nor use Beat Sync > Add Beat Markers.", SCRIPT_NAME); return null; }
        return m;
    }

    function applyBeatSyncPreset(name, s) {
        var comp = activeComp(); if (!comp) return;
        var markers = needMarkers(comp); if (!markers) return;
        var layers = comp.selectedLayers; var n = name.toLowerCase(); seed(CFG.seed);
        var everyN = /every 8/.test(n) ? 8 : (/every 4|strong hit/.test(n) ? 4 : 1);

        for (var mi = 0; mi < markers.length; mi++) {
            var t = markers[mi] + CFG.markerOffset;
            var strong = ((mi + 1) % 4 === 0);
            var doIt = true;
            if (/every other|alternate/.test(n)) doIt = (mi % 2 === 0);
            if (/every 4|strong hit/.test(n)) doIt = ((mi + 1) % 4 === 0);
            if (/every 8|heavy/.test(n)) doIt = ((mi + 1) % 8 === 0);
            if (/between markers|micro flash/.test(n)) { if (mi < markers.length - 1) addFlash(comp, (markers[mi] + markers[mi + 1]) / 2, BRAND.white, 0.08, 1); continue; }

            if (/flash/.test(n)) { if (doIt) addFlash(comp, t, strong ? BRAND.purple : BRAND.white, strong ? 0.2 : 0.14, strong ? 3 : (everyN > 1 ? 3 : 1)); continue; }
            if (/camera bump/.test(n)) { if (doIt) addCameraBump(comp, t, strong ? 16 : 10); continue; }
            if (/scene cut|auto scene/.test(n)) { applyTransitionPreset(t, "Hard Beat Cut", s); continue; }

            // layer-targeted behaviors
            if (!layers || layers.length === 0) { if (mi === 0) alert("Select layers for this beat-sync preset (or use a flash/camera preset).", SCRIPT_NAME); break; }
            for (var li = 0; li < layers.length; li++) {
                if (!doIt) continue;
                var lyr = layers[li]; var tp = transformProps(lyr); var animLen = Math.max(0.15, s.duration * 0.6);
                if (/bounce|scale hit|pop|logo pulse|shape pulse|window impact|window zoom|shape burst/.test(n)) {
                    var base = tp.scale.valueAtTime(t, false); var pop = (strong ? 26 : 12) * (1 + 0.4 * CFG.bounce);
                    tp.scale.setValueAtTime(t, base); tp.scale.setValueAtTime(t + animLen * 0.35, [base[0] * (1 + pop / 100), base[1] * (1 + pop / 100)]); tp.scale.setValueAtTime(t + animLen, base); easeProperty(tp.scale, 75, 75);
                } else if (/slide/.test(n)) {
                    var dir = /alternate/.test(n) ? (mi % 2 === 0 ? "Left" : "Right") : "Left"; var restP = tp.pos.valueAtTime(t, false); var off = dirOffset(dir, 60);
                    tp.pos.setValueAtTime(t, [restP[0] + off[0], restP[1] + off[1]]); tp.pos.setValueAtTime(t + animLen, restP); easeProperty(tp.pos, 60, 60);
                } else if (/glow pulse/.test(n)) {
                    if (mi === 0) addGlow(lyr, 30, 1.5, BRAND.purple);
                } else if (/blur hit/.test(n)) {
                    var b = addBlur(lyr, 0); if (b) { var bp = b.property(1); bp.setValueAtTime(t, 30); bp.setValueAtTime(t + animLen, 0); easeProperty(bp, 80, 80); }
                } else if (/text pop/.test(n) && lyr instanceof TextLayer) {
                    var bs = tp.scale.valueAtTime(t, false); tp.scale.setValueAtTime(t, [bs[0] * 0.85, bs[1] * 0.85]); tp.scale.setValueAtTime(t + animLen * 0.4, [bs[0] * 1.1, bs[1] * 1.1]); tp.scale.setValueAtTime(t + animLen, bs); easeProperty(tp.scale, 75, 75);
                } else if (/random preset/.test(n)) {
                    applyBouncePreset(lyr, pick(BOUNCE), mergeS(s, { time: t }));
                } else {
                    var b2 = tp.scale.valueAtTime(t, false); tp.scale.setValueAtTime(t, b2); tp.scale.setValueAtTime(t + animLen * 0.35, [b2[0] * 1.12, b2[1] * 1.12]); tp.scale.setValueAtTime(t + animLen, b2); easeProperty(tp.scale, 75, 75);
                }
                if (strong && /strong|heavy|hype|window impact/.test(n)) addFlash(comp, t, BRAND.white, 0.14, 2);
            }
        }
        if (/hype edit/.test(n)) for (var f = 0; f < markers.length; f++) if ((f + 1) % 4 === 0) addFlash(comp, markers[f], BRAND.purple, 0.16, 3);
    }

    /* ===================================================================== *
     *  14. COMBO PRESETS
     * ===================================================================== */

    function applyComboPreset(layer, name, s) {
        // Combo names are "A + B + C"; apply each token as a sub-effect.
        var comp = (layer && layer.containingComp) || activeComp(); if (!comp) return;
        var tokens = name.split("+"); var t0 = s.time;
        for (var i = 0; i < tokens.length; i++) {
            var tok = tokens[i].replace(/^\s+|\s+$/g, ""); var tl = tok.toLowerCase();
            if (/bounce/.test(tl)) applyBouncePreset(layer, tok.indexOf("Stack") >= 0 ? "Bounce Stack" : "Bounce In", s);
            else if (/slide/.test(tl)) applySlidePreset(layer, tok, s);
            else if (/pop|scale/.test(tl)) applyPopPreset(layer, "Scale Pop", s);
            else if (/glow reveal|tracking|type-on|underline/.test(tl) && layer instanceof TextLayer) applyTextPreset(layer, tok, s);
            else if (/window|3d tilt|shine|glow border|cursor/.test(tl)) applyWindowPreset(layer, tok, s);
            else if (/glow ring|glow/.test(tl)) addGlow(layer, 30, 1.6, styleColor());
            else if (/blur/.test(tl)) applyBlurPreset(layer, "Blur Reveal", s);
            else if (/flash|purple burst/.test(tl)) addFlash(comp, t0, /purple/.test(tl) ? BRAND.purple : flashColorForStyle(), 0.16, 3);
            else if (/camera push|camera bump/.test(tl)) { if (/push/.test(tl)) applyCameraPreset("Slow Push In", s); else addCameraBump(comp, t0, 12); }
            else if (/shake/.test(tl)) addBeatShake(layer, t0, 14);
            else if (/shadow/.test(tl)) addShadow(layer, 60, 150, 14);
            else if (/float|hover/.test(tl)) { try { transformProps(layer).pos.expression = "wiggle(0.5, 6)"; } catch (e) {} }
            else if (/settle/.test(tl)) { /* handled by bounce easing */ }
            else if (/stagger/.test(tl)) { /* handled at apply loop */ }
            else if (/fade/.test(tl)) applyFadePreset(layer, "Fade In", s);
        }
        try { layer.motionBlur = true; } catch (e) {}
    }

    /* ===================================================================== *
     *  15. FULL SCENE PRESETS + FULL PROMO SEQUENCE BUILDER
     * ===================================================================== */

    // Build a single scene into `comp` starting at t0 over segLen. Returns recipe lines.
    function buildScene(comp, sceneName, t0, segLen, assets, s) {
        var d = s.duration; var segEnd = t0 + segLen; var lines = [sceneName, fmtTime(t0) + " - " + fmtTime(segEnd)];
        var n = sceneName.toLowerCase();
        if (/logo intro/.test(n)) {
            var logo;
            if (assets.logo && assets.logo instanceof TextLayer) logo = addTextLayer(comp, getTextString(assets.logo, "DXED"), 200, BRAND.white);
            else if (assets.logo) { logo = placeAsset(assets.logo, comp); centerLayer(logo, comp); }
            else logo = addTextLayer(comp, "DXED", 200, BRAND.white);
            addGlow(logo, 60, 2, BRAND.purple);
            applyPopPreset(logo, "Logo Impact Pop", mergeS(s, { time: t0 }));
            animateOutLayer(logo, segEnd, 0.4);
            applyShapePreset("Glow Ring Pulse", mergeS(s, { time: t0 }));
            applyShapePreset("Purple Accent Bar", s);
            applyTransitionPreset(segEnd - 0.05, "Purple Flash Transition", s);
            lines.push("Preset: Logo Impact Pop + Purple Glow Pulse + Accent Bar", "Transition: Purple Flash Cut");
        } else if (/hero/.test(n)) {
            applyShapePreset("Premium Background Shapes", s);
            var hero = addTextLayer(comp, "This is DXED.", 150, BRAND.white);
            applyTextPreset(hero, "Text Slam", mergeS(s, { time: t0 }));
            applyCameraPreset("Slow Push In", mergeS(s, { time: t0 }));
            animateOutLayer(hero, segEnd, 0.4);
            applyTransitionPreset(segEnd - 0.05, "White Flash Transition", s);
            lines.push("Preset: Kinetic Text Slam + Smooth Camera Push", "Transition: White Flash Cut");
        } else if (/app window|window reveal/.test(n)) {
            var cap = addTextLayer(comp, "Create. Post. Connect.", 90, BRAND.white); transformProps(cap).pos.setValue([comp.width / 2, comp.height * 0.16]);
            applyTextPreset(cap, "Word Pop", mergeS(s, { time: t0 + 0.2 }));
            var shot = assets.shots.length ? placeAsset(assets.shots[0], comp) : null;
            applyWindowPreset(shot, "Window Slide Left + Glow Border", mergeS(s, { time: t0, distance: 500 }));
            applyTransitionPreset(segEnd - 0.05, "Zoom Flash Cut", s);
            lines.push("Preset: Floating Browser Window (slide + glow border + browser dots)", "Marker hits: window slide, glow border, camera push", "Transition: Zoom Flash Cut");
        } else if (/creator/.test(n)) {
            var ct = addTextLayer(comp, "Built for creators.", 120, BRAND.white); transformProps(ct).pos.setValue([comp.width / 2, comp.height * 0.3]);
            applyTextPreset(ct, "Text Fade Up", mergeS(s, { time: t0 }));
            for (var c = 0; c < 3; c++) { var card = addRoundedRect(comp, [360, 220], 28, BRAND.navy, "Creator Card " + (c + 1)); addGlow(card, 20, 1, BRAND.purple); transformProps(card).pos.setValue([comp.width * (0.28 + c * 0.22), comp.height * 0.66]); applyPopPreset(card, "Card Pop", mergeS(s, { time: t0 + 0.2 + c * 0.12 })); }
            applyShapePreset("Floating Purple Blob", s);
            applyTransitionPreset(segEnd - 0.05, "Glow Wipe", s);
            lines.push("Preset: Feature cards pop + UI chips + floating blobs", "Transition: Glow Wipe");
        } else if (/community/.test(n)) {
            var comt = addTextLayer(comp, "Find your community.", 120, BRAND.white); transformProps(comt).pos.setValue([comp.width / 2, comp.height * 0.28]);
            applyTextPreset(comt, "Text Glow Reveal", mergeS(s, { time: t0 }));
            for (var cc = 0; cc < 5; cc++) { var chip = addRoundedRect(comp, [230, 90], 45, BRAND.purple, "Community Card " + (cc + 1)); transformProps(chip).opac.setValue(92); transformProps(chip).pos.setValue([comp.width * (0.18 + cc * 0.16), comp.height * 0.62]); applySlidePreset(chip, "Slide In Up", mergeS(s, { time: t0 + 0.15 + cc * 0.1 })); }
            applyTransitionPreset(segEnd - 0.05, "Smooth Apple Fade", s);
            lines.push("Preset: Multiple rounded cards slide + text glow reveal", "Transition: Smooth Apple Fade");
        } else if (/projects/.test(n)) {
            applyShapePreset("Premium Background Shapes", s);
            var pt = addTextLayer(comp, "Projects can build here too.", 100, BRAND.white);
            applyTextPreset(pt, "Premium Tech Text Reveal", mergeS(s, { time: t0 }));
            var shot2 = assets.shots.length > 1 ? placeAsset(assets.shots[1], comp) : null;
            applyWindowPreset(shot2, "Window Zoom In + Glow Border", mergeS(s, { time: t0 + 0.3 }));
            applyTransitionPreset(segEnd - 0.05, "Purple Flash Transition", s);
            lines.push("Preset: Premium reveal + Window Zoom (serious tone)", "Transition: Clean Purple Flash");
        } else if (/final cta|cta/.test(n)) {
            var join = addTextLayer(comp, "Join DXED.", 160, BRAND.white); transformProps(join).pos.setValue([comp.width / 2, comp.height * 0.42]); addGlow(join, 50, 2, BRAND.purple);
            applyPopPreset(join, "Pop With Glow Ring", mergeS(s, { time: t0 }));
            var url = addTextLayer(comp, "DXED.app", 90, BRAND.glow); transformProps(url).pos.setValue([comp.width / 2, comp.height * 0.6]);
            applyTextPreset(url, "Text Glow Reveal", mergeS(s, { time: t0 + 0.4 }));
            applyCameraPreset("Final Outro Push", mergeS(s, { time: t0 }));
            addFlash(comp, segEnd - 0.4, BRAND.white, 0.5, 2);
            lines.push("Preset: Logo glow outro + slow camera push + final flash");
        }
        return lines.join("\n");
    }
    function getTextString(layer, fallback) {
        try { return layer.property("ADBE Text Properties").property("ADBE Text Document").value.text || fallback; } catch (e) { return fallback; }
    }
    function animateOutLayer(layer, tEnd, dur) { var op = transformProps(layer).opac; op.setValueAtTime(tEnd - dur, 100); op.setValueAtTime(tEnd, 0); easeProperty(op, 75, 75); }
    function placeAsset(layer, comp) {
        try { if (layer.containingComp === comp) return layer; if (layer.source) return comp.layers.add(layer.source); } catch (e) {}
        return addRoundedRect(comp, [960, 600], 10, hexToRGB("#12122A"), "Screenshot Placeholder");
    }

    function applyScenePreset(name, s) {
        var comp = activeComp(); if (!comp) return;
        undoable("Scene: " + name, function () {
            var assets = grabAssets(comp);
            buildScene(comp, name.replace(" Scene", ""), comp.time, 3.0, assets, s);
        });
    }

    function grabAssets(comp) {
        var sel = comp.selectedLayers || []; var logo = null, shots = [];
        for (var i = 0; i < sel.length; i++) {
            try {
                if (!logo && (sel[i] instanceof TextLayer)) logo = sel[i];
                else if (sel[i].source && (sel[i].source instanceof FootageItem || sel[i].source instanceof CompItem)) { shots.push(sel[i]); if (!logo) logo = sel[i]; }
            } catch (e) {}
        }
        return { logo: logo, shots: shots };
    }

    function buildFullPromo() {
        undoable("Build Full DXED Promo", function () {
            var s = buildSettings();
            var srcComp = activeComp(true);
            var assets = srcComp ? grabAssets(srcComp) : { logo: null, shots: [] };
            var comp = app.project.items.addComp("DXED Promo Motion Sequence", 1920, 1080, 1, 15, 30);
            comp.openInViewer();
            addSolid(comp, BRAND.black, "DXED BG").moveToEnd();

            var plan = [
                ["Scene 01 - DXED Logo Intro",       2.0],
                ["Scene 02 - Hero Statement",        2.0],
                ["Scene 03 - App Window Reveal",     2.6],
                ["Scene 04 - Creator Section",       2.2],
                ["Scene 05 - Community Section",     2.2],
                ["Scene 06 - Projects Section",      2.0],
                ["Scene 07 - Final CTA",             2.0]
            ];
            var t = 0, recipe = [];
            for (var i = 0; i < plan.length; i++) {
                addCompMarker(comp, t, plan[i][0]);
                recipe.push(buildScene(comp, plan[i][0], t, plan[i][1], assets, s));
                t += plan[i][1];
            }
            comp.comment = recipe.join("\n\n");
            buildRecipeLayer(comp, recipe);
            alert("Built 'DXED Promo Motion Sequence'\n" + plan.length + " scenes, 15s, markers per scene.\nRecipe saved to comp comment + guide layer.", SCRIPT_NAME);
        });
    }

    /* ===================================================================== *
     *  16. SCREENSHOT WINDOW / RECIPE EXPORT
     * ===================================================================== */

    function makeScreenshotWindow() {
        var comp = activeComp(); if (!comp) return;
        var s = buildSettings(); var sel = comp.selectedLayers;
        undoable("Make Screenshot Window", function () {
            var layer = (sel && sel.length) ? sel[0] : null;
            applyWindowPreset(layer, "Floating Browser Window With Glow Border Shine Cursor", mergeS(s, { time: comp.time }));
        });
    }

    function fmtTime(sec) { var m = Math.floor(sec / 60); var ss = (sec - m * 60); return m + ":" + (ss < 10 ? "0" : "") + ss.toFixed(1); }

    function buildRecipeLayer(comp, recipeArr) {
        var text = "DXED MOTION RECIPE\n" + comp.name + "\n\n" + recipeArr.join("\n\n");
        var tl = addTextLayer(comp, text, 24, BRAND.glow); tl.name = "DXED Recipe (guide)"; tl.enabled = false; tl.shy = true;
        try { var td = tl.property("ADBE Text Properties").property("ADBE Text Document").value; td.justification = ParagraphJustification.LEFT_JUSTIFY; tl.property("ADBE Text Properties").property("ADBE Text Document").setValue(td); } catch (e) {}
        transformProps(tl).anchor.setValue([0, 0]); transformProps(tl).pos.setValue([80, 120]); return tl;
    }
    function exportRecipe() {
        var comp = activeComp(); if (!comp) return;
        undoable("Export Motion Recipe", function () {
            var lines = ["DXED MOTION RECIPE", "Comp: " + comp.name, "Duration: " + fmtTime(comp.duration) + "   FPS: " + comp.frameRate.toFixed(0), "Style: " + CFG.style + "   Energy: " + CFG.energy, ""];
            var markers = markerTimes(comp);
            if (markers.length) { lines.push("MARKERS / SCENES:"); var mp = comp.markerProperty; for (var i = 1; i <= mp.numKeys; i++) { var mv = mp.keyValue(i); lines.push("  " + fmtTime(mp.keyTime(i)) + "  " + (mv.comment || "(beat)")); } lines.push(""); }
            lines.push("LAYERS & ANIMATION:");
            for (var l = 1; l <= comp.numLayers; l++) {
                var ly = comp.layer(l); var tp = transformProps(ly); var a = [];
                if (tp.pos.numKeys) a.push("position"); if (tp.scale.numKeys) a.push("scale"); if (tp.opac.numKeys) a.push("opacity"); if (tp.rot.numKeys) a.push("rotation");
                var fxCount = 0; try { fxCount = ly.property("ADBE Effect Parade").numProperties; } catch (e) {}
                lines.push("  " + ly.index + ". " + ly.name + "  [" + fmtTime(ly.inPoint) + "-" + fmtTime(ly.outPoint) + "]" + (a.length ? "  keys: " + a.join(", ") : "") + (fxCount ? "  fx:" + fxCount : ""));
            }
            if (comp.comment) lines.push("", "SCENE NOTES:", comp.comment);
            var report = lines.join("\n"); var saved = false;
            try { var f = File.saveDialog("Save DXED motion recipe", "*.txt"); if (f) { f.open("w"); f.write(report); f.close(); saved = true; } } catch (e) {}
            buildRecipeLayer(comp, [report.replace("DXED MOTION RECIPE\n", "")]);
            alert("Recipe exported" + (saved ? " to file + guide layer." : " as a guide text layer."), SCRIPT_NAME);
        });
    }

    /* ===================================================================== *
     *  17. TOP-LEVEL PRESET ROUTER
     * ===================================================================== */

    // Categories that operate on layers vs standalone.
    function isLayerCategory(cat) {
        return cat === "Bounce" || cat === "Slide" || cat === "Pop / Scale" || cat === "Fade" ||
               cat === "Blur" || cat === "Text" || cat === "Combo Presets";
    }
    function applyOneLayerPreset(cat, name, layer, s) {
        switch (cat) {
            case "Bounce": applyBouncePreset(layer, name, s); break;
            case "Slide": applySlidePreset(layer, name, s); break;
            case "Pop / Scale": applyPopPreset(layer, name, s); break;
            case "Fade": applyFadePreset(layer, name, s); break;
            case "Blur": applyBlurPreset(layer, name, s); break;
            case "Text": applyTextPreset(layer, name, s); break;
            case "Combo Presets": applyComboPreset(layer, name, s); break;
        }
    }

    // Master apply. atTime null => use comp time. Handles markers/apply-scope.
    function applyPreset(cat, name, atTime) {
        var comp = activeComp(); if (!comp) return;
        var s = buildSettings();
        var t = (atTime === null || atTime === undefined) ? comp.time : atTime;
        s.time = t;

        // Auto beat routing for layer presets whose name references markers/beats.
        if (isLayerCategory(cat) && atTime === undefined && /marker|every beat|every 4|every 8|on beat/.test(name.toLowerCase())) {
            var mk = markerTimes(comp); if (mk.length) { applyToMarkers(cat, name); return; }
        }

        undoable("Apply: " + name, function () {
            if (cat === "Window / Screenshot") { var sel = comp.selectedLayers; applyWindowPreset(sel && sel.length ? sel[0] : null, name, s); return; }
            if (cat === "Shape") { applyShapePreset(name, s); return; }
            if (cat === "Flash / Impact") { applyFlashPreset(t, name, s); return; }
            if (cat === "Transition") { applyTransitionPreset(t, name, s); return; }
            if (cat === "Camera") { applyCameraPreset(name, s); return; }
            if (cat === "Beat Sync") { applyBeatSyncPreset(name, s); return; }
            if (cat === "Full Scene Presets") { var assets = grabAssets(comp); buildScene(comp, name.replace(" Scene", ""), comp.time, 3.0, assets, s); return; }
            // layer categories
            var layers = comp.selectedLayers;
            if (!layers || layers.length === 0) {
                if (cat === "Text") { applyOneLayerPreset(cat, name, ensureTextLayer(comp, "This is DXED."), s); return; }
                alert("Select at least one layer for this preset.", SCRIPT_NAME); return;
            }
            var target = (CFG.applyTo === "all") ? [layers[0]] : layers;   // "all" = treat as one group action on first; else each
            for (var i = 0; i < layers.length; i++) {
                var si = mergeS(s, { time: t + (CFG.applyTo === "each" ? i * CFG.delay : 0) });
                applyOneLayerPreset(cat, name, layers[i], si);
            }
        });
    }

    function applyToMarkers(cat, name) {
        var comp = activeComp(); if (!comp) return;
        var mk = needMarkers(comp); if (!mk) return;
        var s = buildSettings();
        undoable("Apply On Markers: " + name, function () {
            for (var i = 0; i < mk.length; i++) {
                var t = mk[i] + CFG.markerOffset;
                var strong = ((i + 1) % 4 === 0);
                if (cat === "Flash / Impact") { applyFlashPreset(t, name, s); continue; }
                if (cat === "Transition") { applyTransitionPreset(t, name, s); continue; }
                if (cat === "Camera") { if (strong || !/every 4/.test(name.toLowerCase())) { s.time = t; comp.time = t; applyCameraPreset(name, s); } continue; }
                if (cat === "Shape") { s.time = t; applyShapePreset(name, s); continue; }
                if (cat === "Window / Screenshot") { var sel = comp.selectedLayers; applyWindowPreset(sel && sel.length ? sel[0] : null, name, mergeS(s, { time: t })); continue; }
                if (cat === "Beat Sync") { applyBeatSyncPreset(name, s); return; }
                // layer categories: apply to each selected layer at marker time
                var layers = comp.selectedLayers; if (!layers || !layers.length) { alert("Select layers to apply on markers.", SCRIPT_NAME); return; }
                for (var li = 0; li < layers.length; li++) applyOneLayerPreset(cat, name, layers[li], mergeS(s, { time: t }));
            }
        });
    }

    function applyRandomPreset(cat) {
        var arr = CATEGORIES[cat]; if (!arr) return;
        seed(CFG.seed + comboSalt()); var name = pick(arr);
        applyPreset(cat, name, undefined);
        return name;
    }
    function comboSalt() { var c = activeComp(true); return c ? Math.round(c.numLayers * 7 + c.duration * 13 + c.time * 30) : 3; }

    /* ===================================================================== *
     *  18. SETTINGS (read from UI)
     * ===================================================================== */

    var UI = {};   // holds references to advanced fields (populated in buildUI)
    function buildSettings() {
        // pull from advanced fields when present
        if (UI.dur) {
            CFG.duration = clamp(pf(UI.dur, ENERGY_DUR[CFG.energy] || 0.45), 0.05, 30);
            CFG.delay = pf(UI.delay, 0.08); CFG.distance = pf(UI.dist, 300);
            CFG.bounce = pf(UI.bounce, 1); CFG.glow = pf(UI.glow, 1); CFG.blur = pf(UI.blur, 1);
            CFG.flash = pf(UI.flash, 1); CFG.scale = pf(UI.scale, 100); CFG.rotation = pf(UI.rot, 15);
            CFG.markerOffset = pf(UI.off, 0); CFG.randomVar = pf(UI.rand, 20); CFG.seed = Math.round(pf(UI.seed, 12345));
        }
        return {
            time: 0, duration: CFG.duration, delay: CFG.delay, distance: CFG.distance,
            bounce: CFG.bounce, glow: CFG.glow, blur: CFG.blur, flash: CFG.flash, scale: CFG.scale,
            rotation: CFG.rotation, markerOffset: CFG.markerOffset, seed: CFG.seed,
            style: CFG.style, energy: CFG.energy, easing: styleEasing(), color: styleColor(), flashColor: flashColorForStyle()
        };
    }

    /* ===================================================================== *
     *  19. UI BUILDER
     * ===================================================================== */

    function buildUI(thisObj) {
        var win = (thisObj instanceof Panel) ? thisObj : new Window("palette", SCRIPT_NAME + " v" + VERSION, undefined, { resizeable: true });
        win.orientation = "column"; win.alignChildren = ["fill", "top"]; win.spacing = 6; win.margins = 8;

        // Header + library counter
        var head = win.add("group"); head.orientation = "row"; head.alignChildren = ["fill", "center"];
        var title = head.add("statictext", undefined, "◆ DXED MOTION BUILDER PRO");
        try { title.graphics.font = ScriptUI.newFont("dialog", "BOLD", 15); } catch (e) {}
        var lib = win.add("statictext", undefined, "Preset Library: " + namedPresetCount() + "+ named presets / " + formatThousands(combinationCount()) + "+ possible combinations");
        try { lib.graphics.font = ScriptUI.newFont("dialog", "ITALIC", 10); } catch (e) {}

        /* ---- Easy Mode ---- */
        var easy = win.add("panel", undefined, "Easy Mode"); easy.orientation = "column"; easy.alignChildren = ["fill", "top"]; easy.margins = 10; easy.spacing = 5;
        var er = easy.add("group"); er.orientation = "row";
        er.add("statictext", undefined, "Style:");
        var styleDD = er.add("dropdownlist", undefined, ["Clean Premium", "Fast Hype", "Dark Tech", "Creator Energy", "Apple-Level Clean", "Crypto Project"]); styleDD.selection = 0;
        er.add("statictext", undefined, "Energy:");
        var energyDD = er.add("dropdownlist", undefined, ["Clean", "Medium", "Hype", "Insane"]); energyDD.selection = 1;
        styleDD.onChange = function () { CFG.style = styleDD.selection.text; syncEnergy(); };
        energyDD.onChange = function () { CFG.energy = energyDD.selection.text; syncEnergy(); };
        function syncEnergy() {
            var so = styleObj(); CFG.glow = so.glow; CFG.blur = so.blur;
            var em = ENERGY_MUL[CFG.energy] || ENERGY_MUL["Medium"];
            CFG.flash = Math.round((so.flash || 1) * em.flash); CFG.bounce = Math.max(1, Math.round(em.bounce * 1.5));
            CFG.duration = ENERGY_DUR[CFG.energy] || 0.45;
            if (UI.dur) { UI.dur.text = CFG.duration.toFixed(2); UI.glow.text = "" + CFG.glow; UI.flash.text = "" + CFG.flash; UI.bounce.text = "" + CFG.bounce; }
        }
        var eg1 = easy.add("group"); eg1.orientation = "row"; eg1.alignChildren = ["fill", "center"];
        bigBtn(eg1, "Build Full DXED Promo", buildFullPromo);
        bigBtn(eg1, "Beat Sync Selected", function () { applyBeatSyncSelected(); });
        var eg2 = easy.add("group"); eg2.orientation = "row"; eg2.alignChildren = ["fill", "center"];
        bigBtn(eg2, "Animate Selected Text", function () { applyPreset("Text", "Kinetic Text Pop", undefined); });
        bigBtn(eg2, "Animate Selected Layer", function () { applyPreset("Pop / Scale", "Smooth Premium Pop", undefined); });
        var eg3 = easy.add("group"); eg3.orientation = "row"; eg3.alignChildren = ["fill", "center"];
        bigBtn(eg3, "Make Screenshot Window", makeScreenshotWindow);
        bigBtn(eg3, "Add Shape Pack", function () { var c = activeComp(); if (c) addShapePack(c); });
        var eg4 = easy.add("group"); eg4.orientation = "row"; eg4.alignChildren = ["fill", "center"];
        bigBtn(eg4, "Flash On Markers", function () { applyToMarkers("Flash / Impact", "Beat Flash"); });
        bigBtn(eg4, "Export Motion Recipe", exportRecipe);

        /* ---- Huge Preset System ---- */
        var ps = win.add("panel", undefined, "Preset Library"); ps.orientation = "column"; ps.alignChildren = ["fill", "top"]; ps.margins = 10; ps.spacing = 5;
        var pr1 = ps.add("group"); pr1.orientation = "row"; pr1.alignChildren = ["fill", "center"];
        pr1.add("statictext", undefined, "Category:");
        var catDD = pr1.add("dropdownlist", undefined, CATEGORY_ORDER); catDD.selection = 0; catDD.preferredSize.width = 150;
        var pr2 = ps.add("group"); pr2.orientation = "row"; pr2.alignChildren = ["fill", "center"];
        pr2.add("statictext", undefined, "Preset:");
        var presetDD = pr2.add("dropdownlist", undefined, BOUNCE); presetDD.selection = 0; presetDD.alignment = ["fill", "center"];
        var catCount = ps.add("statictext", undefined, "");
        catDD.onChange = function () {
            var cat = catDD.selection.text; var arr = CATEGORIES[cat];
            presetDD.removeAll(); for (var i = 0; i < arr.length; i++) presetDD.add("item", arr[i]); presetDD.selection = 0;
            catCount.text = arr.length + " presets in " + cat;
        };
        catCount.text = BOUNCE.length + " presets in Bounce";
        var pr3 = ps.add("group"); pr3.orientation = "row"; pr3.alignChildren = ["fill", "center"];
        bigBtn(pr3, "Apply Preset", function () { applyPreset(catDD.selection.text, presetDD.selection.text, undefined); });
        bigBtn(pr3, "Apply Random", function () { var nm = applyRandomPreset(catDD.selection.text); if (nm) { /* reflect selection */ for (var i = 0; i < presetDD.items.length; i++) if (presetDD.items[i].text === nm) presetDD.selection = i; } });
        bigBtn(pr3, "Apply To Markers", function () { applyToMarkers(catDD.selection.text, presetDD.selection.text); });

        /* ---- Advanced Mode ---- */
        var adv = win.add("panel", undefined, "Advanced Mode"); adv.orientation = "column"; adv.alignChildren = ["fill", "top"]; adv.margins = 10; adv.spacing = 3;
        var advTog = adv.add("checkbox", undefined, "Show advanced controls");
        var advBody = adv.add("group"); advBody.orientation = "column"; advBody.alignChildren = ["fill", "top"]; advBody.spacing = 2; advBody.visible = false;
        advTog.onClick = function () { advBody.visible = advTog.value; win.layout.layout(true); };
        UI.dur = field(advBody, "Duration (s)", "0.6"); UI.delay = field(advBody, "Delay / stagger (s)", "0.08");
        UI.dist = field(advBody, "Distance (px)", "300"); UI.bounce = field(advBody, "Bounce amount", "1");
        UI.glow = field(advBody, "Glow strength", "1"); UI.blur = field(advBody, "Blur amount", "1");
        UI.flash = field(advBody, "Flash strength", "1"); UI.scale = field(advBody, "Scale amount (%)", "100");
        UI.rot = field(advBody, "Rotation amount", "15"); UI.off = field(advBody, "Marker offset (s)", "0.0");
        UI.rand = field(advBody, "Random variation (%)", "20"); UI.seed = field(advBody, "Random seed", "12345");
        var scopeG = advBody.add("group"); scopeG.orientation = "row"; scopeG.add("statictext", undefined, "Apply to:");
        var scopeDD = scopeG.add("dropdownlist", undefined, ["Each selected (stagger)", "All selected as group", "Markers"]); scopeDD.selection = 0;
        scopeDD.onChange = function () { CFG.applyTo = scopeDD.selection.index === 1 ? "all" : (scopeDD.selection.index === 2 ? "markers" : "each"); };
        var strongG = advBody.add("group"); strongG.orientation = "row";
        UI.strong4 = strongG.add("checkbox", undefined, "Strong hit every 4 markers"); UI.strong4.value = true;

        /* ---- Tabs ---- */
        var tp = win.add("tabbedpanel"); tp.alignChildren = ["fill", "fill"]; tp.preferredSize.height = 210;
        buildQuickTab(tp.add("tab", undefined, "Quick Build"));
        buildBeatTab(tp.add("tab", undefined, "Beat Sync"));
        buildWindowTab(tp.add("tab", undefined, "Window"));
        buildRecipeTab(tp.add("tab", undefined, "Recipe"));

        var foot = win.add("statictext", undefined, "Pick a category → preset → Apply. Every action is one undo step.");
        try { foot.graphics.font = ScriptUI.newFont("dialog", "ITALIC", 10); } catch (e) {}

        function buildQuickTab(tab) {
            tab.orientation = "column"; tab.alignChildren = ["fill", "top"]; tab.margins = 10; tab.spacing = 4;
            var r1 = trow(tab); bigBtn(r1, "Build Full DXED Promo", buildFullPromo);
            var r2 = trow(tab); bigBtn(r2, "Make Screenshot Window", makeScreenshotWindow); bigBtn(r2, "Add Shape Pack", function () { var c = activeComp(); if (c) addShapePack(c); });
            var r3 = trow(tab); bigBtn(r3, "Flash Current Time", function () { var c = activeComp(); if (c) undoable("Flash", function () { applyFlashPreset(c.time, "Clean Premium Flash", buildSettings()); }); });
            bigBtn(r3, "Flash All Markers", function () { applyToMarkers("Flash / Impact", "Beat Flash"); });
            var r4 = trow(tab); bigBtn(r4, "Strong Flash Every 4 Markers", function () { applyBeatSyncPresetWrapped("Strong Hit Every 4 Markers"); });
            bigBtn(r4, "Add Camera Bumps (4th)", function () { applyBeatSyncPresetWrapped("Camera Bump On Markers"); });
        }
        function buildBeatTab(tab) {
            tab.orientation = "column"; tab.alignChildren = ["fill", "top"]; tab.margins = 10; tab.spacing = 4;
            var r = trow(tab); r.add("statictext", undefined, "Interval (s):"); var intF = r.add("edittext", undefined, "0.5"); intF.characters = 4;
            r.add("statictext", undefined, "Count:"); var cntF = r.add("edittext", undefined, "16"); cntF.characters = 4;
            bigBtn(r, "Add Beat Markers", function () { var c = activeComp(); if (c) addBeatMarkers(c, pf(intF, 0.5), Math.round(pf(cntF, 16))); });
            var r2 = trow(tab); r2.add("statictext", undefined, "Beat preset:"); var bDD = r2.add("dropdownlist", undefined, BEATSYNC); bDD.selection = 7; bDD.alignment = ["fill", "center"];
            var r3 = trow(tab); bigBtn(r3, "Apply Beat Preset", function () { applyBeatSyncPresetWrapped(bDD.selection.text); });
            bigBtn(r3, "Beat Sync Selected", applyBeatSyncSelected);
            tab.add("statictext", undefined, "Tip: tap * on the numpad while playing to drop beat markers.");
        }
        function buildWindowTab(tab) {
            tab.orientation = "column"; tab.alignChildren = ["fill", "top"]; tab.margins = 10; tab.spacing = 4;
            var r = trow(tab); r.add("statictext", undefined, "Window preset:"); var wDD = r.add("dropdownlist", undefined, WINDOW); wDD.selection = 0; wDD.alignment = ["fill", "center"];
            var r2 = trow(tab); bigBtn(r2, "Apply Window Preset", function () { applyPreset("Window / Screenshot", wDD.selection.text, undefined); });
            bigBtn(r2, "Make Screenshot Window", makeScreenshotWindow);
            tab.add("statictext", undefined, "Select an image / screenshot / precomp first (or none for a placeholder).");
        }
        function buildRecipeTab(tab) {
            tab.orientation = "column"; tab.alignChildren = ["fill", "top"]; tab.margins = 10; tab.spacing = 4;
            bigBtn(trow(tab), "Export Motion Recipe", exportRecipe);
            tab.add("statictext", undefined, "Saves a .txt summary + adds a hidden guide text layer with");
            tab.add("statictext", undefined, "comp name, markers, scenes, layers, and animations.");
        }

        syncEnergy();
        win.layout.layout(true);
        win.onResizing = win.onResize = function () { this.layout.resize(); };
        if (win instanceof Window) { win.center(); win.show(); }
        return win;
    }

    function applyBeatSyncPresetWrapped(name) { var c = activeComp(); if (!c) return; undoable("Beat Sync: " + name, function () { applyBeatSyncPreset(name, buildSettings()); }); }
    function applyBeatSyncSelected() {
        var layers = selectedLayers(); if (!layers) return;
        var c = layers[0].containingComp; if (!needMarkers(c)) return;
        undoable("Beat Sync Selected", function () { applyBeatSyncPreset("Bounce On Every Marker", buildSettings()); });
    }

    /* ---- UI widget helpers ---- */
    function bigBtn(parent, label, fn) { var b = parent.add("button", undefined, label); b.alignment = ["fill", "center"]; b.onClick = fn; return b; }
    function trow(parent) { var g = parent.add("group"); g.orientation = "row"; g.alignChildren = ["fill", "center"]; g.spacing = 4; return g; }
    function field(parent, label, def) { var g = parent.add("group"); g.orientation = "row"; g.alignChildren = ["left", "center"]; var st = g.add("statictext", undefined, label + ":"); st.preferredSize.width = 150; var f = g.add("edittext", undefined, def); f.characters = 8; f.alignment = ["fill", "center"]; return f; }
    function formatThousands(n) { var s = "" + n, out = "", c = 0; for (var i = s.length - 1; i >= 0; i--) { out = s.charAt(i) + out; if (++c % 3 === 0 && i > 0) out = "," + out; } return out; }

    /* ===================================================================== *
     *  20. BOOT
     * ===================================================================== */

    buildUI(thisObj);

})(this);
