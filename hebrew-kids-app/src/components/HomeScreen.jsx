import { useState, useEffect, useMemo } from 'react';
import { Sounds } from '../utils/sounds';
import { getProfile } from './ProfileScreen';
import './HomeScreen.css';

const GAMES = [
  {
    id: 'letters',
    title: 'אותיות',
    subtitle: 'לימוד א-ב',
    emoji: '❄️',
    gradient: 'linear-gradient(145deg, #5b21b6 0%, #8b5cf6 100%)',
    glow: 'rgba(139,92,246,0.65)',
    imgSrc: '/images/elsa.png',
    imgPos: 'top center',
  },
  {
    id: 'counting',
    title: 'ספירה',
    subtitle: 'בואי נספור',
    emoji: '🐾',
    gradient: 'linear-gradient(145deg, #1e40af 0%, #38bdf8 100%)',
    glow: 'rgba(56,189,248,0.65)',
    imgSrc: '/images/bluey.webp',
    imgPos: 'top center',
  },
  {
    id: 'memory',
    title: 'זיכרון',
    subtitle: 'מצאי זוגות',
    emoji: '🧠',
    gradient: 'linear-gradient(145deg, #831843 0%, #f472b6 100%)',
    glow: 'rgba(244,114,182,0.65)',
    imgSrc: '/images/teletubbies.jpg',
    imgPos: 'center 12%',
  },
  {
    id: 'math',
    title: 'חשבון',
    subtitle: 'חיבור וחיסור',
    emoji: '🌟',
    gradient: 'linear-gradient(145deg, #14532d 0%, #4ade80 100%)',
    glow: 'rgba(74,222,128,0.65)',
    imgSrc: '/images/Mickey1.jpeg',
    imgPos: 'top center',
  },
  {
    id: 'words',
    title: 'מילות קסם',
    subtitle: 'בואי נבנה מילים',
    emoji: '✨',
    gradient: 'linear-gradient(145deg, #9a3412 0%, #fb923c 100%)',
    glow: 'rgba(251,146,60,0.65)',
    imgSrc: '/images/gabby-hero2.png',
    imgPos: 'top center',
  },
];

const PARTICLE_POOL = ['⭐','❄️','🐾','💜','🌸','✨','🎵','🌟','💛','🎈','🦋','💎'];

function CharImg({ src, alt, size, objPos = 'top center' }) {
  return (
    <div className="char-sticker" style={{ width: size, height: size }}>
      <img src={src} alt={alt} style={{ objectPosition: objPos }} draggable={false} />
    </div>
  );
}

export default function HomeScreen({ onSelectGame, totalStars }) {
  const [pressed, setPressed]         = useState(null);
  const [showWelcome, setShowWelcome] = useState(
    () => !localStorage.getItem('hebrew-app-welcomed')
  );
  const profileName = getProfile().name || '';

  useEffect(() => {
    if (!showWelcome) return;
    localStorage.setItem('hebrew-app-welcomed', '1');
    const t = setTimeout(() => setShowWelcome(false), 3200);
    return () => clearTimeout(t);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const particles = useMemo(() =>
    Array.from({ length: 16 }).map((_, i) => ({
      emoji: PARTICLE_POOL[i % PARTICLE_POOL.length],
      left:  `${(i * 57 + 9)  % 96}%`,
      top:   `${(i * 73 + 7) % 88}%`,
      size:  16 + (i % 4) * 6,
      delay: `${(i * 0.4) % 5}s`,
      dur:   `${4 + (i % 3)}s`,
    })), []);

  function handleSelect(game) {
    Sounds.tap();
    setPressed(game.id);
    setTimeout(() => {
      setPressed(null);
      onSelectGame(game.id);
    }, 280);
  }

  function dismissWelcome() {
    setShowWelcome(false);
  }

  return (
    <div className="home-screen">

      {/* Floating background particles */}
      <div className="bg-particles" aria-hidden>
        {particles.map((p, i) => (
          <span key={i} className="particle" style={{
            left: p.left, top: p.top,
            fontSize: `${p.size}px`,
            animationDelay: p.delay,
            animationDuration: p.dur,
          }}>{p.emoji}</span>
        ))}
      </div>

      {/* Welcome overlay */}
      {showWelcome && (
        <div className="welcome-overlay" onClick={dismissWelcome}>
          <div className="welcome-card pop" onClick={e => e.stopPropagation()}>
            <CharImg src="/images/elsa.png" alt="אלזה" size={110} objPos="top center" />
            <div className="welcome-text-wrap">
              <p className="welcome-hi">👋 שלום! אני אלזה!</p>
              <p className="welcome-msg">בואי נשחק ונלמד יחד!</p>
              <button className="welcome-btn" onClick={dismissWelcome}>🎉 בואי נתחיל!</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="home-header fade-in">
        <div className="home-brand-row">
          <div className="home-brand-chars">
            <CharImg src="/images/elsa.png"   alt="אלזה"  size={68} objPos="top center" />
            <CharImg src="/images/bluey.webp" alt="בלואי" size={68} objPos="top center" />
          </div>
          <div className="home-brand-title">
            <h1 className="home-title">
              {profileName ? `שלום, ${profileName}! 🎉` : '🎮 משחקי לימוד'}
            </h1>
            <p className="home-subtitle">עברית וחשבון כיפי</p>
          </div>
        </div>

        {/* Stars counter */}
        <div className="stars-counter">
          <span className="stars-star-icon" aria-hidden>⭐</span>
          <span className="stars-num">{totalStars}</span>
          <span className="stars-label">כוכבים</span>
          {totalStars === 0 && <span className="stars-hint">שחקי כדי לאסוף!</span>}
        </div>
      </header>

      {/* Games grid — 2-column square tiles */}
      <main className="games-grid">
        {GAMES.map((game, i) => (
          <button
            key={game.id}
            className={`game-card ${pressed === game.id ? 'card-pressed' : ''}`}
            style={{
              background: game.gradient,
              '--glow': game.glow,
              animationDelay: `${i * 0.09}s`,
            }}
            onClick={() => handleSelect(game)}
          >
            {/* Character image — top portion */}
            <div className="card-char-area">
              <CharImg src={game.imgSrc} alt={game.title} size={100} objPos={game.imgPos} />
            </div>

            {/* Title strip — bottom */}
            <div className="card-label">
              <span className="card-emoji">{game.emoji}</span>
              <strong className="card-title">{game.title}</strong>
            </div>
          </button>
        ))}
      </main>

      {/* Bottom nav */}
      <nav className="bottom-nav" aria-label="ניווט ראשי">
        <button className="bottom-nav-item" onClick={() => onSelectGame('profile')}>
          <span className="bnav-icon">👤</span>
          <span className="bnav-label">פרופיל</span>
        </button>
        <button className="bottom-nav-item" onClick={() => onSelectGame('achievements')}>
          <span className="bnav-icon">🏆</span>
          <span className="bnav-label">הישגים</span>
        </button>
        <button className="bottom-nav-item" onClick={() => onSelectGame('settings')}>
          <span className="bnav-icon">⚙️</span>
          <span className="bnav-label">הגדרות</span>
        </button>
      </nav>

    </div>
  );
}
