import Confetti from './Confetti';
import CelebrationOverlay from './CelebrationOverlay';

/**
 * Drop-in effects layer for any game.
 *
 * Props:
 *   correct   – true while the current answer is correct (gameplay)
 *   done      – true when the game is finished (done screen)
 *   character – character name passed to the celebration overlay
 */
export default function GameEffects({ correct, done, character }) {
  const active = correct && !done;
  return (
    <>
      {/* Confetti burst on each correct answer during play */}
      <Confetti active={active} />

      {/* Separate confetti burst when the game is won */}
      <Confetti active={done} />

      {/* Bigger character + flying star on correct answer */}
      <CelebrationOverlay active={active} character={character} />
    </>
  );
}
