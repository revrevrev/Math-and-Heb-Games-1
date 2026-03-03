import { useState, useEffect, useMemo } from 'react';
import { Sounds } from '../utils/sounds';
import './HomeScreen.css';

const GAMES = [
  {
    id: 'letters',
    title: 'אותיות עם אלזה',
    subtitle: 'לימוד א-ב!',
    emoji: '❄️',
    gradient: 'linear-gradient(145deg, #0ea5e9 0%, #6366f1 100%)',
    glowColor: '#38bdf8',
    watermark: '❄️',
    imgSrc: '/images/elsa.png',
    imgPos: 'top center',
  },
  {
    id: 'counting',
    title: 'ספירה עם בלוי',
    subtitle: 'בואי נספור!',
    emoji: '🐾',
    gradient: 'linear-gradient(145deg, #2563eb 0%, #06b6d4 100%)',
    glowColor: '#60a5fa',
    watermark: '🐾',
    imgSrc: '/images/bluey.webp',
    imgPos: 'top center',
  },
  {
    id: 'memory',
    title: 'זיכרון טלטאבי',
    subtitle: 'מצאי זוגות!',
    emoji: '🧠',
    gradient: 'linear-gradient(145deg, #9333ea 0%, #ec4899 100%)',
    glowColor: '#c084fc',
    watermark: '💜',
    imgSrc: '/images/teletubbies.jpg',
    imgPos: 'center 12%',
  },
  {
    id: 'math',
    title: 'חשבון עם אנה',
    subtitle: 'חיבור וחיסור!',
    emoji: '🎯',
    gradient: 'linear-gradient(145deg, #16a34a 0%, #ca8a04 100%)',
    glowColor: '#4ade80',
    watermark: '🌟',
    imgSrc: '/images/anna-elsa.jpg',
    imgPos: 'left top',
  },
  {
    id: 'words',
    title: 'מילות קסם',
    subtitle: 'בואי נבנה מילים!',
    emoji: '✨',
    gradient: 'linear-gradient(145deg, #ea580c 0%, #db2777 100%)',
    glowColor: '#fb923c',
    watermark: '✨',
    imgSrc: '/images/anna-elsa.jpg',
    imgPos: '75% top',
  },
];

const PARTICLE_POOL = ['⭐','❄️','🐾','💜','🌸','✨','🎵','🌟','💛','🎈','🦋','💎'];

/* ── Character sticker: real photo in a circle ── */
function CharImg({ src, alt, size, objPos = 'top center' }) {
  return (
    <div
      className="char-sticker"
      style={{ width: size, height: size }}
    >
      <img
        src={src}
        alt={alt}
        style={{ objectPosition: objPos }}
        draggable={false}
      />
    </div>
  );
}

export default function HomeScreen({ onSelectGame, totalStars }) {
  const [pressed, setPressed]         = useState(null);
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setShowWelcome(false), 3200);
    return () => clearTimeout(t);
  }, []);

  const particles = useMemo(() =>
    Array.from({ length: 22 }).map((_, i) => ({
      emoji: PARTICLE_POOL[i % PARTICLE_POOL.length],
      left:  `${(i * 41 + 7)  % 100}%`,
      top:   `${(i * 67 + 13) % 100}%`,
      size:  12 + (i % 5) * 4,
      delay: `${(i * 0.35) % 4}s`,
      dur:   `${3 + (i % 4)}s`,
    })), []);

  function handleSelect(game) {
    Sounds.tap();
    setPressed(game.id);
    setTimeout(() => {
      setPressed(null);
      onSelectGame(game.id);
    }, 320);
  }

  const cappedStars = Math.min(totalStars, 12);

  return (
    <div className="home-screen">

      {/* ── Floating background particles ── */}
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

      {/* ── Welcome overlay ── */}
      {showWelcome && (
        <div className="welcome-overlay">
          <div className="welcome-card pop">
            <CharImg src="/images/elsa.png" alt="אלזה" size={110} objPos="top center" />
            <div className="welcome-text-wrap">
              <p className="welcome-hi">👋 שלום! אני אלזה!</p>
              <p className="welcome-msg">בואי נשחק ונלמד יחד! 🎉</p>
              <div className="welcome-dots">
                <span>❄️</span><span>⭐</span><span>🐾</span><span>💜</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Header ── */}
      <header className="home-header fade-in">
        <div className="header-chars-row">
          <div className="header-char-slot">
            <CharImg src="/images/elsa.png" alt="אלזה" size={88} objPos="top center" />
            <span className="char-name">אלזה</span>
          </div>

          <div className="title-block">
            <h1 className="home-title">
              <span className="title-sparkle">✨</span>
              איזה כיף לשחק
              <span className="title-sparkle">✨</span>
            </h1>
            <p className="home-subtitle">עברית וחשבון כיפי!</p>
          </div>

          <div className="header-char-slot">
            <CharImg src="/images/bluey.webp" alt="בלוי" size={88} objPos="top center" />
            <span className="char-name">בלוי</span>
          </div>
        </div>

        {/* Stars counter */}
        <div className="stars-counter">
          <span className="stars-crown">👑</span>
          <span className="stars-label-text">הכוכבים שלי:</span>
          <div className="stars-icons-row">
            {cappedStars > 0
              ? Array.from({ length: cappedStars }).map((_, i) => (
                  <span key={i} className="star-pip" style={{ animationDelay: `${i * 0.06}s` }}>⭐</span>
                ))
              : <span className="stars-empty-msg">שחקי כדי לאסוף כוכבים!</span>
            }
            {totalStars > 12 && (
              <span className="stars-extra">+{totalStars - 12}</span>
            )}
          </div>
          {totalStars > 0 && (
            <span className="stars-total-num">{totalStars} סה״כ</span>
          )}
        </div>
      </header>

      {/* ── Games grid ── */}
      <main className="games-grid">
        {GAMES.map((game, i) => (
          <button
            key={game.id}
            className={`game-card ${pressed === game.id ? 'card-pressed' : ''}`}
            style={{
              background: game.gradient,
              '--glow': game.glowColor,
              animationDelay: `${i * 0.09}s`,
            }}
            onClick={() => handleSelect(game)}
          >
            <span className="card-watermark" aria-hidden>{game.watermark}</span>

            <div className="card-char-peek">
              <CharImg src={game.imgSrc} alt={game.title} size={86} objPos={game.imgPos} />
            </div>

            <div className="card-text-area">
              <span className="card-emoji-badge">{game.emoji}</span>
              <strong className="card-title">{game.title}</strong>
              <span className="card-subtitle">{game.subtitle}</span>
              <span className="card-play-btn">▶ שחקי!</span>
            </div>
          </button>
        ))}
      </main>

      {/* ── Footer: Anna sticker + Teletubbies photo banner ── */}
      <footer className="home-footer">
        <div className="footer-char">
          <CharImg src="/images/anna-elsa.jpg" alt="אנה ואלזה" size={62} objPos="22% top" />
          <span className="footer-name">אנה ואלזה</span>
        </div>
        <div className="footer-teletubbies">
          <img
            src="/images/teletubbies.jpg"
            alt="הטלטאביז"
            className="teletubbies-banner"
            draggable={false}
          />
          <span className="footer-name footer-tele-label">הטלטאביז ❤️</span>
        </div>
        <div className="footer-char">
          <CharImg src="/images/bluey.webp" alt="בלוי" size={62} objPos="top center" />
          <span className="footer-name">בלוי</span>
        </div>
      </footer>

    </div>
  );
}
