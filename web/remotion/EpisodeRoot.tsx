import { Composition } from "remotion";
import {
  EpisodeComposition,
  type RemotionEpisode,
} from "./EpisodeComposition";

const defaultEpisode: RemotionEpisode = {
  date: "20260220",
  nutshell: "대법원의 관세 제동에 불확실성 걷히며 증시 랠리",
  user_tickers: ["BLK"],
  chapter: [
    { name: "opening", start_id: 0, end_id: 5 },
    { name: "theme", start_id: 6, end_id: 20 },
    { name: "ticker", start_id: 21, end_id: 28 },
    { name: "closing", start_id: 29, end_id: 37 },
  ],
  scripts: [
    {
      id: 0,
      speaker: "진행자",
      text: "2월 20일 장마감 브리핑입니다.",
      sources: [],
      time: [0, 7891],
    },
    {
      id: 1,
      speaker: "해설자",
      text: "오늘 시장은 대법원 판결 이후 강한 상승세로 전환했습니다.",
      sources: [
        { type: "chart", ticker: "^GSPC", date: "2026-02-20" },
      ],
      time: [8391, 50202],
    },
  ],
};

export const EpisodeRemotionRoot = () => {
  return (
    <Composition
      id="EpisodeComposition"
      component={EpisodeComposition}
      width={1920}
      height={1080}
      fps={30}
      durationInFrames={108000}
      defaultProps={{
        episode: defaultEpisode,
        audioSrc: "audio/20260220.mp3",
        includeAudio: true,
        turnLeadMs: 550,
      }}
    />
  );
};
