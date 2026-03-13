export interface RenderMotionValues {
  opacity?: number;
  x?: number;
  y?: number;
  scale?: number;
}

export interface RenderMotionTransition {
  delay?: number;
  duration?: number;
}

interface BuildRenderMotionStyleInput {
  elapsedSec: number;
  initial?: RenderMotionValues;
  animate?: RenderMotionValues;
  transition?: RenderMotionTransition;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function easeOutCubic(progress: number): number {
  return 1 - Math.pow(1 - progress, 3);
}

function interpolateNumber(from: number, to: number, progress: number): number {
  return from + (to - from) * progress;
}

function toFiniteNumber(value: number | undefined, fallback: number): number {
  return Number.isFinite(value) ? Number(value) : fallback;
}

function formatTransformNumber(value: number): string {
  const rounded = Math.round(value * 1000) / 1000;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(3).replace(/0+$/, "").replace(/\.$/, "");
}

export function extractStorageDateFromEpisodeJsonPath(rawPath: string): string | null {
  const normalized = String(rawPath || "").replace(/\\/g, "/");
  const podcastMatch = normalized.match(/\/podcast\/(\d{8})(?:\/|$)/);
  if (podcastMatch) {
    return podcastMatch[1];
  }

  const anyMatch = normalized.match(/(?:^|\/)(\d{8})(?:\/|$)/);
  return anyMatch ? anyMatch[1] : null;
}

export function buildRenderMotionStyle({
  elapsedSec,
  initial,
  animate,
  transition,
}: BuildRenderMotionStyleInput): Record<string, number | string> {
  const duration = Math.max(transition?.duration ?? 0.45, 0.001);
  const delay = Math.max(transition?.delay ?? 0, 0);
  const progress = easeOutCubic(clamp((elapsedSec - delay) / duration, 0, 1));

  const opacityStart = toFiniteNumber(initial?.opacity, animate?.opacity ?? 1);
  const opacityEnd = toFiniteNumber(animate?.opacity, opacityStart);
  const xStart = toFiniteNumber(initial?.x, animate?.x ?? 0);
  const xEnd = toFiniteNumber(animate?.x, xStart);
  const yStart = toFiniteNumber(initial?.y, animate?.y ?? 0);
  const yEnd = toFiniteNumber(animate?.y, yStart);
  const scaleStart = toFiniteNumber(initial?.scale, animate?.scale ?? 1);
  const scaleEnd = toFiniteNumber(animate?.scale, scaleStart);

  const opacity = interpolateNumber(opacityStart, opacityEnd, progress);
  const x = interpolateNumber(xStart, xEnd, progress);
  const y = interpolateNumber(yStart, yEnd, progress);
  const scale = interpolateNumber(scaleStart, scaleEnd, progress);

  const transforms: string[] = [];
  if (xStart !== 0 || xEnd !== 0) {
    transforms.push(`translateX(${formatTransformNumber(x)}px)`);
  }
  if (yStart !== 0 || yEnd !== 0) {
    transforms.push(`translateY(${formatTransformNumber(y)}px)`);
  }
  if (scaleStart !== 1 || scaleEnd !== 1) {
    transforms.push(`scale(${formatTransformNumber(scale)})`);
  }

  const style: Record<string, number | string> = {
    opacity,
  };
  if (transforms.length > 0) {
    style.transform = transforms.join(" ");
  }
  return style;
}
