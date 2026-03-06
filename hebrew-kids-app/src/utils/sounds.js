// Sound utility — loads real audio files via Howler.js,
// falls back to Web Audio API synthesis if files are missing.
import { Howl } from 'howler';

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

const BG_MUSIC_FILES = {
  letters:  ['/sounds/music/letters.mp3',  '/sounds/music/letters.ogg'],
  counting: ['/sounds/music/counting.mp3', '/sounds/music/counting.ogg'],
  memory:   ['/sounds/music/memory.mp3',   '/sounds/music/memory.ogg'],
  math:     ['/sounds/music/math.mp3',     '/sounds/music/math.ogg'],
  words:    ['/sounds/music/words.mp3',    '/sounds/music/words.ogg'],
  home:     ['/sounds/music/home.mp3',     '/sounds/music/home.ogg'],
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

  startMusic(game = 'home') {
    currentMelody = game;
    stopMusicLoop();
    if (Sounds.muted || !Sounds.musicEnabled) return;

    // Try file-based music first
    const filePaths = BG_MUSIC_FILES[game] || BG_MUSIC_FILES.home;
    bgHowl = new Howl({
      src: filePaths,
      volume: 0.25,
      loop: true,
      onload: () => bgHowl.play(),
      onloaderror: () => {
        bgHowl = null;
        startSynthMusic(game);
      },
    });
  },

  stopMusic() {
    stopMusicLoop();
  },

  tap:     () => sfx.tap.play(),
  wrong:   () => sfx.wrong.play(),
  correct: () => sfx.correct.play(),
  win:     () => sfx.win.play(),
  flip:    () => sfx.flip.play(),
  match:   () => sfx.match.play(),
  star:    () => sfx.star.play(0.8),
  streak:  () => sfx.streak.play(),
  levelUp: () => sfx.levelUp.play(),
};

// Apply persisted mute state to Howler immediately
Howler.mute(Sounds.muted);
