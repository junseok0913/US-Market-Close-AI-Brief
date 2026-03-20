#!/usr/bin/env node

import {spawnSync} from "child_process";
import fs from "fs";
import path from "path";
import {fileURLToPath} from "url";

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

function detectBrowserExecutable() {
  const pinned = process.env.REMOTION_BROWSER_EXECUTABLE;
  if (pinned && fs.existsSync(pinned)) {
    return pinned;
  }
  return "";
}

function resolveRemotionCommand(webRoot) {
  const localBin = path.resolve(webRoot, "node_modules/.bin/remotion");
  if (fs.existsSync(localBin)) {
    return {cmd: localBin, argsPrefix: []};
  }
  return {cmd: "npx", argsPrefix: ["remotion"]};
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const propsJsonPath = args["props-json"]
    ? path.resolve(args["props-json"])
    : path.resolve("remotion/demo/bkng-debate-20260317-editorial.props.json");
  const outputPath = args.output ? path.resolve(args.output) : "";
  const fps = toPositiveNumber(args.fps, 30);
  const previewSeconds = toPositiveNumber(args["preview-seconds"], 0);
  const durationSeconds = toPositiveNumber(args["duration-seconds"], 60);
  const renderTimeoutMs = toPositiveNumber(
    args.timeout ?? process.env.REMOTION_TIMEOUT_MS,
    180000,
  );
  const concurrency = Math.max(
    1,
    Math.floor(toPositiveNumber(args.concurrency ?? process.env.REMOTION_CONCURRENCY, 2)),
  );
  const logLevel = String(args.log || process.env.REMOTION_LOG_LEVEL || "info").trim();
  const browserExecutable = args["browser-executable"] || detectBrowserExecutable();

  if (!outputPath) {
    throw new Error("Missing --output");
  }
  if (!fs.existsSync(propsJsonPath)) {
    throw new Error(`Props JSON not found: ${propsJsonPath}`);
  }

  const props = JSON.parse(fs.readFileSync(propsJsonPath, "utf8"));
  if (typeof args["audio-src"] === "string") {
    props.audioSrc = args["audio-src"];
    props.includeAudio = true;
  }
  if (args["no-audio"]) {
    props.includeAudio = false;
  }
  const targetDurationSeconds = Math.max(1, props.durationSeconds || durationSeconds);
  const effectiveSeconds =
    previewSeconds > 0
      ? Math.max(0.2, Math.min(previewSeconds, targetDurationSeconds))
      : targetDurationSeconds;
  const frameCount = Math.max(1, Math.ceil(effectiveSeconds * fps));
  const frameRange = `0-${frameCount - 1}`;

  fs.mkdirSync(path.dirname(outputPath), {recursive: true});
  const scriptDir = path.dirname(fileURLToPath(import.meta.url));
  const webRoot = path.resolve(scriptDir, "..");
  const remotion = resolveRemotionCommand(webRoot);
  const remotionArgs = [
    ...remotion.argsPrefix,
    "render",
    "remotion/bkng-debate-editorial.index.ts",
    "BkngDebateEditorialShort",
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

  console.log(`[bkng-editorial] props-json: ${propsJsonPath}`);
  console.log(`[bkng-editorial] output: ${outputPath}`);
  console.log(`[bkng-editorial] fps: ${fps}`);
  console.log(`[bkng-editorial] duration: ${effectiveSeconds.toFixed(3)}s (${frameCount} frames)`);
  console.log(`[bkng-editorial] frames: ${frameRange}`);
  console.log(`[bkng-editorial] cli-source: ${remotion.cmd === "npx" ? "npx remotion" : "local remotion"}`);

  const result = spawnSync(remotion.cmd, remotionArgs, {
    cwd: webRoot,
    stdio: "inherit",
    env: process.env,
  });

  if (result.status !== 0) {
    throw new Error(`BKNG editorial render failed (exit=${result.status})`);
  }

  console.log(`[bkng-editorial] saved: ${outputPath}`);
}

main();
