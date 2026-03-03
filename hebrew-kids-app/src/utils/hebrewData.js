// ── Hebrew alphabet data ──────────────────────────────
export const ALEF_BET = [
  { letter: 'א', name: 'אלף',  emoji: '🦁', word: 'אריה'  },
  { letter: 'ב', name: 'בית',  emoji: '🦋', word: 'פרפר'  },
  { letter: 'ג', name: 'גימל', emoji: '🐪', word: 'גמל'   },
  { letter: 'ד', name: 'דלת',  emoji: '🐟', word: 'דג'    },
  { letter: 'ה', name: 'הא',   emoji: '🦔', word: 'קיפוד' },
  { letter: 'ו', name: 'וו',   emoji: '🌹', word: 'ורד'   },
  { letter: 'ז', name: 'זין',  emoji: '🪰', word: 'זבוב'  },
  { letter: 'ח', name: 'חית',  emoji: '🐱', word: 'חתול'  },
  { letter: 'ט', name: 'טית',  emoji: '🦚', word: 'טווס'  },
  { letter: 'י', name: 'יוד',  emoji: '🌊', word: 'ים'    },
  { letter: 'כ', name: 'כף',   emoji: '⭐', word: 'כוכב'  },
  { letter: 'ל', name: 'למד',  emoji: '🌙', word: 'לילה'  },
  { letter: 'מ', name: 'מם',   emoji: '💦', word: 'מים'   },
  { letter: 'נ', name: 'נון',  emoji: '🕯️', word: 'נר'    },
  { letter: 'ס', name: 'סמך',  emoji: '🍂', word: 'סתיו'  },
  { letter: 'ע', name: 'עין',  emoji: '🌳', word: 'עץ'    },
  { letter: 'פ', name: 'פא',   emoji: '🌸', word: 'פרח'   },
  { letter: 'צ', name: 'צדי',  emoji: '🐢', word: 'צב'    },
  { letter: 'ק', name: 'קוף',  emoji: '🐒', word: 'קוף'   },
  { letter: 'ר', name: 'ריש',  emoji: '🏃', word: 'ריצה'  },
  { letter: 'ש', name: 'שין',  emoji: '☀️', word: 'שמש'   },
  { letter: 'ת', name: 'תו',   emoji: '🍓', word: 'תות'   },
];

// ── Words for word-building game ──────────────────────
export const WORDS = [
  { word: 'אמא',  emoji: '👩',  hint: 'אמא' },
  { word: 'אבא',  emoji: '👨',  hint: 'אבא' },
  { word: 'כלב',  emoji: '🐶',  hint: 'כלב' },
  { word: 'חתול', emoji: '🐱',  hint: 'חתול' },
  { word: 'בית',  emoji: '🏠',  hint: 'בית' },
  { word: 'ספר',  emoji: '📚',  hint: 'ספר' },
  { word: 'שמש',  emoji: '☀️',  hint: 'שמש' },
  { word: 'ירח',  emoji: '🌙',  hint: 'ירח' },
  { word: 'כוכב', emoji: '⭐',  hint: 'כוכב' },
  { word: 'עץ',   emoji: '🌳',  hint: 'עץ' },
  { word: 'פרח',  emoji: '🌸',  hint: 'פרח' },
  { word: 'דג',   emoji: '🐟',  hint: 'דג' },
  { word: 'עוף',  emoji: '🐦',  hint: 'עוף' },
  { word: 'ענן',  emoji: '☁️',  hint: 'ענן' },
  { word: 'גשם',  emoji: '🌧️',  hint: 'גשם' },
];

// ── Counting items for counting game ─────────────────
export const COUNT_ITEMS = [
  { emoji: '⭐', name: 'כוכבים' },
  { emoji: '🍎', name: 'תפוחים' },
  { emoji: '🌸', name: 'פרחים' },
  { emoji: '🐶', name: 'כלבים' },
  { emoji: '🦋', name: 'פרפרים' },
  { emoji: '🍪', name: 'עוגיות' },
  { emoji: '🐸', name: 'צפרדעים' },
  { emoji: '🚗', name: 'מכוניות' },
  { emoji: '🎈', name: 'בלונים' },
  { emoji: '🐟', name: 'דגים' },
];

// ── Shuffle helper ────────────────────────────────────
export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── Pick N random items from array ───────────────────
export function pickRandom(arr, n) {
  return shuffle(arr).slice(0, n);
}
