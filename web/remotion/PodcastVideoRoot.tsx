import { Composition, type CalculateMetadataFunction } from "remotion";
import {
  PodcastVideoComposition,
  INTRO_FRAMES,
  type PodcastEpisodeData,
  type ChartDataMap,
} from "./PodcastVideoComposition";
import { ThumbnailComposition } from "./ThumbnailComposition";
import defaultChartData from "../public/data/podcast-chart-20260317.json";
import rawEpisode from "../public/data/podcast-episode-20260317.json";

const defaultEpisode = rawEpisode as unknown as PodcastEpisodeData;
const DEFAULT_FPS = 30;

const calculatePodcastMetadata: CalculateMetadataFunction<{
  episode: PodcastEpisodeData;
}> = async ({ props }) => {
  const episode = props.episode;
  const scripts = Array.isArray(episode?.scripts) ? episode.scripts : [];
  const lastScript = scripts[scripts.length - 1];
  const timedEndMs =
    Array.isArray(lastScript?.time) && Number.isFinite(lastScript.time[1])
      ? Number(lastScript.time[1])
      : 60_000;
  const durationInFrames = Math.max(
    INTRO_FRAMES + DEFAULT_FPS,
    Math.ceil((timedEndMs / 1000) * DEFAULT_FPS) + INTRO_FRAMES,
  );
  return { durationInFrames };
};

export const PodcastVideoRemotionRoot = () => {
  return (
    <>
      <Composition
        id="PodcastVideoComposition"
        component={PodcastVideoComposition}
        width={1920}
        height={1080}
        fps={DEFAULT_FPS}
        durationInFrames={60 * DEFAULT_FPS + INTRO_FRAMES}
        calculateMetadata={calculatePodcastMetadata}
        defaultProps={{
          episode: defaultEpisode,
          includeAudio: false,
          chartDataMap: defaultChartData as unknown as ChartDataMap,
        }}
      />
      <Composition
        id="Thumbnail"
        component={ThumbnailComposition}
        width={1920}
        height={1080}
        fps={30}
        durationInFrames={1}
        defaultProps={{
          episode: defaultEpisode,
          chartDataMap: defaultChartData as unknown as ChartDataMap,
        }}
      />
    </>
  );
};
