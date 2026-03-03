import { useState, useCallback } from 'react';
import GameShell from '../GameShell';
import Elsa from '../characters/Elsa';
import Anna from '../characters/Anna';
import Teletubby from '../characters/Teletubby';
import { WORDS, shuffle } from '../../utils/hebrewData';
import { Sounds } from '../../utils/sounds';
import './WordGame.css';

const ROUNDS = 8;

function makeRound(usedIndices) {
  const available = WORDS.filter((_, i) => !usedIndices.has(i));
  const pool = available.length > 0 ? available : WORDS;
  const idx = Math.floor(Math.random() * pool.length);
  const item = pool[idx];
  const letters = shuffle(item.word.split(''));
  return { item, letters, originalIdx: WORDS.indexOf(item) };
}

const CHARS = [
  <Elsa key="e" size={70} />,
  <Anna key="a" size={70} />,
  <Teletubby key="t" color="yellow" size={70} />,
];

export default function WordGame({ onBack, onAddStars }) {
  const [initRound0] = useState(() => makeRound(new Set()));

  const [round, setRound]         = useState(0);
  const [usedIdx, setUsedIdx]     = useState(new Set());
  const [roundData, setRoundData] = useState(initRound0);
  const [built, setBuilt]         = useState([]);       // letters tapped so far
  const [remaining, setRemaining] = useState(() =>
    initRound0.letters.map((l, i) => ({ l, i, used: false }))
  );
  const [correct, setCorrect]     = useState(false);
  const [wrong, setWrong]         = useState(false);
  const [shake, setShake]         = useState(false);
  const [score, setScore]         = useState(0);
  const [done, setDone]           = useState(false);
  const charIdx = round % CHARS.length;

  // init remaining from roundData
  function initRound(rd) {
    setRemaining(rd.letters.map((l, i) => ({ l, i, used: false })));
    setBuilt([]);
    setCorrect(false);
    setWrong(false);
  }

  function handleLetterTap(tileIdx) {
    if (correct) return;
    const tile = remaining[tileIdx];
    if (tile.used) return;
    Sounds.tap();
    const newBuilt = [...built, { ...tile, tileIdx }];
    const newRemaining = remaining.map((t, i) => i === tileIdx ? { ...t, used: true } : t);
    setBuilt(newBuilt);
    setRemaining(newRemaining);

    const attempt = newBuilt.map(t => t.l).join('');
    const target  = roundData.item.word;

    if (attempt.length === target.length) {
      if (attempt === target) {
        // Correct!
        setCorrect(true);
        setScore(s => s + 1);
        onAddStars(1);
        Sounds.win();
        setTimeout(() => {
          const next = round + 1;
          const newUsed = new Set([...usedIdx, roundData.originalIdx]);
          if (next >= ROUNDS) { setDone(true); }
          else {
            const rd = makeRound(newUsed);
            setRound(next);
            setUsedIdx(newUsed);
            setRoundData(rd);
            initRound(rd);
          }
        }, 1800);
      } else {
        // Wrong full word
        setWrong(true);
        setShake(true);
        Sounds.wrong();
        setTimeout(() => {
          setShake(false);
          setWrong(false);
          initRound(roundData);
        }, 900);
      }
    }
  }

  function handleUndo() {
    if (built.length === 0 || correct) return;
    Sounds.tap();
    const last = built[built.length - 1];
    setBuilt(b => b.slice(0, -1));
    setRemaining(r => r.map((t, i) => i === last.tileIdx ? { ...t, used: false } : t));
  }

  function restart() {
    const rd = makeRound(new Set());
    setRound(0); setUsedIdx(new Set()); setRoundData(rd);
    setScore(0); setDone(false); initRound(rd);
  }

  return (
    <GameShell title="מילות קסם" emoji="✨" score={score} maxScore={ROUNDS} onBack={onBack} bgClass="word-bg">
      {done ? (
        <div className="done-screen fade-in">
          <div style={{ display:'flex', gap:'8px', justifyContent:'center' }}>
            <Elsa size={80} animate /><Anna size={80} animate />
          </div>
          <div className="done-box pop">
            <span className="done-emoji">✨</span>
            <h2 className="done-title">קסום!</h2>
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
          <p className="round-label">מילה {round + 1} מתוך {ROUNDS}</p>

          <div className="word-stage">
            <div className={`word-char-wrap ${correct ? 'celebrate' : ''}`}>
              {CHARS[charIdx]}
              {correct && <div className="speech-bubble">כן! מצוין! 🌟</div>}
            </div>
            <div className="word-hint-box">
              <span className="word-emoji">{roundData.item.emoji}</span>
              <span className="word-hint">{roundData.item.hint}</span>
            </div>
          </div>

          {/* Built word slots */}
          <div className={`built-slots ${shake ? 'wiggle' : ''} ${correct ? 'correct-stage' : ''}`}>
            {roundData.item.word.split('').map((_, i) => (
              <div key={i} className={`slot ${built[i] ? 'slot-filled' : ''} ${correct ? 'slot-correct' : ''}`}>
                {built[i] ? built[i].l : ''}
              </div>
            ))}
          </div>

          <p className="instruction">בני את המילה! לחצי על האותיות 👇</p>

          {/* Letter tiles */}
          <div className="letter-tiles">
            {remaining.map((tile, idx) => (
              <button
                key={`${tile.l}-${tile.i}`}
                className={`letter-tile ${tile.used ? 'tile-used' : ''}`}
                onClick={() => handleLetterTap(idx)}
                disabled={tile.used}
              >
                {tile.l}
              </button>
            ))}
          </div>

          {/* Undo button */}
          {built.length > 0 && !correct && (
            <button className="undo-btn" onClick={handleUndo}>
              ← מחק אות
            </button>
          )}
        </>
      )}
    </GameShell>
  );
}
