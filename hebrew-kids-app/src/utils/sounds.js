// Sound utility using Web Audio API (no external files needed)
const AudioCtx = window.AudioContext || window.webkitAudioContext;
let ctx = null;

function getCtx() {
  if (!ctx) ctx = new AudioCtx();
  return ctx;
}

function playTone(frequency, duration, type = 'sine', gain = 0.3) {
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

export const Sounds = {
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
};
