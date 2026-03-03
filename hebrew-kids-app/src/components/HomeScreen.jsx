import { useState, useEffect } from 'react';
import Elsa from './characters/Elsa';
import Anna from './characters/Anna';
import Bluey from './characters/Bluey';
import Teletubby from './characters/Teletubby';
import { Sounds } from '../utils/sounds';
import './HomeScreen.css';

const GAMES = [
  {
    id: 'letters',
    title: 'אותיות עם אלזה',
    subtitle: 'לימוד אותיות עברית',
    emoji: '❄️',
    color: '#38bdf8',
    gradient: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
    character: <Elsa size={70} />,
    stars: 0,
  },
  {
    id: 'counting',
    title: 'ספירה עם בלוי',
    subtitle: 'לספור ולהכיר מספרים',
    emoji: '🐾',
    color: '#60a5fa',
    gradient: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
    character: <Bluey size={70} />,
    stars: 0,
  },
  {
    id: 'memory',
    title: 'זיכרון עם הטלטאביז',
    subtitle: 'מצא את הזוגות!',
    emoji: '🧠',
    color: '#a855f7',
    gradient: 'linear-gradient(135deg, #a855f7, #ec4899)',
    character: <Teletubby color="purple" size={70} />,
    stars: 0,
  },
  {
    id: 'math',
    title: 'חשבון עם אנה',
    subtitle: 'חיבור וחיסור כיפי',
    emoji: '🎯',
    color: '#22c55e',
    gradient: 'linear-gradient(135deg, #16a34a, #eab308)',
    character: <Anna size={70} />,
    stars: 0,
  },
  {
    id: 'words',
    title: 'מילות קסם',
    subtitle: 'בואי נבנה מילים!',
    emoji: '✨',
    color: '#f97316',
    gradient: 'linear-gradient(135deg, #f97316, #ec4899)',
    character: <Teletubby color="yellow" size={70} />,
    stars: 0,
  },
];

export default function HomeScreen({ onSelectGame, totalStars }) {
  const [bouncing, setBouncing] = useState(null);
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setShowWelcome(false), 2200);
    return () => clearTimeout(t);
  }, []);

  function handleSelect(game) {
    Sounds.tap();
    setBouncing(game.id);
    setTimeout(() => {
      setBouncing(null);
      onSelectGame(game.id);
    }, 350);
  }

  return (
    <div className="home-screen">
      {/* Floating background stars */}
      <div className="bg-stars" aria-hidden>
        {Array.from({ length: 18 }).map((_, i) => (
          <span key={i} className="bg-star" style={{
            left:  `${Math.random() * 100}%`,
            top:   `${Math.random() * 100}%`,
            fontSize: `${10 + Math.random() * 18}px`,
            animationDelay:  `${Math.random() * 3}s`,
            animationDuration:`${2 + Math.random() * 3}s`,
          }}>✦</span>
        ))}
      </div>

      {/* Header */}
      <header className="home-header fade-in">
        <div className="header-characters">
          <div className="header-char" style={{ animationDelay: '0s' }}>
            <Elsa size={70} animate />
          </div>
          <div className="header-title-wrap">
            <h1 className="home-title">🌟 משחקי לימוד 🌟</h1>
            <p className="home-sub">עברית וחשבון כיפי!</p>
          </div>
          <div className="header-char" style={{ animationDelay: '0.4s' }}>
            <Bluey size={70} animate />
          </div>
        </div>

        {/* Stars bar */}
        <div className="stars-bar">
          <span className="stars-label">הכוכבים שלי:</span>
          <span className="stars-count">
            {'⭐'.repeat(Math.min(totalStars, 10))}
            {totalStars > 0 && <span className="stars-num"> {totalStars}</span>}
          </span>
        </div>
      </header>

      {/* Welcome bubble */}
      {showWelcome && (
        <div className="welcome-bubble pop">
          <span className="welcome-text">שלום! בואי נשחק ונלמד יחד! 🎉</span>
        </div>
      )}

      {/* Game grid */}
      <main className="games-grid">
        {GAMES.map((game, i) => (
          <button
            key={game.id}
            className={`game-card ${bouncing === game.id ? 'wiggle' : ''}`}
            style={{ background: game.gradient, animationDelay: `${i * 0.08}s` }}
            onClick={() => handleSelect(game)}
          >
            <div className="card-character">{game.character}</div>
            <div className="card-info">
              <span className="card-emoji">{game.emoji}</span>
              <strong className="card-title">{game.title}</strong>
              <span className="card-sub">{game.subtitle}</span>
            </div>
            <div className="card-arrow">▶</div>
          </button>
        ))}
      </main>

      {/* Bottom characters */}
      <footer className="home-footer">
        <Anna size={65} animate />
        <Teletubby color="green"  size={60} animate screenContent="🎮" />
        <Teletubby color="yellow" size={60} animate screenContent="📖" />
        <Teletubby color="red"    size={60} animate screenContent="🔢" />
      </footer>
    </div>
  );
}
