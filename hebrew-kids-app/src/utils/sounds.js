// Sound utility using Web Audio API (no external files needed)
const AudioCtx = window.AudioContext || window.webkitAudioContext;
let ctx = null;

function getCtx() {
  if (!ctx) ctx = new AudioCtx();
  return ctx;
}

function playTone(frequency, duration, type = 'sine', gain = 0.3) {
  if (Sounds.muted) return;
  try {
    const ac = getCtx();
    const osc = ac.createOscillator();
    const gainNode = ac.createGain();
    osc.connect(gainNode);
    gainNode.connect(ac.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ac.currentTime);
    gainNode.gain.setValueAtTime(gain, ac.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + duration);
    osc.start(ac.currentTime);
    osc.stop(ac.currentTime + duration);
  } catch (e) { /* silent fail */ }
}

function playChord(notes, duration = 0.3) {
  notes.forEach((f, i) => {
    setTimeout(() => playTone(f, duration, 'sine', 0.2), i * 60);
  });
}

// ── Background music ─────────────────────────────────────
let musicInterval = null;
let musicNoteIdx  = 0;
let currentMelody = null;

const MELODIES = {
  letters:  [523, 587, 659, 784, 659, 587, 523, 440],
  counting: [440, 523, 659, 880, 659, 523, 440, 392],
  memory:   [392, 440, 523, 659, 523, 440, 392, 349],
  math:     [523, 659, 784, 880, 784, 659, 523, 440],
  words:    [659, 784, 880, 1046, 880, 784, 659, 587],
  home:     [523, 659, 784, 659, 523, 784, 880, 784],
};

function stopMusicLoop() {
  if (musicInterval) { clearInterval(musicInterval); musicInterval = null; }
}

export const Sounds = {
  muted:        localStorage.getItem('hebrew-app-muted')  === 'true',
  musicEnabled: localStorage.getItem('hebrew-app-music')  !== 'false',

  setMuted(val) {
    Sounds.muted = val;
    localStorage.setItem('hebrew-app-muted', String(val));
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
    const melody = MELODIES[game] || MELODIES.home;
    musicNoteIdx = 0;
    musicInterval = setInterval(() => {
      if (!Sounds.muted && Sounds.musicEnabled) {
        playTone(melody[musicNoteIdx % melody.length], 0.4, 'sine', 0.035);
        musicNoteIdx++;
      }
    }, 400);
  },

  stopMusic() {
    stopMusicLoop();
  },

  /** Short cheerful tick on tap */
  tap: () => playTone(600, 0.08, 'sine', 0.25),

  /** Wrong answer buzz */
  wrong: () => {
    playTone(200, 0.15, 'sawtooth', 0.2);
    setTimeout(() => playTone(150, 0.2, 'sawtooth', 0.2), 120);
  },

  /** Correct single answer */
  correct: () => {
    playChord([523, 659, 784], 0.25);
    setTimeout(() => playTone(1047, 0.3, 'sine', 0.2), 250);
  },

  /** Big win / level complete */
  win: () => {
    const melody = [523, 659, 784, 1047, 880, 1047];
    melody.forEach((f, i) => setTimeout(() => playTone(f, 0.22, 'sine', 0.25), i * 110));
  },

  /** Card flip */
  flip: () => playTone(440, 0.07, 'triangle', 0.15),

  /** Memory match found */
  match: () => {
    playTone(880, 0.1, 'sine', 0.2);
    setTimeout(() => playTone(1108, 0.15, 'sine', 0.2), 90);
  },

  /** Star earned */
  star: () => {
    [1318, 1568, 1760].forEach((f, i) =>
      setTimeout(() => playTone(f, 0.18, 'sine', 0.2), i * 80));
  },

  /** Streak bonus! 🔥 */
  streak: () => {
    [659, 784, 880, 1046, 1318].forEach((f, i) =>
      setTimeout(() => playTone(f, 0.2, 'sine', 0.22), i * 90));
  },

  /** Level up! ⬆️ */
  levelUp: () => {
    [523, 659, 784, 1047, 1047].forEach((f, i) =>
      setTimeout(() => playTone(f, 0.25, 'triangle', 0.22), i * 100));
  },
};
