import type { FC } from "react";
import {
  AbsoluteFill,
  Audio,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { MarketChartData } from "@/types/market-chart";
import { Background } from "./podcast-video/Background";
import {
  Header,
  ProgressBar,
  ChapterTransition,
  ChapterSidebar,
  NutshellBanner,
} from "./podcast-video/Overlays";
import { ScriptScene } from "./podcast-video/ScriptScene";
import { MarketTicker } from "./podcast-video/DataPanels";
import { resolveChapterMeta, type ChapterMetaMap } from "./podcast-video/styles";
import { ThumbnailComposition } from "./ThumbnailComposition";

/** 썸네일 인트로 길이 (프레임). 30fps 기준 2초 = 60프레임 */
export const INTRO_FRAMES = 60;

export type ChartDataMap = Record<string, MarketChartData>;

const fontFamily =
  "'Noto Sans KR', 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif";

export type PodcastScript = {
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
};

export type PodcastChapter = {
  name: string;
  start_id: number;
  end_id: number;
};

export type PodcastEpisodeData = {
  date: string;
  nutshell: string;
  durationSeconds?: number;
  user_tickers?: string[];
  news_tickers?: string[];
  chapter: PodcastChapter[];
  scripts: PodcastScript[];
  chapterMeta?: ChapterMetaMap;
};

export type PodcastVideoCompositionProps = {
  episode: PodcastEpisodeData;
  audioSrc?: string;
  includeAudio?: boolean;
  chartDataMap?: ChartDataMap;
};

type TimedScript = Omit<PodcastScript, "time"> & { time: [number, number] };

function hasValidTime(s: PodcastScript): s is TimedScript {
  return (
    Array.isArray(s.time) &&
    s.time.length === 2 &&
    Number.isFinite(s.time[0]) &&
    Number.isFinite(s.time[1])
  );
}

function getTimedScripts(scripts: PodcastScript[]): TimedScript[] {
  if (scripts.every(hasValidTime)) {
    return scripts as TimedScript[];
  }
  const totalMs = 60_000;
  const perMs = totalMs / Math.max(1, scripts.length);
  return scripts.map((s, i) => ({
    ...s,
    time: [i * perMs, (i + 1) * perMs] as [number, number],
  }));
}

function findChapter(
  chapters: PodcastChapter[],
  scriptId: number,
): PodcastChapter | undefined {
  return chapters.find(
    (c) => scriptId >= c.start_id && scriptId <= c.end_id,
  );
}

function isChapterStart(
  chapters: PodcastChapter[],
  scriptId: number,
): boolean {
  return chapters.some((c) => c.start_id === scriptId);
}

export const PodcastVideoComposition: FC<PodcastVideoCompositionProps> = ({
  episode,
  audioSrc,
  includeAudio = true,
  chartDataMap = {},
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const timedScripts = getTimedScripts(episode.scripts);
  const totalDurationMs =
    timedScripts.length > 0
      ? timedScripts[timedScripts.length - 1].time[1]
      : 60_000;

  // 인트로 이후의 실제 팟캐스트 재생 시간 (0 이상)
  const currentTimeMs = Math.max(0, ((frame - INTRO_FRAMES) / fps) * 1000);

  const activeScript =
    timedScripts.find(
      (s) => currentTimeMs >= s.time[0] && currentTimeMs < s.time[1],
    ) || timedScripts[timedScripts.length - 1];

  const activeChapter = findChapter(
    episode.chapter,
    activeScript?.id ?? 0,
  );
  const chapterName = activeChapter?.name || "opening";
  const chapterMetaMap = episode.chapterMeta;
  const chapterMeta = resolveChapterMeta(chapterName, chapterMetaMap);

  const prevScript =
    activeScript && activeScript.id > 0
      ? timedScripts.find((s) => s.id === activeScript.id - 1)
      : undefined;
  const prevChapter = prevScript
    ? findChapter(episode.chapter, prevScript.id)
    : undefined;
  const chapterJustChanged =
    activeScript &&
    isChapterStart(episode.chapter, activeScript.id) &&
    activeScript.id > 0;

  const normalizedAudioSrc = audioSrc?.replace(/^\/+/, "");

  const progress = currentTimeMs / totalDurationMs;

  return (
    <AbsoluteFill style={{ fontFamily, backgroundColor: "#080c18" }}>
      {includeAudio && normalizedAudioSrc && (
        <Sequence from={INTRO_FRAMES} layout="none">
          <Audio src={staticFile(normalizedAudioSrc)} />
        </Sequence>
      )}

      <Background chapterColor={chapterMeta.color} />

      <Header
        date={episode.date}
        nutshell={episode.nutshell}
        chapterName={chapterName}
        currentTimeMs={currentTimeMs}
        totalDurationMs={totalDurationMs}
        chapterMetaMap={chapterMetaMap}
      />

      <MarketTicker
        tickers={episode.news_tickers}
        chapterColor={chapterMeta.color}
        chartDataMap={chartDataMap}
      />

      <ChapterSidebar
        chapters={episode.chapter}
        currentScriptId={activeScript?.id ?? 0}
        chapterColor={chapterMeta.color}
        chapterMetaMap={chapterMetaMap}
      />

      {timedScripts.map((script) => {
        const startFrame = Math.round((script.time[0] / 1000) * fps) + INTRO_FRAMES;
        const endFrame = Math.round((script.time[1] / 1000) * fps) + INTRO_FRAMES;
        const scriptDuration = endFrame - startFrame;
        if (scriptDuration <= 0) return null;

        const prevS =
          script.id > 0
            ? timedScripts.find((s) => s.id === script.id - 1)
            : undefined;

        const scriptChapter = findChapter(episode.chapter, script.id);
        const scriptChapterMeta = resolveChapterMeta(
          scriptChapter?.name || "opening",
          chapterMetaMap,
        );

        return (
          <Sequence
            key={script.id}
            from={startFrame}
            durationInFrames={scriptDuration}
            premountFor={Math.round(fps * 0.5)}
          >
            <ScriptScene
              script={script}
              localFrame={Math.max(
                0,
                frame - startFrame,
              )}
              durationFrames={scriptDuration}
              chapterColor={scriptChapterMeta.color}
              prevSpeaker={prevS?.speaker}
              chartDataMap={chartDataMap}
              isOpening={scriptChapter?.name === "opening"}
            />
          </Sequence>
        );
      })}

      <NutshellBanner
        nutshell={episode.nutshell}
        chapterColor={chapterMeta.color}
      />

      {episode.chapter
        .filter((c) => c.start_id > 0)
        .map((chapter) => {
          const firstScript = timedScripts.find(
            (s) => s.id === chapter.start_id,
          );
          if (!firstScript) return null;

          const transitionStart = Math.max(
            INTRO_FRAMES,
            Math.round((firstScript.time[0] / 1000) * fps) + INTRO_FRAMES -
              Math.round(fps * 0.3),
          );

          return (
            <Sequence
              key={`chapter-${chapter.name}-${chapter.start_id}`}
              from={transitionStart}
              durationInFrames={Math.round(fps * 2.5)}
              premountFor={Math.round(fps * 0.3)}
            >
              <ChapterTransition
                chapterName={chapter.name}
                nutshell={episode.nutshell}
                chapterMetaMap={chapterMetaMap}
              />
            </Sequence>
          );
        })}

      <ProgressBar progress={progress} chapterColor={chapterMeta.color} />

      {/* ── 썸네일 인트로 오버레이 (처음 2초, 마지막 0.5초 페이드아웃) ── */}
      {frame < INTRO_FRAMES && (
        <AbsoluteFill
          style={{
            opacity: interpolate(
              frame,
              [INTRO_FRAMES - 15, INTRO_FRAMES],
              [1, 0],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
            ),
            zIndex: 9999,
          }}
        >
          <ThumbnailComposition episode={episode} chartDataMap={chartDataMap} />
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
