import { useState, useCallback, useEffect } from 'react';
import HomeScreen from './components/HomeScreen';
import LettersGame from './components/games/LettersGame';
import CountingGame from './components/games/CountingGame';
import MemoryGame from './components/games/MemoryGame';
import MathGame from './components/games/MathGame';
import WordGame from './components/games/WordGame';
import SettingsScreen from './components/SettingsScreen';
import AchievementsScreen from './components/AchievementsScreen';
import ProfileScreen from './components/ProfileScreen';
import { unlockAchievement } from './utils/achievements';

const STARS_KEY = 'hebrew-app-stars';

export default function App() {
  const [screen, setScreen]         = useState('home');
  const [totalStars, setTotalStars] = useState(() => {
    const saved = localStorage.getItem(STARS_KEY);
    return saved ? parseInt(saved, 10) : 0;
  });

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

  const goHome = useCallback(() => setScreen('home'), []);

  return (
    <>
      {screen === 'home'         && <HomeScreen        onSelectGame={setScreen} totalStars={totalStars} />}
      {screen === 'letters'      && <LettersGame        onBack={goHome} onAddStars={addStars} />}
      {screen === 'counting'     && <CountingGame       onBack={goHome} onAddStars={addStars} />}
      {screen === 'memory'       && <MemoryGame         onBack={goHome} onAddStars={addStars} />}
      {screen === 'math'         && <MathGame           onBack={goHome} onAddStars={addStars} />}
      {screen === 'words'        && <WordGame           onBack={goHome} onAddStars={addStars} />}
      {screen === 'settings'     && <SettingsScreen     onBack={goHome} />}
      {screen === 'achievements' && <AchievementsScreen onBack={goHome} totalStars={totalStars} />}
      {screen === 'profile'      && <ProfileScreen      onBack={goHome} />}
    </>
  );
}
