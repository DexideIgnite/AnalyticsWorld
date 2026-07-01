/**********************************************************************************
 * Motion Builder Pro  (Everyday Motion Builder Pro)
 * ------------------------------------------------------------------------------
 * A universal motion-design assistant + preset pack for Adobe After Effects.
 * Real ExtendScript / ScriptUI panel. No HTML, no React, no Node.
 *
 * Build any beat-synced promo from comp markers: YouTube/TikTok intros, app &
 * product promos, creator content, gaming edits, music/lyric videos, social ads,
 * brand launches, portfolio reels — plus a huge preset library, a Comp Marker
 * Bin, a Text Queue, Project Asset slots, a screenshot/app-window builder, a
 * 30-second Promo Builder, a Preset Preview, a QA check, and a recipe exporter.
 *
 * Project Style Profiles (incl. an optional DXED brand profile) drive colors,
 * default text, and motion feel. Nothing is locked to one brand.
 *
 * INSTALL
 *   Copy to the After Effects "ScriptUI Panels" folder:
 *     Win : C:\Program Files\Adobe\Adobe After Effects <ver>\Support Files\
 *           Scripts\ScriptUI Panels\
 *     Mac : /Applications/Adobe After Effects <ver>/Scripts/ScriptUI Panels/
 *   Enable Preferences > Scripting & Expressions >
 *     "Allow Scripts to Write Files and Access Network".  Restart AE and open
 *   Window > MotionBuilderPro.jsx.  (Or File > Scripts > Run Script File...)
 *
 * Every action runs in one undo group (Ctrl/Cmd+Z reverts it).
 * Tested against After Effects CS6+ ExtendScript. No third-party dependencies.
 **********************************************************************************/

(function MotionBuilderPro(thisObj) {
    "use strict";

    var SCRIPT_NAME = "Motion Builder Pro";
    var VERSION = "3.0";

    /* ===================================================================== *
     *  1. COLOR + BRAND  (editable; driven by Project Style Profile)
     * ===================================================================== */

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

    // Editable brand config. Hex strings are the source of truth; rgb arrays derived.
    var BRAND = {
        name: "Your Brand", cta: "yourwebsite.com", fontStyle: "Bold",
        primaryHex: "#6C5CE7", secondaryHex: "#3B82F6", bgHex: "#0B0B14",
        cardHex: "#15151F", textHex: "#FFFFFF", accentHex: "#3B82F6",
        glowHex: "#A78BFA", flashHex: "#FFFFFF",
        primary: null, secondary: null, bg: null, card: null, text: null, accent: null, glow: null, flash: null
    };
    function refreshBrandRGB() {
        BRAND.primary = hexToRGB(BRAND.primaryHex); BRAND.secondary = hexToRGB(BRAND.secondaryHex);
        BRAND.bg = hexToRGB(BRAND.bgHex); BRAND.card = hexToRGB(BRAND.cardHex);
        BRAND.text = hexToRGB(BRAND.textHex); BRAND.accent = hexToRGB(BRAND.accentHex);
        BRAND.glow = hexToRGB(BRAND.glowHex); BRAND.flash = hexToRGB(BRAND.flashHex);
    }

    // Project Style Profiles. DXED is just one option.
    var PROFILES = {
        "Universal Motion Design": { name: "Your Brand", cta: "yourwebsite.com", primary: "#6C5CE7", secondary: "#3B82F6", bg: "#0B0B14", card: "#15151F", accent: "#3B82F6", glow: "#A78BFA", flash: "#FFFFFF", pack: "Universal Text Pack", promo: "Brand Launch", density: "Full" },
        "Clean Tech":             { name: "Your Brand", cta: "yourwebsite.com", primary: "#4F8CFF", secondary: "#22D3EE", bg: "#0A0F1A", card: "#121826", accent: "#22D3EE", glow: "#7DD3FC", flash: "#FFFFFF", pack: "App Promo Text Pack", promo: "App Promo", density: "Full" },
        "Dark Tech":              { name: "Your Brand", cta: "yourwebsite.com", primary: "#8B5CF6", secondary: "#3B82F6", bg: "#060610", card: "#12121F", accent: "#3B82F6", glow: "#A78BFA", flash: "#8B5CF6", pack: "Minimal Tech Text Pack", promo: "Product Promo", density: "Full" },
        "App Promo":              { name: "Your App", cta: "getyourapp.com", primary: "#5B8DEF", secondary: "#34D399", bg: "#0B1020", card: "#141B2E", accent: "#34D399", glow: "#93C5FD", flash: "#FFFFFF", pack: "App Promo Text Pack", promo: "App Promo", density: "Full" },
        "Creator Promo":          { name: "Your Name", cta: "yourlink.com", primary: "#F472B6", secondary: "#8B5CF6", bg: "#0C0A14", card: "#1A1424", accent: "#8B5CF6", glow: "#F0ABFC", flash: "#FFFFFF", pack: "Creator Promo Text Pack", promo: "Creator Promo", density: "Full" },
        "Gaming Edit":            { name: "Your Team", cta: "yourclan.gg", primary: "#22C55E", secondary: "#EF4444", bg: "#07090C", card: "#10151C", accent: "#EF4444", glow: "#86EFAC", flash: "#FFFFFF", pack: "Gaming Edit Text Pack", promo: "Gaming Edit", density: "Insane" },
        "Music Video":            { name: "Artist", cta: "listen.now", primary: "#F59E0B", secondary: "#EC4899", bg: "#0A0710", card: "#171021", accent: "#EC4899", glow: "#FDE68A", flash: "#FFFFFF", pack: "Music Video Text Pack", promo: "Music Video Visualizer", density: "Insane" },
        "Lyric Video":            { name: "Artist", cta: "stream.now", primary: "#38BDF8", secondary: "#A78BFA", bg: "#080B12", card: "#121826", accent: "#A78BFA", glow: "#BAE6FD", flash: "#FFFFFF", pack: "Lyric Text Pack", promo: "Lyric Video", density: "Normal" },
        "Product Commercial":     { name: "Your Product", cta: "shopnow.com", primary: "#0EA5E9", secondary: "#F59E0B", bg: "#0A0E14", card: "#131A24", accent: "#F59E0B", glow: "#7DD3FC", flash: "#FFFFFF", pack: "Product Promo Text Pack", promo: "Product Promo", density: "Full" },
        "Social Media Ad":        { name: "Your Brand", cta: "tap.link", primary: "#F43F5E", secondary: "#8B5CF6", bg: "#0B0910", card: "#181022", accent: "#8B5CF6", glow: "#FDA4AF", flash: "#FFFFFF", pack: "Social Media Ad Text Pack", promo: "Social Media Ad", density: "Insane" },
        "Crypto / Web3 Project":  { name: "Your Project", cta: "yourproject.io", primary: "#8B5CF6", secondary: "#22D3EE", bg: "#05060E", card: "#101422", accent: "#22D3EE", glow: "#A78BFA", flash: "#8B5CF6", pack: "Crypto / Web3 Text Pack", promo: "Crypto / Web3 Promo", density: "Full" },
        "Minimal Apple Style":    { name: "Your Brand", cta: "yourwebsite.com", primary: "#111111", secondary: "#888888", bg: "#0E0E10", card: "#1A1A1D", accent: "#FFFFFF", glow: "#FFFFFF", flash: "#FFFFFF", pack: "Minimal Tech Text Pack", promo: "Product Promo", density: "Minimal" },
        "Neon Hype Edit":         { name: "Your Brand", cta: "yourlink.com", primary: "#D946EF", secondary: "#22D3EE", bg: "#070510", card: "#150E24", accent: "#22D3EE", glow: "#F0ABFC", flash: "#FFFFFF", pack: "Social Media Ad Text Pack", promo: "Social Media Ad", density: "Insane" },
        "DXED Brand Profile":     { name: "DXED", cta: "DXED.app", primary: "#8B5CF6", secondary: "#3B82F6", bg: "#060610", card: "#0A0A1A", accent: "#3B82F6", glow: "#A78BFA", flash: "#8B5CF6", pack: "DXED Text Pack", promo: "Creator Promo", density: "Full" }
    };
    var PROFILE_ORDER = ["Universal Motion Design", "Clean Tech", "Dark Tech", "App Promo", "Creator Promo",
        "Gaming Edit", "Music Video", "Lyric Video", "Product Commercial", "Social Media Ad",
        "Crypto / Web3 Project", "Minimal Apple Style", "Neon Hype Edit", "DXED Brand Profile"];

    function applyProfile(pname) {
        var p = PROFILES[pname] || PROFILES["Universal Motion Design"];
        BRAND.name = p.name; BRAND.cta = p.cta; BRAND.primaryHex = p.primary; BRAND.secondaryHex = p.secondary;
        BRAND.bgHex = p.bg; BRAND.cardHex = p.card; BRAND.accentHex = p.accent; BRAND.glowHex = p.glow; BRAND.flashHex = p.flash;
        STATE.textPack = p.pack; STATE.promoType = p.promo; STATE.density = p.density;
        refreshBrandRGB();
    }

    // Substitute brand tokens in any promo text string.
    function T(str) { return ("" + str).replace(/\[Brand Name\]/g, BRAND.name).replace(/\[CTA\]/g, BRAND.cta); }

    /* ===================================================================== *
     *  2. TEXT PACKS  (7 scenes each; [Brand Name] / [CTA] tokens)
     * ===================================================================== */

    var TEXT_PACKS = {
        "Universal Text Pack": [["[Brand Name]", "A new way to create."], ["Create faster.", "Make it stand out.", "Built for motion."],
            ["Show the experience.", "Highlight the details.", "Make every frame premium."], ["Clean visuals.", "Smooth transitions.", "Beat-synced motion."],
            ["Made for creators.", "Built for your audience.", "Ready for every platform."], ["More to explore.", "Powerful and simple."], ["Start today.", "[CTA]"]],
        "App Promo Text Pack": [["Introducing [Brand Name]", "Built for speed."], ["Designed to feel simple.", "Everything in one place."],
            ["Show the experience.", "Every detail matters."], ["Fast. Clean. Simple.", "Made for you."], ["Loved by users.", "Ready everywhere."],
            ["More features inside.", "Built to scale."], ["Try it now.", "[CTA]"]],
        "Product Promo Text Pack": [["[Brand Name]", "Built to stand out."], ["Clean design.", "Premium details."], ["See every detail.", "Crafted with care."],
            ["Made for everyday use.", "Simple by design."], ["Trusted by many.", "Loved worldwide."], ["More to discover.", "Built to last."], ["Shop now.", "[CTA]"]],
        "Creator Promo Text Pack": [["[Brand Name]", "Create more."], ["Post faster.", "Build your audience."], ["Show your work.", "Get seen."],
            ["Clean visuals.", "Smooth motion."], ["Made for creators.", "Built for your fans."], ["Grow every day.", "Own your content."], ["Start today.", "[CTA]"]],
        "Gaming Edit Text Pack": [["[Brand Name]", "Lock in."], ["Hit the drop.", "No missed frames."], ["Clutch moments.", "Every play counts."],
            ["Fast cuts.", "Hard hits."], ["Squad up.", "Own the lobby."], ["Victory starts here.", "Run it back."], ["Watch now.", "[CTA]"]],
        "Music Video Text Pack": [["[Brand Name]", ""], ["Feel the beat.", ""], ["Turn it up.", ""], ["Every drop hits.", ""],
            ["Move with it.", ""], ["One more time.", ""], ["Out now.", "[CTA]"]],
        "Lyric Text Pack": [["[Brand Name]", ""], ["Sing it back.", ""], ["Every word.", ""], ["Line by line.", ""],
            ["Feel it.", ""], ["One more time.", ""], ["Stream now.", "[CTA]"]],
        "Social Media Ad Text Pack": [["[Brand Name]", "Stop scrolling."], ["This changes everything.", "Watch this."], ["See it in action.", "Real results."],
            ["Simple. Fast. Clean.", "Made for you."], ["Loved by thousands.", "Join them."], ["Limited time.", "Don't miss out."], ["Tap now.", "[CTA]"]],
        "Crypto / Web3 Text Pack": [["[Brand Name]", "The future is here."], ["Decentralized.", "Secure by design."], ["See the platform.", "Built on-chain."],
            ["Fast. Trustless. Open.", "Community first."], ["Join the movement.", "Own your assets."], ["Powered by the community.", "Built to scale."], ["Join now.", "[CTA]"]],
        "Minimal Tech Text Pack": [["[Brand Name]", ""], ["Less, but better.", ""], ["Designed with care.", ""], ["Every detail.", ""],
            ["Simple by design.", ""], ["Refined.", ""], ["Learn more.", "[CTA]"]],
        "DXED Text Pack": [["DXED", "A new place to build."], ["This is DXED.", "Post. Build. Connect."], ["Your profile.", "Your content.", "Your world."],
            ["Built for creators.", "Show your work.", "Get seen."], ["Find your community.", "Build around what you love."],
            ["Projects can build here too.", "Communities. Content. Updates."], ["Join DXED.", "DXED.app"]],
        "Custom Text Pack": [["[Brand Name]", "Your tagline here."], ["Your message.", "Your value."], ["Your feature.", "Your detail."],
            ["Your benefit.", "Your promise."], ["Your audience.", "Your community."], ["Your extra feature.", "Your proof."], ["Your call to action.", "[CTA]"]]
    };
    var TEXT_PACK_ORDER = ["Universal Text Pack", "App Promo Text Pack", "Product Promo Text Pack", "Creator Promo Text Pack",
        "Gaming Edit Text Pack", "Music Video Text Pack", "Lyric Text Pack", "Social Media Ad Text Pack",
        "Crypto / Web3 Text Pack", "Minimal Tech Text Pack", "DXED Text Pack", "Custom Text Pack"];

    var PROMO_TYPES = ["App Promo", "Product Promo", "Creator Promo", "Gaming Edit", "Music Video Visualizer",
        "Lyric Video", "Social Media Ad", "Crypto / Web3 Promo", "Brand Launch", "Portfolio Reel", "Custom"];

    /* ===================================================================== *
     *  3. GLOBAL STATE
     * ===================================================================== */

    var STATE = {
        profile: "Universal Motion Design", projectName: "Motion Promo",
        promoType: "Brand Launch", density: "Full", textPack: "Universal Text Pack",
        beatSyncMode: "Generate Default Markers", sceneMode: "Fixed 7 Scenes",
        style: "Clean Premium", energy: "Medium"
    };
    // Project asset slots: each { source: FootageItem|CompItem|null, name: string, text: string|null }.
    var ASSETS = {
        logo: null, shot1: null, shot2: null, shot3: null, product: null,
        background: null, extra: null, video: null, character: null, outro: null
    };
    var QUEUE = [];        // [{ text, scene, preset }]
    var MARKERBIN = [];    // [{ index, time, comment, role, scene, action }]

    var ROLE_LIST = ["Beat", "Text Pop", "Flash", "Strong Hit", "Camera Bump", "Window Hit", "Scene Change", "Drop", "Outro Hit", "Custom"];
    var ROLE_ACTION_OPTIONS = {
        "Beat": ["Small Pop", "Glow Pulse", "Shape Pulse", "Micro Flash"],
        "Text Pop": ["Text Bounce In", "Text Slide Up", "Text Slam", "Word Pop"],
        "Flash": ["Beat Flash", "Purple Flash", "White Flash", "Micro Flash"],
        "Strong Hit": ["Flash + Camera Bump", "Zoom Flash", "Glow Burst", "Bass Shake"],
        "Camera Bump": ["Camera Bump", "Zoom Flash", "Bass Shake", "Beat Flash"],
        "Window Hit": ["Window Zoom", "Glow Border Pulse", "Cursor Click", "Callout Pop"],
        "Scene Change": ["Flash Cut", "Blur Wipe", "Window Push", "Smooth Apple Fade"],
        "Drop": ["Major Flash + Camera Push", "Zoom Flash", "Glow Burst"],
        "Outro Hit": ["Final Glow", "Glow Ring", "Fade To Black"],
        "Custom": ["Small Pop", "Beat Flash", "Camera Bump", "Glow Pulse"]
    };
    var ROLE_ACTIONS = {};   // role -> chosen action (defaults set below)
    (function () { for (var r = 0; r < ROLE_LIST.length; r++) ROLE_ACTIONS[ROLE_LIST[r]] = ROLE_ACTION_OPTIONS[ROLE_LIST[r]][0]; })();

    var DENSITY = {
        "Minimal": { texts: 2, cards: 2, flash: false, micro: 0 },
        "Normal":  { texts: 3, cards: 3, flash: true, micro: 1 },
        "Full":    { texts: 4, cards: 5, flash: true, micro: 2 },
        "Insane":  { texts: 5, cards: 8, flash: true, micro: 4 }
    };
    function densityObj() { return DENSITY[STATE.density] || DENSITY["Full"]; }

    /* ===================================================================== *
     *  4. STYLE / ENERGY + LIVE CONFIG
     * ===================================================================== */

    var STYLE_PRESETS = {
        "Clean Premium":     { easing: "Smooth",     glow: 1, blur: 1, flash: 1 },
        "Fast Hype":         { easing: "Fast Cut",   glow: 2, blur: 0, flash: 3 },
        "Dark Tech":         { easing: "Snappy",     glow: 2, blur: 1, flash: 2 },
        "Creator Energy":    { easing: "Soft Bounce",glow: 2, blur: 1, flash: 2 },
        "Apple-Level Clean": { easing: "Cinematic",  glow: 0, blur: 1, flash: 0 },
        "Crypto Project":    { easing: "Overshoot",  glow: 3, blur: 1, flash: 2 }
    };
    var ENERGY_DUR = { "Clean": 0.6, "Medium": 0.45, "Hype": 0.3, "Insane": 0.15 };
    var ENERGY_MUL = { "Clean": { flash: 0.5, bounce: 0.5 }, "Medium": { flash: 1, bounce: 1 }, "Hype": { flash: 1.6, bounce: 1.6 }, "Insane": { flash: 2.4, bounce: 2.2 } };

    var CFG = {
        style: "Clean Premium", energy: "Medium", duration: 0.6, delay: 0.08, distance: 300,
        bounce: 1, glow: 1, blur: 1, flash: 1, scale: 100, rotation: 15,
        markerOffset: 0, randomVar: 20, seed: 12345, applyTo: "each"
    };
    function styleObj() { return STYLE_PRESETS[CFG.style] || STYLE_PRESETS["Clean Premium"]; }
    function styleEasing() { return styleObj().easing; }
    function styleColor() { return BRAND.primary; }
    function flashColor() { return BRAND.flash; }

    /* ===================================================================== *
     *  5. HELPERS  (guards, undo, math, seeded rng)
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
        try { fn(); } catch (e) { alert(label + " failed:\n" + e.toString() + (e.line ? "\n(line " + e.line + ")" : ""), SCRIPT_NAME); }
        finally { app.endUndoGroup(); }
    }
    function clamp(v, lo, hi) { return v < lo ? lo : (v > hi ? hi : v); }
    function pf(field, d) { var v = parseFloat(field.text); return isNaN(v) ? d : v; }
    function mergeS(base, extra) { var o = {}; for (var k in base) if (base.hasOwnProperty(k)) o[k] = base[k]; for (var k2 in extra) if (extra.hasOwnProperty(k2)) o[k2] = extra[k2]; return o; }

    var _rng = 12345;
    function seed(s) { _rng = (s % 2147483647); if (_rng <= 0) _rng += 2147483646; }
    function rnd() { _rng = (_rng * 16807) % 2147483647; return (_rng - 1) / 2147483646; }
    function rr(a, b) { return a + (b - a) * rnd(); }
    function pick(arr) { return arr[Math.floor(rnd() * arr.length)]; }

    function transformProps(layer) {
        var tg = layer.property("ADBE Transform Group");
        return { pos: tg.property("ADBE Position"), scale: tg.property("ADBE Scale"),
                 rot: tg.property("ADBE Rotate Z"), opac: tg.property("ADBE Opacity"), anchor: tg.property("ADBE Anchor Point") };
    }
    function centerLayer(layer, comp) {
        try { var r = layer.sourceRectAtTime(comp.time, false); var tp = transformProps(layer);
            tp.anchor.setValue([r.left + r.width / 2, r.top + r.height / 2]); tp.pos.setValue([comp.width / 2, comp.height / 2]); } catch (e) {}
    }
    function overshootV(fromV, restV, f) {
        if (restV.length === undefined) return restV + (restV - fromV) * f;
        var o = []; for (var i = 0; i < restV.length; i++) o.push(restV[i] + (restV[i] - fromV[i]) * f); return o;
    }

    /* ===================================================================== *
     *  6. KEYFRAME + EASING ENGINE
     * ===================================================================== */

    var EASE_MAP = {
        "Smooth": { inf: [75, 75] }, "Snappy": { inf: [85, 20] }, "Overshoot": { inf: [80, 60] },
        "Elastic": { inf: [85, 70] }, "Soft Bounce": { inf: [70, 55] }, "Hard Impact": { inf: [100, 12] },
        "Cinematic": { inf: [90, 90] }, "Fast Cut": { inf: [35, 35] }
    };
    function easeInfo(style) { return EASE_MAP[style] || EASE_MAP["Smooth"]; }
    function easeProperty(property, inInf, outInf) {
        var n = property.numKeys; if (n < 1) return;
        var dim = 1; try { dim = property.value.length || 1; } catch (e) { dim = 1; }
        for (var i = 1; i <= n; i++) {
            var inE = [], outE = [];
            for (var d = 0; d < dim; d++) { inE.push(new KeyframeEase(0, clamp(inInf, 0.1, 100))); outE.push(new KeyframeEase(0, clamp(outInf, 0.1, 100))); }
            try { property.setInterpolationTypeAtKey(i, KeyframeInterpolationType.BEZIER, KeyframeInterpolationType.BEZIER); property.setTemporalEaseAtKey(i, inE, outE); } catch (e) {}
        }
    }
    function anim2(property, t0, dur, fromV, toV, style) {
        property.setValueAtTime(t0, fromV); property.setValueAtTime(t0 + dur, toV);
        var e = easeInfo(style); easeProperty(property, e.inf[0], e.inf[1]);
    }
    // Bounce with a variable number of settle wobbles (elastic uses up to 5).
    function bounceKeys(property, t0, dur, fromV, restV, wobbles, over) {
        property.setValueAtTime(t0, fromV);
        property.setValueAtTime(t0 + dur * 0.58, overshootV(fromV, restV, over));
        if (wobbles >= 2) property.setValueAtTime(t0 + dur * 0.72, overshootV(fromV, restV, -over * 0.45));
        if (wobbles >= 3) property.setValueAtTime(t0 + dur * 0.83, overshootV(fromV, restV, over * 0.24));
        if (wobbles >= 4) property.setValueAtTime(t0 + dur * 0.92, overshootV(fromV, restV, -over * 0.12));
        if (wobbles >= 5) property.setValueAtTime(t0 + dur * 0.97, overshootV(fromV, restV, over * 0.06));
        property.setValueAtTime(t0 + dur, restV);
        easeProperty(property, 78, 70);
    }

    /* ===================================================================== *
     *  7. EFFECT HELPERS
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
        var b; try { b = fxParade(layer).addProperty("ADBE Gaussian Blur 2"); } catch (e) { try { b = fxParade(layer).addProperty("ADBE Fast Blur"); } catch (e2) { return null; } }
        trySet(b, "Blurriness", amount); try { b.property("Repeat Edge Pixels").setValue(true); } catch (e3) {} return b;
    }
    function addDirectionalBlur(layer, amount, dirDeg) {
        var b; try { b = fxParade(layer).addProperty("ADBE Motion Blur"); } catch (e) { return addBlur(layer, amount); }
        trySet(b, "Direction", dirDeg || 90); trySet(b, "Blur Length", amount); return b;
    }
    function addShadow(layer, soft, opac, dist) {
        var d; try { d = fxParade(layer).addProperty("ADBE Drop Shadow"); } catch (e) { return null; }
        trySet(d, "Opacity", opac === undefined ? 150 : opac); trySet(d, "Softness", soft === undefined ? 60 : soft); trySet(d, "Distance", dist === undefined ? 14 : dist); return d;
    }
    function addTransformFX(layer) { try { return fxParade(layer).addProperty("ADBE Geometry2"); } catch (e) { return null; } }

    refreshBrandRGB();

    /* ===================================================================== *
     *  8. LAYER FACTORIES  (universal names)
     * ===================================================================== */

    function addSolid(comp, color, name, w, h) { return comp.layers.addSolid(color, name || "Solid", w || comp.width, h || comp.height, 1, comp.duration); }
    function addAdjust(comp, name) { var a = addSolid(comp, [1, 1, 1], name || "Adjust"); a.adjustmentLayer = true; return a; }
    function addNull(comp, name) { var n = comp.layers.addNull(); n.name = name || "Null"; return n; }
    function addTextLayer(comp, text, size, color) {
        var tl = comp.layers.addText(text);
        var sp = tl.property("ADBE Text Properties").property("ADBE Text Document"); var td = sp.value;
        td.fontSize = size || 120; td.fillColor = color || BRAND.text; td.applyFill = true;
        try { td.justification = ParagraphJustification.CENTER_JUSTIFY; } catch (e) {}
        try { td.font = (BRAND.fontStyle === "Light" ? "Arial" : "Arial-BoldMT"); } catch (e) {}
        sp.setValue(td); centerLayer(tl, comp); return tl;
    }
    function addRoundedRect(comp, size, roundness, fill, name) {
        var s = comp.layers.addShape(); s.name = name || "Card";
        var gc = s.property("ADBE Root Vectors Group").addProperty("ADBE Vector Group").property("ADBE Vectors Group");
        var r = gc.addProperty("ADBE Vector Shape - Rect");
        r.property("ADBE Vector Rect Size").setValue(size); r.property("ADBE Vector Rect Roundness").setValue(roundness === undefined ? 28 : roundness);
        gc.addProperty("ADBE Vector Graphic - Fill").property("ADBE Vector Fill Color").setValue(rgba(fill || BRAND.card, 1));
        centerLayer(s, comp); return s;
    }
    function addCircle(comp, dia, fill, name) {
        var s = comp.layers.addShape(); s.name = name || "Circle";
        var gc = s.property("ADBE Root Vectors Group").addProperty("ADBE Vector Group").property("ADBE Vectors Group");
        gc.addProperty("ADBE Vector Shape - Ellipse").property("ADBE Vector Ellipse Size").setValue([dia, dia]);
        gc.addProperty("ADBE Vector Graphic - Fill").property("ADBE Vector Fill Color").setValue(rgba(fill || BRAND.primary, 1));
        return s;
    }
    function addStroke(shapeLayer, color, width) {
        var gc = shapeLayer.property("ADBE Root Vectors Group").property(1).property("ADBE Vectors Group");
        var st = gc.addProperty("ADBE Vector Graphic - Stroke");
        st.property("ADBE Vector Stroke Color").setValue(rgba(color, 1)); st.property("ADBE Vector Stroke Width").setValue(width);
    }
    function zeroFill(shapeLayer) {
        try { var gc = shapeLayer.property("ADBE Root Vectors Group").property(1).property("ADBE Vectors Group");
            for (var i = 1; i <= gc.numProperties; i++) if (gc.property(i).matchName === "ADBE Vector Graphic - Fill") gc.property(i).property("ADBE Vector Fill Opacity").setValue(0); } catch (e) {}
    }
    function makeBorder(shapeLayer, color, w) { addStroke(shapeLayer, color, w); zeroFill(shapeLayer); }
    function renameLayer(layer, nm) { try { layer.name = nm; } catch (e) {} return layer; }

    /* ===================================================================== *
     *  9. NAME PARSING
     * ===================================================================== */

    function parseDir(name, fallback) {
        var n = name.toLowerCase();
        var up = /up|rise/.test(n), down = /down|drop/.test(n), left = /left/.test(n), right = /right/.test(n);
        if (up && left) return "Diag UL"; if (up && right) return "Diag UR"; if (down && left) return "Diag DL"; if (down && right) return "Diag DR";
        if (up) return "Up"; if (down) return "Down"; if (left) return "Left"; if (right) return "Right";
        if (/zoom in|push/.test(n)) return "Zoom In"; if (/zoom out|pull/.test(n)) return "Zoom Out";
        return fallback || "Center";
    }
    function dirOffset(dir, dist) {
        switch (dir) {
            case "Up": return [0, dist]; case "Down": return [0, -dist]; case "Left": return [dist, 0]; case "Right": return [-dist, 0];
            case "Diag UL": return [dist, dist]; case "Diag UR": return [-dist, dist]; case "Diag DL": return [dist, -dist]; case "Diag DR": return [-dist, -dist];
            default: return [0, 0];
        }
    }
    function mods(name) {
        var n = name.toLowerCase();
        return { glow: /glow|burst|ring|neon/.test(n), flash: /flash|impact|hit|slam/.test(n), blur: /blur|focus/.test(n),
            shadow: /shadow/.test(n), rotate: /rotate|tilt|spin|orbit/.test(n), shine: /shine|light sweep/.test(n),
            cursor: /cursor|click|tap/.test(n), callout: /callout|label|feature/.test(n), loop: /loop|hover|pulse|wiggle|float/.test(n),
            elastic: /elastic/.test(n), hard: /hard|heavy|slam|impact|bass|snap/.test(n), soft: /soft|tiny|micro/.test(n),
            dbl: /double/.test(n), out: /\bout\b|exit|outro|pull/.test(n), stagger: /stagger|stack|layered|pack/.test(n) };
    }
    function easingFor(m, base) { if (m.elastic) return "Elastic"; if (m.hard) return "Hard Impact"; if (m.soft) return "Soft Bounce"; return base || styleEasing(); }
    function applyMods(layer, m, t0, dur) {
        if (m.glow) addGlow(layer, 20 + 15 * CFG.glow, 1 + CFG.glow * 0.4, styleColor());
        if (m.shadow) addShadow(layer, 60, 150, 14);
        if (m.flash) addFlash(layer.containingComp, t0, flashColor(), 0.12, 2);
        if (m.rotate) { var tp = transformProps(layer); var rv = tp.rot.valueAtTime(t0, false); anim2(tp.rot, t0, dur, rv - CFG.rotation, rv, styleEasing()); }
        if (m.loop) { try { transformProps(layer).pos.expression = "wiggle(0.6, 6)"; } catch (e) {} }
        try { layer.motionBlur = true; } catch (e) {}
    }

    /* ===================================================================== *
     *  10. MOTION CATEGORY FUNCTIONS  (unique per-name behavior)
     * ===================================================================== */

    function applyBouncePreset(layer, name, s) {
        var comp = layer.containingComp, t0 = s.time, dur = s.duration, m = mods(name), n = name.toLowerCase();
        var dir = parseDir(name, "Center"), tp = transformProps(layer);
        var amt = (0.12 + 0.05 * CFG.bounce) * (m.hard ? 1.6 : (m.soft ? 0.5 : 1));
        var wob = m.elastic ? 5 : (m.dbl ? 2 : 1);
        // Slam: fast in from above + impact flash.
        if (/slam/.test(n)) { var rp = tp.pos.valueAtTime(t0, false); anim2(tp.pos, t0, dur * 0.7, [rp[0], rp[1] - s.distance], rp, "Hard Impact"); bounceKeys(tp.scale, t0, dur, [130, 130], tp.scale.valueAtTime(t0, false), 1, amt); anim2(tp.opac, t0, dur * 0.4, 0, 100, "Smooth"); addFlash(comp, t0, flashColor(), 0.12, 3); applyMods(layer, m, t0, dur); return; }
        // Bounce Slide (dir): slide from offset with overshoot.
        if (/slide/.test(n) && dir !== "Center") { var r2 = tp.pos.valueAtTime(t0, false); var off = dirOffset(dir, s.distance); var from = [r2[0] + off[0], r2[1] + off[1]]; bounceKeys(tp.pos, t0, dur, from, r2, wob, amt); anim2(tp.opac, t0, dur * 0.5, 0, 100, "Smooth"); applyMods(layer, m, t0, dur); return; }
        // Directional bounce (Up/Down/Left/Right): move from that side, bounce into place.
        var useScale = (dir === "Center") || /pop|scale|zoom|spring|pulse|impact|button|ui/.test(n);
        if (/zoom/.test(n)) useScale = true;
        if (m.out) { var ro = tp.scale.valueAtTime(t0, false); bounceKeys(tp.scale, t0, dur, ro, [0, 0], wob, amt); anim2(tp.opac, t0 + dur * 0.4, dur * 0.6, 100, 0, "Smooth"); }
        else if (useScale) { var rest = tp.scale.valueAtTime(t0, false); var z = rest.length > 2 ? [0, 0, 0] : [0, 0]; bounceKeys(tp.scale, t0, dur, z, rest, wob, amt); anim2(tp.opac, t0, dur * 0.5, 0, 100, "Smooth"); }
        else { var rp2 = tp.pos.valueAtTime(t0, false); var off2 = dirOffset(dir === "Center" ? "Up" : dir, s.distance); var f2 = [rp2[0] + off2[0], rp2[1] + off2[1]]; if (rp2.length > 2) f2.push(rp2[2]); bounceKeys(tp.pos, t0, dur, f2, rp2, wob, amt); anim2(tp.opac, t0, dur * 0.5, 0, 100, "Smooth"); }
        applyMods(layer, m, t0, dur);
        if (/wiggle|hover|pulse|loop/.test(n)) try { tp.scale.expression = "s=8*Math.sin(time*6);value+[s,s]"; } catch (e) {}
    }

    function applySlidePreset(layer, name, s) {
        var t0 = s.time, dur = s.duration, m = mods(name), n = name.toLowerCase();
        var fast = /fast|snappy/.test(n), smooth = /smooth/.test(n);
        var ease = fast ? "Fast Cut" : (smooth ? "Cinematic" : easingFor(m, "Snappy"));
        var dir = parseDir(name, "Left"), tp = transformProps(layer); var rest = tp.pos.valueAtTime(t0, false); var off = dirOffset(dir, s.distance);
        if (m.out) { anim2(tp.pos, t0, dur, rest, [rest[0] - off[0], rest[1] - off[1]], ease); anim2(tp.opac, t0 + dur * 0.4, dur * 0.6, 100, 0, "Smooth"); }
        else { var from = [rest[0] + off[0], rest[1] + off[1]]; if (rest.length > 2) from.push(rest[2]); anim2(tp.pos, t0, dur, from, rest, ease); anim2(tp.opac, t0, dur * 0.6, 0, 100, "Smooth"); }
        if (m.blur) { var b = addBlur(layer, 40); if (b) { var bp = b.property(1); bp.setValueAtTime(t0, 40); bp.setValueAtTime(t0 + dur, 0); easeProperty(bp, 75, 75); } }
        applyMods(layer, m, t0, dur);
    }

    function applyPopPreset(layer, name, s) {
        var t0 = s.time, dur = s.duration, m = mods(name), n = name.toLowerCase(), tp = transformProps(layer);
        var rest = tp.scale.valueAtTime(t0, false); var startPct = 0;
        if (/from 50/.test(n)) startPct = 0.5; if (/from 80|micro|tiny/.test(n)) startPct = 0.8;
        var from = [rest[0] * startPct, rest[1] * startPct]; if (rest.length > 2) from.push(rest[2] * startPct);
        var over = m.soft ? 0.06 : (m.hard ? 0.22 : 0.14);
        bounceKeys(tp.scale, t0, dur, from, rest, m.elastic ? 5 : 1, over);
        anim2(tp.opac, t0, dur * 0.45, 0, 100, "Smooth");
        if (/glow ring/.test(n)) { var ring = addCircle(layer.containingComp, 360, styleColor(), "Glow Ring"); zeroFill(ring); addStroke(ring, styleColor(), 10); addGlow(ring, 50, 2, styleColor()); try { transformProps(ring).pos.setValue(tp.pos.value); } catch (e) {} var rs = transformProps(ring).scale; rs.setValueAtTime(t0, [40, 40]); rs.setValueAtTime(t0 + dur, [120, 120]); var ro = transformProps(ring).opac; ro.setValueAtTime(t0, 100); ro.setValueAtTime(t0 + dur, 0); }
        if (/burst|purple burst/.test(n)) addFlash(layer.containingComp, t0, styleColor(), 0.2, 3);
        if (/camera bump/.test(n)) addCameraBump(layer.containingComp, t0, 10);
        applyMods(layer, m, t0, dur);
    }

    function applyFadePreset(layer, name, s) {
        var comp = layer.containingComp, t0 = s.time, dur = s.duration, m = mods(name), n = name.toLowerCase(), tp = transformProps(layer);
        var slow = /slow|premium|apple|cinematic|soft/.test(n), fast = /fast|hard|hype/.test(n);
        var d = slow ? dur * 1.6 : (fast ? dur * 0.6 : dur);
        if (/to black|from black|to white|from white/.test(n)) {
            var col = /white/.test(n) ? BRAND.text : BRAND.bg; var f = addSolid(comp, col, name); var fo = transformProps(f).opac;
            if (/from/.test(n)) { fo.setValueAtTime(t0, 100); fo.setValueAtTime(t0 + d, 0); } else { fo.setValueAtTime(t0, 0); fo.setValueAtTime(t0 + d, 100); }
            easeProperty(fo, 70, 70); f.inPoint = t0 - 0.1; f.outPoint = t0 + d + 0.2; return;
        }
        if (m.out) anim2(tp.opac, t0, d, 100, 0, "Smooth"); else anim2(tp.opac, t0, d, 0, 100, "Smooth");
        var dir = parseDir(name, "Center");
        if (dir !== "Center") { var rest = tp.pos.valueAtTime(t0, false); var off = dirOffset(dir, s.distance * 0.3); anim2(tp.pos, t0, d, [rest[0] + off[0], rest[1] + off[1]], rest, "Smooth"); }
        if (/scale/.test(n)) { var rs = tp.scale.valueAtTime(t0, false); anim2(tp.scale, t0, d, [rs[0] * 0.85, rs[1] * 0.85], rs, "Smooth"); }
        if (m.blur) { var b = addBlur(layer, 30); if (b) { var bp = b.property(1); bp.setValueAtTime(t0, m.out ? 0 : 30); bp.setValueAtTime(t0 + d, m.out ? 30 : 0); easeProperty(bp, 75, 75); } }
        applyMods(layer, m, t0, d);
    }

    function applyBlurPreset(layer, name, s) {
        var t0 = s.time, dur = s.duration, m = mods(name), n = name.toLowerCase(), tp = transformProps(layer);
        var dir = parseDir(name, "Center"); var directional = /directional|motion|zoom/.test(n); var out = m.out || /blur out/.test(n);
        var maxB = /cinematic|smooth|reveal/.test(n) ? 80 : (m.hard || /hit|slam|strong/.test(n) ? 120 : 50);
        var b = directional ? addDirectionalBlur(layer, maxB, (dir === "Left" || dir === "Right") ? 90 : 0) : addBlur(layer, maxB);
        if (b) { var bp = b.property(1); if (bp) { bp.setValueAtTime(t0, out ? 0 : maxB); bp.setValueAtTime(t0 + dur, out ? maxB : 0); easeProperty(bp, 75, 75); } }
        anim2(tp.opac, t0, dur * 0.7, out ? 100 : 0, out ? 0 : 100, "Smooth");
        if (dir !== "Center" && /slide/.test(n)) { var rest = tp.pos.valueAtTime(t0, false); var off = dirOffset(dir, s.distance * 0.6); anim2(tp.pos, t0, dur, [rest[0] + off[0], rest[1] + off[1]], rest, "Snappy"); }
        if (/pop/.test(n)) { var rs = tp.scale.valueAtTime(t0, false); bounceKeys(tp.scale, t0, dur, [rs[0] * 0.7, rs[1] * 0.7], rs, 1, 0.12); }
        applyMods(layer, m, t0, dur);
    }

    /* ===================================================================== *
     *  11. TEXT PRESETS
     * ===================================================================== */

    function getTextString(layer, fb) { try { return layer.property("ADBE Text Properties").property("ADBE Text Document").value.text || fb; } catch (e) { return fb; } }
    function ensureTextLayer(comp, fb) {
        var sel = comp.selectedLayers, tl = null;
        for (var i = 0; i < sel.length; i++) if (sel[i] instanceof TextLayer) { tl = sel[i]; break; }
        if (!tl) tl = addTextLayer(comp, fb || "Your text here", 120, BRAND.text); return tl;
    }
    function addTextRangeAnim(layer, basedOn, t0, dur, buildFn) {
        var animators = layer.property("ADBE Text Properties").property("ADBE Text Animators");
        var an = animators.addProperty("ADBE Text Animator");
        var sel = an.property("ADBE Text Selectors").addProperty("ADBE Text Selector");
        try { sel.property("ADBE Text Range Advanced").property("ADBE Text Range Type2").setValue(basedOn); } catch (e) {}
        var start = sel.property("ADBE Text Percent Start"); start.setValueAtTime(t0, 0); start.setValueAtTime(t0 + dur, 100); easeProperty(start, 65, 65);
        buildFn(an.property("ADBE Text Animator Properties")); return an;
    }
    function applyTextPreset(layer, name, s) {
        if (!(layer instanceof TextLayer)) layer = ensureTextLayer(layer.containingComp, "Your text here");
        var comp = layer.containingComp, t0 = s.time, dur = s.duration, m = mods(name), n = name.toLowerCase(), tp = transformProps(layer);
        if (/letter/.test(n)) { addTextRangeAnim(layer, 1, t0, dur, function (p) { p.addProperty("ADBE Text Opacity").setValue(0); p.addProperty("ADBE Text Position 3D").setValue([0, 60, 0]); if (/bounce/.test(n)) p.addProperty("ADBE Text Scale 3D").setValue([40, 40, 100]); }); anim2(tp.opac, t0, comp.frameDuration, 0, 100, "Smooth"); }
        else if (/word/.test(n)) { addTextRangeAnim(layer, 3, t0, dur, function (p) { p.addProperty("ADBE Text Opacity").setValue(0); if (/slide/.test(n)) p.addProperty("ADBE Text Position 3D").setValue([0, 50, 0]); if (/pop|bounce/.test(n)) p.addProperty("ADBE Text Scale 3D").setValue([30, 30, 100]); }); if (/flash/.test(n)) addFlash(comp, t0, flashColor(), 0.12, 2); anim2(tp.opac, t0, comp.frameDuration, 0, 100, "Smooth"); }
        else if (/type-on/.test(n)) { addTextRangeAnim(layer, 1, t0, dur * 1.4, function (p) { p.addProperty("ADBE Text Opacity").setValue(0); }); anim2(tp.opac, t0, comp.frameDuration, 0, 100, "Smooth"); }
        else if (/tracking/.test(n)) { var an = layer.property("ADBE Text Properties").property("ADBE Text Animators").addProperty("ADBE Text Animator"); var tr = an.property("ADBE Text Animator Properties").addProperty("ADBE Text Tracking Amount"); var tight = /tighten/.test(n); tr.setValueAtTime(t0, tight ? -8 : 30); tr.setValueAtTime(t0 + dur, 0); easeProperty(tr, 80, 80); anim2(tp.opac, t0, dur, 0, 100, "Smooth"); }
        else if (/slam|impact/.test(n)) { bounceKeys(tp.scale, t0, dur, [180, 180], tp.scale.valueAtTime(t0, false), 1, 0.1); anim2(tp.opac, t0, comp.frameDuration * 2, 0, 100, "Smooth"); addFlash(comp, t0, flashColor(), 0.12, 2); }
        else if (/glow reveal|glow ring/.test(n)) { addGlow(layer, 45, 1.8, styleColor()); anim2(tp.opac, t0, dur, 0, 100, "Smooth"); anim2(tp.scale, t0, dur, [90, 90], tp.scale.valueAtTime(t0, false), "Smooth"); }
        else if (/blur/.test(n)) { var b = addBlur(layer, 50); if (b) { var bp = b.property(1); bp.setValueAtTime(t0, 50); bp.setValueAtTime(t0 + dur, 0); easeProperty(bp, 75, 75); } anim2(tp.opac, t0, dur, 0, 100, "Smooth"); }
        else if (/bounce/.test(n)) { bounceKeys(tp.scale, t0, dur, [0, 0], tp.scale.valueAtTime(t0, false), 1, 0.14); anim2(tp.opac, t0, dur * 0.5, 0, 100, "Smooth"); var an2 = layer.property("ADBE Text Properties").property("ADBE Text Animators").addProperty("ADBE Text Animator"); var tr2 = an2.property("ADBE Text Animator Properties").addProperty("ADBE Text Tracking Amount"); tr2.setValueAtTime(t0, 6); tr2.setValueAtTime(t0 + dur, 0); }
        else if (/scale|pop|cta/.test(n)) { bounceKeys(tp.scale, t0, dur, [0, 0], tp.scale.valueAtTime(t0, false), 1, 0.12); anim2(tp.opac, t0, dur * 0.45, 0, 100, "Smooth"); }
        else if (/slide|fade/.test(n)) { var dir = parseDir(name, "Up"); var rest = tp.pos.valueAtTime(t0, false); var off = dirOffset(dir, s.distance * 0.5); anim2(tp.pos, t0, dur, [rest[0] + off[0], rest[1] + off[1]], rest, styleEasing()); anim2(tp.opac, t0, dur * 0.7, 0, 100, "Smooth"); }
        else if (/hover loop|pulse loop|bass pulse/.test(n)) { try { tp.scale.expression = "s=6*Math.sin(time*4);value+[s,s]"; } catch (e) {} anim2(tp.opac, t0, dur, 0, 100, "Smooth"); }
        else { var r3 = tp.pos.valueAtTime(t0, false); anim2(tp.pos, t0, dur, [r3[0], r3[1] + 40], r3, "Cinematic"); anim2(tp.opac, t0, dur, 0, 100, "Cinematic"); }
        if (/purple bar|underline/.test(n)) addAccentBar(comp, layer, /blue|under/.test(n) ? BRAND.accent : BRAND.primary, t0, dur);
        if (/pill|background pill/.test(n)) addTextPill(comp, layer, t0, dur);
        if (/shake/.test(n)) addBeatShake(layer, t0, 12);
        try { layer.motionBlur = true; } catch (e) {}
    }
    function addAccentBar(comp, layer, color, t0, dur) { var p = transformProps(layer).pos.value; var bar = addRoundedRect(comp, [420, 12], 6, color, "Accent Bar"); transformProps(bar).pos.setValue([p[0], p[1] + 90]); addGlow(bar, 20, 1.4, color); bar.moveAfter(layer); var sc = transformProps(bar).scale; sc.setValueAtTime(t0, [0, 100]); sc.setValueAtTime(t0 + dur, [100, 100]); easeProperty(sc, 80, 80); }
    function addTextPill(comp, layer, t0, dur) { var p = transformProps(layer).pos.value; var pill = addRoundedRect(comp, [560, 150], 75, BRAND.card, "Text Pill"); transformProps(pill).pos.setValue(p); addGlow(pill, 18, 1, BRAND.primary); pill.moveAfter(layer); bounceKeys(transformProps(pill).scale, t0, dur, [0, 0], [100, 100], 1, 0.1); }

    /* ===================================================================== *
     *  12. WINDOW / SCREENSHOT BUILDER  (universal)
     * ===================================================================== */

    function fitInto(layer, w, h) { try { var r = layer.sourceRectAtTime(0, false); var sc = Math.min(w / r.width, h / r.height) * 100; transformProps(layer).scale.setValue([sc, sc]); } catch (e) {} }
    function placeAsset(assetOrLayer, comp) {
        try {
            if (assetOrLayer && assetOrLayer.source) { return comp.layers.add(assetOrLayer.source); }          // a layer
            if (assetOrLayer && assetOrLayer.source === undefined && assetOrLayer.name && assetOrLayer.width) { return comp.layers.add(assetOrLayer); } // a footage/comp item
        } catch (e) {}
        return null;
    }
    // Build a premium window around a slot/layer (or placeholder cards). Returns { ctrl, frame, dots, center, w, h }.
    function buildWindow(comp, nameP, opts, s, slot) {
        var cw = 1100, ch = 660, center = [comp.width / 2, comp.height * 0.55];
        var ctrl = renameLayer(addNull(comp, nameP + " Ctrl"), nameP + " Ctrl");
        transformProps(ctrl).anchor.setValue([0, 0]); transformProps(ctrl).pos.setValue(center);
        var frame = addRoundedRect(comp, [cw, ch], 30, BRAND.card, nameP + " Frame"); transformProps(frame).pos.setValue(center); addShadow(frame, 90, 170, 20); frame.parent = ctrl;
        var border = addRoundedRect(comp, [cw + 6, ch + 6], 32, BRAND.primary, nameP + " Glow Border"); makeBorder(border, BRAND.primary, 6); addGlow(border, 50, 1.8, BRAND.glow); transformProps(border).pos.setValue(center); border.parent = ctrl; transformProps(border).opac.setValue(0);
        var dotCols = [hexToRGB("#FF5F57"), hexToRGB("#FEBC2E"), hexToRGB("#28C840")], dots = [];
        for (var d = 0; d < 3; d++) { var dot = renameLayer(addCircle(comp, 20, dotCols[d], nameP + " Dot " + (d + 1)), nameP + " Dot " + (d + 1)); transformProps(dot).pos.setValue([center[0] - cw / 2 + 34 + d * 30, center[1] - ch / 2 + 30]); dot.parent = ctrl; dots.push(dot); }
        var shotLayer = slot ? placeAsset(slot, comp) : null;
        if (shotLayer) { renameLayer(shotLayer, nameP + " Screenshot"); centerLayer(shotLayer, comp); fitInto(shotLayer, cw - 52, ch - 100); transformProps(shotLayer).pos.setValue([center[0], center[1] + 22]); shotLayer.parent = ctrl; }
        else {
            var inner = renameLayer(addRoundedRect(comp, [cw - 52, ch - 100], 16, BRAND.bg, nameP + " Inner"), nameP + " Inner"); transformProps(inner).pos.setValue([center[0], center[1] + 22]); inner.parent = ctrl;
            var prof = addRoundedRect(comp, [cw - 130, 120], 18, BRAND.card, nameP + " Profile Card"); transformProps(prof).pos.setValue([center[0], center[1] - ch / 2 + 150]); addGlow(prof, 10, 0.8, BRAND.primary); prof.parent = ctrl;
            var avatar = addCircle(comp, 76, BRAND.primary, nameP + " Avatar"); transformProps(avatar).pos.setValue([center[0] - (cw - 130) / 2 + 70, center[1] - ch / 2 + 150]); avatar.parent = ctrl;
            for (var p = 0; p < 2; p++) { var post = addRoundedRect(comp, [cw - 130, 150], 16, BRAND.card, nameP + " Post Card " + (p + 1)); transformProps(post).pos.setValue([center[0], center[1] + 20 + p * 175]); addGlow(post, 8, 0.6, BRAND.accent); post.parent = ctrl; var bar = addRoundedRect(comp, [cw - 300, 16], 8, BRAND.primary, nameP + " Post Bar " + (p + 1)); transformProps(bar).pos.setValue([center[0] - 60, center[1] - 10 + p * 175]); transformProps(bar).opac.setValue(80); bar.parent = ctrl; }
        }
        var cp = transformProps(ctrl); var rest = cp.scale.value;
        anim2(cp.pos, opts.inT, s.duration + 0.3, [center[0] + 720, center[1]], center, "Snappy");
        cp.opac.setValueAtTime(Math.max(0, opts.inT - 0.05), 0); anim2(cp.opac, opts.inT, 0.4, 0, 100, "Smooth");
        if (opts.dotsT) for (var di = 0; di < dots.length; di++) { var dop = transformProps(dots[di]).opac; dop.setValueAtTime(opts.dotsT - 0.05, 0); dop.setValueAtTime(opts.dotsT, 100); bounceKeys(transformProps(dots[di]).scale, opts.dotsT + di * 0.05, 0.35, [0, 0], [100, 100], 1, 0.16); }
        if (opts.glowT) { var bo = transformProps(border).opac; bo.setValueAtTime(opts.glowT - 0.05, 0); bo.setValueAtTime(opts.glowT, 100); bo.setValueAtTime(opts.glowT + 0.6, 55); } else transformProps(border).opac.setValue(55);
        if (opts.zoomT) { cp.scale.setValueAtTime(opts.zoomT, rest); cp.scale.setValueAtTime(opts.zoomT + 0.5, [rest[0] * 1.12, rest[1] * 1.12]); easeProperty(cp.scale, 80, 80); }
        if (opts.shine) addWindowShine(comp, ctrl, center, cw, ch, (opts.zoomT || opts.inT) + 0.3);
        if (opts.cursorT) addCursorClick(comp, ctrl, center, opts.cursorT);
        try { cp.pos.expression = "wiggle(0.4, 5)"; } catch (e) {}
        try { ctrl.motionBlur = true; } catch (e) {}
        return { ctrl: ctrl, frame: frame, dots: dots, center: center, w: cw, h: ch };
    }
    function addWindowShine(comp, ctrl, center, w, h, t) { var shine = addRoundedRect(comp, [w * 0.25, h * 1.5], 0, BRAND.text, "Window Shine"); transformProps(shine).opac.setValue(24); transformProps(shine).rot.setValue(20); shine.blendingMode = BlendingMode.ADD; addBlur(shine, 30); shine.parent = ctrl; var sp = transformProps(shine).pos; sp.setValueAtTime(t, [center[0] - w * 0.7, center[1]]); sp.setValueAtTime(t + 0.7, [center[0] + w * 0.7, center[1]]); easeProperty(sp, 60, 60); var so = transformProps(shine).opac; so.setValueAtTime(t, 0); so.setValueAtTime(t + 0.1, 24); so.setValueAtTime(t + 0.7, 0); }
    function addCursorClick(comp, ctrl, center, t) { var cur = addCircle(comp, 34, BRAND.text, "Cursor"); transformProps(cur).pos.setValue([center[0] + 60, center[1] + 40]); cur.parent = ctrl; var ring = addCircle(comp, 40, BRAND.primary, "Click Ring"); zeroFill(ring); addStroke(ring, BRAND.primary, 6); transformProps(ring).pos.setValue([center[0] + 60, center[1] + 40]); ring.parent = ctrl; var rs = transformProps(ring).scale; rs.setValueAtTime(t, [20, 20]); rs.setValueAtTime(t + 0.4, [220, 220]); var ro = transformProps(ring).opac; ro.setValueAtTime(t, 100); ro.setValueAtTime(t + 0.4, 0); var cs = transformProps(cur).scale; cs.setValueAtTime(t, [100, 100]); cs.setValueAtTime(t + 0.08, [80, 80]); cs.setValueAtTime(t + 0.2, [100, 100]); }
    function promoCallout(comp, ctrl, pos, label, t) { var pill = addRoundedRect(comp, [280, 84], 42, BRAND.primary, "Callout " + label); addGlow(pill, 20, 1.4, BRAND.primary); transformProps(pill).pos.setValue(pos); if (ctrl) pill.parent = ctrl; var txt = renameLayer(addTextLayer(comp, label, 34, BRAND.text), "Callout Text " + label); transformProps(txt).pos.setValue(pos); if (ctrl) txt.parent = ctrl; transformProps(pill).opac.setValueAtTime(t - 0.05, 0); transformProps(pill).opac.setValueAtTime(t, 100); transformProps(txt).opac.setValueAtTime(t - 0.05, 0); transformProps(txt).opac.setValueAtTime(t, 100); bounceKeys(transformProps(pill).scale, t, 0.4, [0, 0], [100, 100], 1, 0.14); }

    // Window preset router (used by the Window Presets tab + preset library).
    function applyWindowPreset(layer, name, s) {
        var comp = (layer && layer.containingComp) || activeComp(); if (!comp) return;
        var n = name.toLowerCase(); var t0 = s.time;
        var slot = layer ? layer : (ASSETS.shot1 || null);
        if (/3d|tilt|flip|stand|orbit|hover|sway|parallax|depth|turn/.test(n)) return build3DWindow(comp, "3D Window", name, s, (slot && slot.source) ? slot : null);
        var win = buildWindow(comp, "App Window", { inT: t0, dotsT: t0 + 0.4, glowT: t0 + 0.7, zoomT: /zoom|hero|feature|push/.test(n) ? t0 + 1.2 : 0, shine: /shine|premium/.test(n), cursorT: /cursor|click|tap/.test(n) ? t0 + 1.4 : 0 }, s, slot && slot.source ? slot : (layer && layer.source ? layer : slot));
        if (/callout|feature|label/.test(n)) promoCallout(comp, win.ctrl, [win.center[0] + win.w / 2 - 40, win.center[1] - win.h / 2 + 10], "New", t0 + 1.0);
        return win;
    }

    /* ===================================================================== *
     *  12b. 3D WEBPAGE WINDOW  (screenshot -> glowing 3D window + movements)
     * ===================================================================== */

    var WINDOW3D = ["3D Hover", "3D Hover Around", "3D Sway Left Right", "3D Turn Left To Right", "3D Turn Right To Left",
        "3D Tilt Reveal", "3D Stand Up", "3D Card Flip In", "3D Turn In", "3D Parallax Push", "3D Pull Back", "3D Orbit",
        "3D Floating Depth", "3D Left Pass", "3D Right Pass", "3D Glow Pulse Hover", "3D Corner Peek", "3D Depth Zoom"];

    function rotProps(layer) { var tg = layer.property("ADBE Transform Group"); return { x: tg.property("ADBE Rotate X"), y: tg.property("ADBE Rotate Y"), z: tg.property("ADBE Rotate Z") }; }
    function ensure3DCamera(comp) { var has = false; for (var i = 1; i <= comp.numLayers; i++) if (comp.layer(i) instanceof CameraLayer) has = true; if (!has) { try { comp.layers.addCamera("3D Camera", [comp.width / 2, comp.height / 2]); } catch (e) {} } }
    function posHoverExpr(cx, cy, cz, amp, zamp) { return "c=[" + cx + "," + cy + "," + cz + "]; c+[" + amp + "*Math.sin(time*0.5), " + (amp * 0.6) + "*Math.sin(time*0.7), " + zamp + "*Math.sin(time*0.4)]"; }

    // Build a framed screenshot as a real 3D window (layers pushed to different Z depths).
    function build3DWindow(comp, nameP, preset, s, slot) {
        ensure3DCamera(comp);
        var cw = 1100, ch = 660, cx = comp.width / 2, cy = comp.height * 0.5;
        var ctrl = addNull(comp, nameP + " 3D Ctrl"); ctrl.threeDLayer = true;
        var ctp = transformProps(ctrl); ctp.anchor.setValue([0, 0, 0]); ctp.pos.setValue([cx, cy, 0]);
        function set3D(layer, z) { layer.threeDLayer = true; layer.parent = ctrl; var p = transformProps(layer).pos.value; transformProps(layer).pos.setValue([p[0], p[1], z || 0]); try { layer.motionBlur = true; } catch (e) {} }
        // back glow (behind)
        var backGlow = addCircle(comp, Math.max(cw, ch) * 1.4, BRAND.primary, nameP + " Back Glow"); transformProps(backGlow).pos.setValue([cx, cy]); transformProps(backGlow).opac.setValue(32); addBlur(backGlow, 130); set3D(backGlow, 120);
        // frame + shadow
        var frame = addRoundedRect(comp, [cw, ch], 30, BRAND.card, nameP + " Frame"); transformProps(frame).pos.setValue([cx, cy]); addShadow(frame, 100, 180, 26); set3D(frame, 0);
        // glow border
        var border = addRoundedRect(comp, [cw + 6, ch + 6], 32, BRAND.primary, nameP + " Glow Border"); makeBorder(border, BRAND.primary, 6); addGlow(border, 60, 2, BRAND.glow); transformProps(border).pos.setValue([cx, cy]); set3D(border, -1); transformProps(border).opac.setValue(72);
        // browser dots (in front)
        var dc = [hexToRGB("#FF5F57"), hexToRGB("#FEBC2E"), hexToRGB("#28C840")];
        for (var d = 0; d < 3; d++) { var dot = addCircle(comp, 20, dc[d], nameP + " Dot " + (d + 1)); transformProps(dot).pos.setValue([cx - cw / 2 + 34 + d * 30, cy - ch / 2 + 30]); set3D(dot, -8); }
        // screenshot content or placeholder cards
        var shot = (slot && slot.source) ? placeAsset(slot, comp) : null;
        if (shot) { renameLayer(shot, nameP + " Screenshot"); centerLayer(shot, comp); fitInto(shot, cw - 52, ch - 100); transformProps(shot).pos.setValue([cx, cy + 22]); set3D(shot, -2); }
        else { var inner = addRoundedRect(comp, [cw - 52, ch - 100], 16, BRAND.bg, nameP + " Inner"); transformProps(inner).pos.setValue([cx, cy + 22]); set3D(inner, -2);
            var prof = addRoundedRect(comp, [cw - 130, 120], 18, BRAND.card, nameP + " Profile Card"); transformProps(prof).pos.setValue([cx, cy - ch / 2 + 150]); addGlow(prof, 10, 0.8, BRAND.primary); set3D(prof, -4);
            for (var p = 0; p < 2; p++) { var post = addRoundedRect(comp, [cw - 130, 150], 16, BRAND.card, nameP + " Post Card " + (p + 1)); transformProps(post).pos.setValue([cx, cy + 20 + p * 175]); addGlow(post, 8, 0.6, BRAND.accent); set3D(post, -4); } }
        apply3DMove(comp, ctrl, border, preset, [cx, cy, 0], s);
        try { ctrl.motionBlur = true; } catch (e) {}
        return ctrl;
    }

    function apply3DMove(comp, ctrl, border, preset, center, s) {
        var t0 = comp.time, dur = Math.max(s.duration, 0.7); var ctp = transformProps(ctrl); var R = rotProps(ctrl); var rest = ctp.scale.value; var n = preset.toLowerCase();
        function fadeIn() { ctp.opac.setValueAtTime(Math.max(0, t0 - 0.05), 0); anim2(ctp.opac, t0, 0.5, 0, 100, "Smooth"); }
        function introScale(mul) { ctp.scale.setValueAtTime(t0, [rest[0] * mul, rest[1] * mul, rest.length > 2 ? rest[2] : 100]); ctp.scale.setValueAtTime(t0 + dur, rest); easeProperty(ctp.scale, 80, 80); }
        function keyRot(prop, a, b, d) { prop.setValueAtTime(t0, a); prop.setValueAtTime(t0 + d, b); easeProperty(prop, 85, 85); }
        function slideIn(off, d) { ctp.pos.setValueAtTime(t0, [center[0] + off[0], center[1] + off[1], center[2] + off[2]]); ctp.pos.setValueAtTime(t0 + d, center); easeProperty(ctp.pos, 80, 80); }
        function keyZ(zFrom, d) { ctp.pos.setValueAtTime(t0, [center[0], center[1], zFrom]); ctp.pos.setValueAtTime(t0 + d, [center[0], center[1], 0]); easeProperty(ctp.pos, 85, 85); }
        function hover(amp, zamp) { try { ctp.pos.expression = posHoverExpr(center[0], center[1], center[2], amp, zamp); } catch (e) {} }
        fadeIn();
        if (/hover around/.test(n)) { introScale(0.85); try { R.y.expression = "12*Math.sin(time*0.6)"; R.x.expression = "-8+5*Math.sin(time*0.45)"; } catch (e) {} hover(24, 40); }
        else if (/glow pulse hover/.test(n)) { introScale(0.9); try { R.y.expression = "7*Math.sin(time*0.6)"; R.x.setValue(-5); } catch (e) {} try { border.property("ADBE Transform Group").property("ADBE Opacity").expression = "45+45*Math.sin(time*2.2)"; } catch (e2) {} hover(12, 40); }
        else if (/floating depth/.test(n)) { introScale(0.9); try { R.y.expression = "8*Math.sin(time*0.5)"; R.x.expression = "6*Math.sin(time*0.35)"; } catch (e) {} hover(10, 90); }
        else if (/sway/.test(n)) { introScale(0.9); try { R.y.expression = "28*Math.sin(time*0.4)"; R.x.setValue(-6); } catch (e) {} }
        else if (/orbit/.test(n)) { introScale(0.9); try { R.y.expression = "time*30"; } catch (e) {} }
        else if (/corner peek/.test(n)) { introScale(0.9); try { R.x.setValue(-18); R.y.expression = "20+4*Math.sin(time*0.6)"; } catch (e) {} hover(10, 40); }
        else if (/turn left to right/.test(n)) { introScale(0.92); keyRot(R.y, -38, 38, dur * 1.5); try { R.x.setValue(-5); } catch (e) {} }
        else if (/turn right to left/.test(n)) { introScale(0.92); keyRot(R.y, 38, -38, dur * 1.5); try { R.x.setValue(-5); } catch (e) {} }
        else if (/turn in/.test(n)) { introScale(0.9); keyRot(R.y, -60, 0, dur); slideIn([-500, 0, 0], dur); }
        else if (/tilt reveal/.test(n)) { introScale(0.9); keyRot(R.x, 45, 0, dur); }
        else if (/stand up/.test(n)) { introScale(0.9); keyRot(R.x, 80, 0, dur); }
        else if (/card flip/.test(n)) { introScale(0.95); keyRot(R.y, 180, 0, dur); }
        else if (/left pass/.test(n)) { slideIn([-720, 0, 0], dur); keyRot(R.y, 40, 0, dur); }
        else if (/right pass/.test(n)) { slideIn([720, 0, 0], dur); keyRot(R.y, -40, 0, dur); }
        else if (/parallax push|depth zoom/.test(n)) { keyZ(720, dur); try { R.x.setValue(-6); R.y.expression = "5*Math.sin(time*0.5)"; } catch (e) {} }
        else if (/pull back/.test(n)) { keyZ(-520, dur); try { R.y.expression = "5*Math.sin(time*0.4)"; } catch (e) {} }
        else { introScale(0.9); try { R.y.expression = "6*Math.sin(time*0.7)"; R.x.expression = "-5+3*Math.sin(time*0.5)"; } catch (e) {} hover(14, 40); }
    }
    function makeThreeDWindow(presetName) {
        var comp = activeComp(); if (!comp) return; var s = buildSettings(); var sel = comp.selectedLayers;
        undoable("3D Window: " + presetName, function () { var slot = (sel && sel.length && sel[0].source) ? sel[0] : (ASSETS.shot1 && ASSETS.shot1.source ? ASSETS.shot1 : null); build3DWindow(comp, "3D Window", presetName, s, slot); });
    }

    /* ===================================================================== *
     *  13. SHAPE PRESETS + PACKS
     * ===================================================================== */

    function applyShapePreset(name, s) {
        var comp = activeComp(); if (!comp) return; var t0 = comp.time, dur = s.duration, n = name.toLowerCase(); seed(CFG.seed + comp.numLayers);
        if (/card/.test(n) && !/stack|pack/.test(n)) { var card = addRoundedRect(comp, [640, 360], 32, BRAND.card, name); addGlow(card, 22, 1.1, BRAND.primary); if (/shadow/.test(n)) addShadow(card, 60, 140, 14); if (/slide/.test(n)) applySlidePreset(card, "Slide In Up", mergeS(s, { time: t0 })); else if (/bounce/.test(n)) applyBouncePreset(card, "Bounce In", mergeS(s, { time: t0 })); else bounceKeys(transformProps(card).scale, t0, dur, [0, 0], [100, 100], 1, 0.12); return card; }
        if (/pill/.test(n)) { var pill = addRoundedRect(comp, [340, 110], 55, BRAND.primary, "Pill"); transformProps(pill).opac.setValue(92); if (/bounce/.test(n)) applyBouncePreset(pill, "Bounce In", mergeS(s, { time: t0 })); else applySlidePreset(pill, "Slide In Left", mergeS(s, { time: t0 })); try { transformProps(pill).pos.expression = "wiggle(0.4, 10)"; } catch (e) {} return pill; }
        if (/circle glow|glow circle|glow ring|ring pulse/.test(n)) { var c = addCircle(comp, 420, BRAND.primary, name); centerLayer(c, comp); if (/ring/.test(n)) { zeroFill(c); addStroke(c, BRAND.primary, 12); } addGlow(c, 70, 2, BRAND.glow); transformProps(c).opac.setValue(60); if (/pulse/.test(n)) { try { transformProps(c).scale.expression = "s=100+8*Math.sin(time*3);[s,s]"; } catch (e) {} } else bounceKeys(transformProps(c).scale, t0, dur, [0, 0], [100, 100], 1, 0.12); return c; }
        if (/accent bar/.test(n)) { var bar = addRoundedRect(comp, [comp.width * 0.5, 14], 7, /blue|accent/.test(n) ? BRAND.accent : BRAND.primary, "Accent Bar"); addGlow(bar, 25, 1.5, BRAND.primary); var sc = transformProps(bar).scale; sc.setValueAtTime(t0, [0, 100]); sc.setValueAtTime(t0 + dur, [100, 100]); easeProperty(sc, 80, 80); return bar; }
        if (/chip/.test(n)) { var chip = addRoundedRect(comp, [240, 80], 40, BRAND.primary, "UI Chip"); transformProps(chip).opac.setValue(92); bounceKeys(transformProps(chip).scale, t0, dur, [0, 0], [100, 100], 1, 0.14); return chip; }
        if (/blob|background glow|dark background/.test(n)) { var made = []; var cnt = /pack|shapes|abstract/.test(n) ? 3 : 1; for (var i = 0; i < cnt; i++) { var col = /blue|accent/.test(n) ? BRAND.accent : (i === 1 ? BRAND.accent : BRAND.primary); var blob = addCircle(comp, rr(400, 800), col, "Glow Blob " + (i + 1)); transformProps(blob).pos.setValue([rr(0, comp.width), rr(0, comp.height)]); transformProps(blob).opac.setValue(rr(15, 35)); addBlur(blob, rr(90, 160)); try { transformProps(blob).pos.expression = "wiggle(0.15, 60)"; } catch (e) {} blob.moveToEnd(); made.push(blob); } return made; }
        if (/shape wipe|rectangle reveal|rounded mask/.test(n)) { var dir = parseDir(name, "Left"); var wipe = addRoundedRect(comp, [comp.width * 1.4, comp.height * 1.4], 50, BRAND.primary, "Shape Wipe"); var sc2 = transformProps(wipe).scale; var from = (dir === "Up" || dir === "Down") ? [140, 0] : [0, 140]; sc2.setValueAtTime(t0, from); sc2.setValueAtTime(t0 + dur, [140, 140]); easeProperty(sc2, 80, 80); return wipe; }
        if (/border/.test(n)) { var b = addRoundedRect(comp, [comp.width * 0.7, comp.height * 0.6], 30, BRAND.card, "Animated Border"); makeBorder(b, BRAND.primary, 6); addGlow(b, 20, 1.4, BRAND.primary); if (/pulse|neon/.test(n)) { try { transformProps(b).opac.expression = "50+50*Math.sin(time*4)"; } catch (e) {} } else bounceKeys(transformProps(b).scale, t0, dur, [0, 0], [100, 100], 1, 0.1); return b; }
        if (/dot pack|trail dots|floating dot/.test(n)) { var dots = []; for (var dI = 0; dI < 8; dI++) { var dt = addCircle(comp, rr(10, 26), BRAND.primary, "Dot " + (dI + 1)); transformProps(dt).pos.setValue([rr(0, comp.width), rr(0, comp.height)]); transformProps(dt).opac.setValue(rr(40, 90)); try { transformProps(dt).pos.expression = "wiggle(0.3, 30)"; } catch (e) {} dots.push(dt); } return dots; }
        if (/grid line/.test(n)) { var grid = addRoundedRect(comp, [comp.width, comp.height], 0, BRAND.card, "Grid"); transformProps(grid).opac.setValue(18); grid.moveToEnd(); var sc3 = transformProps(grid).scale; sc3.setValueAtTime(t0, [0, 100]); sc3.setValueAtTime(t0 + dur, [100, 100]); easeProperty(sc3, 80, 80); return grid; }
        if (/corner glow|edge glow/.test(n)) { var made2 = []; var pts = /corner/.test(n) ? [[0, 0], [comp.width, 0], [0, comp.height], [comp.width, comp.height]] : [[comp.width / 2, 0], [comp.width / 2, comp.height]]; for (var p2 = 0; p2 < pts.length; p2++) { var g2 = addCircle(comp, 500, BRAND.primary, "Glow " + (p2 + 1)); transformProps(g2).pos.setValue(pts[p2]); transformProps(g2).opac.setValue(24); addBlur(g2, 120); g2.moveToEnd(); made2.push(g2); } return made2; }
        if (/burst|flash/.test(n)) { var burst = addCircle(comp, 60, BRAND.primary, "Shape Burst"); centerLayer(burst, comp); zeroFill(burst); addStroke(burst, BRAND.primary, 10); var bs = transformProps(burst).scale; bs.setValueAtTime(t0, [10, 10]); bs.setValueAtTime(t0 + dur, [600, 600]); var bo = transformProps(burst).opac; bo.setValueAtTime(t0, 100); bo.setValueAtTime(t0 + dur, 0); return burst; }
        if (/stack|pack|premium background|social ui|feature card|glassmorphism/.test(n)) { var group = []; group.push(applyShapePreset("Dark Background Glow", s)); for (var g3 = 0; g3 < 3; g3++) { var cd = addRoundedRect(comp, [360, 220], 28, BRAND.card, "Stack Card " + (g3 + 1)); if (/glass/.test(n)) { transformProps(cd).opac.setValue(72); addBlur(cd, 5); } addGlow(cd, 18, 1, BRAND.primary); transformProps(cd).pos.setValue([comp.width * (0.3 + g3 * 0.2), comp.height * 0.6]); bounceKeys(transformProps(cd).scale, t0 + g3 * 0.12, dur, [0, 0], [100, 100], 1, 0.12); group.push(cd); } return group; }
        if (/liquid|abstract/.test(n)) return applyShapePreset("Background Blob Float", s);
        var def = addRoundedRect(comp, [520, 320], 30, BRAND.card, "Shape"); addGlow(def, 20, 1, BRAND.primary); bounceKeys(transformProps(def).scale, t0, dur, [0, 0], [100, 100], 1, 0.12); return def;
    }
    // Named universal shape packs.
    var SHAPE_PACKS = ["Clean Tech Shape Pack", "Dark UI Shape Pack", "Neon Hype Shape Pack", "App Promo Shape Pack",
        "Product Promo Shape Pack", "Gaming Edit Shape Pack", "Social Media Shape Pack", "Minimal Shape Pack", "Glassmorphism Shape Pack", "DXED Shape Pack"];
    function addShapePack(comp, packName) {
        undoable("Add " + (packName || "Shape Pack"), function () {
            var s = buildSettings(); var n = (packName || "").toLowerCase();
            applyShapePreset("Dark Background Glow", s);
            applyShapePreset(/glass/.test(n) ? "Glassmorphism Card Stack" : "Rounded Card In", s);
            if (!/minimal/.test(n)) applyShapePreset("Floating Pill", s);
            if (/neon|gaming|social|hype/.test(n)) applyShapePreset("Neon Border Pulse", s);
            applyShapePreset("Floating Dot Pack", s);
            applyShapePreset("Accent Bar", s);
        });
    }

    /* ===================================================================== *
     *  14. FLASH / TRANSITION / CAMERA / BEAT-SYNC / COMBO
     * ===================================================================== */

    function addFlash(comp, t, color, len, strength) {
        len = len || 0.2; strength = strength || 2; var f = addSolid(comp, color || BRAND.text, "Flash"); f.blendingMode = BlendingMode.ADD;
        var op = transformProps(f).opac; var peak = clamp(55 + strength * 15, 40, 100);
        op.setValueAtTime(t, 0); op.setValueAtTime(t + len * 0.25, peak); op.setValueAtTime(t + len, 0); easeProperty(op, 80, 80);
        f.inPoint = Math.max(0, t - 0.05); f.outPoint = t + len + 0.1; if (strength >= 3) addGlow(f, 30, 2, color || BRAND.text); return f;
    }
    function addBeatShake(layer, t, amt) { var p = transformProps(layer).pos; var base = p.valueAtTime(t, false); seed(CFG.seed + Math.round(t * 100)); for (var i = 0; i < 4; i++) { var tt = t + i * 0.04; var jx = (i === 3) ? 0 : rr(-amt, amt); var jy = (i === 3) ? 0 : rr(-amt, amt); p.setValueAtTime(tt, [base[0] + jx, base[1] + jy]); } }
    function addCameraBump(comp, t, amt) { var adj = addAdjust(comp, "Camera Bump"); var tr = addTransformFX(adj); if (tr) { var sc = tr.property("Scale"); if (sc) { var base = sc.value; sc.setValueAtTime(t, base); sc.setValueAtTime(t + 0.06, [base[0] * (1 + amt / 100), base[1] * (1 + amt / 100)]); sc.setValueAtTime(t + 0.28, base); easeProperty(sc, 70, 70); } } adj.inPoint = Math.max(0, t - 0.05); adj.outPoint = t + 0.4; return adj; }
    function cameraPush(comp, t0, dur, mult, name) { var adj = addAdjust(comp, name || "Camera Push"); var tr = addTransformFX(adj); if (!tr) return; var sc = tr.property("Scale"); if (!sc) return; var base = sc.value; sc.setValueAtTime(t0, base); sc.setValueAtTime(t0 + dur, [base[0] * mult, base[1] * mult]); easeProperty(sc, 88, 88); adj.inPoint = Math.max(0, t0 - 0.1); adj.outPoint = Math.min(comp.duration, t0 + dur + 0.3); }

    function applyFlashPreset(time, name, s) {
        var comp = activeComp(); if (!comp) return; var n = name.toLowerCase();
        var color = /purple/.test(n) ? BRAND.primary : (/blue/.test(n) ? BRAND.accent : (/white/.test(n) ? BRAND.text : flashColor()));
        var strength = /hard|strong|bass|hype|impact/.test(n) ? 3 : (/soft|micro|clean|premium/.test(n) ? 1 : 2);
        var len = /micro|fast|strobe/.test(n) ? 0.08 : (/soft|light sweep|lens/.test(n) ? 0.3 : 0.16);
        if (/strobe/.test(n)) { for (var i = 0; i < 4; i++) addFlash(comp, time + i * 0.1, color, 0.06, strength); return; }
        if (/glow burst|glow/.test(n)) { var f = addFlash(comp, time, /purple/.test(n) ? BRAND.primary : BRAND.glow, 0.3, 3); addGlow(f, 60, 3, BRAND.primary); return; }
        if (/edge glow|background/.test(n)) { var eg = addAdjust(comp, name); addGlow(eg, 40, 2, color); var eo = transformProps(eg).opac; eo.setValueAtTime(time, 0); eo.setValueAtTime(time + 0.15, 100); eo.setValueAtTime(time + 0.6, 0); eg.inPoint = time; eg.outPoint = time + 0.7; return; }
        if (/ui ripple/.test(n)) { var rp = addCircle(comp, 40, BRAND.primary, "Ripple"); centerLayer(rp, comp); zeroFill(rp); addStroke(rp, BRAND.primary, 8); var rs = transformProps(rp).scale; rs.setValueAtTime(time, [10, 10]); rs.setValueAtTime(time + 0.5, [500, 500]); var ro = transformProps(rp).opac; ro.setValueAtTime(time, 100); ro.setValueAtTime(time + 0.5, 0); rp.inPoint = time; rp.outPoint = time + 0.6; return; }
        if (/light sweep|lens/.test(n)) { var sweep = addSolid(comp, BRAND.text, "Light Sweep"); sweep.blendingMode = BlendingMode.ADD; addBlur(sweep, 60); var sp = transformProps(sweep).pos; var c = [comp.width / 2, comp.height / 2]; sp.setValueAtTime(time, [-comp.width / 2, c[1]]); sp.setValueAtTime(time + 0.5, [comp.width * 1.5, c[1]]); var so = transformProps(sweep).opac; so.setValueAtTime(time, 0); so.setValueAtTime(time + 0.1, 60); so.setValueAtTime(time + 0.5, 0); sweep.inPoint = time - 0.05; sweep.outPoint = time + 0.6; return; }
        var flash = addFlash(comp, time, color, len, strength);
        if (/shake/.test(n)) { var sl = comp.selectedLayers[0]; if (sl) addBeatShake(sl, time, 14); else addCameraBump(comp, time, 8); }
        if (/zoom|camera/.test(n)) addCameraBump(comp, time, 12);
    }

    function applyTransitionPreset(time, name, s) {
        var comp = activeComp(); if (!comp) return; var n = name.toLowerCase(); var dur = s.duration * 0.7;
        if (/white flash|scene flash|hard beat|fast hype|zoom flash|clean premium cut|bass hit/.test(n)) { addFlash(comp, time, /purple/.test(n) ? BRAND.primary : BRAND.text, 0.18, 3); if (/zoom|bass|beat/.test(n)) addCameraBump(comp, time, 12); return; }
        if (/purple flash/.test(n)) { addFlash(comp, time, BRAND.primary, 0.2, 2); return; }
        if (/blue flash/.test(n)) { addFlash(comp, time, BRAND.accent, 0.2, 2); return; }
        if (/glow wipe|scene glow|glow cut/.test(n)) { var gw = addRoundedRect(comp, [comp.width * 1.6, comp.height * 1.6], 40, BRAND.primary, "Glow Wipe"); addGlow(gw, 60, 2, BRAND.glow); var sc = transformProps(gw).scale; sc.setValueAtTime(time, [0, 0]); sc.setValueAtTime(time + dur, [170, 170]); easeProperty(sc, 80, 80); var o = transformProps(gw).opac; o.setValueAtTime(time, 100); o.setValueAtTime(time + dur, 0); gw.inPoint = time - 0.05; gw.outPoint = time + dur + 0.1; return; }
        if (/circle reveal/.test(n)) { var cr = addCircle(comp, Math.max(comp.width, comp.height) * 2, BRAND.bg, "Circle Wipe"); centerLayer(cr, comp); var cs = transformProps(cr).scale; cs.setValueAtTime(time, [100, 100]); cs.setValueAtTime(time + dur, [0, 0]); easeProperty(cs, 80, 80); cr.inPoint = time - 0.05; cr.outPoint = time + dur + 0.1; return; }
        if (/rectangle wipe|card wipe|shape wipe|text wipe|card stack/.test(n)) { var rw = addRoundedRect(comp, [comp.width * 1.4, comp.height * 1.4], 60, BRAND.card, "Wipe"); var rs = transformProps(rw).scale; rs.setValueAtTime(time, [0, 100]); rs.setValueAtTime(time + dur, [140, 140]); easeProperty(rs, 80, 80); rw.inPoint = time - 0.05; rw.outPoint = time + dur + 0.2; return; }
        if (/slide wipe/.test(n)) { var dir = parseDir(name, "Left"); var sw = addSolid(comp, BRAND.card, "Slide Wipe"); var off = dirOffset(dir, comp.width); var sp = transformProps(sw).pos; var c = [comp.width / 2, comp.height / 2]; sp.setValueAtTime(time, [c[0] + off[0], c[1] + off[1]]); sp.setValueAtTime(time + dur, c); sp.setValueAtTime(time + dur * 2, [c[0] - off[0], c[1] - off[1]]); easeProperty(sp, 70, 70); sw.inPoint = time - 0.05; sw.outPoint = time + dur * 2 + 0.1; return; }
        if (/whip pan/.test(n)) { var adj = addAdjust(comp, "Whip"); var db = addBlur(adj, 0); if (db) { var bp = db.property(1); try { db.property("Blur Dimensions").setValue(2); } catch (e) {} bp.setValueAtTime(time - dur / 2, 0); bp.setValueAtTime(time, 120); bp.setValueAtTime(time + dur / 2, 0); easeProperty(bp, 70, 70); } adj.inPoint = time - dur; adj.outPoint = time + dur; addFlash(comp, time, BRAND.text, 0.08, 1); return; }
        if (/glitch|rgb split/.test(n)) { addFlash(comp, time, BRAND.primary, 0.1, 2); var g = addAdjust(comp, name); addBeatShake(g, time, 16); g.inPoint = time - 0.1; g.outPoint = time + 0.3; return; }
        if (/window push|window pull|app window|screenshot push/.test(n)) { addCameraBump(comp, time, 14); addFlash(comp, time, BRAND.primary, 0.14, 2); return; }
        var f = addSolid(comp, BRAND.bg, "Fade"); if (/blur|premium blur|dark tech/.test(n)) addBlur(f, 20); var fo = transformProps(f).opac; fo.setValueAtTime(time - dur / 2, 0); fo.setValueAtTime(time, 100); fo.setValueAtTime(time + dur / 2, 0); easeProperty(fo, 70, 70); f.inPoint = time - dur; f.outPoint = time + dur;
    }

    function ensureCameraRig(comp) {
        var cam = null; for (var i = 1; i <= comp.numLayers; i++) if (comp.layer(i) instanceof CameraLayer) { cam = comp.layer(i); break; }
        if (!cam) cam = comp.layers.addCamera("Camera", [comp.width / 2, comp.height / 2]);
        var ctrl = null; for (var j = 1; j <= comp.numLayers; j++) if (comp.layer(j).name === "Camera Controller") { ctrl = comp.layer(j); break; }
        if (!ctrl) { ctrl = addNull(comp, "Camera Controller"); ctrl.threeDLayer = true; try { cam.parent = ctrl; } catch (e) {} }
        return { cam: cam, ctrl: ctrl };
    }
    function applyCameraPreset(name, s) {
        var comp = activeComp(); if (!comp) return; var t0 = comp.time, dur = s.duration, n = name.toLowerCase(); ensureCameraRig(comp);
        var mover = addAdjust(comp, name); var tr = addTransformFX(mover); if (!tr) return; var sc = tr.property("Scale"), pos = tr.property("Position"), rot = tr.property("Rotation"); var base = sc.value;
        function scaleTo(mult, d, fast) { sc.setValueAtTime(t0, base); sc.setValueAtTime(t0 + d, [base[0] * mult, base[1] * mult]); easeProperty(sc, fast ? 40 : 85, fast ? 30 : 85); }
        if (/slow push|parallax push|final outro|macro/.test(n)) scaleTo(/macro/.test(n) ? 1.5 : 1.12, /final|slow/.test(n) ? dur * 3 : dur * 2, false);
        else if (/slow pull|pull back/.test(n)) { sc.setValueAtTime(t0, [base[0] * 1.3, base[1] * 1.3]); sc.setValueAtTime(t0 + dur * 2, base); easeProperty(sc, 85, 85); }
        else if (/fast zoom in|snap zoom|flash zoom/.test(n)) { scaleTo(1.4, dur, true); if (/flash/.test(n)) addFlash(comp, t0, BRAND.text, 0.12, 2); }
        else if (/fast zoom out/.test(n)) { sc.setValueAtTime(t0, [base[0] * 1.4, base[1] * 1.4]); sc.setValueAtTime(t0 + dur, base); easeProperty(sc, 40, 30); }
        else if (/bump|impact|marker hit|every 4/.test(n)) { sc.setValueAtTime(t0, base); sc.setValueAtTime(t0 + 0.06, [base[0] * 1.12, base[1] * 1.12]); sc.setValueAtTime(t0 + 0.28, base); easeProperty(sc, 70, 70); mover.outPoint = t0 + 0.4; }
        else if (/shake/.test(n)) { var amt = /hard|bass/.test(n) ? 24 : (/soft/.test(n) ? 8 : 16); var bp = pos.value; seed(CFG.seed); for (var i = 0; i < 6; i++) pos.setValueAtTime(t0 + i * 0.05, [bp[0] + (i === 5 ? 0 : rr(-amt, amt)), bp[1] + (i === 5 ? 0 : rr(-amt, amt))]); mover.outPoint = t0 + 0.4; }
        else if (/pan|slide up|slide down|whip/.test(n)) { var b2 = pos.value; var off = dirOffset(parseDir(name, "Left"), /whip/.test(n) ? 400 : 200); pos.setValueAtTime(t0, [b2[0] + off[0], b2[1] + off[1]]); pos.setValueAtTime(t0 + dur, b2); easeProperty(pos, /whip/.test(n) ? 40 : 85, /whip/.test(n) ? 30 : 85); if (/whip/.test(n)) addFlash(comp, t0, BRAND.text, 0.08, 1); }
        else if (/tilt|orbit/.test(n)) { var br = rot.value; rot.setValueAtTime(t0, br + (/down/.test(n) ? -6 : (/up/.test(n) ? 6 : -8))); rot.setValueAtTime(t0 + dur, br); easeProperty(rot, 85, 85); if (/orbit/.test(n)) scaleTo(1.08, dur, false); }
        else if (/drift|hover/.test(n)) { try { pos.expression = "wiggle(0.3, 20)"; } catch (e) {} }
        else if (/fly through/.test(n)) scaleTo(1.6, dur * 1.5, false);
        else scaleTo(1.1, dur * 2, false);
    }

    function markerTimes(comp) { var t = []; try { var mp = comp.markerProperty; for (var i = 1; i <= mp.numKeys; i++) t.push(mp.keyTime(i)); } catch (e) {} return t; }
    function addCompMarker(comp, t, txt) { comp.markerProperty.setValueAtTime(t, new MarkerValue(txt || "")); }
    function needMarkers(comp) { var m = markerTimes(comp); if (m.length === 0) { alert("No comp markers found.\nPlace markers on the beat (tap * on the numpad),\nor use the Comp Marker Bin > Add Default Beat Markers.", SCRIPT_NAME); return null; } return m; }

    function applyBeatSyncPreset(name, s) {
        var comp = activeComp(); if (!comp) return; var markers = needMarkers(comp); if (!markers) return;
        var layers = comp.selectedLayers; var n = name.toLowerCase(); seed(CFG.seed);
        for (var mi = 0; mi < markers.length; mi++) {
            var t = markers[mi] + CFG.markerOffset; var strong = ((mi + 1) % 4 === 0); var doIt = true;
            if (/every other|alternate/.test(n)) doIt = (mi % 2 === 0);
            if (/every 4|strong hit/.test(n)) doIt = ((mi + 1) % 4 === 0);
            if (/every 8|heavy/.test(n)) doIt = ((mi + 1) % 8 === 0);
            if (/between markers|micro flash/.test(n)) { if (mi < markers.length - 1) addFlash(comp, (markers[mi] + markers[mi + 1]) / 2, BRAND.text, 0.08, 1); continue; }
            if (/flash/.test(n)) { if (doIt) addFlash(comp, t, strong ? BRAND.primary : BRAND.text, strong ? 0.2 : 0.14, strong ? 3 : 1); continue; }
            if (/camera bump/.test(n)) { if (doIt) addCameraBump(comp, t, strong ? 16 : 10); continue; }
            if (/scene cut|auto scene/.test(n)) { applyTransitionPreset(t, "Hard Beat Cut", s); continue; }
            if (!layers || layers.length === 0) { if (mi === 0) alert("Select layers for this beat-sync preset (or use a flash/camera one).", SCRIPT_NAME); break; }
            for (var li = 0; li < layers.length; li++) { if (!doIt) continue; var tp = transformProps(layers[li]); var animLen = Math.max(0.15, s.duration * 0.6);
                if (/bounce|scale hit|pop|pulse|impact|window|shape|burst/.test(n)) { var base = tp.scale.valueAtTime(t, false); var pop = (strong ? 26 : 12) * (1 + 0.4 * CFG.bounce); tp.scale.setValueAtTime(t, base); tp.scale.setValueAtTime(t + animLen * 0.35, [base[0] * (1 + pop / 100), base[1] * (1 + pop / 100)]); tp.scale.setValueAtTime(t + animLen, base); easeProperty(tp.scale, 75, 75); }
                else if (/slide/.test(n)) { var dir = /alternate/.test(n) ? (mi % 2 === 0 ? "Left" : "Right") : "Left"; var restP = tp.pos.valueAtTime(t, false); var off = dirOffset(dir, 60); tp.pos.setValueAtTime(t, [restP[0] + off[0], restP[1] + off[1]]); tp.pos.setValueAtTime(t + animLen, restP); easeProperty(tp.pos, 60, 60); }
                else if (/glow pulse/.test(n)) { if (mi === 0) addGlow(layers[li], 30, 1.5, BRAND.primary); }
                else if (/blur hit/.test(n)) { var b = addBlur(layers[li], 0); if (b) { var bp = b.property(1); bp.setValueAtTime(t, 30); bp.setValueAtTime(t + animLen, 0); easeProperty(bp, 80, 80); } }
                else if (/random preset/.test(n)) { applyBouncePreset(layers[li], pick(BOUNCE), mergeS(s, { time: t })); }
                else { var b2 = tp.scale.valueAtTime(t, false); tp.scale.setValueAtTime(t, b2); tp.scale.setValueAtTime(t + animLen * 0.35, [b2[0] * 1.12, b2[1] * 1.12]); tp.scale.setValueAtTime(t + animLen, b2); easeProperty(tp.scale, 75, 75); }
            }
        }
    }

    function applyComboPreset(layer, name, s) {
        var comp = (layer && layer.containingComp) || activeComp(); if (!comp) return; var tokens = name.split("+"); var t0 = s.time;
        for (var i = 0; i < tokens.length; i++) { var tok = tokens[i].replace(/^\s+|\s+$/g, ""); var tl = tok.toLowerCase();
            if (/bounce/.test(tl)) applyBouncePreset(layer, "Bounce In", s);
            else if (/slide/.test(tl)) applySlidePreset(layer, tok, s);
            else if (/pop|scale/.test(tl)) applyPopPreset(layer, "Scale Pop", s);
            else if (/glow reveal|tracking|type-on|underline/.test(tl) && layer instanceof TextLayer) applyTextPreset(layer, tok, s);
            else if (/window|3d tilt|shine|glow border|cursor/.test(tl)) applyWindowPreset(layer, tok, s);
            else if (/glow/.test(tl)) addGlow(layer, 30, 1.6, styleColor());
            else if (/blur/.test(tl)) applyBlurPreset(layer, "Blur Reveal", s);
            else if (/flash|burst/.test(tl)) addFlash(comp, t0, /purple/.test(tl) ? BRAND.primary : flashColor(), 0.16, 3);
            else if (/camera/.test(tl)) { if (/push/.test(tl)) applyCameraPreset("Slow Push In", s); else addCameraBump(comp, t0, 12); }
            else if (/shake/.test(tl)) addBeatShake(layer, t0, 14);
            else if (/shadow/.test(tl)) addShadow(layer, 60, 150, 14);
            else if (/float|hover/.test(tl)) { try { transformProps(layer).pos.expression = "wiggle(0.5, 6)"; } catch (e) {} }
            else if (/fade/.test(tl)) applyFadePreset(layer, "Fade In", s);
        }
        try { layer.motionBlur = true; } catch (e) {}
    }

    /* ===================================================================== *
     *  15. PRESET LIBRARY  (universal names)
     * ===================================================================== */

    var BOUNCE = ["Bounce In", "Bounce Out", "Bounce Up", "Bounce Down", "Bounce Left", "Bounce Right", "Bounce Slide Up", "Bounce Slide Down", "Bounce Slide Left", "Bounce Slide Right", "Bounce Pop", "Bounce Scale", "Bounce Fade In", "Bounce Fade Out", "Bounce Zoom In", "Bounce Zoom Out", "Overshoot Bounce", "Soft Bounce", "Hard Bounce", "Elastic Bounce", "Tiny Bounce", "Heavy Bounce", "Double Bounce", "Beat Bounce", "Bass Bounce", "Card Bounce In", "Text Bounce In", "Window Bounce In", "Logo Bounce In", "Shape Bounce In", "Bounce With Glow", "Bounce With Flash", "Bounce With Blur", "Bounce Rotate", "Bounce Tilt", "Bounce Drop", "Bounce Rise", "Bounce Slam", "Bounce Pulse", "Bounce Settle", "Bounce Wiggle", "Bounce Spring", "Bounce Snap", "Bounce Impact", "Bounce Stagger", "Bounce Stack", "Bounce Loop", "Bounce Hover", "Bounce Button Press", "Bounce Browser Window"];
    var SLIDE = ["Slide In Up", "Slide In Down", "Slide In Left", "Slide In Right", "Slide Out Up", "Slide Out Down", "Slide Out Left", "Slide Out Right", "Slide Fade Up", "Slide Fade Down", "Slide Fade Left", "Slide Fade Right", "Fast Slide Up", "Fast Slide Down", "Fast Slide Left", "Fast Slide Right", "Smooth Slide Up", "Smooth Slide Down", "Smooth Slide Left", "Smooth Slide Right", "Snappy Slide Left", "Snappy Slide Right", "Slide With Blur", "Slide With Glow", "Slide With Bounce", "Slide With Flash", "Diagonal Slide Up Left", "Diagonal Slide Up Right", "Diagonal Slide Down Left", "Diagonal Slide Down Right", "Layered Slide In", "Staggered Slide In", "Card Slide In", "Window Slide In", "Text Slide In", "UI Panel Slide In", "Slide Push", "Slide Pull", "Slide Reveal", "Slide Mask", "Slide Into Frame", "Slide Out With Flash", "Slide Out With Blur", "Slide Stack", "Slide Carousel", "Slide App Window", "Slide Feature Card", "Slide Notification Card", "Slide Profile Card"];
    var POP = ["Scale Pop", "Soft Pop", "Hard Pop", "Tiny Pop", "Big Pop", "Text Pop", "Logo Pop", "Card Pop", "Window Pop", "Shape Pop", "Pop With Flash", "Pop With Glow", "Pop With Bounce", "Pop From 0", "Pop From 50", "Pop From 80", "Overshoot Pop", "Elastic Pop", "Beat Pop", "Bass Hit Pop", "Pulse Pop", "Double Pop", "Micro Pop", "Snap Pop", "Smooth Premium Pop", "UI Chip Pop", "Button Pop", "Notification Pop", "Profile Pop", "Window Zoom Pop", "Text Impact Pop", "Logo Impact Pop", "Card Stack Pop", "Center Pop", "Corner Pop", "Pop And Settle", "Pop With Blur", "Pop With Shadow", "Pop With Glow Ring", "Pop With Camera Bump", "Product Image Pop"];
    var FADE = ["Fade In", "Fade Out", "Fade Up", "Fade Down", "Fade Left", "Fade Right", "Slow Fade", "Fast Fade", "Fade With Blur", "Fade With Glow", "Fade With Scale", "Fade With Slide", "Fade With Bounce", "Flash Fade", "Premium Fade", "Apple Fade", "Dark Tech Fade", "Text Fade", "Window Fade", "Shape Fade", "Background Fade", "Fade To Black", "Fade From Black", "Fade To White", "Fade From White", "Glow Fade", "Soft Scene Fade", "Hard Scene Fade", "Marker Fade", "Beat Fade", "Fade And Push", "Fade And Rotate", "Fade With Shadow"];
    var BLUR = ["Blur In", "Blur Out", "Blur Fade In", "Blur Fade Out", "Blur Slide Up", "Blur Slide Down", "Blur Slide Left", "Blur Slide Right", "Blur Pop", "Fast Blur Hit", "Smooth Blur Reveal", "Cinematic Blur Reveal", "Zoom Blur", "Directional Blur Left", "Directional Blur Right", "Directional Blur Up", "Directional Blur Down", "Text Blur Reveal", "Window Blur Reveal", "Flash Blur", "Beat Blur", "Motion Blur Hit", "Blur With Glow", "Blur With Flash", "Blur With Bounce", "Blur Transition", "Blur Wipe", "Radial Blur Pop", "Blur Scene Cut", "Soft Focus Reveal", "Sharp Focus Reveal"];
    var TEXT = ["Kinetic Text Pop", "Text Bounce In", "Text Slide Up", "Text Slide Down", "Text Slide Left", "Text Slide Right", "Text Slam", "Text Impact", "Text Glow Reveal", "Text Blur Reveal", "Text Fade Up", "Text Fade Down", "Text Scale In", "Text Tracking Spread", "Text Tracking Tighten", "Word Pop", "Word Slide", "Word Bounce", "Word Flash", "Letter Pop", "Letter Reveal", "Letter Bounce", "Letter Slide", "Type-On Text", "Text Wipe Reveal", "Text With Purple Bar", "Text With Blue Bar", "Text Flash On Beat", "Text Shake On Beat", "Text Pulse Loop", "Clean Apple Text Reveal", "Fast TikTok Text Pop", "Premium Tech Text Reveal", "Big Hero Text", "CTA Text Pop", "Logo Text Reveal", "Text With Glow Ring", "Text With Underline Sweep", "Text With Background Pill", "Text Snap In", "Text Snap Out", "Text Hover Loop", "Text Bass Pulse"];
    var WINDOW = ["Floating Browser Window", "Rounded App Window", "Dark Tech Window", "Glow Window", "Glass Window", "Window Bounce In", "Window Slide Up", "Window Slide Down", "Window Slide Left", "Window Slide Right", "Window Zoom In", "Window Zoom Out", "Window Pop In", "Window Blur Reveal", "Window Flash Reveal", "Window 3D Tilt", "Window Slow Float", "Window Camera Push", "Window Stack", "Window Carousel", "Window With Glow Border", "Window With Shadow", "Window With Browser Dots", "Window With Cursor Click", "Window With Callout", "Window With Shine Sweep", "Window Feature Zoom", "Window Impact Hit", "Window Exit Blur", "Window Exit Slide", "Browser Window Reveal", "App Screenshot Hero", "Screenshot Premium Frame", "Screenshot Tilt Reveal", "Screenshot Push In", "Screenshot Pull Back", "Screenshot Hero Zoom", "Screenshot Card Stack", "App Store Style Reveal", "Product Reveal"];
    var SHAPE = ["Rounded Card In", "Rounded Card Bounce", "Rounded Card Slide", "Pill Slide In", "Pill Bounce In", "Circle Glow Pop", "Glow Ring Pulse", "Accent Bar", "Blue Accent Bar", "UI Chip Pop", "Background Blob Float", "Soft Gradient Card", "Shape Wipe Left", "Shape Wipe Right", "Shape Wipe Up", "Shape Wipe Down", "Rounded Mask Reveal", "Animated Border", "Neon Border Pulse", "Floating Dot Pack", "Grid Line Sweep", "Dark Background Glow", "Liquid Shape Move", "Abstract Shape Pack", "Feature Card Stack", "UI Card Stack", "Premium Background Shapes", "Beat Shape Pulse", "Floating Blob", "Glow Circle Background", "Rounded Rectangle Reveal", "Pill Text Background", "Profile Card Shape", "Post Card Shape", "Notification Card Shape", "App UI Card Shape", "Motion Trail Dots", "Corner Glow Shapes", "Edge Glow Shapes", "Shape Burst", "Glassmorphism Card Stack"];
    var FLASH = ["Soft White Flash", "Hard White Flash", "Purple Flash", "Blue Flash", "Glow Burst", "Edge Glow Flash", "Text Impact Flash", "Window Impact Flash", "Bass Hit Flash", "Beat Flash", "Fast Strobe", "Micro Flash", "Zoom Flash", "Blur Flash", "Flash With Shake", "Flash With Glow", "Flash Transition", "Clean Premium Flash", "Hype Edit Flash", "Light Sweep Flash", "Lens Flash", "UI Ripple Flash", "Background Flash", "Camera Flash Hit", "Logo Flash", "Screenshot Flash", "Card Flash", "Flash And Pop", "Flash And Slide", "Flash And Blur", "Flash Outro"];
    var TRANSITION = ["Fade Transition", "Blur Fade Transition", "White Flash Transition", "Purple Flash Transition", "Blue Flash Transition", "Slide Wipe Left", "Slide Wipe Right", "Slide Wipe Up", "Slide Wipe Down", "Rounded Rectangle Wipe", "Circle Reveal", "Zoom Flash Cut", "Whip Pan Left", "Whip Pan Right", "Glitch Cut", "RGB Split Cut", "UI Card Wipe", "Window Push Transition", "Window Pull Transition", "Glow Wipe", "Light Sweep Transition", "Hard Beat Cut", "Smooth Apple Fade", "Clean Premium Cut", "Fast Hype Cut", "Shape Wipe Transition", "Text Wipe Transition", "App Window Transition", "Card Stack Transition", "Dark Tech Transition", "Premium Blur Cut", "Bass Hit Transition", "Scene Flash Cut", "Scene Glow Cut"];
    var CAMERA = ["Slow Push In", "Slow Pull Out", "Fast Zoom In", "Fast Zoom Out", "Camera Bump", "Beat Camera Shake", "Bass Camera Shake", "Smooth Pan Left", "Smooth Pan Right", "Whip Pan Left", "Whip Pan Right", "3D Window Tilt", "Parallax Push", "UI Fly Through", "Macro Zoom", "Pull Back Reveal", "Final Outro Push", "Camera Drift", "Camera Hover", "Camera Impact", "Camera Shake Soft", "Camera Shake Hard", "Camera Slide Up", "Camera Slide Down", "Camera Orbit", "Camera Tilt Down", "Camera Tilt Up", "Camera Snap Zoom", "Camera Flash Zoom", "Camera Marker Hit"];
    var BEATSYNC = ["Bounce On Every Marker", "Pop On Every Marker", "Flash On Every Marker", "Text Pop On Markers", "Window Zoom On Markers", "Shape Pulse On Markers", "Camera Bump On Markers", "Strong Hit Every 4 Markers", "Alternate Slide Directions On Markers", "Random Preset On Markers", "Micro Flash Between Markers", "Auto Scene Cut On Markers", "Glow Pulse On Markers", "Blur Hit On Markers", "Scale Hit On Markers", "Slide Hit On Markers", "Flash Every Other Marker", "Heavy Hit Every 8 Markers", "Hype Edit Markers", "Clean Premium Markers", "Window Impact On Markers", "Shape Burst On Markers", "Logo Pulse On Markers"];
    var COMBO = ["Bounce In + Glow", "Slide Left + Blur + Flash", "Text Pop + Glow Reveal", "Window Zoom + Shine + Camera Push", "Pop + Flash + Camera Bump", "Fade + Slide + Glow", "Bounce + Rotate + Flash", "Blur Reveal + Glow", "Card Pop + Shadow + Float", "Text Slam + Flash + Shake", "Window Slide + Glow Border + Cursor", "Scale Pop + Burst", "Slide Up + Bounce Settle", "Glow Reveal + Tracking Spread", "Flash Cut + Camera Bump", "Bounce Stack + Stagger", "Window 3D Tilt + Shine", "Text Type-On + Underline", "Pop + Blur + Glow Ring", "Slide + Flash + Blur Hit"];
    var SCENES = ["Logo / Hook Scene", "Main Statement Scene", "Product / Screenshot Reveal Scene", "Feature / Value Scene", "Community / Social Proof Scene", "Extra Feature Scene", "Final CTA Scene"];

    var CATEGORIES = { "Bounce": BOUNCE, "Slide": SLIDE, "Pop / Scale": POP, "Fade": FADE, "Blur": BLUR, "Text": TEXT, "Window / Screenshot": WINDOW, "Shape": SHAPE, "Flash / Impact": FLASH, "Transition": TRANSITION, "Camera": CAMERA, "Beat Sync": BEATSYNC, "Combo Presets": COMBO, "Full Scene Presets": SCENES };
    var CATEGORY_ORDER = ["Bounce", "Slide", "Pop / Scale", "Fade", "Blur", "Text", "Window / Screenshot", "Shape", "Flash / Impact", "Transition", "Camera", "Beat Sync", "Combo Presets", "Full Scene Presets"];
    function namedPresetCount() { var n = 0; for (var k in CATEGORIES) if (CATEGORIES.hasOwnProperty(k)) n += CATEGORIES[k].length; return n; }
    function combinationCount() { return 12 * 11 * 8 * 4 * 4 * 4 * 4 * 6 * 5; }
    function formatThousands(n) { var s = "" + n, out = "", c = 0; for (var i = s.length - 1; i >= 0; i--) { out = s.charAt(i) + out; if (++c % 3 === 0 && i > 0) out = "," + out; } return out; }

    /* ===================================================================== *
     *  16. COMP MARKER BIN
     * ===================================================================== */

    function getCompMarkers(comp) {
        var out = []; try { var mp = comp.markerProperty; for (var i = 1; i <= mp.numKeys; i++) out.push({ time: mp.keyTime(i), comment: (mp.keyValue(i).comment || ""), index: i }); } catch (e) {}
        out.sort(function (a, b) { return a.time - b.time; }); for (var j = 0; j < out.length; j++) out[j].index = j + 1; return out;
    }
    function generateDefaultMarkers(comp, step) {
        step = step || 0.5; var count = Math.round(comp.duration / step);
        for (var i = 0; i < count; i++) { var idx = i + 1, cmt = "Beat"; if (idx % 8 === 0) cmt = "Drop"; else if (idx % 4 === 0) cmt = "Strong Hit"; addCompMarker(comp, i * step, cmt); }
    }
    function markersInRange(markers, t0, t1) { var o = []; for (var i = 0; i < markers.length; i++) if (markers[i].time >= t0 - 1e-4 && markers[i].time < t1 - 1e-4) o.push(markers[i]); return o; }
    function mAt(wm, k, fb) { return wm.length ? wm[Math.min(k, wm.length - 1)].time : fb; }
    function mLabel(wm, k) { return wm.length ? ("M" + wm[Math.min(k, wm.length - 1)].index) : "M?"; }
    // Assign a role to a marker: respect the user's comment first, else derive from index.
    function roleForMarker(mk, total) {
        var c = (mk.comment || "").toLowerCase();
        if (/drop/.test(c)) return "Drop"; if (/scene|change/.test(c)) return "Scene Change"; if (/strong|hit/.test(c)) return "Strong Hit";
        if (/camera/.test(c)) return "Camera Bump"; if (/window/.test(c)) return "Window Hit"; if (/flash/.test(c)) return "Flash";
        if (/text/.test(c)) return "Text Pop"; if (/outro|final|end/.test(c)) return "Outro Hit";
        var idx = mk.index;
        if (idx > total - 2) return "Outro Hit";
        if (idx % 8 === 0) return "Scene Change"; if (idx % 4 === 0) return "Strong Hit"; if (idx % 2 === 0) return "Text Pop"; return "Beat";
    }
    function sceneForTime(t) { var b = [4, 8, 12, 16, 20, 25, 30]; for (var i = 0; i < b.length; i++) if (t < b[i]) return i + 1; return 7; }
    // Rebuild MARKERBIN from the active comp.
    function scanMarkerBin() {
        var comp = activeComp(); if (!comp) return null;
        var mk = getCompMarkers(comp); MARKERBIN = [];
        for (var i = 0; i < mk.length; i++) { var role = roleForMarker(mk[i], mk.length); MARKERBIN.push({ index: mk[i].index, time: mk[i].time, comment: mk[i].comment, role: role, scene: sceneForTime(mk[i].time), action: ROLE_ACTIONS[role] || "" }); }
        return MARKERBIN;
    }
    function clearGeneratedMarkers() {
        var comp = activeComp(); if (!comp) return;
        undoable("Clear Generated Markers", function () { var mp = comp.markerProperty; for (var i = mp.numKeys; i >= 1; i--) { var c = (mp.keyValue(i).comment || "").toLowerCase(); if (/beat|strong|drop|scene|flash|text pop|camera|window|outro/.test(c) || c === "") mp.removeKey(i); } });
        scanMarkerBin();
    }
    // Apply the mapped action for one marker role at time t. Pulls queued text in order.
    var _queuePtr = 0;
    function doRoleAction(comp, role, action, t, s) {
        var a = (action || "").toLowerCase();
        if (role === "Text Pop" || /text/.test(a)) { var line = QUEUE.length ? QUEUE[_queuePtr % QUEUE.length] : null; _queuePtr++; var txt = line ? T(line.text) : "Text " + _queuePtr; var preset = /slam/.test(a) ? "Text Slam" : (/slide/.test(a) ? "Text Slide Up" : (/word/.test(a) ? "Word Pop" : "Text Bounce In")); var tl = renameLayer(addTextLayer(comp, txt, 96, BRAND.text), "Text Moment " + _queuePtr); transformProps(tl).opac.setValueAtTime(Math.max(0, t - 0.05), 0); applyTextPreset(tl, preset, mergeS(s, { time: t })); tl.inPoint = Math.max(0, t - 0.15); return; }
        if (role === "Flash" || /flash/.test(a)) { applyFlashPreset(t, /purple/.test(a) ? "Purple Flash" : (/white/.test(a) ? "White Flash" : (/micro/.test(a) ? "Micro Flash" : "Beat Flash")), s); return; }
        if (role === "Strong Hit") { if (/zoom/.test(a)) applyFlashPreset(t, "Zoom Flash", s); else if (/glow/.test(a)) applyFlashPreset(t, "Glow Burst", s); else if (/shake/.test(a)) { var sl = comp.selectedLayers[0]; if (sl) addBeatShake(sl, t, 16); addFlash(comp, t, BRAND.primary, 0.14, 2); } else { addFlash(comp, t, BRAND.primary, 0.18, 3); addCameraBump(comp, t, 12); } return; }
        if (role === "Camera Bump" || /camera bump/.test(a)) { addCameraBump(comp, t, 12); return; }
        if (role === "Window Hit" || /window/.test(a)) { addCameraBump(comp, t, 8); addFlash(comp, t, BRAND.primary, 0.14, 2); return; }
        if (role === "Scene Change") { if (/blur/.test(a)) applyTransitionPreset(t, "Blur Fade Transition", s); else if (/push/.test(a)) applyTransitionPreset(t, "Window Push Transition", s); else if (/apple|smooth/.test(a)) applyTransitionPreset(t, "Smooth Apple Fade", s); else applyTransitionPreset(t, "White Flash Transition", s); return; }
        if (role === "Drop") { addFlash(comp, t, BRAND.text, 0.22, 3); cameraPush(comp, t, 1.2, 1.12, "Camera Push"); return; }
        if (role === "Outro Hit") { var ring = addCircle(comp, 500, BRAND.primary, "Outro Glow Ring"); centerLayer(ring, comp); zeroFill(ring); addStroke(ring, BRAND.glow, 12); addGlow(ring, 60, 2, BRAND.glow); var rs = transformProps(ring).scale; rs.setValueAtTime(t, [40, 40]); rs.setValueAtTime(t + 1, [140, 140]); var ro = transformProps(ring).opac; ro.setValueAtTime(t, 90); ro.setValueAtTime(t + 1, 0); return; }
        // Beat / Custom: subtle pop or micro flash.
        if (/glow pulse/.test(a)) { var sl2 = comp.selectedLayers[0]; if (sl2) addGlow(sl2, 26, 1.4, BRAND.primary); }
        else if (/shape pulse/.test(a)) { var cc = addCircle(comp, 120, BRAND.primary, "Beat Pulse"); centerLayer(cc, comp); transformProps(cc).opac.setValue(0); var co = transformProps(cc).opac; co.setValueAtTime(t, 40); co.setValueAtTime(t + 0.2, 0); }
        else if (/micro flash/.test(a)) { addFlash(comp, t, BRAND.primary, 0.08, 1); }
        else { var sl3 = comp.selectedLayers[0]; if (sl3) { var tp = transformProps(sl3); var b = tp.scale.valueAtTime(t, false); tp.scale.setValueAtTime(t, b); tp.scale.setValueAtTime(t + 0.12, [b[0] * 1.06, b[1] * 1.06]); tp.scale.setValueAtTime(t + 0.28, b); } else addFlash(comp, t, BRAND.primary, 0.08, 1); }
    }
    function applyMarkerActions() {
        var comp = activeComp(); if (!comp) return; if (!needMarkers(comp)) return;
        scanMarkerBin(); _queuePtr = 0; var s = buildSettings();
        undoable("Apply Marker Actions", function () { for (var i = 0; i < MARKERBIN.length; i++) doRoleAction(comp, MARKERBIN[i].role, MARKERBIN[i].action, MARKERBIN[i].time + CFG.markerOffset, s); });
    }

    /* ===================================================================== *
     *  17. TEXT QUEUE
     * ===================================================================== */

    var TEXT_PRESET_CYCLE = ["Text Bounce In", "Text Slide Up", "Snap Pop", "Text Slam", "Text Glow Reveal", "Text Blur Reveal", "Word Pop", "Text Tracking Spread", "Premium Fade Up"];
    function loadTextQueueFromPack(packName) {
        var pack = TEXT_PACKS[packName] || TEXT_PACKS["Universal Text Pack"]; QUEUE = []; var p = 0;
        for (var sc = 0; sc < pack.length; sc++) for (var li = 0; li < pack[sc].length; li++) { if (!pack[sc][li]) continue; QUEUE.push({ text: pack[sc][li], scene: sc + 1, preset: TEXT_PRESET_CYCLE[p % TEXT_PRESET_CYCLE.length] }); p++; }
        return QUEUE;
    }
    function queueScenes() {   // group QUEUE text by scene -> [ [lines...] x7 ]
        var g = [[], [], [], [], [], [], []];
        for (var i = 0; i < QUEUE.length; i++) { var sc = clamp(QUEUE[i].scene, 1, 7) - 1; g[sc].push(T(QUEUE[i].text)); }
        return g;
    }
    function activePromoScenes() {
        if (QUEUE.length) { var g = queueScenes(); var any = false; for (var i = 0; i < 7; i++) if (g[i].length) any = true; if (any) return g; }
        var pack = TEXT_PACKS[STATE.textPack] || TEXT_PACKS["Universal Text Pack"]; var out = [];
        for (var s2 = 0; s2 < 7; s2++) { var arr = pack[s2] || []; var lines = []; for (var l = 0; l < arr.length; l++) if (arr[l]) lines.push(T(arr[l])); out.push(lines); } return out;
    }
    function syncTextToMarkers(mode) {
        var comp = activeComp(); if (!comp) return; var markers = getCompMarkers(comp); if (!markers.length) { alert("No comp markers. Add markers first (Comp Marker Bin).", SCRIPT_NAME); return; }
        if (!QUEUE.length) loadTextQueueFromPack(STATE.textPack);
        var s = buildSettings();
        undoable("Sync Text To Markers", function () {
            var targets = [];
            if (mode === "strong") { for (var i = 0; i < markers.length; i++) if ((markers[i].index) % 4 === 0) targets.push(markers[i]); }
            else if (mode === "scene") { var scn = [4, 8, 12, 16, 20, 25, 30]; for (var q = 0; q < QUEUE.length; q++) { var sc = clamp(QUEUE[q].scene, 1, 7); var winStart = sc === 1 ? 0 : scn[sc - 2]; var inW = markersInRange(markers, winStart, scn[sc - 1]); targets.push(inW.length ? inW[Math.min(q, inW.length - 1)] : { time: winStart }); } }
            else { targets = markers; }
            for (var k = 0; k < QUEUE.length; k++) {
                var mk = targets[Math.min(k, targets.length - 1)]; if (!mk) break; var t = mk.time + CFG.markerOffset;
                var preset = QUEUE[k].preset || TEXT_PRESET_CYCLE[k % TEXT_PRESET_CYCLE.length];
                var outT = (targets[k + 1] ? targets[k + 1].time - 0.1 : t + 1.6);
                var tl = renameLayer(addTextLayer(comp, T(QUEUE[k].text), 96, BRAND.text), "Text Moment " + (k + 1));
                transformProps(tl).pos.setValue([comp.width / 2, comp.height * 0.5]);
                transformProps(tl).opac.setValueAtTime(Math.max(0, t - 0.05), 0);
                applyTextPreset(tl, preset, mergeS(s, { time: t }));
                if (outT > t + 0.4) { var op = transformProps(tl).opac; op.setValueAtTime(outT - 0.35, 100); op.setValueAtTime(outT, 0); easeProperty(op, 75, 75); }
                tl.inPoint = Math.max(0, t - 0.15); tl.outPoint = Math.min(comp.duration, outT + 0.25);
            }
        });
    }

    /* ===================================================================== *
     *  18. PROJECT ASSETS
     * ===================================================================== */

    function assetFromSelected(slotKey) {
        var comp = activeComp(); if (!comp) return; var sel = comp.selectedLayers;
        if (!sel || !sel.length) { alert("Select a layer first, then assign it to a slot.", SCRIPT_NAME); return; }
        var L = sel[0]; var a = { source: null, name: L.name, text: null };
        try { if (L instanceof TextLayer) a.text = getTextString(L, ""); else if (L.source) a.source = L.source; } catch (e) {}
        ASSETS[slotKey] = a; if (typeof refreshAssetUI === "function") refreshAssetUI();
        alert("Assigned '" + a.name + "' to slot: " + slotKey, SCRIPT_NAME);
    }
    function clearAssets() { for (var k in ASSETS) if (ASSETS.hasOwnProperty(k)) ASSETS[k] = null; if (typeof refreshAssetUI === "function") refreshAssetUI(); }
    function slotFor(idx) {   // choose an asset slot for a scene index
        if (idx === 0 || idx === 6) return ASSETS.logo;
        if (idx === 2) return ASSETS.shot1 || ASSETS.product;
        if (idx === 3) return ASSETS.shot2;
        if (idx === 4) return ASSETS.shot3;
        if (idx === 5) return ASSETS.shot2 || ASSETS.product || ASSETS.shot1;
        return null;
    }
    function buildWindowFromSlot(slotKey) {
        var comp = activeComp(); if (!comp) { alert("Open a comp first.", SCRIPT_NAME); return; }
        var slot = ASSETS[slotKey]; var s = buildSettings();
        undoable("Build Window From Slot", function () { buildWindow(comp, "App Window", { inT: comp.time, dotsT: comp.time + 0.4, glowT: comp.time + 0.7, zoomT: comp.time + 1.4, shine: true, cursorT: comp.time + 1.8 }, s, slot && slot.source ? slot : null); });
    }

    /* ===================================================================== *
     *  19. 30-SECOND PROMO BUILDER
     * ===================================================================== */

    function fmtTime(sec) { var m = Math.floor(sec / 60); var ss = (sec - m * 60); return m + ":" + (ss < 10 ? "0" : "") + ss.toFixed(1); }
    function renameFlashLayer(f, nm) { return renameLayer(f, nm); }
    function motionBackground(comp) {
        var bg = addSolid(comp, BRAND.bg, "Motion Background"); bg.moveToEnd();
        var blobs = [[BRAND.primary, 0.25, 0.32, 900], [BRAND.accent, 0.78, 0.62, 820], [BRAND.primary, 0.55, 0.86, 720]];
        for (var i = 0; i < blobs.length; i++) { var b = addCircle(comp, blobs[i][3], blobs[i][0], "BG Glow Blob " + (i + 1)); transformProps(b).pos.setValue([comp.width * blobs[i][1], comp.height * blobs[i][2]]); transformProps(b).opac.setValue(22); addBlur(b, 160); try { transformProps(b).pos.expression = "wiggle(0.12, 40)"; } catch (e) {} b.moveAfter(bg); }
    }
    function promoText(comp, layerName, text, size, posYFrac, inT, outT, preset, s) {
        if (!text) return null;
        var tl = renameLayer(addTextLayer(comp, text, size, BRAND.text), layerName);
        transformProps(tl).pos.setValue([comp.width / 2, comp.height * posYFrac]);
        transformProps(tl).opac.setValueAtTime(Math.max(0, inT - 0.05), 0);
        applyTextPreset(tl, preset, mergeS(s, { time: inT }));
        if (outT && outT > inT + 0.4) { var op = transformProps(tl).opac; op.setValueAtTime(outT - 0.35, 100); op.setValueAtTime(outT, 0); easeProperty(op, 75, 75); }
        tl.inPoint = Math.max(0, inT - 0.15); if (outT) tl.outPoint = Math.min(comp.duration, outT + 0.25); return tl;
    }
    function popCardAt(comp, name, size, pos, t, glowCol) { var cd = addRoundedRect(comp, size, 26, BRAND.card, name); addGlow(cd, 14, 1, glowCol || BRAND.primary); transformProps(cd).pos.setValue(pos); var op = transformProps(cd).opac; op.setValueAtTime(t - 0.05, 0); op.setValueAtTime(t, 100); bounceKeys(transformProps(cd).scale, t, 0.45, [0, 0], [100, 100], 1, 0.14); return cd; }
    function slideCardAt(comp, name, size, pos, t, off) { var cd = addRoundedRect(comp, size, 26, BRAND.card, name); addGlow(cd, 14, 1, BRAND.primary); transformProps(cd).pos.setValue(pos); var op = transformProps(cd).opac; op.setValueAtTime(t - 0.05, 0); anim2(op, t, 0.4, 0, 100, "Smooth"); anim2(transformProps(cd).pos, t, 0.5, [pos[0] + off[0], pos[1] + off[1]], pos, "Snappy"); return cd; }
    var TEXT_IN_PRESETS = ["Text Bounce In", "Text Slide Up", "Snap Pop", "Text Glow Reveal", "Premium Fade Up", "Word Pop"];

    // Generic scene: background accent + N text moments + N cards + strong-marker flashes.
    function promoScene(comp, idx, name, t0, t1, wm, texts, dens, s) {
        var W = comp.width, H = comp.height, lines = [];
        // special content
        if (idx === 0) return promoSceneLogo(comp, name, t0, t1, wm, texts, dens, s);
        if (idx === 2 || idx === 5) return promoSceneWindow(comp, idx, name, t0, t1, wm, texts, dens, s);
        if (idx === 6) return promoSceneCTA(comp, name, t0, t1, wm, texts, dens, s);
        // supporting cards (staggered)
        var cardN = Math.min(dens.cards, 6);
        for (var c = 0; c < cardN; c++) { var t = mAt(wm, c, t0 + c * 0.4); var yy = (idx % 2 === 0) ? 0.66 : 0.62; if (idx === 4) slideCardAt(comp, name + " - Card " + (c + 1), [300, 120], [W * (0.2 + c * 0.15), H * yy], t, [0, 120]); else popCardAt(comp, name + " - Card " + (c + 1), [320, 190], [W * (0.22 + c * 0.16), H * yy], t, (c % 2 ? BRAND.accent : BRAND.primary)); }
        // text moments
        var tN = Math.min(dens.texts, texts.length); var yPos = [0.28, 0.44, 0.6, 0.5, 0.86];
        for (var i = 0; i < tN; i++) { var inT = mAt(wm, i, t0 + i * 0.6); var outT = (i + 1 < tN) ? mAt(wm, i + 1, inT + 1.2) - 0.1 : t1 - 0.15; promoText(comp, name + " - Text " + (i + 1), texts[i], i === 0 ? 118 : 74, yPos[Math.min(i, yPos.length - 1)], inT, outT, TEXT_IN_PRESETS[i % TEXT_IN_PRESETS.length], s); lines.push(mLabel(wm, i) + ": '" + texts[i] + "'"); }
        // camera + flashes
        if (idx === 1 || idx === 4) cameraPush(comp, t0, t1 - t0, 1.08, name + " - Camera Push");
        if (dens.flash) for (var mI = 0; mI < wm.length; mI++) if (wm[mI].index % 4 === 0) renameFlashLayer(addFlash(comp, wm[mI].time, BRAND.text, 0.12, 2), name + " - Strong Hit " + wm[mI].index);
        return lines.join(" | ") + " | supporting cards + camera + strong-hit flashes";
    }
    function promoSceneLogo(comp, name, t0, t1, wm, texts, dens, s) {
        var W = comp.width, H = comp.height;
        var m1 = mAt(wm, 0, t0), m2 = mAt(wm, 1, t0 + 0.5), m3 = mAt(wm, 2, t0 + 1), m4 = mAt(wm, 3, t0 + 1.5), m5 = mAt(wm, 4, t0 + 2);
        var logoTxt = texts[0] || BRAND.name;
        var logo = renameLayer((ASSETS.logo && ASSETS.logo.source) ? placeAsset(ASSETS.logo, comp) : addTextLayer(comp, logoTxt, 220, BRAND.text), "SCENE 01 - Logo");
        if (ASSETS.logo && ASSETS.logo.source) centerLayer(logo, comp);
        transformProps(logo).pos.setValue([W / 2, H * 0.45]);
        var glow = renameLayer(addCircle(comp, 620, BRAND.primary, "SCENE 01 - Logo Glow"), "SCENE 01 - Logo Glow"); transformProps(glow).pos.setValue([W / 2, H * 0.45]); transformProps(glow).opac.setValue(24); addBlur(glow, 150); glow.moveAfter(logo);
        addGlow(logo, 60, 2, BRAND.primary); transformProps(logo).opac.setValueAtTime(Math.max(0, m1 - 0.05), 0); applyPopPreset(logo, "Logo Impact Pop", mergeS(s, { time: m1 }));
        // particles / dots
        seed(CFG.seed); var parN = dens.micro > 0 ? 10 : 5; for (var d = 0; d < parN; d++) { var dt = addCircle(comp, rr(8, 22), BRAND.glow, "SCENE 01 - Particles " + (d + 1)); transformProps(dt).pos.setValue([rr(W * 0.2, W * 0.8), rr(H * 0.2, H * 0.8)]); transformProps(dt).opac.setValue(rr(30, 80)); try { transformProps(dt).pos.expression = "wiggle(0.3, 40)"; } catch (e) {} }
        // rounded shapes slide in
        for (var i = 0; i < Math.min(dens.cards, 3); i++) slideCardAt(comp, "SCENE 01 - Rounded Shapes " + (i + 1), [220, 140], [W * (0.3 + i * 0.2), H * 0.72], m3 + i * 0.08, [0, 160]);
        // logo pulse on m2
        var ls = transformProps(logo).scale; ls.setValueAtTime(m2, [100, 100]); ls.setValueAtTime(m2 + 0.4, [116, 116]); ls.setValueAtTime(m2 + 0.8, [100, 100]); easeProperty(ls, 70, 70);
        if (texts[1]) promoText(comp, "SCENE 01 - Subtitle", texts[1], 74, 0.62, m4, t1 - 0.15, "Slide Up", s);
        renameFlashLayer(addFlash(comp, t1 - 0.1, BRAND.text, 0.16, 2), "SCENE 01 - Transition Flash");
        animateOutLayer(logo, t1 - 0.1, 0.35);
        return mLabel(wm, 0) + ": logo pop + glow | " + mLabel(wm, 1) + ": logo pulse | " + mLabel(wm, 2) + ": shapes slide | " + mLabel(wm, 3) + ": subtitle | end: flash transition";
    }
    function promoSceneWindow(comp, idx, name, t0, t1, wm, texts, dens, s) {
        var m1 = mAt(wm, 0, t0), m2 = mAt(wm, 1, t0 + 0.5), m3 = mAt(wm, 2, t0 + 1), m4 = mAt(wm, 3, t0 + 1.5), m5 = mAt(wm, 4, t0 + 2), m6 = mAt(wm, 5, t0 + 2.5), m7 = mAt(wm, 6, t0 + 3), m8 = mAt(wm, 7, t0 + 3.5);
        var slot = slotFor(idx);
        var win = buildWindow(comp, name.indexOf("SCENE") === 0 ? name.replace(/ -.*/, "") + " - Window" : "App Window", { inT: m1, dotsT: m2, glowT: m3, zoomT: m5, shine: dens.micro > 0, cursorT: dens.cards >= 4 ? m4 : 0 }, s, slot && slot.source ? slot : null);
        var yTop = 0.14; var tN = Math.min(dens.texts, texts.length);
        for (var i = 0; i < tN; i++) { var inT = mAt(wm, 3 + i * 2, t0 + 1.5 + i * 1.0); var outT = (i + 1 < tN) ? mAt(wm, 3 + (i + 1) * 2, inT + 1.0) - 0.1 : t1 - 0.15; promoText(comp, name + " - Text " + (i + 1), texts[i], 80, yTop, inT, outT, i === tN - 1 ? "Text Glow Reveal" : "Slide Up", s); }
        if (dens.cards >= 4) promoCallout(comp, win.ctrl, [win.center[0] + win.w / 2 - 40, win.center[1] - win.h / 2 + 10], "New", m7);
        if (idx === 5) { promoCallout(comp, win.ctrl, [win.center[0] - win.w / 2 + 20, win.center[1] - win.h / 2 - 10], "Feature", m3); cameraPush(comp, m1, t1 - m1, 1.08, name + " - Camera Push"); renameFlashLayer(addFlash(comp, m5, BRAND.primary, 0.2, 3), name + " - Purple Flash"); }
        renameFlashLayer(addFlash(comp, t1 - 0.1, BRAND.text, 0.16, 2), name + " - Transition Flash");
        return mLabel(wm, 0) + ": window slides in | " + mLabel(wm, 1) + ": dots pop | " + mLabel(wm, 2) + ": glow border | " + mLabel(wm, 4) + ": zoom | text synced to markers | end: flash";
    }
    function promoSceneCTA(comp, name, t0, t1, wm, texts, dens, s) {
        var W = comp.width, H = comp.height;
        var strongT = mAt(wm, 0, t0); for (var i = 0; i < wm.length; i++) if (wm[i].index % 4 === 0) { strongT = wm[i].time; break; }
        var nextT = mAt(wm, 2, strongT + 1);
        for (var b = 0; b < 4; b++) { var sh = addRoundedRect(comp, [180, 120], 24, b % 2 ? BRAND.accent : BRAND.primary, name + " - Shape " + (b + 1)); addGlow(sh, 16, 1, BRAND.primary); var from = [W * (0.15 + b * 0.23), H * (b % 2 ? 0.2 : 0.85)]; transformProps(sh).pos.setValue(from); anim2(transformProps(sh).pos, t0, 1.2, from, [W / 2, H / 2], "Cinematic"); anim2(transformProps(sh).opac, t0, 1.2, 60, 0, "Smooth"); }
        var ring = renameLayer(addCircle(comp, 500, BRAND.primary, name + " - Glow Ring"), name + " - Glow Ring"); zeroFill(ring); addStroke(ring, BRAND.glow, 14); addGlow(ring, 70, 2.2, BRAND.glow); transformProps(ring).pos.setValue([W / 2, H * 0.45]); var ro = transformProps(ring).opac; ro.setValueAtTime(strongT - 0.05, 0); ro.setValueAtTime(strongT, 90); ro.setValueAtTime(t1 - 0.6, 40); var rs = transformProps(ring).scale; rs.setValueAtTime(strongT, [40, 40]); rs.setValueAtTime(strongT + 1, [140, 140]); easeProperty(rs, 80, 80);
        var logo = renameLayer((ASSETS.outro && ASSETS.outro.source) ? placeAsset(ASSETS.outro, comp) : ((ASSETS.logo && ASSETS.logo.source) ? placeAsset(ASSETS.logo, comp) : addTextLayer(comp, texts[0] || ("Join " + BRAND.name), 150, BRAND.text)), name + " - Logo"); if ((ASSETS.outro && ASSETS.outro.source) || (ASSETS.logo && ASSETS.logo.source)) centerLayer(logo, comp);
        transformProps(logo).pos.setValue([W / 2, H * 0.42]); addGlow(logo, 55, 2.2, BRAND.primary); transformProps(logo).opac.setValueAtTime(Math.max(0, strongT - 0.05), 0); applyPopPreset(logo, "Pop With Glow Ring", mergeS(s, { time: strongT }));
        if (texts[1]) promoText(comp, name + " - CTA", texts[1], 96, 0.6, nextT, null, "Slide Up", s);
        cameraPush(comp, t0, t1 - t0 - 0.5, 1.12, name + " - Camera Push");
        renameFlashLayer(addFlash(comp, t1 - 0.5, BRAND.text, 0.14, 2), name + " - Final Flash");
        var fade = addSolid(comp, BRAND.bg, name + " - Fade To Black"); var fo = transformProps(fade).opac; fo.setValueAtTime(t1 - 0.5, 0); fo.setValueAtTime(t1, 100); easeProperty(fo, 80, 80); fade.inPoint = t1 - 0.6;
        return "strong marker: '" + (texts[0] || "CTA") + "' pop + glow ring | next: '" + (texts[1] || "") + "' | shapes pull inward | camera push | final flash | fade to black";
    }
    function animateOutLayer(layer, tEnd, dur) { var op = transformProps(layer).opac; op.setValueAtTime(tEnd - dur, 100); op.setValueAtTime(tEnd, 0); easeProperty(op, 75, 75); }

    function buildFullPromo() {
        undoable("Build Full 30s Promo", function () {
            var s = mergeS(buildSettings(), { duration: (STATE.density === "Insane" ? 0.28 : 0.42) });
            var W = 1920, H = 1080, FPS = 30, DUR = 30; var dens = densityObj();
            var srcComp = activeComp(true); var srcMarkers = srcComp ? getCompMarkers(srcComp) : [];
            var compName = STATE.projectName + " - 30s Edit";
            var comp = app.project.items.addComp(compName, W, H, 1, DUR, FPS); comp.openInViewer();
            motionBackground(comp);
            // markers per beat-sync mode
            var usedExisting = false;
            if (STATE.beatSyncMode === "Use Existing Comp Markers" && srcMarkers.length >= 4) { for (var m = 0; m < srcMarkers.length; m++) if (srcMarkers[m].time < DUR - 1e-4) addCompMarker(comp, srcMarkers[m].time, srcMarkers[m].comment || "Beat"); usedExisting = true; }
            else if (STATE.beatSyncMode === "Use Marker Bin Roles" && MARKERBIN.length >= 4) { for (var mb = 0; mb < MARKERBIN.length; mb++) if (MARKERBIN[mb].time < DUR - 1e-4) addCompMarker(comp, MARKERBIN[mb].time, MARKERBIN[mb].role); usedExisting = true; }
            else generateDefaultMarkers(comp, 0.5);
            var markers = getCompMarkers(comp);
            ensureCameraRig(comp);
            var texts = activePromoScenes();
            var sceneNames = ["SCENE 01 - Logo / Hook", "SCENE 02 - Main Statement", "SCENE 03 - Screenshot Reveal", "SCENE 04 - Feature / Value", "SCENE 05 - Community / Proof", "SCENE 06 - Extra Feature", "SCENE 07 - Final CTA"];
            var bounds = [0, 4, 8, 12, 16, 20, 25, 30];
            var recipe = [];
            for (var i = 0; i < 7; i++) { var wm = markersInRange(markers, bounds[i], bounds[i + 1]); var line = promoScene(comp, i, sceneNames[i], bounds[i], bounds[i + 1], wm, texts[i] || [], dens, s); recipe.push(sceneNames[i] + "\n" + fmtTime(bounds[i]) + " - " + fmtTime(bounds[i + 1]) + "\n" + line); if (i < 6) { renameFlashLayer(addFlash(comp, bounds[i + 1] - 0.05, BRAND.text, 0.2, 3), "Scene Transition Flash " + (i + 1)); addCameraBump(comp, bounds[i + 1], 12); } }
            // rhythm: strong pulse + bump on every 4th marker away from boundaries
            for (var mi = 0; mi < markers.length; mi++) { var role = markers[mi].index % 8 === 0 ? "drop" : (markers[mi].index % 4 === 0 ? "strong" : "beat"); var bt = markers[mi].time; var nearB = false; for (var bI = 0; bI < bounds.length; bI++) if (Math.abs(bt - bounds[bI]) < 0.2) nearB = true; if (nearB) continue; if (role === "strong" && dens.flash) { var f = addSolid(comp, BRAND.primary, "Strong Hit " + markers[mi].index); f.blendingMode = BlendingMode.ADD; var op = transformProps(f).opac; op.setValueAtTime(bt, 0); op.setValueAtTime(bt + 0.05, 20); op.setValueAtTime(bt + 0.18, 0); f.inPoint = bt - 0.03; f.outPoint = bt + 0.25; if (dens.micro > 1) addCameraBump(comp, bt, 6); } }
            var header = "Project: " + STATE.projectName + "  |  Profile: " + STATE.profile + "  |  Promo: " + STATE.promoType + "  |  Density: " + STATE.density + "\n" +
                "Brand: " + BRAND.name + "  |  CTA: " + BRAND.cta + "  |  Text pack: " + STATE.textPack + "\n" +
                (usedExisting ? "Using your markers (" + markers.length + ")." : "Default beat markers (" + markers.length + "): 0.5s beat / 2s strong / 4s scene.") + "\n" +
                "Every 4th marker = strong hit + camera bump. Every 8th / boundary = scene change. Screenshot window: SCENE 03" + (slotFor(5) ? " + SCENE 06" : "") + ". Final CTA: 0:25.\n";
            comp.comment = SCRIPT_NAME + " — 30-SECOND PROMO\n\n" + header + "\n" + recipe.join("\n\n");
            buildRecipeLayer(comp, header, recipe);
            alert("Built '" + compName + "'\n7 scenes, 30 seconds, " + markers.length + " comp markers.\nDensity: " + STATE.density + ".  Recipe layer: 'Motion Recipe'.", SCRIPT_NAME);
        });
    }

    function buildRecipeLayer(comp, header, recipeArr) {
        var text = "MOTION RECIPE\n\n" + header + "\n" + recipeArr.join("\n\n");
        var tl = renameLayer(addTextLayer(comp, text, 22, BRAND.glow), "Motion Recipe"); tl.enabled = false; tl.shy = true;
        try { var sp = tl.property("ADBE Text Properties").property("ADBE Text Document"); var td = sp.value; td.justification = ParagraphJustification.LEFT_JUSTIFY; sp.setValue(td); } catch (e) {}
        transformProps(tl).anchor.setValue([0, 0]); transformProps(tl).pos.setValue([70, 90]); return tl;
    }
    function exportRecipe() {
        var comp = activeComp(); if (!comp) return;
        undoable("Export Motion Recipe", function () {
            var lines = ["MOTION RECIPE", "Project: " + STATE.projectName, "Profile: " + STATE.profile + "   Promo type: " + STATE.promoType + "   Density: " + STATE.density,
                "Brand: " + BRAND.name + "   CTA: " + BRAND.cta + "   Text pack: " + STATE.textPack, "Comp: " + comp.name + "   " + fmtTime(comp.duration) + " @ " + comp.frameRate.toFixed(0) + "fps", ""];
            var slotsUsed = []; for (var k in ASSETS) if (ASSETS.hasOwnProperty(k) && ASSETS[k]) slotsUsed.push(k + "=" + ASSETS[k].name);
            lines.push("ASSET SLOTS: " + (slotsUsed.length ? slotsUsed.join(", ") : "(none — placeholders used)"), "");
            if (QUEUE.length) { lines.push("TEXT QUEUE:"); for (var q = 0; q < QUEUE.length; q++) lines.push("  S" + QUEUE[q].scene + "  " + T(QUEUE[q].text) + "  [" + QUEUE[q].preset + "]"); lines.push(""); }
            scanMarkerBin();
            if (MARKERBIN.length) { lines.push("MARKER ROLES / ACTIONS:"); for (var b = 0; b < MARKERBIN.length; b++) lines.push("  M" + MARKERBIN[b].index + "  " + fmtTime(MARKERBIN[b].time) + "  " + MARKERBIN[b].role + " -> " + MARKERBIN[b].action + "  (scene " + MARKERBIN[b].scene + ")"); lines.push(""); }
            lines.push("LAYERS:");
            for (var l = 1; l <= comp.numLayers; l++) { var ly = comp.layer(l); var tp = transformProps(ly); var a = []; if (tp.pos.numKeys) a.push("pos"); if (tp.scale.numKeys) a.push("scale"); if (tp.opac.numKeys) a.push("opacity"); lines.push("  " + ly.index + ". " + ly.name + "  [" + fmtTime(ly.inPoint) + "-" + fmtTime(ly.outPoint) + "]" + (a.length ? "  " + a.join(",") : "")); }
            if (comp.comment) lines.push("", "NOTES:", comp.comment);
            var report = lines.join("\n"); var saved = false;
            try { var f = File.saveDialog("Save motion recipe", "*.txt"); if (f) { f.open("w"); f.write(report); f.close(); saved = true; } } catch (e) {}
            buildRecipeLayer(comp, "", [report.replace("MOTION RECIPE\n", "")]);
            alert("Recipe exported" + (saved ? " to file + guide layer." : " as a guide text layer."), SCRIPT_NAME);
        });
    }

    /* ===================================================================== *
     *  20. PRESET PREVIEW + QA
     * ===================================================================== */

    function createDemoComp() {
        undoable("Create Preset Demo Comp", function () {
            var comp = app.project.items.addComp("Preset Demo", 1920, 1080, 1, 6, 30); comp.openInViewer();
            addSolid(comp, BRAND.bg, "Motion Background").moveToEnd();
            var t = renameLayer(addTextLayer(comp, "Text Sample", 120, BRAND.text), "Demo Text"); transformProps(t).pos.setValue([comp.width / 2, comp.height * 0.28]);
            var sh = renameLayer(addRoundedRect(comp, [420, 260], 30, BRAND.card, "Demo Shape"), "Demo Shape"); addGlow(sh, 20, 1, BRAND.primary); transformProps(sh).pos.setValue([comp.width * 0.3, comp.height * 0.62]);
            renameLayer(addRoundedRect(comp, [420, 260], 12, BRAND.card, "Demo Window Placeholder"), "Demo Window Placeholder");
            transformProps(comp.layer(1)).pos.setValue([comp.width * 0.7, comp.height * 0.62]);
            alert("Preset Demo comp created. Select a sample layer, pick a preset, and click Preview Selected Preset.", SCRIPT_NAME);
        });
    }
    function qaCheck() {
        var msg = []; var comp = activeComp(true);
        if (!comp) { alert("No comp open. Open or create a composition to start.\n(Tip: 30s Promo Builder > Build Full 30s Promo will create one.)", SCRIPT_NAME); return; }
        var mk = markerTimes(comp); msg.push(comp ? "Comp: " + comp.name + " (" + fmtTime(comp.duration) + ")" : "No comp");
        msg.push(mk.length ? (mk.length + " comp markers found.") : "No markers — click Add Default Beat Markers or tap * on the numpad.");
        var slots = 0, slotNames = []; for (var k in ASSETS) if (ASSETS.hasOwnProperty(k) && ASSETS[k]) { slots++; slotNames.push(k); }
        msg.push(slots ? ("Asset slots filled: " + slots + " (" + slotNames.join(", ") + ")") : "No asset slots filled — placeholders will be used.");
        msg.push(QUEUE.length ? ("Text queue: " + QUEUE.length + " lines loaded.") : "Text queue empty — will use '" + STATE.textPack + "'.");
        var hasCam = false; for (var i = 1; i <= comp.numLayers; i++) if (comp.layer(i) instanceof CameraLayer) hasCam = true;
        msg.push(hasCam ? "Camera present." : "No camera yet — camera presets/promo will create one.");
        var sel = comp.selectedLayers; msg.push((sel && sel.length) ? (sel.length + " layer(s) selected.") : "No layers selected (fine for shape/flash/scene presets).");
        var ready = mk.length > 0;
        msg.unshift(ready ? "READY to build promo." : "Almost ready — add markers first.");
        alert(msg.join("\n"), SCRIPT_NAME);
    }

    /* ===================================================================== *
     *  21. MASTER PRESET ROUTER + SETTINGS
     * ===================================================================== */

    function isLayerCategory(cat) { return cat === "Bounce" || cat === "Slide" || cat === "Pop / Scale" || cat === "Fade" || cat === "Blur" || cat === "Text" || cat === "Combo Presets"; }
    function applyOneLayerPreset(cat, name, layer, s) {
        switch (cat) { case "Bounce": applyBouncePreset(layer, name, s); break; case "Slide": applySlidePreset(layer, name, s); break; case "Pop / Scale": applyPopPreset(layer, name, s); break; case "Fade": applyFadePreset(layer, name, s); break; case "Blur": applyBlurPreset(layer, name, s); break; case "Text": applyTextPreset(layer, name, s); break; case "Combo Presets": applyComboPreset(layer, name, s); break; }
    }
    function applyPreset(cat, name, atTime) {
        var comp = activeComp(); if (!comp) return; var s = buildSettings(); var t = (atTime === null || atTime === undefined) ? comp.time : atTime; s.time = t;
        if (isLayerCategory(cat) && atTime === undefined && /marker|every beat|every 4|every 8|on beat/.test(name.toLowerCase())) { if (markerTimes(comp).length) { applyToMarkers(cat, name); return; } }
        undoable("Apply: " + name, function () {
            if (cat === "Window / Screenshot") { var sel = comp.selectedLayers; applyWindowPreset(sel && sel.length ? sel[0] : null, name, s); return; }
            if (cat === "Shape") { applyShapePreset(name, s); return; }
            if (cat === "Flash / Impact") { applyFlashPreset(t, name, s); return; }
            if (cat === "Transition") { applyTransitionPreset(t, name, s); return; }
            if (cat === "Camera") { applyCameraPreset(name, s); return; }
            if (cat === "Beat Sync") { applyBeatSyncPreset(name, s); return; }
            if (cat === "Full Scene Presets") { var texts = activePromoScenes(); var idxMap = { "Logo / Hook Scene": 0, "Main Statement Scene": 1, "Product / Screenshot Reveal Scene": 2, "Feature / Value Scene": 3, "Community / Social Proof Scene": 4, "Extra Feature Scene": 5, "Final CTA Scene": 6 }; var idx = idxMap[name] || 0; promoScene(comp, idx, name.replace(" Scene", ""), comp.time, comp.time + 4, markersInRange(getCompMarkers(comp), comp.time, comp.time + 4), texts[idx] || [], densityObj(), s); return; }
            var layers = comp.selectedLayers;
            if (!layers || layers.length === 0) { if (cat === "Text") { applyOneLayerPreset(cat, name, ensureTextLayer(comp, "Your text here"), s); return; } alert("Select at least one layer for this preset.", SCRIPT_NAME); return; }
            for (var i = 0; i < layers.length; i++) applyOneLayerPreset(cat, name, layers[i], mergeS(s, { time: t + (CFG.applyTo === "each" ? i * CFG.delay : 0) }));
        });
    }
    function applyToMarkers(cat, name) {
        var comp = activeComp(); if (!comp) return; var mk = needMarkers(comp); if (!mk) return; var s = buildSettings();
        undoable("Apply On Markers: " + name, function () {
            for (var i = 0; i < mk.length; i++) { var t = mk[i] + CFG.markerOffset;
                if (cat === "Flash / Impact") { applyFlashPreset(t, name, s); continue; }
                if (cat === "Transition") { applyTransitionPreset(t, name, s); continue; }
                if (cat === "Shape") { s.time = t; applyShapePreset(name, s); continue; }
                if (cat === "Camera") { comp.time = t; applyCameraPreset(name, s); continue; }
                if (cat === "Window / Screenshot") { var sel = comp.selectedLayers; applyWindowPreset(sel && sel.length ? sel[0] : null, name, mergeS(s, { time: t })); continue; }
                if (cat === "Beat Sync") { applyBeatSyncPreset(name, s); return; }
                var layers = comp.selectedLayers; if (!layers || !layers.length) { alert("Select layers to apply on markers.", SCRIPT_NAME); return; }
                for (var li = 0; li < layers.length; li++) applyOneLayerPreset(cat, name, layers[li], mergeS(s, { time: t }));
            }
        });
    }
    function applyRandomPreset(cat) { var arr = CATEGORIES[cat]; if (!arr) return; seed(CFG.seed + comboSalt()); var name = pick(arr); applyPreset(cat, name, undefined); return name; }
    function comboSalt() { var c = activeComp(true); return c ? Math.round(c.numLayers * 7 + c.duration * 13 + c.time * 30) : 3; }

    /* ===================================================================== *
     *  21b. ALIGN / CENTER TOOLS
     * ===================================================================== */

    // Center a layer's visual center to the comp center on X and/or Y,
    // preserving its anchor point (accounts for scale; ignores rotation/parent).
    function centerOneInComp(layer, comp, doX, doY) {
        var t = comp.time; var tp = transformProps(layer); var pos = tp.pos;
        var cur; try { cur = pos.valueAtTime(t, false); } catch (e) { return; }
        if (cur.length === undefined) return;   // separated dimensions — skip
        var target = cur.slice(0);
        var offX = 0, offY = 0;
        try {
            var rect = layer.sourceRectAtTime(t, false);
            var anchor = tp.anchor.valueAtTime(t, false); var scale = tp.scale.valueAtTime(t, false);
            var rcx = rect.left + rect.width / 2, rcy = rect.top + rect.height / 2;
            offX = (rcx - anchor[0]) * (scale[0] / 100); offY = (rcy - anchor[1]) * (scale[1] / 100);
        } catch (e) { offX = 0; offY = 0; }   // cameras/lights: center the position itself
        if (doX) target[0] = comp.width / 2 - offX;
        if (doY) target[1] = comp.height / 2 - offY;
        if (pos.numKeys > 0) pos.setValueAtTime(t, target); else pos.setValue(target);
    }
    function centerSelected(doX, doY, label) {
        var layers = selectedLayers(); if (!layers) return; var comp = layers[0].containingComp;
        undoable(label, function () { for (var i = 0; i < layers.length; i++) centerOneInComp(layers[i], comp, doX, doY); });
    }
    // Move the anchor to the layer's visual center without shifting the layer.
    function anchorToCenterOne(layer, comp) {
        var t = comp.time; var tp = transformProps(layer);
        var rect; try { rect = layer.sourceRectAtTime(t, false); } catch (e) { return; }
        var oldA = tp.anchor.value; var scale = tp.scale.value;
        var newA = [rect.left + rect.width / 2, rect.top + rect.height / 2]; if (oldA.length > 2) newA.push(oldA[2]);
        var dx = (newA[0] - oldA[0]) * (scale[0] / 100), dy = (newA[1] - oldA[1]) * (scale[1] / 100);
        tp.anchor.setValue(newA);
        if (tp.pos.numKeys === 0) { var pv = tp.pos.value; var np = pv.slice(0); np[0] += dx; np[1] += dy; tp.pos.setValue(np); }
    }
    function anchorToCenterSelected() {
        var layers = selectedLayers(); if (!layers) return; var comp = layers[0].containingComp;
        undoable("Anchor To Center", function () { for (var i = 0; i < layers.length; i++) anchorToCenterOne(layers[i], comp); });
    }

    var UI = {};
    var refreshAssetUI = null;   // set by buildUI; called after asset slot changes
    var refreshMarkerBin = null; // set by buildUI
    function buildSettings() {
        if (UI.dur) { CFG.duration = clamp(pf(UI.dur, ENERGY_DUR[CFG.energy] || 0.45), 0.05, 30); CFG.delay = pf(UI.delay, 0.08); CFG.distance = pf(UI.dist, 300); CFG.bounce = pf(UI.bounce, 1); CFG.glow = pf(UI.glow, 1); CFG.blur = pf(UI.blur, 1); CFG.flash = pf(UI.flash, 1); CFG.scale = pf(UI.scale, 100); CFG.rotation = pf(UI.rot, 15); CFG.markerOffset = pf(UI.off, 0); CFG.randomVar = pf(UI.rand, 20); CFG.seed = Math.round(pf(UI.seed, 12345)); }
        return { time: 0, duration: CFG.duration, delay: CFG.delay, distance: CFG.distance, bounce: CFG.bounce, glow: CFG.glow, blur: CFG.blur, flash: CFG.flash, scale: CFG.scale, rotation: CFG.rotation, markerOffset: CFG.markerOffset, seed: CFG.seed, easing: styleEasing(), color: styleColor() };
    }

    /* ===================================================================== *
     *  22. UI
     * ===================================================================== */

    function bigBtn(parent, label, fn) { var b = parent.add("button", undefined, label); b.alignment = ["fill", "center"]; b.onClick = fn; return b; }
    function trow(parent) { var g = parent.add("group"); g.orientation = "row"; g.alignChildren = ["fill", "center"]; g.spacing = 4; return g; }
    function field(parent, label, def, wLabel) { var g = parent.add("group"); g.orientation = "row"; g.alignChildren = ["left", "center"]; var st = g.add("statictext", undefined, label + ":"); st.preferredSize.width = wLabel || 150; var f = g.add("edittext", undefined, def); f.characters = 8; f.alignment = ["fill", "center"]; return f; }

    function buildUI(thisObj) {
        var win = (thisObj instanceof Panel) ? thisObj : new Window("palette", SCRIPT_NAME + " v" + VERSION, undefined, { resizeable: true });
        win.orientation = "column"; win.alignChildren = ["fill", "top"]; win.spacing = 6; win.margins = 8;
        var syncPromoControls = null;   // assigned in buildPromoTab

        var title = win.add("statictext", undefined, "◆ MOTION BUILDER PRO — universal motion design");
        try { title.graphics.font = ScriptUI.newFont("dialog", "BOLD", 14); } catch (e) {}
        var lib = win.add("statictext", undefined, "Library: " + namedPresetCount() + "+ named presets / " + formatThousands(combinationCount()) + "+ combinations");
        try { lib.graphics.font = ScriptUI.newFont("dialog", "ITALIC", 10); } catch (e) {}

        /* ---- Project + Brand ---- */
        var proj = win.add("panel", undefined, "Project & Brand"); proj.orientation = "column"; proj.alignChildren = ["fill", "top"]; proj.margins = 10; proj.spacing = 4;
        var pr0 = trow(proj); pr0.add("statictext", undefined, "Project Name:"); var nameF = pr0.add("edittext", undefined, STATE.projectName); nameF.alignment = ["fill", "center"];
        nameF.onChange = function () { STATE.projectName = nameF.text || "Motion Promo"; };
        var pr1 = trow(proj); pr1.add("statictext", undefined, "Profile:"); var profDD = pr1.add("dropdownlist", undefined, PROFILE_ORDER); profDD.selection = 0; profDD.alignment = ["fill", "center"];
        var pr2 = trow(proj); pr2.add("statictext", undefined, "Brand:"); var brandF = pr2.add("edittext", undefined, BRAND.name); brandF.alignment = ["fill", "center"]; pr2.add("statictext", undefined, "CTA:"); var ctaF = pr2.add("edittext", undefined, BRAND.cta); ctaF.alignment = ["fill", "center"];
        var pr3 = trow(proj); pr3.add("statictext", undefined, "Primary:"); var priF = pr3.add("edittext", undefined, BRAND.primaryHex); priF.characters = 8; pr3.add("statictext", undefined, "BG:"); var bgF = pr3.add("edittext", undefined, BRAND.bgHex); bgF.characters = 8; pr3.add("statictext", undefined, "Accent:"); var accF = pr3.add("edittext", undefined, BRAND.accentHex); accF.characters = 8; pr3.add("statictext", undefined, "Glow:"); var glF = pr3.add("edittext", undefined, BRAND.glowHex); glF.characters = 8;
        bigBtn(trow(proj), "Apply Brand Settings", function () { BRAND.name = brandF.text; BRAND.cta = ctaF.text; BRAND.primaryHex = priF.text; BRAND.bgHex = bgF.text; BRAND.accentHex = accF.text; BRAND.glowHex = glF.text; refreshBrandRGB(); alert("Brand settings applied.", SCRIPT_NAME); });
        function syncBrandFields() { brandF.text = BRAND.name; ctaF.text = BRAND.cta; priF.text = BRAND.primaryHex; bgF.text = BRAND.bgHex; accF.text = BRAND.accentHex; glF.text = BRAND.glowHex; }
        profDD.onChange = function () { STATE.profile = profDD.selection.text; applyProfile(STATE.profile); syncBrandFields(); if (typeof syncPromoControls === "function") syncPromoControls(); alert("Loaded profile: " + STATE.profile + "\nBrand '" + BRAND.name + "', text pack '" + STATE.textPack + "'.", SCRIPT_NAME); };

        /* ---- Easy Mode ---- */
        var easy = win.add("panel", undefined, "Easy Mode"); easy.orientation = "column"; easy.alignChildren = ["fill", "top"]; easy.margins = 10; easy.spacing = 4;
        var er = trow(easy); er.add("statictext", undefined, "Style:"); var styleDD = er.add("dropdownlist", undefined, ["Clean Premium", "Fast Hype", "Dark Tech", "Creator Energy", "Apple-Level Clean", "Crypto Project"]); styleDD.selection = 0; er.add("statictext", undefined, "Energy:"); var energyDD = er.add("dropdownlist", undefined, ["Clean", "Medium", "Hype", "Insane"]); energyDD.selection = 1;
        styleDD.onChange = function () { CFG.style = styleDD.selection.text; syncEnergy(); }; energyDD.onChange = function () { CFG.energy = energyDD.selection.text; syncEnergy(); };
        function syncEnergy() { var so = styleObj(); CFG.glow = so.glow; CFG.blur = so.blur; var em = ENERGY_MUL[CFG.energy] || ENERGY_MUL["Medium"]; CFG.flash = Math.round((so.flash || 1) * em.flash); CFG.bounce = Math.max(1, Math.round(em.bounce * 1.5)); CFG.duration = ENERGY_DUR[CFG.energy] || 0.45; if (UI.dur) { UI.dur.text = CFG.duration.toFixed(2); UI.glow.text = "" + CFG.glow; UI.flash.text = "" + CFG.flash; UI.bounce.text = "" + CFG.bounce; } }
        var eb = trow(easy); bigBtn(eb, "Build Full 30s Promo", buildFullPromo); bigBtn(eb, "Make Premium Window", makeScreenshotWindow);
        var eb2 = trow(easy); bigBtn(eb2, "Check Script Setup", qaCheck); bigBtn(eb2, "Export Motion Recipe", exportRecipe);

        /* ---- Align & Center (always visible) ---- */
        var ctr = win.add("panel", undefined, "Align & Center"); ctr.orientation = "column"; ctr.alignChildren = ["fill", "top"]; ctr.margins = 10; ctr.spacing = 4;
        var cr1 = trow(ctr);
        bigBtn(cr1, "Center", function () { centerSelected(true, true, "Center"); });
        bigBtn(cr1, "Center H", function () { centerSelected(true, false, "Center Horizontally"); });
        bigBtn(cr1, "Center V", function () { centerSelected(false, true, "Center Vertically"); });
        var cr2 = trow(ctr);
        bigBtn(cr2, "Anchor → Center", anchorToCenterSelected);
        var ctrHelp = ctr.add("statictext", undefined, "Select layer(s) → Center. Centers to comp middle at the current time.");
        try { ctrHelp.graphics.font = ScriptUI.newFont("dialog", "ITALIC", 10); } catch (e) {}

        /* ---- Advanced (collapsible) ---- */
        var adv = win.add("panel", undefined, "Advanced Controls"); adv.orientation = "column"; adv.alignChildren = ["fill", "top"]; adv.margins = 10; adv.spacing = 2;
        var advTog = adv.add("checkbox", undefined, "Show advanced controls"); var advBody = adv.add("group"); advBody.orientation = "column"; advBody.alignChildren = ["fill", "top"]; advBody.spacing = 2; advBody.visible = false;
        advTog.onClick = function () { advBody.visible = advTog.value; win.layout.layout(true); };
        UI.dur = field(advBody, "Duration (s)", "0.6"); UI.delay = field(advBody, "Delay / stagger (s)", "0.08"); UI.dist = field(advBody, "Distance (px)", "300"); UI.bounce = field(advBody, "Bounce amount", "1"); UI.glow = field(advBody, "Glow strength", "1"); UI.blur = field(advBody, "Blur amount", "1"); UI.flash = field(advBody, "Flash strength", "1"); UI.scale = field(advBody, "Scale amount (%)", "100"); UI.rot = field(advBody, "Rotation amount", "15"); UI.off = field(advBody, "Marker offset (s)", "0.0"); UI.rand = field(advBody, "Random variation (%)", "20"); UI.seed = field(advBody, "Random seed", "12345");
        var scopeG = trow(advBody); scopeG.add("statictext", undefined, "Apply to:"); var scopeDD = scopeG.add("dropdownlist", undefined, ["Each selected (stagger)", "All selected as group", "Markers"]); scopeDD.selection = 0; scopeDD.onChange = function () { CFG.applyTo = scopeDD.selection.index === 1 ? "all" : (scopeDD.selection.index === 2 ? "markers" : "each"); };

        /* ---- Preset Library ---- */
        var ps = win.add("panel", undefined, "Preset Library"); ps.orientation = "column"; ps.alignChildren = ["fill", "top"]; ps.margins = 10; ps.spacing = 4;
        var lr1 = trow(ps); lr1.add("statictext", undefined, "Category:"); var catDD = lr1.add("dropdownlist", undefined, CATEGORY_ORDER); catDD.selection = 0; catDD.preferredSize.width = 150;
        var lr2 = trow(ps); lr2.add("statictext", undefined, "Preset:"); var presetDD = lr2.add("dropdownlist", undefined, BOUNCE); presetDD.selection = 0; presetDD.alignment = ["fill", "center"];
        catDD.onChange = function () { var arr = CATEGORIES[catDD.selection.text]; presetDD.removeAll(); for (var i = 0; i < arr.length; i++) presetDD.add("item", arr[i]); presetDD.selection = 0; };
        var lr3 = trow(ps); bigBtn(lr3, "Apply Preset", function () { applyPreset(catDD.selection.text, presetDD.selection.text, undefined); }); bigBtn(lr3, "Apply Random", function () { var nm = applyRandomPreset(catDD.selection.text); if (nm) for (var i = 0; i < presetDD.items.length; i++) if (presetDD.items[i].text === nm) presetDD.selection = i; }); bigBtn(lr3, "Apply To Markers", function () { applyToMarkers(catDD.selection.text, presetDD.selection.text); });

        /* ---- Tabs ---- */
        var tp = win.add("tabbedpanel"); tp.alignChildren = ["fill", "fill"]; tp.preferredSize.height = 280;
        buildQuickTab(tp.add("tab", undefined, "Quick Build"));
        buildPromoTab(tp.add("tab", undefined, "30s Promo Builder"));
        buildMarkerTab(tp.add("tab", undefined, "Comp Marker Bin"));
        buildQueueTab(tp.add("tab", undefined, "Text Queue"));
        buildAssetsTab(tp.add("tab", undefined, "Project Assets"));
        makeCatTab(tp.add("tab", undefined, "Motion Presets"), ["Bounce", "Slide", "Pop / Scale", "Fade", "Blur", "Beat Sync", "Combo Presets"]);
        makeCatTab(tp.add("tab", undefined, "Text Presets"), ["Text"]);
        buildWindowTab(tp.add("tab", undefined, "Window Presets"));
        buildShapeTab(tp.add("tab", undefined, "Shape Presets"));
        makeCatTab(tp.add("tab", undefined, "Transitions"), ["Transition"]);
        makeCatTab(tp.add("tab", undefined, "Flash / Impact"), ["Flash / Impact"]);
        makeCatTab(tp.add("tab", undefined, "Camera"), ["Camera"]);
        buildPreviewTab(tp.add("tab", undefined, "Preset Preview"));
        buildExportTab(tp.add("tab", undefined, "Export Recipe"));

        var foot = win.add("statictext", undefined, "Pick a Profile, load a Text Pack, place markers, then Build. Every action is one undo step.");
        try { foot.graphics.font = ScriptUI.newFont("dialog", "ITALIC", 10); } catch (e) {}

        /* ============ tab builders ============ */
        function makeCatTab(tab, cats) {
            tab.orientation = "column"; tab.alignChildren = ["fill", "top"]; tab.margins = 10; tab.spacing = 4;
            var r1 = trow(tab); r1.add("statictext", undefined, "Category:"); var cDD = r1.add("dropdownlist", undefined, cats); cDD.selection = 0; cDD.preferredSize.width = 150;
            var r2 = trow(tab); r2.add("statictext", undefined, "Preset:"); var pDD = r2.add("dropdownlist", undefined, CATEGORIES[cats[0]]); pDD.selection = 0; pDD.alignment = ["fill", "center"];
            cDD.onChange = function () { var arr = CATEGORIES[cDD.selection.text]; pDD.removeAll(); for (var i = 0; i < arr.length; i++) pDD.add("item", arr[i]); pDD.selection = 0; };
            var r3 = trow(tab); bigBtn(r3, "Apply", function () { applyPreset(cDD.selection.text, pDD.selection.text, undefined); }); bigBtn(r3, "Random", function () { var nm = applyRandomPreset(cDD.selection.text); if (nm) for (var i = 0; i < pDD.items.length; i++) if (pDD.items[i].text === nm) pDD.selection = i; }); bigBtn(r3, "To Markers", function () { applyToMarkers(cDD.selection.text, pDD.selection.text); });
            return { cat: cDD, preset: pDD };
        }
        function buildQuickTab(tab) {
            tab.orientation = "column"; tab.alignChildren = ["fill", "top"]; tab.margins = 10; tab.spacing = 4;
            var r1 = trow(tab); bigBtn(r1, "Build Full 30s Promo", buildFullPromo); bigBtn(r1, "Make Premium Window", makeScreenshotWindow);
            var r2 = trow(tab); bigBtn(r2, "Add Shape Pack", function () { var c = activeComp(); if (c) addShapePack(c, "Clean Tech Shape Pack"); }); bigBtn(r2, "Apply Marker Actions", applyMarkerActions);
            var r3 = trow(tab); bigBtn(r3, "Flash Current Time", function () { var c = activeComp(); if (c) undoable("Flash", function () { applyFlashPreset(c.time, "Clean Premium Flash", buildSettings()); }); }); bigBtn(r3, "Flash All Markers", function () { applyToMarkers("Flash / Impact", "Beat Flash"); });
            var r4 = trow(tab); bigBtn(r4, "Sync Text To Markers", function () { syncTextToMarkers("every"); }); bigBtn(r4, "Check Script Setup", qaCheck);
        }
        function buildPromoTab(tab) {
            tab.orientation = "column"; tab.alignChildren = ["fill", "top"]; tab.margins = 10; tab.spacing = 3;
            var a = trow(tab); a.add("statictext", undefined, "Promo Style:"); var stD = a.add("dropdownlist", undefined, ["Clean Premium", "Fast Hype", "Dark Tech", "Creator Energy", "Apple-Level Clean", "Crypto Project"]); stD.selection = 0; stD.alignment = ["fill", "center"]; stD.onChange = function () { CFG.style = stD.selection.text; };
            var b = trow(tab); b.add("statictext", undefined, "Density:"); var deD = b.add("dropdownlist", undefined, ["Minimal", "Normal", "Full", "Insane"]); deD.selection = 2; deD.alignment = ["fill", "center"]; deD.onChange = function () { STATE.density = deD.selection.text; };
            var c = trow(tab); c.add("statictext", undefined, "Beat Sync Mode:"); var bsD = c.add("dropdownlist", undefined, ["Use Existing Comp Markers", "Generate Default Markers", "Use Marker Bin Roles"]); bsD.selection = 1; bsD.alignment = ["fill", "center"]; bsD.onChange = function () { STATE.beatSyncMode = bsD.selection.text; };
            var d = trow(tab); d.add("statictext", undefined, "Scene Mode:"); var scD = d.add("dropdownlist", undefined, ["Fixed 7 Scenes", "Marker-Based Scenes", "Auto From Scene Change Markers"]); scD.selection = 0; scD.alignment = ["fill", "center"]; scD.onChange = function () { STATE.sceneMode = scD.selection.text; };
            var e = trow(tab); e.add("statictext", undefined, "Promo Type:"); var ptD = e.add("dropdownlist", undefined, PROMO_TYPES); ptD.selection = 0; ptD.alignment = ["fill", "center"]; ptD.onChange = function () { STATE.promoType = ptD.selection.text; };
            syncPromoControls = function () { for (var i = 0; i < deD.items.length; i++) if (deD.items[i].text === STATE.density) deD.selection = i; for (var j = 0; j < ptD.items.length; j++) if (ptD.items[j].text === STATE.promoType) ptD.selection = j; };
            var g1 = trow(tab); bigBtn(g1, "Build Full 30s Promo", buildFullPromo); bigBtn(g1, "Export Promo Recipe", exportRecipe);
            var g2 = trow(tab); bigBtn(g2, "Make Promo More Premium", function () { CFG.style = "Apple-Level Clean"; CFG.energy = "Clean"; syncEnergy(); alert("Set to premium timing. Rebuild the promo for the new feel.", SCRIPT_NAME); }); bigBtn(g2, "Make Promo More Hype", function () { CFG.style = "Fast Hype"; CFG.energy = "Hype"; STATE.density = "Insane"; syncEnergy(); alert("Set to hype timing + Insane density. Rebuild the promo.", SCRIPT_NAME); });
            var g3 = trow(tab); bigBtn(g3, "Replace Text From Queue", function () { syncTextToMarkers("scene"); }); bigBtn(g3, "Replace Windows From Slots", function () { buildWindowFromSlot("shot1"); });
            var g4 = trow(tab); bigBtn(g4, "Re-sync Promo To Markers", function () { syncTextToMarkers("every"); });
        }
        function buildMarkerTab(tab) {
            tab.orientation = "column"; tab.alignChildren = ["fill", "top"]; tab.margins = 8; tab.spacing = 3;
            var count = tab.add("statictext", undefined, "Comp markers: 0");
            var lb = tab.add("listbox", undefined, [], { numberOfColumns: 6, showHeaders: true, columnTitles: ["#", "Time", "Comment", "Role", "Scene", "Action"], columnWidths: [26, 46, 110, 92, 44, 150] });
            lb.preferredSize.height = 120;
            refreshMarkerBin = function () { var c = activeComp(true); lb.removeAll(); if (!c) { count.text = "No comp open."; return; } scanMarkerBin(); count.text = "Comp markers: " + MARKERBIN.length; for (var i = 0; i < MARKERBIN.length; i++) { var m = MARKERBIN[i]; var it = lb.add("item", "" + m.index); it.subItems[0].text = fmtTime(m.time); it.subItems[1].text = m.comment; it.subItems[2].text = m.role; it.subItems[3].text = "S" + m.scene; it.subItems[4].text = m.action; } };
            var b1 = trow(tab); bigBtn(b1, "Scan Comp Markers", function () { refreshMarkerBin(); }); bigBtn(b1, "Auto Label Markers", function () { var c = activeComp(); if (!c) return; undoable("Auto Label Markers", function () { scanMarkerBin(); var mp = c.markerProperty; for (var i = 0; i < MARKERBIN.length; i++) { var mv = new MarkerValue(MARKERBIN[i].role); mp.setValueAtTime(MARKERBIN[i].time, mv); } }); refreshMarkerBin(); });
            var b2 = trow(tab); bigBtn(b2, "Add Default Beat Markers", function () { var c = activeComp(); if (!c) return; undoable("Add Default Beat Markers", function () { generateDefaultMarkers(c, 0.5); }); refreshMarkerBin(); }); bigBtn(b2, "Add 0.5s Beat Markers", function () { var c = activeComp(); if (!c) return; undoable("Add 0.5s Markers", function () { generateDefaultMarkers(c, 0.5); }); refreshMarkerBin(); });
            var b3 = trow(tab); bigBtn(b3, "Strong Every 4", function () { var c = activeComp(); if (!c) return; undoable("Strong Every 4", function () { var mk = getCompMarkers(c); for (var i = 0; i < mk.length; i++) if (mk[i].index % 4 === 0) c.markerProperty.setValueAtTime(mk[i].time, new MarkerValue("Strong Hit")); }); refreshMarkerBin(); }); bigBtn(b3, "Drop Every 8", function () { var c = activeComp(); if (!c) return; undoable("Drop Every 8", function () { var mk = getCompMarkers(c); for (var i = 0; i < mk.length; i++) if (mk[i].index % 8 === 0) c.markerProperty.setValueAtTime(mk[i].time, new MarkerValue("Drop")); }); refreshMarkerBin(); });
            var b4 = trow(tab); bigBtn(b4, "Clear Generated Markers", function () { clearGeneratedMarkers(); refreshMarkerBin(); }); bigBtn(b4, "Apply Marker Actions", applyMarkerActions);
            var b5 = trow(tab); bigBtn(b5, "Build Promo From Marker Bin", function () { STATE.beatSyncMode = "Use Marker Bin Roles"; scanMarkerBin(); buildFullPromo(); });
            // Role -> Action mapping
            tab.add("statictext", undefined, "Marker Role Actions:");
            var mapWrap = tab.add("group"); mapWrap.orientation = "column"; mapWrap.alignChildren = ["fill", "top"]; mapWrap.spacing = 1;
            for (var ri = 0; ri < ROLE_LIST.length; ri += 2) {
                var rr2 = trow(mapWrap);
                addRoleDrop(rr2, ROLE_LIST[ri]);
                if (ROLE_LIST[ri + 1]) addRoleDrop(rr2, ROLE_LIST[ri + 1]);
            }
            function addRoleDrop(parent, role) { parent.add("statictext", undefined, role + ":"); var dd = parent.add("dropdownlist", undefined, ROLE_ACTION_OPTIONS[role]); dd.selection = 0; dd.alignment = ["fill", "center"]; dd.onChange = (function (rl, ddd) { return function () { ROLE_ACTIONS[rl] = ddd.selection.text; }; })(role, dd); }
        }
        function buildQueueTab(tab) {
            tab.orientation = "column"; tab.alignChildren = ["fill", "top"]; tab.margins = 8; tab.spacing = 3;
            var pk = trow(tab); pk.add("statictext", undefined, "Text Pack:"); var packDD = pk.add("dropdownlist", undefined, TEXT_PACK_ORDER); packDD.selection = 0; packDD.alignment = ["fill", "center"]; packDD.onChange = function () { STATE.textPack = packDD.selection.text; };
            var lb = tab.add("listbox", undefined, [], { numberOfColumns: 3, showHeaders: true, columnTitles: ["Scene", "Text", "Preset"], columnWidths: [50, 260, 150] }); lb.preferredSize.height = 120;
            function refreshQueue() { lb.removeAll(); for (var i = 0; i < QUEUE.length; i++) { var it = lb.add("item", "S" + QUEUE[i].scene); it.subItems[0].text = T(QUEUE[i].text); it.subItems[1].text = QUEUE[i].preset; } }
            var b1 = trow(tab); bigBtn(b1, "Load Default Text", function () { loadTextQueueFromPack(packDD.selection.text); refreshQueue(); }); bigBtn(b1, "Clear Queue", function () { QUEUE = []; refreshQueue(); });
            var addRow = trow(tab); addRow.add("statictext", undefined, "Scene:"); var scF = addRow.add("edittext", undefined, "1"); scF.characters = 3; addRow.add("statictext", undefined, "Text:"); var txF = addRow.add("edittext", undefined, ""); txF.alignment = ["fill", "center"];
            var b2 = trow(tab); bigBtn(b2, "Add Text Line", function () { if (!txF.text) return; QUEUE.push({ text: txF.text, scene: clamp(parseInt(scF.text, 10) || 1, 1, 7), preset: pick(TEXT_PRESET_CYCLE) }); txF.text = ""; refreshQueue(); }); bigBtn(b2, "Remove Selected", function () { if (lb.selection) { QUEUE.splice(lb.selection.index, 1); refreshQueue(); } });
            var b3 = trow(tab); bigBtn(b3, "Sync Text To Markers", function () { syncTextToMarkers("every"); }); bigBtn(b3, "Text Every Strong Marker", function () { syncTextToMarkers("strong"); }); bigBtn(b3, "Text Per Scene", function () { syncTextToMarkers("scene"); });
            var b4 = trow(tab); bigBtn(b4, "Random Text Presets", function () { for (var i = 0; i < QUEUE.length; i++) QUEUE[i].preset = pick(TEXT_PRESET_CYCLE); refreshQueue(); }); bigBtn(b4, "Clean Text Mode", function () { for (var i = 0; i < QUEUE.length; i++) QUEUE[i].preset = "Premium Fade Up"; refreshQueue(); }); bigBtn(b4, "Hype Text Mode", function () { for (var i = 0; i < QUEUE.length; i++) QUEUE[i].preset = pick(["Snap Pop", "Text Slam", "Fast TikTok Text Pop"]); refreshQueue(); });
            loadTextQueueFromPack(STATE.textPack); refreshQueue();
        }
        function buildAssetsTab(tab) {
            tab.orientation = "column"; tab.alignChildren = ["fill", "top"]; tab.margins = 8; tab.spacing = 2;
            var slots = [["logo", "Logo"], ["shot1", "Screenshot / Window 1"], ["shot2", "Screenshot / Window 2"], ["shot3", "Screenshot / Window 3"], ["product", "Product Image"], ["background", "Background Texture"], ["extra", "Extra PNG / UI"], ["video", "Video Clip"], ["character", "Character / Subject"], ["outro", "Outro Logo"]];
            var labels = {};
            refreshAssetUI = function () { for (var k in labels) if (labels.hasOwnProperty(k)) labels[k].text = ASSETS[k] ? ASSETS[k].name : "(empty)"; };
            for (var i = 0; i < slots.length; i++) { var row = trow(tab); var st = row.add("statictext", undefined, slots[i][1] + ":"); st.preferredSize.width = 150; var lbl = row.add("statictext", undefined, ASSETS[slots[i][0]] ? ASSETS[slots[i][0]].name : "(empty)"); lbl.alignment = ["fill", "center"]; labels[slots[i][0]] = lbl; (function (key) { bigBtn(row, "Use Selected", function () { assetFromSelected(key); }); })(slots[i][0]); }
            var b1 = trow(tab); bigBtn(b1, "Clear Asset Slots", function () { clearAssets(); }); bigBtn(b1, "Build Window From Logo Slot", function () { buildWindowFromSlot("shot1"); });
            var b2 = trow(tab); bigBtn(b2, "Replace Placeholder Windows With Slots", function () { alert("On the next Build Full 30s Promo, filled slots are used automatically (Logo -> Scene 1 & 7, Screenshot 1 -> Scene 3, Screenshot 2/3 -> Scene 4/6).", SCRIPT_NAME); });
        }
        function buildWindowTab(tab) {
            tab.orientation = "column"; tab.alignChildren = ["fill", "top"]; tab.margins = 10; tab.spacing = 4;
            var r = trow(tab); r.add("statictext", undefined, "Window preset:"); var wDD = r.add("dropdownlist", undefined, WINDOW); wDD.selection = 0; wDD.alignment = ["fill", "center"];
            var r2 = trow(tab); bigBtn(r2, "Apply Window Preset", function () { applyPreset("Window / Screenshot", wDD.selection.text, undefined); }); bigBtn(r2, "Make Premium Window", makeScreenshotWindow);
            tab.add("statictext", undefined, "── 3D webpage window (glowing, layered depth) ──");
            var t3 = trow(tab); t3.add("statictext", undefined, "3D movement:"); var wDD3 = t3.add("dropdownlist", undefined, WINDOW3D); wDD3.selection = 0; wDD3.alignment = ["fill", "center"];
            var t3b = trow(tab); bigBtn(t3b, "Make 3D Window", function () { makeThreeDWindow(wDD3.selection.text); }); bigBtn(t3b, "Random 3D Window", function () { seed(CFG.seed + comboSalt()); var nm = pick(WINDOW3D); for (var i = 0; i < wDD3.items.length; i++) if (wDD3.items[i].text === nm) wDD3.selection = i; makeThreeDWindow(nm); });
            var r3 = trow(tab); r3.add("statictext", undefined, "From slot:"); var slDD = r3.add("dropdownlist", undefined, ["logo", "shot1", "shot2", "shot3", "product"]); slDD.selection = 1; bigBtn(r3, "Build 2D Window From Slot", function () { buildWindowFromSlot(slDD.selection.text); });
            tab.add("statictext", undefined, "Select your screenshot layer (or fill Screenshot slot 1), then Make 3D Window. No selection = placeholder.");
        }
        function buildShapeTab(tab) {
            tab.orientation = "column"; tab.alignChildren = ["fill", "top"]; tab.margins = 10; tab.spacing = 4;
            var r = trow(tab); r.add("statictext", undefined, "Shape preset:"); var sDD = r.add("dropdownlist", undefined, SHAPE); sDD.selection = 0; sDD.alignment = ["fill", "center"];
            var r2 = trow(tab); bigBtn(r2, "Add Shape", function () { var c = activeComp(); if (!c) return; undoable("Add Shape", function () { applyShapePreset(sDD.selection.text, buildSettings()); }); }); bigBtn(r2, "Random", function () { applyRandomPreset("Shape"); });
            var r3 = trow(tab); r3.add("statictext", undefined, "Shape pack:"); var pkDD = r3.add("dropdownlist", undefined, SHAPE_PACKS); pkDD.selection = 0; pkDD.alignment = ["fill", "center"];
            bigBtn(trow(tab), "Add Shape Pack", function () { var c = activeComp(); if (c) addShapePack(c, pkDD.selection.text); });
        }
        function buildPreviewTab(tab) {
            tab.orientation = "column"; tab.alignChildren = ["fill", "top"]; tab.margins = 10; tab.spacing = 4;
            var r1 = trow(tab); r1.add("statictext", undefined, "Category:"); var cDD = r1.add("dropdownlist", undefined, CATEGORY_ORDER); cDD.selection = 0; cDD.preferredSize.width = 150;
            var r2 = trow(tab); r2.add("statictext", undefined, "Preset:"); var pDD = r2.add("dropdownlist", undefined, BOUNCE); pDD.selection = 0; pDD.alignment = ["fill", "center"];
            cDD.onChange = function () { var arr = CATEGORIES[cDD.selection.text]; pDD.removeAll(); for (var i = 0; i < arr.length; i++) pDD.add("item", arr[i]); pDD.selection = 0; };
            bigBtn(trow(tab), "Create Preset Demo Comp", createDemoComp);
            var r3 = trow(tab); bigBtn(r3, "Preview Selected Preset", function () { applyPreset(cDD.selection.text, pDD.selection.text, undefined); }); bigBtn(r3, "Preview Random Preset", function () { var nm = applyRandomPreset(cDD.selection.text); if (nm) for (var i = 0; i < pDD.items.length; i++) if (pDD.items[i].text === nm) pDD.selection = i; });
            var r4 = trow(tab); bigBtn(r4, "Preview Category Pack", function () { var c = activeComp(); if (!c) { alert("Create the demo comp first.", SCRIPT_NAME); return; } var arr = CATEGORIES[cDD.selection.text]; undoable("Preview Category Pack", function () { var s = buildSettings(); for (var i = 0; i < Math.min(4, arr.length); i++) { s.time = c.time + i * 0.4; if (cDD.selection.text === "Shape") applyShapePreset(arr[i], s); else if (cDD.selection.text === "Flash / Impact") applyFlashPreset(s.time, arr[i], s); } }); }); bigBtn(r4, "Clear Demo Comp", function () { var c = activeComp(); if (c && c.name === "Preset Demo") { undoable("Clear Demo", function () { while (c.numLayers > 0) c.layer(1).remove(); addSolid(c, BRAND.bg, "Motion Background"); }); } });
        }
        function buildExportTab(tab) {
            tab.orientation = "column"; tab.alignChildren = ["fill", "top"]; tab.margins = 10; tab.spacing = 4;
            bigBtn(trow(tab), "Export Motion Recipe", exportRecipe);
            bigBtn(trow(tab), "Check Script Setup", qaCheck);
            tab.add("statictext", undefined, "Recipe = project, profile, brand, text queue, asset slots, marker");
            tab.add("statictext", undefined, "roles/actions, presets, timing, windows, and CTA. Saves a .txt +");
            tab.add("statictext", undefined, "a hidden 'Motion Recipe' guide layer.");
        }

        applyProfile(STATE.profile); syncBrandFields(); syncEnergy();
        win.layout.layout(true); win.onResizing = win.onResize = function () { this.layout.resize(); };
        if (win instanceof Window) { win.center(); win.show(); }
        return win;
    }

    function makeScreenshotWindow() {
        var comp = activeComp(); if (!comp) return; var s = buildSettings(); var sel = comp.selectedLayers;
        undoable("Make Premium Window", function () { var layer = (sel && sel.length) ? sel[0] : null; buildWindow(comp, "App Window", { inT: comp.time, dotsT: comp.time + 0.4, glowT: comp.time + 0.7, zoomT: comp.time + 1.4, shine: true, cursorT: comp.time + 1.8 }, s, layer && layer.source ? layer : (ASSETS.shot1 && ASSETS.shot1.source ? ASSETS.shot1 : null)); });
    }

    buildUI(thisObj);

})(this);
