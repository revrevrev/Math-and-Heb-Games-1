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
  if (IS_NATIVE) return 'native';
  if (typeof window !== 'undefined' &&
      (window.SpeechRecognition || window.webkitSpeechRecognition)) return 'web';
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

    // Listen for partial results — fires multiple times as the user speaks.
    // Strategy:
    //   • Fast path: if a partial already matches, accept immediately.
    //   • Otherwise: accumulate and wait 600 ms of silence for the final
    //     (most complete) result before judging.
    _nativeHandle = await CapSpeech.addListener('partialResults', (data) => {
      if (!_active) return;
      const alternatives = data.matches ?? [];
      if (alternatives.length === 0) return;

      _lastNativeMatches = alternatives;
      config.onPartial?.(alternatives[0]);

      // Fast path — already a match, no need to wait for more partials
      if (matchHebrewWord(config.targetWord, alternatives)) {
        clearTimeout(_silenceTimer);
        _silenceTimer = null;
        _cleanupNative();
        config.onResult?.({ matched: true, transcript: alternatives[0] });
        return;
      }

      // Not a match yet — debounce: wait for 600 ms of silence, then finalize
      clearTimeout(_silenceTimer);
      _silenceTimer = setTimeout(_finalize, 600);
    });

    // Hard timeout — finalize with whatever we have so far
    _timeoutId = setTimeout(_finalize, timeoutMs);

    config.onListening?.();

    await CapSpeech.start({
      language:       'he-IL',
      maxResults:     5,
      partialResults: true,
      popup:          false,
    });
  } catch (e) {
    _cleanupNative();
    config.onError?.({ code: 'START_FAILED' });
  }
}

// ── Web implementation (browser) ──────────────────────────────────────────────

function _startWeb(config) {
  const timeoutMs = config.timeoutMs ?? 7000;

  const SR  = window.SpeechRecognition || window.webkitSpeechRecognition;
  const rec = new SR();
  _webRecognizer = rec;

  rec.lang            = 'he-IL';
  rec.continuous      = false;
  rec.interimResults  = true;
  rec.maxAlternatives = 5;

  rec.onstart = () => {
    _timeoutId = setTimeout(() => {
      _cleanupWeb();
      config.onError?.({ code: 'TIMEOUT' });
    }, timeoutMs);
    config.onListening?.();
  };

  rec.onresult = (event) => {
    const result = event.results[event.results.length - 1];
    if (!result.isFinal) {
      // Interim result — show live transcript only
      config.onPartial?.(result[0].transcript.trim());
      return;
    }
    _cleanupWeb();
    const alternatives = Array.from(result).map(r => r.transcript.trim());
    const matched      = matchHebrewWord(config.targetWord, alternatives);
    config.onResult?.({ matched, transcript: alternatives[0] });
  };

  rec.onerror = (event) => {
    _cleanupWeb();
    const raw  = event.error ?? '';
    const code = raw === 'no-speech'   ? 'TIMEOUT'
               : raw === 'not-allowed' ? 'NOT_ALLOWED'
               : raw === 'network'     ? 'NETWORK'
               : raw.toUpperCase().replace(/-/g, '_');
    config.onError?.({ code });
  };

  rec.onend = () => {
    if (_active) {
      _cleanupWeb();
      config.onError?.({ code: 'ENDED_EARLY' });
    }
  };

  try {
    rec.start();
  } catch (e) {
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
    if (IS_NATIVE) _cleanupNative();
    else           _cleanupWeb();
  },
};

// ── Hebrew word matching ──────────────────────────────────────────────────────

/** Strip nikud (U+05B0–U+05C7) and punctuation, trim whitespace. */
export function stripNikud(text) {
  return text
    .replace(/[\u05B0-\u05C7]/g, '')
    .replace(/[\u05F3\u05F4״׳,.\-!?]/g, '')
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

  for (const alt of alternatives) {
    const recognized = stripNikud(alt);

    if (recognized === target) return true;
    if (recognized.includes(target)) return true;
    if (recognized.length >= 2 && target.includes(recognized)) return true;

    for (const prefix of ['ה', 'ו', 'ל', 'ב', 'כ', 'מ', 'ש']) {
      if (recognized === prefix + target) return true;
    }

    if (_levenshtein(recognized, target) <= 1) return true;

    // Check each individual word in the transcript
    for (const w of recognized.split(/\s+/)) {
      if (w.length >= 2 && _levenshtein(w, target) <= 1) return true;
    }
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
