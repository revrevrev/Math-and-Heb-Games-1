// Sound utility — loads real audio files via Howler.js,
// falls back to Web Audio API synthesis if files are missing.
import { Howl } from 'howler';
import { Capacitor } from '@capacitor/core';
import { TextToSpeech } from '@capacitor-community/text-to-speech';

// True when running as a native Android/iOS app via Capacitor
const IS_NATIVE = Capacitor.isNativePlatform();

// ── Web Audio API (fallback synthesis) ──────────────────────
const AudioCtx = window.AudioContext || window.webkitAudioContext;
let ctx = null;

function getCtx() {
  if (!ctx) ctx = new AudioCtx();
  return ctx;
}

function playTone(frequency, duration, type = 'sine', gain = 0.3, delay = 0) {
  if (Sounds.muted) return;
  try {
    const ac = getCtx();
    const osc = ac.createOscillator();
    const gainNode = ac.createGain();
    osc.connect(gainNode);
    gainNode.connect(ac.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ac.currentTime + delay);
    gainNode.gain.setValueAtTime(0.001, ac.currentTime + delay);
    gainNode.gain.linearRampToValueAtTime(gain, ac.currentTime + delay + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + delay + duration);
    osc.start(ac.currentTime + delay);
    osc.stop(ac.currentTime + delay + duration + 0.05);
  } catch (e) { /* silent fail */ }
}

function playChord(notes, duration = 0.3) {
  notes.forEach((f, i) => {
    setTimeout(() => playTone(f, duration, 'sine', 0.2), i * 60);
  });
}

// ── Howler sound loader ──────────────────────────────────────
// Each SoundFile tries to load a real audio file.
// If loading fails, it transparently falls back to synthFn.
class SoundFile {
  constructor(paths, synthFn) {
    this.synthFn = synthFn;
    this._loaded = false;
    this._howl = new Howl({
      src: paths,
      volume: 0.7,
      preload: true,
      onload: () => { this._loaded = true; },
      onloaderror: () => { this._loaded = false; },
    });
  }

  play(volume = 0.7) {
    if (Sounds.muted) return;
    if (this._loaded) {
      this._howl.volume(volume);
      this._howl.play();
    } else {
      this.synthFn();
    }
  }
}

// ── Background music ─────────────────────────────────────────
let musicInterval = null;
let musicNoteIdx  = 0;
let currentMelody = null;
let bgHowl        = null;

const MELODIES = {
  letters:  [523, 587, 659, 784, 659, 587, 523, 440],
  counting: [440, 523, 659, 880, 659, 523, 440, 392],
  memory:   [392, 440, 523, 659, 523, 440, 392, 349],
  math:     [523, 659, 784, 880, 784, 659, 523, 440],
  words:    [659, 784, 880, 1046, 880, 784, 659, 587],
  home:     [523, 659, 784, 659, 523, 784, 880, 784],
};

// Per-game character music (filename in /sounds/music/)
const GAME_MUSIC = {
  letters:     'Elsa.mp3',
  counting:    'Bluey.mp3',
  memory:      'Teletubbies.mp3',
  math:        'Mickey.mp3',
  words:       'Gabby.mp3',
  firstletter: 'זהר לא הספקתי.mp3',
  soundgame:   'האיש על הירח.mp3',
  readgame:    'Stitch.mp3',
};

function stopMusicLoop() {
  if (musicInterval) { clearInterval(musicInterval); musicInterval = null; }
  if (bgHowl) { bgHowl.stop(); bgHowl.unload(); bgHowl = null; }
}

function startSynthMusic(game) {
  const melody = MELODIES[game] || MELODIES.home;
  musicNoteIdx = 0;
  musicInterval = setInterval(() => {
    if (!Sounds.muted && Sounds.musicEnabled) {
      playTone(melody[musicNoteIdx % melody.length], 0.4, 'sine', 0.035);
      musicNoteIdx++;
    }
  }, 400);
}

function startBgMusic(game) {
  const song = GAME_MUSIC[game];
  if (!song) {
    startSynthMusic(game);
    return;
  }
  const howl = new Howl({
    src: [`/sounds/music/${song}`],
    volume: Sounds.musicVolume,
    loop: true,
    onload: () => {
      if (bgHowl === howl) howl.play();
    },
    onloaderror: () => {
      if (bgHowl === howl) { bgHowl = null; startSynthMusic(game); }
    },
  });
  bgHowl = howl;
}

// ── Hebrew voice — recorded clips + TTS fallback ────────────
//
// Drop your .m4a recordings into  public/sounds/voice/
// File names must match the paths below exactly.
// Any missing file automatically falls back to Web Speech / native TTS.
//
// Phrases to record (21 clips total):
//   correct_1  כל הכבוד!          correct_5  איזה חכמה!
//   correct_2  מצוין!              correct_6  מדהים!
//   correct_3  יפה מאוד!           correct_7  איך ידעת?
//   correct_4  נכון!               correct_8  וואו, יפה!
//   wrong_1    נסי שוב
//   wrong_2    לא נכון, נסי שוב
//   wrong_3    כמעט, נסי שוב
//   win_1      כל הכבוד, סיימת!    win_3  ניצחת! יפה מאוד!
//   win_2      את מדהימה!          win_4  וואו, מצוין!
//   streak_1   וואו, רצף מדהים!    streak_3  מדהים, כן כן כן!
//   streak_2   כל הכבוד, את על הגל!  streak_4  וואו איך עשית את זה?
//   levelup_1  עלית רמה! כל הכבוד!
//   levelup_2  מדהים, איזה תותחית. עכשיו רמה חדשה!

// Fallback text (used when the audio file hasn't been recorded yet)
const VOICE_PHRASES = {
  correct: ['כל הכבוד!', 'מצוין!', 'יפה מאוד!', 'נכון!', 'איזה חכמה!', 'מדהים!', 'איך ידעת?', 'וואו, יפה!'],
  wrong:   ['נסי שוב', 'לא נכון, נסי שוב', 'כמעט, נסי שוב'],
  win:     ['כל הכבוד, סיימת!', 'את מדהימה!', 'ניצחת! יפה מאוד!', 'וואו, מצוין!'],
  streak:  ['וואו, רצף מדהים!', 'כל הכבוד, את על הגל!', 'מדהים, כן כן כן!', 'וואו איך עשית את זה?'],
  levelUp: ['עלית רמה! כל הכבוד!', 'מדהים, איזה תותחית. עכשיו רמה חדשה!'],
};

// VoiceFile — preloads one recorded clip; falls back to TTS if missing
class VoiceFile {
  constructor(path, fallbackText) {
    this.fallbackText = fallbackText;
    this._loaded = false;
    this._howl = new Howl({
      src: [path],
      format: ['m4a'],   // explicit format — Howler doesn't always detect .m4a
      preload: true,
      onload: () => { this._loaded = true; },
      onloaderror: () => { this._loaded = false; },
    });
  }

  play(delay = 0, onEnd = null) {
    if (Sounds.muted || !Sounds.voiceEnabled) { if (delay === 0) onEnd?.(); else setTimeout(() => onEnd?.(), delay); return; }
    if (this._loaded) {
      setTimeout(() => {
        if (Sounds.muted || !Sounds.voiceEnabled) { onEnd?.(); return; }
        this._howl.volume(Sounds.voiceVolume);
        if (onEnd) this._howl.once('end', onEnd);
        this._howl.play();
      }, delay);
    } else {
      speakHebrew(this.fallbackText, delay, onEnd);
    }
  }
}

// NOTE: file names are capitalised to match the recorded files on disk.
// Keep this pattern when adding new recordings (Wrong_1, Win_1, etc.)
const V = (n, text) => new VoiceFile(`/sounds/voice/${n}.m4a`, text);

const VOICE_FILES = {
  correct: [
    V('Correct_1', 'כל הכבוד!'), V('Correct_2', 'מצוין!'),
    V('Correct_3', 'יפה מאוד!'), V('Correct_4', 'נכון!'),
    V('Correct_5', 'איזה חכמה!'), V('Correct_6', 'מדהים!'),
    V('Correct_7', 'איך ידעת?'), V('Correct_8', 'וואו, יפה!'),
  ],
  wrong: [
    V('Wrong_1', 'נסי שוב'),
    V('Wrong_2', 'לא נכון, נסי שוב'),
    V('Wrong_3', 'כמעט, נסי שוב'),
  ],
  win: [
    V('Win_1', 'כל הכבוד, סיימת!'), V('Win_2', 'את מדהימה!'),
    V('Win_3', 'ניצחת! יפה מאוד!'), V('Win_4', 'וואו, מצוין!'),
  ],
  streak: [
    V('Streak_1', 'וואו, רצף מדהים!'), V('Streak_2', 'כל הכבוד, את על הגל!'),
    V('Streak_3', 'מדהים, כן כן כן!'), V('Streak_4', 'וואו איך עשית את זה?'),
  ],
  levelUp: [
    V('Levelup_1', 'עלית רמה! כל הכבוד!'),
    V('Levelup_2', 'מדהים, איזה תותחית. עכשיו רמה חדשה!'),
  ],
};

function playVoiceClip(category, delay = 0, onEnd = null) {
  const clips = VOICE_FILES[category];
  pick(clips).play(delay, onEnd);
}

let _hebrewVoice = null;

function loadHebrewVoice() {
  // If we already found a Hebrew voice, no need to search again
  if (_hebrewVoice) return;
  const voices = speechSynthesis.getVoices();
  if (voices.length === 0) return; // Not loaded yet — will retry on voiceschanged or at speak-time
  const heIL    = voices.filter(v => v.lang === 'he-IL');
  const heAny   = voices.filter(v => v.lang.startsWith('he'));
  const isFemale = v => /female|woman|girl|f\b/i.test(v.name);
  _hebrewVoice =
    heIL.find(isFemale)  ||
    heAny.find(isFemale) ||
    heIL[0]  ||
    heAny[0] ||
    null;
}

// Load on first available voices event
if (typeof speechSynthesis !== 'undefined') {
  speechSynthesis.addEventListener('voiceschanged', loadHebrewVoice);
  loadHebrewVoice(); // in case voices are already loaded
}

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

// Incremented by stopSpeech() to cancel any pending delayed speak calls
let _speakToken = 0;

function speakHebrew(text, delayMs = 300, onEnd = null) {
  if (Sounds.muted || !Sounds.voiceEnabled) { onEnd?.(); return; }
  const token = ++_speakToken;
  setTimeout(async () => {
    if (token !== _speakToken) { onEnd?.(); return; }   // cancelled
    if (Sounds.muted || !Sounds.voiceEnabled) { onEnd?.(); return; }
    if (IS_NATIVE) {
      // Use native Android TTS — reliable, no voice pack needed
      try {
        await TextToSpeech.stop();
        if (token !== _speakToken) { onEnd?.(); return; } // cancelled while awaiting
        await TextToSpeech.speak({ text, lang: 'he-IL', rate: 0.9, pitch: 1.3, volume: Sounds.voiceVolume, category: 'ambient' });
      } catch (e) { console.warn('Native TTS error:', e); }
      onEnd?.();
      return;
    }
    // Web browser fallback (Web Speech API)
    if (typeof speechSynthesis === 'undefined') { onEnd?.(); return; }
    loadHebrewVoice();
    const utt = new SpeechSynthesisUtterance(text);
    if (_hebrewVoice) utt.voice = _hebrewVoice;
    utt.lang   = 'he-IL';
    utt.rate   = 0.9;
    utt.pitch  = 1.3;
    utt.volume = Sounds.voiceVolume;
    utt.onend  = () => onEnd?.();
    try { speechSynthesis.resume(); } catch (_) { /* ignore */ }
    if (speechSynthesis.speaking) speechSynthesis.cancel();
    speechSynthesis.speak(utt);
  }, delayMs);
}

// ── Sound effects (declared after Sounds so synthFn closures work) ──

// Synthesis fallbacks for each sound
const synth = {
  tap:     () => { playTone(600, 0.07, 'sine', 0.22); setTimeout(() => playTone(800, 0.05, 'sine', 0.1), 50); },
  correct: () => { playChord([523, 659, 784], 0.22); setTimeout(() => playTone(1047, 0.28, 'sine', 0.18), 230); },
  wrong:   () => { playTone(220, 0.12, 'sawtooth', 0.18); setTimeout(() => playTone(165, 0.18, 'sawtooth', 0.15), 110); },
  win:     () => { [523, 659, 784, 1047, 880, 1047].forEach((f, i) => setTimeout(() => playTone(f, 0.2, 'sine', 0.22), i * 110)); },
  flip:    () => { playTone(520, 0.04, 'triangle', 0.12); setTimeout(() => playTone(380, 0.06, 'triangle', 0.08), 35); },
  match:   () => { playTone(880, 0.09, 'sine', 0.18); setTimeout(() => playTone(1108, 0.13, 'sine', 0.18), 85); },
  star:    () => { [1318, 1568, 1760, 2093].forEach((f, i) => setTimeout(() => playTone(f, 0.16, 'sine', 0.18), i * 75)); },
  streak:  () => { [659, 784, 880, 1046, 1318].forEach((f, i) => setTimeout(() => playTone(f, 0.18, 'sine', 0.2), i * 88)); },
  levelUp: () => { [523, 659, 784, 1047, 1047].forEach((f, i) => setTimeout(() => playTone(f, 0.22, 'triangle', 0.2), i * 95)); },
};

// Map sound name → SoundFile (files in /sounds/)
const sfx = {
  tap:     new SoundFile(['/sounds/tap.mp3',      '/sounds/tap.ogg'],      synth.tap),
  correct: new SoundFile(['/sounds/correct.mp3',  '/sounds/correct.ogg'],  synth.correct),
  wrong:   new SoundFile(['/sounds/wrong.mp3',    '/sounds/wrong.ogg'],    synth.wrong),
  win:     new SoundFile(['/sounds/win.mp3',       '/sounds/win.ogg'],      synth.win),
  flip:    new SoundFile(['/sounds/flip.mp3',     '/sounds/flip.ogg'],     synth.flip),
  match:   new SoundFile(['/sounds/match.mp3',    '/sounds/match.ogg'],    synth.match),
  star:    new SoundFile(['/sounds/star.mp3',     '/sounds/star.ogg'],     synth.star),
  streak:  new SoundFile(['/sounds/streak.mp3',   '/sounds/streak.ogg'],   synth.streak),
  levelUp: new SoundFile(['/sounds/level-up.mp3', '/sounds/level-up.ogg'], synth.levelUp),
};

export const Sounds = {
  muted:        localStorage.getItem('hebrew-app-muted') === 'true',
  musicEnabled: localStorage.getItem('hebrew-app-music') !== 'false',
  musicVolume:  parseFloat(localStorage.getItem('hebrew-app-music-volume') ?? '0.25'),
  sfxVolume:    parseFloat(localStorage.getItem('hebrew-app-sfx-volume') ?? '0.7'),
  voiceEnabled: localStorage.getItem('hebrew-app-voice') !== 'false',
  voiceVolume:  parseFloat(localStorage.getItem('hebrew-app-voice-volume') ?? '0.9'),

  setMuted(val) {
    Sounds.muted = val;
    localStorage.setItem('hebrew-app-muted', String(val));
    Howler.mute(val);
    if (val) stopMusicLoop();
    else if (Sounds.musicEnabled && currentMelody) Sounds.startMusic(currentMelody);
  },

  setMusicEnabled(val) {
    Sounds.musicEnabled = val;
    localStorage.setItem('hebrew-app-music', String(val));
    if (!val) stopMusicLoop();
    else if (!Sounds.muted && currentMelody) Sounds.startMusic(currentMelody);
  },

  setMusicVolume(val) {
    Sounds.musicVolume = val;
    localStorage.setItem('hebrew-app-music-volume', String(val));
    if (bgHowl) bgHowl.volume(val);
  },

  setSfxVolume(val) {
    Sounds.sfxVolume = val;
    localStorage.setItem('hebrew-app-sfx-volume', String(val));
  },

  setVoiceEnabled(val) {
    Sounds.voiceEnabled = val;
    localStorage.setItem('hebrew-app-voice', String(val));
  },

  setVoiceVolume(val) {
    Sounds.voiceVolume = val;
    localStorage.setItem('hebrew-app-voice-volume', String(val));
  },

  startMusic(game = 'home') {
    currentMelody = game;
    stopMusicLoop();
    if (Sounds.muted || !Sounds.musicEnabled) return;

    startBgMusic(game);
  },

  stopMusic() {
    stopMusicLoop();
  },

  tap:     () => sfx.tap.play(Sounds.sfxVolume),
  wrong:   () => { sfx.wrong.play(Sounds.sfxVolume); playVoiceClip('wrong', 400); },
  wrongSfx:() => sfx.wrong.play(Sounds.sfxVolume),
  correct:        () => { sfx.correct.play(Sounds.sfxVolume); playVoiceClip('correct', 350); },
  correctSfxOnly: () => sfx.correct.play(Sounds.sfxVolume),
  praiseVoice:    (delay = 0, onEnd = null) => playVoiceClip('correct', delay, onEnd),
  win:     () => { sfx.win.play(Sounds.sfxVolume); playVoiceClip('win', 600); },
  flip:    () => sfx.flip.play(Sounds.sfxVolume),
  match:   () => { sfx.match.play(Sounds.sfxVolume); playVoiceClip('correct', 300); },
  star:    () => sfx.star.play(Sounds.sfxVolume),
  streak:  () => { sfx.streak.play(Sounds.sfxVolume); playVoiceClip('streak', 400); },
  levelUp: () => { sfx.levelUp.play(Sounds.sfxVolume); playVoiceClip('levelUp', 500); },

  // Speak arbitrary Hebrew text (e.g. letter names, numbers)
  speak: (text, delayMs = 0, onEnd = null) => speakHebrew(text, delayMs, onEnd),

  // Stop any ongoing or pending speech immediately
  stopSpeech() {
    _speakToken++;   // cancel pending delayed calls
    if (IS_NATIVE) {
      try { TextToSpeech.stop(); } catch (_) {}
    } else if (typeof speechSynthesis !== 'undefined') {
      try { speechSynthesis.cancel(); } catch (_) {}
    }
  },
};

// Apply persisted mute state to Howler immediately
Howler.mute(Sounds.muted);
