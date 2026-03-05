import { useState, useCallback, useEffect } from 'react';
import GameShell from '../GameShell';
import CharacterImg from '../CharacterImg';
import GameEffects from '../GameEffects';
import { ALEF_BET, shuffle } from '../../utils/hebrewData';
import { Sounds } from '../../utils/sounds';
import { unlockAchievement, recordGamePlayed } from '../../utils/achievements';
import './MemoryGame.css';

function buildCards() {
  const items = shuffle(ALEF_BET).slice(0, 8);
  const cards = [];
  items.forEach((item, i) => {
    cards.push({ id: `letter-${i}`, pairId: i, type: 'letter', content: item.letter, label: item.name,  emoji: item.emoji });
    cards.push({ id: `emoji-${i}`,  pairId: i, type: 'emoji',  content: item.emoji,  label: item.word,   letter: item.letter });
  });
  return shuffle(cards);
}

export default function MemoryGame({ onBack, onAddStars }) {
  const [cards, setCards]           = useState(() => buildCards());
  const [flipped, setFlipped]       = useState([]);
  const [matched, setMatched]       = useState(new Set());
  const [locked, setLocked]         = useState(false);
  const [score, setScore]           = useState(0);
  const [matchAnim, setMatchAnim]   = useState(null);
  const [wrongAnim, setWrongAnim]   = useState(false);   // FU8
  const [done, setDone]             = useState(false);
  const [matchHistory, setMatchHistory] = useState([]);  // FU24
  const [showReview, setShowReview] = useState(false);

  useEffect(() => {
    Sounds.startMusic('memory');
    return () => Sounds.stopMusic();
  }, []);

  function handleFlip(idx) {
    if (locked || flipped.includes(idx) || matched.has(cards[idx].pairId)) return;
    Sounds.flip();
    const newFlipped = [...flipped, idx];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setLocked(true);
      const [a, b] = newFlipped;
      if (cards[a].pairId === cards[b].pairId) {
        Sounds.match();
        const newMatched = new Set([...matched, cards[a].pairId]);
        setMatchAnim(cards[a].pairId);
        setMatched(newMatched);
        setScore(s => s + 1);
        onAddStars(1);
        // FU24: track matched pair
        const letterCard = cards[a].type === 'letter' ? cards[a] : cards[b];
        const emojiCard  = cards[a].type === 'emoji'  ? cards[a] : cards[b];
        setMatchHistory(h => [...h, {
          display: `${letterCard.content} — ${emojiCard.content} ${letterCard.label}`
        }]);
        setTimeout(() => setMatchAnim(null), 800);
        setFlipped([]);
        setLocked(false);
        if (newMatched.size === 8) {
          setTimeout(() => {
            setDone(true);
            Sounds.win();
            const stats = recordGamePlayed('memory');
            if (stats.count >= 10) unlockAchievement('games_10');
            if (stats.uniqueGames.length >= 5) unlockAchievement('all_games');
          }, 500);
        }
      } else {
        Sounds.wrong();
        // FU8: wrong match animation on character
        setWrongAnim(true);
        setTimeout(() => { setFlipped([]); setLocked(false); setWrongAnim(false); }, 1100);
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
    setWrongAnim(false);
    setDone(false);
    setMatchHistory([]);
    setShowReview(false);
  }

  const isFaceUp  = (idx) => flipped.includes(idx) || matched.has(cards[idx].pairId);
  const isMatched = (idx) => matched.has(cards[idx].pairId);

  // FU8: derive character animation class
  const teletAnim = matchAnim !== null ? 'bounce' : wrongAnim ? 'wiggle' : '';

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
              {matchHistory.map((item, i) => (
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
          {/* FU8: Character with react animations */}
          <div className="memory-helpers">
            <CharacterImg
              character="teletubbies"
              size={240}
              className={teletAnim}
            />
          </div>

          {/* FU11: Progress bar */}
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${(matched.size / 8) * 100}%` }} />
          </div>
          <p className="round-label">זוגות שנמצאו: {matched.size} / 8</p>

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
        </>
      )}
    </GameShell>
  );
}
