// Elsa – ice princess character (original SVG art)
export default function Elsa({ size = 160, animate = false }) {
  return (
    <svg
      width={size} height={size * 1.4}
      viewBox="0 0 120 168"
      className={animate ? 'float' : ''}
      style={{ filter: 'drop-shadow(0 4px 12px rgba(165,243,252,0.6))' }}
    >
      {/* Snowflake crown */}
      <g transform="translate(60,14)">
        {[0,60,120,180,240,300].map(a => (
          <line key={a}
            x1="0" y1="-10" x2="0" y2="-18"
            stroke="#e0f7ff" strokeWidth="2.5" strokeLinecap="round"
            transform={`rotate(${a})`}
          />
        ))}
        <circle cx="0" cy="0" r="4" fill="#a5f3fc" stroke="#fff" strokeWidth="1.5" />
      </g>

      {/* Hair – platinum blonde braid */}
      <ellipse cx="60" cy="30" rx="20" ry="22" fill="#f5e6b0" />
      {/* braid down right side */}
      <path d="M72 40 Q80 70 74 100 Q70 110 66 108 Q62 106 64 96 Q68 70 66 44"
        fill="#f0dc8c" stroke="#d4b83a" strokeWidth="1" />
      {/* braid loops */}
      {[55,65,75,85].map(y => (
        <ellipse key={y} cx="71" cy={y} rx="5" ry="3.5" fill="#e8ce7a" opacity="0.7" />
      ))}

      {/* Face */}
      <ellipse cx="60" cy="38" rx="17" ry="19" fill="#fce8d0" />
      {/* Eyes */}
      <ellipse cx="53" cy="34" rx="3.5" ry="4" fill="#4db6d0" />
      <ellipse cx="67" cy="34" rx="3.5" ry="4" fill="#4db6d0" />
      <circle  cx="52" cy="33" r="1.2" fill="white" />
      <circle  cx="66" cy="33" r="1.2" fill="white" />
      <ellipse cx="53" cy="35" rx="2" ry="2.5" fill="#1a6a88" />
      <ellipse cx="67" cy="35" rx="2" ry="2.5" fill="#1a6a88" />
      {/* Rosy cheeks */}
      <ellipse cx="47" cy="41" rx="4" ry="2.5" fill="#ffb3b3" opacity="0.5" />
      <ellipse cx="73" cy="41" rx="4" ry="2.5" fill="#ffb3b3" opacity="0.5" />
      {/* Nose */}
      <ellipse cx="60" cy="42" rx="1.5" ry="1" fill="#e8c4a0" />
      {/* Smile */}
      <path d="M53 48 Q60 54 67 48" stroke="#c97a6a" strokeWidth="1.8" fill="none" strokeLinecap="round" />

      {/* Ice-blue dress body */}
      <path d="M42 56 Q38 80 34 130 L86 130 Q82 80 78 56 Q72 52 60 52 Q48 52 42 56Z"
        fill="#5bb8d4" />
      <path d="M42 56 Q38 80 34 130 L50 130 Q48 80 46 56Z"
        fill="#4aa8c4" opacity="0.5" />
      {/* Dress sparkles */}
      {[[50,75],[68,85],[55,100],[72,110]].map(([x,y],i) => (
        <g key={i} transform={`translate(${x},${y})`}>
          <line x1="0" y1="-5" x2="0" y2="5" stroke="white" strokeWidth="1" opacity="0.7" />
          <line x1="-5" y1="0" x2="5" y2="0" stroke="white" strokeWidth="1" opacity="0.7" />
        </g>
      ))}
      {/* Bodice / collar */}
      <path d="M48 56 Q60 62 72 56" stroke="#a5f3fc" strokeWidth="2" fill="none" />
      {/* Dress bottom frill */}
      <path d="M34 130 Q44 138 54 130 Q64 138 74 130 Q80 138 86 130"
        stroke="#a5f3fc" strokeWidth="2.5" fill="none" strokeLinecap="round" />

      {/* Arms */}
      <path d="M42 60 Q30 75 28 95" stroke="#5bb8d4" strokeWidth="10" strokeLinecap="round" fill="none" />
      <path d="M78 60 Q90 75 92 95" stroke="#5bb8d4" strokeWidth="10" strokeLinecap="round" fill="none" />
      {/* Hands */}
      <circle cx="28" cy="97" r="6" fill="#fce8d0" />
      <circle cx="92" cy="97" r="6" fill="#fce8d0" />
      {/* Ice magic from hand */}
      {[[-6,-6],[-10,-2],[-6,2]].map(([dx,dy],i) => (
        <circle key={i} cx={28+dx} cy={97+dy} r="2" fill="#a5f3fc" opacity="0.8" />
      ))}

      {/* Legs / shoes */}
      <rect x="50" y="128" width="9" height="22" rx="4" fill="#3a8ea8" />
      <rect x="63" y="128" width="9" height="22" rx="4" fill="#3a8ea8" />
      <ellipse cx="54" cy="150" rx="8" ry="4" fill="#2a6e88" />
      <ellipse cx="68" cy="150" rx="8" ry="4" fill="#2a6e88" />
    </svg>
  );
}
