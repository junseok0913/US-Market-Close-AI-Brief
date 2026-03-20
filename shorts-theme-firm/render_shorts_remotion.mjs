#!/usr/bin/env node

import { spawnSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith("--")) continue;
    const key = token.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith("--")) {
      args[key] = true;
      continue;
    }
    args[key] = next;
    i += 1;
  }
  return args;
}

function toPositiveNumber(raw, fallback) {
  if (raw === undefined) return fallback;
  const value = Number(raw);
  if (!Number.isFinite(value) || value <= 0) return fallback;
  return value;
}

function resolveDurationSeconds(episode) {
  const direct = Number(episode?.durationSeconds || 0);
  if (Number.isFinite(direct) && direct > 0) return direct;

  const slides = Array.isArray(episode?.slides) ? episode.slides : [];
  const fromSlides = slides.reduce((max, slide) => {
    const end = Number(slide?.endSec || 0);
    if (!Number.isFinite(end)) return max;
    return Math.max(max, end);
  }, 0);
  if (fromSlides > 0) return fromSlides;

  const captions = Array.isArray(episode?.captions) ? episode.captions : [];
  const fromCaptions = captions.reduce((max, caption) => {
    const end = Number(caption?.endSec || 0);
    if (!Number.isFinite(end)) return max;
    return Math.max(max, end);
  }, 0);
  if (fromCaptions > 0) return fromCaptions;

  return 60;
}

function toSceneTiming(sectionTiming) {
  const sections = Array.isArray(sectionTiming?.sections) ? sectionTiming.sections : [];
  const mapping = {
    company_1: "fundamental",
    company_2: "growth",
    company_3: "risk",
    company_4: "sentiment",
  };
  const sceneTiming = {};

  for (const section of sections) {
    const name = String(section?.name || "").trim().toLowerCase();
    const key = mapping[name];
    const startSec = Number(section?.startSec);
    const endSec = Number(section?.endSec);
    if (!key || !Number.isFinite(startSec) || !Number.isFinite(endSec) || endSec <= startSec) {
      continue;
    }
    sceneTiming[key] = {
      startSec,
      endSec,
    };
  }

  return Object.keys(sceneTiming).length > 0 ? sceneTiming : null;
}

function detectBrowserExecutable() {
  const candidates = [
    process.env.SHORTS_THEME_FIRM_REMOTION_BROWSER_EXECUTABLE,
    process.env.REMOTION_BROWSER_EXECUTABLE,
    process.env.PUPPETEER_EXECUTABLE_PATH,
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary",
  ];

  for (const candidate of candidates) {
    if (candidate && fs.existsSync(candidate)) {
      return candidate;
    }
  }

  return "";
}

function resolveRemotionCommand(webRoot) {
  const localBin = path.resolve(webRoot, "node_modules/.bin/remotion");
  if (fs.existsSync(localBin)) {
    return { cmd: localBin, argsPrefix: [] };
  }
  return { cmd: "npx", argsPrefix: ["remotion"] };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const episodeJsonPath = args["episode-json"] ? path.resolve(args["episode-json"]) : "";
  const sectionTimingJsonPath = args["section-timing-json"]
    ? path.resolve(args["section-timing-json"])
    : path.resolve(path.dirname(episodeJsonPath || "."), "sections.timing.json");
  const outputPath = args.output ? path.resolve(args.output) : "";
  const fps = toPositiveNumber(args.fps, 30);
  const previewSeconds = toPositiveNumber(args["preview-seconds"], 0);
  const renderTimeoutMs = toPositiveNumber(
    args.timeout ?? process.env.SHORTS_THEME_FIRM_REMOTION_TIMEOUT_MS ?? process.env.REMOTION_TIMEOUT_MS,
    180000,
  );
  const concurrency = Math.max(
    1,
    Math.floor(
      toPositiveNumber(
        args.concurrency ??
        process.env.SHORTS_THEME_FIRM_REMOTION_CONCURRENCY ??
        process.env.REMOTION_CONCURRENCY,
        1,
      ),
    ),
  );
  const entryPoint = args["entry-point"] || "remotion/index.ts";
  const compositionId = args["composition-id"] || "BkngDebateShorts";
  const includeAudio = args["no-audio"] ? false : true;
  const logLevel = String(args.log || process.env.REMOTION_LOG_LEVEL || "info").trim();
  const browserExecutable = args["browser-executable"] || detectBrowserExecutable();

  if (!episodeJsonPath) {
    throw new Error("Missing --episode-json");
  }
  if (!outputPath) {
    throw new Error("Missing --output");
  }
  if (!fs.existsSync(episodeJsonPath)) {
    throw new Error(`Episode JSON not found: ${episodeJsonPath}`);
  }

  const raw = fs.readFileSync(episodeJsonPath, "utf-8");
  const episode = JSON.parse(raw);

  let sectionTiming = null;
  if (sectionTimingJsonPath && fs.existsSync(sectionTimingJsonPath)) {
    try {
      sectionTiming = JSON.parse(fs.readFileSync(sectionTimingJsonPath, "utf-8"));
      console.log(`[shorts-theme-firm] section-timing-json: ${sectionTimingJsonPath}`);
    } catch (error) {
      console.warn(
        `[shorts-theme-firm] warning: failed to parse section timing JSON (${sectionTimingJsonPath}): ${error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  const durationSeconds = resolveDurationSeconds(episode);
  const targetDuration =
    previewSeconds > 0 ? Math.max(0.2, Math.min(previewSeconds, durationSeconds)) : durationSeconds;
  const frameCount = Math.max(1, Math.ceil(targetDuration * fps));
  const frameRange = `0-${frameCount - 1}`;

  const date = String(episode?.date || "").replace(/[^0-9]/g, "");
  const audioSrc = args["audio-src"] || `audio/shorts-theme-firm/${date || "episode"}.mp3`;

  // BkngDebateShortsProps: episode JSON is the props directly.
  // Inject audioSrc from CLI (if not already set in the episode JSON).
  const props = {
    ...episode,
    audioSrc: episode.audioSrc || audioSrc,
    sceneTiming: toSceneTiming(sectionTiming) || episode.sceneTiming || undefined,
  };

  const outputDir = path.dirname(outputPath);
  fs.mkdirSync(outputDir, { recursive: true });

  const scriptDir = path.dirname(fileURLToPath(import.meta.url));
  const webRoot = path.resolve(scriptDir, "..", "web");
  const remotion = resolveRemotionCommand(webRoot);

  console.log(`[shorts-theme-firm] episode-json: ${episodeJsonPath}`);
  console.log(`[shorts-theme-firm] output: ${outputPath}`);
  console.log(`[shorts-theme-firm] fps: ${fps}`);
  console.log(`[shorts-theme-firm] duration: ${targetDuration.toFixed(3)}s (${frameCount} frames)`);
  console.log(`[shorts-theme-firm] frames: ${frameRange}`);
  console.log(`[shorts-theme-firm] timeout: ${Math.round(renderTimeoutMs)}ms`);
  console.log(`[shorts-theme-firm] concurrency: ${concurrency}`);
  if (browserExecutable) {
    console.log(`[shorts-theme-firm] browser-executable: ${browserExecutable}`);
  }
  console.log(
    `[shorts-theme-firm] remotion command: ${remotion.cmd} ${[...remotion.argsPrefix, "render"].join(" ")}`,
  );

  const remotionArgs = [
    ...remotion.argsPrefix,
    "render",
    entryPoint,
    compositionId,
    outputPath,
    "--props",
    JSON.stringify(props),
    "--frames",
    frameRange,
    "--timeout",
    String(Math.round(renderTimeoutMs)),
    "--concurrency",
    String(concurrency),
    "--log",
    logLevel || "info",
    "--overwrite",
  ];
  if (browserExecutable) {
    remotionArgs.push("--browser-executable", browserExecutable);
  }

  const result = spawnSync(remotion.cmd, remotionArgs, {
    cwd: webRoot,
    stdio: "inherit",
    env: process.env,
  });
  if (result.status !== 0) {
    throw new Error(`Remotion render failed (exit=${result.status})`);
  }

  console.log(`[shorts-theme-firm] saved: ${outputPath}`);
}

try {
  main();
} catch (error) {
  console.error(`[shorts-theme-firm] Failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
}
