// Teletubby character – original colorful SVG art
// color: 'purple' | 'green' | 'yellow' | 'red'
const CONFIG = {
  purple: { body: '#a855f7', dark: '#7c3aed', light: '#d8b4fe', antenna: '#c084fc', name: 'טינקי' },
  green:  { body: '#22c55e', dark: '#15803d', light: '#86efac', antenna: '#4ade80', name: 'דיפסי' },
  yellow: { body: '#eab308', dark: '#a16207', light: '#fde047', antenna: '#fbbf24', name: 'לה-לה' },
  red:    { body: '#ef4444', dark: '#b91c1c', light: '#fca5a5', antenna: '#f87171', name: 'פו'    },
};

export default function Teletubby({ color = 'purple', size = 120, animate = false, screenContent = '❤️' }) {
  const c = CONFIG[color] || CONFIG.purple;
  return (
    <svg
      width={size} height={size * 1.25}
      viewBox="0 0 100 125"
      className={animate ? 'bounce' : ''}
      style={{ filter: `drop-shadow(0 4px 10px ${c.body}88)` }}
    >
      <defs>
        <style>{`
          .tele-blink     { animation: tele-blink 3.2s ease-in-out infinite; transform-origin: center; }
          .tele-antenna   { animation: tele-antenna-bob 1.8s ease-in-out infinite; transform-origin: 50px 20px; }
          .tele-body      { animation: tele-breathe 3s ease-in-out infinite; transform-origin: 50px 90px; }
          .tele-wave-l    { animation: tele-wave-l 2.2s ease-in-out infinite; transform-origin: 20px 76px; }
          .tele-wave-r    { animation: tele-wave-r 2.2s ease-in-out infinite 0.3s; transform-origin: 80px 76px; }
          .tele-screen    { animation: tele-screen-pulse 2s ease-in-out infinite; }
          .tele-feet      { animation: tele-tap 1.5s ease-in-out infinite alternate; transform-origin: 50px 126px; }
          @keyframes tele-blink {
            0%, 40%, 44%, 100% { transform: scaleY(1); }
            42% { transform: scaleY(0.08); }
          }
          @keyframes tele-antenna-bob {
            0%, 100% { transform: rotate(0deg); }
            25% { transform: rotate(-10deg); }
            75% { transform: rotate(10deg); }
          }
          @keyframes tele-breathe {
            0%, 100% { transform: scale(1) translateY(0); }
            50% { transform: scale(1.015) translateY(-1px); }
          }
          @keyframes tele-wave-l {
            0%, 100% { transform: rotate(0deg); }
            50% { transform: rotate(8deg); }
          }
          @keyframes tele-wave-r {
            0%, 100% { transform: rotate(0deg); }
            50% { transform: rotate(-8deg); }
          }
          @keyframes tele-screen-pulse {
            0%, 100% { opacity: 0.85; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.03); }
          }
          @keyframes tele-tap {
            0% { transform: rotate(-2deg); }
            100% { transform: rotate(2deg); }
          }
        `}</style>
      </defs>
      {/* Antenna – bobbing */}
      <g className="tele-antenna">
        <line x1="50" y1="6" x2="50" y2="20" stroke={c.dark} strokeWidth="3" strokeLinecap="round" />
        <circle cx="50" cy="5" r="5" fill={c.antenna} stroke={c.dark} strokeWidth="1.5" />
      </g>

      {/* Head */}
      <ellipse cx="50" cy="32" rx="24" ry="22" fill={c.body} />
      {/* Face panel */}
      <ellipse cx="50" cy="34" rx="16" ry="14" fill={c.light} opacity="0.9" />
      {/* Eyes – with blink */}
      <g className="tele-blink">
        <ellipse cx="43" cy="30" rx="4.5" ry="5" fill="white" />
        <ellipse cx="57" cy="30" rx="4.5" ry="5" fill="white" />
        <ellipse cx="44" cy="31" rx="2.8" ry="3.2" fill="#1e293b" />
        <ellipse cx="58" cy="31" rx="2.8" ry="3.2" fill="#1e293b" />
        <circle  cx="45" cy="30" r="1.1" fill="white" />
        <circle  cx="59" cy="30" r="1.1" fill="white" />
      </g>
      {/* Nose */}
      <ellipse cx="50" cy="37" rx="4" ry="3" fill={c.dark} />
      <ellipse cx="49" cy="36" rx="1.2" ry="1" fill="white" opacity="0.5" />
      {/* Big smile */}
      <path d="M40 42 Q50 50 60 42" stroke={c.dark} strokeWidth="2.5" fill="none" strokeLinecap="round" />

      {/* Body – rounded tubby shape (with breathing) */}
      <g className="tele-body">
      <ellipse cx="50" cy="82" rx="30" ry="36" fill={c.body} />
      {/* Tummy screen – pulsing */}
      <g className="tele-screen">}
      <rect x="34" y="66" width="32" height="28" rx="10" fill="white" />
      <rect x="36" y="68" width="28" height="24" rx="8" fill="#e0f2fe" />
      <text x="50" y="83" textAnchor="middle" fontSize="16" dominantBaseline="middle">
        {screenContent}
      </text>
      </g>{/* end screen */}

      {/* Arms – waving */}
      <g className="tele-wave-l">
        <ellipse cx="20" cy="76" rx="9" ry="18" fill={c.body} transform="rotate(-15 20 76)" />
        <circle cx="14" cy="91" r="7" fill={c.dark} />
      </g>
      <g className="tele-wave-r">
        <ellipse cx="80" cy="76" rx="9" ry="18" fill={c.body} transform="rotate(15 80 76)" />
        <circle cx="86" cy="91" r="7" fill={c.dark} />
      </g>

      {/* Legs */}
      <ellipse cx="40" cy="116" rx="11" ry="14" fill={c.body} />
      <ellipse cx="60" cy="116" rx="11" ry="14" fill={c.body} />
      {/* Feet – tapping */}
      <g className="tele-feet">
        <ellipse cx="38" cy="126" rx="13" ry="6" fill={c.dark} />
        <ellipse cx="62" cy="126" rx="13" ry="6" fill={c.dark} />
      </g>
      </g>{/* end tele-body */}
    </svg>
  );
}
