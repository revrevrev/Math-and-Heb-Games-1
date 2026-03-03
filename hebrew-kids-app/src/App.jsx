import { useState, useCallback, useEffect } from 'react';
import HomeScreen from './components/HomeScreen';
import LettersGame from './components/games/LettersGame';
import CountingGame from './components/games/CountingGame';
import MemoryGame from './components/games/MemoryGame';
import MathGame from './components/games/MathGame';
import WordGame from './components/games/WordGame';

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

  const addStars = useCallback((n) => setTotalStars(s => s + n), []);
  const goHome   = useCallback(() => setScreen('home'), []);

  return (
    <>
      {screen === 'home'     && <HomeScreen  onSelectGame={setScreen} totalStars={totalStars} />}
      {screen === 'letters'  && <LettersGame  onBack={goHome} onAddStars={addStars} />}
      {screen === 'counting' && <CountingGame onBack={goHome} onAddStars={addStars} />}
      {screen === 'memory'   && <MemoryGame   onBack={goHome} onAddStars={addStars} />}
      {screen === 'math'     && <MathGame     onBack={goHome} onAddStars={addStars} />}
      {screen === 'words'    && <WordGame      onBack={goHome} onAddStars={addStars} />}
    </>
  );
}
