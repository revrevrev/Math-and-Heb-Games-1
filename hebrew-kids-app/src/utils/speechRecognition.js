// ── Speech Recognition Utility ────────────────────────────────────────────────
// On Android (Capacitor native): uses @capacitor-community/speech-recognition
// On browser: uses window.SpeechRecognition / webkitSpeechRecognition

import { Capacitor } from '@capacitor/core';
import { SpeechRecognition as CapSpeech } from '@capacitor-community/speech-recognition';

const IS_NATIVE = Capacitor.isNativePlatform();

let _capability         = null;   // cached: 'native' | 'web' | 'none'
let _active             = false;
let _timeoutId          = null;
let _silenceTimer       = null;   // debounce — fires after speech stops
let _lastNativeMatches  = [];     // accumulates partial results
let _nativeHandle       = null;   // native event listener handle
let _webRecognizer      = null;   // Web Speech API instance

// ── Capability detection ──────────────────────────────────────────────────────

function _detectCapability() {
  // Prefer the Web Speech API even on native Android — it runs in the
  // Chrome-based WebView without any popup dialog, unlike the Capacitor
  // native plugin which requires popup:true on many devices.
  if (typeof window !== 'undefined' &&
      (window.SpeechRecognition || window.webkitSpeechRecognition)) return 'web';
  if (IS_NATIVE) return 'native';
  return 'none';
}

// ── Cleanup helpers ───────────────────────────────────────────────────────────

function _cleanupNative() {
  clearTimeout(_timeoutId);
  clearTimeout(_silenceTimer);
  _timeoutId  = null;
  _silenceTimer = null;
  _active = false;
  if (_nativeHandle) { _nativeHandle.remove(); _nativeHandle = null; }
  try { CapSpeech.stop(); } catch (_) {}
}

function _cleanupWeb() {
  clearTimeout(_timeoutId);
  _timeoutId = null;
  _active = false;
  if (_webRecognizer) {
    _webRecognizer.onresult = null;
    _webRecognizer.onerror  = null;
    _webRecognizer.onend    = null;
    _webRecognizer.onstart  = null;
    try { _webRecognizer.abort(); } catch (_) {}
    _webRecognizer = null;
  }
}

// ── Native implementation (Android) ──────────────────────────────────────────

async function _startNative(config) {
  const timeoutMs = config.timeoutMs ?? 7000;
  _lastNativeMatches = [];

  // Called when we're ready to commit to the accumulated results.
  function _finalize() {
    if (!_active) return;
    const matches = _lastNativeMatches;
    _cleanupNative();
    if (matches.length > 0) {
      const matched = matchHebrewWord(config.targetWord, matches);
      config.onResult?.({ matched, transcript: matches[0] });
    } else {
      config.onError?.({ code: 'TIMEOUT' });
    }
  }

  try {
    // Request permissions (no-op if already granted)
    const perms = await CapSpeech.requestPermissions();
    if (perms.speechRecognition !== 'granted') {
      _active = false;
      config.onError?.({ code: 'NOT_ALLOWED' });
      return;
    }

    // Results event — fires with partial and/or final results.
    // With popup:true the system dialog handles UI; we just receive final matches.
    _nativeHandle = await CapSpeech.addListener('partialResults', (data) => {
      if (!_active) return;
      console.log('[STT] partialResults event:', JSON.stringify(data));

      const alternatives = data.matches ?? [];
      if (alternatives.length === 0) return;

      _lastNativeMatches = alternatives;
      // Show all alternatives separated by " / " so we can see what STT heard
      config.onPartial?.(alternatives.join(' / '));

      // Fast path — already a match, no need to wait for more
      if (matchHebrewWord(config.targetWord, alternatives)) {
        clearTimeout(_silenceTimer);
        _silenceTimer = null;
        _cleanupNative();
        config.onResult?.({ matched: true, transcript: alternatives[0] });
        return;
      }

      // Debounce: wait 300 ms of silence, then finalize with best result so far
      clearTimeout(_silenceTimer);
      _silenceTimer = setTimeout(_finalize, 300);
    });

    // Hard timeout — finalize with whatever we have so far
    _timeoutId = setTimeout(_finalize, timeoutMs);

    console.log('[STT-native] started, target:', JSON.stringify(config.targetWord));
    config.onListening?.();

    await CapSpeech.start({
      language:       'he-IL',
      maxResults:     10,
      partialResults: true,
      popup:          false,
    });
  } catch (e) {
    console.error('[STT] start error:', e);
    _cleanupNative();
    config.onError?.({ code: 'START_FAILED', detail: String(e) });
  }
}

// ── Web implementation (browser) ──────────────────────────────────────────────

function _startWeb(config) {
  const timeoutMs = config.timeoutMs ?? 7000;
  let _lastInterim = '';   // best interim result seen so far

  const SR  = window.SpeechRecognition || window.webkitSpeechRecognition;
  const rec = new SR();
  _webRecognizer = rec;

  rec.lang            = 'he-IL';
  rec.continuous      = false;
  rec.interimResults  = true;
  rec.maxAlternatives = 5;

  console.log('[STT-web] starting, target:', JSON.stringify(config.targetWord));

  rec.onstart = () => {
    console.log('[STT-web] onstart — mic active');
    _timeoutId = setTimeout(() => {
      console.log('[STT-web] hard timeout fired');
      _cleanupWeb();
      config.onError?.({ code: 'TIMEOUT' });
    }, timeoutMs);
    config.onListening?.();
  };

  rec.onresult = (event) => {
    const result = event.results[event.results.length - 1];
    if (!result.isFinal) {
      _lastInterim = result[0].transcript.trim();
      console.log('[STT-web] interim:', JSON.stringify(_lastInterim));
      config.onPartial?.(_lastInterim);
      return;
    }
    _cleanupWeb();
    const alternatives = Array.from(result).map(r => r.transcript.trim());
    console.log('[STT-web] final alternatives:', alternatives);
    config.onPartial?.(alternatives.join(' / '));
    const matched = matchHebrewWord(config.targetWord, alternatives);
    config.onResult?.({ matched, transcript: alternatives[0] });
  };

  rec.onerror = (event) => {
    console.log('[STT-web] onerror:', event.error, '— active:', _active);
    _cleanupWeb();
    const raw  = event.error ?? '';
    const code = raw === 'no-speech'   ? 'TIMEOUT'
               : raw === 'not-allowed' ? 'NOT_ALLOWED'
               : raw === 'network'     ? 'NETWORK'
               : raw.toUpperCase().replace(/-/g, '_');
    config.onError?.({ code });
  };

  rec.onend = () => {
    console.log('[STT-web] onend — active:', _active, 'lastInterim:', JSON.stringify(_lastInterim));
    if (!_active) return;
    // Session ended before a final result arrived.
    // If we received an interim result, use it rather than discarding it.
    if (_lastInterim) {
      _cleanupWeb();
      const matched = matchHebrewWord(config.targetWord, [_lastInterim]);
      config.onResult?.({ matched, transcript: _lastInterim });
    } else {
      _cleanupWeb();
      config.onError?.({ code: 'ENDED_EARLY' });
    }
  };

  try {
    rec.start();
  } catch (e) {
    console.log('[STT-web] start threw:', e);
    _cleanupWeb();
    config.onError?.({ code: 'START_FAILED' });
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

export const SpeechRecognitionUtil = {

  /** Returns 'native' | 'web' | 'none'. */
  isAvailable() {
    if (!_capability) _capability = _detectCapability();
    return _capability;
  },

  /**
   * Start listening for a Hebrew word.
   * @param {object} config
   *   targetWord  {string}   — expected Hebrew word (no nikud needed)
   *   onListening {function} — called when mic is active
   *   onResult    {function} — called with { matched: bool, transcript: string }
   *   onError     {function} — called with { code: string }
   *   timeoutMs   {number}   — ms to wait for speech (default 7000)
   */
  startListening(config) {
    const cap = this.isAvailable();
    if (cap === 'none') { config.onError?.({ code: 'NOT_SUPPORTED' }); return; }
    if (_active) this.stopListening();
    _active = true;

    if (cap === 'native') {
      _startNative(config);
    } else {
      _startWeb(config);
    }
  },

  stopListening() {
    _cleanupWeb();                   // always stop web recognizer (used even on Android)
    if (IS_NATIVE) _cleanupNative(); // also stop native plugin if on Android
  },
};

// ── Hebrew word matching ──────────────────────────────────────────────────────

/**
 * Normalize a Hebrew string for comparison:
 *   1. NFKD decomposition — splits precomposed chars + converts compat forms (U+FB1D–U+FB4E → base + mark)
 *   2. Strip ALL Unicode combining/modifier marks via \p{M} (nikud, dagesh, cantillation, etc.)
 *   3. Remove Hebrew punctuation and common ASCII punctuation
 *   4. Remove invisible Unicode direction/zero-width marks that Android STT injects
 *   5. Normalize final letter forms → non-final, so ם≡מ ן≡נ ף≡פ ך≡כ ץ≡צ
 *   6. Collapse whitespace and trim
 */
export function stripNikud(text) {
  return text
    .normalize('NFKD')                                          // decompose everything (separates dagesh, nikud, etc.)
    .replace(/\p{M}/gu, '')                                     // strip ALL Unicode combining marks (nikud, dagesh, cantillation…)
    .replace(/[\u05BE\u05F3\u05F4]/g, '')                       // Hebrew punctuation: maqaf, geresh, gershayim
    .replace(/[\u200B-\u200F\u202A-\u202E\u2060-\u206F\uFEFF]/g, '') // invisible RTL/LTR/BOM/formatting marks
    .replace(/[,.\-!?'"״׳]/g, '')                               // common ASCII + Hebrew punctuation chars
    .replace(/\u05DD/g, '\u05DE')  // ם → מ
    .replace(/\u05DF/g, '\u05E0')  // ן → נ
    .replace(/\u05E3/g, '\u05E4')  // ף → פ
    .replace(/\u05DA/g, '\u05DB')  // ך → כ
    .replace(/\u05E5/g, '\u05E6')  // ץ → צ
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Returns true if any of the STT alternatives matches the target Hebrew word.
 *
 * Rules (tried in order, per alternative):
 *   1. Exact match after normalizing
 *   2. Recognized text contains the target ("זה יד" → matches "יד")
 *   3. Target contains recognized text (STT too terse, length ≥ 2)
 *   4. Common prefix variants: ה/ו/ל/ב/כ/מ/ש prepended to target
 *   5. Whole-transcript Levenshtein ≤ 1
 *   6. Any individual word in the transcript Levenshtein ≤ 1
 *      (catches "שמח גדולה" when target is "שמש")
 */
export function matchHebrewWord(targetWord, alternatives) {
  const target = stripNikud(targetWord);
  console.log('[Match] target:', JSON.stringify(target),
              'codePoints:', [...target].map(c => c.codePointAt(0).toString(16)));

  for (const alt of alternatives) {
    const recognized = stripNikud(alt);
    console.log('[Match] vs:', JSON.stringify(recognized),
                'codePoints:', [...recognized].map(c => c.codePointAt(0).toString(16)));

    if (recognized === target) return true;
    if (recognized.includes(target)) return true;
    if (recognized.length >= 2 && target.includes(recognized)) return true;

    for (const prefix of ['ה', 'ו', 'ל', 'ב', 'כ', 'מ', 'ש']) {
      if (recognized === prefix + target) return true;
    }

    const maxDist = target.length >= 4 ? 2 : 1;
    if (_levenshtein(recognized, target) <= maxDist) return true;

    // Check each individual word in the transcript
    for (const w of recognized.split(/\s+/)) {
      if (w.length >= 2 && _levenshtein(w, target) <= maxDist) return true;
    }

    // Ultimate fallback: compare only the Hebrew base consonants (U+05D0–U+05EA).
    // Catches any residual invisible chars or unexpected non-Hebrew tokens.
    const hebrewOnly = s => s.replace(/[^\u05D0-\u05EA]/g, '');
    const recHz = hebrewOnly(recognized);
    const tgtHz = hebrewOnly(target);
    if (recHz.length >= 1 && recHz === tgtHz) return true;
    if (recHz.length >= 2 && tgtHz.includes(recHz)) return true;
    if (tgtHz.length >= 2 && recHz.includes(tgtHz)) return true;
  }
  return false;
}

function _levenshtein(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}
