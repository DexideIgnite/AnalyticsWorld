/**********************************************************************************
 * Motion Design Studio
 * ------------------------------------------------------------------------------
 * A one-stop After Effects motion-design toolkit (ExtendScript / ScriptUI panel).
 *
 * It animates and edits (almost) everything motion related on your selected
 * layers: position, scale, rotation, opacity, anchor point, easing, motion blur,
 * plus a library of one-click animation presets, physics expressions and
 * multi-layer sequencing.
 *
 * INSTALL
 *   1. Copy this file to your After Effects ScriptUI Panels folder:
 *        Win : C:\Program Files\Adobe\Adobe After Effects <ver>\Support Files\
 *              Scripts\ScriptUI Panels\
 *        Mac : /Applications/Adobe After Effects <ver>/Scripts/ScriptUI Panels/
 *   2. Enable  Preferences > Scripting & Expressions > "Allow Scripts to Write
 *      Files and Access Network".  (Expressions still work without it, but the
 *      preset library is happier with it on.)
 *   3. Restart AE and open  Window > MotionDesignStudio.jsx  (dockable panel).
 *
 * You can also drop it in the general Scripts folder and run it from
 * File > Scripts > Run Script File... to get a floating window.
 *
 * USAGE
 *   - Select one or more layers in an active comp.
 *   - Pick a section, tweak the numbers, click a button.
 *   - Every action is wrapped in a single undo group, so Ctrl/Cmd+Z reverts it.
 *
 * Tested against AE CS6+ (ExtendScript). No third-party dependencies.
 **********************************************************************************/

(function motionDesignStudio(thisObj) {
    "use strict";

    /* --------------------------------------------------------------------- *
     *  Small helpers
     * --------------------------------------------------------------------- */

    var SCRIPT_NAME = "Motion Design Studio";

    function activeComp() {
        var comp = app.project ? app.project.activeItem : null;
        if (!comp || !(comp instanceof CompItem)) {
            alert("Open a composition first.", SCRIPT_NAME);
            return null;
        }
        return comp;
    }

    function selectedLayers() {
        var comp = activeComp();
        if (!comp) return null;
        var layers = comp.selectedLayers;
        if (!layers || layers.length === 0) {
            alert("Select at least one layer.", SCRIPT_NAME);
            return null;
        }
        return layers;
    }

    // Run a block inside a single undo group; report any error nicely.
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

    // Clamp helper.
    function clamp(v, lo, hi) { return v < lo ? lo : (v > hi ? hi : v); }

    // Parse a float from a text field, falling back to a default.
    function num(field, fallback) {
        var v = parseFloat(field.text);
        return isNaN(v) ? fallback : v;
    }

    // Get a transform property by name across layer types safely.
    function prop(layer, name) {
        try {
            return layer.property("ADBE Transform Group").property(name);
        } catch (e) {
            return null;
        }
    }

    // Current comp time as animation origin (frame-snapped to comp).
    function compTime() {
        var comp = activeComp();
        return comp ? comp.time : 0;
    }

    /* --------------------------------------------------------------------- *
     *  Easing engine  (KeyframeEase)
     * --------------------------------------------------------------------- */

    // Apply temporal ease to a property between the first and last keyframe.
    // influence 0..100, speed usually 0 for classic Easy Ease.
    function applyEase(property, inInfluence, outInfluence) {
        var n = property.numKeys;
        if (n < 1) return;
        for (var i = 1; i <= n; i++) {
            var inEase, outEase;
            var dim = 1;
            // Spatial properties can be multi-dimensional; ease objects need one
            // entry per dimension.
            try { dim = property.value.length || 1; } catch (e) { dim = 1; }

            inEase = [];
            outEase = [];
            for (var d = 0; d < dim; d++) {
                inEase.push(new KeyframeEase(0, clamp(inInfluence, 0.1, 100)));
                outEase.push(new KeyframeEase(0, clamp(outInfluence, 0.1, 100)));
            }
            try {
                property.setInterpolationTypeAtKey(
                    i, KeyframeInterpolationType.BEZIER,
                    KeyframeInterpolationType.BEZIER);
                property.setTemporalEaseAtKey(i, inEase, outEase);
            } catch (e) { /* single-dim props sometimes reject arrays; ignore */ }
        }
    }

    // Set two keyframes on a property at t0 and t0+dur, then ease them.
    function keyTwo(property, t0, dur, v0, v1, inInf, outInf) {
        property.setValueAtTime(t0, v0);
        property.setValueAtTime(t0 + dur, v1);
        applyEase(property, inInf, outInf);
    }

    /* --------------------------------------------------------------------- *
     *  Core motion operations
     * --------------------------------------------------------------------- */

    function opFadeIn(dur, ease) {
        var layers = selectedLayers(); if (!layers) return;
        undoable("Fade In", function () {
            var t = compTime();
            for (var i = 0; i < layers.length; i++) {
                var op = prop(layers[i], "ADBE Opacity");
                if (op) keyTwo(op, t, dur, 0, 100, ease, ease);
            }
        });
    }

    function opFadeOut(dur, ease) {
        var layers = selectedLayers(); if (!layers) return;
        undoable("Fade Out", function () {
            var t = compTime();
            for (var i = 0; i < layers.length; i++) {
                var op = prop(layers[i], "ADBE Opacity");
                if (op) keyTwo(op, t, dur, 100, 0, ease, ease);
            }
        });
    }

    // Slide the layer in from a direction (offset in px) to its current position.
    function opSlideIn(dir, distance, dur, ease) {
        var layers = selectedLayers(); if (!layers) return;
        undoable("Slide In", function () {
            var t = compTime();
            for (var i = 0; i < layers.length; i++) {
                var p = prop(layers[i], "ADBE Position");
                if (!p) continue;
                var end = p.valueAtTime(t, false);
                var start = end.slice(0);
                if (dir === "left")  start[0] -= distance;
                if (dir === "right") start[0] += distance;
                if (dir === "up")    start[1] -= distance;
                if (dir === "down")  start[1] += distance;
                keyTwo(p, t, dur, start, end, ease, ease);
            }
        });
    }

    function opPopScale(overshoot, dur, ease) {
        var layers = selectedLayers(); if (!layers) return;
        undoable("Pop / Scale In", function () {
            var t = compTime();
            for (var i = 0; i < layers.length; i++) {
                var s = prop(layers[i], "ADBE Scale");
                if (!s) continue;
                var end = s.valueAtTime(t, false);
                var zero = [];
                for (var d = 0; d < end.length; d++) zero.push(0);
                if (overshoot > 0) {
                    var over = [];
                    for (var k = 0; k < end.length; k++) over.push(end[k] * (1 + overshoot / 100));
                    s.setValueAtTime(t, zero);
                    s.setValueAtTime(t + dur * 0.7, over);
                    s.setValueAtTime(t + dur, end);
                    applyEase(s, ease, ease);
                } else {
                    keyTwo(s, t, dur, zero, end, ease, ease);
                }
            }
        });
    }

    function opSpin(degrees, dur, ease) {
        var layers = selectedLayers(); if (!layers) return;
        undoable("Spin", function () {
            var t = compTime();
            for (var i = 0; i < layers.length; i++) {
                var r = prop(layers[i], "ADBE Rotate Z") || prop(layers[i], "ADBE Rotation");
                if (!r) continue;
                var start = r.valueAtTime(t, false);
                keyTwo(r, t, dur, start, start + degrees, ease, ease);
            }
        });
    }

    // Generic "animate current transform value from an offset" — kept for
    // custom position/scale/rotation/opacity moves entered in the UI.
    function opCustomMove(dx, dy, dScale, dRot, dOpacity, dur, ease) {
        var layers = selectedLayers(); if (!layers) return;
        undoable("Custom Move", function () {
            var t = compTime();
            for (var i = 0; i < layers.length; i++) {
                var L = layers[i];
                if (dx !== 0 || dy !== 0) {
                    var p = prop(L, "ADBE Position");
                    if (p) {
                        var pe = p.valueAtTime(t, false);
                        var ps = pe.slice(0); ps[0] -= dx; ps[1] -= dy;
                        keyTwo(p, t, dur, ps, pe, ease, ease);
                    }
                }
                if (dScale !== 0) {
                    var s = prop(L, "ADBE Scale");
                    if (s) {
                        var se = s.valueAtTime(t, false);
                        var ss = []; for (var a = 0; a < se.length; a++) ss.push(se[a] - dScale);
                        keyTwo(s, t, dur, ss, se, ease, ease);
                    }
                }
                if (dRot !== 0) {
                    var r = prop(L, "ADBE Rotate Z") || prop(L, "ADBE Rotation");
                    if (r) {
                        var re = r.valueAtTime(t, false);
                        keyTwo(r, t, dur, re - dRot, re, ease, ease);
                    }
                }
                if (dOpacity !== 0) {
                    var o = prop(L, "ADBE Opacity");
                    if (o) {
                        var oe = o.valueAtTime(t, false);
                        keyTwo(o, t, dur, clamp(oe - dOpacity, 0, 100), oe, ease, ease);
                    }
                }
            }
        });
    }

    /* --------------------------------------------------------------------- *
     *  Expression library  (physics & procedural motion)
     * --------------------------------------------------------------------- */

    var EXPR = {
        wiggle: function (freq, amp) {
            return "wiggle(" + freq + ", " + amp + ");";
        },
        // Overshoot / spring settle after the last keyframe.
        overshoot: function (amp, freq, decay) {
            return [
                "amp = " + amp + "; freq = " + freq + "; decay = " + decay + ";",
                "n = 0;",
                "if (numKeys > 0) { n = nearestKey(time).index;",
                "  if (key(n).time > time) n--; }",
                "if (n === 0) { value; } else {",
                "  t = time - key(n).time;",
                "  value + velocityAtTime(key(n).time - thisComp.frameDuration/10)",
                "    * (amp/100) * Math.sin(freq*t*2*Math.PI) / Math.exp(decay*t);",
                "}"
            ].join("\n");
        },
        // Bounce that reacts to the incoming velocity at the last keyframe.
        bounce: function (amp, freq, decay) {
            return [
                "amp = " + amp + "; freq = " + freq + "; decay = " + decay + ";",
                "n = 0;",
                "if (numKeys > 0) { n = nearestKey(time).index;",
                "  if (key(n).time > time) n--; }",
                "if (n === 0) { value; } else {",
                "  t = time - key(n).time;",
                "  v = velocityAtTime(key(n).time - thisComp.frameDuration/10);",
                "  value + v*(amp/100)*Math.abs(Math.sin(freq*t*2*Math.PI))/Math.exp(decay*t);",
                "}"
            ].join("\n");
        },
        // Continuous loop of existing keyframes.
        loopOut: function (type) {
            return "loopOut(type = \"" + type + "\", numKeyframes = 0);";
        },
        loopIn: function (type) {
            return "loopIn(type = \"" + type + "\", numKeyframes = 0);";
        },
        // Inertial "smooth follow" of another expression-driven value.
        inertia: function () {
            return [
                "freq = 3; decay = 5;",
                "n = 0;",
                "if (numKeys > 0) { n = nearestKey(time).index;",
                "  if (key(n).time > time) n--; }",
                "if (n === 0) { value; } else {",
                "  t = time - key(n).time;",
                "  v = velocityAtTime(key(n).time - thisComp.frameDuration/10);",
                "  value + v*(Math.sin(freq*t*2*Math.PI)/Math.exp(decay*t))/(freq*2*Math.PI);",
                "}"
            ].join("\n");
        },
        // Time-based auto-fade at layer head & tail.
        autoFade: function (fade) {
            return [
                "f = " + fade + ";",
                "tIn = inPoint; tOut = outPoint;",
                "a = linear(time, tIn, tIn + f, 0, 100);",
                "b = linear(time, tOut - f, tOut, 100, 0);",
                "Math.min(a, b);"
            ].join("\n");
        },
        // Smooth sine breathing on scale.
        breathe: function (amp, freq) {
            return [
                "amp = " + amp + "; freq = " + freq + ";",
                "s = amp * Math.sin(time*freq*2*Math.PI);",
                "value + [s, s];"
            ].join("\n");
        }
    };

    function setExpr(propName, exprStr, label, alsoOnRotation) {
        var layers = selectedLayers(); if (!layers) return;
        undoable(label, function () {
            for (var i = 0; i < layers.length; i++) {
                var p = prop(layers[i], propName);
                if (!p && alsoOnRotation) p = prop(layers[i], "ADBE Rotation");
                if (p && p.canSetExpression) p.expression = exprStr;
            }
        });
    }

    function clearExprAll() {
        var layers = selectedLayers(); if (!layers) return;
        undoable("Clear Expressions", function () {
            var names = ["ADBE Position", "ADBE Scale", "ADBE Rotate Z",
                         "ADBE Rotation", "ADBE Opacity", "ADBE Anchor Point"];
            for (var i = 0; i < layers.length; i++) {
                for (var j = 0; j < names.length; j++) {
                    var p = prop(layers[i], names[j]);
                    if (p && p.canSetExpression) p.expression = "";
                }
            }
        });
    }

    /* --------------------------------------------------------------------- *
     *  Utilities  (anchor, motion blur, sequencing, retime, easing on keys)
     * --------------------------------------------------------------------- */

    // Move anchor point to the layer's visual center without shifting the layer.
    function anchorToCenter() {
        var layers = selectedLayers(); if (!layers) return;
        undoable("Anchor To Center", function () {
            var t = compTime();
            for (var i = 0; i < layers.length; i++) {
                var L = layers[i];
                var rect;
                try { rect = L.sourceRectAtTime(t, false); } catch (e) { continue; }
                var cx = rect.left + rect.width / 2;
                var cy = rect.top + rect.height / 2;
                var ap = prop(L, "ADBE Anchor Point");
                var pos = prop(L, "ADBE Position");
                if (!ap || !pos) continue;
                var oldAP = ap.value;
                var newAP = [cx, cy];
                if (oldAP.length > 2) newAP.push(oldAP[2]);
                // Compensate position so the layer does not jump.
                var s = prop(L, "ADBE Scale").value;
                var dx = (newAP[0] - oldAP[0]) * (s[0] / 100);
                var dy = (newAP[1] - oldAP[1]) * (s[1] / 100);
                ap.setValue(newAP);
                if (pos.numKeys === 0) {
                    var pv = pos.value;
                    pos.setValue([pv[0] + dx, pv[1] + dy,
                                  pv.length > 2 ? pv[2] : 0].slice(0, pv.length));
                }
            }
        });
    }

    function toggleMotionBlur(on) {
        var layers = selectedLayers(); if (!layers) return;
        undoable("Motion Blur", function () {
            for (var i = 0; i < layers.length; i++) {
                try { layers[i].motionBlur = on; } catch (e) {}
            }
            var comp = activeComp();
            if (comp && on) { try { comp.motionBlur = true; } catch (e) {} }
        });
    }

    // Sequence selected layers in time with an offset (classic stagger).
    function sequenceLayers(offsetSeconds, overlap) {
        var layers = selectedLayers(); if (!layers) return;
        undoable("Sequence Layers", function () {
            // Preserve selection order top-to-bottom.
            var start = layers[0].startTime;
            for (var i = 0; i < layers.length; i++) {
                var t = start + i * offsetSeconds;
                var dur = layers[i].outPoint - layers[i].inPoint;
                layers[i].startTime = t;
                if (overlap) {
                    // let them overlap; do not trim
                }
            }
        });
    }

    // Stagger existing keyframes across layers so animations cascade.
    function staggerKeys(offsetSeconds) {
        var layers = selectedLayers(); if (!layers) return;
        undoable("Stagger Keyframes", function () {
            var names = ["ADBE Position", "ADBE Scale", "ADBE Rotate Z",
                         "ADBE Rotation", "ADBE Opacity"];
            for (var i = 0; i < layers.length; i++) {
                var shift = i * offsetSeconds;
                if (shift === 0) continue;
                for (var j = 0; j < names.length; j++) {
                    var p = prop(layers[i], names[j]);
                    if (!p || p.numKeys === 0) continue;
                    // Move keys from last to first to avoid collisions.
                    for (var k = p.numKeys; k >= 1; k--) {
                        p.setKeyTime(k, p.keyTime(k) + shift);
                    }
                }
            }
        });
    }

    // Speed ramp: ease first & last keys of every animated transform prop.
    function easeAllKeys(inInf, outInf) {
        var layers = selectedLayers(); if (!layers) return;
        undoable("Ease All Keyframes", function () {
            var names = ["ADBE Position", "ADBE Scale", "ADBE Rotate Z",
                         "ADBE Rotation", "ADBE Opacity", "ADBE Anchor Point"];
            for (var i = 0; i < layers.length; i++) {
                for (var j = 0; j < names.length; j++) {
                    var p = prop(layers[i], names[j]);
                    if (p && p.numKeys > 0) applyEase(p, inInf, outInf);
                }
            }
        });
    }

    // Time-remap based simple speed change on a footage/precomp layer.
    function timeStretch(pct) {
        var layers = selectedLayers(); if (!layers) return;
        undoable("Time Stretch", function () {
            for (var i = 0; i < layers.length; i++) {
                try { layers[i].stretch = pct; } catch (e) {}
            }
        });
    }

    function reverseKeys() {
        var layers = selectedLayers(); if (!layers) return;
        undoable("Reverse Keyframes", function () {
            var names = ["ADBE Position", "ADBE Scale", "ADBE Rotate Z",
                         "ADBE Rotation", "ADBE Opacity", "ADBE Anchor Point"];
            for (var i = 0; i < layers.length; i++) {
                for (var j = 0; j < names.length; j++) {
                    var p = prop(layers[i], names[j]);
                    if (!p || p.numKeys < 2) continue;
                    var t0 = p.keyTime(1), t1 = p.keyTime(p.numKeys);
                    var vals = [], times = [];
                    for (var k = 1; k <= p.numKeys; k++) {
                        vals.push(p.keyValue(k));
                        times.push(p.keyTime(k));
                    }
                    for (var k2 = p.numKeys; k2 >= 1; k2--) p.removeKey(k2);
                    for (var m = 0; m < vals.length; m++) {
                        var nt = t1 - (times[m] - t0);
                        p.setValueAtTime(nt, vals[vals.length - 1 - m]);
                    }
                }
            }
        });
    }

    /* --------------------------------------------------------------------- *
     *  UI
     * --------------------------------------------------------------------- */

    function buildUI(thisObj) {
        var win = (thisObj instanceof Panel)
            ? thisObj
            : new Window("palette", SCRIPT_NAME, undefined, {resizeable: true});
        win.orientation = "column";
        win.alignChildren = ["fill", "top"];
        win.spacing = 6;
        win.margins = 10;

        // --- Global timing controls -------------------------------------
        var g = win.add("panel", undefined, "Timing");
        g.orientation = "row";
        g.alignChildren = ["left", "center"];
        g.margins = 10;
        g.add("statictext", undefined, "Duration (s):");
        var durField = g.add("edittext", undefined, "0.5");
        durField.characters = 5;
        g.add("statictext", undefined, "Ease:");
        var easeField = g.add("edittext", undefined, "75");
        easeField.characters = 4;
        g.add("statictext", undefined, "%");

        function DUR() { return clamp(num(durField, 0.5), 0.01, 60); }
        function EASE() { return clamp(num(easeField, 75), 0, 100); }

        // --- Animation presets ------------------------------------------
        var a = win.add("panel", undefined, "Animate In / Out");
        a.orientation = "column";
        a.alignChildren = ["fill", "top"];
        a.margins = 10; a.spacing = 4;

        var r1 = a.add("group"); r1.orientation = "row"; r1.alignChildren = ["fill", "center"];
        r1.add("button", undefined, "Fade In").onClick = function () { opFadeIn(DUR(), EASE()); };
        r1.add("button", undefined, "Fade Out").onClick = function () { opFadeOut(DUR(), EASE()); };
        r1.add("button", undefined, "Pop / Scale In").onClick = function () { opPopScale(20, DUR(), EASE()); };

        var r2 = a.add("group"); r2.orientation = "row"; r2.alignChildren = ["fill", "center"];
        r2.add("statictext", undefined, "Slide dist (px):");
        var slideDist = r2.add("edittext", undefined, "300"); slideDist.characters = 5;

        var r3 = a.add("group"); r3.orientation = "row"; r3.alignChildren = ["fill", "center"];
        r3.add("button", undefined, "◀ In").onClick = function () { opSlideIn("left",  num(slideDist,300), DUR(), EASE()); };
        r3.add("button", undefined, "In ▶").onClick = function () { opSlideIn("right", num(slideDist,300), DUR(), EASE()); };
        r3.add("button", undefined, "▲ In").onClick = function () { opSlideIn("up",    num(slideDist,300), DUR(), EASE()); };
        r3.add("button", undefined, "In ▼").onClick = function () { opSlideIn("down",  num(slideDist,300), DUR(), EASE()); };

        var r4 = a.add("group"); r4.orientation = "row"; r4.alignChildren = ["fill", "center"];
        r4.add("statictext", undefined, "Spin (°):");
        var spinDeg = r4.add("edittext", undefined, "360"); spinDeg.characters = 5;
        r4.add("button", undefined, "Spin").onClick = function () { opSpin(num(spinDeg,360), DUR(), EASE()); };

        // --- Custom transform move --------------------------------------
        var c = win.add("panel", undefined, "Custom Move (animate from offset)");
        c.orientation = "column"; c.alignChildren = ["fill", "top"];
        c.margins = 10; c.spacing = 4;
        var cr1 = c.add("group"); cr1.orientation = "row";
        cr1.add("statictext", undefined, "ΔX"); var cx = cr1.add("edittext", undefined, "0"); cx.characters = 4;
        cr1.add("statictext", undefined, "ΔY"); var cy = cr1.add("edittext", undefined, "0"); cy.characters = 4;
        cr1.add("statictext", undefined, "ΔScale"); var cs = cr1.add("edittext", undefined, "0"); cs.characters = 4;
        var cr2 = c.add("group"); cr2.orientation = "row";
        cr2.add("statictext", undefined, "ΔRot°"); var crot = cr2.add("edittext", undefined, "0"); crot.characters = 4;
        cr2.add("statictext", undefined, "ΔOpacity"); var cop = cr2.add("edittext", undefined, "0"); cop.characters = 4;
        c.add("button", undefined, "Apply Custom Move").onClick = function () {
            opCustomMove(num(cx,0), num(cy,0), num(cs,0), num(crot,0), num(cop,0), DUR(), EASE());
        };

        // --- Physics / procedural expressions ---------------------------
        var e = win.add("panel", undefined, "Physics & Procedural");
        e.orientation = "column"; e.alignChildren = ["fill", "top"];
        e.margins = 10; e.spacing = 4;

        var er1 = e.add("group"); er1.orientation = "row";
        er1.add("statictext", undefined, "Amp"); var pAmp = er1.add("edittext", undefined, "80"); pAmp.characters = 4;
        er1.add("statictext", undefined, "Freq"); var pFreq = er1.add("edittext", undefined, "2.5"); pFreq.characters = 4;
        er1.add("statictext", undefined, "Decay"); var pDecay = er1.add("edittext", undefined, "4"); pDecay.characters = 4;

        var er2 = e.add("group"); er2.orientation = "row"; er2.alignChildren = ["fill","center"];
        er2.add("button", undefined, "Overshoot ▸ Position").onClick = function () {
            setExpr("ADBE Position", EXPR.overshoot(num(pAmp,80), num(pFreq,2.5), num(pDecay,4)), "Overshoot Position");
        };
        er2.add("button", undefined, "Overshoot ▸ Scale").onClick = function () {
            setExpr("ADBE Scale", EXPR.overshoot(num(pAmp,80), num(pFreq,2.5), num(pDecay,4)), "Overshoot Scale");
        };

        var er3 = e.add("group"); er3.orientation = "row"; er3.alignChildren = ["fill","center"];
        er3.add("button", undefined, "Bounce ▸ Position").onClick = function () {
            setExpr("ADBE Position", EXPR.bounce(num(pAmp,80), num(pFreq,2.5), num(pDecay,4)), "Bounce Position");
        };
        er3.add("button", undefined, "Inertia ▸ Position").onClick = function () {
            setExpr("ADBE Position", EXPR.inertia(), "Inertia Position");
        };

        var er4 = e.add("group"); er4.orientation = "row"; er4.alignChildren = ["fill","center"];
        er4.add("button", undefined, "Wiggle ▸ Position").onClick = function () {
            setExpr("ADBE Position", EXPR.wiggle(num(pFreq,2.5), num(pAmp,80)), "Wiggle Position");
        };
        er4.add("button", undefined, "Breathe ▸ Scale").onClick = function () {
            setExpr("ADBE Scale", EXPR.breathe(num(pAmp,80)/10, num(pFreq,2.5)/2), "Breathe Scale");
        };

        var er5 = e.add("group"); er5.orientation = "row"; er5.alignChildren = ["fill","center"];
        er5.add("button", undefined, "Loop Cycle").onClick = function () {
            setExpr("ADBE Position", EXPR.loopOut("cycle"), "Loop Cycle");
        };
        er5.add("button", undefined, "Loop Ping-Pong").onClick = function () {
            setExpr("ADBE Position", EXPR.loopOut("pingpong"), "Loop Ping-Pong");
        };
        er5.add("button", undefined, "Auto-Fade").onClick = function () {
            setExpr("ADBE Opacity", EXPR.autoFade(DUR()), "Auto-Fade");
        };

        e.add("button", undefined, "Clear All Expressions").onClick = clearExprAll;

        // --- Utilities ---------------------------------------------------
        var u = win.add("panel", undefined, "Utilities");
        u.orientation = "column"; u.alignChildren = ["fill", "top"];
        u.margins = 10; u.spacing = 4;

        var ur1 = u.add("group"); ur1.orientation = "row"; ur1.alignChildren = ["fill","center"];
        ur1.add("button", undefined, "Anchor → Center").onClick = anchorToCenter;
        ur1.add("button", undefined, "Ease All Keys").onClick = function () { easeAllKeys(EASE(), EASE()); };
        ur1.add("button", undefined, "Reverse Keys").onClick = reverseKeys;

        var ur2 = u.add("group"); ur2.orientation = "row"; ur2.alignChildren = ["fill","center"];
        ur2.add("button", undefined, "Motion Blur On").onClick = function () { toggleMotionBlur(true); };
        ur2.add("button", undefined, "Motion Blur Off").onClick = function () { toggleMotionBlur(false); };

        var ur3 = u.add("group"); ur3.orientation = "row"; ur3.alignChildren = ["fill","center"];
        ur3.add("statictext", undefined, "Offset (s):");
        var offField = ur3.add("edittext", undefined, "0.1"); offField.characters = 4;
        ur3.add("button", undefined, "Sequence Layers").onClick = function () { sequenceLayers(num(offField,0.1), false); };
        ur3.add("button", undefined, "Stagger Keys").onClick = function () { staggerKeys(num(offField,0.1)); };

        var ur4 = u.add("group"); ur4.orientation = "row"; ur4.alignChildren = ["fill","center"];
        ur4.add("statictext", undefined, "Time stretch %:");
        var stretchField = ur4.add("edittext", undefined, "100"); stretchField.characters = 5;
        ur4.add("button", undefined, "Apply Stretch").onClick = function () { timeStretch(num(stretchField,100)); };

        // --- Footer ------------------------------------------------------
        var foot = win.add("statictext", undefined,
            "Select layers, then click. Everything is one undo step.");
        foot.graphics.font = ScriptUI.newFont("dialog", "ITALIC", 10);

        win.layout.layout(true);
        if (win instanceof Window) {
            win.center();
            win.show();
        }
        return win;
    }

    buildUI(thisObj);

})(this);
