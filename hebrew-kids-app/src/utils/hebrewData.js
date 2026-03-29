// ── Hebrew alphabet data ──────────────────────────────
// `name`      — display text (no nikud, clean)
// `pronounce` — nikud-marked version fed to TTS for correct pronunciation
//               Edit `pronounce` to fix any mispronunciations.
//               The expected sound is noted in the comment after each line.
export const ALEF_BET = [
  { letter: 'א', name: 'אלף',   pronounce: 'אָלֶף',   emoji: '🦁', word: 'אריה'  }, // AH-lef
  { letter: 'ב', name: 'בּית',  pronounce: 'בֵּת',   emoji: '🏠', word: 'בית'  }, // BEIT
  { letter: 'ג', name: 'גימל',  pronounce: 'גִימֶל',  emoji: '🐪', word: 'גמל'   }, // GEE-mel
  { letter: 'ד', name: 'דלת',   pronounce: 'דָּלֶת',  emoji: '🐟', word: 'דג'    }, // DAH-let
  { letter: 'ה', name: 'הֵא',   pronounce: 'הֵי',     emoji: '🍔', word: 'המבורגר' }, // HEI
  { letter: 'ו', name: 'וָו',   pronounce: 'וָו',     emoji: '🌹', word: 'ורד'   }, // VAV
  { letter: 'ז', name: 'זַיִן', pronounce: 'זַיִן',   emoji: '🪰', word: 'זבוב'  }, // ZAH-yin
  { letter: 'ח', name: 'חֵית',  pronounce: 'חֵת',    emoji: '🐱', word: 'חתול'  }, // CHEIT
  { letter: 'ט', name: 'טֵית',  pronounce: 'טֵת',    emoji: '🦚', word: 'טווס'  }, // TEIT
  { letter: 'י', name: 'יוֹד',  pronounce: 'יוּד',    emoji: '🌊', word: 'ים'    }, // YOD
  { letter: 'כ', name: 'כַּף',  pronounce: 'כַּף',    emoji: '⭐', word: 'כוכב'  }, // KAF
  { letter: 'ל', name: 'למד',   pronounce: 'לָ מֶד',   emoji: '🌙', word: 'לילה'  }, // LAH-med
  { letter: 'מ', name: 'מֵם',   pronounce: 'מֵם',     emoji: '💦', word: 'מים'   }, // MEM
  { letter: 'נ', name: 'נוּן',  pronounce: 'נוּן',    emoji: '🕯️', word: 'נר'    }, // NUN
  { letter: 'ס', name: 'סמך',   pronounce: 'סָמֶךְ',  emoji: '🍂', word: 'סתיו'  }, // SAH-mech
  { letter: 'ע', name: 'עַיִן', pronounce: 'עַיִן',   emoji: '🌳', word: 'עץ'    }, // AH-yin
  { letter: 'פ', name: 'פֵּא',  pronounce: 'פֵּי',    emoji: '🌸', word: 'פרח'   }, // PEI
  { letter: 'צ', name: 'צָדִי', pronounce: 'צָדִי',   emoji: '🐢', word: 'צב'    }, // TSAH-di
  { letter: 'ק', name: 'קוֹף',  pronounce: 'קוּף',    emoji: '🐒', word: 'קוף'   }, // KOF
  { letter: 'ר', name: 'רֵישׁ', pronounce: 'רֵישׁ',   emoji: '🏃', word: 'ריצה'  }, // REISH
  { letter: 'ש', name: 'שִׁין', pronounce: 'שִׁין',   emoji: '☀️', word: 'שמש'   }, // SHIN
  { letter: 'ת', name: 'תָּו',  pronounce: 'תָּף',    emoji: '🍓', word: 'תות'   }, // TAV
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
  { word: 'הי',  emoji: '👋',  hint: 'הי' },
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
