/**
 * Build script to copy Podcast data to public folder for static export
 * Run: npx ts-node --esm scripts/build-data.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PODCAST_DIR = path.resolve(__dirname, '../../podcast');
const PUBLIC_DIR = path.resolve(__dirname, '../public');
const DATA_DIR = path.join(PUBLIC_DIR, 'data');
const AUDIO_DIR = path.join(PUBLIC_DIR, 'audio');

interface EpisodeRow {
  date: string;
  nutshell: string;
  user_tickers: string;
  tts_done: number;
}

interface EpisodeListItem {
  date: string;
  nutshell: string;
  user_tickers: string[];
}

async function main() {
  console.log('Building podcast data...');

  // Ensure directories exist
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.mkdirSync(AUDIO_DIR, { recursive: true });

  // Read from podcast.db
  const dbPath = path.join(PODCAST_DIR, 'podcast.db');
  if (!fs.existsSync(dbPath)) {
    console.error('podcast.db not found at:', dbPath);
    process.exit(1);
  }

  const db = new Database(dbPath, { readonly: true });

  // Get all completed episodes (tts_done = true)
  const rows = db.prepare(`
    SELECT date, nutshell, user_tickers, tts_done
    FROM podcasts
    WHERE tts_done = 1
    ORDER BY date DESC
  `).all() as EpisodeRow[];

  console.log(`Found ${rows.length} completed episodes`);

  const episodes: EpisodeListItem[] = [];

  for (const row of rows) {
    const { date, nutshell, user_tickers } = row;
    const episodeDir = path.join(PODCAST_DIR, date);

    // Check if episode directory exists
    if (!fs.existsSync(episodeDir)) {
      console.warn(`Episode directory not found: ${episodeDir}`);
      continue;
    }

    // Check for 'ko' subdirectory with data (new structure) or fallback to root (old structure)
    let sourceDir = episodeDir;
    const koDir = path.join(episodeDir, 'ko');
    const koJsonPath = path.join(koDir, `${date}.json`);

    if (fs.existsSync(koDir) && fs.existsSync(koJsonPath)) {
      sourceDir = koDir;
    }

    // Copy JSON file
    const jsonSrc = path.join(sourceDir, `${date}.json`);
    const jsonDest = path.join(DATA_DIR, `${date}.json`);

    if (fs.existsSync(jsonSrc)) {
      fs.copyFileSync(jsonSrc, jsonDest);
      console.log(`Copied: ${date}.json from ${sourceDir === koDir ? 'ko/' : ''}${date}.json`);
    } else {
      console.warn(`JSON not found: ${jsonSrc}`);
      continue;
    }

    // Copy audio file
    const audioSrc = path.join(sourceDir, `${date}.wav`);
    const audioDest = path.join(AUDIO_DIR, `${date}.wav`);

    if (fs.existsSync(audioSrc)) {
      fs.copyFileSync(audioSrc, audioDest);
      console.log(`Copied: ${date}.wav`);
    } else {
      console.warn(`Audio not found: ${audioSrc}`);
    }

    // Read nutshell from the source JSON file to ensure we get the localized version (e.g. Korean)
    // instead of potentially stale or English data from the DB
    let finalNutshell = nutshell;
    try {
      const jsonContent = fs.readFileSync(jsonSrc, 'utf-8');
      const parsedJson = JSON.parse(jsonContent);
      if (parsedJson.nutshell) {
        finalNutshell = parsedJson.nutshell;
      }
    } catch (e) {
      console.warn(`Failed to read nutshell from ${jsonSrc}`, e);
    }

    // Add to episodes list
    episodes.push({
      date,
      nutshell: finalNutshell,
      user_tickers: JSON.parse(user_tickers || '[]'),
    });
  }

  // Write episodes list
  const episodesPath = path.join(DATA_DIR, 'episodes.json');
  fs.writeFileSync(episodesPath, JSON.stringify(episodes, null, 2));
  console.log(`\nWrote episodes.json with ${episodes.length} episodes`);

  db.close();
  console.log('\nBuild complete!');
}

main().catch(console.error);
