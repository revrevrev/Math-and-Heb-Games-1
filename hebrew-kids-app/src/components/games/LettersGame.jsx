import { useState, useEffect, useCallback } from 'react';
import GameShell from '../GameShell';
import Elsa from '../characters/Elsa';
import { ALEF_BET, shuffle, pickRandom } from '../../utils/hebrewData';
import { Sounds } from '../../utils/sounds';
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
  const [round, setRound]         = useState(0);
  const [roundData, setRoundData] = useState(() => makeRound());
  const [chosen, setChosen]       = useState(null);
  const [correct, setCorrect]     = useState(false);
  const [wrong, setWrong]         = useState(false);
  const [showSnow, setShowSnow]   = useState(false);
  const [score, setScore]         = useState(0);
  const [done, setDone]           = useState(false);
  const [elsaAnim, setElsaAnim]   = useState('');

  const advance = useCallback(() => {
    if (round + 1 >= ROUNDS) {
      setDone(true);
      Sounds.win();
    } else {
      setRound(r => r + 1);
      setRoundData(makeRound());
      setChosen(null);
      setCorrect(false);
      setWrong(false);
      setShowSnow(false);
    }
  }, [round]);

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
      setTimeout(() => {
        setElsaAnim('');
        advance();
      }, 1600);
    } else {
      setWrong(true);
      setElsaAnim('wiggle');
      Sounds.wrong();
      setTimeout(() => {
        setWrong(false);
        setChosen(null);
        setElsaAnim('');
      }, 900);
    }
  }

  function restart() {
    setRound(0);
    setRoundData(makeRound());
    setChosen(null);
    setCorrect(false);
    setWrong(false);
    setShowSnow(false);
    setScore(0);
    setDone(false);
  }

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

      {done ? (
        <div className="done-screen fade-in">
          <Elsa size={130} animate />
          <div className="done-box pop">
            <span className="done-emoji">🎉</span>
            <h2 className="done-title">כל הכבוד!</h2>
            <p className="done-sub">קיבלת {score} כוכבים מתוך {ROUNDS}!</p>
            {'⭐'.repeat(score)}
            <div className="done-btns">
              <button className="done-btn primary" onClick={restart}>שחק שוב 🔄</button>
              <button className="done-btn secondary" onClick={onBack}>חזרה 🏠</button>
            </div>
          </div>
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
              <Elsa size={100} animate={correct} />
            </div>
            <div className="big-letter-card">
              <span className="big-letter">{correctItem.letter}</span>
              <span className="letter-name">{correctItem.name}</span>
            </div>
          </div>

          {/* Instruction */}
          <p className="instruction">מצאי את האות! 👇</p>

          {/* Choices */}
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

          {/* Feedback */}
          {correct && (
            <div className="feedback correct-fb pop">
              <span className="fb-emoji">{correctItem.emoji}</span>
              <span className="fb-text">מצוין! 🌟 {correctItem.word}</span>
            </div>
          )}
        </>
      )}
    </GameShell>
  );
}
