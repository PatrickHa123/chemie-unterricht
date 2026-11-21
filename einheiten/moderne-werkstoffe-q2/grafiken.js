/* Moderne Werkstoffe – selbst erstellte Grafiken und Animationen (ohne externe Inhalte) */
(function () {
  "use strict";
  var NS = "http://www.w3.org/2000/svg";
  function el(tag, attrs, parent) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  function txt(parent, x, y, s, attrs) {
    var a = { x: x, y: y, "font-family": "-apple-system, Segoe UI, Roboto, sans-serif", "font-size": 14, fill: "#1c2430", "text-anchor": "middle" };
    for (var k in attrs || {}) a[k] = attrs[k];
    var t = el("text", a, parent); t.textContent = s; return t;
  }
  function svg(parent, w, h, label) {
    var s = el("svg", { viewBox: "0 0 " + w + " " + h, role: "img", "aria-label": label || "" });
    parent.insertBefore(s, parent.firstChild);
    return s;
  }
  function knopf(container, text, primaer) {
    var b = document.createElement("button"); b.type = "button"; b.textContent = text;
    if (primaer) b.className = "primaer";
    container.appendChild(b); return b;
  }
  function steuerleiste(g) {
    var d = g.querySelector(".steuer");
    if (!d) { d = document.createElement("div"); d.className = "steuer"; g.appendChild(d); }
    return d;
  }
  var reduziert = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Kopfbereich: schwebende Molekülkette ---------- */
  document.querySelectorAll(".kopf").forEach(function (k) {
    var s = el("svg", { class: "deko", viewBox: "0 0 520 200", preserveAspectRatio: "xMaxYMid slice", "aria-hidden": "true" });
    var g = el("g", { stroke: "#fff", "stroke-width": 4, fill: "#fff" }, s);
    var pts = [];
    for (var i = 0; i < 11; i++) pts.push([30 + i * 46, i % 2 ? 70 : 110]);
    for (i = 0; i < pts.length - 1; i++) el("line", { x1: pts[i][0], y1: pts[i][1], x2: pts[i + 1][0], y2: pts[i + 1][1] }, g);
    pts.forEach(function (p, i) {
      el("line", { x1: p[0], y1: p[1], x2: p[0], y2: p[1] + (i % 2 ? -32 : 32), "stroke-width": 2.5 }, g);
      el("circle", { cx: p[0], cy: p[1] + (i % 2 ? -36 : 36), r: 6 }, g);
      el("circle", { cx: p[0], cy: p[1], r: 13 }, g);
    });
    for (i = 0; i < 6; i++) el("circle", { cx: 60 + i * 80, cy: 175 - (i % 3) * 8, r: 4 }, g);
    k.insertBefore(s, k.firstChild);
  });

  var GRAFIKEN = {};

  /* ---------- Recyclingcodes zum Umdrehen ---------- */
  GRAFIKEN.codes = function (g) {
    var DATEN = [
      ["01", "PET", "Polyethylenterephthalat", "Getränkeflaschen, Obstschalen, Polyesterfasern"],
      ["02", "PE-HD", "Polyethylen hoher Dichte", "Shampooflaschen, Eimer, Flaschendeckel"],
      ["03", "PVC", "Polyvinylchlorid", "Rohre, Fensterrahmen, Bodenbeläge"],
      ["04", "PE-LD", "Polyethylen niedriger Dichte", "Folien, Tüten, Gefrierbeutel"],
      ["05", "PP", "Polypropylen", "Deckel, Joghurtbecher, Mikrowellendosen"],
      ["06", "PS", "Polystyrol", "Einwegbecher, Joghurtbecher, Styropor"],
      ["07", "O", "andere Kunststoffe", "z. B. Polycarbonat, Verbunde aus mehreren Kunststoffen"]
    ];
    var wrap = document.createElement("div"); wrap.className = "codes";
    DATEN.forEach(function (d) {
      var b = document.createElement("button"); b.type = "button"; b.className = "codekarte";
      b.setAttribute("aria-label", "Recyclingcode " + d[0] + ": umdrehen");
      var innen = document.createElement("div"); innen.className = "innen";
      var vorne = document.createElement("div"); vorne.className = "vorne";
      var s = el("svg", { viewBox: "0 0 100 100", width: 78, height: 78, "aria-hidden": "true" });
      var gg = el("g", { fill: "none", stroke: "#2a5d9f", "stroke-width": 6, "stroke-linejoin": "round", "stroke-linecap": "round" }, s);
      el("path", { d: "M50 12 L86 76 L14 76 Z" }, gg);
      el("path", { d: "M44 20 l6 -8 l6 8", "stroke-width": 5 }, gg);
      el("path", { d: "M84 66 l2 10 l-10 1", "stroke-width": 5 }, gg);
      el("path", { d: "M22 80 l-8 -4 l5 -9", "stroke-width": 5 }, gg);
      txt(s, 50, 63, d[0], { "font-size": 24, "font-weight": 700, fill: "#1d4475" });
      vorne.appendChild(s);
      var lab = document.createElement("strong"); lab.textContent = d[1]; vorne.appendChild(lab);
      var hinten = document.createElement("div"); hinten.className = "hinten";
      hinten.innerHTML = "<strong></strong><span></span>";
      hinten.firstChild.textContent = d[2]; hinten.lastChild.textContent = d[3];
      innen.appendChild(vorne); innen.appendChild(hinten); b.appendChild(innen);
      b.addEventListener("click", function () { b.classList.toggle("gedreht"); });
      wrap.appendChild(b);
    });
    g.insertBefore(wrap, g.firstChild);
  };

  /* ---------- Wärme- und Dehnungssimulation der Kunststoffklassen ---------- */
  GRAFIKEN.waerme = function (g) {
    var W = 660, H = 260;
    var s = svg(g, W, H, "Simulation: Makromoleküle von Thermoplast, Elastomer und Duroplast bei verschiedenen Temperaturen");
    var TITEL = ["Thermoplast", "Elastomer", "Duroplast"];
    var panels = [];
    for (var p = 0; p < 3; p++) {
      var ox = 10 + p * 220;
      el("rect", { x: ox, y: 28, width: 200, height: 200, rx: 14, fill: "#f3f6fb", stroke: "#d9e0ea" }, s);
      txt(s, ox + 100, 18, TITEL[p], { "font-weight": 700 });
      var grp = el("g", {}, s);
      var status = txt(s, ox + 100, 250, "", { "font-size": 13, fill: "#5a6573" });
      var ketten = [];
      var n = p === 2 ? 6 : 5;
      for (var i = 0; i < n; i++) {
        ketten.push({ y0: 52 + i * (p === 2 ? 30 : 36), seed: Math.random() * 6, pfad: el("polyline", { fill: "none", stroke: "#2a5d9f", "stroke-width": 3.2, "stroke-linecap": "round", "stroke-linejoin": "round" }, grp) });
      }
      var vernetz = [];
      if (p > 0) {
        var spalten = p === 1 ? [3, 8] : [1, 3, 5, 7, 9];
        for (i = 0; i < n - 1; i++) {
          (p === 1 ? [spalten[i % 2]] : spalten).forEach(function (sp) {
            vernetz.push({ a: i, j: sp, linie: el("line", { stroke: "#c2410c", "stroke-width": 3, "stroke-linecap": "round" }, grp) });
          });
        }
      }
      var riss = el("path", { d: "", stroke: "#b42318", "stroke-width": 3, fill: "none", opacity: 0 }, grp);
      panels.push({ ox: ox, ketten: ketten, vernetz: vernetz, status: status, riss: riss, dehnung: 0, bleibend: 0, gebrochen: false });
    }
    var st = steuerleiste(g);
    var lab = document.createElement("label"); lab.textContent = "Temperatur: "; lab.style.fontWeight = "600";
    var regler = document.createElement("input"); regler.type = "range"; regler.min = 20; regler.max = 320; regler.value = 20;
    regler.setAttribute("aria-label", "Temperatur");
    var anz = document.createElement("span"); anz.className = "status"; anz.textContent = "20 °C";
    lab.appendChild(regler); st.appendChild(lab); st.appendChild(anz);
    var bDehnen = knopf(st, "↔ Dehnen", true);
    var bReset = knopf(st, "Zurücksetzen");
    var T = 20, dehnStart = -1;
    regler.addEventListener("input", function () { T = Number(regler.value); anz.textContent = T + " °C"; });
    bDehnen.addEventListener("click", function () { dehnStart = performance.now(); });
    bReset.addEventListener("click", function () {
      regler.value = 20; T = 20; anz.textContent = "20 °C"; dehnStart = -1;
      panels.forEach(function (pn) { pn.bleibend = 0; pn.gebrochen = false; pn.riss.setAttribute("opacity", 0); });
    });
    var N = 11;
    function punkte(pn, k, t, p) {
      var amp = (p === 2 ? 0.6 : 1.2) + T / (p === 2 ? 110 : 45);
      var schmelze = p === 0 ? Math.max(0, (T - 140) / 60) : 0;
      var zersetzt = p > 0 && T > 260;
      var streck = 1 + pn.dehnung * (p === 1 ? 0.35 : 0.25) + pn.bleibend;
      var res = [];
      for (var j = 0; j < N; j++) {
        var fx = j / (N - 1);
        var x = pn.ox + 100 + (fx - 0.5) * 170 * Math.min(streck, 1.15);
        var welle = (1 - pn.dehnung * 0.8) * 9 * Math.sin(fx * 7 + k.seed);
        var zap = reduziert ? 0 : amp * 2.2 * Math.sin(t * (2 + T / 60) + j * 1.9 + k.seed * 3);
        var y = k.y0 + welle + zap;
        if (schmelze > 0) {
          y += schmelze * (18 * Math.sin(fx * 3 + k.seed) + (k.y0 - 120) * -0.25) + schmelze * 30 * Math.sin(t * 0.7 + k.seed + fx * 2);
          x += schmelze * 14 * Math.sin(t * 0.9 + k.seed * 2 + fx * 4);
        }
        if (zersetzt && (j === 5 || j === 6) && Math.floor(k.seed * 10) % 2 === 0) { res.push(null); continue; }
        res.push([x, Math.max(36, Math.min(220, y))]);
      }
      return res;
    }
    function zeichne(t) {
      t = t / 1000;
      if (dehnStart >= 0) {
        var dt = (performance.now() - dehnStart) / 1000;
        var d = dt < 0.8 ? dt / 0.8 : dt < 1.6 ? 1 : Math.max(0, 1 - (dt - 1.6) / 0.8);
        panels[1].dehnung = d;
        panels[0].dehnung = d;
        if (dt > 0.8 && panels[0].bleibend < 0.12 && T < 140) panels[0].bleibend = 0.12;
        if (dt > 0.5 && T < 260) { panels[2].gebrochen = true; }
        if (dt > 2.4) dehnStart = -1;
      }
      panels.forEach(function (pn, p) {
        var alle = pn.ketten.map(function (k) { return punkte(pn, k, t, p); });
        pn.ketten.forEach(function (k, i) {
          var segs = alle[i].filter(Boolean).map(function (q) { return q[0].toFixed(1) + "," + q[1].toFixed(1); });
          k.pfad.setAttribute("points", segs.join(" "));
          k.pfad.setAttribute("stroke", (p > 0 && T > 260) ? "#7a8699" : "#2a5d9f");
        });
        pn.vernetz.forEach(function (v) {
          var a = alle[v.a][v.j], b = alle[v.a + 1][v.j];
          var kaputt = T > 260 && (v.j + v.a) % 2 === 0;
          if (!a || !b || kaputt) { v.linie.setAttribute("opacity", 0); return; }
          v.linie.setAttribute("opacity", 1);
          v.linie.setAttribute("x1", a[0]); v.linie.setAttribute("y1", a[1]);
          v.linie.setAttribute("x2", b[0]); v.linie.setAttribute("y2", b[1]);
        });
        if (p === 2) {
          pn.riss.setAttribute("opacity", pn.gebrochen ? 1 : 0);
          pn.riss.setAttribute("d", "M" + (pn.ox + 112) + " 34 l-10 40 l14 28 l-12 34 l12 30 l-8 50");
        }
        var s;
        if (p === 0) s = T < 90 ? "fest" : T < 140 ? "wird weich" : "schmilzt, Ketten gleiten";
        else if (T > 260) s = "zersetzt sich";
        else s = p === 1 ? "elastisch, schmilzt nicht" : (pn.gebrochen ? "spröde: bricht beim Dehnen" : "hart, formstabil");
        pn.status.textContent = s;
      });
      requestAnimationFrame(zeichne);
    }
    requestAnimationFrame(zeichne);
  };

  /* ---------- Strukturformeln der Monomere ---------- */
  GRAFIKEN.monomere = function (g) {
    var s = svg(g, 680, 190, "Strukturformeln von Ethen, Propen, Vinylchlorid und Styrol");
    var X = [["H", "Ethen", "PE"], ["CH₃", "Propen", "PP"], ["Cl", "Vinylchlorid", "PVC"], ["ring", "Styrol", "PS"]];
    X.forEach(function (d, i) {
      var ox = 20 + i * 165, cy = 80;
      var gg = el("g", { stroke: "#1c2430", "stroke-width": 2.4, "stroke-linecap": "round" }, s);
      el("line", { x1: ox + 40, y1: cy - 4, x2: ox + 90, y2: cy - 4 }, gg);
      el("line", { x1: ox + 40, y1: cy + 4, x2: ox + 90, y2: cy + 4, stroke: "#c2410c", "stroke-width": 3 }, gg);
      [[ox + 20, cy - 30], [ox + 20, cy + 30], [ox + 110, cy - 30]].forEach(function (h) {
        el("line", { x1: h[0] < ox + 60 ? ox + 32 : ox + 98, y1: cy + (h[1] < cy ? -8 : 8), x2: h[0] + (h[0] < ox + 60 ? 6 : -6), y2: h[1] + (h[1] < cy ? 6 : -6) }, gg);
        txt(s, h[0], h[1] + 5, "H");
      });
      el("line", { x1: ox + 98, y1: cy + 8, x2: ox + 110, y2: cy + 28 }, gg);
      txt(s, ox + 36, cy + 5, "C", { "font-weight": 700 });
      txt(s, ox + 94, cy + 5, "C", { "font-weight": 700 });
      if (d[0] === "ring") {
        var rx = ox + 118, ry = cy + 52, r = 18, pts = [];
        for (var k = 0; k < 6; k++) { var a = Math.PI / 6 + k * Math.PI / 3; pts.push((rx + r * Math.cos(a)).toFixed(1) + "," + (ry + r * Math.sin(a)).toFixed(1)); }
        el("polygon", { points: pts.join(" "), fill: "#fdf1de", stroke: "#b26b00", "stroke-width": 2.4 }, s);
        el("circle", { cx: rx, cy: ry, r: 10, fill: "none", stroke: "#b26b00", "stroke-width": 1.8 }, s);
      } else {
        txt(s, ox + 116, cy + 44, d[0], { fill: d[0] === "H" ? "#1c2430" : "#b26b00", "font-weight": d[0] === "H" ? 400 : 700 });
      }
      txt(s, ox + 65, 172, d[1], { "font-weight": 700 });
      txt(s, ox + 65, 188, "→ " + d[2], { "font-size": 12, fill: "#5a6573" });
    });
  };

  /* ---------- Animation: Polymerisation von Ethen ---------- */
  GRAFIKEN.polymerisation = function (g) {
    var W = 680, H = 150, M = 7;
    var s = svg(g, W, H, "Animation: Ethen-Moleküle werden zu einer Polyethen-Kette verknüpft");
    var start = 70, frei = 80, fest = 60;
    var radikal = el("g", {}, s);
    el("circle", { cx: 0, cy: 0, r: 12, fill: "#8a2f8f" }, radikal);
    txt(radikal, 0, 5, "R", { fill: "#fff", "font-weight": 700, "font-size": 13 });
    var punkt = el("circle", { r: 5, fill: "#c2410c" }, s);
    var mols = [];
    for (var i = 0; i < M; i++) {
      var m = el("g", { style: "transition: transform .7s ease" }, s);
      var dop1 = el("line", { x1: 0, y1: -4, x2: 30, y2: -4, stroke: "#1c2430", "stroke-width": 3 }, m);
      var dop2 = el("line", { x1: 0, y1: 4, x2: 30, y2: 4, stroke: "#c2410c", "stroke-width": 3, style: "transition: opacity .5s" }, m);
      var bindung = el("line", { x1: -30, y1: 0, x2: 0, y2: 0, stroke: "#1c2430", "stroke-width": 3, opacity: 0, style: "transition: opacity .5s" }, m);
      [[-6, -19], [-6, 19], [36, -19], [36, 19]].forEach(function (h, k) {
        el("line", { x1: k < 2 ? 0 : 30, y1: 0, x2: h[0], y2: h[1], stroke: "#9aa5b4", "stroke-width": 2 }, m);
        el("circle", { cx: h[0], cy: h[1], r: 6, fill: "#fff", stroke: "#9aa5b4", "stroke-width": 1.5 }, m);
      });
      el("circle", { cx: 0, cy: 0, r: 9, fill: "#2b3442" }, m);
      el("circle", { cx: 30, cy: 0, r: 9, fill: "#2b3442" }, m);
      mols.push({ g: m, dop2: dop2, dop1: dop1, bindung: bindung });
    }
    var status = txt(s, W / 2, 140, "", { "font-size": 13, fill: "#5a6573" });
    var schritt = 0, timer = null;
    function lage() {
      mols.forEach(function (m, i) {
        var x = i < schritt ? start + i * fest : start + schritt * fest + 30 + (i - schritt) * frei;
        m.g.setAttribute("transform", "translate(" + x + ",70)");
        m.dop2.setAttribute("opacity", i < schritt ? 0 : 1);
        m.dop1.setAttribute("y1", i < schritt ? 0 : -4); m.dop1.setAttribute("y2", i < schritt ? 0 : -4);
        m.bindung.setAttribute("opacity", i < schritt ? 1 : 0);
      });
      radikal.setAttribute("transform", "translate(" + (start - 34) + ",70)");
      var ende = schritt === 0 ? start - 12 : start + (schritt - 1) * fest + 30;
      punkt.setAttribute("cx", ende + 6); punkt.setAttribute("cy", 58);
      punkt.setAttribute("opacity", schritt >= M ? 0 : 1);
      status.textContent = schritt === 0 ? "Startradikal R• (mit ungepaartem Elektron •) wartet auf das erste Ethen-Molekül"
        : schritt < M ? "Kettenwachstum: " + schritt + " Ethen-Molekül" + (schritt > 1 ? "e" : "") + " verknüpft – das Radikal sitzt immer am Kettenende"
        : "Fertig für hier: In echt geht das tausendfach weiter, bis zwei Radikale aufeinandertreffen (Abbruch).";
    }
    lage();
    var st = steuerleiste(g);
    var bStart = knopf(st, "▶ Polymerisieren", true);
    var bSchritt = knopf(st, "Einzelschritt");
    var bReset = knopf(st, "Zurücksetzen");
    function weiter() { if (schritt < M) { schritt++; lage(); } else { clearInterval(timer); timer = null; } }
    bStart.addEventListener("click", function () { if (timer) return; if (schritt >= M) { schritt = 0; lage(); } timer = setInterval(weiter, 900); });
    bSchritt.addEventListener("click", function () { if (timer) { clearInterval(timer); timer = null; } weiter(); });
    bReset.addEventListener("click", function () { clearInterval(timer); timer = null; schritt = 0; lage(); });
  };

  /* ---------- Animation: Polykondensation (Polyester) ---------- */
  GRAFIKEN.polykondensation = function (g) {
    var W = 680, H = 170, M = 5;
    var s = svg(g, W, H, "Animation: Diol- und Dicarbonsäure-Moleküle verknüpfen sich unter Abspaltung von Wasser zu einem Polyester");
    var teile = [], wasser = [];
    for (var i = 0; i < M; i++) {
      var saeure = i % 2 === 0;
      var t = el("g", { style: "transition: transform .7s ease" }, s);
      el("rect", { x: 0, y: -16, width: 70, height: 32, rx: 16, fill: saeure ? "#e5eef9" : "#fdece4", stroke: saeure ? "#2a5d9f" : "#c2410c", "stroke-width": 2 }, t);
      txt(t, 35, 5, saeure ? "Säure" : "Diol", { "font-size": 12, "font-weight": 700, fill: saeure ? "#1d4475" : "#9a3412" });
      var links = txt(t, -4, 5, saeure ? "HOOC" : "HO", { "font-size": 11, "text-anchor": "end", fill: saeure ? "#2a5d9f" : "#c2410c" });
      var rechts = txt(t, 74, 5, saeure ? "COOH" : "OH", { "font-size": 11, "text-anchor": "start", fill: saeure ? "#2a5d9f" : "#c2410c" });
      teile.push({ g: t, links: links, rechts: rechts });
      if (i > 0) {
        var w = el("g", { style: "transition: transform 1.2s ease, opacity 1.2s ease", opacity: 0 }, s);
        el("path", { d: "M0 -12 C 8 0, 8 8, 0 10 C -8 8, -8 0, 0 -12 Z", fill: "#4f9be8" }, w);
        txt(w, 0, 26, "H₂O", { "font-size": 11, fill: "#1d4475" });
        var ester = txt(s, 0, 0, "–COO–", { "font-size": 11, "font-weight": 700, fill: "#b26b00", opacity: 0, style: "transition: opacity .5s" });
        wasser.push({ g: w, ester: ester });
      }
    }
    var status = txt(s, W / 2, 162, "", { "font-size": 13, fill: "#5a6573" });
    var schritt = 0, timer = null;
    var frei = 132, fest = 110, start = 40;
    function lage() {
      teile.forEach(function (t, i) {
        var x = i <= schritt ? start + i * fest : start + schritt * fest + (i - schritt) * frei + 10;
        t.g.setAttribute("transform", "translate(" + x + ",72)");
        t.links.setAttribute("opacity", i > 0 && i <= schritt ? 0 : 1);
        t.rechts.setAttribute("opacity", i < schritt ? 0 : 1);
      });
      wasser.forEach(function (w, i) {
        var nr = i + 1, x = start + nr * fest - 20;
        var an = nr <= schritt;
        w.g.setAttribute("opacity", an ? 1 : 0);
        w.g.setAttribute("transform", "translate(" + x + "," + (an ? 26 : 70) + ")");
        w.ester.setAttribute("x", x); w.ester.setAttribute("y", 108);
        w.ester.setAttribute("opacity", an ? 1 : 0);
      });
      status.textContent = schritt === 0 ? "Dicarbonsäure (zwei –COOH) und Diol (zwei –OH): Jedes Molekül hat zwei Andockstellen."
        : schritt < M - 1 ? "Veresterung Nr. " + schritt + ": neue Estergruppe, ein Wasser-Molekül wird abgespalten."
        : "Polyester! Die Kettenenden können weiter reagieren – die Kette wächst immer weiter.";
    }
    lage();
    var st = steuerleiste(g);
    var bStart = knopf(st, "▶ Verknüpfen", true);
    var bReset = knopf(st, "Zurücksetzen");
    bStart.addEventListener("click", function () {
      if (timer) return; if (schritt >= M - 1) { schritt = 0; lage(); }
      timer = setInterval(function () { if (schritt < M - 1) { schritt++; lage(); } else { clearInterval(timer); timer = null; } }, 1100);
    });
    bReset.addEventListener("click", function () { clearInterval(timer); timer = null; schritt = 0; lage(); });
  };

  /* ---------- Benzolring-Hilfsfunktion ---------- */
  function ring(s, cx, cy, r, farbe) {
    var pts = [];
    for (var k = 0; k < 6; k++) { var a = k * Math.PI / 3; pts.push((cx + r * Math.cos(a)).toFixed(1) + "," + (cy + r * Math.sin(a)).toFixed(1)); }
    el("polygon", { points: pts.join(" "), fill: "#fff", stroke: farbe || "#1c2430", "stroke-width": 2.2 }, s);
    el("circle", { cx: cx, cy: cy, r: r * 0.58, fill: "none", stroke: farbe || "#1c2430", "stroke-width": 1.6 }, s);
  }

  /* ---------- Repetiereinheit von PET ---------- */
  GRAFIKEN.pet = function (g) {
    var s = svg(g, 680, 150, "Strukturformel der Repetiereinheit von PET mit markierten Estergruppen");
    var y = 75;
    el("rect", { x: 104, y: 22, width: 206, height: 74, rx: 12, fill: "#e5eef9" }, s);
    el("rect", { x: 322, y: 50, width: 228, height: 46, rx: 12, fill: "#fdece4" }, s);
    el("rect", { x: 272, y: 16, width: 82, height: 84, rx: 10, fill: "none", stroke: "#b26b00", "stroke-width": 2.5, "stroke-dasharray": "6 4" }, s);
    var gg = el("g", { stroke: "#1c2430", "stroke-width": 2.4, "stroke-linecap": "round" }, s);
    txt(s, 52, y + 18, "[", { "font-size": 72, fill: "#5a6573" });
    txt(s, 640, y + 18, "]", { "font-size": 72, fill: "#5a6573" });
    txt(s, 662, y + 40, "n", { "font-size": 18, "font-style": "italic" });
    el("line", { x1: 66, y1: y, x2: 112, y2: y }, gg);
    txt(s, 122, y + 5, "C", { "font-weight": 700 });
    el("line", { x1: 119, y1: y - 9, x2: 119, y2: y - 32 }, gg); el("line", { x1: 125, y1: y - 9, x2: 125, y2: y - 32 }, gg);
    txt(s, 122, y - 37, "O", { fill: "#c2410c", "font-weight": 700 });
    el("line", { x1: 132, y1: y, x2: 176, y2: y }, gg);
    ring(s, 206, y, 28);
    el("line", { x1: 236, y1: y, x2: 280, y2: y }, gg);
    txt(s, 290, y + 5, "C", { "font-weight": 700 });
    el("line", { x1: 287, y1: y - 9, x2: 287, y2: y - 32 }, gg); el("line", { x1: 293, y1: y - 9, x2: 293, y2: y - 32 }, gg);
    txt(s, 290, y - 37, "O", { fill: "#c2410c", "font-weight": 700 });
    el("line", { x1: 300, y1: y, x2: 330, y2: y }, gg);
    txt(s, 340, y + 5, "O", { fill: "#c2410c", "font-weight": 700 });
    el("line", { x1: 350, y1: y, x2: 380, y2: y }, gg);
    txt(s, 400, y + 5, "CH₂", { "font-weight": 700 });
    el("line", { x1: 420, y1: y, x2: 446, y2: y }, gg);
    txt(s, 468, y + 5, "CH₂", { "font-weight": 700 });
    el("line", { x1: 490, y1: y, x2: 520, y2: y }, gg);
    txt(s, 530, y + 5, "O", { fill: "#c2410c", "font-weight": 700 });
    el("line", { x1: 540, y1: y, x2: 600, y2: y }, gg);
    txt(s, 313, 116, "Estergruppe", { "font-size": 12, "font-weight": 700, fill: "#b26b00" });
    txt(s, 206, 116, "aus Terephthalsäure", { "font-size": 11, fill: "#2a5d9f" });
    txt(s, 450, 116, "aus Ethandiol", { "font-size": 11, fill: "#c2410c" });
    txt(s, 340, 142, "Die zweite Estergruppe entsteht mit der nächsten Repetiereinheit (O rechts + C=O links).", { "font-size": 11, fill: "#5a6573" });
  };

  /* ---------- Funktionsshirt: Baumwolle vs. Polyester ---------- */
  GRAFIKEN.faser = function (g) {
    var s = svg(g, 680, 230, "Vergleich: Baumwollfasern nehmen Wasser auf, Polyesterfasern leiten es nach außen");
    var css = el("style", {}, s);
    css.textContent = "@keyframes nachaussen{0%{transform:translateY(0);opacity:0}15%{opacity:1}80%{opacity:1}100%{transform:translateY(-120px);opacity:0}}" +
      ".tropfen{animation:nachaussen 3.2s linear infinite}@keyframes quell{0%,100%{r:20}50%{r:23}}.quillt{animation:quell 3s ease-in-out infinite}" +
      "@media (prefers-reduced-motion: reduce){.tropfen,.quillt{animation:none}}";
    [["Baumwolle (Cellulose)", 10], ["Polyester (PET)", 350]].forEach(function (d, p) {
      var ox = d[1];
      el("rect", { x: ox, y: 30, width: 320, height: 150, rx: 14, fill: "#f3f6fb", stroke: "#d9e0ea" }, s);
      txt(s, ox + 160, 20, d[0], { "font-weight": 700 });
      el("rect", { x: ox, y: 180, width: 320, height: 22, fill: "#f6d7c3" }, s);
      txt(s, ox + 160, 196, "Haut (Schweiß)", { "font-size": 12, fill: "#7a3a1a" });
      txt(s, ox + 160, 46, "außen: Luft", { "font-size": 11, fill: "#5a6573" });
      for (var i = 0; i < 5; i++) {
        for (var j = 0; j < 2; j++) {
          var cx = ox + 38 + i * 56 + (j ? 28 : 0), cy = 92 + j * 46;
          var f = el("circle", { cx: cx, cy: cy, r: 20, fill: p ? "#fff" : "#dbeafe", stroke: p ? "#8a2f8f" : "#2a5d9f", "stroke-width": 2.5, class: p ? "" : "quillt" }, s);
          if (!p) {
            for (var w = 0; w < 3; w++) el("circle", { cx: cx - 8 + w * 8, cy: cy + (w % 2 ? 5 : -4), r: 3, fill: "#4f9be8" }, s);
          }
        }
      }
      if (p) {
        for (i = 0; i < 6; i++) {
          var tr = el("path", { d: "M0 -7 C 5 0, 5 5, 0 6 C -5 5, -5 0, 0 -7 Z", fill: "#4f9be8", class: "tropfen", transform: "translate(" + (ox + 70 + i * 40) + ",176)" }, s);
          tr.style.animationDelay = (-i * 0.55) + "s";
          var wrapG = el("g", { transform: "translate(" + (ox + 70 + i * 40) + ",176)" }, s);
          wrapG.appendChild(tr); tr.setAttribute("transform", "");
        }
        txt(s, ox + 160, 222, "Schweiß wandert zwischen den Fasern nach außen", { "font-size": 12, fill: "#5a6573" });
      } else {
        txt(s, ox + 160, 222, "Wasser dringt in die Fasern ein, sie quellen", { "font-size": 12, fill: "#5a6573" });
      }
    });
  };

  /* ---------- Polyamid: Wasserstoffbrücken zwischen Ketten ---------- */
  GRAFIKEN.polyamid = function (g) {
    var s = svg(g, 680, 220, "Zwei Polyamid-Ketten mit Wasserstoffbrücken zwischen den Amidgruppen");
    var css = el("style", {}, s);
    css.textContent = "@keyframes puls{0%,100%{opacity:.35}50%{opacity:1}}.hb{animation:puls 2s ease-in-out infinite}@media (prefers-reduced-motion: reduce){.hb{animation:none;opacity:1}}";
    var oben = 52, unten = 162;
    function amid(x, y, unterseite) {
      /* unterseite: C=O zeigt nach unten (obere Kette) bzw. N-H zeigt nach oben (untere Kette) */
      el("rect", { x: x - 32, y: y - 14, width: 64, height: 28, rx: 8, fill: "#fdf1de" }, s);
      var cx = unterseite ? x - 14 : x + 14, nx = unterseite ? x + 14 : x - 14;
      txt(s, cx, y + 5, "C", { "font-weight": 700 });
      txt(s, nx, y + 5, "N", { "font-weight": 700, fill: "#2a5d9f" });
      var d = 1;
      el("line", { x1: cx - 3, y1: y + d * 9, x2: cx - 3, y2: y + d * 22, stroke: "#1c2430", "stroke-width": 2 }, s);
      el("line", { x1: cx + 3, y1: y + d * 9, x2: cx + 3, y2: y + d * 22, stroke: "#1c2430", "stroke-width": 2 }, s);
      txt(s, cx, y + d * 34 + 5, "O", { fill: "#c2410c", "font-weight": 700 });
      el("line", { x1: nx, y1: y - d * 9, x2: nx, y2: y - d * 22, stroke: "#1c2430", "stroke-width": 2 }, s);
      txt(s, nx, y - d * 30 + 5, "H", {});
      return { o: [cx, y + d * 40], h: [nx, y - d * 36] };
    }
    el("line", { x1: 20, y1: oben, x2: 660, y2: oben, stroke: "#1c2430", "stroke-width": 2.4 }, s);
    el("line", { x1: 20, y1: unten, x2: 660, y2: unten, stroke: "#1c2430", "stroke-width": 2.4 }, s);
    for (var k = 0; k < 4; k++) {
      var x = 90 + k * 160;
      var a = amid(x, oben, true);
      var b = amid(x - 28 + 28, unten, false);
      el("line", { x1: a.o[0], y1: a.o[1], x2: b.h[0], y2: b.h[1], stroke: "#2f7d4f", "stroke-width": 3, "stroke-dasharray": "5 5", class: "hb" }, s);
    }
    txt(s, 340, 214, "grün gestrichelt: Wasserstoffbrücken zwischen dem O-Atom (C=O) einer Kette und dem H-Atom (N–H) der Nachbarkette", { "font-size": 11.5, fill: "#5a6573" });
  };

  /* ---------- Hydrolyse von PLA ---------- */
  GRAFIKEN.hydrolyse = function (g) {
    var W = 680, H = 150, M = 6;
    var s = svg(g, W, H, "Animation: Hydrolyse einer PLA-Kette in Milchsäure-Moleküle");
    var teile = [], schnitte = [];
    for (var i = 0; i < M; i++) {
      var t = el("g", { style: "transition: transform .8s ease" }, s);
      el("rect", { x: 0, y: -16, width: 80, height: 32, rx: 16, fill: "#e6f2ea", stroke: "#2f7d4f", "stroke-width": 2 }, t);
      txt(t, 40, 5, "Milchsäure", { "font-size": 11, "font-weight": 700, fill: "#2f7d4f" });
      teile.push(t);
      if (i < M - 1) {
        var sch = el("g", { opacity: 0, style: "transition: opacity .4s" }, s);
        el("path", { d: "M0 -12 C 8 0, 8 8, 0 10 C -8 8, -8 0, 0 -12 Z", fill: "#4f9be8" }, sch);
        txt(sch, 0, -18, "H₂O", { "font-size": 11, fill: "#1d4475" });
        var ester = el("rect", { width: 14, height: 14, rx: 3, fill: "#b26b00" }, s);
        schnitte.push({ w: sch, e: ester });
      }
    }
    var status = txt(s, W / 2, 140, "", { "font-size": 13, fill: "#5a6573" });
    var schritt = 0, timer = null;
    function lage() {
      var x = 30;
      teile.forEach(function (t, i) {
        if (i > 0) x += i <= schritt ? 26 : 8;
        t.setAttribute("transform", "translate(" + x + ",80)");
        if (i < M - 1) {
          var sx = x + 80 + (i + 1 <= schritt ? 13 : 4);
          schnitte[i].e.setAttribute("x", sx - 7); schnitte[i].e.setAttribute("y", 73);
          schnitte[i].e.setAttribute("opacity", i + 1 <= schritt ? 0 : 1);
          schnitte[i].w.setAttribute("transform", "translate(" + sx + ",42)");
          schnitte[i].w.setAttribute("opacity", i + 1 <= schritt ? 1 : 0);
        }
        x += 80;
      });
      status.textContent = schritt === 0 ? "PLA-Kette: Die Milchsäure-Bausteine sind über Estergruppen (■) verbunden."
        : schritt < M - 1 ? "Wasser spaltet Estergruppe Nr. " + schritt + " – die Kette wird kürzer."
        : "Vollständig hydrolysiert: übrig bleibt Milchsäure, die der Körper verwerten kann.";
    }
    lage();
    var st = steuerleiste(g);
    var b = knopf(st, "💧 Hydrolyse starten", true);
    var r = knopf(st, "Zurücksetzen");
    b.addEventListener("click", function () {
      if (timer) return; if (schritt >= M - 1) { schritt = 0; lage(); }
      timer = setInterval(function () { if (schritt < M - 1) { schritt++; lage(); } else { clearInterval(timer); timer = null; } }, 900);
    });
    r.addEventListener("click", function () { clearInterval(timer); timer = null; schritt = 0; lage(); });
  };

  /* ---------- Superabsorber: Netz quillt ---------- */
  GRAFIKEN.superabsorber = function (g) {
    var W = 680, H = 290;
    var s = svg(g, W, H, "Simulation: Ein Superabsorber-Netz quillt in Wasser und in Salzwasser unterschiedlich stark");
    var becher = el("rect", { x: 140, y: 20, width: 400, height: 240, rx: 18, fill: "#f3f6fb", stroke: "#9fb3cf", "stroke-width": 2 }, s);
    var wasserFlaeche = el("rect", { x: 142, y: 22, width: 396, height: 236, rx: 16, fill: "#cfe3fb", opacity: 0, style: "transition: opacity .6s" }, s);
    var netz = el("g", {}, s), ionen = el("g", {}, s), wasserG = el("g", {}, s);
    var R = 4, C = 5, knoten = [];
    for (var i = 0; i < R; i++) for (var j = 0; j < C; j++) knoten.push({ i: i, j: j });
    var linien = [];
    knoten.forEach(function (k, n) {
      if (k.j < C - 1) linien.push([n, n + 1]);
      if (k.i < R - 1) linien.push([n, n + C]);
    });
    var lEls = linien.map(function () { return el("line", { stroke: "#2a5d9f", "stroke-width": 3, "stroke-linecap": "round", style: "transition: all 1.2s ease" }, netz); });
    var kEls = knoten.map(function () { return el("circle", { r: 5, fill: "#c2410c", style: "transition: all 1.2s ease" }, netz); });
    var ladungen = knoten.map(function () { var t = txt(netz, 0, 0, "–", { "font-size": 14, "font-weight": 700, fill: "#b42318", style: "transition: all 1.2s ease" }); return t; });
    var na = knoten.map(function () {
      var gg = el("g", { style: "transition: transform 1.4s ease" }, ionen);
      el("circle", { r: 9, fill: "#fde68a", stroke: "#b26b00", "stroke-width": 1.5 }, gg);
      txt(gg, 0, 4, "Na⁺", { "font-size": 8, "font-weight": 700, fill: "#7c4a00" });
      return gg;
    });
    var wm = [];
    for (i = 0; i < 26; i++) {
      var w = el("g", { opacity: 0, style: "transition: opacity 1s ease" }, wasserG);
      el("circle", { r: 4, fill: "#2563eb" }, w);
      el("circle", { cx: -4, cy: 4, r: 2.4, fill: "#fff", stroke: "#2563eb" }, w);
      el("circle", { cx: 4, cy: 4, r: 2.4, fill: "#fff", stroke: "#2563eb" }, w);
      wm.push(w);
    }
    var status = txt(s, W / 2, 284, "", { "font-size": 13, fill: "#5a6573" });
    function zustand(faktor, modus) {
      var cx = 340, cy = 140, dx = 30 * faktor, dy = 26 * faktor;
      var pos = knoten.map(function (k) { return [cx + (k.j - (C - 1) / 2) * dx, cy + (k.i - (R - 1) / 2) * dy]; });
      linien.forEach(function (l, n) { var a = pos[l[0]], b = pos[l[1]]; lEls[n].setAttribute("x1", a[0]); lEls[n].setAttribute("y1", a[1]); lEls[n].setAttribute("x2", b[0]); lEls[n].setAttribute("y2", b[1]); });
      kEls.forEach(function (k, n) { k.setAttribute("cx", pos[n][0]); k.setAttribute("cy", pos[n][1]); });
      ladungen.forEach(function (t, n) { t.setAttribute("x", pos[n][0] + 8); t.setAttribute("y", pos[n][1] - 6); });
      na.forEach(function (gg, n) {
        var x = pos[n][0] + 10, y = pos[n][1] + 10;
        if (modus !== "trocken") {
          var frei = modus === "wasser" ? 1 : 0.45;
          var ang = n * 2.4;
          x = pos[n][0] + Math.cos(ang) * 40 * frei + (n % 2 ? 1 : -1) * 120 * frei * (pos[n][0] > cx ? 1 : -1) * 0.3;
          y = pos[n][1] + Math.sin(ang) * 30 * frei;
        }
        x = Math.max(156, Math.min(524, x)); y = Math.max(36, Math.min(244, y));
        gg.setAttribute("transform", "translate(" + x.toFixed(1) + "," + y.toFixed(1) + ")");
      });
      wm.forEach(function (w, n) {
        var a = n * 0.9, rr = 30 + (n % 5) * 18 * faktor;
        var wx = Math.max(152, Math.min(528, cx + Math.cos(a) * rr * 1.3)), wy = Math.max(32, Math.min(248, cy + Math.sin(a) * rr * 0.75));
        w.setAttribute("transform", "translate(" + wx.toFixed(1) + "," + wy.toFixed(1) + ")");
        w.setAttribute("opacity", modus === "trocken" ? 0 : (modus === "salz" && n % 2 ? 0 : 1));
      });
      wasserFlaeche.setAttribute("opacity", modus === "trocken" ? 0 : 1);
      status.textContent = modus === "trocken" ? "trocken: dichtes Netz, Na⁺-Ionen sitzen an den –COO⁻-Gruppen"
        : modus === "wasser" ? "in Wasser: Na⁺ lösen sich, die negativen Gruppen stoßen sich ab, das Netz weitet sich und bindet viel Wasser"
        : "in Salzwasser: Die vielen gelösten Ionen schwächen die Abstoßung, das Netz quillt deutlich weniger";
    }
    var st = steuerleiste(g);
    var b1 = knopf(st, "trocken"), b2 = knopf(st, "💧 Wasser", true), b3 = knopf(st, "🧂 Salzwasser");
    function druck(b) { [b1, b2, b3].forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); x.classList.remove("primaer"); }); }
    b1.addEventListener("click", function () { druck(b1); zustand(1, "trocken"); });
    b2.addEventListener("click", function () { druck(b2); zustand(2.1, "wasser"); });
    b3.addEventListener("click", function () { druck(b3); zustand(1.45, "salz"); });
    druck(b1); zustand(1, "trocken");
  };

  /* ---------- Erdöl: Destillationskolonne bis Kunststoff ---------- */
  GRAFIKEN.kolonne = function (g) {
    var W = 680, H = 330;
    var s = svg(g, W, H, "Schema: Erdöl wird in der Kolonne destilliert, Rohbenzin gecrackt, Ethen und Propen zu Kunststoffen polymerisiert");
    var css = el("style", {}, s);
    css.textContent = "@keyframes steigen{0%{transform:translateY(0);opacity:0}10%{opacity:.9}100%{transform:translateY(-230px);opacity:0}}.blase{animation:steigen 4s linear infinite}" +
      "@keyframes fluss{to{stroke-dashoffset:-24}}.fluss{stroke-dasharray:8 4;animation:fluss 1s linear infinite}@media (prefers-reduced-motion: reduce){.blase,.fluss{animation:none}}";
    var defs = el("defs", {}, s);
    var lg = el("linearGradient", { id: "kolonneVerlauf", x1: 0, y1: 1, x2: 0, y2: 0 }, defs);
    el("stop", { offset: "0", "stop-color": "#f59e0b" }, lg); el("stop", { offset: "1", "stop-color": "#dbeafe" }, lg);
    var mk = el("marker", { id: "pfeilK", viewBox: "0 0 10 10", refX: 8, refY: 5, markerWidth: 7, markerHeight: 7, orient: "auto" }, defs);
    el("path", { d: "M0 0 L10 5 L0 10 z", fill: "#2a5d9f" }, mk);
    el("rect", { x: 70, y: 30, width: 90, height: 260, rx: 40, fill: "url(#kolonneVerlauf)", stroke: "#5a6573", "stroke-width": 2 }, s);
    var F = [["Gase", "unter 30 °C", 52], ["Rohbenzin (Naphtha)", "ca. 30–180 °C", 100], ["Kerosin", "ca. 180–250 °C", 150], ["Gasöl / Diesel", "ca. 250–350 °C", 200], ["Rückstand", "über 350 °C", 262]];
    F.forEach(function (f, i) {
      el("line", { x1: 74, y1: f[2] + 18, x2: 156, y2: f[2] + 18, stroke: "#5a6573", "stroke-width": 1, "stroke-dasharray": "4 3" }, s);
      el("line", { x1: 160, y1: f[2], x2: 190, y2: f[2], stroke: i === 1 ? "#2a5d9f" : "#9aa5b4", "stroke-width": i === 1 ? 4 : 2.5 }, s);
      txt(s, 196, f[2] + 4, f[0], { "text-anchor": "start", "font-size": 13, "font-weight": i === 1 ? 700 : 400, fill: i === 1 ? "#1d4475" : "#1c2430" });
      txt(s, 196, f[2] + 19, f[1], { "text-anchor": "start", "font-size": 11, fill: "#5a6573" });
    });
    for (var i = 0; i < 7; i++) {
      var b = el("circle", { cx: 92 + (i % 3) * 22, cy: 280, r: 4, fill: "#fff", class: "blase" }, s);
      b.style.animationDelay = (-i * 0.6) + "s";
    }
    el("path", { d: "M20 300 L70 280", stroke: "#1c2430", "stroke-width": 3, fill: "none", "marker-end": "url(#pfeilK)" }, s);
    txt(s, 30, 322, "Erdöl (erhitzt)", { "font-size": 12, "text-anchor": "start" });
    txt(s, 115, 20, "Destillationskolonne", { "font-size": 12, "font-weight": 700 });
    function kasten(x, y, w, t1, t2, farbe) {
      el("rect", { x: x, y: y, width: w, height: 54, rx: 12, fill: farbe, stroke: "#2a5d9f", "stroke-width": 1.5 }, s);
      txt(s, x + w / 2, y + 23, t1, { "font-weight": 700, "font-size": 13 });
      txt(s, x + w / 2, y + 41, t2, { "font-size": 11, fill: "#5a6573" });
    }
    el("path", { d: "M340 100 L380 100", stroke: "#2a5d9f", "stroke-width": 3, fill: "none", class: "fluss", "marker-end": "url(#pfeilK)" }, s);
    kasten(384, 73, 120, "Cracken", "lange → kurze Ketten", "#fdf1de");
    el("path", { d: "M504 100 L540 100", stroke: "#2a5d9f", "stroke-width": 3, fill: "none", class: "fluss", "marker-end": "url(#pfeilK)" }, s);
    kasten(544, 73, 126, "Ethen, Propen", "Monomere", "#e5eef9");
    el("path", { d: "M607 127 L607 175", stroke: "#2a5d9f", "stroke-width": 3, fill: "none", class: "fluss", "marker-end": "url(#pfeilK)" }, s);
    kasten(544, 179, 126, "Polymerisation", "", "#f6e7f7");
    el("path", { d: "M607 233 L607 262", stroke: "#2a5d9f", "stroke-width": 3, fill: "none", class: "fluss", "marker-end": "url(#pfeilK)" }, s);
    kasten(544, 266, 126, "PE, PP …", "Kunststoffe", "#e6f2ea");
    txt(s, 440, 160, "Der größte Teil des Erdöls", { "font-size": 11, fill: "#5a6573" });
    txt(s, 440, 175, "wird als Kraft- und Brennstoff genutzt.", { "font-size": 11, fill: "#5a6573" });
  };

  /* ---------- Recycling-Kreislauf ---------- */
  GRAFIKEN.kreislauf = function (g) {
    var W = 680, H = 360;
    var s = svg(g, W, H, "Kreislauf: Produkt, Nutzung, Sammlung, Sortierung und drei Verwertungswege");
    var css = el("style", {}, s);
    css.textContent = "@keyframes fl{to{stroke-dashoffset:-24}}.fl{stroke-dasharray:9 5;animation:fl 1.2s linear infinite}@media (prefers-reduced-motion: reduce){.fl{animation:none}}";
    var defs = el("defs", {}, s);
    function marker(id, farbe) {
      var m = el("marker", { id: id, viewBox: "0 0 10 10", refX: 8, refY: 5, markerWidth: 7, markerHeight: 7, orient: "auto" }, defs);
      el("path", { d: "M0 0 L10 5 L0 10 z", fill: farbe }, m);
    }
    marker("pB", "#2a5d9f"); marker("pG", "#2f7d4f"); marker("pO", "#b26b00"); marker("pR", "#b42318");
    function knoten(x, y, emoji, t, farbe) {
      el("rect", { x: x - 62, y: y - 30, width: 124, height: 60, rx: 14, fill: farbe || "#fff", stroke: "#d9e0ea", "stroke-width": 1.5 }, s);
      txt(s, x, y - 4, emoji, { "font-size": 20 });
      txt(s, x, y + 18, t, { "font-size": 12, "font-weight": 700 });
    }
    function pfeil(d, farbe, m) { el("path", { d: d, stroke: farbe, "stroke-width": 3, fill: "none", class: "fl", "marker-end": "url(#" + m + ")" }, s); }
    knoten(110, 60, "🥤", "Produkt");
    knoten(340, 60, "🙋", "Nutzung");
    knoten(570, 60, "🟡", "Gelber Sack");
    knoten(570, 180, "🔍", "Sortieranlage");
    pfeil("M172 60 L274 60", "#2a5d9f", "pB");
    pfeil("M402 60 L504 60", "#2a5d9f", "pB");
    pfeil("M570 90 L570 146", "#2a5d9f", "pB");
    knoten(110, 300, "♻️", "werkstofflich", "#e6f2ea");
    knoten(340, 300, "⚗️", "rohstofflich", "#fdf1de");
    knoten(570, 300, "🔥", "energetisch", "#fdeceb");
    pfeil("M520 205 C 400 240, 220 240, 150 268", "#2f7d4f", "pG");
    pfeil("M545 210 C 480 250, 400 260, 365 268", "#b26b00", "pO");
    pfeil("M570 210 L570 266", "#b42318", "pR");
    pfeil("M60 270 C 20 200, 30 120, 60 92", "#2f7d4f", "pG");
    txt(s, 26, 180, "Granulat", { "font-size": 11, fill: "#2f7d4f", transform: "rotate(-90 26 180)" });
    pfeil("M300 270 C 240 200, 190 140, 160 92", "#b26b00", "pO");
    txt(s, 255, 175, "Monomere / Öl → Synthese", { "font-size": 11, fill: "#b26b00" });
    txt(s, 570, 350, "Wärme, Strom – Rohstoff verloren", { "font-size": 11, fill: "#b42318" });
    txt(s, 110, 350, "Ketten bleiben erhalten", { "font-size": 11, fill: "#2f7d4f" });
    txt(s, 340, 350, "Ketten werden gespalten", { "font-size": 11, fill: "#b26b00" });
  };

  /* ---------- Begriffslandkarte der Reihe ---------- */
  GRAFIKEN.landkarte = function (g) {
    var W = 680, H = 330;
    var s = svg(g, W, H, "Begriffslandkarte: Rohstoff, Monomer, Synthese, Struktur, Eigenschaften, Anwendung, Lebensende");
    var defs = el("defs", {}, s);
    var m = el("marker", { id: "pL", viewBox: "0 0 10 10", refX: 8, refY: 5, markerWidth: 6, markerHeight: 6, orient: "auto" }, defs);
    el("path", { d: "M0 0 L10 5 L0 10 z", fill: "#5a6573" }, m);
    var BW = 150, BH = 56;
    var K = {
      roh: [85, 50, "Rohstoff", "Erdöl oder Acker? (5)", "#fdf1de"],
      mono: [340, 50, "Monomer", "C=C oder 2 funkt. Gruppen", "#e5eef9"],
      syn: [595, 50, "Synthese", "Polymerisation, Polykond. (2, 3)", "#f6e7f7"],
      str: [595, 165, "Struktur", "Ketten, Vernetzung, WW (1)", "#e6f2ea"],
      eig: [340, 165, "Eigenschaften", "thermoplastisch, elastisch …", "#e6f2ea"],
      anw: [85, 165, "Anwendung", "Funktionspolymere (4)", "#fdece4"],
      end: [340, 280, "Lebensende", "Recycling (6)", "#fdeceb"]
    };
    function rand(A, B) {
      var dx = B[0] - A[0], dy = B[1] - A[1];
      var tx = dx === 0 ? Infinity : (BW / 2 + 4) / Math.abs(dx), ty = dy === 0 ? Infinity : (BH / 2 + 4) / Math.abs(dy);
      var t = Math.min(tx, ty);
      return [A[0] + dx * t, A[1] + dy * t];
    }
    function v(a, b, beschr, dyText) {
      var A = K[a], B = K[b], p1 = rand(A, B), p2 = rand(B, A);
      el("line", { x1: p1[0], y1: p1[1], x2: p2[0], y2: p2[1], stroke: "#5a6573", "stroke-width": 2, "marker-end": "url(#pL)" }, s);
      if (beschr) txt(s, (p1[0] + p2[0]) / 2 + (dyText ? 8 : 0), (p1[1] + p2[1]) / 2 - 7 + (dyText || 0), beschr, { "font-size": 11, fill: "#5a6573", "text-anchor": dyText ? "start" : "middle" });
    }
    v("roh", "mono", "liefert"); v("mono", "syn", "reagiert in"); v("syn", "str", "bestimmt", 10); v("str", "eig", "erklärt"); v("eig", "anw", "ermöglicht");
    v("anw", "end", "bestimmt", 0); v("str", "end", "bestimmt");
    for (var k in K) {
      var d = K[k];
      el("rect", { x: d[0] - BW / 2, y: d[1] - BH / 2, width: BW, height: BH, rx: 14, fill: d[4], stroke: "#d9e0ea" }, s);
      txt(s, d[0], d[1] - 3, d[2], { "font-weight": 700 });
      txt(s, d[0], d[1] + 15, d[3], { "font-size": 10.5, fill: "#5a6573" });
    }
  };

  document.querySelectorAll("[data-grafik]").forEach(function (g) {
    var f = GRAFIKEN[g.getAttribute("data-grafik")];
    if (f) { try { f(g); } catch (e) { if (window.console) console.error("Grafik", g.getAttribute("data-grafik"), e); } }
  });
})();
