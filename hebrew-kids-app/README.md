# המשחקים של שירה – Hebrew Kids Learning App

A colourful, fully-Hebrew educational app for 5-year-olds featuring
Elsa, Anna, Bluey and the Teletubbies.  Five mini-games teach Hebrew
letters, counting, memory, arithmetic and word-building — wrapped in
music, animations and instant rewards so learning feels like pure play.

---

## Test on PC (browser) right now

```bash
cd hebrew-kids-app
npm install          # only needed once
npm run dev
```

Open **http://localhost:5173** — then press **F12 → Ctrl+Shift+M** (Device
Toolbar) and pick a phone size (e.g. Galaxy S20) for the authentic mobile
experience.

---

## Install on Android as a PWA (easiest — no Android Studio needed)

1. Start the server with LAN access:
   ```bash
   npm run dev -- --host
   ```
2. Connect your Android phone to **the same Wi-Fi network** as your PC.
3. In Chrome on the phone, open `http://<YOUR-PC-IP>:5173`
   (The IP is shown in the terminal, e.g. `http://10.100.102.11:5173`).
4. Tap the three-dot menu → **"Add to Home Screen"** → Install.

The app icon appears on the home screen and runs fullscreen, just like
a native app.

---

## Build a native Android APK (Capacitor)

### Prerequisites

| Tool | Version |
|------|---------|
| Node.js | 18+ |
| Java JDK | 17+ |
| Android Studio | Hedgehog / latest |
| Android SDK | API 22+ |

### One-time setup

```bash
# The android/ folder is already generated — nothing extra needed
```

### Build & open in Android Studio

```bash
npm run android:build
# runs: vite build → cap sync → opens Android Studio
```

In Android Studio:

1. Wait for Gradle sync to finish (status bar bottom right).
2. Connect a phone (USB, with Developer Mode + USB Debugging on)
   **or** start an emulator from the Device Manager.
3. Click the green ▶ **Run** button.

### After every code change

```bash
npm run android:sync   # vite build + cap sync
```
Then press Run again in Android Studio (no reinstall needed).

---

## App map

```
src/
├── App.jsx                      Router — manages current screen & star total
├── components/
│   ├── HomeScreen.jsx/css        Main menu with all characters
│   ├── GameShell.jsx/css         Shared top-bar (back button + score)
│   └── characters/
│       ├── Elsa.jsx              Ice princess   (original SVG art)
│       ├── Anna.jsx              Adventure queen (original SVG art)
│       ├── Bluey.jsx             Blue heeler pup (original SVG art)
│       └── Teletubby.jsx         4-colour Teletubby (original SVG art)
│   └── games/
│       ├── LettersGame.jsx       ❄️  Elsa   — Hebrew letter recognition (10 rounds)
│       ├── CountingGame.jsx      🐾  Bluey  — Count objects 1–10
│       ├── MemoryGame.jsx        🧠  Tubbies — Match 8 letter-emoji pairs
│       ├── MathGame.jsx          🎯  Anna   — Addition & subtraction
│       └── WordGame.jsx          ✨  All    — Spell Hebrew words
└── utils/
    ├── hebrewData.js             Alef-Bet, word list, counting items
    └── sounds.js                 Web Audio API: tap, correct, wrong, win
```

---

## Games overview

| # | Game | Character | Hebrew concept |
|---|------|-----------|----------------|
| 1 | ❄️ אותיות עם אלזה | Elsa | Letter recognition (all 22 letters) |
| 2 | 🐾 ספירה עם בלוי | Bluey | Counting 1–10, adaptive difficulty |
| 3 | 🧠 זיכרון עם הטלטאביז | Teletubbies | Memory + letter–picture pairing |
| 4 | 🎯 חשבון עם אנה | Anna | Addition & subtraction, visual dots |
| 5 | ✨ מילות קסם | All | Spelling common Hebrew words |

All text is in Hebrew, RTL layout throughout.
Stars earned in every game accumulate on the home screen.

---

## Presents system

Every **15 stars** (configurable in `src/utils/presentsConfig.js`) the child earns a present — a randomly selected video that plays inside a retro TV frame.

To add content, edit `presentsConfig.js`:
```js
{ type: 'youtube-video',    id: 'VIDEO_ID',    title: 'תיאור' }
{ type: 'youtube-playlist', id: 'PLAYLIST_ID', title: 'תיאור' }
```
Playlists are shuffled server-side via the YT IFrame API; only a single random video plays (no skip controls visible).

---

## Developer debug gestures

Hidden gestures for testing — invisible to kids, work on both desktop (mouse) and mobile (touch).

| Screen | Gesture | Effect |
|---|---|---|
| **Home** | Long-press (700 ms) the gift icon in the bottom nav | Opens Presents screen even with 0 stars |
| **Presents** | Long-press (700 ms) the "🎁 ההפתעות שלי" title | Opens a random video without claiming a present |
| **Settings** | Long-press (700 ms) the "⚙️ הגדרות" title | Toggles the debug panel |

### Settings debug panel

Two independent override fields:

- **⭐ כוכבים** — set the total star count to any value
- **🎁 הפתעות זמינות** — set how many presents should be available right now

Leave a field blank to keep its current value. If the star count is too low to cover the requested presents, it is automatically raised to the minimum needed. Press **החל** to apply.
