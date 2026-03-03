// Bluey – blue heeler puppy (original SVG art)
export default function Bluey({ size = 140, animate = false }) {
  return (
    <svg
      width={size} height={size * 1.1}
      viewBox="0 0 120 132"
      className={animate ? 'bounce' : ''}
      style={{ filter: 'drop-shadow(0 4px 12px rgba(96,165,250,0.5))' }}
    >
      {/* Ears */}
      <ellipse cx="30" cy="30" rx="16" ry="22" fill="#3b82f6" transform="rotate(-15 30 30)" />
      <ellipse cx="90" cy="30" rx="16" ry="22" fill="#3b82f6" transform="rotate(15 90 30)" />
      <ellipse cx="30" cy="30" rx="10" ry="15" fill="#1e3a5f" transform="rotate(-15 30 30)" />
      <ellipse cx="90" cy="30" rx="10" ry="15" fill="#1e3a5f" transform="rotate(15 90 30)" />

      {/* Head */}
      <ellipse cx="60" cy="48" rx="32" ry="30" fill="#60a5fa" />
      {/* Blue heeler markings */}
      <ellipse cx="60" cy="42" rx="22" ry="18" fill="#93c5fd" />
      {/* Snout */}
      <ellipse cx="60" cy="58" rx="16" ry="12" fill="#e8d5b7" />
      {/* Nose */}
      <ellipse cx="60" cy="54" rx="6" ry="4.5" fill="#1e293b" />
      <ellipse cx="58" cy="53" rx="2" ry="1.5" fill="white" opacity="0.6" />
      {/* Nostrils */}
      <circle cx="57" cy="55" r="1.5" fill="#0f172a" />
      <circle cx="63" cy="55" r="1.5" fill="#0f172a" />

      {/* Eyes */}
      <ellipse cx="46" cy="44" rx="7" ry="8" fill="white" />
      <ellipse cx="74" cy="44" rx="7" ry="8" fill="white" />
      <ellipse cx="47" cy="45" rx="5" ry="6" fill="#1c3a6e" />
      <ellipse cx="75" cy="45" rx="5" ry="6" fill="#1c3a6e" />
      <circle  cx="48" cy="43" r="2" fill="white" />
      <circle  cx="76" cy="43" r="2" fill="white" />
      {/* Eyebrows */}
      <path d="M40 37 Q47 33 53 37" stroke="#1e3a5f" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M67 37 Q74 33 80 37" stroke="#1e3a5f" strokeWidth="2.5" fill="none" strokeLinecap="round" />

      {/* Happy mouth */}
      <path d="M50 64 Q60 72 70 64" stroke="#9a5a30" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      {/* Tongue */}
      <ellipse cx="60" cy="68" rx="7" ry="5" fill="#f87171" />
      <line x1="60" y1="65" x2="60" y2="72" stroke="#e05060" strokeWidth="1.5" />

      {/* Body */}
      <ellipse cx="60" cy="100" rx="28" ry="26" fill="#3b82f6" />
      {/* Tummy */}
      <ellipse cx="60" cy="102" rx="18" ry="18" fill="#93c5fd" />
      {/* Orange spots on back */}
      <circle cx="40" cy="88"  r="5"   fill="#fb923c" />
      <circle cx="80" cy="90"  r="4"   fill="#fb923c" />
      <circle cx="72" cy="80"  r="3.5" fill="#fb923c" />

      {/* Front legs */}
      <rect x="40" y="118" width="14" height="20" rx="7" fill="#3b82f6" />
      <rect x="66" y="118" width="14" height="20" rx="7" fill="#3b82f6" />
      {/* Paws */}
      <ellipse cx="47" cy="138" rx="9"  ry="5.5" fill="#2563eb" />
      <ellipse cx="73" cy="138" rx="9"  ry="5.5" fill="#2563eb" />
      {/* Toe lines */}
      {[-4,0,4].map((d,i) => (
        <line key={i} x1={47+d} y1="134" x2={47+d} y2="140" stroke="#1d4ed8" strokeWidth="1" />
      ))}
      {[-4,0,4].map((d,i) => (
        <line key={i} x1={73+d} y1="134" x2={73+d} y2="140" stroke="#1d4ed8" strokeWidth="1" />
      ))}

      {/* Tail */}
      <path d="M88 98 Q108 78 102 62" stroke="#3b82f6" strokeWidth="9" strokeLinecap="round" fill="none" />
      <path d="M88 98 Q108 78 102 62" stroke="#60a5fa" strokeWidth="5" strokeLinecap="round" fill="none" />
    </svg>
  );
}
