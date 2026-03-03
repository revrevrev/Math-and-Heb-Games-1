import { useState, useCallback } from 'react';
import GameShell from '../GameShell';
import Anna from '../characters/Anna';
import { Sounds } from '../../utils/sounds';
import './MathGame.css';

const ROUNDS = 10;

function makeRound(roundIndex) {
  // Gradually increase difficulty
  const maxN = Math.min(3 + Math.floor(roundIndex * 0.8), 9);
  const isAdd = Math.random() > 0.35;
  let a, b, answer;
  if (isAdd) {
    a = 1 + Math.floor(Math.random() * maxN);
    b = 1 + Math.floor(Math.random() * (maxN - a + 1));
    answer = a + b;
  } else {
    answer = 1 + Math.floor(Math.random() * maxN);
    b      = 1 + Math.floor(Math.random() * answer);
    a      = answer + b;
  }
  const op    = isAdd ? '+' : '-';
  const wrongs = new Set();
  while (wrongs.size < 2) {
    const w = Math.max(0, Math.min(18, answer + (Math.random() > 0.5 ? 1 : -1) * (1 + Math.floor(Math.random() * 3))));
    if (w !== answer) wrongs.add(w);
  }
  return { a, b, op, answer, choices: shuffle3([answer, ...[...wrongs]]) };
}

function shuffle3(arr) {
  return arr.sort(() => Math.random() - 0.5);
}

// Visual fruit dots for small numbers
function Dots({ n, emoji }) {
  if (n > 10) return <span className="math-num-big">{n}</span>;
  return (
    <span className="dots-row">
      {Array.from({ length: n }).map((_, i) => (
        <span key={i} className="math-dot">{emoji}</span>
      ))}
    </span>
  );
}

const DOT_EMOJIS = ['🍎','🌸','⭐','🍓','🐣','🍊','🎈','💜','🍭','🐠'];

export default function MathGame({ onBack, onAddStars }) {
  const [round, setRound]     = useState(0);
  const [data, setData]       = useState(() => makeRound(0));
  const [emoji] = useState(() => DOT_EMOJIS[Math.floor(Math.random() * DOT_EMOJIS.length)]);
  const [chosen, setChosen]   = useState(null);
  const [correct, setCorrect] = useState(false);
  const [wrong, setWrong]     = useState(false);
  const [score, setScore]     = useState(0);
  const [done, setDone]       = useState(false);
  const [annaAnim, setAnnaAnim] = useState('');

  const advance = useCallback(() => {
    const next = round + 1;
    if (next >= ROUNDS) { setDone(true); Sounds.win(); }
    else {
      setRound(next);
      setData(makeRound(next));
      setChosen(null);
      setCorrect(false);
      setWrong(false);
    }
  }, [round]);

  function handleChoice(n) {
    if (chosen !== null) return;
    Sounds.tap();
    setChosen(n);
    if (n === data.answer) {
      setCorrect(true);
      setAnnaAnim('celebrate');
      setScore(s => s + 1);
      onAddStars(1);
      Sounds.correct();
      setTimeout(() => { setAnnaAnim(''); advance(); }, 1600);
    } else {
      setWrong(true);
      setAnnaAnim('wiggle');
      Sounds.wrong();
      setTimeout(() => { setWrong(false); setChosen(null); setAnnaAnim(''); }, 900);
    }
  }

  function restart() {
    setRound(0); setData(makeRound(0)); setChosen(null);
    setCorrect(false); setWrong(false); setScore(0); setDone(false);
  }

  return (
    <GameShell title="חשבון עם אנה" emoji="🎯" score={score} maxScore={ROUNDS} onBack={onBack} bgClass="math-bg">
      {done ? (
        <div className="done-screen fade-in">
          <Anna size={130} animate />
          <div className="done-box pop">
            <span className="done-emoji">🎯</span>
            <h2 className="done-title">מצוינת!</h2>
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
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${(round / ROUNDS) * 100}%` }} />
          </div>
          <p className="round-label">שאלה {round + 1} מתוך {ROUNDS}</p>

          <div className="math-stage">
            <div className={`anna-wrap ${annaAnim}`}>
              <Anna size={85} animate={correct} />
              {correct && <div className="speech-bubble">נכון! יופי! 🌟</div>}
              {wrong   && <div className="speech-bubble wrong-speech">נסי שוב 💪</div>}
            </div>

            <div className={`equation-box ${correct ? 'correct-stage' : ''} ${wrong ? 'wrong-stage' : ''}`}>
              <div className="eq-visual">
                <Dots n={data.a} emoji={emoji} />
                <span className="eq-op">{data.op}</span>
                <Dots n={data.b} emoji={emoji} />
                <span className="eq-eq">=</span>
                <span className="eq-unknown">?</span>
              </div>
              <div className="eq-text">
                {data.a} {data.op} {data.b} = ?
              </div>
            </div>
          </div>

          <p className="instruction">מה התשובה? 👇</p>

          <div className="math-choices">
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
        </>
      )}
    </GameShell>
  );
}
