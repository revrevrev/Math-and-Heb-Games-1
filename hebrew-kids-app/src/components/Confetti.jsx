import { useMemo, useEffect, useState } from 'react';
import './effects.css';

const COLORS = ['#ff6eb4','#fde047','#60a5fa','#4ade80','#fb923c','#c084fc','#f87171','#2dd4bf','#fff'];
const SHAPES = ['■','●','▲','★','♦','♥'];

export default function Confetti({ active }) {
  const [key, setKey] = useState(0);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (active) {
      setKey(k => k + 1);
      setShow(true);
    } else {
      setShow(false);
    }
  }, [active]);

  // Re-randomize particles each time key changes (i.e. each new burst)
  const particles = useMemo(() =>
    Array.from({ length: 32 }, (_, i) => ({
      id: i,
      left:     `${2 + Math.random() * 96}%`,
      color:    COLORS[i % COLORS.length],
      size:     `${9 + Math.random() * 13}px`,
      duration: `${0.7 + Math.random() * 1.4}s`,
      delay:    `${Math.random() * 0.5}s`,
      shape:    SHAPES[i % SHAPES.length],
    })),
    [key] // eslint-disable-line react-hooks/exhaustive-deps
  );

  if (!show) return null;

  return (
    <div className="confetti-container" aria-hidden>
      {particles.map(p => (
        <span
          key={p.id}
          className="confetti-piece"
          style={{
            left: p.left,
            color: p.color,
            fontSize: p.size,
            animationDuration: p.duration,
            animationDelay: p.delay,
          }}
        >
          {p.shape}
        </span>
      ))}
    </div>
  );
}
