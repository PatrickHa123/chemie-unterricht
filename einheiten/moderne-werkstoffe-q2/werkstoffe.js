/* Moderne Werkstoffe – gemeinsame Funktionen (Navigation, Selbsttests, Ich-kann-Listen, Zuordnungen) */
(function () {
  "use strict";

  var SEITEN = [
    { datei: "index.html", kurz: "Übersicht" },
    { datei: "0-kunststoff-detektive.html", kurz: "0 Detektive" },
    { datei: "1-struktur-eigenschaften.html", kurz: "1 Struktur & Eigenschaften" },
    { datei: "2-polymerisation.html", kurz: "2 Polymerisation" },
    { datei: "3-polyester.html", kurz: "3 Polyester" },
    { datei: "4-funktionspolymere.html", kurz: "4 Funktionspolymere" },
    { datei: "5-rohstoffe.html", kurz: "5 Rohstoffe" },
    { datei: "6-recycling.html", kurz: "6 Recycling" },
    { datei: "7-produkt-pitch.html", kurz: "7 Produkt-Pitch" }
  ];

  var SPEICHER = "moderneWerkstoffeQ2_v1";
  var S = {};
  try { S = JSON.parse(localStorage.getItem(SPEICHER)) || {}; } catch (e) { S = {}; }
  function speichern() { try { localStorage.setItem(SPEICHER, JSON.stringify(S)); } catch (e) {} }

  var aktuell = document.body.getAttribute("data-seite");

  /* Navigation */
  var nav = document.querySelector(".nav");
  if (nav && aktuell) {
    var ul = document.createElement("ul");
    SEITEN.forEach(function (s) {
      var li = document.createElement("li");
      var a = document.createElement("a");
      a.href = s.datei; a.textContent = s.kurz;
      if (s.datei === aktuell) a.setAttribute("aria-current", "page");
      li.appendChild(a); ul.appendChild(li);
    });
    nav.appendChild(ul);
    var akt = nav.querySelector('[aria-current="page"]');
    if (akt && akt.scrollIntoView) { nav.scrollLeft = akt.offsetLeft - 20; }
  }

  /* Vor / Zurück */
  var weiter = document.querySelector(".weiter");
  if (weiter && aktuell) {
    var i = SEITEN.findIndex(function (s) { return s.datei === aktuell; });
    if (i > 0) {
      var z = document.createElement("a");
      z.className = "zurueck"; z.href = SEITEN[i - 1].datei; z.textContent = "← " + SEITEN[i - 1].kurz;
      weiter.appendChild(z);
    } else { weiter.appendChild(document.createElement("span")); }
    if (i > -1 && i < SEITEN.length - 1) {
      var w = document.createElement("a");
      w.href = SEITEN[i + 1].datei; w.textContent = SEITEN[i + 1].kurz + " →";
      weiter.appendChild(w);
    }
  }

  /* Selbsttests: .frage[data-richtig] mit button.option[data-o] und optional data-fb */
  document.querySelectorAll(".quiz").forEach(function (quiz) {
    var fragen = quiz.querySelectorAll(".frage");
    var stand = quiz.querySelector(".stand");
    var geloest = 0;
    function zeigeStand() {
      if (stand) stand.textContent = geloest + " von " + fragen.length + " Fragen beim ersten Versuch richtig";
    }
    fragen.forEach(function (f) {
      var richtig = f.getAttribute("data-richtig");
      var fb = f.querySelector(".feedback");
      var erster = true;
      f.querySelectorAll("button.option").forEach(function (b) {
        b.type = "button";
        b.addEventListener("click", function () {
          var ok = b.getAttribute("data-o") === richtig;
          b.classList.add(ok ? "richtig" : "falsch");
          if (fb) fb.textContent = (ok ? "✔ Richtig! " : "✘ Noch nicht. ") + (b.getAttribute("data-fb") || (ok ? "" : "Lies die Begründung und versuche es noch einmal."));
          if (ok && erster) { geloest++; zeigeStand(); }
          if (ok) { f.querySelectorAll("button.option").forEach(function (x) { x.disabled = true; }); }
          erster = false;
        });
      });
    });
    zeigeStand();
  });

  /* Ich-kann-Listen */
  S.ichkann = S.ichkann || {};
  document.querySelectorAll(".ichkann input[type=checkbox]").forEach(function (cb) {
    var k = (aktuell || "") + ":" + cb.getAttribute("data-k");
    cb.checked = !!S.ichkann[k];
    cb.addEventListener("change", function () { S.ichkann[k] = cb.checked; speichern(); });
  });

  /* Zuordnungsspiele: .karte[data-ziel] auf .korb[data-korb] */
  document.querySelectorAll(".zuordnen").forEach(function (z) {
    var gewaehlt = null;
    var meldung = z.querySelector(".meldung");
    var karten = z.querySelectorAll(".karte");
    var rest = karten.length;
    karten.forEach(function (k) {
      k.type = "button";
      k.addEventListener("click", function () {
        if (k.classList.contains("fertig")) return;
        karten.forEach(function (x) { x.classList.remove("aktiv"); });
        k.classList.add("aktiv"); gewaehlt = k;
        if (meldung) meldung.textContent = "Tippe jetzt auf die passende Gruppe.";
      });
    });
    z.querySelectorAll(".korb").forEach(function (korb) {
      korb.type = "button";
      korb.addEventListener("click", function () {
        if (!gewaehlt) { if (meldung) meldung.textContent = "Wähle zuerst eine Karte aus."; return; }
        if (gewaehlt.getAttribute("data-ziel") === korb.getAttribute("data-korb")) {
          var s = document.createElement("span"); s.textContent = gewaehlt.textContent; korb.appendChild(s);
          gewaehlt.classList.remove("aktiv"); gewaehlt.classList.add("fertig"); gewaehlt.disabled = true;
          rest--;
          if (meldung) meldung.textContent = rest ? "✔ Passt! " + (gewaehlt.getAttribute("data-fb") || "") : "🎉 Alles richtig zugeordnet!";
          gewaehlt = null;
        } else {
          if (meldung) meldung.textContent = "✘ Passt nicht. " + (gewaehlt.getAttribute("data-tipp") || "Denk an die Struktur der Makromoleküle.");
        }
      });
    });
  });

  /* Alle Eingaben löschen */
  var loeschen = document.getElementById("alles-loeschen");
  if (loeschen) {
    loeschen.addEventListener("click", function () {
      try { localStorage.removeItem(SPEICHER); } catch (e) {}
      S = {};
      document.querySelectorAll(".ichkann input").forEach(function (cb) { cb.checked = false; });
      loeschen.textContent = "Gelöscht ✔";
    });
  }
})();
