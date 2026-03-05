import { useState, useEffect, useRef } from 'react';
import GameShell from '../GameShell';
import CharacterImg from '../CharacterImg';
import GameEffects from '../GameEffects';
import { WORDS, shuffle } from '../../utils/hebrewData';
import { Sounds } from '../../utils/sounds';
import { useGameEnhancements } from '../../utils/useGameEnhancements';
import { unlockAchievement, recordGamePlayed } from '../../utils/achievements';
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

// FU7: All 8 Gabby characters rotate through
const CHAR_NAMES = ['gabby', 'cakey', 'kittyfairy', 'pandy', 'marty', 'gabby', 'cakey', 'pandy'];

export default function WordGame({ onBack, onAddStars }) {
  const [initRound0] = useState(() => makeRound(new Set()));

  const [round, setRound]         = useState(0);
  const [usedIdx, setUsedIdx]     = useState(new Set());
  const [roundData, setRoundData] = useState(initRound0);
  const [built, setBuilt]         = useState([]);
  const [remaining, setRemaining] = useState(() =>
    initRound0.letters.map((l, i) => ({ l, i, used: false }))
  );
  const [correct, setCorrect]     = useState(false);
  const [wrong, setWrong]         = useState(false);
  const [shake, setShake]         = useState(false);
  const [score, setScore]         = useState(0);
  const [done, setDone]           = useState(false);
  const [showReview, setShowReview] = useState(false);
  const charIdx   = round % CHAR_NAMES.length;
  const ge        = useGameEnhancements(ROUNDS);
  const autoAdvRef = useRef(null);

  useEffect(() => {
    Sounds.startMusic('words');
    return () => Sounds.stopMusic();
  }, []);

  function initRound(rd) {
    setRemaining(rd.letters.map((l, i) => ({ l, i, used: false })));
    setBuilt([]);
    setCorrect(false);
    setWrong(false);
  }

  function doAdvance() {
    if (autoAdvRef.current) { clearTimeout(autoAdvRef.current); autoAdvRef.current = null; }
    ge.clearWaiting();
    const next = round + 1;
    const newUsed = new Set([...usedIdx, roundData.originalIdx]);
    if (next >= ROUNDS) {
      setDone(true);
      Sounds.win();
      const stats = recordGamePlayed('words');
      if (stats.count >= 10) unlockAchievement('games_10');
      if (stats.uniqueGames.length >= 5) unlockAchievement('all_games');
    } else {
      const rd = makeRound(newUsed);
      setRound(next);
      setUsedIdx(newUsed);
      setRoundData(rd);
      initRound(rd);
    }
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
        setCorrect(true);
        setScore(s => s + 1);
        onAddStars(1);
        Sounds.win();
        ge.onCorrect({ display: `${roundData.item.emoji} ${roundData.item.word}` }, round);
        autoAdvRef.current = setTimeout(doAdvance, 2500);
      } else {
        setWrong(true);
        setShake(true);
        Sounds.wrong();
        ge.onWrong();
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
    if (autoAdvRef.current) { clearTimeout(autoAdvRef.current); autoAdvRef.current = null; }
    const rd = makeRound(new Set());
    setRound(0); setUsedIdx(new Set()); setRoundData(rd);
    setScore(0); setDone(false); setShowReview(false);
    initRound(rd);
    ge.reset();
  }

  useEffect(() => {
    if (done && score === ROUNDS) unlockAchievement('perfect_game');
  }, [done, score]);

  return (
    <GameShell title="מילות קסם" emoji="✨" score={score} maxScore={ROUNDS} onBack={onBack} bgClass="word-bg">
      <GameEffects correct={correct} done={done} character={CHAR_NAMES[charIdx]} />

      {ge.showStreakBonus && (
        <div className="streak-banner">🔥 {ge.streakCount} ברצף! מדהים!</div>
      )}
      {ge.showLevelUp && (
        <div className="level-up-banner">⬆️ שלב 2! המשיכי כך! 🌟</div>
      )}

      {done ? (
        <div className="done-screen fade-in">
          <div style={{ display:'flex', gap:'8px', justifyContent:'center', alignItems:'flex-end' }}>
            <CharacterImg character="cakey"  size={64} className="celebrate" />
            <CharacterImg character="gabby"  size={110} className="celebrate" />
            <CharacterImg character="pandy"  size={64} className="celebrate" />
          </div>
          <div className="done-box pop">
            <span className="done-emoji">✨</span>
            <h2 className="done-title">קסום!</h2>
            <p className="done-sub">קיבלת {score} כוכבים מתוך {ROUNDS}!</p>
            {score === ROUNDS && <span className="done-perfect">🌟 משחק מושלם!</span>}
            <div className="done-perf">
              <span>🔥 רצף מקסימלי: {ge.bestStreak}</span>
            </div>
            {'⭐'.repeat(score)}
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
        <>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${(round / ROUNDS) * 100}%` }} />
          </div>
          <p className="round-label">מילה {round + 1} מתוך {ROUNDS}</p>

          <div className="word-stage">
            <div className={`word-char-wrap ${correct ? 'celebrate' : ''}`}>
              <CharacterImg character={CHAR_NAMES[charIdx]} size={90} />
              {correct && <div className="speech-bubble">כן! מצוין! 🌟</div>}
            </div>
            <div className="word-hint-box">
              <span className="word-emoji">{roundData.item.emoji}</span>
              <span className="word-hint">{roundData.item.hint}</span>
            </div>
          </div>

          <div className={`built-slots ${shake ? 'wiggle' : ''} ${correct ? 'correct-stage' : ''}`}>
            {roundData.item.word.split('').map((_, i) => (
              <div key={i} className={`slot ${built[i] ? 'slot-filled' : ''} ${correct ? 'slot-correct' : ''}`}>
                {built[i] ? built[i].l : ''}
              </div>
            ))}
          </div>

          <p className="instruction">בני את המילה! לחצי על האותיות 👇</p>

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

          {built.length > 0 && !correct && (
            <button className="undo-btn" onClick={handleUndo}>
              ← מחק אות
            </button>
          )}

          {/* FU9: Next button */}
          {ge.waitingForNext && correct && (
            <button className="next-btn" onClick={doAdvance}>הבאה ←</button>
          )}
        </>
      )}
    </GameShell>
  );
}
