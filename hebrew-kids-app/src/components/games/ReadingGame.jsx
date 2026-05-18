import { useState, useEffect, useRef } from 'react';
import GameShell from '../GameShell';
import CharacterImg from '../CharacterImg';
import GameEffects from '../GameEffects';
import { Sounds } from '../../utils/sounds';
import { SpeechRecognitionUtil, saveMatchIncident } from '../../utils/speechRecognition';
import { unlockAchievement, recordGamePlayed } from '../../utils/achievements';
import './ReadingGame.css';

// ── Word pool: simple Hebrew words (no nikud) ─────────────────────────────────
const WORD_POOL = [
  // 2-letter words
  { word: 'ים'  },
  { word: 'דג'  },
  { word: 'אש'  },
  { word: 'גן'  },
  { word: 'בת'  },
  { word: 'בן'  },
  { word: 'צב'  },
  { word: 'אח'  },
  // 3-letter words
  { word: 'שמש' },
  { word: 'פרח' },
  { word: 'אבא' },
  { word: 'אמא' },
  { word: 'גזר' },
  { word: 'לחם' },
  { word: 'קטן' },
// 4-letter words - future expansion
//  { word: 'גדול' },
//  { word: 'פרפר' },
//  { word: 'בלון' },
];

const ROUNDS      = 10;
const MAX_RETRIES = 3;

function pickWords() {
  return [...WORD_POOL].sort(() => Math.random() - 0.5).slice(0, ROUNDS);
}

export default function ReadingGame({ onBack, onAddStars }) {
  const [words]   = useState(pickWords);
  const [round,    setRound]    = useState(0);
  const [done,     setDone]     = useState(false);
  const [score,    setScore]    = useState(0);
  const [flash,    setFlash]    = useState(false);
  const [wordAnim, setWordAnim] = useState('pop-in');
  const [wordBlink, setWordBlink] = useState(false);

  // Speech recognition state
  const [speechAvail,    setSpeechAvail]    = useState(() => SpeechRecognitionUtil.isAvailable());
  const [listenState,    setListenState]    = useState('idle');
  // 'idle' | 'listening' | 'correct' | 'wrong' | 'skipped'
  const [retries,        setRetries]        = useState(0);
  const [lastTranscript, setLastTranscript] = useState('');
  const [liveTranscript, setLiveTranscript] = useState('');

  const roundRef = useRef(round);
  const scoreRef = useRef(score);
  const wordsRef = useRef(words);
  roundRef.current = round;
  scoreRef.current = score;

  const current = words[round];

  useEffect(() => {
    Sounds.startMusic('readgame');
    recordGamePlayed('readgame');
    return () => {
      Sounds.stopMusic();
      SpeechRecognitionUtil.stopListening();
    };
  }, []);

  useEffect(() => {
    if (done && score === ROUNDS) unlockAchievement('perfect_game');
  }, [done, score]);

  // ── Advance to next word ──────────────────────────────────────────────────
  function advanceWord(currentRound, currentScore) {
    const next = currentRound + 1;
    if (next >= ROUNDS) {
      setTimeout(() => {
        Sounds.star();
        setDone(true);
      }, 500);
    } else {
      setWordAnim('pop-out');
      setTimeout(() => {
        setRound(next);
        setRetries(0);
        setLastTranscript('');
        setLiveTranscript('');
        setListenState('idle');
        setWordBlink(false);
        setWordAnim('pop-in');
      }, 300);
    }
  }

  // ── Handlers ──────────────────────────────────────────────────────────────
  function handleCorrect() {
    SpeechRecognitionUtil.stopListening();
    const word = wordsRef.current[roundRef.current].word;

    setListenState('correct');
    setFlash(true);
    setWordBlink(true);

    const newScore = scoreRef.current + 1;
    setScore(newScore);
    onAddStars(1);

    // Sequence: ding SFX → speak word → praise voice → advance
    Sounds.correctSfxOnly();
    Sounds.speak(word, 300, () => {
      Sounds.praiseVoice(150, () => {
        setFlash(false);
        setWordBlink(false);
        advanceWord(roundRef.current, newScore);
      });
    });
  }

  function handleWrong(transcript) {
    SpeechRecognitionUtil.stopListening();
    // Keep liveTranscript so the user can see what STT returned vs the target word
    setLastTranscript(transcript || '');
    if (transcript) Sounds.wrong();
    else            Sounds.couldntHear();
    setListenState('wrong');

    setRetries(r => {
      setTimeout(() => { setListenState('idle'); setLiveTranscript(''); }, 2500);
      return r + 1;
    });
  }

  function handleMicTap() {
    if (listenState !== 'idle') return;
    Sounds.stopSpeech();
    setLiveTranscript('');
    setListenState('listening');
    Sounds.tap();

    // Brief delay so Android audio system releases TTS focus before mic opens.
    // Without this, the first recognition after TTS playback often returns empty.
    setTimeout(() => {
      SpeechRecognitionUtil.startListening({
        targetWord:  current.word,
        timeoutMs:   7000,
        onListening: () => {},
        onPartial:   (text) => setLiveTranscript(text),
        onResult: ({ matched, transcript }) => {
          setLiveTranscript(transcript); // show the final result, not just the interim
          if (matched) handleCorrect();
          else         handleWrong(transcript);
        },
        onError: ({ code }) => {
          if (code === 'NOT_ALLOWED') { setSpeechAvail('none'); return; }
          if (code === 'TIMEOUT' || code === 'ENDED_EARLY') {
            // Log as incident so we can see STT returned nothing for this word
            saveMatchIncident(current.word, [`[STT returned empty — code: ${code}]`]);
            handleWrong('');
          } else {
            // Show the error code in the live box for troubleshooting
            setLiveTranscript(`⚠️ ${code}`);
            setTimeout(() => { setListenState('idle'); setLiveTranscript(''); }, 2500);
          }
        },
      });
    }, 300);
  }

  function handleSkip() {
    SpeechRecognitionUtil.stopListening();
    setListenState('skipped');
    Sounds.tap();
    setTimeout(() => advanceWord(roundRef.current, scoreRef.current), 600);
  }

  // Manual fallback (no speech API)
  function handleRead() {
    if (done) return;
    const word = words[round].word;
    setFlash(true);
    setWordBlink(true);
    const newScore = score + 1;
    setScore(newScore);
    onAddStars(1);
    Sounds.correctSfxOnly();
    Sounds.speak(word, 300, () => {
      Sounds.praiseVoice(150, () => {
        setFlash(false);
        setWordBlink(false);
        advanceWord(round, newScore);
      });
    });
  }

  function restart() {
    setRound(0);
    setScore(0);
    setDone(false);
    setFlash(false);
    setWordBlink(false);
    setListenState('idle');
    setRetries(0);
    setLastTranscript('');
    setLiveTranscript('');
    setWordAnim('pop-in');
  }

  function statusLabel() {
    if (listenState === 'listening') return '...מקשיבה';
    if (listenState === 'correct')   return '🎉 כל הכבוד!';
    if (listenState === 'wrong') {
      // Distinguish "heard but wrong word" from "didn't hear anything"
      return (liveTranscript || lastTranscript) ? 'נסי שוב! 💪' : 'לא שמעתי 🎤 — דברי חזק יותר!';
    }
    if (listenState === 'skipped')   return 'דלגנו — בהצלחה במילה הבאה!';
    if (retries === 0)               return 'לחצי על המיקרופון ואמרי את המילה';
    return `ניסיון ${retries + 1} — לחצי ונסי שוב!`;
  }

  return (
    <GameShell
      onBack={onBack}
      title="קריאה"
      score={score}
      maxScore={ROUNDS}
      bgClass="reading-bg"
    >
      <GameEffects correct={flash} done={done} character="stitch" />

      {done ? (
        <div className="done-screen fade-in" dir="rtl">
          <CharacterImg character="stitch" size={130} />
          <div className="done-box pop">
            <span className="done-emoji">🎉</span>
            <h2 className="done-title">כל הכבוד!</h2>
            <p className="done-sub">קראת {score} מילים!</p>
            {score === ROUNDS && <span className="done-perfect">🌟 מושלם!</span>}
            <div className="done-btns">
              <button className="done-btn primary" onClick={restart}>שחקי שוב 🔄</button>
              <button className="done-btn secondary" onClick={onBack}>🏠 בית</button>
            </div>
          </div>
        </div>
      ) : (
        <div className="reading-game" dir="rtl">

          {/* Progress */}
          <div className="reading-progress">
            <div className="reading-progress-bar">
              <div
                className="reading-progress-fill"
                style={{ width: `${((round + 1) / ROUNDS) * 100}%` }}
              />
            </div>
            <span className="reading-progress-label" dir="ltr">{round + 1} / {ROUNDS}</span>
          </div>

          {/* Word card */}
          <div className={`reading-word-card ${wordAnim}`}>
            <div className={`reading-word ${wordBlink ? 'word-blink' : ''}`}>
              {current.word}
            </div>
          </div>

          {/* Controls */}
          {speechAvail === 'none' ? (
            <button className="reading-btn" onClick={handleRead}>
              קראתי! ✓
            </button>
          ) : (
            <div className="reading-controls">
              {/* Unified feedback panel */}
              <div className="reading-feedback-panel">
                <div className="reading-status-label">{statusLabel()}</div>

                {listenState === 'listening' ? (
                  <div className={`reading-live-text${liveTranscript ? '' : ' reading-live-placeholder'}`}>
                    {liveTranscript || '· · ·'}
                  </div>
                ) : listenState === 'wrong' && (liveTranscript || lastTranscript) ? (
                  <div className="reading-heard-text">
                    שמעתי: &ldquo;{liveTranscript || lastTranscript}&rdquo;
                  </div>
                ) : null}
              </div>

              {/* Mic + Skip side by side */}
              <div className="reading-action-row">
                <button
                  className={`reading-skip-btn ${retries >= MAX_RETRIES ? 'prominent' : ''}`}
                  onClick={handleSkip}
                  disabled={listenState === 'correct'}
                >
                  ← דלגי
                </button>

                <button
                  className={`reading-mic-btn ${listenState}`}
                  onClick={handleMicTap}
                  disabled={listenState !== 'idle'}
                  aria-label="לחצי לדבר"
                >
                  {listenState === 'listening' ? '👂' : '🎤'}
                </button>
              </div>
            </div>
          )}

          {/* Stars row */}
          <div className="reading-stars-row">
            {Array.from({ length: ROUNDS }).map((_, i) => (
              <span key={i} className={`reading-star ${i < score ? 'earned' : ''}`}>
                ⭐
              </span>
            ))}
          </div>
        </div>
      )}
    </GameShell>
  );
}
