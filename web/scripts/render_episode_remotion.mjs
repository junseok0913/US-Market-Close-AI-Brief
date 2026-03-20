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

function toInteger(raw, fallback = 0) {
  if (raw === undefined) return fallback;
  const value = Number(raw);
  if (!Number.isFinite(value)) return fallback;
  return Math.trunc(value);
}

function extractStorageDateFromEpisodeJsonPath(rawPath) {
  const normalized = String(rawPath || "").replace(/\\/g, "/");
  const podcastMatch = normalized.match(/\/podcast\/(\d{8})(?:\/|$)/);
  if (podcastMatch) {
    return podcastMatch[1];
  }
  const anyMatch = normalized.match(/(?:^|\/)(\d{8})(?:\/|$)/);
  return anyMatch ? anyMatch[1] : "";
}

function resolveDurationSeconds(episode, explicitDurationSeconds = 0) {
  if (Number.isFinite(explicitDurationSeconds) && explicitDurationSeconds > 0) {
    return explicitDurationSeconds;
  }

  const scripts = Array.isArray(episode?.scripts) ? episode.scripts : [];
  if (scripts.length > 0) {
    const last = scripts[scripts.length - 1];
    if (Array.isArray(last?.time) && Number.isFinite(Number(last.time[1]))) {
      const seconds = Number(last.time[1]) / 1000;
      if (seconds > 0) return seconds;
    }
  }

  const direct = Number(episode?.durationSeconds || 0);
  if (Number.isFinite(direct) && direct > 0) return direct;

  return 60;
}

function detectBrowserExecutable() {
  // Prefer Remotion's default browser unless the user explicitly pins one.
  const pinned = process.env.REMOTION_BROWSER_EXECUTABLE;
  if (pinned && fs.existsSync(pinned)) {
    return pinned;
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
  const outputPath = args.output ? path.resolve(args.output) : "";
  const fps = toPositiveNumber(args.fps, 30);
  const previewSeconds = toPositiveNumber(args["preview-seconds"], 0);
  const explicitDurationSeconds = toPositiveNumber(args["duration-seconds"], 0);
  const renderTimeoutMs = toPositiveNumber(
    args.timeout ?? process.env.YOUTUBE_REMOTION_TIMEOUT_MS ?? process.env.REMOTION_TIMEOUT_MS,
    180000,
  );
  const concurrency = Math.max(
    1,
    Math.floor(
      toPositiveNumber(
        args.concurrency ??
        process.env.YOUTUBE_REMOTION_CONCURRENCY ??
        process.env.REMOTION_CONCURRENCY,
        2,
      ),
    ),
  );
  const turnLeadMs = toInteger(args["turn-lead-ms"] ?? process.env.YOUTUBE_TURN_LEAD_MS, 550);
  const entryPoint = args["entry-point"] || "remotion/episode.index.ts";
  const compositionId = args["composition-id"] || "EpisodeComposition";
  const includeAudio = args["no-audio"] ? false : true;
  const chartDataJsonPath = args["chart-data-json"] ? path.resolve(args["chart-data-json"]) : "";
  const storageDate =
    String(args["storage-date"] || "").trim()
    || extractStorageDateFromEpisodeJsonPath(episodeJsonPath);
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

  const durationSeconds = resolveDurationSeconds(episode, explicitDurationSeconds);
  if (durationSeconds > 0) {
    episode.durationSeconds = durationSeconds;
  }
  const INTRO_SECONDS = 2; // 썸네일 인트로 2초 (PodcastVideoComposition INTRO_FRAMES=60 @ 30fps)
  const targetDuration =
    previewSeconds > 0 ? Math.max(0.2, Math.min(previewSeconds, durationSeconds)) : durationSeconds;
  const frameCount = Math.max(1, Math.ceil((targetDuration + INTRO_SECONDS) * fps));
  const frameRange = `0-${frameCount - 1}`;

  const date = String(episode?.date || "").replace(/[^0-9]/g, "");
  const audioSrc = args["audio-src"] || `audio/${date || "episode"}.mp3`;
  let chartDataMap = {};
  if (chartDataJsonPath) {
    if (!fs.existsSync(chartDataJsonPath)) {
      throw new Error(`Chart data JSON not found: ${chartDataJsonPath}`);
    }
    chartDataMap = JSON.parse(fs.readFileSync(chartDataJsonPath, "utf-8"));
  }

  const props = {
    episode,
    storageDate,
    audioSrc,
    includeAudio,
    turnLeadMs,
    chartDataMap,
  };

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  const scriptDir = path.dirname(fileURLToPath(import.meta.url));
  const webRoot = path.resolve(scriptDir, "..");

  console.log(`[remotion-episode] episode-json: ${episodeJsonPath}`);
  console.log(`[remotion-episode] output: ${outputPath}`);
  console.log(`[remotion-episode] fps: ${fps}`);
  console.log(
    `[remotion-episode] duration: ${targetDuration.toFixed(3)}s (${frameCount} frames)`,
  );
  console.log(`[remotion-episode] frames: ${frameRange}`);
  console.log(`[remotion-episode] turn-lead-ms: ${turnLeadMs}`);
  console.log(`[remotion-episode] timeout: ${Math.round(renderTimeoutMs)}ms`);
  console.log(`[remotion-episode] concurrency: ${concurrency}`);
  if (logLevel) {
    console.log(`[remotion-episode] log: ${logLevel}`);
  }
  if (browserExecutable) {
    console.log(`[remotion-episode] browser-executable: ${browserExecutable}`);
  }

  const remotion = resolveRemotionCommand(webRoot);
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
  console.log(
    `[remotion-episode] cli-source: ${remotion.cmd === "npx" ? "npx remotion" : "local (node_modules/.bin/remotion)"
    }`,
  );
  if (browserExecutable) {
    remotionArgs.push("--browser-executable", browserExecutable);
  }

  const result = spawnSync(remotion.cmd, remotionArgs, {
    cwd: webRoot,
    stdio: "inherit",
    env: process.env,
  });

  if (result.status !== 0) {
    throw new Error(`Remotion episode render failed (exit=${result.status})`);
  }

  console.log(`[remotion-episode] saved: ${outputPath}`);
}

try {
  main();
} catch (error) {
  console.error(
    `[remotion-episode] Failed: ${error instanceof Error ? error.message : String(error)}`,
  );
  process.exit(1);
}
