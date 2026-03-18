import { useState, useRef } from 'react';
import { Sounds } from '../utils/sounds';
import { resetAllProgress } from '../utils/achievements';
import { STARS_PER_PRESENT } from '../utils/presentsConfig';
import './SettingsScreen.css';

const CLAIMS_KEY  = 'hebrew-app-presents-claimed';

export default function SettingsScreen({ onBack, totalStars, onDebugSetStars }) {
  const [muted, setMutedState]             = useState(Sounds.muted);
  const [musicEnabled, setMusicEnabledState] = useState(Sounds.musicEnabled);
  const [musicVolume, setMusicVolumeState] = useState(Sounds.musicVolume);
  const [resetDone, setResetDone]          = useState(false);
  const [voiceEnabled, setVoiceEnabledState] = useState(Sounds.voiceEnabled);
  const [voiceVolume, setVoiceVolumeState]   = useState(Sounds.voiceVolume);
  const [sfxVolume, setSfxVolumeState]       = useState(Sounds.sfxVolume);

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

  function toggleVoice() {
    const next = !voiceEnabled;
    Sounds.setVoiceEnabled(next);
    setVoiceEnabledState(next);
  }

  function handleVoiceVolumeChange(e) {
    const val = parseFloat(e.target.value);
    Sounds.setVoiceVolume(val);
    setVoiceVolumeState(val);
  }

  function handleSfxVolumeChange(e) {
    const val = parseFloat(e.target.value);
    Sounds.setSfxVolume(val);
    setSfxVolumeState(val);
  }

  // ── Hidden debug panel ────────────────────────────────────
  const [debugOpen, setDebugOpen]         = useState(false);
  const [debugStars, setDebugStars]       = useState('');
  const [debugPresents, setDebugPresents] = useState('');
  const [debugApplied, setDebugApplied]   = useState(false);

  const titlePressRef = useRef(null);
  function onTitlePointerDown() {
    titlePressRef.current = setTimeout(() => setDebugOpen(v => !v), 700);
  }
  function onTitlePointerUp() { clearTimeout(titlePressRef.current); }

  function applyDebug() {
    const parsedStars    = debugStars    !== '' ? parseInt(debugStars,    10) : NaN;
    const parsedPresents = debugPresents !== '' ? parseInt(debugPresents, 10) : NaN;

    // Start from current values; override only what the user filled in
    let effectiveStars = Number.isFinite(parsedStars) && parsedStars >= 0
      ? parsedStars
      : totalStars;

    if (Number.isFinite(parsedPresents) && parsedPresents >= 0) {
      // Ensure stars are high enough to "earn" the requested presents
      const minStars = parsedPresents * STARS_PER_PRESENT;
      if (effectiveStars < minStars) effectiveStars = minStars;
      const earned  = Math.floor(effectiveStars / STARS_PER_PRESENT);
      const claimed = Math.max(0, earned - parsedPresents);
      localStorage.setItem(CLAIMS_KEY, String(claimed));
    }

    localStorage.setItem('hebrew-app-stars', String(effectiveStars));
    onDebugSetStars(effectiveStars);
    setDebugApplied(true);
    setTimeout(() => setDebugApplied(false), 1800);
  }
  // ─────────────────────────────────────────────────────────

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
        <button className="settings-back-btn" onClick={onBack}>← חזרה</button>
        <h2
          className="settings-title"
          onPointerDown={onTitlePointerDown}
          onPointerUp={onTitlePointerUp}
          onPointerLeave={onTitlePointerUp}
          style={{ userSelect: 'none' }}
        >⚙️ הגדרות</h2>
      </div>

      <div className="settings-body">
        <div className="setting-row setting-row-col">
          <div className="setting-row-top">
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
          {!muted && (
            <div className="volume-row">
              <span className="volume-icon">🔈</span>
              <input
                type="range"
                className="volume-slider"
                min="0"
                max="1"
                step="0.05"
                value={sfxVolume}
                onChange={handleSfxVolumeChange}
              />
              <span className="volume-icon">🔊</span>
            </div>
          )}
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

        <div className="setting-row setting-row-col">
          <div className="setting-row-top">
            <div className="setting-info">
              <span className="setting-icon">🗣️</span>
              <div>
                <strong className="setting-label">קול עברי</strong>
                <span className="setting-desc">הודעות בעברית בזמן משחק</span>
              </div>
            </div>
            <button
              className={`toggle-btn ${voiceEnabled ? 'toggle-on' : 'toggle-off'}`}
              onClick={toggleVoice}
            >
              {voiceEnabled ? 'פועל ✓' : 'כבוי ✗'}
            </button>
          </div>
          {voiceEnabled && (
            <div className="volume-row">
              <span className="volume-icon">🔈</span>
              <input
                type="range"
                className="volume-slider"
                min="0"
                max="1"
                step="0.05"
                value={voiceVolume}
                onChange={handleVoiceVolumeChange}
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

        {/* Hidden debug panel */}
        {debugOpen && (
          <div className="debug-panel">
            <div className="debug-panel-title">🛠 מצב פיתוח</div>
            <div className="debug-field">
              <label className="debug-label">⭐ כוכבים</label>
              <input
                type="number"
                className="debug-input"
                min="0"
                placeholder={String(totalStars)}
                value={debugStars}
                onChange={e => setDebugStars(e.target.value)}
              />
            </div>
            <div className="debug-field">
              <label className="debug-label">🎁 הפתעות זמינות</label>
              <input
                type="number"
                className="debug-input"
                min="0"
                placeholder="0"
                value={debugPresents}
                onChange={e => setDebugPresents(e.target.value)}
              />
            </div>
            <button className="debug-apply-btn" onClick={applyDebug}>
              {debugApplied ? '✓ יושם!' : 'החל'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
