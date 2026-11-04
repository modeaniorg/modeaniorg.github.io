/* Modé Ani — Tarjeta Plus popup.
   - Any [data-plus-open] button (header pill, banner, link under the download) opens it, always.
   - After any card download it opens 1.5 s later: at most once per page visit, never after the
     visitor has signed up (localStorage "modeani-plus" = "done").
   - Unprompted (20 s after reading the prayer section) only for visitors who never saw it.
   Signups go to MODEANI_CONFIG.plusEndpoint (Google Apps Script: Sheet + automatic email).
   ?plus=1 in the URL opens it on demand. */
(function () {
  var CFG = window.MODEANI_CONFIG || {}, I18N = window.MODEANI_I18N || {};
  var KEY = "modeani-plus", DELAY = 20000;
  var $ = function (s) { return document.querySelector(s); };
  var box, form, lastFocus, timer = null, armed = false, sentEmail = "", shownThisVisit = false;

  function seen() { try { return !!localStorage.getItem(KEY); } catch (e) { return false; } }
  function signedUp() { try { return localStorage.getItem(KEY) === "done"; } catch (e) { return false; } }
  function mark(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }
  function lang() { var s = $("#lang-select"); var l = (s && s.value) || "es"; return I18N[l] && I18N[l].plus ? l : "es"; }
  function t(k) { var l = lang(); return (I18N[l].plus && I18N[l].plus[k]) || I18N.es.plus[k] || ""; }


  /* The Plus Card in the visitor's language: PDF for the download button, cover thumbnail.
     A language without its own file yet falls back to English (then Spanish). */
  var PLUS_PDF = {"es": "assets/cards/modeani-tarjeta-plus.pdf", "en": "assets/cards/plus/ModehAni_PlusCard_EN.pdf", "pt": "assets/cards/plus/ModeAni_CartaoPlus_PT.pdf", "it": "assets/cards/plus/ModeAni_SchedaPlus_IT.pdf", "fr": "assets/cards/plus/ModeAni_CartePlus_FR.pdf", "de": "assets/cards/plus/ModeAni_PlusKarte_DE.pdf", "ru": "assets/cards/plus/ModeAni_KartochkaPlus_RU.pdf", "he": "assets/cards/plus/ModehAni_KartisPlus_HE.pdf", "ar": "assets/cards/plus/ModehAni_BitaqaPlus_AR.pdf", "sw": "assets/cards/plus/ModeAni_KadiYaPlus_SW.pdf", "am": "assets/cards/plus/ModeAni_PlusCard_AM.pdf", "zh": "assets/cards/plus/ModeAni_PlusCard_ZH.pdf", "hi": "assets/cards/plus/ModeAni_PlusCard_HI.pdf"};
  var PLUS_NAME = {"es": "ModeAni_Tarjeta_Plus.pdf", "en": "ModehAni_PlusCard_EN.pdf", "pt": "ModeAni_CartaoPlus_PT.pdf", "it": "ModeAni_SchedaPlus_IT.pdf", "fr": "ModeAni_CartePlus_FR.pdf", "de": "ModeAni_PlusKarte_DE.pdf", "ru": "ModeAni_KartochkaPlus_RU.pdf", "he": "ModehAni_KartisPlus_HE.pdf", "ar": "ModehAni_BitaqaPlus_AR.pdf", "sw": "ModeAni_KadiYaPlus_SW.pdf", "am": "ModeAni_PlusCard_AM.pdf", "zh": "ModeAni_PlusCard_ZH.pdf", "hi": "ModeAni_PlusCard_HI.pdf"};
  var PLUS_READY = ["es", "en", "pt", "it", "fr", "de", "ru", "he", "ar", "sw", "am", "zh", "hi"];
  function plusLang() { var l = lang(); if (PLUS_READY.indexOf(l) >= 0) return l; return PLUS_READY.indexOf("en") >= 0 ? "en" : "es"; }
  function swapFiles() {
    var l = plusLang();
    var d = $("#plus-dl"); if (d) { d.href = PLUS_PDF[l]; d.setAttribute("download", PLUS_NAME[l]); }
    Array.prototype.forEach.call(document.querySelectorAll(".plus-thumb,.plus-banner-thumb"), function (im) { im.src = "assets/img/plus/" + l + ".jpg"; });
  }
  function relabel() {
    var w = form && form.elements.whatsapp; if (w) w.placeholder = t("whatsappPh");
    var x = $("#plus-x"); if (x) x.setAttribute("aria-label", t("close"));
    swapFiles();
    var done = $("#plus-done-text"); if (done && done.getAttribute("data-k")) done.textContent = t(done.getAttribute("data-k")).replace("{email}", sentEmail);
  }

  function open(force) {
    if (!box || !CFG.plusEndpoint) return;
    if (!box.hidden) return;
    if (force === "download") { if (signedUp() || shownThisVisit || document.fullscreenElement) return; }
    else if (!force && (seen() || shownThisVisit || document.fullscreenElement)) return;
    clearTimeout(timer); shownThisVisit = true; if (!signedUp()) mark("shown"); relabel();
    var er = $("#plus-err"); if (er) er.hidden = true;
    ["name", "email"].forEach(function (n) { form.elements[n].classList.remove("invalid"); });
    lastFocus = document.activeElement;
    box.hidden = false; document.documentElement.classList.add("plus-open");
    requestAnimationFrame(function () { box.classList.add("in"); });
    // Phones: no autofocus, so the keyboard does not cover the card before they read it.
    var fine = window.matchMedia && window.matchMedia("(pointer: fine)").matches;
    if (fine) setTimeout(function () { var n = form.elements.name; if (n && !$("#plus-step-form").hidden) n.focus({ preventScroll: true }); }, 350);
  }
  function close() {
    if (!box || box.hidden) return;
    box.classList.remove("in"); document.documentElement.classList.remove("plus-open");
    setTimeout(function () { box.hidden = true; }, 220);
    if (lastFocus && lastFocus.focus) try { lastFocus.focus({ preventScroll: true }); } catch (e) {}
  }

  function done(key) {
    $("#plus-step-form").hidden = true; $("#plus-step-done").hidden = false; box.querySelector(".plus-card").classList.add("is-done");
    var p = $("#plus-done-text"); p.setAttribute("data-k", key); p.textContent = t(key).replace("{email}", sentEmail);
    $("#plus-done-title").hidden = key !== "thanksText";
    mark("done");
    setTimeout(function () { var d = $("#plus-dl"); if (d) d.focus({ preventScroll: true }); }, 50);
  }

  function submit(e) {
    e.preventDefault();
    var f = form.elements, err = $("#plus-err"), bad = null;
    var name = f.name.value.trim(), email = f.email.value.trim();
    f.name.classList.toggle("invalid", !name); f.email.classList.toggle("invalid", !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email));
    if (!name) bad = ["errName", f.name]; else if (f.email.classList.contains("invalid")) bad = ["errEmail", f.email];
    if (bad) { err.textContent = t(bad[0]); err.hidden = false; bad[1].focus(); return; }
    err.hidden = true;
    if (f.website.value) { sentEmail = email; done("thanksText"); return; }
    var btn = $("#plus-submit"), label = btn.querySelector("span");
    btn.disabled = true; label.textContent = t("sending");
    var body = new URLSearchParams({ name: name, email: email, country: f.country.value.trim(), whatsapp: f.whatsapp.value.trim(),
      optin: f.optin.checked ? "1" : "0", lang: lang(), page: location.href.split("#")[0], website: "" });
    sentEmail = email;
    // The server saves the row at once; sending the email can take up to ~40 s. Wait for its answer
    // up to 8 s, then show the thank-you anyway (the request keeps running and the mail still goes).
    var settled = false;
    var finish = function (key) { if (settled) return; settled = true; done(key); btn.disabled = false; label.textContent = t("submit"); };
    setTimeout(function () { finish("thanksText"); }, 8000);
    fetch(CFG.plusEndpoint, { method: "POST", body: body })
      .then(function (r) { return r.json(); })
      .then(function (j) { finish(j && j.ok ? "thanksText" : "errNet"); })
      .catch(function () { finish("errNet"); });
  }

  function arm() {
    if (armed || seen()) return; armed = true;
    timer = setTimeout(function () { open(false); }, DELAY);
  }

  function init() {
    box = $("#plus"); form = $("#plus-form");
    if (!box || !form || !CFG.plusEndpoint) return;
    form.addEventListener("submit", submit);
    ["#plus-x", "#plus-later", "#plus-close2"].forEach(function (s) { var b = $(s); if (b) b.addEventListener("click", close); });
    box.addEventListener("click", function (e) { if (e.target === box) close(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });
    var sel = $("#lang-select"); if (sel) sel.addEventListener("change", function () { setTimeout(relabel, 0); });
    document.addEventListener("modeani:lang", function () { setTimeout(relabel, 0); });
    relabel();
    // Permanent entry points: header pill, banner, link under the download button.
    document.addEventListener("click", function (e) {
      var b = e.target.closest && e.target.closest("[data-plus-open]");
      if (b) { e.preventDefault(); open(true); }
    });
    // Trigger 1: any card download (every link to assets/cards/modeani-*, outside the popup itself)
    // -> popup a moment later, once per page visit, unless they already signed up. If the download
    // took the visitor away (a PDF viewer, a new tab), it opens when they come back to the page.
    var pending = false;
    var showAfterDownload = function () {
      if (document.visibilityState === "hidden") { pending = true; return; }
      open("download");
    };
    document.addEventListener("visibilitychange", function () {
      if (pending && document.visibilityState === "visible") { pending = false; setTimeout(function () { open("download"); }, 700); }
    });
    document.addEventListener("click", function (e) {
      var a = e.target.closest && e.target.closest('a[href*="assets/cards/modeani-"]');
      if (!a || a.closest("#plus") || signedUp() || shownThisVisit) return;
      setTimeout(showAfterDownload, 1500);
    });
    // Trigger 2: the visitor read the prayer section (scrolled past its middle) -> 20 s later.
    var pr = $("#oracion");
    var onScroll = function () {
      if (armed || !pr) return;
      var r = pr.getBoundingClientRect();
      if (r.bottom < window.innerHeight * 0.55) { arm(); window.removeEventListener("scroll", onScroll); }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    if (/[?&]plus=1\b/.test(location.search)) setTimeout(function () { open(true); }, 600);
    window.ModeAniPlus = { open: function () { open(true); }, close: close };
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
