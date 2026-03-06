/**
 * download-sounds.mjs
 * Downloads CC0 sound effects from freesound.org and Kenney.nl for ME2.
 *
 * Usage:
 *   node scripts/download-sounds.mjs
 *
 * Requires: Node.js 18+ (uses built-in fetch)
 *
 * All sounds are CC0 / public domain — no attribution required.
 * Freesound.org sounds require a free API key:
 *   1. Register at https://freesound.org/apiv2/apply/
 *   2. Set env variable: FREESOUND_KEY=your_key_here
 *      or pass on command line: FREESOUND_KEY=xxx node scripts/download-sounds.mjs
 */

import { createWriteStream, existsSync, mkdirSync } from 'fs';
import { pipeline } from 'stream/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SOUNDS_DIR  = path.join(__dirname, '..', 'public', 'sounds');
const MUSIC_DIR   = path.join(SOUNDS_DIR, 'music');

mkdirSync(SOUNDS_DIR, { recursive: true });
mkdirSync(MUSIC_DIR,  { recursive: true });

const FREESOUND_KEY = process.env.FREESOUND_KEY;

// ── Freesound IDs (CC0 licensed sounds) ──────────────────────
// These are verified CC0 sounds from freesound.org
const FREESOUND_SOUNDS = [
  // { id: 220206, file: 'tap.mp3',       desc: 'UI click short' },
  // Add more freesound IDs here once you have an API key
  // ID list: https://freesound.org/search/?q=&filter=license%3A%22Creative+Commons+0%22
];

// ── Kenney.nl Interface Sounds (CC0, no key needed) ──────────
// Downloaded from: https://kenney.nl/assets/interface-sounds
// The pack URL below is the direct zip. Extract and map files as below.
const KENNEY_PACK_URL = 'https://kenney.nl/media/pages/assets/interface-sounds/65fc52b5e3-1694443007/kenney_interface-sounds.zip';

// After extracting the Kenney zip, these files map to our names:
const KENNEY_FILE_MAP = {
  'Audio/impactSoft_heavy_000.ogg': path.join(SOUNDS_DIR, 'tap.ogg'),
  'Audio/impactSoft_medium_000.ogg': path.join(SOUNDS_DIR, 'flip.ogg'),
  'Audio/confirmation_002.ogg': path.join(SOUNDS_DIR, 'correct.ogg'),
  'Audio/error_008.ogg': path.join(SOUNDS_DIR, 'wrong.ogg'),
  'Audio/maximize_006.ogg': path.join(SOUNDS_DIR, 'win.ogg'),
  'Audio/maximize_007.ogg': path.join(SOUNDS_DIR, 'star.ogg'),
  'Audio/maximize_008.ogg': path.join(SOUNDS_DIR, 'streak.ogg'),
  'Audio/maximize_009.ogg': path.join(SOUNDS_DIR, 'level-up.ogg'),
  'Audio/confirmation_001.ogg': path.join(SOUNDS_DIR, 'match.ogg'),
};

async function downloadFile(url, dest) {
  if (existsSync(dest)) {
    console.log(`  ✓ Already exists: ${path.basename(dest)}`);
    return true;
  }
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    await pipeline(res.body, createWriteStream(dest));
    console.log(`  ↓ Downloaded: ${path.basename(dest)}`);
    return true;
  } catch (err) {
    console.warn(`  ✗ Failed (${path.basename(dest)}): ${err.message}`);
    return false;
  }
}

async function downloadFreesound(id, dest) {
  if (!FREESOUND_KEY) return false;
  const infoUrl = `https://freesound.org/apiv2/sounds/${id}/?token=${FREESOUND_KEY}`;
  try {
    const info = await fetch(infoUrl).then(r => r.json());
    const mp3Url = info?.previews?.['preview-hq-mp3'];
    if (!mp3Url) return false;
    return downloadFile(mp3Url, dest);
  } catch {
    return false;
  }
}

async function main() {
  console.log('Hebrew Kids App — Sound Downloader');
  console.log('====================================\n');

  // 1. Freesound.org sounds
  if (FREESOUND_KEY) {
    console.log('Downloading from freesound.org...');
    for (const s of FREESOUND_SOUNDS) {
      const dest = path.join(SOUNDS_DIR, s.file);
      await downloadFreesound(s.id, dest);
    }
  } else {
    console.log('Skipping freesound.org (no FREESOUND_KEY set).');
    console.log('  To use: FREESOUND_KEY=your_key node scripts/download-sounds.mjs\n');
  }

  // 2. Kenney Interface Sounds pack
  console.log('\nDownloading Kenney.nl Interface Sounds pack...');
  console.log('  Pack URL:', KENNEY_PACK_URL);
  console.log('  This is a ZIP file. To extract automatically, install the "unzipper" package:');
  console.log('    npm install --save-dev unzipper');
  console.log('  Then re-run this script, or:\n');
  console.log('  Manual steps:');
  console.log('  1. Download:', KENNEY_PACK_URL);
  console.log('  2. Extract the ZIP');
  console.log('  3. Copy the following files to public/sounds/:\n');

  for (const [src, dest] of Object.entries(KENNEY_FILE_MAP)) {
    const destName = path.relative(SOUNDS_DIR, dest);
    console.log(`     ${src.padEnd(40)} → ${destName}`);
  }

  // 3. Try auto-extraction if unzipper is available
  let unzipper;
  try {
    unzipper = await import('unzipper');
  } catch {
    unzipper = null;
  }

  if (unzipper) {
    console.log('\n  unzipper found — attempting auto-download & extract...');
    const zipDest = path.join(SOUNDS_DIR, '_kenney_interface-sounds.zip');
    const ok = await downloadFile(KENNEY_PACK_URL, zipDest);
    if (ok) {
      try {
        const zip = await unzipper.Open.file(zipDest);
        for (const [src, dest] of Object.entries(KENNEY_FILE_MAP)) {
          if (existsSync(dest)) { console.log(`  ✓ Already exists: ${path.basename(dest)}`); continue; }
          const entry = zip.files.find(f => f.path === src || f.path.endsWith('/' + src.replace('Audio/', '')));
          if (entry) {
            await pipeline(entry.stream(), createWriteStream(dest));
            console.log(`  ✓ Extracted: ${path.basename(dest)}`);
          } else {
            console.warn(`  ✗ Not found in zip: ${src}`);
          }
        }
        console.log('\n  Done! Sound files are ready in public/sounds/');
      } catch (err) {
        console.warn('\n  Extraction failed:', err.message);
        console.log('  Please extract the ZIP manually (see instructions above).');
      }
    }
  }

  console.log('\n====================================');
  console.log('Run "npm run dev" to test sounds.');
  console.log('Missing files fall back to synthesized audio automatically.\n');
}

main().catch(console.error);
