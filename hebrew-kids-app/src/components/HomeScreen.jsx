import { useState, useEffect, useMemo } from 'react';
import { Sounds } from '../utils/sounds';
import { getProfile } from './ProfileScreen';
import './HomeScreen.css';

const GAMES = [
  {
    id: 'letters',
    title: 'אותיות עם אלזה',
    subtitle: 'א-ב',
    gradient: 'linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)',
    imgSrc: '/images/elsa.png',
    imgPos: 'top center',
  },
  {
    id: 'counting',
    title: 'ספירה עם בלואי',
    subtitle: 'בואי נספור',
    gradient: 'linear-gradient(135deg, #38bdf8 0%, #2563eb 100%)',
    imgSrc: '/images/bluey.webp',
    imgPos: 'top center',
  },
  {
    id: 'memory',
    title: 'משחק הזכרון עם טלטאביס',
    subtitle: 'מצאי זוגות',
    gradient: 'linear-gradient(135deg, #f472b6 0%, #9333ea 100%)',
    imgSrc: '/images/teletubbies.jpg',
    imgPos: 'center 12%',
  },
  {
    id: 'math',
    title: 'חשבון עם מיקי',
    subtitle: 'חיבור וחיסור',
    gradient: 'linear-gradient(135deg, #34d399 0%, #059669 100%)',
    imgSrc: '/images/Mickey1.jpeg',
    imgPos: 'top center',
  },
  {
    id: 'words',
    title: 'מילות קסם עם גבי',
    subtitle: 'בואי נבנה מילים',
    gradient: 'linear-gradient(135deg, #fb923c 0%, #e11d48 100%)',
    imgSrc: '/images/gabby-hero2.png',
    imgPos: 'top center',
  },
];

const PARTICLE_POOL = ['⭐','❄️','🐾','💜','🌸','✨','🎵','🌟','💛','🎈','🦋','💎'];

/* Character sticker: real photo in a circle */
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
    Array.from({ length: 12 }).map((_, i) => ({
      emoji: PARTICLE_POOL[i % PARTICLE_POOL.length],
      left:  `${(i * 57 + 9)  % 96}%`,
      top:   `${(i * 73 + 7) % 88}%`,
      size:  14 + (i % 4) * 5,
      delay: `${(i * 0.5) % 5}s`,
      dur:   `${5 + (i % 4)}s`,
    })), []);

  function handleSelect(game) {
    Sounds.tap();
    setPressed(game.id);
    setTimeout(() => {
      setPressed(null);
      onSelectGame(game.id);
    }, 300);
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
            <CharImg src="/images/elsa.png" alt="אלזה" size={100} objPos="top center" />
            <div className="welcome-text-wrap">
              <p className="welcome-hi">👋 שלום! אני אלזה!</p>
              <p className="welcome-msg">בואי נשחק ונלמד יחד!</p>
              <button className="welcome-btn" onClick={dismissWelcome}>🎉 בואי!</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="home-header fade-in">
        {/* Branding row */}
        <div className="home-brand-row">
          <div className="home-brand-chars">
            <CharImg src="/images/elsa.png"   alt="אלזה"  size={72} objPos="top center" />
            <CharImg src="/images/bluey.webp" alt="בלואי" size={72} objPos="top center" />
          </div>
          <div className="home-brand-title">
            <h1 className="home-title">
              {profileName ? `שלום, ${profileName}!` : 'משחקי לימוד'}
            </h1>
            <p className="home-subtitle">עברית וחשבון כיפי ✨</p>
          </div>
        </div>

        {/* Stars counter — numeric */}
        <div className="stars-counter">
          <span className="stars-star-icon" aria-hidden>⭐</span>
          <span className="stars-num">{totalStars}</span>
          <span className="stars-label">כוכבים</span>
          {totalStars === 0 && (
            <span className="stars-hint">שחקי כדי לאסוף!</span>
          )}
        </div>
      </header>

      {/* Games grid */}
      <main className="games-grid">
        {GAMES.map((game, i) => (
          <button
            key={game.id}
            className={`game-card ${pressed === game.id ? 'card-pressed' : ''}`}
            style={{
              background: game.gradient,
              animationDelay: `${i * 0.08}s`,
            }}
            onClick={() => handleSelect(game)}
          >
            <span className="card-play-btn" aria-hidden>▶</span>

            <div className="card-text-area">
              <strong className="card-title">{game.title}</strong>
              <span className="card-subtitle">{game.subtitle}</span>
            </div>

            <div className="card-char-peek">
              <CharImg src={game.imgSrc} alt={game.title} size={120} objPos={game.imgPos} />
            </div>
          </button>
        ))}
      </main>

      {/* Bottom navigation tab bar */}
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
