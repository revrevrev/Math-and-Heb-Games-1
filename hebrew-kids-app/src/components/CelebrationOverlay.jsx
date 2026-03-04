import { useEffect, useRef, useState } from 'react';
import CharacterImg from './CharacterImg';
import './effects.css';

const PRAISES = ['מצוין! 🌟', 'כל הכבוד! 🎉', 'נהדר! ✨', 'מדהים! 🏆', 'יופי! 💫', 'וואו! 🌈'];

export default function CelebrationOverlay({ active, character }) {
  const [visible, setVisible]   = useState(false);
  const [starKey, setStarKey]   = useState(0);
  const [praise, setPraise]     = useState(PRAISES[0]);
  const timerRef                = useRef(null);

  useEffect(() => {
    if (!active) return;
    clearTimeout(timerRef.current);
    setPraise(PRAISES[Math.floor(Math.random() * PRAISES.length)]);
    setStarKey(k => k + 1);
    setVisible(true);
    timerRef.current = setTimeout(() => setVisible(false), 1300);
  }, [active]);

  // Cleanup timer on unmount
  useEffect(() => () => clearTimeout(timerRef.current), []);

  return (
    <>
      {/* Flying star — fires on each correct trigger */}
      {active && (
        <div key={starKey} className="star-fly-wrap" aria-hidden>
          <div className="star-fly">⭐</div>
        </div>
      )}

      {/* Compact banner — slides down from top, doesn't cover game content */}
      {visible && (
        <div className="celebrate-overlay" aria-hidden>
          <CharacterImg character={character} size={52} className="celebrate" />
          <div className="celebrate-overlay-text">{praise}</div>
        </div>
      )}
    </>
  );
}
