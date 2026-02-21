import { Composition } from "remotion";
import { ShortsComposition, type RemotionShortsEpisode } from "./ShortsComposition";

const defaultEpisode: RemotionShortsEpisode = {
  date: "20260220",
  lang: "ko",
  title: "US Market Close",
  hook: "오늘 장 핵심 이슈를 60초로 정리합니다.",
  durationSeconds: 60,
  audioFile: "shorts20260220.mp3",
  slides: [
    {
      id: 0,
      phase: "hook",
      theme: "flash",
      startSec: 0,
      endSec: 15,
      eyebrow: "HOOK",
      headline: "시장 반전의 핵심",
      subheadline: "숏츠 샘플 프레임",
      body: "실행 시 실제 slides.render.json 값으로 대체됩니다.",
      bullets: ["핵심 수치", "핵심 배경"],
      tickers: ["^GSPC", "^IXIC"],
      highlights: ["+0.69%", "+0.90%"],
    },
  ],
  captions: [],
  sourceDigest: [],
  meta: {
    keyPoints: ["핵심 포인트"],
    featuredTickers: ["^GSPC"],
    sceneCount: 1,
  },
};

export const RemotionRoot = () => {
  return (
    <>
      <Composition
        id="ShortsComposition"
        component={ShortsComposition}
        width={1080}
        height={1920}
        fps={30}
        durationInFrames={18000}
        defaultProps={{
          episode: defaultEpisode,
          audioSrc: "audio/shorts/20260220.mp3",
          includeAudio: true,
        }}
      />
    </>
  );
};
