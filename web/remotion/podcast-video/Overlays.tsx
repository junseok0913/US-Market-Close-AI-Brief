import type { FC } from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS, formatMs, resolveChapterMeta, type ChapterMetaMap } from "./styles";

export const Header: FC<{
  date: string;
  nutshell: string;
  chapterName: string;
  currentTimeMs: number;
  totalDurationMs: number;
  chapterMetaMap?: ChapterMetaMap;
}> = ({ date, nutshell, chapterName, currentTimeMs, totalDurationMs, chapterMetaMap }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const chapter = resolveChapterMeta(chapterName, chapterMetaMap);

  const enterProgress = spring({ frame, fps, config: { damping: 200 } });
  const translateY = interpolate(enterProgress, [0, 1], [-80, 0]);

  const formattedDate = date
    ? `${date.slice(0, 4)}.${date.slice(4, 6)}.${date.slice(6, 8)}`
    : "";

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 72,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 48px",
        transform: `translateY(${translateY}px)`,
        zIndex: 10,
        background:
          "linear-gradient(180deg, rgba(8,12,24,0.9) 0%, rgba(8,12,24,0.6) 70%, transparent 100%)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            backgroundColor: "rgba(239,68,68,0.15)",
            border: "1px solid rgba(239,68,68,0.3)",
            borderRadius: 6,
            padding: "4px 12px",
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              backgroundColor: "#ef4444",
              opacity: interpolate(
                Math.sin(frame * 0.08),
                [-1, 1],
                [0.4, 1],
              ),
            }}
          />
          <span
            style={{
              color: "#ef4444",
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: "0.1em",
              fontFamily: "'Space Grotesk', sans-serif",
            }}
          >
            LIVE
          </span>
        </div>

        <span
          style={{
            color: COLORS.textSecondary,
            fontSize: 15,
            fontWeight: 500,
            fontFamily: "'Space Grotesk', sans-serif",
          }}
        >
          {formattedDate}
        </span>

        <div
          style={{
            width: 1,
            height: 20,
            backgroundColor: COLORS.border,
          }}
        />

        <span
          style={{
            color: COLORS.text,
            fontSize: 16,
            fontWeight: 600,
            letterSpacing: "-0.02em",
          }}
        >
          장마감 브리핑
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <span
          style={{
            color: COLORS.textMuted,
            fontSize: 13,
            fontFamily: "'Space Grotesk', monospace",
          }}
        >
          {formatMs(currentTimeMs)} / {formatMs(totalDurationMs)}
        </span>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            backgroundColor: `${chapter.color}15`,
            border: `1px solid ${chapter.color}30`,
            borderRadius: 6,
            padding: "4px 14px",
          }}
        >
          <span style={{ fontSize: 12 }}>{chapter.icon}</span>
          <span
            style={{
              color: chapter.color,
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            {chapter.label}
          </span>
        </div>
      </div>
    </div>
  );
};

export const ProgressBar: FC<{
  progress: number;
  chapterColor: string;
}> = ({ progress, chapterColor }) => {
  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 5,
        backgroundColor: "rgba(30,41,59,0.6)",
        zIndex: 10,
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${Math.min(100, progress * 100)}%`,
          background: `linear-gradient(90deg, ${chapterColor}, ${COLORS.primary})`,
          boxShadow: `0 0 20px ${chapterColor}60, 0 0 6px ${chapterColor}40`,
          borderRadius: "0 2px 2px 0",
        }}
      />
    </div>
  );
};

export const ChapterTransition: FC<{
  chapterName: string;
  nutshell: string;
  chapterMetaMap?: ChapterMetaMap;
}> = ({ chapterName, nutshell, chapterMetaMap }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const chapter = resolveChapterMeta(chapterName, chapterMetaMap);

  const scaleIn = spring({
    frame,
    fps,
    config: { damping: 15, stiffness: 120 },
  });
  const fadeOut = interpolate(frame, [fps * 1.5, fps * 2.2], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const lineWidth = interpolate(
    spring({ frame, fps, config: { damping: 200 }, delay: 8 }),
    [0, 1],
    [0, 300],
  );
  const textSlideUp = spring({
    frame,
    fps,
    config: { damping: 200 },
    delay: 5,
  });

  const opacity = interpolate(scaleIn, [0, 0.3], [0, 1], {
    extrapolateRight: "clamp",
  }) * fadeOut;

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity,
        zIndex: 50,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "rgba(8,12,24,0.92)",
        }}
      />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 20,
          transform: `scale(${interpolate(scaleIn, [0, 1], [0.85, 1])})`,
          zIndex: 1,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            opacity: interpolate(textSlideUp, [0, 1], [0, 1]),
            transform: `translateY(${interpolate(textSlideUp, [0, 1], [20, 0])}px)`,
          }}
        >
          <span
            style={{
              fontSize: 20,
              color: chapter.color,
            }}
          >
            {chapter.icon}
          </span>
          <span
            style={{
              color: chapter.color,
              fontSize: 18,
              fontWeight: 700,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              fontFamily: "'Space Grotesk', sans-serif",
            }}
          >
            {chapter.label}
          </span>
        </div>

        <div
          style={{
            width: lineWidth,
            height: 2,
            background: `linear-gradient(90deg, transparent, ${chapter.color}, transparent)`,
          }}
        />

        <div
          style={{
            color: COLORS.text,
            fontSize: 42,
            fontWeight: 800,
            letterSpacing: "-0.03em",
            lineHeight: 1.3,
            textAlign: "center",
            maxWidth: 900,
            opacity: interpolate(textSlideUp, [0, 1], [0, 1]),
            transform: `translateY(${interpolate(textSlideUp, [0, 1], [30, 0])}px)`,
          }}
        >
          {nutshell}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const ChapterSidebar: FC<{
  chapters: Array<{ name: string; start_id: number; end_id: number }>;
  currentScriptId: number;
  chapterColor: string;
  chapterMetaMap?: ChapterMetaMap;
}> = ({ chapters, currentScriptId, chapterColor, chapterMetaMap }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const slideIn = spring({
    frame,
    fps,
    config: { damping: 200 },
    delay: 15,
  });
  const opacity = interpolate(slideIn, [0, 1], [0, 1]);
  const translateX = interpolate(slideIn, [0, 1], [-20, 0]);

  const currentChapterIdx = chapters.findIndex(
    (c) => currentScriptId >= c.start_id && currentScriptId <= c.end_id,
  );

  return (
    <div
      style={{
        position: "absolute",
        left: 16,
        top: 140,
        bottom: 100,
        width: 24,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        opacity,
        transform: `translateX(${translateX}px)`,
        zIndex: 7,
      }}
    >
      {chapters.map((chapter, idx) => {
        const meta = resolveChapterMeta(chapter.name, chapterMetaMap);
        const isCurrent = idx === currentChapterIdx;
        const isPast = idx < currentChapterIdx;

        let progressInChapter = 0;
        if (isCurrent) {
          const totalInChapter = chapter.end_id - chapter.start_id + 1;
          const done = currentScriptId - chapter.start_id;
          progressInChapter = Math.min(1, done / Math.max(1, totalInChapter));
        }

        return (
          <div
            key={chapter.name}
            style={{
              flex: 1,
              width: isCurrent ? 6 : 4,
              borderRadius: 3,
              backgroundColor: isPast
                ? `${meta.color}50`
                : isCurrent
                  ? `${meta.color}20`
                  : `${COLORS.border}30`,
              position: "relative",
              overflow: "hidden",
              transition: "width 0.3s",
            }}
          >
            {(isCurrent || isPast) && (
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: isPast ? "100%" : `${progressInChapter * 100}%`,
                  backgroundColor: meta.color,
                  borderRadius: 3,
                  boxShadow: isCurrent
                    ? `0 0 8px ${meta.color}60`
                    : undefined,
                }}
              />
            )}
            {isCurrent && (
              <div
                style={{
                  position: "absolute",
                  top: `${(1 - progressInChapter) * 100}%`,
                  left: "50%",
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  backgroundColor: meta.color,
                  transform: "translate(-50%, -50%)",
                  boxShadow: `0 0 12px ${meta.color}80`,
                  opacity: interpolate(
                    Math.sin(frame * 0.08),
                    [-1, 1],
                    [0.6, 1],
                  ),
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export const NutshellBanner: FC<{
  nutshell: string;
  chapterColor: string;
}> = ({ nutshell, chapterColor }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const slideIn = spring({
    frame,
    fps,
    config: { damping: 200 },
    delay: 10,
  });

  return (
    <div
      style={{
        position: "absolute",
        bottom: 50,
        left: 48,
        right: 48,
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "14px 24px",
        backgroundColor: "rgba(15,22,41,0.85)",
        border: `1px solid ${chapterColor}25`,
        borderRadius: 12,
        opacity: interpolate(slideIn, [0, 1], [0, 1]),
        transform: `translateY(${interpolate(slideIn, [0, 1], [30, 0])}px)`,
        zIndex: 8,
      }}
    >
      <div
        style={{
          width: 4,
          height: 28,
          borderRadius: 2,
          background: `linear-gradient(180deg, ${chapterColor}, ${COLORS.primary})`,
          flexShrink: 0,
        }}
      />
      <span
        style={{
          color: COLORS.textSecondary,
          fontSize: 13,
          fontWeight: 600,
          letterSpacing: "0.05em",
          flexShrink: 0,
        }}
      >
        TODAY
      </span>
      <span
        style={{
          color: COLORS.text,
          fontSize: 17,
          fontWeight: 600,
          letterSpacing: "-0.01em",
        }}
      >
        {nutshell}
      </span>
    </div>
  );
};
