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
  // Family
  { word: 'אמא',   emoji: '👩',  hint: 'אמא' },
  { word: 'אבא',   emoji: '👨',  hint: 'אבא' },
  { word: 'ילד',   emoji: '👦',  hint: 'ילד' },
  { word: 'ילדה',  emoji: '👧',  hint: 'ילדה' },
  // Animals
  { word: 'כלב',   emoji: '🐶',  hint: 'כלב' },
  { word: 'חתול',  emoji: '🐱',  hint: 'חתול' },
  { word: 'קוף',   emoji: '🐒',  hint: 'קוף' },
  { word: 'פיל',   emoji: '🐘',  hint: 'פיל' },
  { word: 'אריה',  emoji: '🦁',  hint: 'אריה' },
  { word: 'ארנב',  emoji: '🐇',  hint: 'ארנב' },
  { word: 'פרפר',  emoji: '🦋',  hint: 'פרפר' },
  { word: 'עוף',   emoji: '🐦',  hint: 'עוף' },
  { word: 'דג',    emoji: '🐟',  hint: 'דג' },
  { word: 'צב',    emoji: '🐢',  hint: 'צב' },
  // Nature
  { word: 'בית',   emoji: '🏠',  hint: 'בית' },
  { word: 'עץ',    emoji: '🌳',  hint: 'עץ' },
  { word: 'פרח',   emoji: '🌸',  hint: 'פרח' },
  { word: 'ורד',   emoji: '🌹',  hint: 'ורד' },
  { word: 'שמש',   emoji: '☀️',  hint: 'שמש' },
  { word: 'ירח',   emoji: '🌙',  hint: 'ירח' },
  { word: 'כוכב',  emoji: '⭐',  hint: 'כוכב' },
  { word: 'ענן',   emoji: '☁️',  hint: 'ענן' },
  { word: 'גשם',   emoji: '🌧️',  hint: 'גשם' },
  { word: 'שלג',   emoji: '❄️',  hint: 'שלג' },
  { word: 'קשת',   emoji: '🌈',  hint: 'קשת' },
  { word: 'ים',    emoji: '🌊',  hint: 'ים' },
  { word: 'אש',    emoji: '🔥',  hint: 'אש' },
  // Food & drink
  { word: 'תפוח',  emoji: '🍎',  hint: 'תפוח' },
  { word: 'בננה',  emoji: '🍌',  hint: 'בננה' },
  { word: 'תות',   emoji: '🍓',  hint: 'תות' },
  { word: 'לימון', emoji: '🍋',  hint: 'לימון' },
  { word: 'גזר',   emoji: '🥕',  hint: 'גזר' },
  { word: 'לחם',   emoji: '🍞',  hint: 'לחם' },
  { word: 'חלב',   emoji: '🥛',  hint: 'חלב' },
  { word: 'עוגה',  emoji: '🎂',  hint: 'עוגה' },
  { word: 'גלידה', emoji: '🍦',  hint: 'גלידה' },
  // Objects & clothing
  { word: 'ספר',   emoji: '📚',  hint: 'ספר' },
  { word: 'כדור',  emoji: '⚽',  hint: 'כדור' },
  { word: 'בלון',  emoji: '🎈',  hint: 'בלון' },
  { word: 'כובע',  emoji: '🎩',  hint: 'כובע' },
  { word: 'נעל',   emoji: '👟',  hint: 'נעל' },
  { word: 'שמלה',  emoji: '👗',  hint: 'שמלה' },
  { word: 'כיסא',  emoji: '🪑',  hint: 'כיסא' },
  // Body & feelings
  { word: 'לב',    emoji: '❤️',  hint: 'לב' },
  { word: 'יד',    emoji: '✋',  hint: 'יד' },
  { word: 'אף',    emoji: '👃',  hint: 'אף' },
  { word: 'שמחה',  emoji: '😊',  hint: 'שמחה' },
  // Fun
  { word: 'שיר',   emoji: '🎵',  hint: 'שיר' },
  { word: 'ציור',  emoji: '🎨',  hint: 'ציור' },
  { word: 'שלום',  emoji: '👋',  hint: 'שלום' },
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
