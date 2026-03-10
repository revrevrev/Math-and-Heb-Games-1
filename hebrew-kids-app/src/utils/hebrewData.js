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
  // Fun & play
  { word: 'שיר',   emoji: '🎵',  hint: 'שיר' },
  { word: 'ציור',  emoji: '🎨',  hint: 'ציור' },
  { word: 'שלום',  emoji: '👋',  hint: 'שלום' },
  { word: 'כדורגל', emoji: '⚽', hint: 'כדורגל' },
  { word: 'בובה',  emoji: '🪆',  hint: 'בובה' },
  { word: 'משחק',  emoji: '🎮',  hint: 'משחק' },
  { word: 'ריקוד', emoji: '💃',  hint: 'ריקוד' },
  { word: 'שחייה', emoji: '🏊',  hint: 'שחייה' },
  // More animals
  { word: 'סוס',   emoji: '🐴',  hint: 'סוס' },
  { word: 'פרה',   emoji: '🐄',  hint: 'פרה' },
  { word: 'כבש',   emoji: '🐑',  hint: 'כבש' },
  { word: 'תרנגול', emoji: '🐔', hint: 'תרנגול' },
  { word: 'ברווז', emoji: '🦆',  hint: 'ברווז' },
  { word: 'פנגווין', emoji: '🐧', hint: 'פנגווין' },
  { word: 'נמר',   emoji: '🐆',  hint: 'נמר' },
  { word: 'זאב',   emoji: '🐺',  hint: 'זאב' },
  { word: 'דוב',   emoji: '🐻',  hint: 'דוב' },
  { word: 'קיפוד', emoji: '🦔',  hint: 'קיפוד' },
  { word: 'צפרדע', emoji: '🐸',  hint: 'צפרדע' },
  { word: 'חמור',  emoji: '🫏',  hint: 'חמור' },
  // More food
  { word: 'אבוקדו', emoji: '🥑', hint: 'אבוקדו' },
  { word: 'פיצה',  emoji: '🍕',  hint: 'פיצה' },
  { word: 'סושי',  emoji: '🍣',  hint: 'סושי' },
  { word: 'ביצה',  emoji: '🥚',  hint: 'ביצה' },
  { word: 'דבש',   emoji: '🍯',  hint: 'דבש' },
  { word: 'שוקולד', emoji: '🍫', hint: 'שוקולד' },
  { word: 'עוגיה', emoji: '🍪',  hint: 'עוגיה' },
  { word: 'מיץ',   emoji: '🧃',  hint: 'מיץ' },
  { word: 'גביע',  emoji: '🍨',  hint: 'גביע' },
  // Nature & weather
  { word: 'הר',    emoji: '⛰️',  hint: 'הר' },
  { word: 'נהר',   emoji: '🏞️',  hint: 'נהר' },
  { word: 'יער',   emoji: '🌲',  hint: 'יער' },
  { word: 'חול',   emoji: '🏖️',  hint: 'חול' },
  { word: 'רוח',   emoji: '💨',  hint: 'רוח' },
  { word: 'ברק',   emoji: '⚡',  hint: 'ברק' },
  { word: 'קרח',   emoji: '🧊',  hint: 'קרח' },
  // Transport
  { word: 'מכונית', emoji: '🚗', hint: 'מכונית' },
  { word: 'אוטובוס', emoji: '🚌', hint: 'אוטובוס' },
  { word: 'רכבת',  emoji: '🚂',  hint: 'רכבת' },
  { word: 'מטוס',  emoji: '✈️',  hint: 'מטוס' },
  { word: 'ספינה', emoji: '🚢',  hint: 'ספינה' },
  { word: 'אופניים', emoji: '🚲', hint: 'אופניים' },
  { word: 'רקטה',  emoji: '🚀',  hint: 'רקטה' },
  // Home & objects
  { word: 'שולחן', emoji: '🪞',  hint: 'שולחן' },
  { word: 'מיטה',  emoji: '🛏️',  hint: 'מיטה' },
  { word: 'מטבח',  emoji: '🍳',  hint: 'מטבח' },
  { word: 'טלפון', emoji: '📱',  hint: 'טלפון' },
  { word: 'מחשב',  emoji: '💻',  hint: 'מחשב' },
  { word: 'מנורה', emoji: '💡',  hint: 'מנורה' },
  { word: 'שקית',  emoji: '👜',  hint: 'שקית' },
  { word: 'מגבת',  emoji: '🛁',  hint: 'מגבת' },
  // Body
  { word: 'עיניים', emoji: '👀', hint: 'עיניים' },
  { word: 'פה',    emoji: '👄',  hint: 'פה' },
  { word: 'רגל',   emoji: '🦵',  hint: 'רגל' },
  { word: 'שיניים', emoji: '🦷', hint: 'שיניים' },
  // Colors & shapes
  { word: 'אדום',  emoji: '🔴',  hint: 'אדום' },
  { word: 'כחול',  emoji: '🔵',  hint: 'כחול' },
  { word: 'ירוק',  emoji: '🟢',  hint: 'ירוק' },
  { word: 'צהוב',  emoji: '🟡',  hint: 'צהוב' },
  { word: 'עגול',  emoji: '⭕',  hint: 'עגול' },
  { word: 'לב',    emoji: '❤️',  hint: 'לב' },
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
