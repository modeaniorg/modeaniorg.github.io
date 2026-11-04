/* Modé Ani — first-visit language prompt.
   A bar under the header with every language as a big tappable chip, and a soft pulse on the
   header selector, until the visitor picks a language (chip or selector) or closes the bar.
   Never shown when the link already names a language (?lang=xx or /xx/). */
(function () {
  var KEY = "modeani-lang-picked";
  var T = {"es": "Elegí tu idioma", "en": "Choose your language", "pt": "Escolha seu idioma", "it": "Scegli la tua lingua", "fr": "Choisissez votre langue", "de": "Wähle deine Sprache", "ru": "Выбери свой язык", "he": "בחרו את השפה שלכם", "ar": "اختر لغتك", "sw": "Chagua lugha yako", "am": "ቋንቋህን ምረጥ", "zh": "选择你的语言", "hi": "अपनी भाषा चुनिए"};
  function picked() { try { return !!localStorage.getItem(KEY); } catch (e) { return true; } }
  function mark(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }
  function init() {
    var LANGS = window.MODEANI_LANGS || [], api = window.ModeAni, root = document.documentElement;
    var q = null; try { q = new URLSearchParams(location.search).get("lang"); } catch (e) {}
    if (q) { mark("link"); return; }
    if (picked() || !api) return;
    var cur = root.lang ? root.lang.split("-")[0] : "es";
    var bar = document.createElement("div"); bar.className = "langbar"; bar.setAttribute("role", "dialog"); bar.setAttribute("aria-label", "Language");
    var head = document.createElement("div"); head.className = "langbar-head";
    var title = document.createElement("p"); title.className = "langbar-title";
    var x = document.createElement("button"); x.type = "button"; x.className = "langbar-x"; x.setAttribute("aria-label", "OK"); x.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>';
    head.appendChild(title); head.appendChild(x);
    var row = document.createElement("div"); row.className = "langbar-row";
    LANGS.forEach(function (l) {
      var b = document.createElement("button"); b.type = "button"; b.className = "langbar-chip"; b.setAttribute("data-code", l.code); b.setAttribute("lang", l.htmlLang || l.code);
      b.innerHTML = '<span class="langbar-flag" aria-hidden="true">' + l.flag + '</span><span>' + l.name + '</span>';
      b.addEventListener("click", function () { api.setLang(l.code); mark(l.code); close(); });
      row.appendChild(b);
    });
    bar.appendChild(head); bar.appendChild(row);
    function label() {
      var c = (root.lang || "es").split("-")[0];
      var a = T[c] || T.en;
      title.innerHTML = '<span aria-hidden="true">🌐</span> ' + a + (c === "en" ? "" : ' <span class="langbar-en">' + T.en + '</span>');
      Array.prototype.forEach.call(row.children, function (ch) { ch.classList.toggle("on", ch.getAttribute("data-code") === c); });
    }
    function close() { root.classList.remove("lang-unpicked"); root.style.removeProperty("--langbar-h"); bar.classList.remove("in"); setTimeout(function () { if (bar.parentNode) bar.parentNode.removeChild(bar); }, 350); }
    x.addEventListener("click", function () { mark("closed"); close(); });
    var sel = document.getElementById("lang-select");
    if (sel) sel.addEventListener("change", function () { mark(sel.value); close(); });
    document.addEventListener("modeani:lang", label);
    label();
    function sync() { if (bar.parentNode) root.style.setProperty("--langbar-h", bar.offsetHeight + "px"); }
    document.addEventListener("modeani:lang", function () { setTimeout(sync, 0); });
    window.addEventListener("resize", sync);
    document.body.appendChild(bar); sync(); root.classList.add("lang-unpicked");
    setTimeout(function () { sync(); bar.classList.add("in"); }, 700);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function () { setTimeout(init, 0); }); else setTimeout(init, 0);
})();
