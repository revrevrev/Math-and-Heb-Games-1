/**
 * CharacterImg – shows a real character photo in a styled frame,
 * used inside all games as a mascot/encourager.
 *
 * character: 'elsa' | 'bluey' | 'anna' | 'teletubbies' | 'gabby' |
 *            'cakey' | 'kittyfairy' | 'marty' | 'pandy'
 * size:      pixel width (height is auto-derived from aspect ratio)
 * className: extra CSS classes forwarded to the wrapper (e.g. 'celebrate')
 */

const CHARS = {
  elsa: {
    src: '/images/elsa.jpg',
    alt: 'אלזה',
    pos: 'top center',
    aspect: 0.82,
  },
  gabby: {
    src: '/images/gabby-hero2.png',
    alt: 'גבי',
    pos: 'top center',
    aspect: 0.9,
  },
  cakey: {
    src: '/images/cakey-hero2.png',
    alt: 'קייקי',
    pos: 'top center',
    aspect: 0.9,
  },
  kittyfairy: {
    src: '/images/kittyfairy-hero.png',
    alt: 'קיטי פיה',
    pos: 'top center',
    aspect: 0.9,
  },
  marty: {
    src: '/images/marty-the-party-cat-hero3.png',
    alt: 'מארטי',
    pos: 'top center',
    aspect: 0.9,
  },
  pandy: {
    src: '/images/pandy-hero2.png',
    alt: 'פנדי',
    pos: 'top center',
    aspect: 0.9,
  },
  bluey: {
    src: '/images/Bluey.png',
    alt: 'בלואי',
    pos: 'top center',
    aspect: 0.88,
  },
  mickey: {
    src: '/images/Mickey2.jpg',
    alt: 'מיקי מאוס',
    pos: 'top center',
    aspect: 1.0,
  },
  minnie: {
    src: '/images/minnie-mouse_1.jpg',
    alt: 'מיני מאוס',
    pos: 'top center',
    aspect: 1.0,
  },
  teletubbies: {
    src: '/images/teletubbies.jpg',
    alt: 'הטלטאביז',
    pos: 'center 8%',
    aspect: 1.9,
  },
  zohar: {
    src: '/images/זהר לא הספקתי.jpg',
    alt: 'זוהר',
    pos: 'top center',
    aspect: 0.9,
  },
};

export default function CharacterImg({ character = 'elsa', size = 90, className = '' }) {
  const c = CHARS[character] || CHARS.elsa;
  const w = size;
  const h = Math.round(size / c.aspect);

  return (
    <div
      className={`char-img-frame ${className}`}
      style={{ width: w, height: h }}
    >
      <img
        src={c.src}
        alt={c.alt}
        style={{ objectPosition: c.pos }}
        draggable={false}
      />
    </div>
  );
}
