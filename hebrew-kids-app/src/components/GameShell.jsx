// Shared game shell – header bar with back button + score + mute
import { useState } from 'react';
import { Sounds } from '../utils/sounds';
import './GameShell.css';

export default function GameShell({ title, emoji, score, maxScore, onBack, children, bgClass = '' }) {
  const [muted, setMutedState] = useState(Sounds.muted);

  function toggleMute() {
    const next = !muted;
    Sounds.setMuted(next);
    setMutedState(next);
  }

  return (
    <div className={`game-shell ${bgClass}`}>
      <div className="game-top-bar">
        <button className="back-btn" onClick={onBack} aria-label="חזרה הביתה">
          🏠 בית
        </button>
        <h2 className="game-top-title">{emoji} {title}</h2>
        <div className="game-top-right">
          <button
            className="mute-btn"
            onClick={toggleMute}
            aria-label={muted ? 'הפעל צלילים' : 'השתק צלילים'}
          >
            {muted ? '🔇' : '🔊'}
          </button>
          <div className="game-score">
            {'⭐'.repeat(score)}
            {maxScore > 0 && <span className="score-of"> / {maxScore}</span>}
          </div>
        </div>
      </div>
      <div className="game-body">
        {children}
      </div>
    </div>
  );
}
