/* Prüflabor pH – gemeinsame Funktionen
   Keine Daten verlassen das Gerät. Gespeichert wird nur lokal (localStorage). */
(function () {
  "use strict";

  /* ---------- Speicher ---------- */
  var PRE = "sal10:";
  function lies(k, d) { try { var v = localStorage.getItem(PRE + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } }
  function schreib(k, v) { try { localStorage.setItem(PRE + k, JSON.stringify(v)); } catch (e) { /* privat-Modus */ } }
  window.LaborSpeicher = {
    lies: lies, schreib: schreib,
    loescheAlles: function () {
      try { Object.keys(localStorage).forEach(function (k) { if (k.indexOf(PRE) === 0) localStorage.removeItem(k); }); } catch (e) {}
    }
  };

  var SEITEN = [
    { f: "index.html", t: "Start", k: "Start" },
    { f: "1-sauer.html", t: "Sauer macht …", k: "1" },
    { f: "2-alkalisch.html", t: "Die Laugen-Akte", k: "2" },
    { f: "3-protonen.html", t: "Protonen-Pingpong", k: "3" },
    { f: "4-ph-wert.html", t: "Zehnmal saurer", k: "4" },
    { f: "5-neutralisation.html", t: "Gegenspieler", k: "5" },
    { f: "6-titration.html", t: "Wie viel steckt drin?", k: "6" },
    { f: "7-risiko.html", t: "Risiko oder Nutzen?", k: "7" },
    { f: "8-escape.html", t: "Das versiegelte Labor", k: "8" }
  ];
  var FARBEN = ["#d7263d", "#f06a2a", "#f7c325", "#a9cf3c", "#4caf50", "#2a9d8f", "#3557a8", "#5e2d91"];
  window.LaborFarben = FARBEN;

  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function el(tag, attrs, html) {
    var e = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (a) { e.setAttribute(a, attrs[a]); });
    if (html !== undefined) e.innerHTML = html;
    return e;
  }

  /* ---------- Navigation ---------- */
  function baueNav() {
    var nav = $(".nav"); if (!nav) return;
    var aktuell = document.body.getAttribute("data-seite");
    var stempel = lies("stempel", {});
    var ul = el("ul");
    SEITEN.forEach(function (s, i) {
      var li = el("li"), a = el("a", { href: s.f });
      if (s.f === aktuell) a.setAttribute("aria-current", "page");
      var p = el("span", { "class": "punkt", "aria-hidden": "true" });
      if (i > 0 && stempel[i]) { p.classList.add("fertig"); p.style.background = FARBEN[i - 1]; }
      a.appendChild(p);
      a.appendChild(document.createTextNode(i === 0 ? s.t : i + " · " + s.t));
      if (i > 0 && stempel[i]) a.setAttribute("title", "Prüfsiegel erhalten");
      li.appendChild(a); ul.appendChild(li);
    });
    nav.appendChild(ul);
    var cur = $("a[aria-current]", nav);
    if (cur && cur.scrollIntoView) { try { cur.scrollIntoView({ block: "nearest", inline: "center" }); } catch (e) {} }
  }

  /* ---------- Laborausweis (Fortschritt) ---------- */
  function baueAusweis() {
    $$(".ausweis .streifen").forEach(function (st) {
      var stempel = lies("stempel", {});
      st.innerHTML = "";
      for (var i = 1; i <= 8; i++) {
        var f = el("div", { "class": "feld", title: SEITEN[i].t }, String(i));
        if (stempel[i]) { f.classList.add("fertig"); f.style.background = FARBEN[i - 1]; f.innerHTML = i + "<br>✓"; }
        st.appendChild(f);
      }
      var anz = Object.keys(stempel).filter(function (k) { return stempel[k]; }).length;
      var info = st.parentNode.querySelector(".anzahl");
      if (info) info.textContent = anz + " von 8 Prüfsiegeln";
    });
  }

  /* ---------- Prüfsiegel (Ich-kann-Liste am Seitenende) ---------- */
  function baueStempel() {
    $$(".stempel").forEach(function (box) {
      var nr = box.getAttribute("data-auftrag");
      var gespeichert = lies("ichkann-" + nr, {});
      var boxen = $$("input[type=checkbox]", box);
      boxen.forEach(function (cb, i) {
        cb.checked = !!gespeichert[i];
        cb.addEventListener("change", function () { gespeichert[i] = cb.checked; schreib("ichkann-" + nr, gespeichert); });
      });
      var knopf = $(".siegel", box), info = $(".siegel-info", box);
      var stempel = lies("stempel", {});
      if (stempel[nr]) box.classList.add("fertig");
      if (knopf) knopf.addEventListener("click", function () {
        var offen = boxen.filter(function (c) { return !c.checked; });
        if (offen.length) {
          info.textContent = "Noch " + offen.length + " Punkt(e) offen. Schau dir diese Stellen noch einmal an – oder frag dein Team. Ehrlich ankreuzen lohnt sich!";
          return;
        }
        var s = lies("stempel", {}); s[nr] = true; schreib("stempel", s);
        box.classList.add("fertig");
        info.textContent = "Prüfsiegel " + nr + " ist in deinem Laborausweis (Startseite).";
        var nav = $(".nav"); if (nav) { nav.innerHTML = ""; baueNav(); }
        baueAusweis();
      });
    });
  }

  /* ---------- Lösungen erst nach eigener Antwort ---------- */
  function baueLoesungen() {
    $$("details.loesung").forEach(function (d) {
      var sum = $("summary", d);
      sum.addEventListener("click", function (ev) {
        if (d.open || d.getAttribute("data-frei") === "1") return;
        ev.preventDefault();
        if ($(".sperre", d.parentNode) && d.nextElementSibling && d.nextElementSibling.classList.contains("sperre")) return;
        var s = el("div", { "class": "sperre" });
        s.innerHTML = '<label><input type="checkbox"> <span>Ich habe eine eigene Antwort im Heft notiert und will sie jetzt vergleichen.</span></label>';
        d.parentNode.insertBefore(s, d.nextSibling);
        $("input", s).addEventListener("change", function () {
          d.setAttribute("data-frei", "1"); d.open = true; s.remove();
        });
      });
    });
  }

  /* ---------- PhET mit Zwei-Klick-Lösung ---------- */
  function bauePhet() {
    $$(".sim[data-sim]").forEach(function (box) {
      var name = box.getAttribute("data-sim");
      var extra = box.getAttribute("data-param") || "";
      var url = "https://phet.colorado.edu/sims/html/" + name + "/latest/" + name + "_all.html?locale=de" + (extra ? "&" + extra : "");
      var titel = box.getAttribute("data-titel") || "PhET-Simulation";
      var auftrag = box.innerHTML;
      box.innerHTML = "";
      var kopf = el("div", { "class": "simkopf" });
      kopf.innerHTML = "<div><small>Simulation · PhET, University of Colorado Boulder</small><br><strong>🎛️ " + titel + "</strong></div>";
      var neu = el("a", { href: url, target: "_blank", rel: "noopener", "class": "knopf" }, "In neuem Tab öffnen ↗");
      kopf.appendChild(neu);
      box.appendChild(kopf);
      var platz = el("div", { "class": "platz" });
      platz.innerHTML = "<p style='margin-top:0'>Die Simulation kommt von <strong>phet.colorado.edu</strong>. Erst wenn du auf „Hier laden“ tippst, wird sie von dort geladen (dabei wird deine IP-Adresse an PhET übertragen).</p>";
      var laden = el("button", { "class": "knopf voll", type: "button" }, "▶ Simulation hier laden");
      laden.addEventListener("click", function () {
        var f = el("iframe", { src: url, title: titel, allow: "fullscreen", loading: "lazy" });
        platz.replaceWith(f);
      });
      platz.appendChild(laden);
      box.appendChild(platz);
      if (auftrag.trim()) { var a = el("div", { "class": "auftrag" }, auftrag); box.appendChild(a); }
    });
  }

  /* ---------- Einzelfragen ---------- */
  function baueFragen() {
    $$(".frage").forEach(function (f) {
      var r = parseInt(f.getAttribute("data-richtig"), 10);
      var knoepfe = $$(".optionen button", f), rueck = $(".rueck", f);
      knoepfe.forEach(function (b, i) {
        b.type = "button";
        b.addEventListener("click", function () {
          knoepfe.forEach(function (x) { x.classList.remove("ok", "nein"); });
          if (i === r) { b.classList.add("ok"); rueck.innerHTML = "✅ " + (f.getAttribute("data-ja") || "Richtig!"); }
          else { b.classList.add("nein"); rueck.innerHTML = "❌ " + (b.getAttribute("data-tipp") || f.getAttribute("data-nein") || "Noch nicht – lies die Frage noch einmal genau."); }
        });
      });
    });
  }

  /* ---------- Sortieraufgaben ---------- */
  function baueSortier() {
    $$(".sortier").forEach(function (s) {
      var id = s.getAttribute("data-id");
      var opt = (s.getAttribute("data-optionen") || "").split("|");
      var modus = s.getAttribute("data-modus") || "pruefen";
      var gespeichert = lies("sort-" + id, {});
      $$(".zeile", s).forEach(function (z, i) {
        var sel = el("select", { "aria-label": "Zuordnung für: " + z.textContent.trim() });
        sel.appendChild(el("option", { value: "" }, "– wählen –"));
        opt.forEach(function (o) { sel.appendChild(el("option", { value: o }, o)); });
        if (gespeichert[i]) sel.value = gespeichert[i];
        sel.addEventListener("change", function () { gespeichert[i] = sel.value; schreib("sort-" + id, gespeichert); z.classList.remove("ok", "nein"); });
        var t = el("span", {}, z.innerHTML); z.innerHTML = ""; z.appendChild(t); z.appendChild(sel);
      });
      var steuer = el("div", { "class": "steuer", style: "margin-top:8px;display:flex;gap:8px;flex-wrap:wrap;align-items:center" });
      var info = el("span", { "class": "rueck" });
      if (modus === "pruefen") {
        var k = el("button", { "class": "knopf voll", type: "button" }, "Prüfen");
        k.addEventListener("click", function () {
          var ok = 0, z = $$(".zeile", s);
          z.forEach(function (zeile) {
            var v = $("select", zeile).value, l = zeile.getAttribute("data-loesung");
            zeile.classList.remove("ok", "nein");
            if (v) zeile.classList.add(v === l ? "ok" : "nein");
            if (v === l) ok++;
          });
          info.textContent = ok + " von " + z.length + " richtig." + (ok === z.length ? " Stark!" : " Rote Zeilen noch einmal überdenken.");
        });
        steuer.appendChild(k);
      } else {
        info.textContent = "Deine Zuordnung wird nur auf diesem Gerät gespeichert. Aufgelöst wird am Ende der Reihe.";
      }
      steuer.appendChild(info);
      s.appendChild(steuer);
    });
  }

  /* ---------- Concept-Cartoon ---------- */
  function baueCartoon() {
    $$(".cartoon").forEach(function (c) {
      var id = c.getAttribute("data-id");
      var gesp = lies("cartoon-" + id, {});
      $$(".blase", c).forEach(function (b, i) {
        var w = el("div", { "class": "wahl3", role: "group", "aria-label": "Deine Einschätzung" });
        ["👍 stimmt", "🤔 unsicher", "👎 stimmt nicht"].forEach(function (t, j) {
          var k = el("button", { type: "button", "aria-pressed": gesp[i] === j ? "true" : "false" }, t);
          k.addEventListener("click", function () {
            gesp[i] = j; schreib("cartoon-" + id, gesp);
            $$("button", w).forEach(function (x, n) { x.setAttribute("aria-pressed", n === j ? "true" : "false"); });
          });
          w.appendChild(k);
        });
        b.appendChild(w);
      });
    });
  }

  /* ---------- Kompetenzraster ---------- */
  function baueRaster() {
    $$("table.raster").forEach(function (t) {
      var id = t.getAttribute("data-id"), g = lies("raster-" + id, {});
      $$("tr[data-zeile]", t).forEach(function (tr) {
        var z = tr.getAttribute("data-zeile");
        $$("input", tr).forEach(function (inp) {
          inp.name = id + "-" + z;
          if (g[z] === inp.value) inp.checked = true;
          inp.addEventListener("change", function () { g[z] = inp.value; schreib("raster-" + id, g); });
        });
      });
    });
  }

  /* ---------- Glossar ---------- */
  var GLOSSAR = [
    ["Saure Lösung", "Wässrige Lösung, die Hydronium-Ionen (H₃O⁺) im Überschuss enthält; pH-Wert kleiner als 7. Alltagssprache: „Säure“."],
    ["Alkalische Lösung", "Wässrige Lösung, die Hydroxid-Ionen (OH⁻) im Überschuss enthält; pH-Wert größer als 7. Alltagssprache: „Lauge“."],
    ["Neutrale Lösung", "Lösung, in der gleich viele H₃O⁺- und OH⁻-Ionen vorliegen; pH = 7 (bei 25 °C)."],
    ["Säure (nach Brønsted)", "Teilchen, das ein Proton (H⁺) abgibt: Protonendonator. Beispiel: HCl-Molekül."],
    ["Base (nach Brønsted)", "Teilchen, das ein Proton aufnimmt: Protonenakzeptor. Es braucht dafür ein freies Elektronenpaar. Beispiel: NH₃-Molekül, OH⁻-Ion."],
    ["Lauge", "Alltagswort für eine alkalische Lösung, z. B. Natronlauge. In der Fachsprache sagt man besser „alkalische Lösung“."],
    ["Hydronium-Ion", "H₃O⁺: Wassermolekül, das ein Proton aufgenommen hat. Typisch für saure Lösungen. (Auch: Oxonium-Ion.)"],
    ["Hydroxid-Ion", "OH⁻: negativ geladenes Ion. Typisch für alkalische Lösungen."],
    ["Säurerest-Ion", "Das Ion, das von einem Säuremolekül übrig bleibt, wenn es ein Proton abgegeben hat, z. B. Cl⁻ (Chlorid), Acetat (Ac⁻), SO₄²⁻ (Sulfat)."],
    ["Proton", "H⁺: Wasserstoff-Atom ohne sein Elektron – also nur ein positiv geladener Atomkern."],
    ["Protolyse", "Reaktion, bei der ein Proton von einer Säure auf eine Base übertragen wird (Säure-Base-Reaktion)."],
    ["Säure-Base-Paar", "Zwei Teilchen, die sich nur um ein Proton unterscheiden, z. B. HCl/Cl⁻ oder H₃O⁺/H₂O."],
    ["Ampholyt", "Teilchen, das je nach Partner als Säure oder als Base reagieren kann. Wichtigstes Beispiel: das Wassermolekül."],
    ["Indikator", "Farbstoff, dessen Farbe vom pH-Wert abhängt, z. B. Universalindikator, Bromthymolblau, Phenolphthalein, Rotkohlsaft."],
    ["pH-Wert", "Zahl von etwa 0 bis 14, die angibt, wie sauer oder alkalisch eine Lösung ist. Eine Stufe weniger bedeutet: zehnmal mehr H₃O⁺-Ionen."],
    ["Stoffmenge n", "Teilchenanzahl in „Päckchen“: 1 mol = 6,022 · 10²³ Teilchen. Einheit: mol."],
    ["Molare Masse M", "Masse von 1 mol eines Stoffes. Einheit: g/mol. M = m : n."],
    ["Stoffmengenkonzentration c", "Stoffmenge pro Volumen der Lösung: c = n : V. Einheit: mol/L."],
    ["Verdünnen", "Lösung mit Wasser auffüllen: Die Stoffmenge bleibt gleich, das Volumen wird größer, die Konzentration kleiner."],
    ["Neutralisation", "Reaktion einer sauren mit einer alkalischen Lösung: H₃O⁺ + OH⁻ → 2 H₂O. Dabei wird Wärme frei."],
    ["Salz", "Stoff aus positiv und negativ geladenen Ionen, z. B. Natriumchlorid (Na⁺Cl⁻). Entsteht u. a. bei der Neutralisation, wenn man das Wasser verdampft."],
    ["Titration", "Messverfahren: Man gibt eine Maßlösung mit bekannter Konzentration zu einer Probelösung, bis der Indikator umschlägt, und berechnet daraus die unbekannte Konzentration."],
    ["Maßlösung", "Lösung mit genau bekannter Konzentration, die bei der Titration zugegeben wird (z. B. Natronlauge, c = 0,1 mol/L)."],
    ["Äquivalenzpunkt", "Punkt der Titration, an dem genau so viele OH⁻-Ionen zugegeben wurden, wie H₃O⁺-Ionen (bzw. Säureteilchen) vorhanden waren."],
    ["Bürette", "Senkrecht eingespanntes Glasrohr mit Skala und Hahn, aus dem die Maßlösung tropfenweise abgelassen wird."],
    ["Elektrische Leitfähigkeit", "Eine Lösung leitet den Strom, wenn sie frei bewegliche Ionen enthält."],
    ["Knallgasprobe", "Nachweis für Wasserstoff: Ein Gemisch mit Luft verbrennt an der Flamme mit pfeifendem Knall."],
    ["Ätzend", "Zerstört Haut, Augen und andere Materialien. GHS05-Piktogramm. Saure und alkalische Lösungen hoher Konzentration sind ätzend."],
    ["GHS-Piktogramm", "Rautenförmiges Gefahrensymbol mit rotem Rand auf Etiketten, z. B. GHS05 „ätzend“, GHS07 „Achtung“."]
  ];
  function baueGlossar() {
    if (document.body.hasAttribute("data-ohne-glossar")) return;
    var k = el("button", { "class": "knopf voll glossar-knopf", type: "button", "aria-expanded": "false", "aria-controls": "glossar" }, "📖 Fachbegriffe");
    var g = el("aside", { "class": "glossar", id: "glossar", "aria-label": "Glossar" });
    g.innerHTML = '<header><strong>📖 Fachbegriffe</strong><button class="knopf" type="button">Schließen ✕</button></header>' +
      '<div class="liste"><input type="search" placeholder="Begriff suchen …" aria-label="Begriff suchen"><dl></dl></div>';
    var dl = $("dl", g);
    GLOSSAR.forEach(function (e) { dl.appendChild(el("dt", { "data-q": e[0].toLowerCase() }, e[0])); dl.appendChild(el("dd", { "data-q": (e[0] + " " + e[1]).toLowerCase() }, e[1])); });
    document.body.appendChild(k); document.body.appendChild(g);
    function auf(b) { g.classList.toggle("offen", b); k.setAttribute("aria-expanded", b ? "true" : "false"); if (b) $("input", g).focus(); }
    k.addEventListener("click", function () { auf(!g.classList.contains("offen")); });
    $("header button", g).addEventListener("click", function () { auf(false); k.focus(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") auf(false); });
    $("input", g).addEventListener("input", function () {
      var q = this.value.toLowerCase().trim();
      $$("dt", dl).forEach(function (dt) {
        var dd = dt.nextElementSibling, treffer = !q || dd.getAttribute("data-q").indexOf(q) > -1;
        dt.style.display = dd.style.display = treffer ? "" : "none";
      });
    });
    $$("dfn").forEach(function (d) {
      var t = (d.getAttribute("data-g") || d.textContent).toLowerCase();
      var e = GLOSSAR.filter(function (x) { return x[0].toLowerCase().indexOf(t) === 0 || t.indexOf(x[0].toLowerCase().split(" ")[0]) === 0; })[0];
      if (e) { d.setAttribute("title", e[0] + ": " + e[1]); d.setAttribute("tabindex", "0"); }
    });
  }

  /* =======================================================
     Visualisierungen
     ======================================================= */
  var NS = "http://www.w3.org/2000/svg";
  function sv(tag, a, txt) { var e = document.createElementNS(NS, tag); for (var k in a) e.setAttribute(k, a[k]); if (txt !== undefined) e.textContent = txt; return e; }
  var ATOM = { H: { r: 11, f: "#ffffff", s: "#6b7280" }, O: { r: 19, f: "#e11d48", s: "#9f1239" }, Cl: { r: 22, f: "#22c55e", s: "#15803d" },
               N: { r: 19, f: "#3b82f6", s: "#1d4ed8" }, Na: { r: 20, f: "#a855f7", s: "#7e22ce" }, Mg: { r: 22, f: "#9ca3af", s: "#4b5563" } };
  function atom(sym, x, y) {
    var g = sv("g", {}), a = ATOM[sym];
    g.appendChild(sv("circle", { cx: x, cy: y, r: a.r, fill: a.f, stroke: a.s, "stroke-width": 2 }));
    g.appendChild(sv("text", { x: x, y: y + 5, "text-anchor": "middle", "font-size": sym.length > 1 ? 13 : 14, "font-weight": 700, fill: sym === "H" ? "#111" : "#fff", "font-family": "sans-serif" }, sym));
    return g;
  }
  function gruppe(svg, teile, x, y) {
    var g = sv("g", { "class": "beweg" });
    g.style.transition = "transform .9s ease, opacity .6s";
    teile.forEach(function (t) { g.appendChild(t); });
    svg.appendChild(g); setze(g, x, y, 1); return g;
  }
  function setze(g, x, y, o) { g.style.transform = "translate(" + x + "px," + y + "px)"; g.style.opacity = (o === undefined ? 1 : o); }
  function label(svg, txt, x, y, farbe, gr) { var t = sv("text", { x: x, y: y, "text-anchor": "middle", "font-size": gr || 15, fill: farbe || "#1f2a37", "font-family": "sans-serif", "font-weight": 600 }, txt); t.style.transition = "opacity .5s"; svg.appendChild(t); return t; }
  function paar(x, y) { var g = sv("g", {}); g.appendChild(sv("circle", { cx: x - 4, cy: y, r: 2.6, fill: "#111" })); g.appendChild(sv("circle", { cx: x + 4, cy: y, r: 2.6, fill: "#111" })); return g; }

  /* Wassermolekül-Bausteine (relativ zu 0,0 = O-Mittelpunkt) */
  function wasserTeile(mitPaar) {
    var t = [sv("line", { x1: 0, y1: 0, x2: -22, y2: 20, stroke: "#6b7280", "stroke-width": 4 }), sv("line", { x1: 0, y1: 0, x2: 22, y2: 20, stroke: "#6b7280", "stroke-width": 4 }),
             atom("O", 0, 0), atom("H", -24, 22), atom("H", 24, 22)];
    if (mitPaar) { t.push(paar(-14, -24)); t.push(paar(14, -24)); }
    return t;
  }

  var REAKTIONEN = {
    hcl: {
      titel: "HCl-Molekül + Wassermolekül",
      bau: function (svg) {
        var cl = gruppe(svg, [atom("Cl", 0, 0), paar(-24, -18), paar(-30, 6), paar(-12, 26)], 120, 110);
        var lpCl = gruppe(svg, [paar(28, 0)], 120, 110, 0);
        var h = gruppe(svg, [atom("H", 0, 0)], 152, 110);
        var w = gruppe(svg, wasserTeile(false).concat([paar(14, -24)]), 360, 120);
        var lp = gruppe(svg, [paar(-14, -24)], 360, 120);
        var elPaar = gruppe(svg, [sv("circle", { cx: 0, cy: 0, r: 9, fill: "none", stroke: "#f59e0b", "stroke-width": 3, "stroke-dasharray": "4 3" })], 346, 96, 0);
        var lCl = label(svg, "", 120, 190), lW = label(svg, "", 360, 190), plus = label(svg, "+", 240, 118, "#1f2a37", 26);
        return function (s) {
          if (s === 0) { setze(lp, 360, 120, 1); setze(lpCl, 120, 110, 0); setze(cl, 120, 110); setze(h, 152, 110); setze(w, 360, 120); setze(elPaar, 346, 96, 0); lCl.textContent = "HCl"; lW.textContent = "H₂O"; plus.textContent = "+"; }
          if (s === 1) { setze(lp, 290, 120, 1); setze(lpCl, 170, 110, 0); setze(cl, 170, 110); setze(h, 202, 110); setze(w, 290, 120); setze(elPaar, 276, 96, 1); plus.textContent = ""; lCl.textContent = "δ+ am H-Atom"; lW.textContent = "freies Elektronenpaar"; }
          if (s === 2) { setze(lp, 290, 120, 0); setze(lpCl, 170, 110, 1); setze(cl, 170, 110); setze(h, 276, 82); setze(w, 290, 120); setze(elPaar, 276, 96, 0); lCl.textContent = "Cl⁻"; lW.textContent = "H₃O⁺"; }
          if (s === 3) { setze(lp, 360, 120, 0); setze(lpCl, 110, 110, 1); setze(cl, 110, 110); setze(h, 346, 82); setze(w, 360, 120); setze(elPaar, 276, 96, 0); lCl.textContent = "Chlorid-Ion Cl⁻"; lW.textContent = "Hydronium-Ion H₃O⁺"; plus.textContent = "+"; }
        };
      },
      texte: [
        "Ein Chlorwasserstoff-Molekül (HCl) trifft auf ein Wassermolekül. Das Cl-Atom zieht das gemeinsame Elektronenpaar stark an – das H-Atom ist dadurch positiv teilgeladen (δ+).",
        "Das O-Atom des Wassermoleküls hat zwei freie Elektronenpaare. Eins davon „greift“ nach dem positiv teilgeladenen H-Atom.",
        "Das H-Atom wird <strong>ohne sein Elektron</strong> übergeben – also als Proton (H⁺). Das Elektronenpaar der alten Bindung bleibt beim Cl.",
        "Ergebnis: ein Hydronium-Ion (H₃O⁺) und ein Chlorid-Ion (Cl⁻). HCl war der <strong>Protonendonator (Säure)</strong>, H₂O der <strong>Protonenakzeptor (Base)</strong>."
      ],
      gleichung: "HCl + H₂O → H₃O⁺ + Cl⁻"
    },
    nh3: {
      titel: "Ammoniak-Molekül + Wassermolekül",
      bau: function (svg) {
        var n = gruppe(svg, [sv("line", { x1: 0, y1: 0, x2: -26, y2: 18, stroke: "#6b7280", "stroke-width": 4 }), sv("line", { x1: 0, y1: 0, x2: 26, y2: 18, stroke: "#6b7280", "stroke-width": 4 }), sv("line", { x1: 0, y1: 0, x2: 0, y2: 30, stroke: "#6b7280", "stroke-width": 4 }),
          atom("N", 0, 0), atom("H", -28, 20), atom("H", 28, 20), atom("H", 0, 34)], 120, 100);
        var lpN = gruppe(svg, [paar(0, -26)], 120, 100);
        var w = gruppe(svg, [sv("line", { x1: 0, y1: 0, x2: 22, y2: 20, stroke: "#6b7280", "stroke-width": 4 }), atom("O", 0, 0), atom("H", 24, 22), paar(-14, -24), paar(14, -24)], 360, 110);
        var lpW = gruppe(svg, [paar(-26, 4)], 360, 110, 0);
        var h = gruppe(svg, [atom("H", 0, 0)], 336, 132);
        var lN = label(svg, "", 120, 190), lW = label(svg, "", 360, 190), plus = label(svg, "+", 240, 118, "#1f2a37", 26);
        return function (s) {
          if (s === 0) { setze(lpN, 120, 100, 1); setze(lpW, 360, 110, 0); setze(n, 120, 100); setze(w, 360, 110); setze(h, 336, 132); lN.textContent = "NH₃"; lW.textContent = "H₂O"; plus.textContent = "+"; }
          if (s === 1) { setze(lpN, 175, 100, 1); setze(lpW, 300, 110, 0); setze(n, 175, 100); setze(w, 300, 110); setze(h, 276, 132); plus.textContent = ""; lN.textContent = "freies Elektronenpaar am N"; lW.textContent = "δ+ am H-Atom"; }
          if (s === 2) { setze(lpN, 175, 100, 0); setze(lpW, 300, 110, 1); setze(n, 175, 100); setze(w, 300, 110); setze(h, 175, 70); lN.textContent = "NH₄⁺"; lW.textContent = "OH⁻"; }
          if (s === 3) { setze(lpN, 120, 100, 0); setze(lpW, 370, 110, 1); setze(n, 120, 100); setze(w, 370, 110); setze(h, 120, 70); lN.textContent = "Ammonium-Ion NH₄⁺"; lW.textContent = "Hydroxid-Ion OH⁻"; plus.textContent = "+"; }
        };
      },
      texte: [
        "Ein Ammoniak-Molekül (NH₃) trifft auf ein Wassermolekül. Am N-Atom sitzt ein freies Elektronenpaar.",
        "Das freie Elektronenpaar des N-Atoms zieht ein positiv teilgeladenes H-Atom des Wassermoleküls an.",
        "Das Wassermolekül gibt ein <strong>Proton</strong> ab. Das Bindungselektronenpaar bleibt am O-Atom – es entsteht ein OH⁻-Ion.",
        "Ergebnis: Ammonium-Ion (NH₄⁺) und Hydroxid-Ion (OH⁻) – die Lösung ist alkalisch. Hier ist <strong>Wasser die Säure</strong> und NH₃ die Base!"
      ],
      gleichung: "NH₃ + H₂O → NH₄⁺ + OH⁻"
    },
    wasser: {
      titel: "Wassermolekül + Wassermolekül",
      bau: function (svg) {
        var w1 = gruppe(svg, [sv("line", { x1: 0, y1: 0, x2: -22, y2: 20, stroke: "#6b7280", "stroke-width": 4 }), atom("O", 0, 0), atom("H", -24, 22), paar(-14, -24), paar(14, -24)], 120, 110);
        var lpD = gruppe(svg, [paar(26, 4)], 120, 110, 0);
        var h = gruppe(svg, [atom("H", 0, 0)], 144, 132);
        var w2 = gruppe(svg, wasserTeile(false).concat([paar(14, -24)]), 360, 120);
        var lp2 = gruppe(svg, [paar(-14, -24)], 360, 120);
        var l1 = label(svg, "", 120, 190), l2 = label(svg, "", 360, 190), plus = label(svg, "+", 240, 118, "#1f2a37", 26);
        return function (s) {
          if (s === 0) { setze(lp2, 360, 120, 1); setze(lpD, 120, 110, 0); setze(w1, 120, 110); setze(h, 144, 132); setze(w2, 360, 120); l1.textContent = "H₂O"; l2.textContent = "H₂O"; plus.textContent = "+"; }
          if (s === 1) { setze(lp2, 300, 125, 1); setze(lpD, 170, 110, 0); setze(w1, 170, 110); setze(h, 194, 132); setze(w2, 300, 125); plus.textContent = ""; l1.textContent = "gibt ab?"; l2.textContent = "nimmt auf?"; }
          if (s === 2) { setze(lp2, 300, 125, 0); setze(lpD, 170, 110, 1); setze(w1, 170, 110); setze(h, 286, 90); setze(w2, 300, 125); l1.textContent = "OH⁻"; l2.textContent = "H₃O⁺"; }
          if (s === 3) { setze(lp2, 360, 120, 0); setze(lpD, 110, 110, 1); setze(w1, 110, 110); setze(h, 346, 85); setze(w2, 360, 120); l1.textContent = "Hydroxid-Ion"; l2.textContent = "Hydronium-Ion"; plus.textContent = "+"; }
        };
      },
      texte: [
        "Zwei Wassermoleküle. Beide haben polare O–H-Bindungen <em>und</em> freie Elektronenpaare.",
        "Ein Wassermolekül kann einem anderen ein Proton geben – es kommt nur auf den Partner an.",
        "Ein Molekül wirkt als Säure (gibt H⁺ ab), das andere als Base (nimmt H⁺ auf).",
        "Wasser ist ein <strong>Ampholyt</strong>. In reinem Wasser passiert das nur extrem selten: Bei 25 °C ist nur etwa eines von 550 Millionen Wassermolekülen betroffen."
      ],
      gleichung: "H₂O + H₂O ⇌ H₃O⁺ + OH⁻"
    }
  };

  function vizProtolyse(box) {
    var r = REAKTIONEN[box.getAttribute("data-reaktion") || "hcl"];
    box.innerHTML = '<p class="titel">Animation · ' + r.titel + "</p>";
    var svg = sv("svg", { viewBox: "0 0 480 210", role: "img", "aria-label": "Teilchenmodell: " + r.gleichung });
    svg.appendChild(sv("rect", { x: 0, y: 0, width: 480, height: 210, rx: 10, fill: "#f8fbff" }));
    box.appendChild(svg);
    var zeige = r.bau(svg);
    var text = el("p", { "class": "text", "aria-live": "polite" });
    var gl = el("div", { "class": "gl" }, "&nbsp;");
    var st = el("div", { "class": "steuer" });
    var zur = el("button", { "class": "knopf", type: "button" }, "◀ zurück"), vor = el("button", { "class": "knopf voll", type: "button" }, "weiter ▶");
    var nr = el("span", { style: "font-family:var(--mono);font-size:.85rem" });
    st.appendChild(zur); st.appendChild(vor); st.appendChild(nr);
    box.appendChild(text); box.appendChild(gl); box.appendChild(st);
    var s = 0;
    function upd() { zeige(s); text.innerHTML = r.texte[s]; nr.textContent = "Schritt " + (s + 1) + " / 4"; zur.disabled = s === 0; vor.disabled = s === 3; gl.innerHTML = s === 3 ? r.gleichung : "&nbsp;"; }
    zur.onclick = function () { if (s > 0) { s--; upd(); } };
    vor.onclick = function () { if (s < 3) { s++; upd(); } };
    upd();
  }

  /* --- Indikator-Farbtabelle --- */
  function universal(ph) {
    var stops = [[0, "#c0182a"], [1, "#d7263d"], [2, "#e8402f"], [3, "#f06a2a"], [4, "#f59a23"], [5, "#f7c325"], [6, "#c9cf35"], [7, "#4caf50"], [8, "#2a9d8f"], [9, "#2b7bb9"], [10, "#3557a8"], [11, "#4b3f9c"], [12, "#5e2d91"], [13, "#6d2386"], [14, "#5a1a6e"]];
    var i = Math.max(0, Math.min(14, Math.round(ph))); return stops[i][1];
  }
  window.LaborUniversal = universal;
  function rotkohl(ph) { if (ph < 3) return "#d61f69"; if (ph < 5) return "#c04a9b"; if (ph < 7) return "#8e4fb5"; if (ph < 8) return "#5b5fc7"; if (ph < 9.5) return "#3b82c4"; if (ph < 11) return "#2aa198"; if (ph < 12.5) return "#7fbf3f"; return "#d9c832"; }
  function rotkohlName(ph) { if (ph < 3) return "rot"; if (ph < 5) return "pink"; if (ph < 7) return "violett"; if (ph < 8) return "blauviolett"; if (ph < 9.5) return "blau"; if (ph < 11) return "blaugrün"; if (ph < 12.5) return "grün"; return "gelb"; }
  function btb(ph) { return ph < 6 ? ["#e8c51b", "gelb"] : ph <= 7.6 ? ["#5aa83a", "grün"] : ["#2d5fb3", "blau"]; }
  function pp(ph) { return ph < 8.2 ? ["#f4f4f4", "farblos"] : ["#e0468a", "pink"]; }
  function uniName(ph) { var n = ["dunkelrot", "rot", "rot", "orangerot", "orange", "gelborange", "gelb", "grün", "blaugrün", "blau", "dunkelblau", "blauviolett", "violett", "violett", "dunkelviolett"]; return n[Math.max(0, Math.min(14, Math.round(ph)))]; }

  function vizIndikator(box) {
    var stoffe = [["Magensaft", 1.5], ["Zitronensaft", 2.4], ["Cola", 2.6], ["Essig", 2.9], ["Apfelsaft", 3.5], ["Kaffee", 5], ["Mineralwasser (mit Kohlensäure)", 5.5], ["Leitungswasser", 7.4], ["Natron-Lösung", 8.3], ["Seifenlösung", 9.5], ["Ammoniak-Reiniger", 11.3], ["Abflussreiniger (gelöst)", 13.5]];
    box.innerHTML = '<p class="titel">Interaktiv · Indikator-Labor</p>';
    var wahl = el("div", { "class": "steuer", style: "margin-top:0" });
    var lab = el("label", { style: "display:block;width:100%" }, "Stoff auswählen: ");
    var sel = el("select", { style: "font:inherit;padding:6px;border-radius:6px;min-height:40px;max-width:100%" });
    sel.appendChild(el("option", { value: "" }, "– Stoff wählen –"));
    stoffe.forEach(function (s, i) { sel.appendChild(el("option", { value: i }, s[0])); });
    lab.appendChild(sel); wahl.appendChild(lab); box.appendChild(wahl);
    var svg = sv("svg", { viewBox: "0 0 480 190", role: "img", "aria-label": "Vier Reagenzgläser mit Indikatoren" });
    var namen = ["Universalindikator", "Rotkohlsaft", "Bromthymolblau", "Phenolphthalein"], fl = [], txt = [];
    namen.forEach(function (n, i) {
      var x = 60 + i * 120;
      svg.appendChild(sv("rect", { x: x - 22, y: 20, width: 44, height: 120, rx: 22, fill: "#ffffff", stroke: "#94a3b8", "stroke-width": 2 }));
      var f = sv("rect", { x: x - 19, y: 60, width: 38, height: 77, rx: 19, fill: "#e5e7eb" }); f.style.transition = "fill .6s"; fl.push(f); svg.appendChild(f);
      svg.appendChild(sv("text", { x: x, y: 160, "text-anchor": "middle", "font-size": 12, fill: "#1f2a37", "font-family": "sans-serif" }, n));
      var t = sv("text", { x: x, y: 178, "text-anchor": "middle", "font-size": 12, fill: "#4b5563", "font-family": "sans-serif", "font-style": "italic" }, "–"); txt.push(t); svg.appendChild(t);
    });
    box.appendChild(svg);
    var aus = el("p", { "class": "text", "aria-live": "polite" }, "Wähle einen Stoff. Notiere im Heft die Farben – und ordne den Stoff ein: sauer, neutral oder alkalisch?");
    box.appendChild(aus);
    var zeigePH = box.getAttribute("data-ph") === "ja";
    sel.addEventListener("change", function () {
      if (sel.value === "") return;
      var ph = stoffe[sel.value][1];
      var farben = [[universal(ph), uniName(ph)], [rotkohl(ph), rotkohlName(ph)], btb(ph), pp(ph)];
      farben.forEach(function (f, i) { fl[i].setAttribute("fill", f[0]); txt[i].textContent = f[1]; });
      aus.innerHTML = "<strong>" + stoffe[sel.value][0] + "</strong>: " + (zeigePH ? "pH ≈ " + String(ph).replace(".", ",") + ". " : "") + "Welche Indikatoren helfen dir hier wirklich weiter – und welche nicht?";
    });
  }

  /* --- pH-Leiter: Konzentration und Verdünnung --- */
  function hoch(n) { var m = { "-": "⁻", "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹" }; return String(n).split("").map(function (c) { return m[c] || c; }).join(""); }
  function vizPH(box) {
    box.innerHTML = '<p class="titel">Interaktiv · pH-Leiter</p>';
    var lab = el("label", {}, 'pH-Wert: <strong class="wert">1</strong>');
    var r = el("input", { type: "range", min: 0, max: 14, step: 1, value: 1, "aria-label": "pH-Wert" });
    box.appendChild(lab); box.appendChild(r);
    var svg = sv("svg", { viewBox: "0 0 480 230", role: "img", "aria-label": "Balken: Konzentration der Hydronium- und Hydroxid-Ionen" });
    box.appendChild(svg);
    // Skala
    svg.appendChild(sv("rect", { x: 0, y: 0, width: 480, height: 230, rx: 10, fill: "#fbfaf6" }));
    for (var i = 0; i <= 14; i++) {
      var x = 30 + i * 30;
      svg.appendChild(sv("line", { x1: x, y1: 40, x2: x, y2: 190, stroke: "#e5e1d3" }));
      svg.appendChild(sv("text", { x: x, y: 206, "text-anchor": "middle", "font-size": 10, fill: "#4b5563", "font-family": "sans-serif" }, "×10"));
    }
    svg.appendChild(sv("text", { x: 240, y: 224, "text-anchor": "middle", "font-size": 11, fill: "#4b5563", "font-family": "sans-serif" }, "Balkenlänge = Anzahl der Zehnerstufen (jedes Kästchen: zehnmal mehr Ionen)"));
    var b1 = sv("rect", { x: 30, y: 60, height: 40, width: 10, fill: "#d7263d", rx: 4 }), b2 = sv("rect", { x: 30, y: 130, height: 40, width: 10, fill: "#3557a8", rx: 4 });
    b1.style.transition = b2.style.transition = "width .5s";
    svg.appendChild(b1); svg.appendChild(b2);
    var t1 = sv("text", { x: 34, y: 54, "font-size": 13, "font-weight": 700, fill: "#9f1239", "font-family": "sans-serif" }, "H₃O⁺");
    var t2 = sv("text", { x: 34, y: 124, "font-size": 13, "font-weight": 700, fill: "#1e3a8a", "font-family": "sans-serif" }, "OH⁻");
    svg.appendChild(t1); svg.appendChild(t2);
    var info = el("div", { "class": "text", "aria-live": "polite" });
    box.appendChild(info);
    var st = el("div", { "class": "steuer" });
    var verd = el("button", { "class": "knopf voll", type: "button" }, "💧 1 : 10 mit Wasser verdünnen");
    var reset = el("button", { "class": "knopf", type: "button" }, "↺ neu: Salzsäure pH 1");
    st.appendChild(verd); st.appendChild(reset); box.appendChild(st);
    var verduennt = 0, phEcht = 1;
    function zeichne(ph) {
      var w1 = Math.max(6, (14 - ph) * 30), w2 = Math.max(6, ph * 30);
      // Balkenlänge = wie viele Zehnerstufen über 10^-14
      b1.setAttribute("width", w1); b2.setAttribute("width", w2);
      $(".wert", lab).textContent = String(Math.round(ph * 10) / 10).replace(".", ",");
      var faktor = Math.pow(10, Math.abs(7 - Math.round(ph)));
      var art = ph < 6.95 ? "sauer" : ph > 7.05 ? "alkalisch" : "neutral";
      info.innerHTML = "Die Lösung ist <strong>" + art + "</strong>" +
        (art === "neutral" ? ": gleich viele H₃O⁺- und OH⁻-Ionen." : ": etwa " + faktor.toLocaleString("de-DE") + "-mal so viele " + (art === "sauer" ? "H₃O⁺" : "OH⁻") + "-Ionen wie in neutralem Wasser – und entsprechend weniger " + (art === "sauer" ? "OH⁻" : "H₃O⁺") + "-Ionen.");
    }
    r.addEventListener("input", function () { verduennt = 0; phEcht = +r.value; zeichne(phEcht); });
    verd.addEventListener("click", function () {
      verduennt++;
      // Salzsäure: c = 10^-pH0 / 10^n ; Wasser-Beitrag 1e-7 berücksichtigen
      var c = Math.pow(10, -phEcht) / 10;
      var h = c / 2 + Math.sqrt(c * c / 4 + 1e-14);
      phEcht = -Math.log10(h);
      r.value = Math.round(phEcht);
      zeichne(phEcht);
      if (phEcht > 6.9) info.innerHTML += "<br>🤔 Weiter verdünnen bringt fast nichts mehr. Wird verdünnte Salzsäure irgendwann alkalisch?";
    });
    reset.addEventListener("click", function () { phEcht = 1; r.value = 1; verduennt = 0; zeichne(1); });
    zeichne(1);
  }

  /* --- Neutralisation im Teilchenmodell --- */
  function vizNeutral(box) {
    box.innerHTML = '<p class="titel">Interaktiv · Neutralisation im Becherglas (Teilchenmodell)</p>';
    var svg = sv("svg", { viewBox: "0 0 480 260", role: "img", "aria-label": "Becherglas mit Ionen, in das Natronlauge getropft wird" });
    box.appendChild(svg);
    var bg = sv("path", { d: "M90 40 L90 230 Q90 245 105 245 L375 245 Q390 245 390 230 L390 40", fill: "#fff", stroke: "#64748b", "stroke-width": 3 });
    var fluessig = sv("rect", { x: 92, y: 80, width: 296, height: 163, fill: "#f7e27a", opacity: .55 }); fluessig.style.transition = "fill .8s";
    svg.appendChild(fluessig); svg.appendChild(bg);
    var schicht = sv("g", {}); svg.appendChild(schicht);
    var zaehl = sv("text", { x: 240, y: 26, "text-anchor": "middle", "font-size": 13, "font-family": "sans-serif", fill: "#1f2a37" }, "");
    svg.appendChild(zaehl);
    var text = el("p", { "class": "text", "aria-live": "polite" });
    var st = el("div", { "class": "steuer" });
    var tropf = el("button", { "class": "knopf voll", type: "button" }, "💧 1 Tropfen Natronlauge");
    var neu = el("button", { "class": "knopf", type: "button" }, "↺ von vorn");
    st.appendChild(tropf); st.appendChild(neu); box.appendChild(text); box.appendChild(st);
    var teilchen;
    function ion(art) {
      var g = sv("g", {}); g.style.transition = "transform 1s ease, opacity .8s";
      var farben = { h3o: ["#e11d48", "H₃O⁺"], cl: ["#22c55e", "Cl⁻"], na: ["#a855f7", "Na⁺"], oh: ["#2563eb", "OH⁻"], h2o: ["#94a3b8", "H₂O"] };
      var f = farben[art];
      g.appendChild(sv("circle", { cx: 0, cy: 0, r: art === "h2o" ? 13 : 15, fill: f[0], opacity: art === "h2o" ? .55 : .9 }));
      g.appendChild(sv("text", { x: 0, y: 4, "text-anchor": "middle", "font-size": 10, "font-weight": 700, fill: "#fff", "font-family": "sans-serif" }, f[1]));
      schicht.appendChild(g); return { g: g, art: art };
    }
    function zufall() { return [110 + Math.random() * 260, 100 + Math.random() * 130]; }
    function platz(t, p, o) { t.p = p; t.g.style.transform = "translate(" + p[0] + "px," + p[1] + "px)"; t.g.style.opacity = o === undefined ? 1 : o; }
    function anzahl(a) { return teilchen.filter(function (t) { return t.art === a && !t.weg; }).length; }
    function farbe() {
      var h = anzahl("h3o"), o = anzahl("oh");
      fluessig.setAttribute("fill", h > o ? "#f2d03b" : o > h ? "#2d5fb3" : "#5aa83a");
      zaehl.textContent = "H₃O⁺: " + h + "   OH⁻: " + o + "   Cl⁻: " + anzahl("cl") + "   Na⁺: " + anzahl("na") + "   H₂O (neu): " + anzahl("h2o");
    }
    function start() {
      schicht.innerHTML = ""; teilchen = [];
      for (var i = 0; i < 4; i++) { var a = ion("h3o"); platz(a, zufall()); teilchen.push(a); var b = ion("cl"); platz(b, zufall()); teilchen.push(b); }
      farbe(); tropf.disabled = false;
      text.innerHTML = "Im Becherglas: Salzsäure mit Bromthymolblau. Welche Ionen siehst du? Tropfe Natronlauge dazu und beobachte <em>genau</em>, was mit den Ionen passiert.";
    }
    var tropfen = 0;
    tropf.addEventListener("click", function () {
      tropfen++;
      var na = ion("na"), oh = ion("oh");
      platz(na, [230, 10], 0); platz(oh, [250, 10], 0);
      teilchen.push(na); teilchen.push(oh);
      setTimeout(function () { platz(na, zufall()); platz(oh, [240, 110]); }, 30);
      setTimeout(function () {
        var partner = teilchen.filter(function (t) { return t.art === "h3o" && !t.weg; })[0];
        if (partner) {
          platz(oh, partner.p);
          setTimeout(function () {
            partner.weg = true; oh.weg = true; partner.g.style.opacity = 0; oh.g.style.opacity = 0;
            var w1 = ion("h2o"), w2 = ion("h2o"); platz(w1, partner.p, 0); platz(w2, partner.p, 0);
            teilchen.push(w1); teilchen.push(w2);
            setTimeout(function () { platz(w1, zufall()); platz(w2, zufall()); farbe(); }, 40);
            text.innerHTML = "H₃O⁺ + OH⁻ → 2 H₂O. Ein Proton ist vom Hydronium-Ion zum Hydroxid-Ion gewandert. Und Na⁺ und Cl⁻? Die bleiben einfach, wie sie sind.";
            if (anzahl("h3o") === 0) text.innerHTML += " <strong>Jetzt ist die Lösung neutral (grün).</strong> Was passiert beim nächsten Tropfen?";
          }, 1000);
        } else {
          farbe();
          text.innerHTML = "Kein H₃O⁺-Ion mehr da – das OH⁻-Ion bleibt übrig. Die Lösung wird <strong>alkalisch</strong> (blau). Zu viel Natronlauge ist also auch nicht neutral!";
        }
      }, 1100);
    });
    neu.addEventListener("click", function () { tropfen = 0; start(); });
    start();
  }

  /* --- Virtuelle Titration --- */
  function vizTitration(box) {
    var proben = {
      essig: { name: "Haushaltsessig (1 : 10 verdünnt), 10 mL", ka: 1.8e-5, c: [0.075, 0.08, 0.085, 0.09, 0.095][Math.floor(Math.random() * 5)] },
      salz: { name: "Salzsäure unbekannter Konzentration, 10 mL", ka: null, c: [0.05, 0.06, 0.07, 0.08, 0.12][Math.floor(Math.random() * 5)] }
    };
    var cB = 0.1, V0 = 10;
    box.innerHTML = '<p class="titel">Interaktiv · Titrations-Simulator</p>';
    var wahl = el("div", { "class": "steuer", style: "margin-top:0" });
    var sel = el("select", { style: "font:inherit;padding:6px;border-radius:6px;min-height:40px", "aria-label": "Probe wählen" });
    sel.appendChild(el("option", { value: "essig" }, proben.essig.name)); sel.appendChild(el("option", { value: "salz" }, proben.salz.name));
    wahl.appendChild(el("span", {}, "Probe:")); wahl.appendChild(sel); box.appendChild(wahl);
    var svg = sv("svg", { viewBox: "0 0 480 280", role: "img", "aria-label": "Bürette über Erlenmeyerkolben und pH-Kurve" });
    box.appendChild(svg);
    // Bürette
    svg.appendChild(sv("rect", { x: 70, y: 10, width: 24, height: 160, fill: "#f8fafc", stroke: "#64748b", "stroke-width": 2 }));
    var lauge = sv("rect", { x: 72, y: 12, width: 20, height: 156, fill: "#dbeafe" }); svg.appendChild(lauge);
    for (var i = 0; i <= 25; i += 5) { var y = 12 + i * 156 / 25; svg.appendChild(sv("line", { x1: 94, y1: y, x2: 102, y2: y, stroke: "#64748b" })); svg.appendChild(sv("text", { x: 104, y: y + 4, "font-size": 9, fill: "#475569", "font-family": "sans-serif" }, i + " mL")); }
    svg.appendChild(sv("rect", { x: 78, y: 170, width: 8, height: 20, fill: "#94a3b8" }));
    var tropfen = sv("circle", { cx: 82, cy: 196, r: 4, fill: "#93c5fd", opacity: 0 }); svg.appendChild(tropfen);
    // Kolben
    svg.appendChild(sv("path", { d: "M70 205 L70 220 L35 268 L129 268 L94 220 L94 205", fill: "#fff", stroke: "#64748b", "stroke-width": 2 }));
    var inhalt = sv("path", { d: "M52 245 L112 245 L129 268 L35 268 Z", fill: "#f4f4f4", stroke: "none" }); inhalt.style.transition = "fill .6s"; svg.appendChild(inhalt);
    // Diagramm
    var ox = 200, oy = 250, bw = 260, bh = 220;
    svg.appendChild(sv("rect", { x: ox, y: oy - bh, width: bw, height: bh, fill: "#fbfaf6", stroke: "#cbd5e1" }));
    for (var p = 0; p <= 14; p += 2) { var yy = oy - p / 14 * bh; svg.appendChild(sv("line", { x1: ox, y1: yy, x2: ox + bw, y2: yy, stroke: "#eee" })); svg.appendChild(sv("text", { x: ox - 4, y: yy + 3, "text-anchor": "end", "font-size": 9, fill: "#475569", "font-family": "sans-serif" }, p)); }
    for (var v = 0; v <= 25; v += 5) { var xx = ox + v / 25 * bw; svg.appendChild(sv("text", { x: xx, y: oy + 12, "text-anchor": "middle", "font-size": 9, fill: "#475569", "font-family": "sans-serif" }, v)); }
    svg.appendChild(sv("text", { x: ox + bw / 2, y: oy + 26, "text-anchor": "middle", "font-size": 10, fill: "#475569", "font-family": "sans-serif" }, "V(Natronlauge) in mL"));
    svg.appendChild(sv("text", { x: ox + 4, y: oy - bh - 6, "font-size": 10, fill: "#475569", "font-family": "sans-serif" }, "pH"));
    var kurve = sv("polyline", { points: "", fill: "none", stroke: "#0f766e", "stroke-width": 2.5 }); svg.appendChild(kurve);
    var anzeige = el("div", { "class": "text", "aria-live": "polite" }); box.appendChild(anzeige);
    var st = el("div", { "class": "steuer" });
    var k1 = el("button", { "class": "knopf voll", type: "button" }, "+ 1 mL"), k2 = el("button", { "class": "knopf", type: "button" }, "+ 0,1 mL (Tropfen)"), k3 = el("button", { "class": "knopf", type: "button" }, "↺ neu");
    var phAn = el("label", { style: "display:flex;gap:6px;align-items:center" }, '<input type="checkbox"> pH-Meter anzeigen');
    st.appendChild(k1); st.appendChild(k2); st.appendChild(k3); st.appendChild(phAn); box.appendChild(st);
    var V = 0, punkte = [], probe = "essig";
    function pH(Vb) {
      var pr = proben[probe], nS = pr.c * V0 / 1000, nB = cB * Vb / 1000, Vg = (V0 + Vb) / 1000;
      if (pr.ka === null) {
        var d = (nS - nB) / Vg;
        var h = d / 2 + Math.sqrt(d * d / 4 + 1e-14); return -Math.log10(h);
      }
      if (nB < nS * 0.999) {
        if (nB === 0) { var c = nS / Vg; return -Math.log10((-pr.ka + Math.sqrt(pr.ka * pr.ka + 4 * pr.ka * c)) / 2); }
        return -Math.log10(pr.ka) + Math.log10(nB / (nS - nB));
      }
      if (nB <= nS * 1.001) { var cA = nS / Vg; return 14 + Math.log10(Math.sqrt(1e-14 / pr.ka * cA)); }
      return 14 + Math.log10((nB - nS) / Vg);
    }
    function upd() {
      var p = pH(V);
      punkte.push([V, p]);
      kurve.setAttribute("points", punkte.map(function (q) { return (ox + q[0] / 25 * bw) + "," + (oy - Math.max(0, Math.min(14, q[1])) / 14 * bh); }).join(" "));
      var hoehe = 156 * (1 - V / 25); lauge.setAttribute("y", 12 + V / 25 * 156); lauge.setAttribute("height", Math.max(0, hoehe));
      inhalt.setAttribute("fill", p >= 8.2 ? (p > 10 ? "#d9367e" : "#f2a7c8") : "#f4f4f4");
      var zeigen = $("input", phAn).checked;
      anzeige.innerHTML = "Zugegeben: <strong>" + V.toFixed(1).replace(".", ",") + " mL</strong> Natronlauge (c = 0,1 mol/L)" + (zeigen ? " · pH-Meter: " + p.toFixed(1).replace(".", ",") : "") +
        (p >= 8.2 ? " · <strong>Farbumschlag: Phenolphthalein ist pink!</strong>" : " · Indikator: Phenolphthalein, noch farblos");
      k1.disabled = k2.disabled = V >= 25;
    }
    function zugabe(d) {
      tropfen.style.transition = "none"; tropfen.setAttribute("cy", 196); tropfen.style.opacity = 1;
      requestAnimationFrame(function () { tropfen.style.transition = "all .4s"; tropfen.setAttribute("cy", 240); tropfen.style.opacity = 0; });
      V = Math.min(25, Math.round((V + d) * 10) / 10); upd();
    }
    function neu() { V = 0; punkte = []; probe = sel.value; upd(); }
    k1.onclick = function () { zugabe(1); }; k2.onclick = function () { zugabe(0.1); }; k3.onclick = neu;
    sel.onchange = neu; $("input", phAn).onchange = function () { punkte.pop(); upd(); };
    // Prüfen der Rechnung
    var pruef = el("div", { "class": "code", style: "margin-top:12px" });
    pruef.innerHTML = '<label>Dein Ergebnis c(Säure) in mol/L: <input type="text" inputmode="decimal" placeholder="z. B. 0,07" style="text-transform:none;width:7em"></label> <button class="knopf" type="button">Ergebnis prüfen</button> <span class="rueck"></span>';
    box.appendChild(pruef);
    $("button", pruef).onclick = function () {
      var w = parseFloat($("input", pruef).value.replace(",", ".")), soll = proben[probe].c;
      var r = $(".rueck", pruef);
      if (isNaN(w)) { r.textContent = "Bitte eine Zahl eingeben."; return; }
      var abw = Math.abs(w - soll) / soll;
      r.innerHTML = abw < 0.04 ? "✅ Sehr genau titriert und richtig gerechnet!" : abw < 0.12 ? "🟡 Fast – hast du den Umschlagspunkt mit 0,1-mL-Schritten genau getroffen?" : "❌ Das passt noch nicht. Tipp: n(OH⁻) = c · V und am Äquivalenzpunkt gilt n(Säure) = n(OH⁻). Volumen in Liter!";
    };
    upd();
  }

  function baueViz() {
    $$(".viz[data-viz]").forEach(function (b) {
      var t = b.getAttribute("data-viz");
      try {
        if (t === "protolyse") vizProtolyse(b);
        if (t === "indikator") vizIndikator(b);
        if (t === "ph") vizPH(b);
        if (t === "neutral") vizNeutral(b);
        if (t === "titration") vizTitration(b);
      } catch (e) { b.innerHTML = "<p>Die Animation konnte nicht geladen werden.</p>"; if (window.console) console.error(e); }
    });
  }

  /* ---------- Escape-Labor ---------- */
  function baueEscape() {
    var schloesser = $$(".schloss[data-c]");
    if (!schloesser.length) return;
    var offen = lies("escape", {});
    function norm(s) { return s.toUpperCase().replace(/\s|,|\./g, "").replace(/Ä/g, "AE").replace(/Ö/g, "OE").replace(/Ü/g, "UE"); }
    function pruefeEnde() {
      var alle = schloesser.every(function (s) { return offen[s.id]; });
      var t = $(".tresor");
      if (t) t.hidden = !alle;
    }
    schloesser.forEach(function (s) {
      var soll = atob(s.getAttribute("data-c")).split("").reverse().join("");
      var inp = $("input", s), k = $("button", s), r = $(".rueck", s), stat = $(".status", s), belohn = $(".belohnung", s);
      function oeffne() { s.classList.add("offen"); stat.textContent = "🔓"; if (belohn) belohn.hidden = false; inp.disabled = true; k.disabled = true; }
      if (offen[s.id]) oeffne();
      k.addEventListener("click", function () {
        if (norm(inp.value) === norm(soll)) { offen[s.id] = true; schreib("escape", offen); oeffne(); r.textContent = "Klick! Das Schloss ist offen."; pruefeEnde(); }
        else { r.textContent = "Das Schloss bleibt zu. Prüfe deine Lösung noch einmal – die Tippkarte hilft."; }
      });
      inp.addEventListener("keydown", function (e) { if (e.key === "Enter") k.click(); });
    });
    pruefeEnde();
  }

  /* ---------- Check-out-Vergleich ---------- */
  function baueVergleich() {
    $$("[data-vergleich]").forEach(function (box) {
      var vorher = lies("sort-checkin", {}), nachher = lies("sort-checkout", {});
      var c1 = lies("cartoon-checkin", {}), c2 = lies("cartoon-checkout", {});
      var loes = (box.getAttribute("data-vergleich") || "").split("|");
      function punkte(a) { var n = 0; loes.forEach(function (l, i) { if (a[i] === l) n++; }); return n; }
      var k = el("button", { "class": "knopf voll", type: "button" }, "Vorher–nachher anzeigen");
      var aus = el("div", { "class": "text" });
      k.onclick = function () {
        nachher = lies("sort-checkout", {}); c2 = lies("cartoon-checkout", {});
        var hatVorher = Object.keys(vorher).length > 0;
        var wechsel = 0; Object.keys(c2).forEach(function (i) { if (c1[i] !== undefined && c1[i] !== c2[i]) wechsel++; });
        aus.innerHTML = (hatVorher ? "Check-in: <strong>" + punkte(vorher) + " von " + loes.length + "</strong> Stoffen richtig eingeordnet. " : "Zum Check-in sind auf diesem Gerät keine Antworten gespeichert. ") +
          "Check-out: <strong>" + punkte(nachher) + " von " + loes.length + "</strong>. " +
          (Object.keys(c1).length ? "Bei den Sprechblasen hast du deine Meinung <strong>" + wechsel + "-mal</strong> geändert. Notiere im Heft, bei welcher Aussage – und warum." : "");
      };
      box.appendChild(k); box.appendChild(aus);
    });
  }

  /* ---------- Löschen-Knopf ---------- */
  function baueLoeschen() {
    $$("[data-loeschen]").forEach(function (b) {
      b.addEventListener("click", function () {
        if (b.getAttribute("data-sicher") !== "1") { b.setAttribute("data-sicher", "1"); b.textContent = "Wirklich alles löschen? Nochmal tippen."; return; }
        window.LaborSpeicher.loescheAlles(); location.reload();
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    baueNav(); baueAusweis(); baueStempel(); baueLoesungen(); bauePhet(); baueFragen(); baueSortier();
    baueCartoon(); baueRaster(); baueGlossar(); baueViz(); baueEscape(); baueVergleich(); baueLoeschen();
  });
})();
