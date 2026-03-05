import { useState, useRef } from 'react';
import { Sounds } from './sounds';
import { unlockAchievement } from './achievements';

/**
 * Shared hook for streak tracking, level-up detection, history, and next-button state.
 * @param {number} totalRounds - total number of rounds in the game
 */
export function useGameEnhancements(totalRounds) {
  const [streak, setStreak]               = useState(0);
  const [bestStreak, setBestStreak]       = useState(0);
  const [history, setHistory]             = useState([]);
  const [showStreakBonus, setShowStreak]  = useState(false);
  const [streakCount, setStreakCount]     = useState(0);
  const [showLevelUp, setShowLevelUp]     = useState(false);
  const [waitingForNext, setWaiting]      = useState(false);
  const streakRef = useRef(0);

  function onCorrect(historyItem, roundIndex) {
    streakRef.current += 1;
    const s = streakRef.current;
    setStreak(s);
    setBestStreak(b => Math.max(b, s));

    if (historyItem) {
      setHistory(h => [...h, { ...historyItem, wasCorrect: true }]);
    }

    // Streak bonus at 3, 6, 9, …
    if (s >= 3 && s % 3 === 0) {
      setStreakCount(s);
      setShowStreak(true);
      Sounds.streak();
      setTimeout(() => setShowStreak(false), 2200);
    }
    // Achievement: 5 in a row
    if (s >= 5) unlockAchievement('streak_5');

    // Level-up at midpoint
    if (roundIndex === Math.floor(totalRounds / 2) - 1) {
      setTimeout(() => {
        setShowLevelUp(true);
        Sounds.levelUp();
        setTimeout(() => setShowLevelUp(false), 2200);
      }, 400);
    }

    setWaiting(true);
  }

  function onWrong() {
    streakRef.current = 0;
    setStreak(0);
  }

  function clearWaiting() {
    setWaiting(false);
  }

  function reset() {
    streakRef.current = 0;
    setStreak(0);
    setBestStreak(0);
    setHistory([]);
    setShowStreak(false);
    setShowLevelUp(false);
    setWaiting(false);
  }

  return {
    streak,
    bestStreak,
    history,
    showStreakBonus,
    streakCount,
    showLevelUp,
    waitingForNext,
    onCorrect,
    onWrong,
    clearWaiting,
    reset,
  };
}
