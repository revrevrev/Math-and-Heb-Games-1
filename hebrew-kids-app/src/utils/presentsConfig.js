/**
 * PresentsConfig — add your video sources here.
 *
 * Every 30 stars the child earns one present.
 * Each present randomly picks one entry from PRESENT_SOURCES.
 *
 * Supported types:
 *
 *   { type: 'youtube-video',    id: 'VIDEO_ID',    title: 'תיאור' }
 *     → embeds a single YouTube video
 *
 *   { type: 'youtube-playlist', id: 'PLAYLIST_ID', title: 'תיאור' }
 *     → embeds a full YouTube playlist (auto-plays from start)
 *
 *   { type: 'google-photos',    url: 'https://photos.google.com/share/...', title: 'תיאור' }
 *     → opens a shared Google Photos album in a viewer
 *
 * How to get the IDs/URLs:
 *   YouTube video ID   — the part after ?v= in the URL (e.g. dQw4w9WgXcQ)
 *   YouTube playlist ID — the part after ?list= in the URL (e.g. PLxxxxxx)
 *   Google Photos URL  — share an album → copy link
 */

export const STARS_PER_PRESENT = 15;

export const PRESENT_SOURCES = [
  // ── YouTube videos ─────────────────────────────────────────────────
  // { type: 'youtube-video', id: 'wt_9h_Nx93Y', title: 'איש שלג' },
  // ── YouTube playlists ──────────────────────────────────────────────
   { type: 'youtube-playlist', id: 'PLGni-QAYrlkjg54TKzx54qcPfWGIltwWM', title: 'סרטונים אהובים' }

  // ── Google Photos shared albums ──────────────────────────────────── For now these are just links, since embedding the album viewer is a pain. Removing for now. 
  // Consider re-adding if we find a good way to embed the albums directly in an app page.
  // Either by using the Google Photos API (requires auth, but maybe we can do it with a service account and share the albums with that account?), or by parsing the shared album page and extracting the image URLs (fragile, but could work as a fallback).
  // OR Upload to Youtube and embed as unlisted videos/playlists.
  // { type: 'google-photos', url: 'https://photos.app.goo.gl/yRQZXg3oG1Vf7bDM6', title: 'אני ומשפחתי' }
];
