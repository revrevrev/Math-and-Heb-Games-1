# המשחקים של שירה – Hebrew Kids Learning App

A colourful educational app for Hebrew-speaking children, built with React + Capacitor.
Five mini-games teach Hebrew letters, counting, memory, arithmetic, and word-building —
wrapped in music, animations, and instant rewards so learning feels like play.

## Repo layout

```
/
├── hebrew-kids-app/   ← main application (React + Vite + Capacitor)
├── CLAUDE.md          ← AI assistant instructions & project conventions
└── run-dev.bat        ← Windows shortcut to start the dev server
```

See [hebrew-kids-app/README.md](hebrew-kids-app/README.md) for full setup, build, and development instructions.

## Quick start
cd hebrew-kids-app
npm install
npm run dev

Open **http://localhost:5173** in a browser. For the authentic mobile look, use DevTools device toolbar (F12 → Ctrl+Shift+M) and pick a phone size.


## Build
cd hebrew-kids-app
.\build-android.bat



## Tech stack
- **React 19** + **Vite 7**
- **Capacitor 8** for Android APK builds
- Plain JSX + CSS (no TypeScript, no CSS framework)
