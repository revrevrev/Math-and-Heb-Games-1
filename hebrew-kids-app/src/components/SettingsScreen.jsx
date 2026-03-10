import { useState } from 'react';
import { Sounds } from '../utils/sounds';
import { resetAllProgress } from '../utils/achievements';
import './SettingsScreen.css';

export default function SettingsScreen({ onBack }) {
  const [muted, setMutedState]             = useState(Sounds.muted);
  const [musicEnabled, setMusicEnabledState] = useState(Sounds.musicEnabled);
  const [musicVolume, setMusicVolumeState] = useState(Sounds.musicVolume);
  const [resetDone, setResetDone]          = useState(false);

  function toggleMute() {
    const next = !muted;
    Sounds.setMuted(next);
    setMutedState(next);
  }

  function toggleMusic() {
    const next = !musicEnabled;
    Sounds.setMusicEnabled(next);
    setMusicEnabledState(next);
  }

  function handleVolumeChange(e) {
    const val = parseFloat(e.target.value);
    Sounds.setMusicVolume(val);
    setMusicVolumeState(val);
  }

  function handleReset() {
    if (window.confirm('לאפס את כל ההתקדמות? (כוכבים, הישגים, משחקים)')) {
      resetAllProgress();
      setResetDone(true);
      setTimeout(() => setResetDone(false), 2500);
    }
  }

  return (
    <div className="settings-screen">
      <div className="settings-top-bar">
        <button className="settings-back-btn" onClick={onBack}>🏠 בית</button>
        <h2 className="settings-title">⚙️ הגדרות</h2>
      </div>

      <div className="settings-body">
        <div className="setting-row">
          <div className="setting-info">
            <span className="setting-icon">🔊</span>
            <div>
              <strong className="setting-label">צלילי משחק</strong>
              <span className="setting-desc">לחיצות, נכון/לא נכון</span>
            </div>
          </div>
          <button
            className={`toggle-btn ${!muted ? 'toggle-on' : 'toggle-off'}`}
            onClick={toggleMute}
          >
            {!muted ? 'פועל ✓' : 'כבוי ✗'}
          </button>
        </div>

        <div className="setting-row setting-row-col">
          <div className="setting-row-top">
            <div className="setting-info">
              <span className="setting-icon">🎵</span>
              <div>
                <strong className="setting-label">מוזיקת רקע</strong>
                <span className="setting-desc">מנגינה עדינה בזמן משחק</span>
              </div>
            </div>
            <button
              className={`toggle-btn ${musicEnabled ? 'toggle-on' : 'toggle-off'}`}
              onClick={toggleMusic}
            >
              {musicEnabled ? 'פועל ✓' : 'כבוי ✗'}
            </button>
          </div>
          {musicEnabled && (
            <div className="volume-row">
              <span className="volume-icon">🔈</span>
              <input
                type="range"
                className="volume-slider"
                min="0"
                max="1"
                step="0.05"
                value={musicVolume}
                onChange={handleVolumeChange}
              />
              <span className="volume-icon">🔊</span>
            </div>
          )}
        </div>

        <div className="setting-row setting-danger">
          <div className="setting-info">
            <span className="setting-icon">🗑️</span>
            <div>
              <strong className="setting-label">איפוס התקדמות</strong>
              <span className="setting-desc">מוחק כוכבים והישגים</span>
            </div>
          </div>
          <button className="reset-btn" onClick={handleReset}>
            {resetDone ? '✓ אופס!' : 'איפוס'}
          </button>
        </div>
      </div>
    </div>
  );
}
