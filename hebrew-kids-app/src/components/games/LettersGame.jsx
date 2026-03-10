import { useState, useEffect, useCallback, useRef } from 'react';
import GameShell from '../GameShell';
import CharacterImg from '../CharacterImg';
import GameEffects from '../GameEffects';
import { ALEF_BET, shuffle } from '../../utils/hebrewData';
import { Sounds } from '../../utils/sounds';
import { useGameEnhancements } from '../../utils/useGameEnhancements';
import { unlockAchievement, recordGamePlayed } from '../../utils/achievements';
import './LettersGame.css';

const ROUNDS = 10;

function makeRound() {
  const pool = shuffle(ALEF_BET);
  const correct = pool[0];
  const choices = shuffle([correct, pool[1], pool[2], pool[3]]);
  return { correct, choices };
}

function Snowflakes({ active }) {
  if (!active) return null;
  return (
    <div aria-hidden>
      {Array.from({ length: 14 }).map((_, i) => (
        <span key={i} className="snowflake-piece" style={{
          left:  `${5 + Math.random() * 90}%`,
          animationDuration: `${1.4 + Math.random() * 1.6}s`,
          animationDelay:    `${Math.random() * 0.5}s`,
          fontSize:          `${12 + Math.random() * 20}px`,
          opacity:           0.7 + Math.random() * 0.3,
        }}>❄️</span>
      ))}
    </div>
  );
}

export default function LettersGame({ onBack, onAddStars }) {
  const [round, setRound]           = useState(0);
  const [roundData, setRoundData]   = useState(() => makeRound());
  const [chosen, setChosen]         = useState(null);
  const [correct, setCorrect]       = useState(false);
  const [wrong, setWrong]           = useState(false);
  const [showSnow, setShowSnow]     = useState(false);
  const [score, setScore]           = useState(0);
  const [done, setDone]             = useState(false);
  const [elsaAnim, setElsaAnim]     = useState('');
  const [showReview, setShowReview] = useState(false);
  const ge        = useGameEnhancements(ROUNDS);
  const autoAdvRef = useRef(null);

  // Background music (FU13)
  useEffect(() => {
    Sounds.startMusic('letters');
    return () => Sounds.stopMusic();
  }, []);

  const advance = useCallback(() => {
    if (round + 1 >= ROUNDS) {
      setDone(true);
      Sounds.win();
      const stats = recordGamePlayed('letters');
      if (stats.count >= 10) unlockAchievement('games_10');
      if (stats.uniqueGames.length >= 5) unlockAchievement('all_games');
    } else {
      setRound(r => r + 1);
      setRoundData(makeRound());
      setChosen(null);
      setCorrect(false);
      setWrong(false);
      setShowSnow(false);
    }
  }, [round]);

  // FU9: explicit next button + auto-advance after 2.5s
  function doAdvance() {
    if (autoAdvRef.current) { clearTimeout(autoAdvRef.current); autoAdvRef.current = null; }
    ge.clearWaiting();
    setElsaAnim('');
    advance();
  }

  function handleChoice(letter) {
    if (chosen) return;
    Sounds.tap();
    setChosen(letter);
    if (letter === roundData.correct.letter) {
      setCorrect(true);
      setShowSnow(true);
      setElsaAnim('celebrate');
      setScore(s => s + 1);
      onAddStars(1);
      Sounds.correct();
      ge.onCorrect({ display: `${roundData.correct.letter} — ${roundData.correct.name}` }, round);
      autoAdvRef.current = setTimeout(doAdvance, 2500);
    } else {
      setWrong(true);
      setElsaAnim('wiggle');
      Sounds.wrong();
      ge.onWrong();
      setTimeout(() => {
        setWrong(false);
        setChosen(null);
        setElsaAnim('');
      }, 900);
    }
  }

  function restart() {
    if (autoAdvRef.current) { clearTimeout(autoAdvRef.current); autoAdvRef.current = null; }
    setRound(0); setRoundData(makeRound()); setChosen(null);
    setCorrect(false); setWrong(false); setShowSnow(false);
    setScore(0); setDone(false); setShowReview(false);
    ge.reset();
  }

  // FU20/perfect_game achievement
  useEffect(() => {
    if (done && score === ROUNDS) unlockAchievement('perfect_game');
  }, [done, score]);

  const { correct: correctItem, choices } = roundData;

  return (
    <GameShell
      title="אותיות עם אלזה"
      emoji="❄️"
      score={score}
      maxScore={ROUNDS}
      onBack={onBack}
      bgClass="letters-bg"
    >
      <Snowflakes active={showSnow} />
      <GameEffects correct={correct} done={done} character="elsa" />

      {/* FU18: Streak bonus banner */}
      {ge.showStreakBonus && (
        <div className="streak-banner">🔥 {ge.streakCount} ברצף! מדהים!</div>
      )}
      {/* FU19: Level-up banner */}
      {ge.showLevelUp && (
        <div className="level-up-banner">⬆️ שלב 2! המשיכי כך! 🌟</div>
      )}

      {done ? (
        /* FU17/FU20: Enhanced "Round Complete" done screen */
        <div className="done-screen fade-in">
          <CharacterImg character="elsa" size={130} />
          <div className="done-box pop">
            <span className="done-emoji">🎉</span>
            <h2 className="done-title">כל הכבוד!</h2>
            <p className="done-sub">קיבלת {score} כוכבים מתוך {ROUNDS}!</p>
            {score === ROUNDS && <span className="done-perfect">🌟 משחק מושלם!</span>}
            <div className="done-perf">
              <span>🔥 רצף מקסימלי: {ge.bestStreak}</span>
            </div>
            {'⭐'.repeat(score)}
            <div className="done-btns">
              {/* FU24: Review answers */}
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
        <>
          {/* Progress */}
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${(round / ROUNDS) * 100}%` }} />
          </div>
          <p className="round-label">שאלה {round + 1} מתוך {ROUNDS}</p>

          {/* Character + letter display */}
          <div className={`letter-stage ${correct ? 'correct-stage' : ''} ${wrong ? 'wrong-stage' : ''}`}>
            <div className={`elsa-wrap ${elsaAnim}`}>
              <CharacterImg character="elsa" size={100} />
            </div>
            <div className="big-letter-card">
              <span className="big-letter">{correctItem.letter}</span>
              <span className="letter-name">{correctItem.name}</span>
            </div>
          </div>

          <p className="instruction">מצאי את האות! 👇</p>

          <div className="choices-grid">
            {choices.map((item) => {
              const isChosen = chosen === item.letter;
              const isRight  = isChosen && item.letter === correctItem.letter;
              const isWrong  = isChosen && item.letter !== correctItem.letter;
              return (
                <button
                  key={item.letter}
                  className={`choice-btn ${isRight ? 'choice-right' : ''} ${isWrong ? 'choice-wrong' : ''}`}
                  onClick={() => handleChoice(item.letter)}
                >
                  {item.letter}
                </button>
              );
            })}
          </div>

          {/* FU15: Text feedback */}
          {correct && (
            <div className="feedback correct-fb pop">
              <span className="fb-emoji">{correctItem.emoji}</span>
              <span className="fb-text">מצוין! 🌟</span>
            </div>
          )}

          {/* FU9: Next button */}
          {ge.waitingForNext && correct && (
            <button className="next-btn" onClick={doAdvance}>הבא ←</button>
          )}
        </>
      )}
    </GameShell>
  );
}
