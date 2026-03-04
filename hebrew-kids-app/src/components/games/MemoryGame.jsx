import { useState, useCallback } from 'react';
import GameShell from '../GameShell';
import CharacterImg from '../CharacterImg';
import GameEffects from '../GameEffects';
import { ALEF_BET, shuffle } from '../../utils/hebrewData';
import { Sounds } from '../../utils/sounds';
import './MemoryGame.css';

// Build a set of 8 pairs: each pair = hebrew letter card + emoji card
function buildCards() {
  const items = shuffle(ALEF_BET).slice(0, 8);
  const cards = [];
  items.forEach((item, i) => {
    cards.push({ id: `letter-${i}`, pairId: i, type: 'letter', content: item.letter, label: item.name });
    cards.push({ id: `emoji-${i}`,  pairId: i, type: 'emoji',  content: item.emoji,  label: item.word  });
  });
  return shuffle(cards);
}

export default function MemoryGame({ onBack, onAddStars }) {
  const [cards, setCards] = useState(() => buildCards());
  const [flipped, setFlipped]     = useState([]);   // indices of face-up (non-matched)
  const [matched, setMatched]     = useState(new Set());
  const [locked, setLocked]       = useState(false);
  const [score, setScore]         = useState(0);
  const [matchAnim, setMatchAnim] = useState(null);  // pairId of last match
  const [done, setDone]           = useState(false);

  function handleFlip(idx) {
    if (locked || flipped.includes(idx) || matched.has(cards[idx].pairId)) return;
    Sounds.flip();
    const newFlipped = [...flipped, idx];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setLocked(true);
      const [a, b] = newFlipped;
      if (cards[a].pairId === cards[b].pairId) {
        // Match!
        Sounds.match();
        const newMatched = new Set([...matched, cards[a].pairId]);
        setMatchAnim(cards[a].pairId);
        setMatched(newMatched);
        setScore(s => s + 1);
        onAddStars(1);
        setTimeout(() => setMatchAnim(null), 800);
        setFlipped([]);
        setLocked(false);
        if (newMatched.size === 8) {
          setTimeout(() => { setDone(true); Sounds.win(); }, 500);
        }
      } else {
        Sounds.wrong();
        setTimeout(() => { setFlipped([]); setLocked(false); }, 1100);
      }
    }
  }

  function restart() {
    setCards(buildCards());
    setFlipped([]);
    setMatched(new Set());
    setLocked(false);
    setScore(0);
    setMatchAnim(null);
    setDone(false);
  }

  const isFaceUp = (idx) => flipped.includes(idx) || matched.has(cards[idx].pairId);
  const isMatched = (idx) => matched.has(cards[idx].pairId);

  return (
    <GameShell title="זיכרון עם הטלטאביז" emoji="🧠" score={score} maxScore={8} onBack={onBack} bgClass="memory-bg">
      <GameEffects correct={matchAnim !== null} done={done} character="teletubbies" />
      {done ? (
        <div className="done-screen fade-in">
          <CharacterImg character="teletubbies" size={280} className="bounce" />
          <div className="done-box pop">
            <span className="done-emoji">🧠</span>
            <h2 className="done-title">מדהים!</h2>
            <p className="done-sub">מצאת את כל ה-8 זוגות! ⭐</p>
            {'⭐'.repeat(8)}
            <div className="done-btns">
              <button className="done-btn primary" onClick={restart}>שחק שוב 🔄</button>
              <button className="done-btn secondary" onClick={onBack}>חזרה 🏠</button>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Teletubbies helpers banner */}
          <div className="memory-helpers">
            <CharacterImg
              character="teletubbies"
              size={240}
              className={matchAnim !== null ? 'bounce' : ''}
            />
          </div>
          <p className="instruction">מצאי את הזוגות! 🃏</p>

          <div className="memory-grid">
            {cards.map((card, idx) => (
              <button
                key={card.id}
                className={`memory-card ${isFaceUp(idx) ? 'flipped' : ''} ${isMatched(idx) ? 'matched' : ''} ${matchAnim === card.pairId ? 'match-pop' : ''}`}
                onClick={() => handleFlip(idx)}
                aria-label={isFaceUp(idx) ? card.label : 'קלף הפוך'}
              >
                <div className="card-inner">
                  <div className="card-back">✦</div>
                  <div className={`card-front ${card.type === 'letter' ? 'letter-face' : 'emoji-face'}`}>
                    {card.content}
                  </div>
                </div>
              </button>
            ))}
          </div>

          <p className="memory-progress">
            זוגות שנמצאו: {matched.size} / 8
          </p>
        </>
      )}
    </GameShell>
  );
}
