import { useState } from 'react';
import CharacterImg from './CharacterImg';
import './ProfileScreen.css';

const PROFILE_KEY = 'hebrew-app-profile';

export function getProfile() {
  try { return JSON.parse(localStorage.getItem(PROFILE_KEY) || '{}'); }
  catch { return {}; }
}

function saveProfile(p) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
}

const AVATARS = [
  { id: 'gabby',      label: 'גבי' },
  { id: 'cakey',      label: 'קייקי' },
  { id: 'kittyfairy', label: 'קיטי פיה' },
  { id: 'marty',      label: 'מארטי' },
  { id: 'pandy',      label: 'פנדי' },
  { id: 'elsa',       label: 'אלזה' },
  { id: 'bluey',      label: 'בלואי' },
  { id: 'anna',       label: 'אנה' },
];

export default function ProfileScreen({ onBack }) {
  const initial = getProfile();
  const [name, setName]     = useState(initial.name   || '');
  const [avatar, setAvatar] = useState(initial.avatar || 'gabby');
  const [saved, setSaved]   = useState(false);

  function handleSave() {
    saveProfile({ name: name.trim(), avatar });
    setSaved(true);
    setTimeout(() => { setSaved(false); onBack(); }, 800);
  }

  return (
    <div className="profile-screen">
      <div className="profile-top-bar">
        <button className="profile-back-btn" onClick={onBack}>🏠 בית</button>
        <h2 className="profile-title">👤 הפרופיל שלי</h2>
      </div>

      <div className="profile-body">
        {/* Current avatar preview */}
        <div className="profile-avatar-preview">
          <CharacterImg character={avatar} size={110} className="heartbeat" />
          <p className="profile-avatar-name">{AVATARS.find(a => a.id === avatar)?.label}</p>
        </div>

        {/* Name input */}
        <div className="profile-name-section">
          <label className="profile-name-label">השם שלי:</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="הכניסי את שמך..."
            className="profile-name-input"
            maxLength={20}
          />
        </div>

        {/* Avatar grid */}
        <p className="profile-choose-label">בחרי דמות:</p>
        <div className="avatar-grid">
          {AVATARS.map(a => (
            <button
              key={a.id}
              className={`avatar-option ${avatar === a.id ? 'avatar-selected' : ''}`}
              onClick={() => setAvatar(a.id)}
            >
              <CharacterImg character={a.id} size={58} />
              <span className="avatar-option-label">{a.label}</span>
            </button>
          ))}
        </div>

        <button
          className={`profile-save-btn ${saved ? 'saved' : ''}`}
          onClick={handleSave}
        >
          {saved ? '✓ נשמר!' : 'שמרי ✓'}
        </button>
      </div>
    </div>
  );
}
