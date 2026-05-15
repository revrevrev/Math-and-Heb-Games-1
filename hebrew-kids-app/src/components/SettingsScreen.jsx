import { useState, useRef } from 'react';
import { Sounds } from '../utils/sounds';
import { resetAllProgress } from '../utils/achievements';
import { STARS_PER_PRESENT } from '../utils/presentsConfig';
import { getMatchIncidents, clearMatchIncidents } from '../utils/speechRecognition';
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

  // ── STT incident log viewer ───────────────────────────────
  const [incidents, setIncidents] = useState(null); // null = not loaded yet
  const [copied, setCopied] = useState(false);

  function loadIncidents() {
    setIncidents(getMatchIncidents());
  }

  function handleClearIncidents() {
    clearMatchIncidents();
    setIncidents([]);
  }

  function handleCopyIncidents() {
    const data = getMatchIncidents();
    const text = JSON.stringify(data, null, 2);
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }).catch(() => {
      // Fallback: open in new window
      const w = window.open('', '_blank');
      if (w) { w.document.write('<pre>' + text + '</pre>'); }
    });
  }

  // ── Hidden debug panel ────────────────────────────────────
  const [debugOpen, setDebugOpen]         = useState(false);
  const [debugStars, setDebugStars]       = useState('');
  const [debugPresents, setDebugPresents] = useState('');
  const [debugApplied, setDebugApplied]   = useState(false);
  const [lastAppliedStars, setLastAppliedStars] = useState(null);

  // Current live state (re-read from localStorage when panel opens)
  const currentClaimed   = parseInt(localStorage.getItem(CLAIMS_KEY) || '0', 10);
  const currentEarned    = Math.floor(totalStars / STARS_PER_PRESENT);
  const currentAvailable = Math.max(0, currentEarned - currentClaimed);

  // Live preview: stars-to-next-present based on whatever is typed (or current)
  const previewStars     = debugStars !== '' ? Math.max(0, parseInt(debugStars, 10) || 0) : totalStars;
  const previewMod       = previewStars % STARS_PER_PRESENT;
  const previewToNext    = previewMod === 0 ? STARS_PER_PRESENT : STARS_PER_PRESENT - previewMod;

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

    const newEarned = Math.floor(effectiveStars / STARS_PER_PRESENT);

    if (Number.isFinite(parsedPresents) && parsedPresents >= 0) {
      // Ensure stars are high enough to "earn" the requested presents
      const minStars = parsedPresents * STARS_PER_PRESENT;
      if (effectiveStars < minStars) effectiveStars = minStars;
      const earned  = Math.floor(effectiveStars / STARS_PER_PRESENT);
      const claimed = Math.max(0, earned - parsedPresents);
      localStorage.setItem(CLAIMS_KEY, String(claimed));
    } else {
      // Stars-only change: cap claimed to newEarned so stale high-claimed values
      // from previous debug sessions don't make available appear negative/zero.
      const prevClaimed = parseInt(localStorage.getItem(CLAIMS_KEY) || '0', 10);
      if (prevClaimed > newEarned) {
        localStorage.setItem(CLAIMS_KEY, String(newEarned));
      }
    }

    localStorage.setItem('hebrew-app-stars', String(effectiveStars));
    onDebugSetStars(effectiveStars);
    setLastAppliedStars(effectiveStars);
    setDebugStars('');
    setDebugPresents('');
    setDebugApplied(true);
    setTimeout(() => setDebugApplied(false), 3000);
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

        {/* Build timestamp */}
        <div className="settings-build-stamp">
          גרסה: {new Date(__BUILD_TIME__).toLocaleString('he-IL')}
        </div>

        {/* Hidden debug panel */}
        {debugOpen && (
          <div className="debug-panel">
            <div className="debug-panel-title">🛠 מצב פיתוח</div>

            {/* Current state readout */}
            <div className="debug-current-state">
              <span>מצב נוכחי: ⭐ {totalStars} כוכבים &nbsp;|&nbsp; 🎁 {currentAvailable} הפתעות זמינות</span>
            </div>

            <div className="debug-field">
              <label className="debug-label">⭐ כוכבים</label>
              <input
                type="number"
                className="debug-input"
                min="0"
                placeholder={String(totalStars)}
                value={debugStars}
                onChange={e => { setDebugStars(e.target.value); setDebugApplied(false); setLastAppliedStars(null); }}
              />
            </div>
            {/* Live: stars needed for next present */}
            <div className="debug-hint">
              עוד <strong>{previewToNext}</strong> כוכבים להפתעה הבאה
              {debugStars !== '' && parseInt(debugStars, 10) !== totalStars && (
                <span className="debug-hint-preview"> (לאחר שינוי)</span>
              )}
            </div>

            <div className="debug-field">
              <label className="debug-label">🎁 הפתעות זמינות</label>
              <input
                type="number"
                className="debug-input"
                min="0"
                placeholder={String(currentAvailable)}
                value={debugPresents}
                onChange={e => { setDebugPresents(e.target.value); setDebugApplied(false); setLastAppliedStars(null); }}
              />
            </div>

            <button className="debug-apply-btn" onClick={applyDebug}>
              {debugApplied ? '✓ יושם!' : 'החל'}
            </button>

            {/* Post-apply summary */}
            {debugApplied && lastAppliedStars !== null && (() => {
              const mod     = lastAppliedStars % STARS_PER_PRESENT;
              const toNext  = mod === 0 ? STARS_PER_PRESENT : STARS_PER_PRESENT - mod;
              const newClaimed  = parseInt(localStorage.getItem(CLAIMS_KEY) || '0', 10);
              const newEarned   = Math.floor(lastAppliedStars / STARS_PER_PRESENT);
              const newAvail    = Math.max(0, newEarned - newClaimed);
              return (
                <div className="debug-applied-summary">
                  ✓ עודכן: ⭐ {lastAppliedStars} כוכבים, 🎁 {newAvail} זמינות<br />
                  עוד <strong>{toNext}</strong> כוכבים להפתעה הבאה
                </div>
              );
            })()}

            {/* STT match-failure incident log */}
            <div className="debug-incidents-section">
              <div className="debug-incidents-header">
                <span className="debug-incidents-title">🎤 תקלות זיהוי דיבור</span>
                <div className="debug-incidents-btns">
                  <button className="debug-incidents-btn" onClick={loadIncidents}>טען</button>
                  <button className="debug-incidents-btn" onClick={handleCopyIncidents}>
                    {copied ? '✓ הועתק' : 'העתק'}
                  </button>
                  <button className="debug-incidents-btn debug-incidents-btn-danger" onClick={handleClearIncidents}>נקה</button>
                </div>
              </div>

              {incidents !== null && (
                incidents.length === 0
                  ? <div className="debug-incidents-empty">אין תקלות שמורות</div>
                  : <div className="debug-incidents-list">
                      {[...incidents].reverse().map((inc, i) => (
                        <div key={i} className="debug-incident">
                          <div className="debug-incident-time">{new Date(inc.t).toLocaleString('he-IL')}</div>
                          <div className="debug-incident-row">
                            <span className="debug-incident-label">מטרה:</span>
                            <span className="debug-incident-word">{inc.tRaw}</span>
                            <span className="debug-incident-cps">[{inc.tCPs.join(' ')}]</span>
                            {inc.tNrm !== inc.tRaw && (
                              <span className="debug-incident-norm">→ {inc.tNrm} [{inc.tNCPs.join(' ')}]</span>
                            )}
                          </div>
                          {inc.alts.map((a, j) => (
                            <div key={j} className="debug-incident-row">
                              <span className="debug-incident-label">שמעתי:</span>
                              <span className="debug-incident-word">{a.raw}</span>
                              <span className="debug-incident-cps">[{a.cps.join(' ')}]</span>
                              {a.nrm !== a.raw && (
                                <span className="debug-incident-norm">→ {a.nrm} [{a.ncps.join(' ')}]</span>
                              )}
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
