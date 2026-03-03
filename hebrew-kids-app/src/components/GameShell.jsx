// Shared game shell – header bar with back button + score
import './GameShell.css';

export default function GameShell({ title, emoji, score, maxScore, onBack, children, bgClass = '' }) {
  return (
    <div className={`game-shell ${bgClass}`}>
      <div className="game-top-bar">
        <button className="back-btn" onClick={onBack} aria-label="חזרה">
          ← חזרה
        </button>
        <h2 className="game-top-title">{emoji} {title}</h2>
        <div className="game-score">
          {'⭐'.repeat(score)}
          {maxScore > 0 && <span className="score-of"> / {maxScore}</span>}
        </div>
      </div>
      <div className="game-body">
        {children}
      </div>
    </div>
  );
}
