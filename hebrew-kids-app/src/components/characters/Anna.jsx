// Anna – adventurous princess character (original SVG art)
export default function Anna({ size = 160, animate = false }) {
  return (
    <svg
      width={size} height={size * 1.4}
      viewBox="0 0 120 168"
      className={animate ? 'float' : ''}
      style={{ filter: 'drop-shadow(0 4px 12px rgba(252,211,77,0.5))' }}
    >
      {/* Hair – auburn, twin braids */}
      <ellipse cx="60" cy="30" rx="20" ry="22" fill="#c04a1a" />
      {/* Left braid */}
      <path d="M44 45 Q34 70 36 105 Q38 112 42 110 Q46 108 44 98 Q42 70 46 46"
        fill="#a83b14" stroke="#8b2e0e" strokeWidth="1" />
      {/* Right braid */}
      <path d="M76 45 Q86 70 84 105 Q82 112 78 110 Q74 108 76 98 Q78 70 74 46"
        fill="#a83b14" stroke="#8b2e0e" strokeWidth="1" />
      {/* Hair top */}
      <ellipse cx="60" cy="22" rx="18" ry="10" fill="#c04a1a" />

      {/* Headband / bow */}
      <ellipse cx="60" cy="18" rx="18" ry="4" fill="#2d8a4e" />
      <path d="M48 18 Q52 12 56 18 Q52 24 48 18Z" fill="#e8b432" />
      <path d="M72 18 Q68 12 64 18 Q68 24 72 18Z" fill="#e8b432" />
      <circle cx="60" cy="18" r="4" fill="#fbbf24" />

      {/* Face */}
      <ellipse cx="60" cy="38" rx="17" ry="19" fill="#fcd9b6" />
      {/* Freckles */}
      {[[52,38],[55,40],[65,38],[68,40],[57,43],[63,43]].map(([x,y],i) => (
        <circle key={i} cx={x} cy={y} r="1.2" fill="#c07840" opacity="0.55" />
      ))}
      {/* Eyes */}
      <ellipse cx="53" cy="34" rx="3.5" ry="4" fill="#3a8a3a" />
      <ellipse cx="67" cy="34" rx="3.5" ry="4" fill="#3a8a3a" />
      <circle  cx="52" cy="33" r="1.2" fill="white" />
      <circle  cx="66" cy="33" r="1.2" fill="white" />
      <ellipse cx="53" cy="35" rx="2" ry="2.5" fill="#1a5a1a" />
      <ellipse cx="67" cy="35" rx="2" ry="2.5" fill="#1a5a1a" />
      {/* Rosy cheeks */}
      <ellipse cx="46" cy="42" rx="5" ry="3" fill="#ff8fa0" opacity="0.45" />
      <ellipse cx="74" cy="42" rx="5" ry="3" fill="#ff8fa0" opacity="0.45" />
      {/* Nose */}
      <ellipse cx="60" cy="42" rx="1.5" ry="1" fill="#e0a880" />
      {/* Big smile */}
      <path d="M52 49 Q60 56 68 49" stroke="#c06050" strokeWidth="2" fill="none" strokeLinecap="round" />

      {/* Dress – teal + purple */}
      <path d="M42 56 Q36 82 32 132 L88 132 Q84 82 78 56 Q70 50 60 50 Q50 50 42 56Z"
        fill="#2d8a6e" />
      {/* Bodice detail */}
      <path d="M44 56 L60 64 L76 56 L72 72 L60 78 L48 72Z" fill="#1a6a52" />
      {/* Purple skirt overlay */}
      <path d="M40 90 Q36 110 32 132 L88 132 Q84 110 80 90Z"
        fill="#7c3a94" opacity="0.85" />
      {/* Skirt pattern dots */}
      {[[50,105],[60,115],[70,105],[45,120],[75,120]].map(([x,y],i) => (
        <circle key={i} cx={x} cy={y} r="2.5" fill="#a855f7" opacity="0.6" />
      ))}
      {/* Belt */}
      <rect x="38" y="86" width="44" height="7" rx="3" fill="#fbbf24" />

      {/* Arms */}
      <path d="M42 60 Q28 76 26 98" stroke="#2d8a6e" strokeWidth="10" strokeLinecap="round" fill="none" />
      <path d="M78 60 Q92 76 94 98" stroke="#2d8a6e" strokeWidth="10" strokeLinecap="round" fill="none" />
      <circle cx="26" cy="100" r="6" fill="#fcd9b6" />
      <circle cx="94" cy="100" r="6" fill="#fcd9b6" />

      {/* Boots */}
      <rect x="49" y="130" width="10" height="22" rx="4" fill="#4a2808" />
      <rect x="62" y="130" width="10" height="22" rx="4" fill="#4a2808" />
      <ellipse cx="54" cy="152" rx="9" ry="4" fill="#3a1e04" />
      <ellipse cx="67" cy="152" rx="9" ry="4" fill="#3a1e04" />
    </svg>
  );
}
