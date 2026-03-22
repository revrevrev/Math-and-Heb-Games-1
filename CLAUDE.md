# CLAUDE.md — Hebrew & Math Kids Learning App

## Project Overview
A React kids learning app targeting young Hebrew-speaking children. Features five mini-games using beloved cartoon characters (Elsa, Bluey, Teletubbies, Anna, Gabby). Deployed as a web app and Android APK via Capacitor.

## Repo Structure
```
Math and Hebrew games/
  hebrew-kids-app/       ← main app (all work happens here)
    src/
      App.jsx            ← root: screen router + global star counter
      components/
        HomeScreen.jsx/.css     ← game selection grid + welcome overlay
        GameShell.jsx/.css      ← shared game wrapper (back button, header)
        PresentsScreen.jsx/.css ← presents viewer (video rewards)
        games/                  ← one file pair per game
          LettersGame.jsx/.css  ← Hebrew alphabet learning (Elsa)
          CountingGame.jsx/.css ← number counting (Bluey)
          MemoryGame.jsx/.css   ← card-matching memory (Teletubbies)
          MathGame.jsx/.css     ← addition/subtraction (Anna)
          WordGame.jsx/.css     ← word building (Gabby)
          shared.css            ← shared game styles
        characters/             ← character SVG/JSX components
          Anna.jsx, Bluey.jsx, Elsa.jsx, Teletubby.jsx
        CelebrationOverlay.jsx  ← star/confetti reward overlay
        Confetti.jsx            ← confetti animation component
        GameEffects.jsx         ← sound + visual effect triggers
        CharacterImg.jsx        ← reusable circular character photo
        effects.css             ← shared animation keyframes
      utils/
        sounds.js               ← Sounds singleton (tap, correct, wrong, star)
        presentsConfig.js       ← video URLs for presents (edit this to add content)
    public/images/              ← character photos + gift icons
      Gift-High-Quality.png     ← colored gift icon (nav bar, presents available)
      Gift-High-Quality-BW.png  ← B/W gift icon (nav bar, no presents)
      Gifts/                    ← animated gift images
        01-08-00-669_512.webp   ← animated present used on PresentsScreen
    capacitor.config.json       ← Android app: id=com.kids.hebrewlearning
```

## Tech Stack
- **React 19** + **Vite 7** (ES modules, JSX)
- **Capacitor 8** for Android APK builds
- No TypeScript, no CSS framework — plain JSX + CSS files
- No state management library — useState/useCallback/useMemo only
- Stars persisted in `localStorage` under key `hebrew-app-stars`

## Key Conventions
- Each game receives `onBack` and `onAddStars(n)` props from App.jsx
- Stars are awarded via `onAddStars` after correct answers / game completion
- Character images live in `public/images/` and are referenced as `/images/<file>`
- Hebrew text is RTL — CSS uses `direction: rtl` where needed
- `Sounds.tap()`, `Sounds.correct()`, `Sounds.wrong()`, `Sounds.star()` are the audio API

## Dev Commands (run inside `hebrew-kids-app/`)
```bash
npm run dev          # local dev server
npm run build        # production build → dist/
npm run android:sync # build + cap sync android
npm run android:open # open in Android Studio
npm run lint         # eslint
.\build-android.bat  # complete flow for building and deploying on android
```

## Adding a New Game
1. Create `src/components/games/MyGame.jsx` + `MyGame.css`
2. Add the game screen entry in `App.jsx` (import + `{screen === 'mygame' && ...}`)
3. Add a card entry to the `GAMES` array in `HomeScreen.jsx`
4. Accept `{ onBack, onAddStars }` props; call `onAddStars(n)` on success

## Presents Feature
Every `STARS_PER_PRESENT` stars (configured in `presentsConfig.js`, default 15) the child earns one present.

**Flow:**
- Bottom nav shows a gift icon with a red badge when presents are available
  - Colored icon (`Gift-High-Quality.png`) = presents available (glows, clickable)
  - B/W icon (`Gift-High-Quality-BW.png`) = no presents yet (dimmed, disabled)
- `PresentsScreen` shows an animated gift WebP; tapping it opens a random video
- Claimed count stored in `localStorage` key `hebrew-app-presents-claimed`
- Available = `floor(totalStars / STARS_PER_PRESENT) - claimed`

**Adding video content** — edit `src/utils/presentsConfig.js`:
```js
{ type: 'youtube-video',    id: 'VIDEO_ID',    title: 'תיאור' }
{ type: 'youtube-playlist', id: 'PLAYLIST_ID', title: 'תיאור' }
```
- Playlists: a hidden YT IFrame API player fetches all video IDs, picks one randomly, then plays it as a single video (no playlist navigation shown)
- Google Photos albums: not embeddable (Google blocks iframes); use YouTube instead

## Developer Debug Gestures
Hidden gestures for testing — invisible to kids, work on both desktop and mobile (touch).

| Screen | Gesture | Effect |
|---|---|---|
| Home | Long-press (700 ms) the gift icon in the bottom nav | Opens Presents screen even with 0 stars |
| Presents | Long-press (700 ms) the "🎁 ההפתעות שלי" title | Opens a random video without claiming a present |
| Settings | Long-press (700 ms) the "⚙️ הגדרות" title | Toggles the debug panel open/closed |

**Settings debug panel** — two independent fields:
- **⭐ כוכבים** — override total star count
- **🎁 הפתעות זמינות** — override available (unclaimed) presents
  If the entered star count isn't enough to earn the requested presents, stars are auto-bumped to the minimum required.

Leave a field blank to keep its current value unchanged.

## Notes
- Target audience: young girls (Hebrew feminine text throughout)
- Keep UI colorful, large touch targets, minimal text
- Avoid breaking existing game interfaces — the star reward loop is central UX
