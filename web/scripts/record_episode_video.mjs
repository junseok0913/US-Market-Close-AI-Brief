#!/usr/bin/env node

import fs from 'fs';
import os from 'os';
import path from 'path';

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith('--')) {
      continue;
    }

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
    if (playwrightTest?.chromium) {
      return playwrightTest.chromium;
    }
  } catch {
    // no-op
  }

  try {
    const playwright = await import('playwright');
    if (playwright?.chromium) {
      return playwright.chromium;
    }
  } catch {
    // no-op
  }

  throw new Error(
    'Playwright is not installed. Install with: cd web && npm install --save-dev @playwright/test',
  );
}

function chooseRecordedWebm(recordDir) {
  const webmFiles = fs
    .readdirSync(recordDir)
    .filter((entry) => entry.endsWith('.webm'))
    .map((entry) => ({
      entry,
      mtimeMs: fs.statSync(path.join(recordDir, entry)).mtimeMs,
    }))
    .sort((a, b) => b.mtimeMs - a.mtimeMs);

  if (webmFiles.length === 0) {
    throw new Error('No .webm recording file produced by Playwright.');
  }
  return path.join(recordDir, webmFiles[0].entry);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const url = args.url;
  const outputPath = args.output ? path.resolve(args.output) : '';
  const maxSeconds = Number(args['max-seconds'] || 1800);
  const startDelaySeconds = Number(args['start-delay-seconds'] || 1);
  const stopOnTimeout = Boolean(args['stop-on-timeout']);
  const width = Number(args.width || 1920);
  const height = Number(args.height || 1080);

  if (!url) {
    throw new Error('Missing required argument: --url');
  }
  if (!outputPath) {
    throw new Error('Missing required argument: --output');
  }
  if (!Number.isFinite(maxSeconds) || maxSeconds <= 0) {
    throw new Error(`Invalid --max-seconds: ${args['max-seconds']}`);
  }
  if (!Number.isFinite(startDelaySeconds) || startDelaySeconds < 0) {
    throw new Error(`Invalid --start-delay-seconds: ${args['start-delay-seconds']}`);
  }
  if (!Number.isFinite(width) || width <= 0) {
    throw new Error(`Invalid --width: ${args.width}`);
  }
  if (!Number.isFinite(height) || height <= 0) {
    throw new Error(`Invalid --height: ${args.height}`);
  }

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  const recordDir = fs.mkdtempSync(path.join(os.tmpdir(), 'episode-record-'));

  const chromium = await loadChromium();
  const browser = await chromium.launch({
    headless: true,
    args: ['--autoplay-policy=no-user-gesture-required'],
  });
  let context = null;

  try {
    context = await browser.newContext({
      viewport: { width, height },
      recordVideo: {
        dir: recordDir,
        size: { width, height },
      },
    });

    const page = await context.newPage();

    console.log(`[record] Opening: ${url}`);
    // networkidle can hang on pages with long-lived widget/network activity.
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 120000 });
    await page.waitForSelector('audio', { state: 'attached', timeout: 30000 });

    // Ensure audio starts from 0 after the optional start delay.
    await page.evaluate(() => {
      const audio = document.querySelector('audio');
      if (!audio) return;
      audio.pause();
      try {
        audio.currentTime = 0;
      } catch {
        // ignore assignment failure
      }
    });

    if (startDelaySeconds > 0) {
      console.log(`[record] Waiting ${startDelaySeconds.toFixed(2)}s before audio start...`);
      await page.waitForTimeout(startDelaySeconds * 1000);
    }

    const startedByJs = await page.evaluate(async () => {
      const audio = document.querySelector('audio');
      if (!audio) return false;
      try {
        await audio.play();
        return !audio.paused;
      } catch {
        return false;
      }
    });

    if (!startedByJs) {
      console.log('[record] Initial JS autoplay failed. Retrying without manual button click.');
      let startedByRetry = false;
      for (let retry = 0; retry < 40; retry += 1) {
        await page.waitForTimeout(250);
        startedByRetry = await page.evaluate(async () => {
          const audio = document.querySelector('audio');
          if (!audio) return false;
          try {
            await audio.play();
            return !audio.paused;
          } catch {
            return false;
          }
        });
        if (startedByRetry) {
          console.log(`[record] Playback started by JS retry (${retry + 1}/40).`);
          break;
        }
      }
      if (!startedByRetry) {
        throw new Error('Autoplay failed after JS retries (manual button click disabled).');
      }
    }

    await page.waitForFunction(() => {
      const audio = document.querySelector('audio');
      return Boolean(audio && !audio.paused);
    }, { timeout: 30000 });

    console.log('[record] Playback started.');

    const startedAt = Date.now();
    let lastLogAt = 0;

    while (true) {
      const state = await page.evaluate(() => {
        const audio = document.querySelector('audio');
        if (!audio) {
          return null;
        }
        return {
          ended: audio.ended,
          paused: audio.paused,
          currentTime: audio.currentTime,
          duration: Number.isFinite(audio.duration) ? audio.duration : 0,
          errorCode: audio.error ? audio.error.code : null,
        };
      });

      if (!state) {
        throw new Error('Audio element disappeared during recording.');
      }

      if (state.errorCode) {
        throw new Error(`Audio playback error (code=${state.errorCode}).`);
      }

      if (state.ended) {
        console.log('[record] Playback ended.');
        break;
      }

      const elapsed = (Date.now() - startedAt) / 1000;
      if (elapsed > maxSeconds) {
        if (stopOnTimeout) {
          console.log(`[record] Max seconds reached (${maxSeconds}s). Saving partial recording.`);
          break;
        }
        throw new Error(`Recording timeout exceeded (${maxSeconds}s).`);
      }

      if (Date.now() - lastLogAt > 15000) {
        const durationLabel = state.duration > 0 ? state.duration.toFixed(1) : 'unknown';
        console.log(`[record] progress ${state.currentTime.toFixed(1)}s / ${durationLabel}s`);
        lastLogAt = Date.now();
      }

      await page.waitForTimeout(500);
    }

    await context.close();
    context = null;

    const recordedPath = chooseRecordedWebm(recordDir);
    fs.copyFileSync(recordedPath, outputPath);
    console.log(`[record] Saved: ${outputPath}`);
  } finally {
    if (context) {
      await context.close();
    }
    await browser.close();
    fs.rmSync(recordDir, { recursive: true, force: true });
  }
}

main().catch((error) => {
  console.error(`[record] Failed: ${error.message}`);
  process.exit(1);
});
