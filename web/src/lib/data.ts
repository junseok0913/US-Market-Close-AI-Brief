import { Episode, EpisodeListItem } from '@/types/episode';
import { ShortsEpisode, ShortsTimelineMeta } from '@/types/shorts';
import { promises as fs } from 'fs';
import path from 'path';

export async function getEpisodeList(): Promise<EpisodeListItem[]> {
  const filePath = path.join(process.cwd(), 'public', 'data', 'episodes.json');
  const data = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(data);
}

export async function getEpisode(date: string): Promise<Episode> {
  const filePath = path.join(process.cwd(), 'public', 'data', `${date}.json`);
  const data = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(data);
}

export async function getEpisodeDates(): Promise<string[]> {
  const dataDir = path.join(process.cwd(), 'public', 'data');
  const entries = await fs.readdir(dataDir, { withFileTypes: true });

  const fromFiles = entries
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((name) => /^\d{8}\.json$/.test(name))
    .map((name) => name.replace('.json', ''));

  let fromIndex: string[] = [];
  try {
    const episodes = await getEpisodeList();
    fromIndex = episodes
      .map((episode) => episode.date)
      .filter((date) => /^\d{8}$/.test(date));
  } catch {
    fromIndex = [];
  }

  return Array.from(new Set([...fromIndex, ...fromFiles])).sort();
}

export async function getShortsEpisode(date: string): Promise<ShortsEpisode> {
  const publicPath = path.join(process.cwd(), 'public', 'data', 'shorts', `${date}.json`);
  try {
    const data = await fs.readFile(publicPath, 'utf-8');
    return JSON.parse(data);
  } catch {
    const podcastFallbackPath = path.join(
      process.cwd(),
      '..',
      'podcast',
      date,
      'ko',
      'shorts',
      'slides.render.json',
    );
    const data = await fs.readFile(podcastFallbackPath, 'utf-8');
    return JSON.parse(data);
  }
}

export async function getShortsEpisodeDates(): Promise<string[]> {
  const shortsDir = path.join(process.cwd(), 'public', 'data', 'shorts');
  const dates = new Set<string>();

  try {
    const entries = await fs.readdir(shortsDir, { withFileTypes: true });
    entries
      .filter((entry) => entry.isFile())
      .map((entry) => entry.name)
      .filter((name) => /^\d{8}\.json$/.test(name))
      .map((name) => name.replace('.json', ''))
      .forEach((date) => dates.add(date));
  } catch {
    // ignore
  }

  const podcastDir = path.join(process.cwd(), '..', 'podcast');
  try {
    const entries = await fs.readdir(podcastDir, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory() || !/^\d{8}$/.test(entry.name)) continue;
      const renderPath = path.join(
        podcastDir,
        entry.name,
        'ko',
        'shorts',
        'slides.render.json',
      );
      const sourcePath = path.join(
        podcastDir,
        entry.name,
        'ko',
        'shorts',
        'script.json',
      );
      try {
        await fs.access(renderPath);
        dates.add(entry.name);
        continue;
      } catch {
        // try source script fallback
      }
      try {
        await fs.access(sourcePath);
        dates.add(entry.name);
      } catch {
        // ignore missing file
      }
    }
  } catch {
    // ignore
  }

  return Array.from(dates).sort();
}

export async function getShortsTimeline(date: string): Promise<ShortsTimelineMeta | null> {
  const candidates = [
    path.join(process.cwd(), 'public', 'data', 'shorts', `${date}.timeline.json`),
    path.join(process.cwd(), '..', 'podcast', date, 'ko', 'shorts', 'youtube', `shorts_${date}.timeline.json`),
    path.join(process.cwd(), '..', 'podcast', date, 'ko', 'shorts', 'youtube', 'shorts.timeline.json'),
  ];

  for (const candidate of candidates) {
    try {
      const data = await fs.readFile(candidate, 'utf-8');
      return JSON.parse(data);
    } catch {
      // try next candidate
    }
  }

  return null;
}
