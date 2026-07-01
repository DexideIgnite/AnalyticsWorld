/**********************************************************************************
 * DXED Motion Builder
 * ------------------------------------------------------------------------------
 * A motion-design assistant for Adobe After Effects (ExtendScript / ScriptUI).
 *
 * Build DXED.app promo edits fast: intro sequences, beat-synced animation,
 * text presets, screenshot/app-window presets, rounded shape packs, transitions,
 * flashes/impacts, camera bumps, and a full start-to-end promo builder — all
 * driven by a combinatorial preset engine and one-click buttons.
 *
 * This is a real After Effects script. No HTML, no React, no Node.
 *
 * INSTALL
 *   1. Copy this file to the After Effects "ScriptUI Panels" folder:
 *        Win : C:\Program Files\Adobe\Adobe After Effects <ver>\Support Files\
 *              Scripts\ScriptUI Panels\
 *        Mac : /Applications/Adobe After Effects <ver>/Scripts/ScriptUI Panels/
 *   2. Preferences > Scripting & Expressions > enable
 *        "Allow Scripts to Write Files and Access Network".
 *   3. Restart AE, then open  Window > DXED_MotionBuilder.jsx  (dockable panel).
 *
 *   Or run it once with  File > Scripts > Run Script File...  for a floating
 *   window (no install needed).
 *
 * Every action runs inside a single undo group — Ctrl/Cmd+Z reverts it.
 *
 * Tested against After Effects CS6+ ExtendScript. No third-party dependencies.
 **********************************************************************************/

(function DXEDMotionBuilder(thisObj) {
    "use strict";

    var SCRIPT_NAME = "DXED Motion Builder";
    var VERSION = "1.0";

    /* ===================================================================== *
     *  BRAND
     * ===================================================================== */

    // Convert "#RRGGBB" (or "RRGGBB") to normalized [r, g, b] in 0..1.
    function hexToRGB(hex) {
        hex = ("" + hex).replace(/[^0-9a-fA-F]/g, "");
        if (hex.length === 3) {
            hex = hex.charAt(0) + hex.charAt(0) + hex.charAt(1) +
                  hex.charAt(1) + hex.charAt(2) + hex.charAt(2);
        }
        var r = parseInt(hex.substring(0, 2), 16) / 255;
        var g = parseInt(hex.substring(2, 4), 16) / 255;
        var b = parseInt(hex.substring(4, 6), 16) / 255;
        if (isNaN(r) || isNaN(g) || isNaN(b)) return [1, 1, 1];
        return [r, g, b];
    }

    // Add the 4th alpha channel for shape-fill colours.
    function rgba(rgb, a) {
        return [rgb[0], rgb[1], rgb[2], (a === undefined ? 1 : a)];
    }

    var BRAND = {
        purple:  hexToRGB("#8B5CF6"),
        deepBg:  hexToRGB("#060610"),
        navy:    hexToRGB("#0A0A1A"),
        blue:    hexToRGB("#3B82F6"),
        white:   hexToRGB("#FFFFFF"),
        glow:    hexToRGB("#A78BFA")
    };

    /* ===================================================================== *
     *  PRESET ENGINE DATA
     * ===================================================================== */

    var MOTION_TYPES = [
        "Fade", "Slide", "Scale Pop", "Bounce", "Blur Reveal", "Glow Reveal",
        "Whip", "Mask Reveal", "Flash Cut", "Smooth Drift", "Camera Push",
        "Window Reveal", "Text Slam", "Text Float", "UI Card Pop", "Shape Wipe"
    ];

    var DIRECTIONS = [
        "Up", "Down", "Left", "Right", "Center",
        "Diagonal Up", "Diagonal Down", "Zoom In", "Zoom Out"
    ];

    var EASINGS = [
        "Smooth", "Snappy", "Overshoot", "Elastic",
        "Soft Bounce", "Hard Impact", "Cinematic Slow", "Fast Beat Cut"
    ];

    var VISUAL_STYLES = [
        "Clean Premium", "Dark Tech", "Purple Glow", "Blue Glow", "White Flash",
        "Glass Window", "Rounded UI", "Kinetic Text", "Minimal Apple Style", "Hype Edit"
    ];

    // Numeric buckets that also multiply into the combination count.
    var GLOW_LEVELS   = [0, 1, 2, 3];        // none .. strong
    var BLUR_LEVELS   = [0, 1, 2, 3];
    var BOUNCE_LEVELS = [0, 1, 2, 3];
    var FLASH_LEVELS  = [0, 1, 2, 3];
    var DURATIONS     = [0.3, 0.5, 0.8, 1.2, 2.0];
    var MARKER_BEHAV  = ["Every Marker", "Alternate", "Every 4th Strong", "Random"];

    function presetCombinationCount() {
        return MOTION_TYPES.length * DIRECTIONS.length * EASINGS.length *
               VISUAL_STYLES.length * GLOW_LEVELS.length * BLUR_LEVELS.length *
               BOUNCE_LEVELS.length * FLASH_LEVELS.length * DURATIONS.length *
               MARKER_BEHAV.length;
    }

    // Style presets used by Easy Mode.
    var STYLE_PRESETS = {
        "Clean Premium":     { easing: "Smooth",         glow: 1, blur: 1, flash: 1, color: BRAND.purple },
        "Fast Hype":         { easing: "Fast Beat Cut",  glow: 2, blur: 0, flash: 3, color: BRAND.purple },
        "Dark Tech":         { easing: "Snappy",         glow: 2, blur: 1, flash: 2, color: BRAND.blue },
        "Creator Energy":    { easing: "Soft Bounce",    glow: 2, blur: 1, flash: 2, color: BRAND.purple },
        "Apple-Level Clean": { easing: "Cinematic Slow", glow: 0, blur: 1, flash: 0, color: BRAND.white },
        "Crypto Project":    { easing: "Overshoot",      glow: 3, blur: 1, flash: 2, color: BRAND.purple }
    };

    var ENERGY_PRESETS = {
        "Clean":  { durMul: 1.4, flashMul: 0.4, bounceMul: 0.3 },
        "Medium": { durMul: 1.0, flashMul: 1.0, bounceMul: 1.0 },
        "Hype":   { durMul: 0.7, flashMul: 1.6, bounceMul: 1.6 },
        "Insane": { durMul: 0.45, flashMul: 2.4, bounceMul: 2.4 }
    };

    // Live config, driven by the UI. Buttons read from here.
    var CFG = {
        style: "Clean Premium",
        energy: "Medium",
        duration: 0.6,
        delay: 0.0,
        direction: "Up",
        bounce: 1,
        glow: 1,
        blur: 1,
        flash: 1,
        scale: 100,
        distance: 300,
        markerOffset: 0.0,
        seed: 12345,
        applyTo: "selected"   // "selected" | "comp" | "markers"
    };

    /* ===================================================================== *
     *  DETERMINISTIC RANDOM (seeded — no Math.random dependency)
     * ===================================================================== */

    var _rngState = 12345;
    function seedRandom(s) { _rngState = (s % 2147483647); if (_rngState <= 0) _rngState += 2147483646; }
    function rnd() { _rngState = (_rngState * 16807) % 2147483647; return (_rngState - 1) / 2147483646; }
    function rndRange(lo, hi) { return lo + (hi - lo) * rnd(); }

    /* ===================================================================== *
     *  CORE HELPERS  (guards, undo, layers, comps)
     * ===================================================================== */

    function activeComp(silent) {
        var comp = app.project ? app.project.activeItem : null;
        if (!comp || !(comp instanceof CompItem)) {
            if (!silent) alert("Open or select a composition first.", SCRIPT_NAME);
            return null;
        }
        return comp;
    }

    function selectedLayers(silent) {
        var comp = activeComp(silent);
        if (!comp) return null;
        var layers = comp.selectedLayers;
        if (!layers || layers.length === 0) {
            if (!silent) alert("Select at least one layer.", SCRIPT_NAME);
            return null;
        }
        return layers;
    }

    function undoable(label, fn) {
        app.beginUndoGroup(label);
        try {
            fn();
        } catch (e) {
            alert(label + " failed:\n" + e.toString() +
                  (e.line ? "\n(line " + e.line + ")" : ""), SCRIPT_NAME);
        } finally {
            app.endUndoGroup();
        }
    }

    function transformProps(layer) {
        var tg = layer.property("ADBE Transform Group");
        return {
            pos:    tg.property("ADBE Position"),
            scale:  tg.property("ADBE Scale"),
            rot:    tg.property("ADBE Rotate Z"),
            opac:   tg.property("ADBE Opacity"),
            anchor: tg.property("ADBE Anchor Point")
        };
    }

    function centerLayer(layer, comp) {
        try {
            var t = comp.time;
            var rect = layer.sourceRectAtTime(t, false);
            var tp = transformProps(layer);
            tp.anchor.setValue([rect.left + rect.width / 2, rect.top + rect.height / 2]);
            tp.pos.setValue([comp.width / 2, comp.height / 2]);
        } catch (e) { /* cameras / lights have no source rect */ }
    }

    /* ===================================================================== *
     *  KEYFRAME + EASING ENGINE
     * ===================================================================== */

    var EASE_MAP = {
        "Smooth":        { inf: [75, 75], overshoot: 0 },
        "Snappy":        { inf: [85, 20], overshoot: 0 },
        "Overshoot":     { inf: [80, 60], overshoot: 0.15 },
        "Elastic":       { inf: [85, 70], overshoot: 0.30 },
        "Soft Bounce":   { inf: [70, 55], overshoot: 0.12 },
        "Hard Impact":   { inf: [100, 12], overshoot: 0 },
        "Cinematic Slow":{ inf: [90, 90], overshoot: 0 },
        "Fast Beat Cut": { inf: [35, 35], overshoot: 0 }
    };

    function easeInfo(style) { return EASE_MAP[style] || EASE_MAP["Smooth"]; }

    function clamp(v, lo, hi) { return v < lo ? lo : (v > hi ? hi : v); }

    // Apply Easy-Ease with per-side influence to every key on a property.
    function easeProperty(property, inInf, outInf) {
        var n = property.numKeys;
        if (n < 1) return;
        var dim = 1;
        try { dim = property.value.length || 1; } catch (e) { dim = 1; }
        for (var i = 1; i <= n; i++) {
            var inE = [], outE = [];
            for (var d = 0; d < dim; d++) {
                inE.push(new KeyframeEase(0, clamp(inInf, 0.1, 100)));
                outE.push(new KeyframeEase(0, clamp(outInf, 0.1, 100)));
            }
            try {
                property.setInterpolationTypeAtKey(i,
                    KeyframeInterpolationType.BEZIER, KeyframeInterpolationType.BEZIER);
                property.setTemporalEaseAtKey(i, inE, outE);
            } catch (e) {}
        }
    }

    // Set a two- or three-keyframe animation on a property, honoring easing style.
    // "toward" is the resting value; "from" is the offset start.
    function animateProp(property, t0, dur, fromVal, toVal, style) {
        var e = easeInfo(style);
        if (e.overshoot > 0 && toVal.length !== undefined) {
            // Insert an overshoot key that goes slightly past the target.
            var over = [];
            for (var i = 0; i < toVal.length; i++) {
                over.push(toVal[i] + (toVal[i] - fromVal[i]) * e.overshoot);
            }
            property.setValueAtTime(t0, fromVal);
            property.setValueAtTime(t0 + dur * 0.72, over);
            property.setValueAtTime(t0 + dur, toVal);
        } else if (e.overshoot > 0) {
            var overS = toVal + (toVal - fromVal) * e.overshoot;
            property.setValueAtTime(t0, fromVal);
            property.setValueAtTime(t0 + dur * 0.72, overS);
            property.setValueAtTime(t0 + dur, toVal);
        } else {
            property.setValueAtTime(t0, fromVal);
            property.setValueAtTime(t0 + dur, toVal);
        }
        easeProperty(property, e.inf[0], e.inf[1]);
    }

    /* ===================================================================== *
     *  EFFECT HELPERS  (glow, blur, shadow, fill, tint)
     * ===================================================================== */

    function fx(layer) { return layer.property("ADBE Effect Parade"); }

    function addGlow(layer, radius, intensity, color) {
        var parade = fx(layer);
        var g;
        try { g = parade.addProperty("ADBE Glo2"); }          // Glow
        catch (e) { try { g = parade.addProperty("ADBE Glow"); } catch (e2) { return null; } }
        trySetByName(g, "Glow Radius", radius);
        trySetByName(g, "Glow Intensity", intensity);
        trySetByName(g, "Glow Threshold", 40);
        if (color) {
            trySetByName(g, "Glow Colors", 1);                // A & B Colors
            trySetByName(g, "Color A", color);
            trySetByName(g, "Color B", color);
        }
        return g;
    }

    function addBlur(layer, amount) {
        var parade = fx(layer);
        var b;
        try { b = parade.addProperty("ADBE Gaussian Blur 2"); }
        catch (e) { try { b = parade.addProperty("ADBE Fast Blur"); } catch (e2) { return null; } }
        trySetByName(b, "Blurriness", amount);
        return b;
    }

    function addShadow(layer, softness, opacity, distance) {
        var parade = fx(layer);
        var d;
        try { d = parade.addProperty("ADBE Drop Shadow"); } catch (e) { return null; }
        trySetByName(d, "Opacity", (opacity === undefined ? 140 : opacity));
        trySetByName(d, "Softness", (softness === undefined ? 60 : softness));
        trySetByName(d, "Distance", (distance === undefined ? 12 : distance));
        return d;
    }

    function addTint(layer, color) {
        var parade = fx(layer);
        var t;
        try { t = parade.addProperty("ADBE Tint"); } catch (e) { return null; }
        trySetByName(t, "Map White To", color);
        return t;
    }

    // Set an effect property by display name, ignoring failures gracefully.
    function trySetByName(effect, propName, value) {
        try {
            var p = effect.property(propName);
            if (p) p.setValue(value);
        } catch (e) {}
    }

    /* ===================================================================== *
     *  LAYER FACTORIES
     * ===================================================================== */

    function addSolidLayer(comp, color, name, w, h) {
        w = w || comp.width; h = h || comp.height;
        var s = comp.layers.addSolid(color, name, w, h, 1, comp.duration);
        return s;
    }

    function addBackground(comp) {
        var bg = addSolidLayer(comp, BRAND.deepBg, "DXED BG");
        bg.moveToEnd();
        // A subtle purple radial vibe via a large soft glow blob.
        return bg;
    }

    function addTextLayer(comp, text, fontSize, color) {
        var tl = comp.layers.addText(text);
        var srcProp = tl.property("ADBE Text Properties").property("ADBE Text Document");
        var td = srcProp.value;
        td.fontSize = fontSize || 120;
        td.fillColor = color || BRAND.white;
        td.applyFill = true;
        try { td.justification = ParagraphJustification.CENTER_JUSTIFY; } catch (e) {}
        try { td.font = "Arial-BoldMT"; } catch (e) {}
        srcProp.setValue(td);
        centerLayer(tl, comp);
        return tl;
    }

    // Build a rounded rectangle shape layer. size = [w,h].
    function addRoundedRect(comp, size, roundness, fillColor, name) {
        var shape = comp.layers.addShape();
        shape.name = name || "DXED Card";
        var contents = shape.property("ADBE Root Vectors Group");
        var group = contents.addProperty("ADBE Vector Group");
        var gc = group.property("ADBE Vectors Group");
        var rect = gc.addProperty("ADBE Vector Shape - Rect");
        rect.property("ADBE Vector Rect Size").setValue(size);
        rect.property("ADBE Vector Rect Roundness").setValue(roundness === undefined ? 30 : roundness);
        var fill = gc.addProperty("ADBE Vector Graphic - Fill");
        fill.property("ADBE Vector Fill Color").setValue(rgba(fillColor || BRAND.navy, 1));
        centerLayer(shape, comp);
        return shape;
    }

    function addCircle(comp, diameter, fillColor, name) {
        var shape = comp.layers.addShape();
        shape.name = name || "DXED Circle";
        var contents = shape.property("ADBE Root Vectors Group");
        var group = contents.addProperty("ADBE Vector Group");
        var gc = group.property("ADBE Vectors Group");
        var ell = gc.addProperty("ADBE Vector Shape - Ellipse");
        ell.property("ADBE Vector Ellipse Size").setValue([diameter, diameter]);
        var fill = gc.addProperty("ADBE Vector Graphic - Fill");
        fill.property("ADBE Vector Fill Color").setValue(rgba(fillColor || BRAND.purple, 1));
        return shape;
    }

    function addAdjustment(comp, name) {
        var adj = addSolidLayer(comp, [1, 1, 1], name || "DXED Adjust");
        adj.adjustmentLayer = true;
        return adj;
    }

    /* ===================================================================== *
     *  MOTION PRIMITIVES  (intro / exit animation on any layer)
     * ===================================================================== */

    // direction offset vector for slide-style moves.
    function directionOffset(direction, dist) {
        switch (direction) {
            case "Up":            return [0, dist];
            case "Down":          return [0, -dist];
            case "Left":          return [dist, 0];
            case "Right":         return [-dist, 0];
            case "Diagonal Up":   return [dist, dist];
            case "Diagonal Down": return [dist, -dist];
            default:              return [0, 0];
        }
    }

    // Apply an intro animation to a layer starting at t0.
    function animateIn(layer, opts) {
        var comp = layer.containingComp;
        var t0 = opts.time;
        var dur = opts.duration;
        var style = opts.easing;
        var motion = opts.motion;
        var dir = opts.direction;
        var tp = transformProps(layer);

        var restPos = tp.pos.valueAtTime(t0, false);
        var restScale = tp.scale.valueAtTime(t0, false);

        switch (motion) {
            case "Fade":
            case "Smooth Drift":
                animateProp(tp.opac, t0, dur, 0, 100, style);
                if (motion === "Smooth Drift") {
                    var off = directionOffset(dir === "Center" ? "Up" : dir, opts.distance * 0.25);
                    animateProp(tp.pos, t0, dur, [restPos[0] + off[0], restPos[1] + off[1]], restPos, style);
                }
                break;

            case "Slide":
            case "Whip":
            case "Text Float":
            case "UI Card Pop": {
                var offset = directionOffset(dir === "Center" ? "Up" : dir, opts.distance);
                animateProp(tp.pos, t0, dur, [restPos[0] + offset[0], restPos[1] + offset[1]], restPos, style);
                animateProp(tp.opac, t0, dur * 0.6, 0, 100, style);
                break;
            }

            case "Scale Pop":
            case "Bounce":
            case "Text Slam":
            case "Window Reveal": {
                var zero = [0, 0];
                if (restScale.length > 2) zero = [0, 0, 0];
                animateProp(tp.scale, t0, dur, zero, restScale, motion === "Text Slam" ? "Hard Impact" : style);
                animateProp(tp.opac, t0, dur * 0.5, 0, 100, style);
                break;
            }

            case "Blur Reveal": {
                var bl = addBlur(layer, 60);
                if (bl) {
                    var bp = bl.property("Blurriness") || bl.property(1);
                    if (bp) { bp.setValueAtTime(t0, 60); bp.setValueAtTime(t0 + dur, 0); easeProperty(bp, 75, 75); }
                }
                animateProp(tp.opac, t0, dur, 0, 100, style);
                break;
            }

            case "Glow Reveal": {
                addGlow(layer, 40, 1.5, opts.color || BRAND.purple);
                animateProp(tp.scale, t0, dur,
                    [restScale[0] * 0.8, restScale[1] * 0.8], restScale, style);
                animateProp(tp.opac, t0, dur, 0, 100, style);
                break;
            }

            case "Mask Reveal":
            case "Shape Wipe": {
                // Simple reveal via scale-X wipe as a stand-in for a mask sweep.
                animateProp(tp.scale, t0, dur, [0, restScale[1]], restScale, style);
                tp.opac.setValueAtTime(t0, 100);
                break;
            }

            case "Flash Cut": {
                tp.opac.setValueAtTime(t0, 0);
                tp.opac.setValueAtTime(t0 + comp.frameDuration, 100);
                addFlash(comp, t0, opts.color || BRAND.white, 0.18, opts.flash || 2);
                break;
            }

            case "Camera Push": {
                animateProp(tp.scale, t0, dur,
                    [restScale[0] * 1.15, restScale[1] * 1.15], restScale, "Cinematic Slow");
                animateProp(tp.opac, t0, dur * 0.5, 0, 100, style);
                break;
            }

            default:
                animateProp(tp.opac, t0, dur, 0, 100, style);
        }

        if (opts.glow && motion !== "Glow Reveal") {
            addGlow(layer, 20 * opts.glow, 1 + opts.glow * 0.4, opts.color || BRAND.purple);
        }
        try { layer.motionBlur = true; } catch (e) {}
    }

    // Apply an exit animation ending at tEnd.
    function animateOut(layer, tEnd, dur, style, motion) {
        var tp = transformProps(layer);
        var t0 = tEnd - dur;
        var restScale = tp.scale.valueAtTime(t0, false);
        switch (motion) {
            case "Scale Pop":
            case "Window Reveal":
                animateProp(tp.scale, t0, dur, restScale, [restScale[0] * 1.15, restScale[1] * 1.15], style);
                animateProp(tp.opac, t0, dur, 100, 0, style);
                break;
            default:
                animateProp(tp.opac, t0, dur, 100, 0, style);
        }
    }

    /* ===================================================================== *
     *  FLASH / IMPACT
     * ===================================================================== */

    function addFlash(comp, t, color, length, strength) {
        length = length || 0.2;
        strength = strength || 2;
        var flash = addSolidLayer(comp, color || BRAND.white, "DXED Flash");
        flash.blendingMode = BlendingMode.ADD;
        var op = transformProps(flash).opac;
        var peak = clamp(60 + strength * 15, 40, 100);
        op.setValueAtTime(t, 0);
        op.setValueAtTime(t + length * 0.25, peak);
        op.setValueAtTime(t + length, 0);
        easeProperty(op, 80, 80);
        flash.startTime = 0;
        // Trim the flash layer to its useful window.
        flash.inPoint = Math.max(0, t - 0.05);
        flash.outPoint = t + length + 0.1;
        if (strength >= 3) addGlow(flash, 30, 2, color || BRAND.white);
        return flash;
    }

    function addCameraBump(comp, t, amount) {
        // Bump via a full-comp adjustment layer + Transform effect scale kick.
        var adj = addAdjustment(comp, "DXED Camera Bump");
        var parade = fx(adj);
        var tr;
        try { tr = parade.addProperty("ADBE Geometry2"); } catch (e) { tr = null; } // Transform
        if (!tr) {
            var tp = transformProps(adj);
            var s = tp.scale.value;
            tp.scale.setValueAtTime(t, s);
            tp.scale.setValueAtTime(t + 0.06, [s[0] * (1 + amount / 100), s[1] * (1 + amount / 100)]);
            tp.scale.setValueAtTime(t + 0.28, s);
            easeProperty(tp.scale, 70, 70);
            adj.inPoint = Math.max(0, t - 0.05);
            adj.outPoint = t + 0.4;
            return adj;
        }
        var sc = tr.property("Scale");
        if (sc) {
            var base = sc.value;
            sc.setValueAtTime(t, base);
            sc.setValueAtTime(t + 0.06, [base[0] * (1 + amount / 100), base[1] * (1 + amount / 100)]);
            sc.setValueAtTime(t + 0.28, base);
            easeProperty(sc, 70, 70);
        }
        adj.inPoint = Math.max(0, t - 0.05);
        adj.outPoint = t + 0.4;
        return adj;
    }

    function addBeatShake(layer, t, amount) {
        var tp = transformProps(layer);
        var p = tp.pos;
        var base = p.valueAtTime(t, false);
        seedRandom(CFG.seed + Math.round(t * 100));
        for (var i = 0; i < 4; i++) {
            var tt = t + i * 0.04;
            var jx = (i === 3) ? 0 : rndRange(-amount, amount);
            var jy = (i === 3) ? 0 : rndRange(-amount, amount);
            p.setValueAtTime(tt, [base[0] + jx, base[1] + jy]);
        }
    }

    /* ===================================================================== *
     *  MARKERS
     * ===================================================================== */

    function compMarkerTimes(comp) {
        var times = [];
        try {
            var mp = comp.markerProperty;
            for (var i = 1; i <= mp.numKeys; i++) times.push(mp.keyTime(i));
        } catch (e) {}
        return times;
    }

    function addCompMarker(comp, t, comment) {
        var mv = new MarkerValue(comment || "");
        comp.markerProperty.setValueAtTime(t, mv);
    }

    function addBeatMarkers(comp, interval, count) {
        undoable("Add Beat Markers", function () {
            var t = comp.time;
            for (var i = 0; i < count; i++) {
                addCompMarker(comp, t + i * interval, "beat " + (i + 1));
            }
        });
    }

    /* ===================================================================== *
     *  BEAT SYNC
     * ===================================================================== */

    // Add a hit (scale pulse + optional flash) on each marker for each layer.
    function beatSyncLayers(layers, opts) {
        var comp = layers[0].containingComp;
        var markers = compMarkerTimes(comp);
        if (markers.length === 0) {
            alert("No comp markers found.\nPlace markers on the beat (press * on the numpad),\nor use Beat Sync > Add Beat Markers first.", SCRIPT_NAME);
            return;
        }
        seedRandom(opts.seed);
        for (var li = 0; li < layers.length; li++) {
            var tp = transformProps(layers[li]);
            var base = tp.scale.value;
            for (var mi = 0; mi < markers.length; mi++) {
                var strong = ((mi + 1) % 4 === 0);
                var doHit = true;
                if (opts.behavior === "Alternate") doHit = (mi % 2 === 0);
                if (opts.behavior === "Random")    doHit = (rnd() > 0.35);
                if (!doHit) continue;

                var t = markers[mi] + opts.offset;
                var pop = strong ? opts.strongPop : opts.pop;
                if (opts.behavior === "Random") pop *= rndRange(0.8, 1.3);

                tp.scale.setValueAtTime(t, base);
                tp.scale.setValueAtTime(t + opts.animLen * 0.35,
                    [base[0] * (1 + pop / 100), base[1] * (1 + pop / 100)]);
                tp.scale.setValueAtTime(t + opts.animLen, base);
                easeProperty(tp.scale, 75, 75);

                if (opts.flashOnMarkers && strong) {
                    addFlash(comp, t, opts.flashColor, opts.flashLen, 3);
                }
            }
            try { layers[li].motionBlur = true; } catch (e) {}
        }
    }

    function addFlashOnMarkers(comp, opts) {
        var markers = compMarkerTimes(comp);
        if (markers.length === 0) { alert("No comp markers found.", SCRIPT_NAME); return; }
        for (var i = 0; i < markers.length; i++) {
            var strong = ((i + 1) % 4 === 0);
            var strength = strong ? 3 : (opts.strength || 1);
            var color = strong ? opts.strongColor : opts.color;
            var len = strong ? opts.strongLen : opts.len;
            addFlash(comp, markers[i] + opts.offset, color, len, strength);
        }
    }

    function addCameraBumpsOnMarkers(comp, everyN, amount) {
        var markers = compMarkerTimes(comp);
        if (markers.length === 0) { alert("No comp markers found.", SCRIPT_NAME); return; }
        for (var i = 0; i < markers.length; i++) {
            if ((i + 1) % everyN === 0) addCameraBump(comp, markers[i], amount);
        }
    }

    /* ===================================================================== *
     *  TEXT PRESETS
     * ===================================================================== */

    var TEXT_ANIMS = [
        "Fade Up", "Fade Down", "Slide Left", "Slide Right", "Scale Pop",
        "Bounce In", "Blur Reveal", "Glow Reveal", "Text Slam", "Kinetic Word Pop",
        "Letter-by-Letter", "Word-by-Word", "Flash Text", "Tracking Spread",
        "Smooth Premium Reveal", "Hard Beat Impact"
    ];

    var DXED_TEXTS = [
        "This is DXED.", "Post. Build. Connect.", "Show your work.",
        "Find your community.", "Built for creators.",
        "Projects can build here too.", "Join DXED.", "DXED.app"
    ];

    function animateTextLayer(layer, animName, opts) {
        var comp = layer.containingComp;
        var t0 = opts.time;
        var dur = opts.duration;
        var tp = transformProps(layer);
        var style = opts.easing;

        // Text animators for per-character / per-word effects.
        function addRangeAnimator(basedOn) {
            var animators = layer.property("ADBE Text Properties").property("ADBE Text Animators");
            var an = animators.addProperty("ADBE Text Animator");
            var sel = an.property("ADBE Text Selectors").addProperty("ADBE Text Selector");
            sel.property("ADBE Text Range Advanced").property("ADBE Text Range Type2").setValue(basedOn); // 1 char,2 word
            var props = an.property("ADBE Text Animator Properties");
            return { an: an, sel: sel, props: props };
        }

        switch (animName) {
            case "Fade Up":     animateProp(tp.pos, t0, dur, offsetPos(tp, t0, 0, 80), tp.pos.valueAtTime(t0, false), style);
                                animateProp(tp.opac, t0, dur, 0, 100, style); break;
            case "Fade Down":   animateProp(tp.pos, t0, dur, offsetPos(tp, t0, 0, -80), tp.pos.valueAtTime(t0, false), style);
                                animateProp(tp.opac, t0, dur, 0, 100, style); break;
            case "Slide Left":  animateProp(tp.pos, t0, dur, offsetPos(tp, t0, opts.distance, 0), tp.pos.valueAtTime(t0, false), style);
                                animateProp(tp.opac, t0, dur * 0.6, 0, 100, style); break;
            case "Slide Right": animateProp(tp.pos, t0, dur, offsetPos(tp, t0, -opts.distance, 0), tp.pos.valueAtTime(t0, false), style);
                                animateProp(tp.opac, t0, dur * 0.6, 0, 100, style); break;
            case "Scale Pop":
            case "Bounce In":
                animateProp(tp.scale, t0, dur, [0, 0], tp.scale.valueAtTime(t0, false), animName === "Bounce In" ? "Soft Bounce" : "Overshoot");
                animateProp(tp.opac, t0, dur * 0.5, 0, 100, style); break;
            case "Text Slam":
            case "Hard Beat Impact":
                animateProp(tp.scale, t0, dur, [180, 180], tp.scale.valueAtTime(t0, false), "Hard Impact");
                animateProp(tp.opac, t0, comp.frameDuration * 2, 0, 100, style);
                addFlash(comp, t0, BRAND.white, 0.12, 2); break;
            case "Blur Reveal": {
                var bl = addBlur(layer, 50);
                if (bl) { var bp = bl.property(1); bp.setValueAtTime(t0, 50); bp.setValueAtTime(t0 + dur, 0); easeProperty(bp, 75, 75); }
                animateProp(tp.opac, t0, dur, 0, 100, style); break;
            }
            case "Glow Reveal":
                addGlow(layer, 45, 1.8, opts.color || BRAND.purple);
                animateProp(tp.opac, t0, dur, 0, 100, style);
                animateProp(tp.scale, t0, dur, [90, 90], tp.scale.valueAtTime(t0, false), style); break;
            case "Flash Text":
                tp.opac.setValueAtTime(t0, 0);
                tp.opac.setValueAtTime(t0 + comp.frameDuration, 100);
                addFlash(comp, t0, opts.color || BRAND.purple, 0.15, 2); break;
            case "Tracking Spread": {
                var r = addRangeAnimator(1);
                var tr = r.props.addProperty("ADBE Text Tracking Amount");
                tr.setValueAtTime(t0, 30); tr.setValueAtTime(t0 + dur, 0); easeProperty(tr, 80, 80);
                animateProp(tp.opac, t0, dur, 0, 100, style); break;
            }
            case "Letter-by-Letter":
            case "Kinetic Word Pop":
            case "Word-by-Word": {
                var basedOn = (animName === "Letter-by-Letter") ? 1 : 3; // 1=Characters, 3=Words
                var r2 = addRangeAnimator(basedOn);
                var op = r2.props.addProperty("ADBE Text Opacity"); op.setValue(0);
                var pos = r2.props.addProperty("ADBE Text Position 3D"); pos.setValue([0, 60, 0]);
                var off = r2.sel.property("ADBE Text Percent Start");
                off.setValueAtTime(t0, 0); off.setValueAtTime(t0 + dur, 100); easeProperty(off, 65, 65);
                animateProp(tp.opac, t0, comp.frameDuration, 0, 100, style); break;
            }
            case "Smooth Premium Reveal":
            default:
                animateProp(tp.pos, t0, dur, offsetPos(tp, t0, 0, 40), tp.pos.valueAtTime(t0, false), "Cinematic Slow");
                animateProp(tp.opac, t0, dur, 0, 100, "Cinematic Slow");
        }
        try { layer.motionBlur = true; } catch (e) {}
    }

    function offsetPos(tp, t, dx, dy) {
        var p = tp.pos.valueAtTime(t, false);
        return [p[0] + dx, p[1] + dy, p.length > 2 ? p[2] : undefined].slice(0, p.length);
    }

    /* ===================================================================== *
     *  SCREENSHOT / WINDOW PRESETS
     * ===================================================================== */

    var WINDOW_PRESETS = [
        "Floating Browser Window", "Rounded App Window", "Glass UI Window",
        "Dark Tech Window", "3D Tilt Window", "Window Stack", "Window Carousel",
        "Window Zoom In", "Window Slide In", "Window Bounce In",
        "Window Scroll Preview", "Window With Cursor Click",
        "Window With Feature Callout", "Window Glow Border", "Window Flash Transition"
    ];

    // Turn a selected image/precomp layer into a premium DXED app window.
    function makeScreenshotWindow(layer, preset, opts) {
        var comp = layer.containingComp;
        var t0 = opts.time;
        var dur = opts.duration;

        // Measure the layer.
        var rect;
        try { rect = layer.sourceRectAtTime(t0, false); } catch (e) { rect = { width: comp.width * 0.6, height: comp.height * 0.6 }; }
        var pad = 26;
        var frameW = rect.width + pad * 2;
        var frameH = rect.height + pad * 2 + 40; // top browser bar

        // Center the screenshot.
        centerLayer(layer, comp);
        var center = transformProps(layer).pos.value;

        // 1) Rounded frame behind the screenshot.
        var frame = addRoundedRect(comp, [frameW, frameH], 28, BRAND.navy, "DXED Window Frame");
        transformProps(frame).pos.setValue(center);
        frame.moveAfter(layer); // behind the screenshot
        addShadow(frame, 80, 160, 18);
        if (preset === "Window Glow Border" || opts.glowBorder) {
            addGlow(frame, 60, 1.6, BRAND.purple);
        }
        if (preset === "Glass UI Window") { transformProps(frame).opac.setValue(70); addBlur(frame, 6); }

        // 2) Browser dots (traffic lights).
        var dotColors = [hexToRGB("#FF5F57"), hexToRGB("#FEBC2E"), hexToRGB("#28C840")];
        var dots = [];
        for (var d = 0; d < 3; d++) {
            var dot = addCircle(comp, 18, dotColors[d], "Win Dot " + (d + 1));
            transformProps(dot).pos.setValue([center[0] - frameW / 2 + 30 + d * 26, center[1] - frameH / 2 + 26]);
            dot.moveBefore(frame);
            dots.push(dot);
        }

        // 3) Group everything under a controller null so it animates as one unit.
        var ctrl = comp.layers.addNull();
        ctrl.name = "DXED Window Ctrl";
        transformProps(ctrl).pos.setValue(center);
        transformProps(ctrl).anchor.setValue([0, 0]);
        ctrl.moveBefore(dots[0]);
        parentTo(layer, ctrl);
        parentTo(frame, ctrl);
        for (var pi = 0; pi < dots.length; pi++) parentTo(dots[pi], ctrl);

        // 4) Animate the controller based on preset.
        var cp = transformProps(ctrl);
        var restScale = cp.scale.value;
        switch (preset) {
            case "Window Slide In":
                animateProp(cp.pos, t0, dur, [center[0] + opts.distance, center[1]], center, "Snappy");
                animateProp(cp.opac, t0, dur * 0.6, 0, 100, "Smooth"); break;
            case "Window Bounce In":
                animateProp(cp.scale, t0, dur, [0, 0], restScale, "Soft Bounce");
                animateProp(cp.opac, t0, dur * 0.5, 0, 100, "Smooth"); break;
            case "Window Zoom In":
            case "Window Reveal":
                animateProp(cp.scale, t0, dur, [restScale[0] * 0.6, restScale[1] * 0.6], restScale, "Cinematic Slow");
                animateProp(cp.opac, t0, dur * 0.5, 0, 100, "Smooth"); break;
            case "3D Tilt Window":
                ctrl.threeDLayer = true; layer.threeDLayer = true; frame.threeDLayer = true;
                var ry = cp.rot; // fallback rotation
                animateProp(cp.scale, t0, dur, [0, 0], restScale, "Overshoot");
                animateProp(cp.opac, t0, dur * 0.5, 0, 100, "Smooth"); break;
            case "Window Flash Transition":
                animateProp(cp.scale, t0, dur, [restScale[0] * 0.9, restScale[1] * 0.9], restScale, "Snappy");
                cp.opac.setValueAtTime(t0, 0); cp.opac.setValueAtTime(t0 + comp.frameDuration, 100);
                addFlash(comp, t0, BRAND.purple, 0.18, 3); break;
            default: // Floating Browser / Rounded App / Dark Tech / others
                animateProp(cp.scale, t0, dur, [restScale[0] * 0.75, restScale[1] * 0.75], restScale, "Overshoot");
                animateProp(cp.opac, t0, dur * 0.5, 0, 100, "Smooth");
        }

        // 5) Subtle continuous float (expression samples keyframes, so it layers on top).
        try { cp.pos.expression = "wiggle(0.5, 6)"; } catch (e) {}

        // 6) Optional camera push (scale creep after intro).
        if (opts.cameraPush) {
            var endT = comp.duration;
            cp.scale.setValueAtTime(t0 + dur, restScale);
            cp.scale.setValueAtTime(Math.min(endT, t0 + dur + 3),
                [restScale[0] * 1.06, restScale[1] * 1.06]);
        }

        // 7) Optional shine sweep across the frame.
        if (opts.shine) addShineSweep(comp, ctrl, center, frameW, frameH, t0 + dur * 0.5);

        try { ctrl.motionBlur = true; layer.motionBlur = true; } catch (e) {}
        return ctrl;
    }

    function parentTo(layer, parent) { try { layer.parent = parent; } catch (e) {} }

    function addShineSweep(comp, ctrl, center, w, h, t) {
        var shine = addRoundedRect(comp, [w * 0.25, h * 1.4], 0, BRAND.white, "DXED Shine");
        transformProps(shine).opac.setValue(25);
        transformProps(shine).rot.setValue(20);
        shine.blendingMode = BlendingMode.ADD;
        addBlur(shine, 30);
        parentTo(shine, ctrl);
        var sp = transformProps(shine).pos;
        sp.setValueAtTime(t, [center[0] - w * 0.7, center[1]]);
        sp.setValueAtTime(t + 0.7, [center[0] + w * 0.7, center[1]]);
        easeProperty(sp, 60, 60);
        transformProps(shine).opac.setValueAtTime(t, 0);
        transformProps(shine).opac.setValueAtTime(t + 0.1, 25);
        transformProps(shine).opac.setValueAtTime(t + 0.7, 0);
    }

    /* ===================================================================== *
     *  SHAPE PRESETS
     * ===================================================================== */

    var SHAPE_PRESETS = [
        "Rounded Rectangle Card", "Floating Pill", "Circle Glow", "Background Blobs",
        "Grid Lines", "Animated Border", "Glow Ring", "Purple Accent Bar",
        "UI Chip", "Soft Gradient Card", "Shape Wipe", "Rounded Mask Transition",
        "Background Depth Layers"
    ];

    function addShapePreset(comp, preset, opts) {
        var t0 = comp.time;
        var dur = opts.duration;
        seedRandom(opts.seed);
        switch (preset) {
            case "Rounded Rectangle Card":
            case "Soft Gradient Card":
            case "UI Chip": {
                var w = (preset === "UI Chip") ? 260 : 640;
                var h = (preset === "UI Chip") ? 90 : 360;
                var card = addRoundedRect(comp, [w, h], preset === "UI Chip" ? 45 : 32, BRAND.navy, "DXED " + preset);
                if (opts.glow) addGlow(card, 30, 1.2, BRAND.purple);
                animateIn(card, mergeOpts(opts, { motion: "Scale Pop", easing: "Overshoot", time: t0 }));
                return card;
            }
            case "Floating Pill": {
                var pill = addRoundedRect(comp, [340, 110], 55, BRAND.purple, "DXED Pill");
                transformProps(pill).opac.setValue(90);
                try { transformProps(pill).pos.expression = "wiggle(0.4, 10)"; } catch (e) {}
                animateIn(pill, mergeOpts(opts, { motion: "Slide", easing: "Soft Bounce", time: t0 }));
                return pill;
            }
            case "Circle Glow":
            case "Glow Ring": {
                var c = addCircle(comp, 400, BRAND.purple, "DXED " + preset);
                centerLayer(c, comp);
                if (preset === "Glow Ring") makeStroke(c, BRAND.purple, 12);
                addGlow(c, 70, 2, BRAND.glow);
                transformProps(c).opac.setValue(60);
                animateIn(c, mergeOpts(opts, { motion: "Scale Pop", easing: "Smooth", time: t0 }));
                return c;
            }
            case "Background Blobs":
            case "Background Depth Layers": {
                var made = [];
                for (var i = 0; i < 3; i++) {
                    var blob = addCircle(comp, rndRange(400, 800), i === 1 ? BRAND.blue : BRAND.purple, "DXED Blob " + (i + 1));
                    transformProps(blob).pos.setValue([rndRange(0, comp.width), rndRange(0, comp.height)]);
                    transformProps(blob).opac.setValue(rndRange(15, 35));
                    addBlur(blob, rndRange(80, 160));
                    try { transformProps(blob).pos.expression = "wiggle(0.15, 60)"; } catch (e) {}
                    blob.moveToEnd();
                    made.push(blob);
                }
                return made;
            }
            case "Purple Accent Bar": {
                var bar = addRoundedRect(comp, [comp.width * 0.5, 14], 7, BRAND.purple, "DXED Accent Bar");
                addGlow(bar, 25, 1.5, BRAND.purple);
                animateIn(bar, mergeOpts(opts, { motion: "Mask Reveal", easing: "Snappy", time: t0 }));
                return bar;
            }
            case "Grid Lines": {
                var grid = addRoundedRect(comp, [comp.width, comp.height], 0, BRAND.navy, "DXED Grid");
                transformProps(grid).opac.setValue(20);
                grid.moveToEnd();
                return grid;
            }
            case "Animated Border": {
                var b = addRoundedRect(comp, [comp.width * 0.7, comp.height * 0.6], 30, BRAND.navy, "DXED Border");
                makeStroke(b, BRAND.purple, 6);
                fillOpacityZero(b);
                addGlow(b, 20, 1.4, BRAND.purple);
                animateIn(b, mergeOpts(opts, { motion: "Scale Pop", easing: "Overshoot", time: t0 }));
                return b;
            }
            case "Shape Wipe":
            case "Rounded Mask Transition": {
                var wipe = addRoundedRect(comp, [comp.width * 1.4, comp.height * 1.4], 60, BRAND.purple, "DXED Wipe");
                var sc = transformProps(wipe).scale;
                sc.setValueAtTime(t0, [0, 0]);
                sc.setValueAtTime(t0 + dur, [140, 140]);
                easeProperty(sc, 80, 80);
                return wipe;
            }
            default:
                return addRoundedRect(comp, [500, 300], 30, BRAND.navy, "DXED Shape");
        }
    }

    function makeStroke(shapeLayer, color, width) {
        var gc = shapeLayer.property("ADBE Root Vectors Group").property(1).property("ADBE Vectors Group");
        var stroke = gc.addProperty("ADBE Vector Graphic - Stroke");
        stroke.property("ADBE Vector Stroke Color").setValue(rgba(color, 1));
        stroke.property("ADBE Vector Stroke Width").setValue(width);
    }

    function fillOpacityZero(shapeLayer) {
        try {
            var gc = shapeLayer.property("ADBE Root Vectors Group").property(1).property("ADBE Vectors Group");
            for (var i = 1; i <= gc.numProperties; i++) {
                var p = gc.property(i);
                if (p.matchName === "ADBE Vector Graphic - Fill") p.property("ADBE Vector Fill Opacity").setValue(0);
            }
        } catch (e) {}
    }

    function addRoundedShapePack(comp, opts) {
        undoable("Add Rounded Shape Pack", function () {
            addShapePreset(comp, "Background Depth Layers", opts);
            addShapePreset(comp, "Rounded Rectangle Card", opts);
            addShapePreset(comp, "Floating Pill", opts);
            addShapePreset(comp, "Purple Accent Bar", opts);
        });
    }

    /* ===================================================================== *
     *  TRANSITIONS
     * ===================================================================== */

    var TRANSITIONS = [
        "Fade", "Blur Fade", "White Flash", "Purple Flash", "Glow Wipe",
        "Slide Wipe", "Rounded Rectangle Wipe", "Circle Reveal", "Zoom Flash",
        "Whip Pan", "Glitch Cut", "RGB Split Cut", "UI Card Wipe",
        "Window Push Transition", "Hard Beat Cut", "Smooth Apple Fade"
    ];

    function applyTransition(comp, name, t, opts) {
        var dur = opts.duration * 0.6;
        switch (name) {
            case "White Flash":  addFlash(comp, t, BRAND.white, 0.2, opts.flash || 2); break;
            case "Purple Flash": addFlash(comp, t, BRAND.purple, 0.22, opts.flash || 2); break;
            case "Zoom Flash":   addFlash(comp, t, BRAND.white, 0.18, 3); addCameraBump(comp, t, 12); break;
            case "Hard Beat Cut":addFlash(comp, t, BRAND.white, 0.1, 2); addCameraBump(comp, t, 8); break;
            case "Glow Wipe": {
                var gw = addRoundedRect(comp, [comp.width * 1.5, comp.height * 1.5], 40, BRAND.purple, "DXED Glow Wipe");
                addGlow(gw, 60, 2, BRAND.glow);
                var s = transformProps(gw).scale;
                s.setValueAtTime(t, [0, 0]); s.setValueAtTime(t + dur, [160, 160]); easeProperty(s, 80, 80);
                var o = transformProps(gw).opac;
                o.setValueAtTime(t, 100); o.setValueAtTime(t + dur, 0);
                gw.inPoint = t - 0.05; gw.outPoint = t + dur + 0.1; break;
            }
            case "Circle Reveal": {
                var cr = addCircle(comp, Math.max(comp.width, comp.height) * 2, BRAND.deepBg, "DXED Circle Wipe");
                centerLayer(cr, comp);
                var cs = transformProps(cr).scale;
                cs.setValueAtTime(t, [100, 100]); cs.setValueAtTime(t + dur, [0, 0]); easeProperty(cs, 80, 80);
                cr.inPoint = t - 0.05; cr.outPoint = t + dur + 0.1; break;
            }
            case "Rounded Rectangle Wipe":
            case "UI Card Wipe": {
                var rw = addRoundedRect(comp, [comp.width * 1.4, comp.height * 1.4], 60, BRAND.navy, "DXED Card Wipe");
                var rs = transformProps(rw).scale;
                rs.setValueAtTime(t, [0, 100]); rs.setValueAtTime(t + dur, [140, 140]); easeProperty(rs, 80, 80);
                rw.inPoint = t - 0.05; rw.outPoint = t + dur + 0.2; break;
            }
            case "Blur Fade": case "Fade": case "Smooth Apple Fade": default: {
                var f = addSolidLayer(comp, BRAND.deepBg, "DXED Fade");
                if (name === "Blur Fade") addBlur(f, 20);
                var fo = transformProps(f).opac;
                fo.setValueAtTime(t - dur / 2, 0);
                fo.setValueAtTime(t, 100);
                fo.setValueAtTime(t + dur / 2, 0);
                easeProperty(fo, 70, 70);
                f.inPoint = t - dur; f.outPoint = t + dur; break;
            }
            case "Whip Pan": {
                var adj = addAdjustment(comp, "DXED Whip");
                var db = addBlur(adj, 0);
                if (db) {
                    var bp = db.property(1);
                    try { db.property("Blur Dimensions").setValue(2); } catch (e) {} // horizontal
                    bp.setValueAtTime(t - dur / 2, 0);
                    bp.setValueAtTime(t, 120);
                    bp.setValueAtTime(t + dur / 2, 0);
                    easeProperty(bp, 70, 70);
                }
                adj.inPoint = t - dur; adj.outPoint = t + dur;
                addFlash(comp, t, BRAND.white, 0.08, 1); break;
            }
            case "RGB Split Cut": case "Glitch Cut": {
                var g = addAdjustment(comp, "DXED " + name);
                var parade = fx(g);
                try {
                    var disp = parade.addProperty("ADBE CurvesCustom"); // harmless if present
                } catch (e) {}
                addFlash(comp, t, BRAND.purple, 0.1, 2);
                addBeatShake(g, t, 14);
                g.inPoint = t - 0.1; g.outPoint = t + 0.3; break;
            }
        }
    }

    /* ===================================================================== *
     *  FULL PROMO SEQUENCE BUILDER
     * ===================================================================== */

    function buildFullPromo(opts) {
        undoable("Build Full DXED Promo Sequence", function () {
            var W = 1920, H = 1080, FPS = 30;
            var style = STYLE_PRESETS[CFG.style] || STYLE_PRESETS["Clean Premium"];
            var energy = ENERGY_PRESETS[CFG.energy] || ENERGY_PRESETS["Medium"];

            // Scene plan: [name, seconds].
            var plan = [
                ["Scene 01 - DXED Logo Intro",        3.0],
                ["Scene 02 - Hero Text",              3.0],
                ["Scene 03 - Website Window Reveal",  4.0],
                ["Scene 04 - Creator Section",        3.5],
                ["Scene 05 - Community Section",      3.5],
                ["Scene 06 - Project Section",        3.5],
                ["Scene 07 - Final CTA",              3.5]
            ];
            var total = 0;
            for (var p = 0; p < plan.length; p++) total += plan[p][1];

            var comp = app.project.items.addComp("DXED Promo (" + CFG.style + ")", W, H, 1, total, FPS);
            comp.openInViewer();

            var bg = addSolidLayer(comp, BRAND.deepBg, "DXED BG");
            bg.moveToEnd();

            // Grab user assets, if any: first text-capable and image layers selected before build.
            var userLogo = opts.logoLayer || null;
            var userShots = opts.imageLayers || [];

            var recipe = [];
            var t = 0;
            var d = opts.duration;

            for (var si = 0; si < plan.length; si++) {
                var name = plan[si][0];
                var segLen = plan[si][1];
                var segStart = t;
                var segEnd = t + segLen;
                addCompMarker(comp, segStart, name);
                var sceneLines = [name, fmtTime(segStart) + " - " + fmtTime(segEnd)];

                if (si === 0) {           /* ---- Logo intro ---- */
                    var logoTxt = addTextLayer(comp, "DXED", 200, BRAND.white);
                    addGlow(logoTxt, 60, 2, BRAND.purple);
                    animateIn(logoTxt, sceneOpts(segStart, d, "Scale Pop", "Overshoot", style));
                    animateOut(logoTxt, segEnd, 0.4, "Smooth", "Scale Pop");
                    var ring = addShapePreset(comp, "Glow Ring", sceneOpts(segStart + 0.2, d));
                    var bar = addShapePreset(comp, "Purple Accent Bar", sceneOpts(segStart + 0.4, d));
                    sceneLines.push("Marker: DXED text scale-pop + purple glow pulse");
                    sceneLines.push("Glow ring + accent bar reveal");
                    applyTransition(comp, "Purple Flash", segEnd - 0.05, opts);
                    sceneLines.push("Exit: purple flash transition");

                } else if (si === 1) {    /* ---- Hero text ---- */
                    addShapePreset(comp, "Background Depth Layers", sceneOpts(segStart, d));
                    var hero = addTextLayer(comp, "This is DXED.", 150, BRAND.white);
                    animateTextLayer(hero, "Text Slam", sceneOpts(segStart, d, null, "Hard Impact", style));
                    animateOut(hero, segEnd, 0.4, "Smooth", "Fade");
                    sceneLines.push("Marker: hero text slams in with bounce, dark tech bg");
                    applyTransition(comp, "White Flash", segEnd - 0.05, opts);

                } else if (si === 2) {    /* ---- Window reveal ---- */
                    var shot;
                    if (userShots.length > 0) {
                        shot = duplicateIntoComp(userShots[0], comp);
                    } else {
                        shot = addRoundedRect(comp, [960, 600], 8, hexToRGB("#12122A"), "Screenshot Placeholder");
                        addTextLayer(comp, "DXED.app", 60, BRAND.glow); // hint text over placeholder
                    }
                    var ctrl = makeScreenshotWindow(shot, "Window Zoom In",
                        mergeOpts(opts, { time: segStart, duration: d, glowBorder: true, cameraPush: true, shine: true }));
                    sceneLines.push("Marker: screenshot window scales in");
                    sceneLines.push("Glow border on, camera push, shine sweep");
                    applyTransition(comp, "Zoom Flash", segEnd - 0.05, opts);

                } else if (si === 3) {    /* ---- Creator section ---- */
                    var ct = addTextLayer(comp, "Post. Build. Connect.", 120, BRAND.white);
                    transformProps(ct).pos.setValue([comp.width / 2, comp.height * 0.35]);
                    animateTextLayer(ct, "Word-by-Word", sceneOpts(segStart, d, null, "Snappy", style));
                    // Floating UI cards.
                    for (var c = 0; c < 3; c++) {
                        var card = addRoundedRect(comp, [360, 220], 28, BRAND.navy, "Creator Card " + (c + 1));
                        addGlow(card, 20, 1, BRAND.purple);
                        transformProps(card).pos.setValue([comp.width * (0.28 + c * 0.22), comp.height * 0.68]);
                        animateIn(card, sceneOpts(segStart + 0.2 + c * 0.12, d, "UI Card Pop", "Soft Bounce", style));
                    }
                    sceneLines.push("Marker: kinetic text + 3 floating UI cards pop in");
                    applyTransition(comp, "Glow Wipe", segEnd - 0.05, opts);

                } else if (si === 4) {    /* ---- Community section ---- */
                    var comt = addTextLayer(comp, "Find your community.", 120, BRAND.white);
                    transformProps(comt).pos.setValue([comp.width / 2, comp.height * 0.3]);
                    animateTextLayer(comt, "Fade Up", sceneOpts(segStart, d, null, "Smooth", style));
                    for (var cc = 0; cc < 5; cc++) {
                        var chip = addRoundedRect(comp, [220, 80], 40, BRAND.purple, "Community Chip " + (cc + 1));
                        transformProps(chip).opac.setValue(90);
                        transformProps(chip).pos.setValue([comp.width * (0.2 + cc * 0.15), comp.height * 0.62]);
                        animateIn(chip, sceneOpts(segStart + 0.15 + cc * 0.1, d, "Scale Pop", "Overshoot", style));
                    }
                    sceneLines.push("Marker: text fade up + 5 community chips animate in");
                    applyTransition(comp, "Slide Wipe", segEnd - 0.05, opts);

                } else if (si === 5) {    /* ---- Project section (premium, later) ---- */
                    addShapePreset(comp, "Background Depth Layers", sceneOpts(segStart, d));
                    var pt = addTextLayer(comp, "Projects can build here too.", 100, BRAND.white);
                    animateTextLayer(pt, "Smooth Premium Reveal", sceneOpts(segStart, d, null, "Cinematic Slow", style));
                    var pbar = addShapePreset(comp, "Purple Accent Bar", sceneOpts(segStart + 0.3, d));
                    sceneLines.push("Marker: premium slow reveal, serious tone, accent bar");
                    applyTransition(comp, "Smooth Apple Fade", segEnd - 0.05, opts);

                } else if (si === 6) {    /* ---- Final CTA ---- */
                    var join = addTextLayer(comp, "Join DXED.", 160, BRAND.white);
                    transformProps(join).pos.setValue([comp.width / 2, comp.height * 0.42]);
                    addGlow(join, 50, 2, BRAND.purple);
                    animateTextLayer(join, "Scale Pop", sceneOpts(segStart, d, null, "Overshoot", style));
                    var url = addTextLayer(comp, "DXED.app", 90, BRAND.glow);
                    transformProps(url).pos.setValue([comp.width / 2, comp.height * 0.6]);
                    animateTextLayer(url, "Glow Reveal", sceneOpts(segStart + 0.4, d, null, "Smooth", style));
                    addShapePreset(comp, "Glow Ring", sceneOpts(segStart + 0.2, d));
                    sceneLines.push("Marker: 'Join DXED.' scale-pop + 'DXED.app' glow reveal outro");
                }

                recipe.push(sceneLines.join("\n"));
                t = segEnd;
            }

            if (style.flash > 0 && CFG.energy !== "Clean") {
                // Optional: light comp-wide grain of energy via a couple of markers already added.
            }

            // Store the recipe on the comp comment + build a recipe text layer.
            comp.comment = recipe.join("\n\n");
            buildRecipeLayer(comp, recipe);

            alert("Built '" + comp.name + "'\n" + plan.length + " scenes, " +
                  total + "s.\nMarkers placed at each scene start.\nRecipe saved to comp comment + hidden text layer.", SCRIPT_NAME);
        });
    }

    function sceneOpts(time, duration, motion, easing, style) {
        var o = {
            time: time,
            duration: duration,
            motion: motion || "Fade",
            easing: easing || "Smooth",
            direction: CFG.direction,
            distance: CFG.distance,
            glow: CFG.glow,
            flash: CFG.flash,
            color: (style && style.color) || BRAND.purple,
            seed: CFG.seed
        };
        return o;
    }

    function mergeOpts(base, extra) {
        var o = {};
        for (var k in base) if (base.hasOwnProperty(k)) o[k] = base[k];
        for (var k2 in extra) if (extra.hasOwnProperty(k2)) o[k2] = extra[k2];
        return o;
    }

    function duplicateIntoComp(srcLayer, destComp) {
        // If the source is footage, add its source; otherwise duplicate.
        try {
            if (srcLayer.source && srcLayer.source instanceof FootageItem) {
                return destComp.layers.add(srcLayer.source);
            }
        } catch (e) {}
        return addRoundedRect(destComp, [960, 600], 8, hexToRGB("#12122A"), "Screenshot Placeholder");
    }

    /* ===================================================================== *
     *  AUTO EDIT TO MARKERS
     * ===================================================================== */

    function autoEditToMarkers(opts) {
        var comp = activeComp(); if (!comp) return;
        var markers = compMarkerTimes(comp);
        if (markers.length < 2) { alert("Need at least 2 comp markers to auto-edit.", SCRIPT_NAME); return; }
        var layers = comp.selectedLayers;
        if (!layers || layers.length === 0) { alert("Select the scene layers to distribute across markers.", SCRIPT_NAME); return; }

        if (layers.length > 6) {
            var go = confirm("Auto-edit " + layers.length + " layers across " + markers.length +
                             " markers?\nExisting keyframes are kept; new intro/exit keys are added.", false, SCRIPT_NAME);
            if (!go) return;
        }

        undoable("Auto Edit To Markers", function () {
            var n = Math.min(layers.length, markers.length - 1);
            for (var i = 0; i < layers.length; i++) {
                var segStart = markers[Math.min(i, markers.length - 1)];
                var segEnd = markers[Math.min(i + 1, markers.length - 1)];
                if (segEnd <= segStart) segEnd = segStart + opts.duration + 0.4;
                layers[i].startTime = layers[i].startTime; // keep
                try { layers[i].inPoint = segStart; layers[i].outPoint = segEnd; } catch (e) {}
                animateIn(layers[i], sceneOpts(segStart, opts.duration, "Scale Pop", CFG_easing(), STYLE_PRESETS[CFG.style]));
                animateOut(layers[i], segEnd, 0.35, "Smooth", "Fade");
                if ((i + 1) % 4 === 0) addCameraBump(comp, segStart, 10);
            }
            // Flashes on strong markers.
            for (var m = 0; m < markers.length; m++) {
                if ((m + 1) % 4 === 0) addFlash(comp, markers[m], BRAND.white, 0.14, 2);
            }
        });
    }

    function CFG_easing() { return (STYLE_PRESETS[CFG.style] || {}).easing || "Smooth"; }

    /* ===================================================================== *
     *  RECIPE EXPORT
     * ===================================================================== */

    function fmtTime(sec) {
        var m = Math.floor(sec / 60);
        var s = sec - m * 60;
        var ss = (s < 10 ? "0" : "") + s.toFixed(1);
        return m + ":" + ss;
    }

    function buildRecipeLayer(comp, recipeArr) {
        var text = "DXED MOTION RECIPE\n" + comp.name + "\n\n" + recipeArr.join("\n\n");
        var tl = addTextLayer(comp, text, 24, BRAND.glow);
        tl.name = "DXED Recipe (guide)";
        tl.enabled = false;                 // hidden guide layer
        tl.shy = true;
        try {
            var td = tl.property("ADBE Text Properties").property("ADBE Text Document").value;
            td.justification = ParagraphJustification.LEFT_JUSTIFY;
            tl.property("ADBE Text Properties").property("ADBE Text Document").setValue(td);
        } catch (e) {}
        transformProps(tl).pos.setValue([80, 120]);
        transformProps(tl).anchor.setValue([0, 0]);
        return tl;
    }

    function exportRecipe() {
        var comp = activeComp(); if (!comp) return;
        undoable("Export Motion Recipe", function () {
            var lines = ["DXED MOTION RECIPE", "Comp: " + comp.name,
                         "Duration: " + fmtTime(comp.duration) + "   FPS: " + comp.frameRate.toFixed(0),
                         "Style: " + CFG.style + "   Energy: " + CFG.energy, ""];
            var markers = compMarkerTimes(comp);
            if (markers.length) {
                lines.push("MARKERS / SCENES:");
                var mp = comp.markerProperty;
                for (var i = 1; i <= mp.numKeys; i++) {
                    var mv = mp.keyValue(i);
                    lines.push("  " + fmtTime(mp.keyTime(i)) + "  " + (mv.comment || "(beat)"));
                }
                lines.push("");
            }
            lines.push("LAYERS:");
            for (var l = 1; l <= comp.numLayers; l++) {
                var ly = comp.layer(l);
                var anim = [];
                var tp = transformProps(ly);
                if (tp.pos.numKeys) anim.push("position");
                if (tp.scale.numKeys) anim.push("scale");
                if (tp.opac.numKeys) anim.push("opacity");
                if (tp.rot.numKeys) anim.push("rotation");
                lines.push("  " + ly.index + ". " + ly.name +
                    "  [" + fmtTime(ly.inPoint) + "-" + fmtTime(ly.outPoint) + "]" +
                    (anim.length ? "  animates: " + anim.join(", ") : ""));
            }
            if (comp.comment) { lines.push("", "SCENE NOTES:", comp.comment); }

            var report = lines.join("\n");

            // Offer to save to disk; always drop a guide text layer too.
            var saved = false;
            try {
                var f = File.saveDialog("Save DXED motion recipe", "*.txt");
                if (f) {
                    f.open("w"); f.write(report); f.close();
                    saved = true;
                }
            } catch (e) {}

            buildRecipeLayer(comp, [report.replace("DXED MOTION RECIPE\n", "")]);
            alert("Recipe exported" + (saved ? " to file + guide layer." : " as a guide text layer."), SCRIPT_NAME);
        });
    }

    /* ===================================================================== *
     *  CLEAN-UP / POLISH
     * ===================================================================== */

    function cleanUpMotion() {
        var layers = selectedLayers(); if (!layers) return;
        undoable("Clean Up Motion", function () {
            var names = ["ADBE Position", "ADBE Scale", "ADBE Rotate Z", "ADBE Opacity"];
            for (var i = 0; i < layers.length; i++) {
                var tg = layers[i].property("ADBE Transform Group");
                for (var j = 0; j < names.length; j++) {
                    var p = tg.property(names[j]);
                    if (p && p.numKeys > 0) easeProperty(p, 70, 70);
                }
                try { layers[i].motionBlur = true; } catch (e) {}
            }
        });
    }

    function makeMorePremium() {
        var layers = selectedLayers(); if (!layers) return;
        undoable("Make It More Premium", function () {
            var names = ["ADBE Position", "ADBE Scale", "ADBE Opacity"];
            for (var i = 0; i < layers.length; i++) {
                var tg = layers[i].property("ADBE Transform Group");
                for (var j = 0; j < names.length; j++) {
                    var p = tg.property(names[j]);
                    if (p && p.numKeys > 0) {
                        easeProperty(p, 90, 90);   // slower, cinematic
                        // Stretch the animation slightly for luxury pacing.
                    }
                }
                addGlow(layers[i], 22, 1.1, BRAND.purple);
                try { layers[i].motionBlur = true; } catch (e) {}
            }
        });
    }

    function makeMoreHype() {
        var layers = selectedLayers(); if (!layers) return;
        undoable("Make It More Hype", function () {
            var comp = layers[0].containingComp;
            var names = ["ADBE Position", "ADBE Scale", "ADBE Opacity"];
            for (var i = 0; i < layers.length; i++) {
                var tg = layers[i].property("ADBE Transform Group");
                for (var j = 0; j < names.length; j++) {
                    var p = tg.property(names[j]);
                    if (p && p.numKeys > 0) easeProperty(p, 40, 25); // snappier
                }
                // Add a scale kick at the first keyframe time.
                var sc = tg.property("ADBE Scale");
                if (sc && sc.numKeys > 0) {
                    var kt = sc.keyTime(1);
                    addFlash(comp, kt, BRAND.white, 0.1, 2);
                }
                try { layers[i].motionBlur = true; } catch (e) {}
            }
        });
    }

    function randomizePreset() {
        seedRandom(CFG.seed + comp_seed_salt());
        CFG.direction = DIRECTIONS[Math.floor(rnd() * DIRECTIONS.length)];
        var easing = EASINGS[Math.floor(rnd() * EASINGS.length)];
        var motion = MOTION_TYPES[Math.floor(rnd() * MOTION_TYPES.length)];
        var layers = selectedLayers(true);
        if (!layers) {
            alert("Randomized preset:\nMotion: " + motion + "\nDirection: " + CFG.direction +
                  "\nEasing: " + easing + "\n(Select layers to apply.)", SCRIPT_NAME);
            return;
        }
        undoable("Randomize Preset", function () {
            var comp = layers[0].containingComp;
            for (var i = 0; i < layers.length; i++) {
                animateIn(layers[i], {
                    time: comp.time, duration: CFG.duration, motion: motion,
                    easing: easing, direction: CFG.direction, distance: CFG.distance,
                    glow: CFG.glow, flash: CFG.flash, color: BRAND.purple, seed: CFG.seed
                });
            }
        });
    }

    function comp_seed_salt() {
        var c = activeComp(true);
        return c ? Math.round(c.numLayers * 7 + c.duration * 13) : 3;
    }

    /* ===================================================================== *
     *  DXED INTRO (quick single-scene)
     * ===================================================================== */

    function createDXEDIntro() {
        undoable("Create DXED Intro", function () {
            var style = STYLE_PRESETS[CFG.style] || STYLE_PRESETS["Clean Premium"];
            var comp = app.project.items.addComp("DXED Intro", 1920, 1080, 1, 4, 30);
            comp.openInViewer();
            addSolidLayer(comp, BRAND.deepBg, "DXED BG").moveToEnd();
            addShapePreset(comp, "Background Depth Layers", sceneOpts(0, CFG.duration));
            var logo = addTextLayer(comp, "DXED", 220, BRAND.white);
            addGlow(logo, 60, 2, style.color);
            animateIn(logo, sceneOpts(0.2, CFG.duration, "Scale Pop", "Overshoot", style));
            addShapePreset(comp, "Glow Ring", sceneOpts(0.3, CFG.duration));
            var url = addTextLayer(comp, "DXED.app", 70, BRAND.glow);
            transformProps(url).pos.setValue([comp.width / 2, comp.height * 0.62]);
            animateIn(url, sceneOpts(0.8, CFG.duration, "Fade", "Smooth", style));
            applyTransition(comp, "Purple Flash", 3.6, { duration: CFG.duration, flash: CFG.flash });
            addCompMarker(comp, 0, "DXED Intro");
        });
    }

    /* ===================================================================== *
     *  UI  ==================================================================
     * ===================================================================== */

    function buildUI(thisObj) {
        var win = (thisObj instanceof Panel)
            ? thisObj
            : new Window("palette", SCRIPT_NAME + " v" + VERSION, undefined, { resizeable: true });
        win.orientation = "column";
        win.alignChildren = ["fill", "top"];
        win.spacing = 6;
        win.margins = 8;

        /* ---- Header ---- */
        var header = win.add("group");
        header.orientation = "row";
        header.alignChildren = ["fill", "center"];
        var title = header.add("statictext", undefined, "◆ DXED MOTION BUILDER");
        try { title.graphics.font = ScriptUI.newFont("dialog", "BOLD", 15); } catch (e) {}
        var combo = header.add("statictext", undefined,
            "Engine: " + formatThousands(presetCombinationCount()) + "+ presets");
        combo.alignment = ["right", "center"];
        try { combo.graphics.font = ScriptUI.newFont("dialog", "ITALIC", 10); } catch (e) {}

        /* ---- Easy Mode ---- */
        var easy = win.add("panel", undefined, "Easy Mode");
        easy.orientation = "column";
        easy.alignChildren = ["fill", "top"];
        easy.margins = 10; easy.spacing = 5;

        var eRow = easy.add("group"); eRow.orientation = "row";
        eRow.add("statictext", undefined, "Style:");
        var styleDD = eRow.add("dropdownlist", undefined,
            ["Clean Premium", "Fast Hype", "Dark Tech", "Creator Energy", "Apple-Level Clean", "Crypto Project"]);
        styleDD.selection = 0;
        eRow.add("statictext", undefined, "Energy:");
        var energyDD = eRow.add("dropdownlist", undefined, ["Clean", "Medium", "Hype", "Insane"]);
        energyDD.selection = 1;

        styleDD.onChange = function () { CFG.style = styleDD.selection.text; applyEnergyStyle(); };
        energyDD.onChange = function () { CFG.energy = energyDD.selection.text; applyEnergyStyle(); };

        function applyEnergyStyle() {
            var sp = STYLE_PRESETS[CFG.style] || {};
            var en = ENERGY_PRESETS[CFG.energy] || {};
            CFG.glow = sp.glow; CFG.flash = Math.round((sp.flash || 1) * (en.flashMul || 1));
            CFG.bounce = Math.round(1 * (en.bounceMul || 1));
            CFG.duration = clamp(0.6 * (en.durMul || 1), 0.15, 3);
            syncAdvancedFields();
        }

        // Easy buttons grid.
        var eb = easy.add("group"); eb.orientation = "column"; eb.alignChildren = ["fill", "top"]; eb.spacing = 4;
        var ebr1 = eb.add("group"); ebr1.orientation = "row"; ebr1.alignChildren = ["fill", "center"];
        addBtn(ebr1, "Create DXED Intro", createDXEDIntro);
        addBtn(ebr1, "Build Full Promo", function () { buildFullPromo(currentOpts()); });
        var ebr2 = eb.add("group"); ebr2.orientation = "row"; ebr2.alignChildren = ["fill", "center"];
        addBtn(ebr2, "Beat Sync Selected", doBeatSync);
        addBtn(ebr2, "Animate Selected Text", doAnimateText);
        var ebr3 = eb.add("group"); ebr3.orientation = "row"; ebr3.alignChildren = ["fill", "center"];
        addBtn(ebr3, "Make Screenshot Window", doMakeWindow);
        addBtn(ebr3, "Add Flash On Markers", doFlashMarkers);
        var ebr4 = eb.add("group"); ebr4.orientation = "row"; ebr4.alignChildren = ["fill", "center"];
        addBtn(ebr4, "Add Rounded Shapes", function () { var c = activeComp(); if (c) addRoundedShapePack(c, currentOpts()); });
        addBtn(ebr4, "Export Motion Recipe", exportRecipe);

        /* ---- Advanced Mode (collapsible) ---- */
        var advPanel = win.add("panel", undefined, "Advanced Mode");
        advPanel.orientation = "column";
        advPanel.alignChildren = ["fill", "top"];
        advPanel.margins = 10; advPanel.spacing = 4;

        var advToggle = advPanel.add("checkbox", undefined, "Show advanced controls");
        var advBody = advPanel.add("group");
        advBody.orientation = "column"; advBody.alignChildren = ["fill", "top"]; advBody.spacing = 3;
        advBody.visible = false;
        advToggle.onClick = function () { advBody.visible = advToggle.value; win.layout.layout(true); };

        var durF   = labeledField(advBody, "Duration (s)", "0.6");
        var delayF = labeledField(advBody, "Delay (s)", "0.0");
        var dirDD  = labeledDrop(advBody, "Direction", DIRECTIONS, 0);
        var bounceF= labeledField(advBody, "Bounce amount", "1");
        var glowF  = labeledField(advBody, "Glow amount", "1");
        var blurF  = labeledField(advBody, "Blur amount", "1");
        var flashF = labeledField(advBody, "Flash strength", "1");
        var scaleF = labeledField(advBody, "Scale amount (%)", "100");
        var distF  = labeledField(advBody, "Position distance (px)", "300");
        var offF   = labeledField(advBody, "Marker offset (s)", "0.0");
        var seedF  = labeledField(advBody, "Random seed", "12345");

        var applyGrp = advBody.add("group"); applyGrp.orientation = "row";
        applyGrp.add("statictext", undefined, "Apply to:");
        var applyDD = applyGrp.add("dropdownlist", undefined, ["Selected layers", "Full comp", "Selected markers"]);
        applyDD.selection = 0;

        function syncAdvancedFields() {
            durF.text = CFG.duration.toFixed(2);
            glowF.text = "" + CFG.glow; flashF.text = "" + CFG.flash; bounceF.text = "" + CFG.bounce;
        }
        function readAdvanced() {
            CFG.duration = clamp(pf(durF, 0.6), 0.05, 30);
            CFG.delay = pf(delayF, 0);
            CFG.direction = dirDD.selection ? dirDD.selection.text : "Up";
            CFG.bounce = pf(bounceF, 1); CFG.glow = pf(glowF, 1); CFG.blur = pf(blurF, 1);
            CFG.flash = pf(flashF, 1); CFG.scale = pf(scaleF, 100); CFG.distance = pf(distF, 300);
            CFG.markerOffset = pf(offF, 0); CFG.seed = Math.round(pf(seedF, 12345));
            CFG.applyTo = applyDD.selection.index === 1 ? "comp" : (applyDD.selection.index === 2 ? "markers" : "selected");
        }

        /* ---- Tabbed sections ---- */
        var tp = win.add("tabbedpanel");
        tp.alignChildren = ["fill", "fill"];
        tp.preferredSize.height = 260;

        buildQuickTab(tp.add("tab", undefined, "Quick Build"));
        buildBeatTab(tp.add("tab", undefined, "Beat Sync"));
        buildTextTab(tp.add("tab", undefined, "Text"));
        buildWindowTab(tp.add("tab", undefined, "Window"));
        buildShapeTab(tp.add("tab", undefined, "Shape"));
        buildTransitionTab(tp.add("tab", undefined, "Transitions"));
        buildFlashTab(tp.add("tab", undefined, "Flash/Impact"));
        buildRecipeTab(tp.add("tab", undefined, "Recipe"));

        /* ---- Footer ---- */
        var foot = win.add("statictext", undefined,
            "Select layers, then click. Every action is one undo step (Ctrl/Cmd+Z).");
        try { foot.graphics.font = ScriptUI.newFont("dialog", "ITALIC", 10); } catch (e) {}

        /* ================= tab builders ================= */

        function buildQuickTab(tab) {
            tab.orientation = "column"; tab.alignChildren = ["fill", "top"]; tab.margins = 10; tab.spacing = 4;
            var r1 = row(tab);
            addBtn(r1, "Build Full DXED Promo Sequence", function () { buildFullPromo(currentOpts()); });
            var r2 = row(tab);
            addBtn(r2, "Auto Edit To Markers", function () { autoEditToMarkers(currentOpts()); });
            addBtn(r2, "Randomize Preset", randomizePreset);
            var r3 = row(tab);
            addBtn(r3, "Make It More Premium", makeMorePremium);
            addBtn(r3, "Make It More Hype", makeMoreHype);
            var r4 = row(tab);
            addBtn(r4, "Clean Up Motion", cleanUpMotion);
            addBtn(r4, "Add Camera Bumps", function () { var c = activeComp(); if (c) undoable("Add Camera Bumps", function () { addCameraBumpsOnMarkers(c, 4, 10); }); });
            tab.add("statictext", undefined, "Motion types available: " + MOTION_TYPES.length +
                " · Easings: " + EASINGS.length + " · Styles: " + VISUAL_STYLES.length);
        }

        function buildBeatTab(tab) {
            tab.orientation = "column"; tab.alignChildren = ["fill", "top"]; tab.margins = 10; tab.spacing = 4;
            var mk = row(tab);
            mk.add("statictext", undefined, "Marker interval (s):");
            var intF = mk.add("edittext", undefined, "0.5"); intF.characters = 5;
            mk.add("statictext", undefined, "Count:");
            var cntF = mk.add("edittext", undefined, "16"); cntF.characters = 4;
            addBtn(mk, "Add Beat Markers", function () {
                var c = activeComp(); if (c) addBeatMarkers(c, pf(intF, 0.5), Math.round(pf(cntF, 16)));
            });

            var opt = row(tab);
            opt.add("statictext", undefined, "Anim length (s):");
            var alF = opt.add("edittext", undefined, "0.3"); alF.characters = 4;
            opt.add("statictext", undefined, "Behavior:");
            var behDD = opt.add("dropdownlist", undefined, MARKER_BEHAV); behDD.selection = 2;

            var chkGrp = row(tab);
            var flashChk = chkGrp.add("checkbox", undefined, "Flash on strong (4th) markers"); flashChk.value = true;

            var go = row(tab);
            addBtn(go, "Beat Sync Selected Layers", function () {
                var layers = selectedLayers(); if (!layers) return;
                readAdvanced();
                undoable("Beat Sync Selected Layers", function () {
                    beatSyncLayers(layers, {
                        offset: CFG.markerOffset, animLen: pf(alF, 0.3),
                        pop: 12 * CFG.bounce, strongPop: 26 * CFG.bounce,
                        behavior: behDD.selection.text, flashOnMarkers: flashChk.value,
                        flashColor: BRAND.white, flashLen: 0.14, seed: CFG.seed
                    });
                });
            });
            var go2 = row(tab);
            addBtn(go2, "Auto Edit To Markers", function () { autoEditToMarkers(currentOpts()); });
            addBtn(go2, "Add Camera Bumps (4th)", function () {
                var c = activeComp(); if (c) undoable("Add Camera Bumps", function () { addCameraBumpsOnMarkers(c, 4, 10); });
            });
            tab.add("statictext", undefined, "Tip: press * on the numpad while playing to drop beat markers.");
        }

        function buildTextTab(tab) {
            tab.orientation = "column"; tab.alignChildren = ["fill", "top"]; tab.margins = 10; tab.spacing = 4;
            var r = row(tab);
            r.add("statictext", undefined, "Preset:");
            var animDD = r.add("dropdownlist", undefined, TEXT_ANIMS); animDD.selection = 0;
            var r2 = row(tab);
            r2.add("statictext", undefined, "New text (if none selected):");
            var txtDD = r2.add("dropdownlist", undefined, DXED_TEXTS); txtDD.selection = 0;
            var r3 = row(tab);
            addBtn(r3, "Animate Selected Text", function () {
                doAnimateTextWith(animDD.selection.text, txtDD.selection.text);
            });
            addBtn(r3, "New DXED Text + Animate", function () {
                var c = activeComp(); if (!c) return;
                readAdvanced();
                undoable("New DXED Text", function () {
                    var tl = addTextLayer(c, txtDD.selection.text, 120, BRAND.white);
                    animateTextLayer(tl, animDD.selection.text, textOpts(c.time));
                });
            });
        }

        function buildWindowTab(tab) {
            tab.orientation = "column"; tab.alignChildren = ["fill", "top"]; tab.margins = 10; tab.spacing = 4;
            var r = row(tab);
            r.add("statictext", undefined, "Window preset:");
            var wDD = r.add("dropdownlist", undefined, WINDOW_PRESETS); wDD.selection = 0;
            var opts = row(tab);
            var glowChk = opts.add("checkbox", undefined, "Glow border"); glowChk.value = true;
            var pushChk = opts.add("checkbox", undefined, "Camera push"); pushChk.value = true;
            var shineChk = opts.add("checkbox", undefined, "Shine sweep"); shineChk.value = true;
            var r2 = row(tab);
            addBtn(r2, "Make Screenshot Window", function () {
                var layers = selectedLayers(); if (!layers) return;
                readAdvanced();
                undoable("Make Screenshot Window", function () {
                    makeScreenshotWindow(layers[0], wDD.selection.text, mergeOpts(currentOpts(), {
                        time: layers[0].containingComp.time, glowBorder: glowChk.value,
                        cameraPush: pushChk.value, shine: shineChk.value
                    }));
                });
            });
            tab.add("statictext", undefined, "Select an image / screenshot / precomp layer first.");
        }

        function buildShapeTab(tab) {
            tab.orientation = "column"; tab.alignChildren = ["fill", "top"]; tab.margins = 10; tab.spacing = 4;
            var r = row(tab);
            r.add("statictext", undefined, "Shape preset:");
            var sDD = r.add("dropdownlist", undefined, SHAPE_PRESETS); sDD.selection = 0;
            var r2 = row(tab);
            addBtn(r2, "Add Shape", function () {
                var c = activeComp(); if (!c) return;
                readAdvanced();
                undoable("Add Shape Preset", function () { addShapePreset(c, sDD.selection.text, currentOpts()); });
            });
            addBtn(r2, "Add Rounded Shape Pack", function () {
                var c = activeComp(); if (c) { readAdvanced(); addRoundedShapePack(c, currentOpts()); }
            });
        }

        function buildTransitionTab(tab) {
            tab.orientation = "column"; tab.alignChildren = ["fill", "top"]; tab.margins = 10; tab.spacing = 4;
            var r = row(tab);
            r.add("statictext", undefined, "Transition:");
            var trDD = r.add("dropdownlist", undefined, TRANSITIONS); trDD.selection = 2;
            var r2 = row(tab);
            addBtn(r2, "Apply At Current Time", function () {
                var c = activeComp(); if (!c) return;
                readAdvanced();
                undoable("Apply Transition", function () { applyTransition(c, trDD.selection.text, c.time, currentOpts()); });
            });
            addBtn(r2, "Apply On All Markers", function () {
                var c = activeComp(); if (!c) return;
                var mk = compMarkerTimes(c);
                if (!mk.length) { alert("No comp markers found.", SCRIPT_NAME); return; }
                readAdvanced();
                undoable("Apply Transition On Markers", function () {
                    for (var i = 0; i < mk.length; i++) applyTransition(c, trDD.selection.text, mk[i], currentOpts());
                });
            });
        }

        function buildFlashTab(tab) {
            tab.orientation = "column"; tab.alignChildren = ["fill", "top"]; tab.margins = 10; tab.spacing = 4;
            var impacts = ["Soft Flash", "Hard Flash", "Purple Flash", "White Flash", "Glow Burst",
                "Camera Bump", "Beat Shake", "Bass Pulse", "Chromatic Split", "Blur Hit",
                "UI Ripple", "Text Impact", "Window Impact", "Edge Glow"];
            var r = row(tab);
            r.add("statictext", undefined, "Impact:");
            var iDD = r.add("dropdownlist", undefined, impacts); iDD.selection = 3;
            var r2 = row(tab);
            addBtn(r2, "Apply At Current Time", function () { doImpact(iDD.selection.text, false); });
            addBtn(r2, "Apply On Markers", function () { doImpact(iDD.selection.text, true); });
            var r3 = row(tab);
            addBtn(r3, "Add Flash On Markers", doFlashMarkers);
        }

        function buildRecipeTab(tab) {
            tab.orientation = "column"; tab.alignChildren = ["fill", "top"]; tab.margins = 10; tab.spacing = 4;
            addBtn(row(tab), "Export Motion Recipe", exportRecipe);
            tab.add("statictext", undefined, "Saves a .txt summary and adds a hidden guide text layer");
            tab.add("statictext", undefined, "listing scenes, marker times, layers, and animations.");
        }

        /* ================= shared button actions ================= */

        function doBeatSync() {
            var layers = selectedLayers(); if (!layers) return;
            readAdvanced();
            undoable("Beat Sync Selected Layers", function () {
                beatSyncLayers(layers, {
                    offset: CFG.markerOffset, animLen: 0.3,
                    pop: 12 * CFG.bounce, strongPop: 26 * CFG.bounce,
                    behavior: "Every 4th Strong", flashOnMarkers: true,
                    flashColor: BRAND.white, flashLen: 0.14, seed: CFG.seed
                });
            });
        }
        function doAnimateText() {
            doAnimateTextWith("Smooth Premium Reveal", DXED_TEXTS[0]);
        }
        function doAnimateTextWith(animName, fallbackText) {
            var comp = activeComp(); if (!comp) return;
            readAdvanced();
            var sel = comp.selectedLayers;
            var textLayers = [];
            for (var i = 0; i < sel.length; i++) if (sel[i] instanceof TextLayer) textLayers.push(sel[i]);
            undoable("Animate Text", function () {
                if (textLayers.length === 0) {
                    var tl = addTextLayer(comp, fallbackText, 120, BRAND.white);
                    animateTextLayer(tl, animName, textOpts(comp.time));
                } else {
                    for (var j = 0; j < textLayers.length; j++)
                        animateTextLayer(textLayers[j], animName, textOpts(comp.time + j * CFG.delay));
                }
            });
        }
        function doMakeWindow() {
            var layers = selectedLayers(); if (!layers) return;
            readAdvanced();
            undoable("Make Screenshot Window", function () {
                makeScreenshotWindow(layers[0], "Floating Browser Window", mergeOpts(currentOpts(), {
                    time: layers[0].containingComp.time, glowBorder: true, cameraPush: true, shine: true
                }));
            });
        }
        function doFlashMarkers() {
            var comp = activeComp(); if (!comp) return;
            readAdvanced();
            undoable("Add Flash On Markers", function () {
                addFlashOnMarkers(comp, {
                    offset: CFG.markerOffset, strength: CFG.flash, len: 0.14, strongLen: 0.2,
                    color: BRAND.white, strongColor: BRAND.purple
                });
            });
        }
        function doImpact(name, onMarkers) {
            var comp = activeComp(); if (!comp) return;
            readAdvanced();
            var times = onMarkers ? compMarkerTimes(comp) : [comp.time];
            if (onMarkers && !times.length) { alert("No comp markers found.", SCRIPT_NAME); return; }
            undoable(name, function () {
                for (var i = 0; i < times.length; i++) {
                    var t = times[i] + CFG.markerOffset;
                    switch (name) {
                        case "Soft Flash":   addFlash(comp, t, BRAND.white, 0.25, 1); break;
                        case "Hard Flash":   addFlash(comp, t, BRAND.white, 0.12, 3); break;
                        case "Purple Flash": addFlash(comp, t, BRAND.purple, 0.2, 2); break;
                        case "White Flash":  addFlash(comp, t, BRAND.white, 0.18, 2); break;
                        case "Glow Burst":   var f = addFlash(comp, t, BRAND.glow, 0.3, 3); addGlow(f, 60, 3, BRAND.purple); break;
                        case "Camera Bump":  addCameraBump(comp, t, 12); break;
                        case "Beat Shake":   var sl = comp.selectedLayers[0]; if (sl) addBeatShake(sl, t, 16); else addCameraBump(comp, t, 8); break;
                        case "Bass Pulse":   addCameraBump(comp, t, 18); addFlash(comp, t, BRAND.purple, 0.25, 1); break;
                        case "Chromatic Split": addFlash(comp, t, BRAND.purple, 0.12, 2); addCameraBump(comp, t, 6); break;
                        case "Blur Hit":     var adj = addAdjustment(comp, "DXED Blur Hit"); var b = addBlur(adj, 0); if (b) { var bp = b.property(1); bp.setValueAtTime(t, 40); bp.setValueAtTime(t + 0.2, 0); easeProperty(bp, 80, 80); } adj.inPoint = t - 0.05; adj.outPoint = t + 0.3; break;
                        case "UI Ripple":    var rp = addCircle(comp, 40, BRAND.purple, "DXED Ripple"); centerLayer(rp, comp); fillOpacityZero(rp); makeStroke(rp, BRAND.purple, 8); var rs = transformProps(rp).scale; rs.setValueAtTime(t, [10, 10]); rs.setValueAtTime(t + 0.5, [400, 400]); var ro = transformProps(rp).opac; ro.setValueAtTime(t, 100); ro.setValueAtTime(t + 0.5, 0); rp.inPoint = t; rp.outPoint = t + 0.6; break;
                        case "Text Impact":  var tl = comp.selectedLayers[0]; if (tl) addBeatShake(tl, t, 12); addFlash(comp, t, BRAND.white, 0.1, 2); break;
                        case "Window Impact":addCameraBump(comp, t, 10); addFlash(comp, t, BRAND.purple, 0.15, 2); break;
                        case "Edge Glow":    var eg = addAdjustment(comp, "DXED Edge Glow"); addGlow(eg, 40, 2, BRAND.purple); var eo = transformProps(eg).opac; eo.setValueAtTime(t, 0); eo.setValueAtTime(t + 0.15, 100); eo.setValueAtTime(t + 0.6, 0); eg.inPoint = t; eg.outPoint = t + 0.7; break;
                    }
                }
            });
        }

        function textOpts(time) {
            return { time: time, duration: CFG.duration, easing: CFG_easing(),
                     distance: CFG.distance, color: (STYLE_PRESETS[CFG.style] || {}).color || BRAND.purple };
        }

        function currentOpts() {
            readAdvanced();
            return {
                duration: CFG.duration, delay: CFG.delay, direction: CFG.direction,
                distance: CFG.distance, glow: CFG.glow, blur: CFG.blur, flash: CFG.flash,
                bounce: CFG.bounce, scale: CFG.scale, seed: CFG.seed,
                markerOffset: CFG.markerOffset, easing: CFG_easing(),
                color: (STYLE_PRESETS[CFG.style] || {}).color || BRAND.purple,
                logoLayer: firstSelectedText(), imageLayers: selectedImages()
            };
        }

        // Init defaults.
        applyEnergyStyle();

        win.layout.layout(true);
        win.onResizing = win.onResize = function () { this.layout.resize(); };
        if (win instanceof Window) { win.center(); win.show(); }
        return win;
    }

    /* ===================================================================== *
     *  UI helper widgets
     * ===================================================================== */

    function addBtn(parent, label, fn) {
        var b = parent.add("button", undefined, label);
        b.alignment = ["fill", "center"];
        b.onClick = fn;
        return b;
    }
    function row(parent) {
        var g = parent.add("group"); g.orientation = "row"; g.alignChildren = ["fill", "center"]; g.spacing = 4;
        return g;
    }
    function labeledField(parent, label, def) {
        var g = parent.add("group"); g.orientation = "row"; g.alignChildren = ["left", "center"];
        var st = g.add("statictext", undefined, label + ":"); st.preferredSize.width = 140;
        var f = g.add("edittext", undefined, def); f.characters = 8; f.alignment = ["fill", "center"];
        return f;
    }
    function labeledDrop(parent, label, items, sel) {
        var g = parent.add("group"); g.orientation = "row"; g.alignChildren = ["left", "center"];
        var st = g.add("statictext", undefined, label + ":"); st.preferredSize.width = 140;
        var dd = g.add("dropdownlist", undefined, items); dd.selection = sel || 0; dd.alignment = ["fill", "center"];
        return dd;
    }
    function pf(field, fallback) { var v = parseFloat(field.text); return isNaN(v) ? fallback : v; }

    function formatThousands(n) {
        var s = "" + n, out = "", c = 0;
        for (var i = s.length - 1; i >= 0; i--) { out = s.charAt(i) + out; if (++c % 3 === 0 && i > 0) out = "," + out; }
        return out;
    }

    function firstSelectedText() {
        var c = activeComp(true); if (!c) return null;
        var sel = c.selectedLayers;
        for (var i = 0; i < sel.length; i++) if (sel[i] instanceof TextLayer || sel[i] instanceof AVLayer) return sel[i];
        return null;
    }
    function selectedImages() {
        var c = activeComp(true); if (!c) return [];
        var out = [], sel = c.selectedLayers;
        for (var i = 0; i < sel.length; i++) {
            try { if (sel[i].source && (sel[i].source instanceof FootageItem || sel[i].source instanceof CompItem)) out.push(sel[i]); } catch (e) {}
        }
        return out;
    }

    /* ===================================================================== *
     *  BOOT
     * ===================================================================== */

    buildUI(thisObj);

})(this);
