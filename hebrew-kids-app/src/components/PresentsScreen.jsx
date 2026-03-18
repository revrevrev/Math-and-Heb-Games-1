import { useState, useCallback, useEffect, useRef } from 'react';
import { PRESENT_SOURCES, STARS_PER_PRESENT } from '../utils/presentsConfig';
import { Sounds } from '../utils/sounds';
import './PresentsScreen.css';

const CLAIMS_KEY = 'hebrew-app-presents-claimed';

function getClaimedCount() {
  return parseInt(localStorage.getItem(CLAIMS_KEY) || '0', 10);
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function getAvailablePresents(totalStars) {
  const earned  = Math.floor(totalStars / STARS_PER_PRESENT);
  const claimed = getClaimedCount();
  return Math.max(0, earned - claimed);
}

// ── YouTube IFrame API loader ─────────────────────────────────
function loadYouTubeAPI(callback) {
  if (window.YT && window.YT.Player) {
    callback();
    return;
  }
  if (!window._ytReadyCallbacks) {
    window._ytReadyCallbacks = [];
    window.onYouTubeIframeAPIReady = () => {
      window._ytReadyCallbacks.forEach(cb => cb());
      window._ytReadyCallbacks = [];
    };
  }
  window._ytReadyCallbacks.push(callback);
  if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(tag);
  }
}

// ── YouTube shuffled playlist player ─────────────────────────
// Uses a tiny hidden player to fetch the playlist video IDs,
// picks one at random, then shows it as a plain single-video
// iframe — no playlist panel, no skip controls.
function YouTubeShufflePlayer({ playlistId }) {
  const [videoId, setVideoId] = useState(null);
  const [failed,  setFailed]  = useState(false);
  const hiddenRef = useRef(null);

  useEffect(() => {
    let player   = null;
    let disposed = false;

    loadYouTubeAPI(() => {
      if (disposed || !hiddenRef.current) return;
      player = new window.YT.Player(hiddenRef.current, {
        width: '1', height: '1',
        playerVars: {
          listType: 'playlist',
          list: playlistId,
          autoplay: 0,
        },
        events: {
          onReady(e) {
            const p = e.target;
            p.setShuffle(true);
            // Wait for shuffle + playlist metadata to settle
            setTimeout(() => {
              if (disposed) return;
              const list = p.getPlaylist();
              if (list && list.length > 0) {
                setVideoId(list[Math.floor(Math.random() * list.length)]);
              } else {
                setFailed(true);
              }
              try { p.destroy(); } catch (_) { /* ignore */ }
            }, 600);
          },
          onError() { if (!disposed) setFailed(true); },
        },
      });
    });

    return () => {
      disposed = true;
      try { player?.destroy(); } catch (_) { /* ignore */ }
    };
  }, [playlistId]);

  // Hidden bootstrap div — must stay in DOM until IDs are fetched
  return (
    <>
      <div ref={hiddenRef} style={{ position: 'fixed', left: '-9999px', width: 1, height: 1 }} />
      {videoId ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&playsinline=1`}
          className="presents-iframe"
          title="סרטון"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      ) : failed ? (
        <div className="presents-loading">⚠️ לא ניתן לטעון</div>
      ) : (
        <div className="presents-loading">⏳ טוען סרטון...</div>
      )}
    </>
  );
}

// ── Per-source video player ───────────────────────────────────
function VideoPlayer({ source }) {
  if (source.type === 'youtube-video') {
    return (
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${source.id}?autoplay=1&rel=0&playsinline=1`}
        className="presents-iframe"
        title={source.title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    );
  }

  if (source.type === 'youtube-playlist') {
    return <YouTubeShufflePlayer playlistId={source.id} />;
  }

  if (source.type === 'google-photos') {
    return (
      <div className="presents-photos-open">
        <div className="presents-photos-icon">📸</div>
        <p className="presents-photos-msg">{source.title}</p>
        <button
          className="presents-open-external-big"
          onClick={() => window.open(source.url, '_blank', 'noopener,noreferrer')}
        >
          פתחי את האלבום ‹
        </button>
      </div>
    );
  }

  return null;
}

// ── Main screen ───────────────────────────────────────────────
export default function PresentsScreen({ onBack, totalStars }) {
  const [claimed, setClaimed]             = useState(getClaimedCount);
  const [currentSource, setCurrentSource] = useState(null);
  const [opening, setOpening]             = useState(false);

  // Hidden debug: long-press title → opens a random video without claiming a present

  const titlePressRef = useRef(null);
  function onTitlePointerDown() {
    titlePressRef.current = setTimeout(() => setCurrentSource(pickRandom(PRESENT_SOURCES)), 700);
  }
  function onTitlePointerUp() {
    clearTimeout(titlePressRef.current);
  }

  const earned      = Math.floor(totalStars / STARS_PER_PRESENT);
  const available   = Math.max(0, earned - claimed);
  const starsToNext = STARS_PER_PRESENT - (totalStars % STARS_PER_PRESENT);
  const progressPct = ((totalStars % STARS_PER_PRESENT) / STARS_PER_PRESENT) * 100;

  const openPresent = useCallback(() => {
    if (available <= 0 || PRESENT_SOURCES.length === 0 || opening) return;
    Sounds.star();
    setOpening(true);
    setTimeout(() => {
      const newClaimed = claimed + 1;
      localStorage.setItem(CLAIMS_KEY, String(newClaimed));
      setClaimed(newClaimed);
      setCurrentSource(pickRandom(PRESENT_SOURCES));
      setOpening(false);
    }, 700);
  }, [available, claimed, opening]);

  const closeVideo = useCallback(() => setCurrentSource(null), []);

  return (
    <div className="presents-screen">

      {/* Header */}
      <header className="presents-header">
        <button className="presents-back-btn" onClick={onBack} aria-label="חזרה">
          ‹ חזרה
        </button>
        <h1
          className="presents-title"
          onPointerDown={onTitlePointerDown}
          onPointerUp={onTitlePointerUp}
          onPointerLeave={onTitlePointerUp}
          style={{ userSelect: 'none' }}
        >🎁 ההפתעות שלי</h1>
        <div className="presents-header-spacer" />
      </header>

      {/* Stars progress */}
      <section className="presents-progress-section">
        <div className="presents-stars-row">
          <span className="presents-stars-icon">⭐</span>
          <span className="presents-stars-num">{totalStars}</span>
          <span className="presents-stars-label">כוכבים</span>
        </div>
        <div className="presents-progress-wrap">
          <div className="presents-progress-bar" style={{ width: `${progressPct}%` }} />
        </div>
        {starsToNext !== STARS_PER_PRESENT && (
          <p className="presents-progress-hint">{`עוד ${starsToNext} כוכבים להפתעה הבאה`}</p>
        )}
      </section>

      {/* Main area — gift GIF is the button */}
      <section className="presents-main">
        {available > 0 ? (
          <>
            <button
              className={`presents-gift-btn ${opening ? 'opening' : ''}`}
              onClick={openPresent}
              disabled={opening}
              aria-label="פתחי הפתעה"
            >
              <img
                src="/images/01-08-00-669_512.webp"
                alt="הפתעה"
                className="presents-gift-img"
                draggable={false}
              />
              {opening && (
                <div className="presents-sparkles" aria-hidden>
                  {['✨','⭐','🌟','💫','🎉','🎊'].map((s, i) => (
                    <span key={i} className="sparkle" style={{ '--i': i }}>{s}</span>
                  ))}
                </div>
              )}
            </button>
            <p className="presents-available-msg">
              {available === 1
                ? <>איזה כיף. קיבלת הפתעה! 🎉</>
                : <>וואו, יש לך כבר <strong>{available}</strong> הפתעות! 🎉</>}
            </p>
          </>
        ) : (
          <>
            <div className="presents-locked-wrap">
              <img
                src="/images/01-08-00-669_512.webp"
                alt="הפתעה נעולה"
                className="presents-gift-img presents-gift-locked"
                draggable={false}
              />
              <div className="presents-lock-icon">🔒</div>
            </div>
            <p className="presents-locked-msg">
              אספי עוד {starsToNext} כוכבים<br />כדי לפתוח הפתעה!
            </p>
          </>
        )}
      </section>

      {/* Video overlay — TV frame */}
      {currentSource && (
        <div className="presents-video-overlay" onClick={closeVideo}>
          <div className="presents-tv-body" onClick={e => e.stopPropagation()}>
            {/* Antennas */}
            <div className="presents-tv-antennas" aria-hidden>
              <div className="presents-tv-antenna presents-tv-antenna-l" />
              <div className="presents-tv-antenna presents-tv-antenna-r" />
            </div>
            {/* Screen bezel */}
            <div className="presents-tv-screen">
              <button className="presents-video-close" onClick={closeVideo} aria-label="סגרי">✕</button>
              <VideoPlayer source={currentSource} />
            </div>
            {/* Bottom controls decoration */}
            <div className="presents-tv-controls" aria-hidden>
              <div className="presents-tv-knob" />
              <div className="presents-tv-knob" />
              <div className="presents-tv-speaker">
                {Array.from({ length: 9 }).map((_, i) => <span key={i} className="presents-tv-dot" />)}
              </div>
              <div className="presents-tv-knob" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
