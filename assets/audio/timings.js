/* Modé Ani — "Escuchá y practicá" recitation clips and word timings.
   One Hebrew recitation for every language; only the transliteration shown changes.
   times = the second each of the 12 words starts (Modé · aní · lefanéja · mélej · jai · vekayám ·
   shehejezárta · bí · nishmatí · bejemlá · rabá · emunatéja). Nudge a number here to fix the sync. */
window.MODEANI_AUDIO = {
  m: {
    slow: { src: "assets/audio/modeani-m-slow.mp3", duration: 17.16,
      times: [0.36, 1.44, 2.51, 4.13, 5.61, 6.61, 8.59, 10.01, 11.0, 12.37, 14.78, 15.99] },
    normal: { src: "assets/audio/modeani-m-normal.mp3", duration: 7.63,
      times: [0.25, 0.61, 0.877, 1.69, 2.25, 2.49, 3.61, 4.13, 4.33, 4.863, 6.29, 6.677] }
  },
  f: {
    slow: { src: "assets/audio/modeani-f-slow.mp3", duration: 16.98,
      times: [0.36, 1.49, 2.52, 4.12, 5.61, 6.62, 8.64, 10.09, 10.99, 12.27, 14.53, 15.7] },
    normal: { src: "assets/audio/modeani-f-normal.mp3", duration: 7.47,
      times: [0.25, 0.637, 0.877, 1.69, 2.25, 2.49, 3.626, 4.186, 4.33, 4.783, 6.17, 6.437] }
  }
};
