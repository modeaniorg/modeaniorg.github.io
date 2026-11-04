/* Modé Ani — campaign settings. Change these to rename the campaign everywhere.
   campaignName: null keeps each language's own spelling (Modé Ani / Modeh Ani / Модэ ани …),
                 or set one string, e.g. "Modé Ani", to force it in every language.
   tagline:      null keeps each language's own tagline (i18n/<code>.js → ui.tagline),
                 or set an object per language, e.g. { es: "Gracias por un día más", en: "..." }.
   defaultLang:  used when the visitor's browser language is not on the list. */
window.MODEANI_CONFIG = {
  campaignName: null,
  tagline: null,
  defaultLang: "es",
  /* No sponsor credit on the site (client's rule: the campaign is for everyone). */
  sponsor: { show: false },
  video: "assets/video/modeani_es.mp4",
  subtitlesDir: "assets/video/subs/",
  /* Tarjeta Plus popup: where signups go (Google Apps Script web app of modeaniorg@gmail.com:
     saves each one in the Sheet "Registros Tarjeta Plus - Modé Ani" and emails the card).
     null turns the popup off. */
  plusEndpoint: "https://script.google.com/macros/s/AKfycbyIHh20_XYDuA1bL8VWCRBg-kI8b63LRmap-w9cPwWlBRZ1Agobdh0oBGR6PyhGf-PK/exec"
};
