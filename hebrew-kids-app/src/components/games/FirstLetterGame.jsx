import { useState, useEffect, useRef } from 'react';
import GameShell from '../GameShell';
import CharacterImg from '../CharacterImg';
import GameEffects from '../GameEffects';
import { ALEF_BET, WORDS, shuffle } from '../../utils/hebrewData';
import { Sounds } from '../../utils/sounds';
import { unlockAchievement, recordGamePlayed } from '../../utils/achievements';
import './FirstLetterGame.css';

const ROUNDS      = 3;
const PAIRS       = 5;
const TOTAL_STARS = ROUNDS * PAIRS;

// Letter name lookup: { 'א': 'אלף', 'ב': 'בית', ... }
const LETTER_NAMES = Object.fromEntries(ALEF_BET.map(a => [a.letter, a.name]));

// Short words only (< 5 letters) — longer words reserved for harder levels
const SHORT_WORDS = WORDS.filter(w => w.word.length < 5);

// Pick PAIRS words whose first letters are all new (not in usedLetters)
function makeBoard(usedLetters) {
  const shuffled = shuffle(SHORT_WORDS);
  const seen = new Set(usedLetters); // blocks already-used letters
  const pool = [];
  for (const w of shuffled) {
    const letter = w.word[0];
    if (!seen.has(letter) && LETTER_NAMES[letter]) {
      seen.add(letter);
      pool.push({ word: w.word, emoji: w.emoji, letter, name: LETTER_NAMES[letter] });
      if (pool.length === PAIRS) break;
    }
  }
  const letterOrder = shuffle([0, 1, 2, 3, 4]);
  const wordOrder   = shuffle([0, 1, 2, 3, 4]);
  return { pairs: pool, letterOrder, wordOrder };
}

export default function FirstLetterGame({ onBack, onAddStars }) {
  // Creates a board and marks its letters as used for this session
  function freshBoard() {
    const b = makeBoard(usedLettersRef.current);
    b.pairs.forEach(p => usedLettersRef.current.add(p.letter));
    return b;
  }

  // Declare refs first — needed by freshBoard() which is used in useState initializers
  const dragOffsetRef   = useRef({ x: 0, y: 0 });
  const zoneRefs        = useRef([]);
  const roundRef        = useRef(0);
  const usedLettersRef  = useRef(new Set());

  const [round, setRound]             = useState(0);
  const [board, setBoard]             = useState(() => {
    usedLettersRef.current = new Set();
    return freshBoard();
  });
  const [matched, setMatched]         = useState(new Set());  // pairIdxs fully done
  const [matchedList, setMatchedList] = useState([]);         // ordered, for bottom strip
  const [score, setScore]             = useState(0);
  const [done, setDone]               = useState(false);
  const [charAnim, setCharAnim]       = useState('');

  // Drag state
  const [draggedPair, setDraggedPair] = useState(null);
  const [dragPos, setDragPos]         = useState({ x: 0, y: 0 });
  const [cardSize, setCardSize]       = useState({ w: 0, h: 0 });
  const [wrongWord, setWrongWord]     = useState(null);
  const [wrongZone, setWrongZone]     = useState(null);

  useEffect(() => { roundRef.current = round; }, [round]);

  useEffect(() => {
    Sounds.startMusic('firstletter');
    return () => Sounds.stopMusic();
  }, []);

  // All PAIRS matched → celebrate then advance
  useEffect(() => {
    if (matched.size !== PAIRS) return;
    setCharAnim('celebrate');
    Sounds.win();
    const t = setTimeout(() => {
      const r = roundRef.current;
      if (r + 1 >= ROUNDS) {
        setDone(true);
        const stats = recordGamePlayed('firstletter');
        if (stats.count >= 10)             unlockAchievement('games_10');
        if (stats.uniqueGames.length >= 5) unlockAchievement('all_games');
      } else {
        setRound(r + 1);
        setBoard(freshBoard());
        setMatched(new Set());
        setMatchedList([]);
        setCharAnim('');
      }
    }, 1600);
    return () => clearTimeout(t);
  }, [matched]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (done && score === TOTAL_STARS) unlockAchievement('perfect_game');
  }, [done, score]);

  // ── Pointer handlers ──────────────────────────────────
  function handlePointerDown(e, pairIdx) {
    if (matched.has(pairIdx) || matched.size === PAIRS) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const rect = e.currentTarget.getBoundingClientRect();
    dragOffsetRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    setCardSize({ w: rect.width, h: rect.height });
    setDragPos({ x: rect.left, y: rect.top });
    setDraggedPair(pairIdx);
    Sounds.tap();
  }

  function handlePointerMove(e) {
    if (draggedPair === null) return;
    setDragPos({
      x: e.clientX - dragOffsetRef.current.x,
      y: e.clientY - dragOffsetRef.current.y,
    });
  }

  function handlePointerUp(e) {
    if (draggedPair === null) return;
    const droppedPairIdx = draggedPair;
    setDraggedPair(null);

    const x = e.clientX, y = e.clientY;
    let hitDisplayIdx = -1;
    for (let i = 0; i < zoneRefs.current.length; i++) {
      const el = zoneRefs.current[i];
      if (!el) continue;
      const r = el.getBoundingClientRect();
      if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) {
        hitDisplayIdx = i;
        break;
      }
    }

    if (hitDisplayIdx < 0) return;

    const letterPairIdx = board.letterOrder[hitDisplayIdx];

    if (letterPairIdx === droppedPairIdx) {
      onAddStars(1);
      setScore(s => s + 1);
      Sounds.correct();
      setCharAnim('celebrate');
      setTimeout(() => setCharAnim(''), 600);
      // Brief delay so user sees the highlight before card moves to strip
      setTimeout(() => {
        setMatched(prev => new Set([...prev, droppedPairIdx]));
        setMatchedList(prev => [...prev, droppedPairIdx]);
      }, 300);
    } else {
      Sounds.wrong();
      setWrongWord(droppedPairIdx);
      setWrongZone(hitDisplayIdx);
      setTimeout(() => { setWrongWord(null); setWrongZone(null); }, 600);
    }
  }

  function restart() {
    usedLettersRef.current = new Set();
    setRound(0); setBoard(freshBoard()); setMatched(new Set()); setMatchedList([]);
    setScore(0); setDone(false); setCharAnim('');
    setDraggedPair(null); setWrongWord(null); setWrongZone(null);
  }

  const { pairs, letterOrder, wordOrder } = board;
  const progress = ((round * PAIRS + matched.size) / TOTAL_STARS) * 100;

  return (
    <GameShell
      title="מילים ואותיות עם זוהר"
      emoji="🌟"
      score={score}
      maxScore={TOTAL_STARS}
      onBack={onBack}
      bgClass="firstletter-bg"
    >
      <GameEffects correct={matched.size === PAIRS && !done} done={done} character="zohar" />

      {done ? (
        <div className="done-screen fade-in">
          <CharacterImg character="zohar" size={130} />
          <div className="done-box pop">
            <span className="done-emoji">🎉</span>
            <h2 className="done-title">כל הכבוד!</h2>
            <p className="done-sub">קיבלת {score} כוכבים מתוך {TOTAL_STARS}!</p>
            {score === TOTAL_STARS && <span className="done-perfect">🌟 משחק מושלם!</span>}
            {'⭐'.repeat(Math.min(score, 15))}
            <div className="done-btns">
              <button className="done-btn primary"   onClick={restart}>שחק שוב 🔄</button>
              <button className="done-btn secondary" onClick={onBack}>🏠 בית</button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <p className="round-label">סיבוב {round + 1}/{ROUNDS} — {matched.size}/{PAIRS} זוגות</p>

          <div className={`fl-char-wrap ${charAnim}`}>
            <CharacterImg character="zohar" size={72} />
          </div>

          <p className="instruction">מישכי את המילה לאות הראשונה שלה! 👇</p>

          {/* ── Matching board — single grid, explicit column placement ── */}
          <div className="fl-board">

            {/* RIGHT column (gridColumn:1 in RTL) — draggable word cards */}
            {wordOrder.map((pairIdx, rowIdx) => {
              const isMatched  = matched.has(pairIdx);
              const isDragging = draggedPair === pairIdx;
              const isWrong    = wrongWord === pairIdx;
              return (
                <div
                  key={`w-${pairIdx}`}
                  className={`fl-word-card${isMatched ? ' fl-word-matched' : ''}${isDragging ? ' fl-word-dragging' : ''}${isWrong ? ' fl-word-wrong' : ''}`}
                  style={{
                    gridColumn: 1,
                    gridRow: rowIdx + 1,
                    touchAction: 'none',
                    userSelect: 'none',
                    cursor: isMatched ? 'default' : isDragging ? 'grabbing' : 'grab',
                  }}
                  onPointerDown={e => handlePointerDown(e, pairIdx)}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                >
                  <span className="fl-word-emoji">{pairs[pairIdx].emoji}</span>
                  <span className="fl-word-text">{pairs[pairIdx].word}</span>
                </div>
              );
            })}

            {/* LEFT column (gridColumn:2 in RTL) — letter drop zones */}
            {letterOrder.map((pairIdx, rowIdx) => {
              const isMatched = matched.has(pairIdx);
              const isWrong   = wrongZone === rowIdx;
              return (
                <div
                  key={`l-${pairIdx}`}
                  ref={el => { zoneRefs.current[rowIdx] = el; }}
                  className={`fl-zone${isMatched ? ' fl-zone-matched' : ''}${isWrong ? ' fl-zone-wrong' : ''}`}
                  style={{ gridColumn: 2, gridRow: rowIdx + 1 }}
                >
                  <span className="fl-zone-letter">{pairs[pairIdx].letter}</span>
                  <span className="fl-zone-name">{pairs[pairIdx].name}</span>
                </div>
              );
            })}
          </div>

          {/* Ghost card that follows the pointer */}
          {draggedPair !== null && (
            <div
              className="fl-word-card fl-ghost"
              style={{
                position: 'fixed',
                left: dragPos.x,
                top: dragPos.y,
                width: cardSize.w,
                pointerEvents: 'none',
                zIndex: 999,
              }}
            >
              <span className="fl-word-emoji">{pairs[draggedPair].emoji}</span>
              <span className="fl-word-text">{pairs[draggedPair].word}</span>
            </div>
          )}

          {/* ── Matched pairs strip — slides in at bottom ── */}
          {matchedList.length > 0 && (
            <div className="fl-matched-strip">
              {matchedList.map(pairIdx => (
                <div key={pairIdx} className="fl-matched-pair pop">
                  <span className="fl-mp-letter">{pairs[pairIdx].letter}</span>
                  <span className="fl-mp-sep">←</span>
                  <span className="fl-mp-emoji">{pairs[pairIdx].emoji}</span>
                  <span className="fl-mp-word">{pairs[pairIdx].word}</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </GameShell>
  );
}
