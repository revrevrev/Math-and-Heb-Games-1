// Achievement tracking utility
const ACHIEVEMENTS_KEY   = 'hebrew-app-achievements';
const GAMES_COUNT_KEY    = 'hebrew-app-game-counts';
const GAMES_SET_KEY      = 'hebrew-app-game-set';

export const ACHIEVEMENT_LIST = [
  { id: 'first_star',    icon: '🌟', title: 'כוכב ראשון',   desc: 'קיבלת את הכוכב הראשון שלך' },
  { id: 'perfect_game',  icon: '🎯', title: 'משחק מושלם',   desc: 'ענית נכון על כל השאלות' },
  { id: 'streak_5',      icon: '🔥', title: 'על האש',        desc: '5 תשובות נכונות ברצף' },
  { id: 'all_games',     icon: '🌍', title: 'סייר',          desc: 'שיחקת בכל 5 המשחקים' },
  { id: 'stars_100',     icon: '💫', title: '100 כוכבים',    desc: 'אספת 100 כוכבים' },
  { id: 'games_10',      icon: '🎮', title: 'שחקן קבוע',     desc: 'השלמת 10 משחקים' },
];

export function getAchievements() {
  try { return JSON.parse(localStorage.getItem(ACHIEVEMENTS_KEY) || '[]'); }
  catch { return []; }
}

/** Returns true if newly unlocked */
export function unlockAchievement(id) {
  const earned = getAchievements();
  if (earned.includes(id)) return false;
  earned.push(id);
  localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(earned));
  return true;
}

export function hasAchievement(id) {
  return getAchievements().includes(id);
}

/** Call when a game is completed. Returns { count, uniqueGames }. */
export function recordGamePlayed(gameId) {
  const count = parseInt(localStorage.getItem(GAMES_COUNT_KEY) || '0') + 1;
  localStorage.setItem(GAMES_COUNT_KEY, String(count));

  let set;
  try { set = JSON.parse(localStorage.getItem(GAMES_SET_KEY) || '[]'); }
  catch { set = []; }
  if (!set.includes(gameId)) {
    set.push(gameId);
    localStorage.setItem(GAMES_SET_KEY, JSON.stringify(set));
  }
  return { count, uniqueGames: set };
}

export function getGameStats() {
  const count = parseInt(localStorage.getItem(GAMES_COUNT_KEY) || '0');
  let set;
  try { set = JSON.parse(localStorage.getItem(GAMES_SET_KEY) || '[]'); }
  catch { set = []; }
  return { count, uniqueGames: set };
}

export function resetAllProgress() {
  localStorage.removeItem(ACHIEVEMENTS_KEY);
  localStorage.removeItem(GAMES_COUNT_KEY);
  localStorage.removeItem(GAMES_SET_KEY);
  localStorage.removeItem('hebrew-app-stars');
  localStorage.removeItem('hebrew-app-welcomed');
}
