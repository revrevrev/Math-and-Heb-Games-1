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

const CATCHES_NEEDED = 4;
const MAX_ACTIVE     = 3;   // max words flying at once
const SPAWN_INTERVAL = 1600; // ms between spawn attempts

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
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
      style={{ top: `${word.yPercent}%`, '--dur': `${word.duration}s`, '--delay': '0s' }}
      onAnimationEnd={handleAnimEnd}
    >
      <div className="sg-word-bubble" onClick={(e) => onTap(word.id, e)}>
        <span className="sg-word-emoji">{word.emoji}</span>
        <span className="sg-word-text">{word.text}</span>
      </div>
    </div>
  );
}

// ── Progress bar — shows how many of CATCHES_NEEDED caught ──────────────────
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
  const [phase, setPhase]             = useState('intro');
  const [wordItems, setWordItems]     = useState([]);
  const [caughtCount, setCaughtCount] = useState(0);
  const [totalStars, setTotalStars]   = useState(0);
  const [starBurst, setStarBurst]     = useState(null);

  const wordItemsRef = useRef([]);
  const caughtRef    = useRef(0);
  const wordPoolRef  = useRef([]);
  const nextIdRef    = useRef(0);

  useEffect(() => { wordItemsRef.current = wordItems; }, [wordItems]);

  // ── Music ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    Sounds.startMusic('soundgame');
    return () => Sounds.stopMusic();
  }, []);

  // ── Intro: speak instruction, then start playing ───────────────────────────
  useEffect(() => {
    if (phase !== 'intro') return;
    caughtRef.current = 0;
    setCaughtCount(0);
    setWordItems([]);

    const round = shuffledRounds[0];
    Sounds.speak(`מִצְאִי מִילִים עִם הַצְּלִיל ${round.target}`, 400);

    const t = setTimeout(() => setPhase('playing'), 2500);
    return () => clearTimeout(t);
  }, [phase, shuffledRounds]);

  // ── Continuous word spawner ────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'playing') return;

    const round = shuffledRounds[0];
    wordPoolRef.current = shuffle([...round.words]);
    nextIdRef.current = 0;

    function spawnWord() {
      if (caughtRef.current >= CATCHES_NEEDED) return;

      if (wordPoolRef.current.length === 0) {
        wordPoolRef.current = shuffle([...round.words]);
      }
      const w = wordPoolRef.current.pop();
      const newWord = {
        ...w,
        id: `w${nextIdRef.current++}-${Date.now()}`,
        yPercent: 10 + Math.random() * 62,
        duration: 7 + Math.random() * 4,
        delay: 0,
        status: 'flying',
      };

      setWordItems(prev => {
        const active = prev.filter(x => x.status === 'flying').length;
        if (active >= MAX_ACTIVE) return prev;
        return [...prev, newWord];
      });
    }

    spawnWord(); // spawn immediately on phase start
    const timer = setInterval(spawnWord, SPAWN_INTERVAL);
    return () => clearInterval(timer);
  }, [phase, shuffledRounds]);

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
      const newCaught = caughtRef.current + 1;
      caughtRef.current = newCaught;
      setCaughtCount(newCaught);

      const rect = evt.currentTarget.getBoundingClientRect();
      setStarBurst({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
      setTimeout(() => setStarBurst(null), 700);
      setWordItems(prev => prev.map(x => x.id === wordId ? { ...x, status: 'caught' } : x));

      if (newCaught >= CATCHES_NEEDED) {
        Sounds.win();
        setPhase('between');
        setTimeout(() => {
          const stats = recordGamePlayed('soundgame');
          if (stats.count >= 10) unlockAchievement('games_10');
          if (stats.uniqueGames?.length >= 5) unlockAchievement('all_games');
          setPhase('done');
        }, 1800);
      }
    }
    // Wrong tap: no feedback (gentle game)
  }, [phase, onAddStars]);

  // ── Word flew off screen ───────────────────────────────────────────────────
  const handleWordGone = useCallback((wordId) => {
    setWordItems(prev => prev.filter(w => w.id !== wordId));
  }, []);

  // ── Replay instruction when tapping the target letter ─────────────────────
  const speakInstruction = useCallback(() => {
    const round = shuffledRounds[0];
    Sounds.speak(`מִצְאִי מִילִים עִם הַצְּלִיל ${round.target}`, 0);
  }, [shuffledRounds]);

  const restart = useCallback(() => {
    setShuffledRounds([ROUNDS[Math.floor(Math.random() * ROUNDS.length)]]);
    setTotalStars(0);
    setPhase('intro');
  }, []);

  const round = shuffledRounds[0];

  return (
    <GameShell onBack={onBack} title="צליל במילה" emoji="🌙" score={totalStars}>
      <div className="sg-game">

        <BgStars />

        {/* Target sound — tap to replay instruction */}
        <div className="sg-target-area">
          <div className="sg-target-label">מִצְאִי מִילִים עִם הַצְּלִיל</div>
          <div className="sg-target-letter sg-target-tappable" onClick={speakInstruction}>
            {round.target}
          </div>
          <div className="sg-target-tap-hint">👆 לחצי לשמוע שוב</div>
          <CatchProgress caught={Math.min(caughtCount, CATCHES_NEEDED)} />
        </div>

        {/* Flying words */}
        {phase === 'playing' && (
          <div className="sg-flying-area">
            {wordItems.map(word => (
              <FlyingWord key={word.id} word={word} onTap={handleTap} onGone={handleWordGone} />
            ))}
          </div>
        )}

        {/* Intro overlay */}
        {phase === 'intro' && (
          <div className="sg-intro-overlay">
            <div className="sg-intro-letter">{round.target}</div>
            <div className="sg-intro-hint">מִצְאִי מִילִים עִם הַצְּלִיל!</div>
          </div>
        )}

        {/* Between celebration */}
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
