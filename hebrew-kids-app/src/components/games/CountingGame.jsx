import { useState, useEffect, useRef, useCallback } from 'react';
import GameShell from '../GameShell';
import CharacterImg from '../CharacterImg';
import GameEffects from '../GameEffects';
import { Sounds } from '../../utils/sounds';
import { useGameEnhancements } from '../../utils/useGameEnhancements';
import { unlockAchievement, recordGamePlayed } from '../../utils/achievements';
import './CountingGame.css';

const ROUNDS    = 3;
const SEQ_LEN   = 7;
const TOTAL     = ROUNDS * SEQ_LEN;   // 21 stars possible
const N_BALLOON = 5;

const BALLOON_COLORS = ['#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff', '#c77dff', '#ff9a3c'];

function rand(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }

function makeDistractors(target, count) {
  const used = new Set([target]);
  const result = [];
  let attempts = 0;
  while (result.length < count && attempts < 80) {
    attempts++;
    const offset = rand(1, 5) * (Math.random() > 0.5 ? 1 : -1);
    const d = target + offset;
    if (!used.has(d) && d >= 1 && d <= 30) { used.add(d); result.push(d); }
  }
  // fallback: just add sequential numbers
  let fb = target + 3;
  while (result.length < count) { while (used.has(fb)) fb++; used.add(fb); result.push(fb); }
  return result;
}

let _balloonId = 0;
function nextId() { return ++_balloonId; }

function spawnBalloon(num, index, total) {
  // Spread balloons across horizontal field, randomized within their lane
  const laneW = 80 / total;
  const x = laneW * index + rand(2, laneW - 8);
  return {
    id: nextId(),
    num,
    x: Math.max(4, Math.min(84, x)),
    duration: rand(5, 10),
    delay: -rand(0, 9),
    color: BALLOON_COLORS[rand(0, BALLOON_COLORS.length - 1)],
  };
}

function createBalloons(target) {
  const distractors = makeDistractors(target, N_BALLOON - 1);
  const nums = [target, ...distractors].sort(() => Math.random() - 0.5);
  return nums.map((num, i) => spawnBalloon(num, i, N_BALLOON));
}

// ─────────────────────────────────────────────────────────────
export default function CountingGame({ onBack, onAddStars }) {
  const [roundIdx,  setRoundIdx]  = useState(0);
  const [seqStep,   setSeqStep]   = useState(0);
  const [startNum,  setStartNum]  = useState(() => rand(3, 13));
  const [balloons,  setBalloons]  = useState([]);
  const [popping,   setPopping]   = useState(new Set()); // correctly tapped balloon ids
  const [wobbling,  setWobbling]  = useState(new Set()); // wrongly tapped balloon ids
  const [particles, setParticles] = useState([]);
  const [score,     setScore]     = useState(0);
  const [done,      setDone]      = useState(false);
  const [blueyAnim, setBlueyAnim] = useState('');
  const [showReview,setShowReview]= useState(false);
  const [locked,    setLocked]    = useState(false); // prevent double-taps during transition

  const ge         = useGameEnhancements(TOTAL);
  const targetRef  = useRef(null);
  const globalStep = useRef(0);

  const displayNum = startNum + seqStep;
  const target     = displayNum + 1;
  targetRef.current = target;

  // Music
  useEffect(() => { Sounds.startMusic('counting'); return () => Sounds.stopMusic(); }, []);

  // Recreate balloons whenever the target changes
  useEffect(() => {
    setBalloons(createBalloons(target));
    setPopping(new Set());
    setWobbling(new Set());
    setLocked(false);
  }, [seqStep, startNum]); // eslint-disable-line react-hooks/exhaustive-deps

  // Achievement check on done
  useEffect(() => {
    if (done && score === TOTAL) unlockAchievement('perfect_game');
  }, [done, score]);

  // ── Burst particles ──────────────────────────────────────
  function addBurst(clientX, clientY) {
    const field = document.querySelector('.balloon-field');
    if (!field) return;
    const rect = field.getBoundingClientRect();
    const px = ((clientX - rect.left) / rect.width)  * 100;
    const py = ((clientY - rect.top)  / rect.height) * 100;
    const burst = Array.from({ length: 16 }, (_, i) => ({
      id: `${Date.now()}-${i}`,
      px, py,
      angle: (i / 16) * 360,
      dist:  rand(40, 100),
      color: BALLOON_COLORS[i % BALLOON_COLORS.length],
    }));
    setParticles(p => [...p, ...burst]);
    setTimeout(() => setParticles(p => p.filter(pt => !burst.find(b => b.id === pt.id))), 3600);
  }

  // ── Advance game state ───────────────────────────────────
  const advance = useCallback(() => {
    const nextStep = seqStep + 1;
    if (nextStep >= SEQ_LEN) {
      const nextRound = roundIdx + 1;
      if (nextRound >= ROUNDS) {
        setDone(true);
        Sounds.win();
        const stats = recordGamePlayed('counting');
        if (stats.count >= 10)               unlockAchievement('games_10');
        if (stats.uniqueGames.length >= 5)   unlockAchievement('all_games');
      } else {
        setRoundIdx(nextRound);
        setSeqStep(0);
        setStartNum(rand(3, 13));
        setBlueyAnim('');
      }
    } else {
      setSeqStep(nextStep);
      setBlueyAnim('');
    }
  }, [seqStep, roundIdx]);

  // ── Balloon tap ──────────────────────────────────────────
  function handleBalloonTap(balloon, e) {
    if (locked || popping.has(balloon.id)) return;

    Sounds.tap();

    if (balloon.num === targetRef.current) {
      // ✅ Correct
      setLocked(true);
      setPopping(prev => new Set([...prev, balloon.id]));
      setBlueyAnim('celebrate');
      setScore(s => s + 1);
      onAddStars(1);
      addBurst(e.clientX, e.clientY);

      globalStep.current++;
      ge.onCorrect({ display: `${displayNum} → ${balloon.num}` }, globalStep.current);

      setTimeout(() => { advance(); }, 900);

    } else {
      // ❌ Wrong
      Sounds.wrongSfx();
      setWobbling(prev => new Set([...prev, balloon.id]));
      setBlueyAnim('wiggle');
      ge.onWrong();
      setTimeout(() => {
        setWobbling(prev => { const n = new Set(prev); n.delete(balloon.id); return n; });
        setBlueyAnim('');
      }, 600);
    }
  }

  // ── Balloon loops off screen → refresh its number ───────
  function handleAnimationIteration(balloonId) {
    const tgt = targetRef.current;
    setBalloons(prev => {
      const otherHasTarget = prev.some(b => b.id !== balloonId && b.num === tgt && !popping.has(b.id));
      const [newNum] = otherHasTarget ? makeDistractors(tgt, 1) : [tgt];
      return prev.map(b => b.id !== balloonId ? b : { ...b, num: newNum, x: rand(4, 84) });
    });
  }

  // ── Restart ──────────────────────────────────────────────
  function restart() {
    const sn = rand(3, 13);
    setRoundIdx(0); setSeqStep(0); setStartNum(sn);
    setScore(0); setDone(false); setShowReview(false);
    setBlueyAnim(''); setPopping(new Set()); setWobbling(new Set()); setParticles([]);
    setLocked(false);
    globalStep.current = 0;
    ge.reset();
  }

  // ── Render ───────────────────────────────────────────────
  return (
    <GameShell title="בלונים עם בלואי" emoji="🎈" score={score} maxScore={TOTAL} onBack={onBack} bgClass="counting-bg">
      <img src="/images/HeelerFamV2-1-576x1024.jpg" className="counting-bg-photo" alt="" aria-hidden="true" />
      <div className="counting-bg-tint" aria-hidden="true" />
      <GameEffects correct={popping.size > 0} done={done} character="bluey" />

      {ge.showStreakBonus && <div className="streak-banner">🔥 {ge.streakCount} ברצף! מדהים!</div>}
      {ge.showLevelUp    && <div className="level-up-banner">⬆️ שלב 2! המשיכי כך! 🌟</div>}

      {done ? (
        /* ── Done screen ── */
        <div className="done-screen fade-in">
          <CharacterImg character="bluey" size={130} />
          <div className="done-box pop">
            <span className="done-emoji">🎈</span>
            <h2 className="done-title">כל הכבוד!</h2>
            <p className="done-sub">קיבלת {score} כוכבים מתוך {TOTAL}!</p>
            {score === TOTAL && <span className="done-perfect">🌟 משחק מושלם!</span>}
            <div className="done-perf"><span>🔥 רצף מקסימלי: {ge.bestStreak}</span></div>
            {'⭐'.repeat(Math.min(score, 21))}
            <div className="done-btns">
              <button className="done-btn secondary review-toggle-btn"
                onClick={() => setShowReview(r => !r)}>
                {showReview ? '▲ הסתרי' : '📋 סקירה'}
              </button>
              <button className="done-btn primary" onClick={restart}>שחק שוב 🔄</button>
              <button className="done-btn secondary" onClick={onBack}>🏠 בית</button>
            </div>
          </div>
          {showReview && (
            <div className="review-section">
              {ge.history.map((item, i) => (
                <div key={i} className="review-item review-correct">
                  <span className="review-icon">✅</span>
                  <span className="review-question">{item.display}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* ── Game screen ── */
        <div className="balloon-game-wrap">
          {/* Progress */}
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${(score / TOTAL) * 100}%` }} />
          </div>
          <p className="round-label">סיבוב {roundIdx + 1}/{ROUNDS} · שלב {seqStep + 1}/{SEQ_LEN}</p>

          {/* Current number prompt */}
          <div className="num-prompt">
            <div className={`bluey-small ${blueyAnim}`}>
              <CharacterImg character="bluey" size={56} />
            </div>
            <div className="num-prompt-content">
              <span className="num-prompt-label">מה המספר הבא?</span>
              <div className="num-prompt-row">
                <span className="num-display-box">{displayNum}</span>
                <span className="num-arrow">←</span>
                <span className="num-display-box target-box">?</span>
              </div>
            </div>
          </div>

          {/* Balloon field */}
          <div className="balloon-field">
            {balloons.map(b => {
              const isPopping  = popping.has(b.id);
              const isWobbling = wobbling.has(b.id);
              return (
                <div
                  key={b.id}
                  className={`balloon ${isPopping ? 'balloon-pop' : 'balloon-float'} ${isWobbling ? 'balloon-wobble' : ''}`}
                  style={{
                    left:              `${b.x}%`,
                    '--dur':           `${b.duration}s`,
                    '--del':           `${b.delay}s`,
                    '--balloon-color': b.color,
                  }}
                  onClick={e => handleBalloonTap(b, e)}
                  onAnimationIteration={() => !isPopping && handleAnimationIteration(b.id)}
                >
                  <div className="balloon-body">
                    <span className="balloon-num">{b.num}</span>
                  </div>
                  <div className="balloon-knot" />
                  <div className="balloon-string" />
                </div>
              );
            })}

            {/* Glitter particles on burst */}
            {particles.map(p => (
              <div
                key={p.id}
                className="burst-particle"
                style={{
                  left:      `${p.px}%`,
                  top:       `${p.py}%`,
                  '--angle': `${p.angle}deg`,
                  '--dist':  `${p.dist}px`,
                  '--pcolor': p.color,
                }}
              />
            ))}
          </div>
        </div>
      )}
    </GameShell>
  );
}
