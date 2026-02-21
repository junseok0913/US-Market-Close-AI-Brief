#!/usr/bin/env node

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

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const url = args.url;
  const output = args.output ? path.resolve(args.output) : '';
  const width = Number(args.width || 1920);
  const height = Number(args.height || 1080);
  const timeoutMs = Number(args.timeout || 120000);
  const readySelector = String(args['ready-selector'] || '[data-testid="yt-thumbnail-ready"]');

  if (!url) throw new Error('Missing required argument: --url');
  if (!output) throw new Error('Missing required argument: --output');
  if (!Number.isFinite(width) || width <= 0) throw new Error(`Invalid --width: ${args.width}`);
  if (!Number.isFinite(height) || height <= 0) throw new Error(`Invalid --height: ${args.height}`);

  fs.mkdirSync(path.dirname(output), { recursive: true });

  const chromium = await loadChromium();
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: 2,
  });

  try {
    const page = await context.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: timeoutMs });
    await page.waitForSelector(readySelector, { timeout: timeoutMs });
    await page.screenshot({
      path: output,
      type: 'png',
      fullPage: false,
      animations: 'disabled',
    });
    // eslint-disable-next-line no-console
    console.log(`[thumbnail] Saved: ${output}`);
  } finally {
    await context.close();
    await browser.close();
  }
}

main().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(`[thumbnail] Failed: ${error.message}`);
  process.exit(1);
});
