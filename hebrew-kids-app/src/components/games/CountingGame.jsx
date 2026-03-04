import { useState, useCallback } from 'react';
import GameShell from '../GameShell';
import CharacterImg from '../CharacterImg';
import GameEffects from '../GameEffects';
import { COUNT_ITEMS, shuffle } from '../../utils/hebrewData';
import { Sounds } from '../../utils/sounds';
import './CountingGame.css';

const ROUNDS = 10;
const MAX_COUNT = 10;

function makeRound(roundIndex) {
  const maxN = Math.min(3 + Math.floor(roundIndex / 2), MAX_COUNT);
  const n = 1 + Math.floor(Math.random() * maxN);
  const item = COUNT_ITEMS[Math.floor(Math.random() * COUNT_ITEMS.length)];
  // Wrong choices: n-1 or n+1, n+2, but always valid 1..MAX_COUNT
  const wrongs = new Set();
  while (wrongs.size < 2) {
    const w = Math.max(1, Math.min(MAX_COUNT, n + (Math.random() > 0.5 ? 1 : -1) * (1 + Math.floor(Math.random() * 3))));
    if (w !== n) wrongs.add(w);
  }
  const choices = shuffle([n, ...[...wrongs]]);
  return { n, item, choices };
}

export default function CountingGame({ onBack, onAddStars }) {
  const [round, setRound]     = useState(0);
  const [data, setData]       = useState(() => makeRound(0));
  const [chosen, setChosen]   = useState(null);
  const [correct, setCorrect] = useState(false);
  const [wrong, setWrong]     = useState(false);
  const [score, setScore]     = useState(0);
  const [done, setDone]       = useState(false);
  const [blueyAnim, setBlueyAnim] = useState('');

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
    if (n === data.n) {
      setCorrect(true);
      setBlueyAnim('celebrate');
      setScore(s => s + 1);
      onAddStars(1);
      Sounds.correct();
      setTimeout(() => { setBlueyAnim(''); advance(); }, 1500);
    } else {
      setWrong(true);
      setBlueyAnim('wiggle');
      Sounds.wrong();
      setTimeout(() => { setWrong(false); setChosen(null); setBlueyAnim(''); }, 900);
    }
  }

  function restart() {
    setRound(0); setData(makeRound(0)); setChosen(null);
    setCorrect(false); setWrong(false); setScore(0); setDone(false);
  }

  return (
    <GameShell title="ספירה עם בלוי" emoji="🐾" score={score} maxScore={ROUNDS} onBack={onBack} bgClass="counting-bg">
      <GameEffects correct={correct} done={done} character="bluey" />
      {done ? (
        <div className="done-screen fade-in">
          <CharacterImg character="bluey" size={130} />
          <div className="done-box pop">
            <span className="done-emoji">🐾</span>
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
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${(round / ROUNDS) * 100}%` }} />
          </div>
          <p className="round-label">שאלה {round + 1} מתוך {ROUNDS}</p>

          <div className={`count-stage ${correct ? 'correct-stage' : ''} ${wrong ? 'wrong-stage' : ''}`}>
            <div className={`bluey-wrap ${blueyAnim}`}>
              <CharacterImg character="bluey" size={90} />
              {correct && <div className="speech-bubble">כן! נכון מאוד! 🎉</div>}
              {wrong && <div className="speech-bubble wrong-speech">נסי שוב! 💪</div>}
            </div>
            <div className="count-objects">
              {Array.from({ length: data.n }).map((_, i) => (
                <span
                  key={i}
                  className="count-obj"
                  style={{ animationDelay: `${i * 0.07}s` }}
                >
                  {data.item.emoji}
                </span>
              ))}
            </div>
          </div>

          <p className="instruction">כמה {data.item.name} יש? 👇</p>

          <div className="number-choices">
            {data.choices.map(n => {
              const isChosen = chosen === n;
              const isRight  = isChosen && n === data.n;
              const isWrong  = isChosen && n !== data.n;
              return (
                <button
                  key={n}
                  className={`num-btn ${isRight ? 'choice-right' : ''} ${isWrong ? 'choice-wrong' : ''}`}
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
