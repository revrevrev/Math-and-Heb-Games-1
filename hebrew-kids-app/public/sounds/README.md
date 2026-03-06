# Sound Effects — Required Files

Place audio files here. The app tries `.mp3` then `.ogg` for each sound.
If a file is missing, it automatically falls back to synthesized audio.

## Sound Effect Files (`/sounds/`)

| Filename         | Purpose              | Recommended CC0 source (freesound.org) |
|------------------|----------------------|----------------------------------------|
| `tap.mp3`        | Button press         | Search "ui click short" — e.g. ID 220206 |
| `correct.mp3`    | Correct answer chime | Search "correct chime kids" — e.g. ID 341695 |
| `wrong.mp3`      | Wrong answer buzz    | Search "wrong answer buzz" — e.g. ID 142608 |
| `win.mp3`        | Game complete fanfare| Search "victory fanfare kids" — e.g. ID 456966 |
| `flip.mp3`       | Card flip            | Search "card flip whoosh" — e.g. ID 220205 |
| `match.mp3`      | Memory match found   | Search "ding match" — e.g. ID 341695 |
| `star.mp3`       | Star earned sparkle  | Search "star sparkle magic" — e.g. ID 270528 |
| `streak.mp3`     | Streak bonus         | Search "streak bonus game" — e.g. ID 270402 |
| `level-up.mp3`   | Level up             | Search "level up 8bit" — e.g. ID 387232 |

## Background Music Files (`/sounds/music/`)

| Filename        | Purpose                     |
|-----------------|-----------------------------|
| `home.mp3`      | Home screen background      |
| `letters.mp3`   | Letters game background     |
| `counting.mp3`  | Counting game background    |
| `memory.mp3`    | Memory game background      |
| `math.mp3`      | Math game background        |
| `words.mp3`     | Word game background        |

Music files are optional — the app uses synthesized melodies if absent.

## Quick download option: Kenney.nl

https://kenney.nl/assets/interface-sounds  (CC0 / public domain, no attribution required)

After downloading, rename files to match the table above and place them here.
Run `node scripts/download-sounds.mjs` to auto-download a curated set.
