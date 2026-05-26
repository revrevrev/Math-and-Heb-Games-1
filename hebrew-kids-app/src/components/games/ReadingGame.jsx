import { useState, useEffect, useRef } from 'react';
import GameShell from '../GameShell';
import CharacterImg from '../CharacterImg';
import GameEffects from '../GameEffects';
import { Sounds } from '../../utils/sounds';
import { SpeechRecognitionUtil, saveMatchIncident } from '../../utils/speechRecognition';
import { unlockAchievement, recordGamePlayed } from '../../utils/achievements';
import './ReadingGame.css';

// ── Word pool ────────────────────────────────────────────────────────────────
// `sounds` = per-letter nikud syllables so TTS reads the phonetic sound,
//            not the letter name (e.g. "שֶׁ" instead of "שין").
const WORD_POOL = [
  // 2-letter words
  { word: 'ים',  sounds: ['יָ',  'מְה'] },
  { word: 'דג',  sounds: ['דָּ', 'גְה'] },
  { word: 'אש',  sounds: ['אֵ',  'שְׁה'] },
  { word: 'גן',  sounds: ['גַּ', 'נְה'] },
  { word: 'בת',  sounds: ['בַּ', 'תְה'] },
  { word: 'בן',  sounds: ['בֵּ', 'נְה'] },
  { word: 'צב',  sounds: ['צָ',  'בְה'] },
  { word: 'אח',  sounds: ['אָ',  'חְה'] },
  // 3-letter words
  { word: 'שמש', sounds: ['שֶׁ', 'מֶ', 'שְׁה'] },
  { word: 'פרח', sounds: ['פֶּ', 'רַ', 'חְה'] },
  { word: 'אבא', sounds: ['אַ',  'בָּ', 'אְה'] },
  { word: 'אמא', sounds: ['אִ',  'מָּ', 'אְה'] },
  { word: 'גזר', sounds: ['גֶּ', 'זֶ', 'רְה'] },
  { word: 'לחם', sounds: ['לֶ',  'חֶ', 'מְה'] },
  { word: 'קטן', sounds: ['קָ',  'טָ', 'נְה'] },
// 4-letter words - future expansion
//  { word: 'גדול', sounds: ['גָּ', 'דוֹ', 'ל'] },
//  { word: 'פרפר', sounds: ['פַּ', 'רְ', 'פַּ', 'ר'] },
//  { word: 'בלון', sounds: ['בָּ', 'לוֹ', 'ן'] },
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
  // Letter-by-letter spell-out state
  // null = inactive, { letterIndex: number, showWhole: boolean }
  const [spellOut, setSpellOut] = useState(null);

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
  function advanceWord(currentRound) {
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
        setSpellOut(null);
        setWordAnim('pop-in');
      }, 300);
    }
  }

  // ── Letter-by-letter spell-out ─────────────────────────────────────────
  function runSpellOut(wordEntry, onDone) {
    const { word, sounds } = wordEntry;
    const letters = [...word];
    let i = 0;

    function nextLetter() {
      if (i < letters.length) {
        setSpellOut({ letterIndex: i, showWhole: false });
        const entry = sounds?.[i] ?? letters[i];
        const speakFn = (entry?.en != null)
          ? (cb) => Sounds.speakEn(entry.en, 100, cb)
          : (cb) => Sounds.speak(entry,      100, cb);
        speakFn(() => {
          i++;
          // brief pause between letters
          setTimeout(nextLetter, 250);
        });
      } else {
        // all letters done — show whole word
        setSpellOut({ letterIndex: -1, showWhole: true });
        Sounds.speak(word, 200, () => {
          setSpellOut(null);
          onDone();
        });
      }
    }

    nextLetter();
  }

  // ── Handlers ──────────────────────────────────────────────────────────────
  function handleCorrect() {
    SpeechRecognitionUtil.stopListening();
    const entry = wordsRef.current[roundRef.current];

    setListenState('correct');
    setFlash(true);

    const newScore = scoreRef.current + 1;
    setScore(newScore);
    onAddStars(1);

    Sounds.correctSfxOnly();
    // Spell out letter-by-letter, then praise, then advance
    setTimeout(() => {
      runSpellOut(entry, () => {
        Sounds.praiseVoice(150, () => {
          setFlash(false);
          advanceWord(roundRef.current, newScore);
        });
      });
    }, 400);
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
    const entry = wordsRef.current[roundRef.current];
    // Spell out the word so the child learns it, then advance
    setTimeout(() => {
      runSpellOut(entry, () => {
        advanceWord(roundRef.current, scoreRef.current);
      });
    }, 400);
  }

  // Manual fallback (no speech API)
  function handleRead() {
    if (done) return;
    const entry = words[round];
    setFlash(true);
    const newScore = score + 1;
    setScore(newScore);
    onAddStars(1);
    Sounds.correctSfxOnly();
    setTimeout(() => {
      runSpellOut(entry, () => {
        Sounds.praiseVoice(150, () => {
          setFlash(false);
          advanceWord(round, newScore);
        });
      });
    }, 400);
  }

  function restart() {
    setRound(0);
    setScore(0);
    setDone(false);
    setFlash(false);
    setSpellOut(null);
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
            <div className={`reading-word ${spellOut?.showWhole ? 'spell-whole' : ''}`}>
              {[...current.word].map((letter, i) => (
                <span
                  key={i}
                  className={
                    spellOut && !spellOut.showWhole && spellOut.letterIndex === i
                      ? 'spell-letter-active'
                      : ''
                  }
                >
                  {letter}
                </span>
              ))}
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
