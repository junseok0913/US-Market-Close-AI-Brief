import type { FC } from "react";
import { Audio, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import YouTubeEpisodePlayer from "@/components/YouTubeEpisodePlayer";
import { RenderChartDataProvider } from "@/components/RenderChartDataContext";
import type { Episode, Source } from "@/types/episode";
import type { MarketChartData } from "@/types/market-chart";

export type RemotionEpisode = {
  date: string;
  nutshell: string;
  user_tickers?: string[];
  chapter?: Array<{
    name: "opening" | "theme" | "ticker" | "closing" | string;
    start_id: number;
    end_id: number;
  }>;
  scripts: Array<{
    id: number;
    speaker: string;
    text: string;
    sources?: Array<{
      type?: string;
      title?: string;
      ticker?: string;
      date?: string;
      filed_date?: string;
      start_date?: string;
      end_date?: string;
      pk?: string;
      id?: string;
      form?: string;
      accession_number?: string;
    }>;
    time?: [number, number] | null;
  }>;
  durationSeconds?: number;
};

export interface EpisodeCompositionProps {
  episode: RemotionEpisode;
  audioSrc?: string;
  includeAudio?: boolean;
  turnLeadMs?: number;
  storageDate?: string;
  chartDataMap?: Record<string, MarketChartData>;
}

type RemotionScript = RemotionEpisode["scripts"][number];
type TimedRemotionScript = Omit<RemotionScript, "time"> & { time: [number, number] };

function hasValidTime(script: RemotionScript): script is TimedRemotionScript {
  return (
    Array.isArray(script.time) &&
    script.time.length === 2 &&
    Number.isFinite(Number(script.time[0])) &&
    Number.isFinite(Number(script.time[1]))
  );
}

function estimateScriptWeight(script: RemotionScript): number {
  const textLength = String(script.text || "").replace(/\s+/g, "").length;
  return Math.max(20, textLength);
}

function normalizeScriptTimings(episode: RemotionEpisode): TimedRemotionScript[] {
  const scripts = Array.isArray(episode?.scripts) ? episode.scripts : [];
  if (scripts.length === 0) return [];

  if (scripts.every((script) => hasValidTime(script))) {
    return scripts.map((script) => {
      const start = Math.max(0, Number(script.time[0]));
      const end = Math.max(start, Number(script.time[1]));
      return { ...script, time: [start, end] };
    });
  }

  const totalDurationMs = Math.max(1000, Math.round(Number(episode?.durationSeconds || 60) * 1000));
  const weights = scripts.map((script) => estimateScriptWeight(script));
  const totalWeight = Math.max(1, weights.reduce((sum, weight) => sum + weight, 0));

  let cursor = 0;
  return scripts.map((script, index) => {
    const isLast = index === scripts.length - 1;
    const proportionalMs = Math.round((totalDurationMs * weights[index]) / totalWeight);
    const minSegmentMs = 800;
    const remainingMinMs = Math.max(0, scripts.length - index - 1) * minSegmentMs;
    const availableMs = Math.max(minSegmentMs, totalDurationMs - cursor - remainingMinMs);
    const segmentMs = isLast
      ? Math.max(minSegmentMs, totalDurationMs - cursor)
      : Math.max(minSegmentMs, Math.min(availableMs, proportionalMs));
    const start = cursor;
    const end = isLast ? totalDurationMs : Math.min(totalDurationMs, cursor + segmentMs);
    cursor = end;
    return {
      ...script,
      time: [start, Math.max(start + 1, end)],
    };
  });
}

function normalizeSpeaker(raw: string | undefined): Episode["scripts"][number]["speaker"] {
  return raw === "해설자" ? "해설자" : "진행자";
}

function normalizeSourceType(raw: string | undefined): Source["type"] {
  switch (raw) {
    case "chart":
    case "article":
    case "event":
    case "sec_filing":
      return raw;
    default:
      return "article";
  }
}

function normalizeSources(rawSources: RemotionScript["sources"]): Source[] {
  const sources = Array.isArray(rawSources) ? rawSources : [];
  return sources.map((source) => ({
    type: normalizeSourceType(source.type),
    title: source.title,
    ticker: source.ticker,
    date: source.date,
    filed_date: source.filed_date,
    start_date: source.start_date,
    end_date: source.end_date,
    pk: source.pk,
    id: source.id,
    form: source.form,
    accession_number: source.accession_number,
  }));
}

function normalizeChapterName(raw: string | undefined): Episode["chapter"][number]["name"] {
  switch (raw) {
    case "theme":
    case "ticker":
    case "closing":
      return raw;
    case "opening":
    default:
      return "opening";
  }
}

function toPlayerEpisode(episode: RemotionEpisode, scripts: TimedRemotionScript[]): Episode {
  return {
    date: episode.date,
    nutshell: episode.nutshell,
    user_tickers: Array.isArray(episode.user_tickers) ? episode.user_tickers : [],
    chapter: (Array.isArray(episode.chapter) ? episode.chapter : []).map((chapter) => ({
      name: normalizeChapterName(chapter.name),
      start_id: Number(chapter.start_id),
      end_id: Number(chapter.end_id),
    })),
    scripts: scripts.map((script) => ({
      id: Number(script.id),
      speaker: normalizeSpeaker(script.speaker),
      text: String(script.text || ""),
      sources: normalizeSources(script.sources),
      time: script.time,
    })),
  };
}

export const EpisodeComposition: FC<EpisodeCompositionProps> = ({
  episode,
  audioSrc,
  includeAudio = true,
  turnLeadMs = 550,
  storageDate,
  chartDataMap = {},
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const timedScripts = normalizeScriptTimings(episode);
  const totalDurationMs = timedScripts.length > 0
    ? Math.max(0, timedScripts[timedScripts.length - 1].time[1])
    : Math.max(0, Math.round(Number(episode.durationSeconds || 0) * 1000));
  const playerEpisode = toPlayerEpisode(episode, timedScripts);
  const normalizedAudioSrc = audioSrc?.replace(/^\/+/, "");

  return (
    <>
      {includeAudio && normalizedAudioSrc ? <Audio src={staticFile(normalizedAudioSrc)} /> : null}
      <RenderChartDataProvider value={chartDataMap}>
        <YouTubeEpisodePlayer
          episode={playerEpisode}
          storageDate={storageDate || episode.date}
          renderMode
          renderCurrentTimeSec={frame / fps}
          renderDurationSec={totalDurationMs / 1000}
          renderLeadMs={turnLeadMs}
        />
      </RenderChartDataProvider>
    </>
  );
};
