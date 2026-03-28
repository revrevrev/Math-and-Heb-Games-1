import { useState, useEffect, useCallback, useRef } from 'react';
import GameShell from '../GameShell';
import { Sounds } from '../../utils/sounds';
import { recordGamePlayed, unlockAchievement } from '../../utils/achievements';
import './SoundGame.css';

// ── Game rounds: each has a target sound and 8 flying words ─────────────────
const ROUNDS = [
  {
    target: 'בַּ',
    words: [
      { text: 'בַּיִת', emoji: '🏠', matches: true },
      { text: 'בַּת', emoji: '👧', matches: true },
      { text: 'בַּלּוֹן', emoji: '🎈', matches: true },
      { text: 'בָּנָנָה', emoji: '🍌', matches: true },
      { text: 'כֶּלֶב', emoji: '🐶', matches: false },
      { text: 'תַּפּוּחַ', emoji: '🍎', matches: false },
      { text: 'שִׁיר', emoji: '🎵', matches: false },
      { text: 'פִּיל', emoji: '🐘', matches: false },
    ],
  },
  {
    target: 'מָ',
    words: [
      { text: 'מָיִם', emoji: '💧', matches: true },
      { text: 'מָקוֹם', emoji: '📍', matches: true },
      { text: 'מָתוֹק', emoji: '🍬', matches: true },
      { text: 'שֶׁמֶשׁ', emoji: '☀️', matches: false },
      { text: 'סֵפֶר', emoji: '📚', matches: false },
      { text: 'כֶּלֶב', emoji: '🐶', matches: false },
      { text: 'פֶּרַח', emoji: '🌸', matches: false },
      { text: 'יֶלֶד', emoji: '👦', matches: false },
    ],
  },
  {
    target: 'שִׁ',
    words: [
      { text: 'שִׁיר', emoji: '🎵', matches: true },
      { text: 'שִׁינַיִם', emoji: '🦷', matches: true },
      { text: 'שִׁמְחָה', emoji: '😊', matches: true },
      { text: 'שֶׁמֶשׁ', emoji: '☀️', matches: false },
      { text: 'שָׁלוֹם', emoji: '🕊️', matches: false },
      { text: 'בַּיִת', emoji: '🏠', matches: false },
      { text: 'כֶּלֶב', emoji: '🐶', matches: false },
      { text: 'מָיִם', emoji: '💧', matches: false },
    ],
  },
  {
    target: 'לֵ',
    words: [
      { text: 'לֵב', emoji: '❤️', matches: true },
      { text: 'לֶחֶם', emoji: '🍞', matches: true },
      { text: 'לֵילָה', emoji: '🌙', matches: true },
      { text: 'לָבָן', emoji: '⬜', matches: false },
      { text: 'כַּלְבָּה', emoji: '🐶', matches: false },
      { text: 'מָיִם', emoji: '💧', matches: false },
      { text: 'בַּיִת', emoji: '🏠', matches: false },
      { text: 'שִׁיר', emoji: '🎵', matches: false },
    ],
  },
  {
    target: 'כּוֹ',
    words: [
      { text: 'כּוֹכָב', emoji: '⭐', matches: true },
      { text: 'כּוֹס', emoji: '🥤', matches: true },
      { text: 'כּוֹבַע', emoji: '🎩', matches: true },
      { text: 'כֶּלֶב', emoji: '🐶', matches: false },
      { text: 'כִּתָּה', emoji: '🏫', matches: false },
      { text: 'מָיִם', emoji: '💧', matches: false },
      { text: 'שִׁיר', emoji: '🎵', matches: false },
      { text: 'בַּיִת', emoji: '🏠', matches: false },
    ],
  },
  {
    target: 'פַּ',
    words: [
      { text: 'פַּרְפַּר', emoji: '🦋', matches: true },
      { text: 'פָּרָה', emoji: '🐄', matches: true },
      { text: 'פַּעַם', emoji: '🔔', matches: true },
      { text: 'פֶּרַח', emoji: '🌸', matches: false },
      { text: 'פִּיל', emoji: '🐘', matches: false },
      { text: 'כּוֹכָב', emoji: '⭐', matches: false },
      { text: 'שִׁיר', emoji: '🎵', matches: false },
      { text: 'לֵב', emoji: '❤️', matches: false },
    ],
  },
  {
    target: 'גָּ',
    words: [
      { text: 'גָּדוֹל', emoji: '🐘', matches: true },
      { text: 'גָּמָל', emoji: '🐪', matches: true },
      { text: 'גָּן', emoji: '🌳', matches: true },
      { text: 'גֶּשֶׁם', emoji: '🌧️', matches: false },
      { text: 'גִּלָּה', emoji: '🎀', matches: false },
      { text: 'כֶּלֶב', emoji: '🐶', matches: false },
      { text: 'מָיִם', emoji: '💧', matches: false },
      { text: 'לֵב', emoji: '❤️', matches: false },
    ],
  },
  {
    target: 'תּוּ',
    words: [
      { text: 'תּוּת', emoji: '🍓', matches: true },
      { text: 'תּוּכִּי', emoji: '🦜', matches: true },
      { text: 'תּוּף', emoji: '🥁', matches: true },
      { text: 'תַּפּוּחַ', emoji: '🍎', matches: false },
      { text: 'תֵּה', emoji: '🍵', matches: false },
      { text: 'כֶּלֶב', emoji: '🐶', matches: false },
      { text: 'שִׁיר', emoji: '🎵', matches: false },
      { text: 'גָּן', emoji: '🌳', matches: false },
    ],
  },
];

// Y positions spread so words don't overlap too much
const Y_SLOTS = [14, 26, 38, 52, 64, 20, 44, 58];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function makeWordItems(words) {
  return shuffle(words).map((w, i) => ({
    ...w,
    id: `w${Date.now()}-${i}`,
    yPercent: Y_SLOTS[i % Y_SLOTS.length],
    duration: 7 + Math.random() * 4,  // 7–11 s
    delay: i * 1.1,                    // stagger by 1.1 s
    status: 'flying',                  // 'flying' | 'caught' | 'wrong' | 'gone'
  }));
}

// ── Star burst component ─────────────────────────────────────────────────────
function StarBurst({ x, y }) {
  return (
    <div className="sg-star-burst" style={{ left: x, top: y }}>⭐</div>
  );
}

// ── Flying word ──────────────────────────────────────────────────────────────
function FlyingWord({ word, onTap, onGone }) {
  const handleAnimEnd = (e) => {
    if (e.animationName === 'sg-fly') onGone(word.id);
  };

  return (
    <div
      className={`sg-word-track ${word.status === 'caught' ? 'sg-track-caught' : ''}`}
      style={{
        top: `${word.yPercent}%`,
        '--dur': `${word.duration}s`,
        '--delay': `${word.delay}s`,
      }}
      onAnimationEnd={handleAnimEnd}
    >
      <div
        className={`sg-word-bubble ${word.status === 'wrong' ? 'sg-wrong' : ''}`}
        onClick={(e) => onTap(word.id, e)}
      >
        <span className="sg-word-emoji">{word.emoji}</span>
        <span className="sg-word-text">{word.text}</span>
      </div>
    </div>
  );
}

// ── Main game ────────────────────────────────────────────────────────────────
export default function SoundGame({ onBack, onAddStars }) {
  const [roundIdx, setRoundIdx]     = useState(0);
  const [phase, setPhase]           = useState('intro'); // 'intro' | 'playing' | 'between' | 'done'
  const [wordItems, setWordItems]   = useState([]);
  const [totalStars, setTotalStars] = useState(0);
  const [starBurst, setStarBurst]   = useState(null); // { x, y }

  const wordItemsRef = useRef([]);
  useEffect(() => { wordItemsRef.current = wordItems; }, [wordItems]);

  // ── Phase: intro → playing after 2.5 s ──────────────────────────────────
  useEffect(() => {
    if (phase !== 'intro') return;
    setWordItems([]);
    const t = setTimeout(() => {
      setWordItems(makeWordItems(ROUNDS[roundIdx].words));
      setPhase('playing');
    }, 2500);
    return () => clearTimeout(t);
  }, [phase, roundIdx]);

  // ── Round complete check ─────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'playing' || wordItems.length === 0) return;
    const allDone = wordItems.every(w => w.status === 'caught' || w.status === 'gone');
    if (!allDone) return;

    Sounds.win();
    setPhase('between');
    setTimeout(() => {
      if (roundIdx + 1 >= ROUNDS.length) {
        const stats = recordGamePlayed('soundgame');
        if (stats.count >= 10) unlockAchievement('games_10');
        if (stats.uniqueGames?.length >= 5) unlockAchievement('all_games');
        setPhase('done');
      } else {
        setRoundIdx(r => r + 1);
        setPhase('intro');
      }
    }, 1800);
  }, [wordItems, phase, roundIdx]);

  // ── Tap handler ──────────────────────────────────────────────────────────
  const handleTap = useCallback((wordId, evt) => {
    if (phase !== 'playing') return;
    const w = wordItemsRef.current.find(x => x.id === wordId);
    if (!w || w.status !== 'flying') return;

    Sounds.tap();
    if (w.matches) {
      Sounds.correct();
      onAddStars(1);
      setTotalStars(s => s + 1);
      // Star burst at tap position
      const rect = evt.currentTarget.getBoundingClientRect();
      setStarBurst({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
      setTimeout(() => setStarBurst(null), 700);
      setWordItems(prev => prev.map(x => x.id === wordId ? { ...x, status: 'caught' } : x));
    } else {
      Sounds.wrong();
      setWordItems(prev => prev.map(x => x.id === wordId ? { ...x, status: 'wrong' } : x));
      setTimeout(() => {
        setWordItems(prev =>
          prev.map(x => x.id === wordId && x.status === 'wrong' ? { ...x, status: 'flying' } : x)
        );
      }, 600);
    }
  }, [phase, onAddStars]);

  const handleWordGone = useCallback((wordId) => {
    setWordItems(prev =>
      prev.map(w => w.id === wordId && w.status === 'flying' ? { ...w, status: 'gone' } : w)
    );
  }, []);

  const restart = useCallback(() => {
    setRoundIdx(0);
    setTotalStars(0);
    setPhase('intro');
  }, []);

  const round = ROUNDS[roundIdx];

  return (
    <GameShell onBack={onBack} title="צליל במילה" emoji="🌙" score={totalStars}>
      <div className="sg-game">

        {/* Twinkling background stars */}
        <BgStars />

        {/* Moon man character (bottom-left) */}
        <div className="sg-moonman">
          <img src="/images/האיש על הירח.jpg" alt="האיש על הירח" />
        </div>

        {/* Target sound display */}
        <div className="sg-target-area">
          <div className="sg-target-label">מצאי מילה עם הצליל</div>
          <div className="sg-target-letter">{round.target}</div>
        </div>

        {/* Round progress dots */}
        <div className="sg-progress">
          {ROUNDS.map((_, i) => (
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

        {/* Round intro overlay */}
        {phase === 'intro' && (
          <div className="sg-intro-overlay">
            <div className="sg-intro-round">סבב {roundIdx + 1} מתוך {ROUNDS.length}</div>
            <div className="sg-intro-letter">{round.target}</div>
            <div className="sg-intro-hint">תפסי מילות עם הצליל!</div>
          </div>
        )}

        {/* Between-rounds celebration */}
        {phase === 'between' && (
          <div className="sg-between-overlay">
            <div className="sg-between-text">כל הכבוד! ⭐</div>
          </div>
        )}

        {/* Star burst effect */}
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

// ── Background stars (memoised so they don't re-render) ─────────────────────
const BG_STARS = Array.from({ length: 28 }, (_, i) => ({
  left: `${(i * 37 + 5) % 100}%`,
  top: `${(i * 53 + 8) % 100}%`,
  dur: `${2.2 + (i % 5) * 0.7}s`,
  delay: `${(i % 7) * 0.4}s`,
  size: `${5 + (i % 4) * 3}px`,
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
