/* Modé Ani — language switching, prayer form, video & sharing. No backend, no tracking. */
(function () {
  "use strict";
  var CFG = window.MODEANI_CONFIG || {};
  var LANGS = window.MODEANI_LANGS || [];
  var I18N = window.MODEANI_I18N || {};
  var state = { lang: CFG.defaultLang || "es", gender: "m" };
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  function get(obj, path) {
    return path.split(".").reduce(function (o, k) { return o == null ? o : o[k]; }, obj);
  }
  function langInfo(code) { for (var i = 0; i < LANGS.length; i++) if (LANGS[i].code === code) return LANGS[i]; return null; }

  function detect() {
    try {
      var q = new URLSearchParams(location.search).get("lang");
      if (q && I18N[q]) return q;
    } catch (e) {}
    try { var saved = localStorage.getItem("modeani-lang"); if (saved && I18N[saved]) return saved; } catch (e) {}
    var prefs = (navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || ""]);
    for (var i = 0; i < prefs.length; i++) {
      var base = String(prefs[i] || "").toLowerCase().split("-")[0];
      if (base === "iw") base = "he";
      if (I18N[base]) return base;
    }
    return I18N[CFG.defaultLang] ? CFG.defaultLang : "es";
  }

  function campaignName(t) { return CFG.campaignName || t.campaignName || "Modé Ani"; }
  function tagline(t) { return (CFG.tagline && CFG.tagline[state.lang]) || t.ui.tagline; }
  function shareUrl() { return location.origin + "/" + (state.lang && state.lang !== "es" ? state.lang + "/" : ""); }

  function renderLists(t) {
    var cards = $("#why-cards");
    if (cards) {
      cards.innerHTML = "";
      t.ui.why.forEach(function (w, i) {
        var a = document.createElement("article"); a.className = "card";
        var n = document.createElement("span"); n.className = "card-num"; n.setAttribute("aria-hidden", "true"); n.textContent = String(i + 1);
        var h = document.createElement("h3"); h.textContent = w[0];
        var p = document.createElement("p"); p.textContent = w[1];
        a.appendChild(n); a.appendChild(h); a.appendChild(p); cards.appendChild(a);
      });
    }
    var steps = $("#how-steps");
    if (steps) {
      steps.innerHTML = "";
      t.ui.how.forEach(function (s, i) {
        var li = document.createElement("li");
        var n = document.createElement("span"); n.className = "step"; n.setAttribute("aria-hidden", "true"); n.textContent = String(i + 1);
        var p = document.createElement("p"); p.textContent = s;
        li.appendChild(n); li.appendChild(p); steps.appendChild(li);
      });
    }
  }

  function renderPrayer() {
    var t = I18N[state.lang], g = state.gender, info = langInfo(state.lang) || {};
    var fw = $("#first-word"); if (fw) fw.textContent = g === "f" ? "מוֹדָה" : "מוֹדֶה";
    var tr = $("#translit");
    if (tr) { tr.textContent = t.prayer.translit[g] || t.prayer.translit.m; tr.setAttribute("lang", info.htmlLang || state.lang); tr.setAttribute("dir", "auto"); }
    var tl = $("#translit-latin");
    if (tl) {
      var latin = t.prayer.translitLatin && (t.prayer.translitLatin[g] || t.prayer.translitLatin.m);
      tl.textContent = latin || ""; tl.hidden = !latin;
    }
    var tn = $("#translation"); if (tn) tn.textContent = t.prayer.translation[g] || t.prayer.translation.m;
    $$(".gender-btn").forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-gender") === g)); });
    wrapTranslit();
  }

  function renderShare() {
    var t = I18N[state.lang], url = shareUrl(), text = t.ui.shareText, body = text + "\n" + url;
    var E = encodeURIComponent;
    var subject = (t.ui.emailSubject || "") + " · " + campaignName(t);
    var set = function (id, href) { var a = $(id); if (a) a.href = href; };
    set("#share-wa", "https://wa.me/?text=" + E(body));
    set("#share-x", "https://twitter.com/intent/tweet?text=" + E(text) + "&url=" + E(url));
    set("#share-fb", "https://www.facebook.com/sharer/sharer.php?u=" + E(url) + "&quote=" + E(text));
    set("#share-tg", "https://t.me/share/url?url=" + E(url) + "&text=" + E(text));
    set("#share-mail", "mailto:?subject=" + E(subject) + "&body=" + E(body));
    var pv = $("#gift-preview"); if (pv) pv.textContent = "\u201c" + text + "\u201d";
  }

  /* Native share sheet (phones); falls back to copying text + link. */
  function nativeShare(onFallback) {
    var t = I18N[state.lang], url = shareUrl();
    if (navigator.share) {
      navigator.share({ title: t.meta.title, text: t.ui.shareText, url: url }).catch(function (e) {
        if (!e || e.name !== "AbortError") onFallback();
      });
    } else onFallback();
  }

  function renderSponsor(t) {
    var sp = CFG.sponsor || {}, box = $("#sponsor");
    if (!box) return;
    if (sp.show === false) { box.hidden = true; return; }
    var nm = $("#sponsor-name"); if (nm && sp.name) nm.textContent = sp.name;
    box.setAttribute("aria-label", t.ui.sponsorLabel);
  }


  function renderCards(t) {
    var c = state.lang;
    var png = $("#card-png"); if (png) { png.href = "assets/cards/modeani-" + c + ".jpg"; png.setAttribute("download", "modeani-" + c + ".jpg"); }
    var dl = $("#card-dl"); if (dl) { dl.href = "assets/cards/modeani-" + c + ".pdf"; dl.setAttribute("download", "modeani-" + c + ".pdf"); }
    var pdf = $("#card-pdf"); if (pdf) { pdf.href = "assets/cards/modeani-" + c + ".pdf"; pdf.setAttribute("download", "modeani-" + c + ".pdf"); }
    var th = $("#card-thumb"); if (th) { th.src = "assets/cards/modeani-" + c + ".jpg"; th.alt = t.ui.printTitle; }
    var pl = $("#card-preview-link"); if (pl) pl.href = "assets/cards/modeani-" + c + ".jpg";
  }

  function renderTestimonials(t) {
    var grid = $("#testi-grid"); if (!grid || !t.ui.testimonials) return;
    grid.innerHTML = "";
    t.ui.testimonials.forEach(function (x) {
      var f = document.createElement("figure"); f.className = "testi";
      var tag = document.createElement("span"); tag.className = "testi-tag"; tag.textContent = t.ui.exampleTag;
      var q = document.createElement("blockquote"); q.textContent = x[0];
      var cap = document.createElement("figcaption");
      var s = document.createElement("strong"); s.textContent = x[1];
      cap.appendChild(s); cap.appendChild(document.createTextNode(" \u00b7 " + x[2]));
      f.appendChild(tag); f.appendChild(q); f.appendChild(cap); grid.appendChild(f);
    });
    var th = $("#form-thanks"); if (th && !th.hidden) th.textContent = t.ui.formThanks;
  }

  /* Demo form: nothing is sent anywhere yet — it shows a thank-you state. */
  function initForm() {
    var form = $("#story-form"); if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = true;
      ["name", "story"].forEach(function (n) {
        var el = form.elements[n];
        var bad = !el.value.trim(); el.classList.toggle("invalid", bad); if (bad && ok) { el.focus(); ok = false; }
      });
      if (!ok) return;
      var th = $("#form-thanks"); th.textContent = I18N[state.lang].ui.formThanks; th.hidden = false;
      form.classList.add("sent");
    });
  }

  function apply(code) {
    if (!I18N[code]) code = "es";
    state.lang = code;
    var t = I18N[code], info = langInfo(code) || { dir: t.dir, htmlLang: code };
    var root = document.documentElement;
    root.lang = info.htmlLang || code;
    root.dir = info.dir || t.dir || "ltr";
    document.title = t.meta.title;
    var md = $('meta[name="description"]'); if (md) md.setAttribute("content", t.meta.description);
    $$("[data-i18n]").forEach(function (el) {
      var v = get(t, el.getAttribute("data-i18n"));
      if (typeof v === "string") el.textContent = v;
    });
    $$("[data-campaign-name]").forEach(function (el) { el.textContent = campaignName(t); });
    $$("[data-tagline]").forEach(function (el) { el.textContent = tagline(t); });
    var sel = $("#lang-select"); if (sel && sel.value !== code) sel.value = code;
    renderLists(t); renderPrayer(); renderShare(); loadVideo(); renderTracks(); renderSponsor(t); renderCards(t); renderTestimonials(t); renderListen();
    var sm = $("#send-mail");
    if (sm) sm.href = "mailto:hola@modeani.org?subject=" + encodeURIComponent(t.ui.sendSubject || "") + "&body=" + encodeURIComponent(t.ui.sendBody || "");
    try { localStorage.setItem("modeani-lang", code); } catch (e) {}
    try { document.dispatchEvent(new CustomEvent("modeani:lang", { detail: code })); } catch (e) {}
  }

  /* Video: the 9 dubbed languages play assets/video/modeani_<lang>.mp4 (their own subtitles
     available in the CC menu, off by default). Every other language plays the music-only
     modeani_intl.mp4 with subs/intl/<lang>.vtt shown; if that fails, modeani_es.mp4 with
     subs/<lang>.vtt shown. If nothing loads, the "coming soon" card stays. */
  var DUBBED = ["es", "en", "pt", "fr", "it", "de", "ru", "he", "ar"];
  var video = { tried: {}, current: null, dubbed: false, subs: null, lang: null };
  function videoCandidates() {
    var dir = (CFG.video || "assets/video/modeani_es.mp4").replace(/[^\/]*$/, "");
    var sd = CFG.subtitlesDir || (dir + "subs/"), L = state.lang;
    if (DUBBED.indexOf(L) !== -1) return [{ src: dir + "modeani_" + L + ".mp4", subs: sd + L + ".vtt", show: false }];
    return [
      { src: dir + "modeani_intl.mp4", subs: sd + "intl/" + L + ".vtt", show: true },
      { src: dir + "modeani_es.mp4", subs: sd + L + ".vtt", show: true }
    ];
  }
  function setTrack(v, c) {
    var old = v.querySelectorAll("track");
    for (var i = 0; i < old.length; i++) v.removeChild(old[i]);
    var info = langInfo(state.lang) || {};
    var tr = document.createElement("track");
    tr.kind = "subtitles"; tr.src = c.subs; tr.srclang = state.lang; tr.label = info.name || info.label || state.lang;
    if (c.show) tr.default = true;
    v.appendChild(tr);
    video.subs = c.subs; video.dubbed = !c.show;
    renderTracks();
  }
  /* The video files are published in pieces under 880 KB (assets/video/parts.js lists them):
     the host's upload step garbles larger files, and it answers byte-range requests with the
     whole file, which Safari/iPhone refuse. So when the video section comes near the screen we
     download the pieces in parallel, join them into one Blob in memory and play that. A file
     with no entry in parts.js is played straight from its URL. */
  var PARTS = window.MODEANI_VIDEO_PARTS || {};
  video.near = !("IntersectionObserver" in window);
  function attachSrc(v, src, wasPlaying) {
    var frame = $("#video-frame");
    function go(url) {
      v.src = url; v.preload = "metadata";
      try { v.load(); } catch (e) {}
      if (wasPlaying) { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
    }
    var name = src.replace(/^.*\//, "").replace(/\.mp4$/, ""), m = PARTS[name];
    if (!m || !window.fetch || !window.Blob) return go(src);
    var base = src.replace(/[^\/]*$/, "") + "parts/" + name + ".";
    if (frame && frame.getAttribute("data-state") !== "ready") frame.setAttribute("data-state", "loading");
    var jobs = [];
    for (var i = 0; i < m.parts; i++) jobs.push(fetch(base + i + ".bin").then(function (r) { if (!r.ok) throw new Error(r.status); return r.arrayBuffer(); }));
    Promise.all(jobs).then(function (bufs) {
      if (video.current !== src) return;
      var blob = new Blob(bufs, { type: "video/mp4" });
      if (m.size && blob.size !== m.size) throw new Error("size");
      if (video.blobUrl) { try { URL.revokeObjectURL(video.blobUrl); } catch (e) {} }
      video.blobUrl = URL.createObjectURL(blob);
      go(video.blobUrl);
    }).catch(function () {
      if (video.current !== src) return;
      video.tried[src + "|" + state.lang] = true; video.current = null; loadVideo();
    });
  }
  function loadVideo() {
    var v = $("#promo"), frame = $("#video-frame"); if (!v || !frame) return;
    var list = videoCandidates(), next = null;
    for (var i = 0; i < list.length; i++) if (!video.tried[list[i].src + "|" + state.lang]) { next = list[i]; break; }
    if (!next) { frame.setAttribute("data-state", "soon"); return; }
    if (next.src === video.current && video.lang === state.lang) return;
    if (next.src === video.current) { video.lang = state.lang; setTrack(v, next); return; }
    if (!video.near) { video.pending = true; return; }
    var wasPlaying = !v.paused;
    video.current = next.src; video.lang = state.lang;
    setTrack(v, next);
    attachSrc(v, next.src, wasPlaying);
  }
  function renderTracks() {
    var v = $("#promo"); if (!v || !v.textTracks) return;
    for (var i = 0; i < v.textTracks.length; i++) v.textTracks[i].mode = video.dubbed ? "disabled" : "showing";
  }
  function initVideo() {
    var v = $("#promo"), frame = $("#video-frame"); if (!v || !frame) return;
    v.addEventListener("loadedmetadata", function () { frame.setAttribute("data-state", "ready"); renderTracks(); });
    v.addEventListener("error", function () { if (!video.current || !v.getAttribute("src")) return; video.tried[video.current + "|" + state.lang] = true; video.current = null; loadVideo(); });
    if (!video.near) {
      var io = new IntersectionObserver(function (es) {
        for (var i = 0; i < es.length; i++) if (es[i].isIntersecting) { video.near = true; io.disconnect(); if (video.pending) { video.pending = false; loadVideo(); } }
      }, { rootMargin: "900px 0px" });
      io.observe(frame);
    }
    if (v.textTracks && v.textTracks.addEventListener) v.textTracks.addEventListener("addtrack", renderTracks);
  }

  function toast(msg) {
    var el = $("#toast"); if (!el) return;
    el.textContent = msg; clearTimeout(toast._t);
    toast._t = setTimeout(function () { el.textContent = ""; }, 3600);
  }

  function copyLink(msg) {
    var t = I18N[state.lang], url = shareUrl(), payload = t.ui.shareText + "\n" + url;
    var done = typeof msg === "string" ? msg : t.ui.copied;
    function fallback() {
      var ta = document.createElement("textarea"); ta.value = payload; ta.setAttribute("readonly", "");
      ta.style.position = "fixed"; ta.style.opacity = "0"; document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); } catch (e) {}
      document.body.removeChild(ta); toast(done);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(payload).then(function () { toast(done); }, fallback);
    } else fallback();
  }


  /* "Escuchá y practicá": one Hebrew recitation (slow / normal, man / woman) with karaoke
     highlighting of the selected language's transliteration and of the Hebrew words.
     Clips and word start times live in assets/audio/timings.js. */
  var listen = { speed: "slow", loop: false, raf: 0, loopTimer: 0, idx: -1, src: "" };
  function tokenize(el) {
    if (!el) return [];
    var text = el.textContent || "";
    var parts = text.split(/(\s+|·|，|、)/);
    var words = parts.filter(function (p) { return p && !/^(\s+|·|，|、)$/.test(p); });
    if (words.length !== 12) return [];
    el.textContent = "";
    var spans = [];
    parts.forEach(function (p) {
      if (!p) return;
      if (/^(\s+|·|，|、)$/.test(p)) { el.appendChild(document.createTextNode(p)); return; }
      var s = document.createElement("span"); s.className = "kw"; s.textContent = p;
      el.appendChild(s); spans.push(s);
    });
    return spans;
  }
  function wrapTranslit() {
    listen.words = [tokenize($("#translit")), tokenize($("#translit-latin")), $$("#hebrew-text .hw")];
    listen.idx = -1; highlight(listen.audio && !listen.audio.paused ? currentIndex() : -1);
  }
  function clip() { var A = window.MODEANI_AUDIO || {}; return (A[state.gender] || A.m || {})[listen.speed]; }
  function currentIndex() {
    var c = clip(), a = listen.audio; if (!c || !a) return -1;
    var t = a.currentTime + 0.06, i = -1;
    for (var k = 0; k < c.times.length; k++) if (t >= c.times[k]) i = k;
    return i;
  }
  function highlight(i) {
    if (i === listen.idx) return; listen.idx = i;
    (listen.words || []).forEach(function (list) {
      list.forEach(function (s, k) { s.classList.toggle("on", k === i); s.classList.toggle("past", i > -1 && k < i); });
    });
  }
  function tick() {
    var a = listen.audio; if (!a) return;
    highlight(currentIndex());
    var bar = $("#listen-progress"); if (bar && a.duration) bar.style.width = (100 * a.currentTime / a.duration).toFixed(2) + "%";
    if (!a.paused) listen.raf = requestAnimationFrame(tick);
  }
  function setPlaying(on) {
    var box = $("#listen"); if (box) box.classList.toggle("playing", on);
    var b = $("#listen-play"), t = I18N[state.lang].ui;
    if (b) b.setAttribute("aria-label", on ? (t.listenPause || "Pause") : (t.listenPlay || "Play"));
  }
  function loadClip() {
    var c = clip(), a = listen.audio; if (!c || !a) return;
    if (listen.src !== c.src) { listen.src = c.src; a.src = c.src; try { a.load(); } catch (e) {} }
  }
  function stopListen() {
    var a = listen.audio; clearTimeout(listen.loopTimer); cancelAnimationFrame(listen.raf);
    if (a) { a.pause(); try { a.currentTime = 0; } catch (e) {} }
    setPlaying(false); highlight(-1); var bar = $("#listen-progress"); if (bar) bar.style.width = "0";
  }
  function playListen(fromStart) {
    var a = listen.audio; if (!a) return; clearTimeout(listen.loopTimer); loadClip();
    if (fromStart) { try { a.currentTime = 0; } catch (e) {} }
    var p = a.play(); if (p && p.catch) p.catch(function () { setPlaying(false); });
  }
  function restartIfPlaying() {
    var was = listen.audio && (!listen.audio.paused || listen.loopTimer);
    stopListen(); loadClip(); if (was) playListen(true);
  }
  function renderListen() {
    $$(".speed-btn").forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-speed") === listen.speed)); });
    var l = $("#listen-loop"); if (l) l.setAttribute("aria-pressed", String(listen.loop));
    setPlaying(!!(listen.audio && !listen.audio.paused));
  }
  function initListen() {
    var a = $("#listen-audio"); if (!a || !window.MODEANI_AUDIO) { var box = $("#listen"); if (box) box.hidden = true; return; }
    listen.audio = a; loadClip();
    a.addEventListener("play", function () { setPlaying(true); cancelAnimationFrame(listen.raf); listen.raf = requestAnimationFrame(tick); });
    a.addEventListener("pause", function () { if (!a.ended) setPlaying(false); tick(); });
    a.addEventListener("ended", function () {
      cancelAnimationFrame(listen.raf);
      if (listen.loop) { highlight(-1); listen.loopTimer = setTimeout(function () { listen.loopTimer = 0; playListen(true); }, 1100); }
      else { setPlaying(false); highlight(-1); var bar = $("#listen-progress"); if (bar) bar.style.width = "0"; }
    });
    var pb = $("#listen-play");
    if (pb) pb.addEventListener("click", function () {
      if (listen.loopTimer) { stopListen(); return; }
      if (a.paused) playListen(a.ended); else a.pause();
    });
    $$(".speed-btn").forEach(function (b) {
      b.addEventListener("click", function () { listen.speed = b.getAttribute("data-speed"); renderListen(); restartIfPlaying(); });
    });
    var lb = $("#listen-loop");
    if (lb) lb.addEventListener("click", function () { listen.loop = !listen.loop; renderListen(); });
    renderListen();
  }
  window.ModeAniListen = listen;

  function init() {
    var sel = $("#lang-select");
    if (sel) {
      sel.innerHTML = "";
      LANGS.forEach(function (l) {
        if (!I18N[l.code]) return;
        var o = document.createElement("option"); o.value = l.code; o.textContent = l.flag + "\u00a0 " + l.name; sel.appendChild(o);
      });
      sel.addEventListener("change", function () { apply(sel.value); });
    }
    $$(".gender-btn").forEach(function (b) {
      b.addEventListener("click", function () { state.gender = b.getAttribute("data-gender"); renderPrayer(); restartIfPlaying(); });
    });
    var cp = $("#share-copy"); if (cp) cp.addEventListener("click", function () { copyLink(); });
    var ns = $("#share-native"); if (ns) ns.addEventListener("click", function () { nativeShare(function () { copyLink(); }); });
    var ig = $("#share-ig"); if (ig) ig.addEventListener("click", function () {
      var t = I18N[state.lang];
      nativeShare(function () { copyLink(t.ui.instaCopied); });
    });
    var bar = $(".topbar");
    var onScroll = function () { if (bar) bar.classList.toggle("scrolled", window.scrollY > 40); };
    window.addEventListener("scroll", onScroll, { passive: true }); onScroll();
    initVideo();
    initForm();
    initListen();
    apply(detect());
  }

  window.ModeAni = { setLang: apply, langs: function () { return LANGS.map(function (l) { return l.code; }); } };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
