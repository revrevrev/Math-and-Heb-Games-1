/**
 * download-sounds.mjs
 * Downloads CC0 sound effects for the Hebrew Kids App (ME2).
 *
 * Usage:
 *   node scripts/download-sounds.mjs
 *
 * Requires Node.js 18+. For freesound.org sounds, set your free API key:
 *   FREESOUND_KEY=your_key node scripts/download-sounds.mjs
 *
 * Register for a free key at: https://freesound.org/apiv2/apply/
 * All sounds are CC0 — no attribution required.
 */

import { createWriteStream, existsSync, mkdirSync } from 'fs';
import { pipeline } from 'stream/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SOUNDS_DIR = path.join(__dirname, '..', 'public', 'sounds');
const MUSIC_DIR  = path.join(SOUNDS_DIR, 'music');

mkdirSync(SOUNDS_DIR, { recursive: true });
mkdirSync(MUSIC_DIR,  { recursive: true });

const FREESOUND_KEY = process.env.FREESOUND_KEY;

// ── Verified CC0 sound IDs on freesound.org ──────────────────
// All are licensed CC0 (no attribution required).
// Preview quality is 128kbps MP3 — good enough for kids' game SFX.
const FREESOUND_SOUNDS = [
  { id: 220206,  file: 'tap.mp3',      desc: 'UI click (short pop)' },
  { id: 341695,  file: 'correct.mp3',  desc: 'Correct answer chime' },
  { id: 142608,  file: 'wrong.mp3',    desc: 'Wrong answer buzz' },
  { id: 456966,  file: 'win.mp3',      desc: 'Victory fanfare' },
  { id: 220205,  file: 'flip.mp3',     desc: 'Card flip whoosh' },
  { id: 270528,  file: 'match.mp3',    desc: 'Match found ding' },
  { id: 411090,  file: 'star.mp3',     desc: 'Star sparkle' },
  { id: 270402,  file: 'streak.mp3',   desc: 'Streak bonus jingle' },
  { id: 387232,  file: 'level-up.mp3', desc: 'Level up' },
];

async function downloadFile(url, dest, desc = '') {
  if (existsSync(dest)) {
    console.log(`  ✓ Already exists: ${path.basename(dest)}`);
    return true;
  }
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'hebrew-kids-app/1.0' } });
    if (!res.ok) throw new Error(`HTTP ${res.status} — ${res.statusText}`);
    const ws = createWriteStream(dest);
    await pipeline(res.body, ws);
    console.log(`  ↓ Downloaded: ${path.basename(dest)}${desc ? '  (' + desc + ')' : ''}`);
    return true;
  } catch (err) {
    console.warn(`  ✗ Failed (${path.basename(dest)}): ${err.message}`);
    return false;
  }
}

async function downloadFreesound(id, dest, desc) {
  // Step 1: fetch sound metadata (requires API key)
  const infoUrl = `https://freesound.org/apiv2/sounds/${id}/?token=${FREESOUND_KEY}`;
  let res;
  try {
    res = await fetch(infoUrl);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  } catch (err) {
    console.warn(`  ✗ Metadata fetch failed for ID ${id}: ${err.message}`);
    return false;
  }
  const info = await res.json();
  const mp3Url = info?.previews?.['preview-hq-mp3'];
  if (!mp3Url) {
    console.warn(`  ✗ No preview URL for ID ${id}`);
    return false;
  }
  return downloadFile(mp3Url, dest, desc);
}

async function main() {
  console.log('\nHebrew Kids App — Sound Downloader (ME2)');
  console.log('==========================================\n');

  if (!FREESOUND_KEY) {
    console.log('No FREESOUND_KEY found — skipping freesound.org downloads.\n');
    console.log('To download sounds automatically:');
    console.log('  1. Register free at https://freesound.org/apiv2/apply/');
    console.log('  2. Run: FREESOUND_KEY=your_key node scripts/download-sounds.mjs\n');
    printManualInstructions();
    return;
  }

  console.log(`Using FREESOUND_KEY: ${FREESOUND_KEY.slice(0, 4)}****\n`);
  console.log('Downloading sound effects from freesound.org...');

  let ok = 0;
  for (const s of FREESOUND_SOUNDS) {
    const dest = path.join(SOUNDS_DIR, s.file);
    const success = await downloadFreesound(s.id, dest, s.desc);
    if (success) ok++;
  }

  console.log(`\n${ok}/${FREESOUND_SOUNDS.length} files downloaded.\n`);

  if (ok < FREESOUND_SOUNDS.length) {
    console.log('Some downloads failed. The app will use synthesized fallback audio for those.\n');
  }

  printManualInstructions();
}

function printManualInstructions() {
  console.log('── Manual alternative: Kenney.nl (CC0, no account needed) ────────');
  console.log('  1. Download: https://kenney.nl/assets/interface-sounds');
  console.log('  2. Extract the ZIP');
  console.log('  3. Rename and copy files to hebrew-kids-app/public/sounds/:\n');

  const MAP = [
    ['Audio/impactSoft_heavy_000.ogg',  'tap.ogg'],
    ['Audio/impactSoft_medium_000.ogg', 'flip.ogg'],
    ['Audio/confirmation_002.ogg',      'correct.ogg'],
    ['Audio/error_008.ogg',             'wrong.ogg'],
    ['Audio/maximize_006.ogg',          'win.ogg'],
    ['Audio/maximize_007.ogg',          'star.ogg'],
    ['Audio/maximize_008.ogg',          'streak.ogg'],
    ['Audio/maximize_009.ogg',          'level-up.ogg'],
    ['Audio/confirmation_001.ogg',      'match.ogg'],
  ];

  for (const [src, dest] of MAP) {
    console.log(`     ${src.padEnd(38)} → public/sounds/${dest}`);
  }

  console.log('\n  The app auto-falls back to synthesized audio for any missing file.\n');
}

main().catch(console.error);
