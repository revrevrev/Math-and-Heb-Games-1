// Shared game shell – header bar with back button + score + mute
import { useState } from 'react';
import { Sounds } from '../utils/sounds';
import { Navigation } from '../utils/navigation';
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
        <div className="game-top-row1">
          <button className="back-btn" onClick={onBack} aria-label="חזרה הביתה">
            🏠
          </button>
          <div className="game-top-right">
            <button
              className="settings-btn"
              onClick={() => Navigation.goSettings()}
              aria-label="הגדרות"
            >
              ⚙️
            </button>
            <button
              className="mute-btn"
              onClick={toggleMute}
              aria-label={muted ? 'הפעל צלילים' : 'השתק צלילים'}
            >
              {muted ? '🔇' : '🔊'}
            </button>
            <div className="game-score">
              <span className="score-star">⭐</span>
              <span className="score-num">{score}</span>
              {maxScore > 0 && <span className="score-of">/{maxScore}</span>}
            </div>
          </div>
        </div>
        <h2 className="game-top-title">{emoji} {title}</h2>
      </div>
      <div className="game-body">
        {children}
      </div>
    </div>
  );
}
