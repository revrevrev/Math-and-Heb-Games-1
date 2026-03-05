import { ACHIEVEMENT_LIST, getAchievements, getGameStats } from '../utils/achievements';
import './AchievementsScreen.css';

export default function AchievementsScreen({ onBack, totalStars }) {
  const earned     = getAchievements();
  const { count: gamesCount, uniqueGames } = getGameStats();

  return (
    <div className="achievements-screen">
      <div className="ach-top-bar">
        <button className="ach-back-btn" onClick={onBack}>🏠 בית</button>
        <h2 className="ach-title">🏆 הישגים</h2>
      </div>

      <div className="ach-body">
        <div className="ach-summary">
          <div className="ach-stat">
            <span className="ach-stat-icon">⭐</span>
            <span className="ach-stat-num">{totalStars}</span>
            <span className="ach-stat-label">כוכבים</span>
          </div>
          <div className="ach-stat">
            <span className="ach-stat-icon">🎮</span>
            <span className="ach-stat-num">{gamesCount}</span>
            <span className="ach-stat-label">משחקים</span>
          </div>
          <div className="ach-stat">
            <span className="ach-stat-icon">🏆</span>
            <span className="ach-stat-num">{earned.length}/{ACHIEVEMENT_LIST.length}</span>
            <span className="ach-stat-label">הישגים</span>
          </div>
        </div>

        <div className="ach-list">
          {ACHIEVEMENT_LIST.map(a => {
            const unlocked = earned.includes(a.id);
            return (
              <div
                key={a.id}
                className={`ach-item ${unlocked ? 'ach-unlocked' : 'ach-locked'}`}
              >
                <span className="ach-item-icon">{a.icon}</span>
                <div className="ach-item-text">
                  <strong className="ach-item-title">{a.title}</strong>
                  <span className="ach-item-desc">{a.desc}</span>
                </div>
                <span className="ach-item-status">
                  {unlocked ? '✓' : '🔒'}
                </span>
              </div>
            );
          })}
        </div>

        <div className="ach-games-played">
          <p>משחקים ששיחקתי:</p>
          <div className="ach-game-tags">
            {['letters','counting','memory','math','words'].map(g => {
              const played = uniqueGames.includes(g);
              const labels = { letters:'אותיות', counting:'ספירה', memory:'זיכרון', math:'חשבון', words:'מילים' };
              return (
                <span key={g} className={`ach-game-tag ${played ? 'tag-played' : 'tag-unplayed'}`}>
                  {played ? '✓' : '○'} {labels[g]}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
