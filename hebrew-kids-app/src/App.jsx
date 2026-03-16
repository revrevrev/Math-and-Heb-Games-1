import { useState, useCallback, useEffect, useRef } from 'react';
import HomeScreen from './components/HomeScreen';
import LettersGame from './components/games/LettersGame';
import CountingGame from './components/games/CountingGame';
import MemoryGame from './components/games/MemoryGame';
import MathGame from './components/games/MathGame';
import WordGame from './components/games/WordGame';
import FirstLetterGame from './components/games/FirstLetterGame';
import SettingsScreen from './components/SettingsScreen';
import AchievementsScreen from './components/AchievementsScreen';
import ProfileScreen from './components/ProfileScreen';
import PresentsScreen from './components/PresentsScreen';
import { unlockAchievement } from './utils/achievements';
import { Navigation } from './utils/navigation';
import { Capacitor } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';

const STARS_KEY = 'hebrew-app-stars';
const IS_NATIVE = Capacitor.isNativePlatform();

// Secondary screens: back returns to previous screen instead of home
const SECONDARY = new Set(['settings', 'achievements', 'profile', 'presents']);

export default function App() {
  const [screen, setScreen]         = useState('home');
  const [totalStars, setTotalStars] = useState(() => {
    const saved = localStorage.getItem(STARS_KEY);
    return saved ? parseInt(saved, 10) : 0;
  });

  const screenRef     = useRef('home');
  const prevScreenRef = useRef('home');
  useEffect(() => { screenRef.current = screen; }, [screen]);

  useEffect(() => {
    localStorage.setItem(STARS_KEY, String(totalStars));
  }, [totalStars]);

  const addStars = useCallback((n) => {
    setTotalStars(prev => {
      const next = prev + n;
      if (prev === 0 && next > 0) unlockAchievement('first_star');
      if (prev < 100 && next >= 100) unlockAchievement('stars_100');
      return next;
    });
  }, []);

  const navigateTo = useCallback((newScreen) => {
    prevScreenRef.current = screenRef.current;
    setScreen(newScreen);
  }, []);

  const goHome = useCallback(() => {
    prevScreenRef.current = screenRef.current;
    setScreen('home');
  }, []);

  function handleBack() {
    const cur = screenRef.current;
    if (cur === 'home') {
      if (IS_NATIVE) CapApp.minimizeApp();
    } else if (SECONDARY.has(cur)) {
      setScreen(prevScreenRef.current || 'home');
    } else {
      setScreen('home');
    }
  }

  useEffect(() => {
    Navigation.register(() => navigateTo('settings'));
    return () => Navigation.register(null);
  }, [navigateTo]);

  // ── Android hardware back button (Capacitor) ──────────────
  useEffect(() => {
    if (!IS_NATIVE) return;
    let handle;
    CapApp.addListener('backButton', handleBack).then(h => { handle = h; });
    return () => { handle?.remove(); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Web browser back button (desktop / dev) ───────────────
  useEffect(() => {
    if (IS_NATIVE) return;
    if (screen !== 'home') window.history.pushState({ screen }, '');
  }, [screen]);

  useEffect(() => {
    if (IS_NATIVE) return;
    const handlePop = () => handleBack();
    window.addEventListener('popstate', handlePop);
    return () => window.removeEventListener('popstate', handlePop);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      {screen === 'home'         && <HomeScreen        onSelectGame={navigateTo} totalStars={totalStars} />}
      {screen === 'letters'      && <LettersGame        onBack={goHome} onAddStars={addStars} />}
      {screen === 'counting'     && <CountingGame       onBack={goHome} onAddStars={addStars} />}
      {screen === 'memory'       && <MemoryGame         onBack={goHome} onAddStars={addStars} />}
      {screen === 'math'         && <MathGame           onBack={goHome} onAddStars={addStars} />}
      {screen === 'words'        && <WordGame           onBack={goHome} onAddStars={addStars} />}
      {screen === 'settings'     && <SettingsScreen     onBack={() => navigateTo(prevScreenRef.current || 'home')} totalStars={totalStars} onDebugSetStars={setTotalStars} />}
      {screen === 'achievements' && <AchievementsScreen onBack={goHome} totalStars={totalStars} />}
      {screen === 'profile'      && <ProfileScreen      onBack={goHome} />}
      {screen === 'firstletter'  && <FirstLetterGame    onBack={goHome} onAddStars={addStars} />}
      {screen === 'presents'     && <PresentsScreen     onBack={goHome} totalStars={totalStars} />}
    </>
  );
}
