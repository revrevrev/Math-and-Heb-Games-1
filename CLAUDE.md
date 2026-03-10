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
    public/images/              ← character photos (elsa.jpg, Bluey.png, etc.)
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
```

## Adding a New Game
1. Create `src/components/games/MyGame.jsx` + `MyGame.css`
2. Add the game screen entry in `App.jsx` (import + `{screen === 'mygame' && ...}`)
3. Add a card entry to the `GAMES` array in `HomeScreen.jsx`
4. Accept `{ onBack, onAddStars }` props; call `onAddStars(n)` on success

## Notes
- Target audience: young girls (Hebrew feminine text throughout)
- Keep UI colorful, large touch targets, minimal text
- Avoid breaking existing game interfaces — the star reward loop is central UX
