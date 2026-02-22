import type { FC } from "react";
import {
  AbsoluteFill,
  Audio,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export type RemotionEpisode = {
  date: string;
  nutshell: string;
  user_tickers?: string[];
  chapter: Array<{
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
    }>;
    time: [number, number];
  }>;
};

export interface EpisodeCompositionProps {
  episode: RemotionEpisode;
  audioSrc?: string;
  includeAudio?: boolean;
  turnLeadMs?: number;
}

const CHAPTER_LABELS: Record<string, string> = {
  opening: "오프닝",
  theme: "메인 이슈",
  ticker: "종목 분석",
  closing: "클로징",
};

function formatClock(seconds: number): string {
  const safe = Number.isFinite(seconds) ? Math.max(0, seconds) : 0;
  const min = Math.floor(safe / 60);
  const sec = Math.floor(safe % 60);
  return `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

function formatDateKorean(date: string): string {
  const cleaned = String(date || "").replace(/[^0-9]/g, "");
  if (cleaned.length !== 8) return date;
  const year = cleaned.slice(0, 4);
  const month = Number(cleaned.slice(4, 6));
  const day = Number(cleaned.slice(6, 8));
  return `${year}년 ${month}월 ${day}일`;
}

function getCurrentScriptIndex(scripts: RemotionEpisode["scripts"], targetMs: number): number {
  if (scripts.length === 0) return -1;
  for (let i = scripts.length - 1; i >= 0; i -= 1) {
    const script = scripts[i];
    if (targetMs >= script.time[0]) {
      return i;
    }
  }
  return 0;
}

function getCurrentChapterName(episode: RemotionEpisode, scriptId: number): string {
  const chapter = episode.chapter.find((item) => scriptId >= item.start_id && scriptId <= item.end_id);
  return CHAPTER_LABELS[chapter?.name || ""] || "브리핑";
}

function buildSourceSignals(scripts: RemotionEpisode["scripts"]): Array<{ title: string; subtitle: string }> {
  const signals: Array<{ title: string; subtitle: string }> = [];
  const seen = new Set<string>();

  for (const script of scripts) {
    for (const source of script.sources || []) {
      const type = source.type || "source";
      const title = String(source.title || type).trim() || type;
      const subtitleParts = [type, source.ticker, source.date || source.filed_date].filter(Boolean);
      const subtitle = subtitleParts.join(" · ");
      const key = `${title}|${subtitle}`;
      if (seen.has(key)) continue;
      seen.add(key);
      signals.push({ title, subtitle });
      if (signals.length >= 6) return signals;
    }
  }

  return signals;
}

export const EpisodeComposition: FC<EpisodeCompositionProps> = ({
  episode,
  audioSrc,
  includeAudio = true,
  turnLeadMs = 550,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scripts = Array.isArray(episode?.scripts) ? episode.scripts : [];
  const totalDurationMs = scripts.length > 0 ? Math.max(0, scripts[scripts.length - 1].time[1]) : 0;

  const renderMs = Math.max(0, Math.round((frame / fps) * 1000 + turnLeadMs));
  const currentIndex = getCurrentScriptIndex(scripts, renderMs);
  const currentScript = currentIndex >= 0 ? scripts[currentIndex] : null;

  const displayMs = currentScript ? currentScript.time[0] : renderMs;
  const progressPercent = totalDurationMs > 0 ? Math.min((displayMs / totalDurationMs) * 100, 100) : 0;

  const chapterName = getCurrentChapterName(episode, currentScript?.id ?? 0);
  const scriptWindow =
    currentIndex >= 0
      ? scripts.slice(Math.max(0, currentIndex - 1), Math.min(scripts.length, currentIndex + 4))
      : [];
  const sourceSignals = buildSourceSignals(scriptWindow);
  const normalizedAudioSrc = audioSrc?.replace(/^\/+/, "");

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#f1f5f9",
        color: "#0f172a",
        fontFamily: "'Noto Sans KR', sans-serif",
      }}
    >
      {includeAudio && normalizedAudioSrc ? (
        <Audio src={staticFile(normalizedAudioSrc)} />
      ) : null}

      <div style={{ position: "absolute", inset: 0, padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
        <header
          style={{
            borderRadius: 20,
            border: "1px solid #e2e8f0",
            backgroundColor: "#ffffff",
            padding: "16px 20px",
            boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 10 }}>
            <div>
              <div style={{ fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "#64748b" }}>
                US Market Close Briefing
              </div>
              <div style={{ fontSize: 34, fontWeight: 800, marginTop: 2 }}>{formatDateKorean(episode.date)}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#334155" }}>
                {formatClock(displayMs / 1000)} / {formatClock(totalDurationMs / 1000)}
              </div>
              <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 2 }}>Remotion Episode Render</div>
            </div>
          </div>
          <div style={{ height: 8, borderRadius: 9999, overflow: "hidden", backgroundColor: "#e2e8f0" }}>
            <div
              style={{
                width: `${progressPercent}%`,
                height: "100%",
                background: "linear-gradient(90deg, #06b6d4 0%, #3b82f6 50%, #6366f1 100%)",
              }}
            />
          </div>
        </header>

        <main style={{ flex: 1, minHeight: 0, display: "grid", gridTemplateColumns: "3fr 1fr", gap: 16 }}>
          <section
            style={{
              borderRadius: 24,
              border: "1px solid #e2e8f0",
              backgroundColor: "#ffffff",
              padding: 28,
              boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div style={{ fontSize: 14, color: "#0ea5e9", fontWeight: 700 }}>{chapterName}</div>
              <h1 style={{ margin: "10px 0 0", fontSize: 52, lineHeight: 1.2, fontWeight: 800, color: "#0f172a" }}>
                {episode.nutshell || "미국 주식 장마감 브리핑"}
              </h1>
            </div>

            <div
              style={{
                marginTop: 20,
                borderRadius: 18,
                border: "1px solid #e2e8f0",
                backgroundColor: "#f8fafc",
                padding: 22,
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 700, color: "#334155", marginBottom: 10 }}>
                {currentScript ? `${currentScript.speaker} · Turn ${currentScript.id}` : "진행 중"}
              </div>
              <div style={{ fontSize: 36, lineHeight: 1.5, fontWeight: 600, color: "#0f172a", whiteSpace: "pre-wrap" }}>
                {currentScript?.text || "대본이 없습니다."}
              </div>
            </div>
          </section>

          <aside style={{ minHeight: 0, display: "flex", flexDirection: "column", gap: 12 }}>
            <div
              style={{
                borderRadius: 20,
                border: "1px solid #e2e8f0",
                backgroundColor: "#ffffff",
                padding: 14,
                boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
              }}
            >
              <div style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "#64748b" }}>
                Live Script
              </div>
              <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8, maxHeight: 390, overflow: "hidden" }}>
                {scriptWindow.length > 0 ? (
                  scriptWindow.map((script) => {
                    const isCurrent = script.id === currentScript?.id;
                    return (
                      <div
                        key={script.id}
                        style={{
                          borderRadius: 12,
                          border: `1px solid ${isCurrent ? "#bae6fd" : "#e2e8f0"}`,
                          backgroundColor: isCurrent ? "#e0f2fe" : "#f8fafc",
                          padding: "8px 10px",
                        }}
                      >
                        <div style={{ fontSize: 11, fontWeight: 700, color: "#475569", marginBottom: 3 }}>
                          {script.speaker}
                        </div>
                        <div style={{ fontSize: 14, lineHeight: 1.45, color: "#1e293b" }}>{script.text}</div>
                      </div>
                    );
                  })
                ) : (
                  <div style={{ fontSize: 13, color: "#64748b" }}>표시할 대본이 없습니다.</div>
                )}
              </div>
            </div>

            <div
              style={{
                borderRadius: 20,
                border: "1px solid #e2e8f0",
                backgroundColor: "#ffffff",
                padding: 14,
                boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
                flex: 1,
                minHeight: 0,
              }}
            >
              <div style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "#64748b" }}>
                Source Signals
              </div>
              <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8, maxHeight: 190, overflow: "hidden" }}>
                {sourceSignals.length > 0 ? (
                  sourceSignals.map((signal, idx) => (
                    <div key={`${signal.title}-${idx}`} style={{ borderRadius: 10, border: "1px solid #e2e8f0", background: "#f8fafc", padding: 8 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#334155", lineHeight: 1.35 }}>{signal.title}</div>
                      <div style={{ marginTop: 2, fontSize: 10, color: "#64748b", lineHeight: 1.3 }}>{signal.subtitle || "source"}</div>
                    </div>
                  ))
                ) : (
                  <div style={{ fontSize: 13, color: "#64748b" }}>현재 구간 소스가 없습니다.</div>
                )}
              </div>
            </div>
          </aside>
        </main>
      </div>
    </AbsoluteFill>
  );
};
