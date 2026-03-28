import { useState, useCallback, useEffect, useRef } from 'react';
import GameShell from '../GameShell';
import CharacterImg from '../CharacterImg';
import GameEffects from '../GameEffects';
import { Sounds } from '../../utils/sounds';
import { useGameEnhancements } from '../../utils/useGameEnhancements';
import { unlockAchievement, recordGamePlayed } from '../../utils/achievements';
import './MathGame.css';

const ROUNDS = 10;

const OBJECT_SETS = [
  '🍎','🌸','🎈','🍓','⭐','🍊','🎀','🦋','🍭','🌺',
  '🐣','🍇','💛','🍉','🌻','🎊','🍬','🐠','🎵','🍑',
];

function makeRound(roundIndex) {
  const maxA = Math.min(2 + Math.floor(roundIndex * 0.5), 7);
  const a = 1 + Math.floor(Math.random() * maxA);
  const maxB = Math.min(10 - a, 2 + Math.floor(roundIndex * 0.5));
  const b = 1 + Math.floor(Math.random() * Math.max(1, maxB));
  const answer = a + b;
  const obj = OBJECT_SETS[roundIndex % OBJECT_SETS.length];

  const wrongs = new Set();
  while (wrongs.size < 2) {
    const delta = 1 + Math.floor(Math.random() * 3);
    const sign = Math.random() > 0.5 ? 1 : -1;
    const w = Math.max(2, Math.min(10, answer + sign * delta));
    if (w !== answer) wrongs.add(w);
  }
  return { a, b, answer, obj, choices: [...[answer, ...[...wrongs]]].sort(() => Math.random() - 0.5) };
}

export default function MathGame({ onBack, onAddStars }) {
  const [round, setRound]         = useState(0);
  const [data, setData]           = useState(() => makeRound(0));
  const [chosen, setChosen]       = useState(null);
  const [correct, setCorrect]     = useState(false);
  const [wrong, setWrong]         = useState(false);
  const [score, setScore]         = useState(0);
  const [done, setDone]           = useState(false);
  const [flying, setFlying]       = useState(false);
  const [flyDist, setFlyDist]     = useState({ mickey: 0, minnie: 0 });
  const [collected, setCollected] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const ge           = useGameEnhancements(ROUNDS);
  const autoAdvRef   = useRef(null);
  const stageRef     = useRef(null);
  const mickeyObjs   = useRef(null);
  const minnieObjs   = useRef(null);

  useEffect(() => {
    Sounds.startMusic('math');
    return () => Sounds.stopMusic();
  }, []);

  const advance = useCallback(() => {
    const next = round + 1;
    if (next >= ROUNDS) {
      setDone(true);
      Sounds.win();
      const stats = recordGamePlayed('math');
      if (stats.count >= 10) unlockAchievement('games_10');
      if (stats.uniqueGames.length >= 5) unlockAchievement('all_games');
    } else {
      setRound(next);
      setData(makeRound(next));
      setChosen(null);
      setCorrect(false);
      setWrong(false);
      setFlying(false);
      setFlyDist({ mickey: 0, minnie: 0 });
      setCollected(false);
    }
  }, [round]);

  function doAdvance() {
    if (autoAdvRef.current) { clearTimeout(autoAdvRef.current); autoAdvRef.current = null; }
    ge.clearWaiting();
    advance();
  }

  function handleChoice(n) {
    if (chosen !== null) return;
    Sounds.tap();
    setChosen(n);
    if (n === data.answer) {
      setCorrect(true);
      setScore(s => s + 1);
      onAddStars(1);
      ge.onCorrect({ display: `${data.a} + ${data.b} = ${data.answer}` }, round);

      // Measure exact pixel distances to center before animating
      let dist = { mickey: 0, minnie: 0 };
      if (stageRef.current && mickeyObjs.current && minnieObjs.current) {
        const stageCx = stageRef.current.getBoundingClientRect().left
                      + stageRef.current.getBoundingClientRect().width / 2;
        const mRect = mickeyObjs.current.getBoundingClientRect();
        const nRect = minnieObjs.current.getBoundingClientRect();
        dist = {
          mickey: stageCx - (mRect.left + mRect.width / 2),
          minnie: stageCx - (nRect.left + nRect.width / 2),
        };
      }
      setFlyDist(dist);
      setFlying(true);

      setTimeout(() => {
        setFlying(false);
        setCollected(true);
        Sounds.star?.();
      }, 1400);
      autoAdvRef.current = setTimeout(doAdvance, 2700);
    } else {
      setWrong(true);
      Sounds.wrong();
      ge.onWrong();
      setTimeout(() => { setWrong(false); setChosen(null); }, 900);
    }
  }

  function restart() {
    if (autoAdvRef.current) { clearTimeout(autoAdvRef.current); autoAdvRef.current = null; }
    setRound(0); setData(makeRound(0)); setChosen(null);
    setCorrect(false); setWrong(false); setScore(0); setDone(false);
    setFlying(false); setFlyDist({ mickey: 0, minnie: 0 });
    setCollected(false); setShowReview(false);
    ge.reset();
  }

  useEffect(() => {
    if (done && score === ROUNDS) unlockAchievement('perfect_game');
  }, [done, score]);

  return (
    <GameShell title="חשבון עם מיקי ומיני" emoji="🧺" score={score} maxScore={ROUNDS} onBack={onBack} bgClass="math-bg">
      <GameEffects correct={correct} done={done} character="mickey" />

      {ge.showStreakBonus && <div className="streak-banner">🔥 {ge.streakCount} ברצף! מדהים!</div>}
      {ge.showLevelUp    && <div className="level-up-banner">⬆️ שלב 2! המשיכי כך! 🌟</div>}

      {done ? (
        <div className="done-screen fade-in">
          <div className="done-chars">
            <CharacterImg character="mickey" size={100} className="bounce" />
            <CharacterImg character="minnie" size={100} className="bounce" />
          </div>
          <div className="done-box pop">
            <span className="done-emoji">🧺</span>
            <h2 className="done-title">מצוינת!</h2>
            <p className="done-sub">קיבלת {score} כוכבים מתוך {ROUNDS}!</p>
            {score === ROUNDS && <span className="done-perfect">🌟 משחק מושלם!</span>}
            <div className="done-perf"><span>🔥 רצף מקסימלי: {ge.bestStreak}</span></div>
            {'⭐'.repeat(score)}
            <div className="done-btns">
              <button className="done-btn secondary" onClick={() => setShowReview(r => !r)}>
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
                  <span className="review-question" style={{ direction: 'ltr' }}>{item.display}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${(round / ROUNDS) * 100}%` }} />
          </div>
          <p className="round-label">תרגיל {round + 1} מתוך {ROUNDS}</p>

          <div className="math-stage" ref={stageRef}>

            {/* Mickey — left */}
            <div className="character-side">
              <CharacterImg character="mickey" size={72} className={wrong ? 'wiggle' : ''} />
              <span className="char-number">{data.a}</span>
              <div
                ref={mickeyObjs}
                className={`obj-group${flying ? ' flying' : ''}${collected ? ' hidden' : ''}`}
                style={flying ? { '--fly-x': `${flyDist.mickey}px` } : undefined}
              >
                {Array.from({ length: data.a }).map((_, i) => (
                  <span key={i} className="obj-emoji" style={{ animationDelay: `${i * 60}ms` }}>
                    {data.obj}
                  </span>
                ))}
              </div>
            </div>

            {/* Center — all objects meet here */}
            {collected && (
              <div className="center-burst">
                {Array.from({ length: data.answer }).map((_, i) => (
                  <span key={i} className="obj-emoji center-obj" style={{ animationDelay: `${i * 50}ms` }}>
                    {data.obj}
                  </span>
                ))}
              </div>
            )}

            {/* Minnie — right */}
            <div className="character-side">
              <CharacterImg character="minnie" size={72} className={wrong ? 'wiggle' : ''} />
              <span className="char-number">{data.b}</span>
              <div
                ref={minnieObjs}
                className={`obj-group${flying ? ' flying' : ''}${collected ? ' hidden' : ''}`}
                style={flying ? { '--fly-x': `${flyDist.minnie}px` } : undefined}
              >
                {Array.from({ length: data.b }).map((_, i) => (
                  <span key={i} className="obj-emoji" style={{ animationDelay: `${i * 60}ms` }}>
                    {data.obj}
                  </span>
                ))}
              </div>
            </div>

          </div>

          <p className="instruction">כמה יש להם יחד? 🧺</p>

          <div className={`math-choices${wrong ? ' shake' : ''}`}>
            {data.choices.map(n => {
              const isChosen = chosen === n;
              const isRight  = isChosen && n === data.answer;
              const isWrong  = isChosen && n !== data.answer;
              return (
                <button
                  key={n}
                  className={`math-btn ${isRight ? 'choice-right' : ''} ${isWrong ? 'choice-wrong' : ''}`}
                  onClick={() => handleChoice(n)}
                >
                  {n}
                </button>
              );
            })}
          </div>

          {ge.waitingForNext && correct && (
            <button className="next-btn" onClick={doAdvance}>הבא ←</button>
          )}
        </>
      )}
    </GameShell>
  );
}
