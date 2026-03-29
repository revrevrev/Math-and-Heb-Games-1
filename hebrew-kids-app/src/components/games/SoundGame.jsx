import { useState, useEffect, useCallback, useRef } from 'react';
import GameShell from '../GameShell';
import { Sounds } from '../../utils/sounds';
import { recordGamePlayed, unlockAchievement } from '../../utils/achievements';
import './SoundGame.css';

// ── Game data: 8 rounds, each with a target sound and ~10 flying words ──────
// Each word may contain the target sound at the start OR in the middle.
const ROUNDS = [
  {
    target: 'בַּ',  // B + A (bet-dagesh + patach/kamatz)
    words: [
      { text: 'בַּיִת',   emoji: '🏠', matches: true  }, // starts with BA
      { text: 'בַּת',     emoji: '👧', matches: true  },
      { text: 'בַּלּוֹן', emoji: '🎈', matches: true  },
      { text: 'בָּנָנָה', emoji: '🍌', matches: true  },
      { text: 'אַבָּא',   emoji: '👨', matches: true  }, // BA in middle
      { text: 'סַבָּא',   emoji: '👴', matches: true  }, // BA in middle
      { text: 'שַׁבָּת',  emoji: '🕯️', matches: true  }, // BA in middle
      { text: 'כֶּלֶב',   emoji: '🐶', matches: false },
      { text: 'שִׁיר',    emoji: '🎵', matches: false },
      { text: 'פִּיל',    emoji: '🐘', matches: false },
      { text: 'גֶּשֶׁם',  emoji: '🌧️', matches: false },
    ],
  },
  {
    target: 'מָ',  // M + A (mem + kamatz/patach)
    words: [
      { text: 'מָיִם',    emoji: '💧', matches: true  },
      { text: 'מָתוֹק',   emoji: '🍬', matches: true  },
      { text: 'מָקוֹם',   emoji: '📍', matches: true  },
      { text: 'אִמָּא',   emoji: '👩', matches: true  }, // MA in middle
      { text: 'גָּמָל',   emoji: '🐪', matches: true  }, // MA in middle
      { text: 'שָׁמַיִם', emoji: '☁️', matches: true  }, // MA in middle
      { text: 'שֶׁמֶשׁ',  emoji: '☀️', matches: false }, // ME not MA
      { text: 'סֵפֶר',    emoji: '📚', matches: false },
      { text: 'כֶּלֶב',   emoji: '🐶', matches: false },
      { text: 'לֵב',      emoji: '❤️', matches: false },
    ],
  },
  {
    target: 'שִׁ',  // SH + I (shin + hirik)
    words: [
      { text: 'שִׁיר',     emoji: '🎵', matches: true  },
      { text: 'שִׁינַיִם', emoji: '🦷', matches: true  },
      { text: 'שִׁירָה',   emoji: '🎶', matches: true  },
      { text: 'שִׁיעוּר',  emoji: '📝', matches: true  },
      { text: 'שִׁישִׁי',  emoji: '📅', matches: true  }, // SHI (Friday/sixth)
      { text: 'שֶׁמֶשׁ',   emoji: '☀️', matches: false }, // SHE not SHI
      { text: 'שָׁלוֹם',   emoji: '🕊️', matches: false }, // SHA not SHI
      { text: 'בַּיִת',    emoji: '🏠', matches: false },
      { text: 'מָיִם',     emoji: '💧', matches: false },
      { text: 'כֶּלֶב',    emoji: '🐶', matches: false },
    ],
  },
  {
    target: 'לֵ',  // L + E (lamed + tsere/segol)
    words: [
      { text: 'לֵב',     emoji: '❤️', matches: true  },
      { text: 'לֶחֶם',   emoji: '🍞', matches: true  },
      { text: 'לֵיצָן',  emoji: '🤡', matches: true  }, // LE (clown)
      { text: 'לַיְלָה',  emoji: '🌙', matches: false }, // LA not LE
      { text: 'שָׁלֶג',  emoji: '❄️', matches: true  }, // LE in middle
      { text: 'כֶּלֶב',  emoji: '🐶', matches: true  }, // LE in middle (ke-LEV)
      { text: 'יֶלֶד',   emoji: '👦', matches: true  }, // LE in middle (ye-LED)
      { text: 'לָבָן',   emoji: '⬜', matches: false }, // LA not LE
      { text: 'מָיִם',   emoji: '💧', matches: false },
      { text: 'בַּיִת',  emoji: '🏠', matches: false },
      { text: 'שִׁיר',   emoji: '🎵', matches: false },
    ],
  },
  {
    target: 'כּוֹ',  // K + O (kaf-dagesh + holam)
    words: [
      { text: 'כּוֹכָב',   emoji: '⭐', matches: true  },
      { text: 'כּוֹס',     emoji: '🥤', matches: true  },
      { text: 'כּוֹבַע',   emoji: '🎩', matches: true  },
      { text: 'כּוֹחַ',    emoji: '💪', matches: true  },
      { text: 'סֻכּוֹת',   emoji: '🌿', matches: true  }, // KO in middle (Sukkot)
      { text: 'כֶּלֶב',   emoji: '🐶', matches: false }, // KE not KO
      { text: 'כִּתָּה', emoji: '🏫', matches: false }, // KI not KO
      { text: 'מָיִם',   emoji: '💧', matches: false },
      { text: 'שִׁיר',   emoji: '🎵', matches: false },
      { text: 'לֵב',     emoji: '❤️', matches: false },
      { text: 'גָּן',    emoji: '🌳', matches: false },
    ],
  },
  {
    target: 'פַּ',  // P + A (pey-dagesh + patach/kamatz)
    words: [
      { text: 'פַּרְפַּר', emoji: '🦋', matches: true  }, // PA at start AND middle
      { text: 'פָּרָה',    emoji: '🐄', matches: true  },
      { text: 'פַּעַם',    emoji: '🔔', matches: true  },
      { text: 'פָּנִים',   emoji: '😊', matches: true  },
      { text: 'מַפָּה',    emoji: '🗺️', matches: true  }, // PA in middle
      { text: 'פֶּרַח',    emoji: '🌸', matches: false }, // PE not PA
      { text: 'פִּיל',     emoji: '🐘', matches: false }, // PI not PA
      { text: 'כֶּלֶב',    emoji: '🐶', matches: false },
      { text: 'שִׁיר',     emoji: '🎵', matches: false },
      { text: 'לֵב',       emoji: '❤️', matches: false },
    ],
  },
  {
    target: 'גָּ',  // G + A (gimel + kamatz/patach)
    words: [
      { text: 'גָּדוֹל', emoji: '🐘', matches: true  },
      { text: 'גָּמָל',  emoji: '🐪', matches: true  },
      { text: 'גָּן',    emoji: '🌳', matches: true  },
      { text: 'נָגַן',   emoji: '🎸', matches: true  }, // GA in middle (na-GAN)
      { text: 'גָּג',    emoji: '🏠', matches: true  }, // GA (roof)
      { text: 'גֶּשֶׁם', emoji: '🌧️', matches: false }, // GE not GA
      { text: 'גִּלָּה', emoji: '🎀', matches: false }, // GI not GA
      { text: 'כֶּלֶב',  emoji: '🐶', matches: false },
      { text: 'מָיִם',   emoji: '💧', matches: false },
      { text: 'לֵב',     emoji: '❤️', matches: false },
    ],
  },
  {
    target: 'תּוּ',  // T + U (tav + shuruk/kubutz)
    words: [
      { text: 'תּוּת',     emoji: '🍓', matches: true  },
      { text: 'תּוּכִּי',  emoji: '🦜', matches: true  },
      { text: 'תּוּלַעַת', emoji: '🪱', matches: true  },
      { text: 'מְתוּקָה',  emoji: '🍬', matches: true  }, // TU in middle (sweet)
      { text: 'חָתוּל',    emoji: '🐱', matches: true  }, // TU in middle (cat)
      { text: 'תּוֹף',     emoji: '🥁', matches: false }, // TO not TU
      { text: 'תַּפּוּחַ', emoji: '🍎', matches: false }, // TA not TU
      { text: 'תֵּה',      emoji: '🍵', matches: false }, // TE not TU
      { text: 'כֶּלֶב',    emoji: '🐶', matches: false },
      { text: 'שִׁיר',     emoji: '🎵', matches: false },
      { text: 'גָּן',      emoji: '🌳', matches: false },
      { text: 'מָיִם',     emoji: '💧', matches: false },
    ],
  },
];

const CATCHES_NEEDED = 4;  // how many correct taps needed to finish a round
const MAX_ACTIVE = 4;  // max words flying at once

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Spread Y positions so words don't stack
function spreadY(count) {
  const positions = [];
  const step = 60 / count;
  for (let i = 0; i < count; i++) {
    positions.push(12 + i * step + Math.random() * (step * 0.6));
  }
  return shuffle(positions);
}

function makeBatch(words, batchIndex) {
  const shuffled = shuffle([...words]);
  const ys = spreadY(shuffled.length);
  return shuffled.map((w, i) => ({
    ...w,
    id: `b${batchIndex}-${i}-${Date.now()}`,
    yPercent: ys[i],
    duration: 7 + Math.random() * 4,
    delay: i * 1.1,
    status: 'flying',
  }));
}

// ── Star burst ───────────────────────────────────────────────────────────────
function StarBurst({ x, y }) {
  return <div className="sg-star-burst" style={{ left: x, top: y }}>⭐</div>;
}

// ── Flying word ──────────────────────────────────────────────────────────────
function FlyingWord({ word, onTap, onGone }) {
  const handleAnimEnd = (e) => {
    if (e.animationName === 'sg-fly') onGone(word.id);
  };
  return (
    <div
      className={`sg-word-track ${word.status === 'caught' ? 'sg-track-caught' : ''}`}
      style={{ top: `${word.yPercent}%`, '--dur': `${word.duration}s`, '--delay': `${word.delay}s` }}
      onAnimationEnd={handleAnimEnd}
    >
      <div className="sg-word-bubble" onClick={(e) => onTap(word.id, e)}>
        <span className="sg-word-emoji">{word.emoji}</span>
        <span className="sg-word-text">{word.text}</span>
      </div>
    </div>
  );
}

// ── Progress bar — shows how many of 5 caught ───────────────────────────────
function CatchProgress({ caught }) {
  return (
    <div className="sg-catch-progress">
      {Array.from({ length: CATCHES_NEEDED }).map((_, i) => (
        <span key={i} className={`sg-catch-dot ${i < caught ? 'sg-catch-dot-full' : ''}`} />
      ))}
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────
export default function SoundGame({ onBack, onAddStars }) {
  const [shuffledRounds, setShuffledRounds] = useState(() => [ROUNDS[Math.floor(Math.random() * ROUNDS.length)]]);
  const [roundIdx, setRoundIdx]       = useState(0);
  const [phase, setPhase]             = useState('intro');
  const [wordItems, setWordItems]     = useState([]);
  const [caughtCount, setCaughtCount] = useState(0);
  const [totalStars, setTotalStars]   = useState(0);
  const [starBurst, setStarBurst]     = useState(null);

  const wordItemsRef  = useRef([]);
  const caughtRef     = useRef(0);
  const batchRef      = useRef(0);

  useEffect(() => { wordItemsRef.current = wordItems; }, [wordItems]);
  useEffect(() => { caughtRef.current = caughtCount; }, [caughtCount]);

  // ── Music ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    Sounds.startMusic('soundgame');
    return () => Sounds.stopMusic();
  }, []);

  // ── Intro phase: speak the sound, then launch first batch ─────────────────
  useEffect(() => {
    if (phase !== 'intro') return;
    batchRef.current = 0;
    setCaughtCount(0);
    setWordItems([]);

    // Speak the instruction after 400 ms
    const round = shuffledRounds[roundIdx];
    // Niqqud in the instruction helps Hebrew TTS pronounce every word correctly
    const speech = `מִצְאִי מִילִים עִם הַצְּלִיל ${round.target}`;
    Sounds.speak(speech, 400);

    // Start playing after 2.5 s
    const t = setTimeout(() => {
      setWordItems(makeBatch(round.words, batchRef.current));
      setPhase('playing');
    }, 2500);
    return () => clearTimeout(t);
  }, [phase, roundIdx, shuffledRounds]);

  // ── Check if batch is exhausted ────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'playing' || wordItems.length === 0) return;
    const allDone = wordItems.every(w => w.status === 'caught' || w.status === 'gone');
    if (!allDone) return;

    if (caughtRef.current >= CATCHES_NEEDED) {
      // Round complete
      Sounds.win();
      setPhase('between');
      setTimeout(() => {
        if (roundIdx + 1 >= shuffledRounds.length) {
          const stats = recordGamePlayed('soundgame');
          if (stats.count >= 10) unlockAchievement('games_10');
          if (stats.uniqueGames?.length >= 5) unlockAchievement('all_games');
          setPhase('done');
        } else {
          setRoundIdx(r => r + 1);
          setPhase('intro');
        }
      }, 1800);
    } else {
      // Need more catches — recycle the word list
      batchRef.current += 1;
      setWordItems(makeBatch(shuffledRounds[roundIdx].words, batchRef.current));
    }
  }, [wordItems, phase, roundIdx]);

  // ── Tap handler ───────────────────────────────────────────────────────────
  const handleTap = useCallback((wordId, evt) => {
    if (phase !== 'playing') return;
    const w = wordItemsRef.current.find(x => x.id === wordId);
    if (!w || w.status !== 'flying') return;

    Sounds.tap();
    if (w.matches) {
      Sounds.correct();
      onAddStars(1);
      setTotalStars(s => s + 1);
      setCaughtCount(c => c + 1);
      // Star burst at tap position
      const rect = evt.currentTarget.getBoundingClientRect();
      setStarBurst({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
      setTimeout(() => setStarBurst(null), 700);
      setWordItems(prev => prev.map(x => x.id === wordId ? { ...x, status: 'caught' } : x));
    }
    // Wrong tap: no feedback (gentle game)
  }, [phase, onAddStars]);

  const handleWordGone = useCallback((wordId) => {
    setWordItems(prev =>
      prev.map(w => w.id === wordId && w.status === 'flying' ? { ...w, status: 'gone' } : w)
    );
  }, []);

  const restart = useCallback(() => {
    setShuffledRounds([ROUNDS[Math.floor(Math.random() * ROUNDS.length)]]);
    setRoundIdx(0);
    setTotalStars(0);
    setPhase('intro');
  }, []);

  const round = shuffledRounds[roundIdx];

  return (
    <GameShell onBack={onBack} title="צליל במילה" emoji="🌙" score={totalStars}>
      <div className="sg-game">

        <BgStars />

        {/* Target sound */}
        <div className="sg-target-area">
          <div className="sg-target-label">מִצְאִי מִילִים עִם הַצְּלִיל</div>
          <div className="sg-target-letter">{round.target}</div>
          <CatchProgress caught={Math.min(caughtCount, CATCHES_NEEDED)} />
        </div>

        {/* Round progress dots */}
        <div className="sg-progress">
          {shuffledRounds.map((_, i) => (
            <span key={i} className={`sg-dot ${i < roundIdx ? 'sg-dot-done' : i === roundIdx ? 'sg-dot-active' : ''}`} />
          ))}
        </div>

        {/* Flying words */}
        {phase === 'playing' && (
          <div className="sg-flying-area">
            {wordItems.map(word =>
              word.status !== 'gone' && (
                <FlyingWord key={word.id} word={word} onTap={handleTap} onGone={handleWordGone} />
              )
            )}
          </div>
        )}

        {/* Intro overlay */}
        {phase === 'intro' && (
          <div className="sg-intro-overlay">
            <div className="sg-intro-round">סבב {roundIdx + 1} מתוך {shuffledRounds.length}</div>
            <div className="sg-intro-letter">{round.target}</div>
            <div className="sg-intro-hint">מִצְאִי מִילִים עִם הַצְּלִיל!</div>
          </div>
        )}

        {/* Between-rounds celebration */}
        {phase === 'between' && (
          <div className="sg-between-overlay">
            <div className="sg-between-text">כל הכבוד! ⭐</div>
          </div>
        )}

        {/* Star burst */}
        {starBurst && <StarBurst x={starBurst.x} y={starBurst.y} />}

        {/* Done screen */}
        {phase === 'done' && (
          <div className="sg-done">
            <div className="sg-done-moon">🌙</div>
            <div className="sg-done-title">כל הכבוד!</div>
            <div className="sg-done-stars">⭐ {totalStars} כוכבים!</div>
            <button className="sg-done-btn" onClick={restart}>שחקי שוב!</button>
            <button className="sg-back-btn" onClick={onBack}>הביתה 🏠</button>
          </div>
        )}
      </div>
    </GameShell>
  );
}

// ── Static background stars ──────────────────────────────────────────────────
const BG_STARS = Array.from({ length: 28 }, (_, i) => ({
  left:  `${(i * 37 + 5)  % 100}%`,
  top:   `${(i * 53 + 8)  % 100}%`,
  dur:   `${2.2 + (i % 5) * 0.7}s`,
  delay: `${(i % 7)       * 0.4}s`,
  size:  `${5 + (i % 4)   * 3}px`,
}));

function BgStars() {
  return (
    <div className="sg-bg-stars" aria-hidden>
      {BG_STARS.map((s, i) => (
        <span key={i} className="sg-bg-star" style={{
          left: s.left, top: s.top,
          animationDuration: s.dur, animationDelay: s.delay,
          fontSize: s.size,
        }}>✦</span>
      ))}
    </div>
  );
}
