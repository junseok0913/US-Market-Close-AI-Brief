#!/usr/bin/env node

import { execFileSync } from 'child_process';
import fs from 'fs';
import path from 'path';

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith('--')) continue;

    const key = token.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith('--')) {
      args[key] = true;
      continue;
    }
    args[key] = next;
    i += 1;
  }
  return args;
}

async function loadChromium() {
  try {
    const playwrightTest = await import('@playwright/test');
    if (playwrightTest?.chromium) return playwrightTest.chromium;
  } catch {
    // no-op
  }

  try {
    const playwright = await import('playwright');
    if (playwright?.chromium) return playwright.chromium;
  } catch {
    // no-op
  }

  throw new Error(
    'Playwright is not installed. Install with: cd web && npm install --save-dev @playwright/test',
  );
}

function withRenderParams(rawUrl, slideIndex) {
  const parsed = new URL(rawUrl);
  parsed.searchParams.set('render', '1');
  parsed.searchParams.set('slide', String(slideIndex));
  return parsed.toString();
}

function toNumber(value, fallback = 0) {
  if (typeof value !== 'number') return fallback;
  if (!Number.isFinite(value)) return fallback;
  return value;
}

function buildDurations(meta) {
  const slides = Array.isArray(meta.slides) ? meta.slides : [];
  const totalDuration = Math.max(toNumber(meta.duration, 0), 1);
  if (slides.length === 0) {
    return {
      totalDuration,
      durations: [],
    };
  }

  const durations = slides.map((slide, index) => {
    const startSec = Math.max(toNumber(slide.startSec, 0), 0);
    const nextStartSec =
      index + 1 < slides.length ? Math.max(toNumber(slides[index + 1]?.startSec, totalDuration), 0) : totalDuration;
    const endSec = Math.max(toNumber(slide.endSec, nextStartSec), nextStartSec);
    return Math.max(0.2, endSec - startSec);
  });

  return {
    totalDuration,
    durations,
  };
}

function ffmpegSafePath(filePath) {
  return filePath.replace(/'/g, "'\\''");
}

function writeConcatFile(concatPath, frames) {
  const lines = [];
  for (let i = 0; i < frames.length; i += 1) {
    const frame = frames[i];
    lines.push(`file '${ffmpegSafePath(frame.path)}'`);
    lines.push(`duration ${frame.duration.toFixed(3)}`);
  }
  if (frames.length > 0) {
    lines.push(`file '${ffmpegSafePath(frames[frames.length - 1].path)}'`);
  }
  fs.writeFileSync(concatPath, `${lines.join('\n')}\n`, 'utf-8');
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const url = args.url;
  const outputDir = args['output-dir'] ? path.resolve(args['output-dir']) : '';
  const timeoutMs = Number(args.timeout ?? 120000);
  const previewSeconds = Number(args['preview-seconds'] ?? 0);
  const concatFile = args['concat-file']
    ? path.resolve(args['concat-file'])
    : path.join(outputDir, 'shorts.concat.txt');
  const metaFile = args['meta-file']
    ? path.resolve(args['meta-file'])
    : path.join(outputDir, 'shorts.timeline.json');

  if (!url) {
    throw new Error('Missing required argument: --url');
  }
  if (!outputDir) {
    throw new Error('Missing required argument: --output-dir');
  }
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
    throw new Error(`Invalid --timeout: ${args.timeout}`);
  }
  if (!Number.isFinite(previewSeconds) || previewSeconds < 0) {
    throw new Error(`Invalid --preview-seconds: ${args['preview-seconds']}`);
  }

  fs.mkdirSync(outputDir, { recursive: true });
  const chromium = await loadChromium();
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1080, height: 1920 },
  });
  await context.addInitScript(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      nextjs-portal,
      [data-nextjs-dev-tools-button],
      [data-nextjs-toast],
      [data-nextjs-dialog-overlay],
      [data-nextjs-terminal] {
        display: none !important;
      }
    `;
    document.documentElement.appendChild(style);
  });
  const page = await context.newPage();

  const hideFixedBadges = async () => {
    await page.evaluate(() => {
      const candidates = Array.from(document.querySelectorAll('*'));
      for (const node of candidates) {
        if (!(node instanceof HTMLElement)) continue;
        const style = window.getComputedStyle(node);
        if (style.position !== 'fixed') continue;
        const rect = node.getBoundingClientRect();
        const nearBottomLeft =
          rect.left <= 140
          && rect.bottom >= window.innerHeight - 150
          && rect.width <= 240
          && rect.height <= 130;
        if (!nearBottomLeft) continue;
        node.style.display = 'none';
      }
    });
  };

  const applyBottomLeftMask = (imagePath) => {
    const maskedPath = `${imagePath}.masked.png`;
    execFileSync(
      'ffmpeg',
      [
        '-hide_banner',
        '-loglevel',
        'error',
        '-y',
        '-i',
        imagePath,
        '-vf',
        'drawbox=x=0:y=1868:w=220:h=52:color=black@1.0:t=fill',
        maskedPath,
      ],
      { stdio: 'ignore' },
    );
    fs.renameSync(maskedPath, imagePath);
  };

  try {
    const firstUrl = withRenderParams(url, 0);
    console.log(`[shorts] opening: ${firstUrl}`);
    await page.goto(firstUrl, { waitUntil: 'domcontentloaded', timeout: timeoutMs });
    await page.waitForSelector('[data-testid="yt-shorts-render-ready"]', { timeout: timeoutMs });
    await page.waitForFunction(
      () => {
        const meta = (window).__YT_SHORTS_RENDER_META;
        return Boolean(meta && Array.isArray(meta.slides) && meta.slides.length > 0);
      },
      { timeout: timeoutMs },
    );
    await hideFixedBadges();

    const meta = await page.evaluate(() => {
      return (window).__YT_SHORTS_RENDER_META || null;
    });

    if (!meta || !Array.isArray(meta.slides) || meta.slides.length === 0) {
      throw new Error('Unable to read shorts render metadata from page.');
    }

    const { totalDuration, durations } = buildDurations(meta);
    if (durations.length === 0) {
      throw new Error('No slide durations were computed for shorts.');
    }

    let captureDurations = durations;
    if (previewSeconds > 0) {
      let remaining = previewSeconds;
      captureDurations = [];
      for (const duration of durations) {
        if (remaining <= 0) break;
        const clipped = Math.min(duration, remaining);
        captureDurations.push(Math.max(0.2, clipped));
        remaining -= clipped;
      }
      if (captureDurations.length === 0) {
        captureDurations = [Math.max(0.2, Math.min(durations[0], previewSeconds))];
      }
      console.log(
        `[shorts] preview mode: ${previewSeconds.toFixed(1)}s (slides ${captureDurations.length}/${durations.length})`,
      );
    }

    const frames = [];
    for (let i = 0; i < captureDurations.length; i += 1) {
      const captureUrl = withRenderParams(url, i);
      await page.goto(captureUrl, { waitUntil: 'domcontentloaded', timeout: timeoutMs });
      await page.waitForSelector('[data-testid="yt-shorts-render-ready"]', { timeout: timeoutMs });
      await page.waitForFunction(
        (idx) => {
          const el = document.querySelector('[data-testid="yt-shorts-render-ready"]');
          return Number(el?.getAttribute('data-slide-index')) === idx;
        },
        i,
        { timeout: timeoutMs },
      );
      await hideFixedBadges();
      await page.waitForTimeout(240);

      const framePath = path.join(outputDir, `shorts_${String(i).padStart(3, '0')}.png`);
      await page.screenshot({
        path: framePath,
        fullPage: false,
      });
      applyBottomLeftMask(framePath);
      frames.push({
        path: framePath,
        duration: captureDurations[i],
      });
      console.log(
        `[shorts] captured ${i + 1}/${captureDurations.length} (${captureDurations[i].toFixed(1)}s)`,
      );
    }

    writeConcatFile(concatFile, frames);
    fs.writeFileSync(
      metaFile,
      JSON.stringify(
        {
          sourceUrl: url,
          totalDuration,
          previewSeconds,
          slideCount: frames.length,
          frames,
          concatFile,
        },
        null,
        2,
      ),
      'utf-8',
    );

    console.log(`[shorts] concat: ${concatFile}`);
    console.log(`[shorts] meta: ${metaFile}`);
  } finally {
    await context.close();
    await browser.close();
  }
}

main().catch((error) => {
  console.error(`[shorts] failed: ${error.message}`);
  process.exit(1);
});
