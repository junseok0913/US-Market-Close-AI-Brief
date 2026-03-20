import React from "react";
import {z} from "zod";
import {
  AbsoluteFill,
  Audio,
  Sequence,
  spring,
  staticFile,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const displayFontFamily =
  '"Montserrat", "Noto Sans KR", sans-serif';
const bodyFontFamily = '"Noto Sans KR", sans-serif';
const monoFontFamily = '"IBM Plex Mono", monospace';

const PulseMetricSchema = z.object({
  label: z.string(),
  value: z.string(),
  detail: z.string(),
  tone: z.enum(["up", "down", "flat"]),
});

const HookSchema = z.object({
  eyebrow: z.string(),
  headlineTop: z.string(),
  headlineBottom: z.string(),
  subheadline: z.string(),
  dayChange: z.string(),
});

const FundamentalMetricSchema = z.object({
  label: z.string(),
  value: z.string(),
  sub: z.string(),
  pct: z.number(),
});

const GrowthColumnSchema = z.object({
  label: z.string(),
  value: z.string(),
  pct: z.number(),
});

const RiskItemSchema = z.object({
  label: z.string(),
  detail: z.string(),
  highlight: z.string(),
});

const FinaleSchema = z.object({
  headline: z.string(),
  bullets: z.array(z.string()).length(3),
  cta: z.string(),
});

export const BkngDebateEditorialSchema = z.object({
  date: z.string(),
  ticker: z.string(),
  durationSeconds: z.number(),
  audioSrc: z.string().optional().default(""),
  includeAudio: z.boolean().optional().default(false),
  hook: HookSchema,
  marketPulse: z.object({
    headline: z.string(),
    metrics: z.array(PulseMetricSchema).length(3),
  }),
  fundamental: z.object({
    label: z.string(),
    stance: z.string(),
    confidence: z.number(),
    summary: z.string(),
    metrics: z.array(FundamentalMetricSchema).length(4),
  }),
  growth: z.object({
    label: z.string(),
    stance: z.string(),
    confidence: z.number(),
    summary: z.string(),
    columns: z.array(GrowthColumnSchema).length(4),
    footnote: z.string(),
  }),
  risk: z.object({
    label: z.string(),
    stance: z.string(),
    confidence: z.number(),
    summary: z.string(),
    items: z.array(RiskItemSchema).length(4),
    totalExposure: z.string(),
  }),
  sentiment: z.object({
    label: z.string(),
    stance: z.string(),
    confidence: z.number(),
    summary: z.string(),
    priceRange: z.object({
      low: z.number(),
      high: z.number(),
      close: z.number(),
      dayChangePct: z.number(),
    }),
    keywords: z.array(z.string()).length(4),
    insight: z.string(),
  }),
  finale: FinaleSchema,
});

export type BkngDebateEditorialProps = z.infer<
  typeof BkngDebateEditorialSchema
>;

const palette = {
  bg: "#04050a",
  bgSoft: "#0d111a",
  panel: "rgba(11, 14, 23, 0.78)",
  panelStrong: "rgba(10, 12, 19, 0.92)",
  text: "#f7f3eb",
  muted: "#b3bac9",
  cyan: "#7ce9ff",
  cyanSoft: "rgba(124, 233, 255, 0.18)",
  amber: "#ffb347",
  amberSoft: "rgba(255, 179, 71, 0.22)",
  red: "#ff6868",
  redSoft: "rgba(255, 104, 104, 0.22)",
  lime: "#b1ff6d",
  line: "rgba(255, 255, 255, 0.11)",
};

const sceneDurations = {
  hook: 150,
  market: 240,
  bull: 360,
  risk: 360,
  sentiment: 300,
  finale: 390,
};

const fullWidth = 1080;
const fullHeight = 1920;

const formatConfidence = (confidence: number) =>
  `${Math.round(confidence * 100)}%`;

const clampPct = (value: number) => Math.max(0, Math.min(100, value));

const useSceneMotion = (durationInFrames: number) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const enter = spring({
    frame,
    fps,
    config: {damping: 200},
    durationInFrames: Math.round(fps * 0.7),
  });
  const exit = spring({
    frame: frame - (durationInFrames - Math.round(fps * 0.7)),
    fps,
    config: {damping: 200},
    durationInFrames: Math.round(fps * 0.7),
  });
  const opacity = interpolate(
    frame,
    [0, 8, durationInFrames - 12, durationInFrames],
    [0, 1, 1, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );
  const translateY = interpolate(enter - exit, [-1, 0, 1], [50, 0, -50]);
  const scale = interpolate(enter + exit, [0, 1, 2], [0.97, 1, 0.985]);

  return {opacity, translateY, scale};
};

const FrameShell: React.FC<{
  title: string;
  kicker: string;
  subtitle?: string;
  tone: "cyan" | "amber" | "red";
  sceneNumber: string;
  children: React.ReactNode;
}> = ({title, kicker, subtitle, tone, sceneNumber, children}) => {
  const {durationInFrames} = useVideoConfig();
  const frame = useCurrentFrame();
  const toneColor =
    tone === "cyan" ? palette.cyan : tone === "amber" ? palette.amber : palette.red;
  const toneSoft =
    tone === "cyan"
      ? palette.cyanSoft
      : tone === "amber"
        ? palette.amberSoft
        : palette.redSoft;
  const motion = useSceneMotion(durationInFrames);
  const tickerShift = (frame * 6) % 520;

  return (
    <AbsoluteFill
      style={{
        padding: "138px 66px 86px",
        color: palette.text,
        opacity: motion.opacity,
        transform: `translateY(${motion.translateY}px) scale(${motion.scale})`,
      }}
    >
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(115deg, rgba(255,255,255,0.045) 0%, rgba(255,255,255,0.01) 40%, rgba(255,255,255,0.03) 100%)",
          border: `1px solid ${palette.line}`,
          borderRadius: 44,
          boxShadow: `0 28px 90px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255,255,255,0.08)`,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `
              linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px),
              linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)
            `,
            backgroundSize: "90px 90px",
            opacity: 0.16,
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at 18% 22%, rgba(255,255,255,0.10), transparent 36%), radial-gradient(circle at 88% 76%, rgba(255,255,255,0.08), transparent 34%)",
            mixBlendMode: "screen",
            opacity: 0.18,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: -120 + frame * 2,
            top: -180,
            width: 420,
            height: 420,
            borderRadius: 999,
            background: toneSoft,
            filter: "blur(90px)",
            opacity: 0.8,
          }}
        />
        <div
          style={{
            position: "absolute",
            right: -180 - frame * 1.3,
            bottom: -140,
            width: 500,
            height: 500,
            borderRadius: 999,
            background: "rgba(255,255,255,0.07)",
            filter: "blur(130px)",
            opacity: 0.36,
          }}
        />
      </AbsoluteFill>
      <div
        style={{
          position: "absolute",
          left: 66,
          right: 66,
          top: 42,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          zIndex: 10,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 18,
            fontFamily: monoFontFamily,
            fontSize: 24,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
          }}
        >
          <span style={{color: toneColor}}>{sceneNumber}</span>
          <span style={{color: palette.muted}}>{kicker}</span>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "10px 16px",
            borderRadius: 999,
            border: `1px solid ${palette.line}`,
            background: "rgba(255,255,255,0.04)",
            fontFamily: monoFontFamily,
            fontSize: 20,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
          }}
        >
          <span style={{color: palette.muted}}>Editorial Short</span>
          <span style={{color: toneColor}}>AI Debate</span>
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 66,
          right: 66,
          bottom: 34,
          height: 42,
          overflow: "hidden",
          borderTop: `1px solid ${palette.line}`,
          paddingTop: 10,
          display: "flex",
          alignItems: "center",
          fontFamily: monoFontFamily,
          fontSize: 18,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: palette.muted,
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 34,
            transform: `translateX(-${tickerShift}px)`,
            whiteSpace: "nowrap",
          }}
        >
          {Array.from({length: 12}).map((_, index) => (
            <span key={index}>
              Narrative vs Risk
              <span style={{color: toneColor}}> / </span>
              Connected Trip
              <span style={{color: toneColor}}> / </span>
              Regulation Pricing
            </span>
          ))}
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 66,
          top: 132,
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        <div
          style={{
            fontFamily: displayFontFamily,
            fontSize: 74,
            lineHeight: 1,
            letterSpacing: "-0.03em",
          }}
        >
          {title}
        </div>
        {subtitle ? (
          <div
            style={{
              fontFamily: bodyFontFamily,
              fontSize: 28,
              lineHeight: 1.4,
              color: palette.muted,
              maxWidth: 720,
            }}
          >
            {subtitle}
          </div>
        ) : null}
      </div>
      <div
        style={{
          position: "absolute",
          left: 66,
          right: 66,
          top: 318,
          bottom: 96,
          display: "flex",
          flexDirection: "column",
          zIndex: 5,
        }}
      >
        {children}
      </div>
    </AbsoluteFill>
  );
};

const TonePill: React.FC<{
  label: string;
  tone: "cyan" | "amber" | "red";
}> = ({label, tone}) => {
  const toneColor =
    tone === "cyan" ? palette.cyan : tone === "amber" ? palette.amber : palette.red;
  const toneSoft =
    tone === "cyan"
      ? palette.cyanSoft
      : tone === "amber"
        ? palette.amberSoft
        : palette.redSoft;
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        padding: "12px 18px",
        borderRadius: 999,
        background: toneSoft,
        border: `1px solid ${toneColor}44`,
        fontFamily: monoFontFamily,
        fontSize: 21,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color: toneColor,
      }}
    >
      {label}
    </div>
  );
};

const HookScene: React.FC<BkngDebateEditorialProps> = ({ticker, hook, date}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const priceCardIn = spring({
    frame: frame - 6,
    fps,
    config: {damping: 16, stiffness: 130},
  });
  const slantIn = spring({
    frame: frame - 14,
    fps,
    config: {damping: 200},
  });

  return (
    <FrameShell
      title="논쟁이 만든 급등"
      kicker={`${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)} / ${ticker}`}
      subtitle="한쪽은 AI 여행 OS를 보고, 다른 쪽은 규제가 비즈니스 모델을 깎아먹는다고 봅니다."
      tone="amber"
      sceneNumber="01"
    >
      <div style={{display: "flex", flex: 1, gap: 32}}>
        <div
          style={{
            flex: 1.25,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div style={{display: "flex", flexDirection: "column", gap: 18}}>
            <TonePill label={hook.eyebrow} tone="amber" />
            <div
              style={{
                fontFamily: displayFontFamily,
                fontSize: 132,
                lineHeight: 0.88,
                letterSpacing: "-0.05em",
                textShadow: "0 10px 35px rgba(0,0,0,0.35)",
              }}
            >
              <div>{hook.headlineTop}</div>
              <div style={{color: palette.amber}}>{hook.headlineBottom}</div>
            </div>
          </div>
          <div
            style={{
              position: "relative",
              width: 540,
              minHeight: 214,
              padding: "26px 28px 28px",
              background: "rgba(8, 11, 18, 0.86)",
              border: `1px solid ${palette.line}`,
              clipPath: "polygon(0 0, 100% 0, 88% 100%, 0 100%)",
              transform: `translateX(${interpolate(slantIn, [0, 1], [90, 0])}px)`,
            }}
          >
            <div
              style={{
                fontFamily: monoFontFamily,
                fontSize: 20,
                letterSpacing: "0.16em",
                color: palette.muted,
                textTransform: "uppercase",
                marginBottom: 14,
              }}
            >
              Investment tension
            </div>
            <div
              style={{
                fontFamily: bodyFontFamily,
                fontSize: 34,
                lineHeight: 1.35,
              }}
            >
              {hook.subheadline}
            </div>
          </div>
        </div>
        <div
          style={{
            width: 308,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            transform: `translateY(${interpolate(priceCardIn, [0, 1], [120, 0])}px)`,
          }}
        >
          <div
            style={{
              padding: "22px 24px 26px",
              borderRadius: 36,
              background: "linear-gradient(180deg, rgba(13, 18, 28, 0.96), rgba(9, 11, 18, 0.92))",
              border: `1px solid ${palette.line}`,
              boxShadow: "0 24px 45px rgba(0,0,0,0.35)",
            }}
          >
            <div
              style={{
                fontFamily: monoFontFamily,
                fontSize: 20,
                letterSpacing: "0.18em",
                color: palette.muted,
                textTransform: "uppercase",
              }}
            >
              Day change
            </div>
            <div
              style={{
                marginTop: 18,
                fontFamily: displayFontFamily,
                fontSize: 96,
                lineHeight: 0.9,
                color: palette.lime,
              }}
            >
              {hook.dayChange}
            </div>
            <div
              style={{
                marginTop: 18,
                height: 10,
                borderRadius: 999,
                background: "rgba(255,255,255,0.09)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${46 + (frame % 60)}%`,
                  height: "100%",
                  background: "linear-gradient(90deg, #8aff8f, #c8ff68)",
                  boxShadow: "0 0 20px rgba(200,255,104,0.45)",
                }}
              />
            </div>
          </div>
          <div
            style={{
              padding: "28px 22px",
              borderRadius: 32,
              border: `1px solid ${palette.line}`,
              background: "rgba(255,255,255,0.03)",
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            {[
              ["Bull", "AI 예약 성장"],
              ["Bear", "EU 규제 심화"],
              ["Tape", "3.48% 급등"],
            ].map(([label, text]) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  fontFamily: bodyFontFamily,
                  fontSize: 28,
                  lineHeight: 1.25,
                }}
              >
                <span
                  style={{
                    minWidth: 74,
                    fontFamily: monoFontFamily,
                    fontSize: 18,
                    letterSpacing: "0.14em",
                    color: palette.amber,
                    textTransform: "uppercase",
                  }}
                >
                  {label}
                </span>
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </FrameShell>
  );
};

const MarketScene: React.FC<BkngDebateEditorialProps> = ({marketPulse}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  return (
    <FrameShell
      title="먼저 시장 온도"
      kicker="Macro tape / 0317 close"
      subtitle={marketPulse.headline}
      tone="cyan"
      sceneNumber="02"
    >
      <div style={{display: "flex", flex: 1, gap: 26}}>
        {marketPulse.metrics.map((metric, index) => {
          const reveal = spring({
            frame: frame - index * 8,
            fps,
            config: {damping: 200},
          });
          const toneColor =
            metric.tone === "up"
              ? palette.cyan
              : metric.tone === "down"
                ? palette.red
                : palette.amber;
          return (
            <div
              key={metric.label}
              style={{
                flex: 1,
                borderRadius: 34,
                padding: "30px 26px 28px",
                background:
                  "linear-gradient(180deg, rgba(11,15,24,0.96), rgba(7,9,15,0.88))",
                border: `1px solid ${palette.line}`,
                transform: `translateY(${interpolate(reveal, [0, 1], [65, 0])}px)`,
                opacity: interpolate(reveal, [0, 1], [0.3, 1]),
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                minHeight: 580,
              }}
            >
              <div>
                <div
                  style={{
                    fontFamily: monoFontFamily,
                    fontSize: 21,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    color: palette.muted,
                  }}
                >
                  {metric.label}
                </div>
                <div
                  style={{
                    marginTop: 26,
                    fontFamily: displayFontFamily,
                    fontSize: 108,
                    lineHeight: 0.9,
                    color: toneColor,
                  }}
                >
                  {metric.value}
                </div>
              </div>
              <div style={{display: "flex", flexDirection: "column", gap: 18}}>
                <div
                  style={{
                    height: 9,
                    borderRadius: 999,
                    background: "rgba(255,255,255,0.07)",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${38 + ((frame + index * 19) % 45)}%`,
                      height: "100%",
                      background: toneColor,
                    }}
                  />
                </div>
                <div
                  style={{
                    fontFamily: bodyFontFamily,
                    fontSize: 29,
                    lineHeight: 1.35,
                    color: palette.text,
                  }}
                >
                  {metric.detail}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </FrameShell>
  );
};

const BullScene: React.FC<BkngDebateEditorialProps> = ({
  growth,
  fundamental,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  return (
    <FrameShell
      title="강세 논리의 설계도"
      kicker="Bull case / connected trip"
      subtitle="성장 서사는 분명 강력합니다. 그래서 더더욱 숫자와 사업 구조를 함께 보여줘야 합니다."
      tone="amber"
      sceneNumber="03"
    >
      <div style={{display: "flex", gap: 28, flex: 1}}>
        <div
          style={{
            flex: 1.02,
            padding: 28,
            borderRadius: 34,
            border: `1px solid ${palette.line}`,
            background:
              "linear-gradient(180deg, rgba(17,20,30,0.95), rgba(10,13,20,0.88))",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{display: "flex", justifyContent: "space-between", alignItems: "flex-start"}}>
            <div>
              <TonePill label={growth.label} tone="amber" />
              <div
                style={{
                  marginTop: 18,
                  fontFamily: displayFontFamily,
                  fontSize: 62,
                  lineHeight: 1,
                }}
              >
                {growth.stance}
              </div>
            </div>
            <div
              style={{
                padding: "14px 16px",
                borderRadius: 22,
                border: `1px solid ${palette.amber}55`,
                background: palette.amberSoft,
                fontFamily: monoFontFamily,
                fontSize: 20,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}
            >
              Conviction {formatConfidence(growth.confidence)}
            </div>
          </div>
          <div
            style={{
              marginTop: 18,
              fontFamily: bodyFontFamily,
              fontSize: 31,
              lineHeight: 1.42,
              color: palette.text,
            }}
          >
            {growth.summary}
          </div>
          <div
            style={{
              marginTop: 34,
              display: "flex",
              alignItems: "flex-end",
              gap: 18,
              height: 430,
            }}
          >
            {growth.columns.map((column, index) => {
              const rise = spring({
                frame: frame - 10 - index * 7,
                fps,
                config: {damping: 200},
              });
              const height = interpolate(
                rise,
                [0, 1],
                [0, clampPct(column.pct) * 2.8 + 72],
              );
              return (
                <div
                  key={column.label}
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 14,
                  }}
                >
                  <div
                    style={{
                      width: "100%",
                      height: 360,
                      display: "flex",
                      alignItems: "flex-end",
                    }}
                  >
                    <div
                      style={{
                        width: "100%",
                        height,
                        borderRadius: "28px 28px 14px 14px",
                        background:
                          index === 1
                            ? "linear-gradient(180deg, rgba(255,195,96,0.25), #ffb347)"
                            : "linear-gradient(180deg, rgba(124,233,255,0.24), #7ce9ff)",
                        boxShadow: "0 18px 30px rgba(0,0,0,0.24)",
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent: "center",
                        paddingTop: 18,
                      }}
                    >
                      <div
                        style={{
                          fontFamily: displayFontFamily,
                          fontSize: 42,
                          lineHeight: 1,
                          color: palette.bg,
                        }}
                      >
                        {column.value}
                      </div>
                    </div>
                  </div>
                  <div
                    style={{
                      fontFamily: bodyFontFamily,
                      fontSize: 28,
                      lineHeight: 1.2,
                      textAlign: "center",
                      color: palette.text,
                    }}
                  >
                    {column.label}
                  </div>
                </div>
              );
            })}
          </div>
          <div
            style={{
              marginTop: "auto",
              fontFamily: bodyFontFamily,
              fontSize: 22,
              lineHeight: 1.4,
              color: palette.muted,
            }}
          >
            {growth.footnote}
          </div>
        </div>
        <div
          style={{
            width: 350,
            padding: 28,
            borderRadius: 34,
            border: `1px solid ${palette.line}`,
            background: "rgba(8, 10, 16, 0.9)",
            display: "flex",
            flexDirection: "column",
            gap: 22,
          }}
        >
          <div style={{display: "flex", flexDirection: "column", gap: 14}}>
            <TonePill label={fundamental.label} tone="cyan" />
            <div
              style={{
                fontFamily: displayFontFamily,
                fontSize: 52,
                lineHeight: 1,
              }}
            >
              {fundamental.stance}
            </div>
            <div
              style={{
                fontFamily: bodyFontFamily,
                fontSize: 28,
                lineHeight: 1.4,
                color: palette.text,
              }}
            >
              {fundamental.summary}
            </div>
          </div>
          {fundamental.metrics.map((metric, index) => (
            <div
              key={metric.label}
              style={{
                padding: "20px 18px",
                borderRadius: 24,
                background: "rgba(255,255,255,0.04)",
                border: `1px solid ${palette.line}`,
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    fontFamily: bodyFontFamily,
                    fontSize: 24,
                    lineHeight: 1.2,
                    color: palette.muted,
                  }}
                >
                  {metric.label}
                </div>
                <div
                  style={{
                    fontFamily: displayFontFamily,
                    fontSize: 40,
                    lineHeight: 1,
                    color: index === 1 ? palette.cyan : palette.text,
                  }}
                >
                  {metric.value}
                </div>
              </div>
              <div
                style={{
                  height: 6,
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.08)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${clampPct(metric.pct)}%`,
                    height: "100%",
                    background:
                      index === 0
                        ? palette.amber
                        : index === 1
                          ? palette.cyan
                          : index === 2
                            ? palette.lime
                            : "rgba(255,255,255,0.7)",
                  }}
                />
              </div>
              <div
                style={{
                  fontFamily: bodyFontFamily,
                  fontSize: 21,
                  lineHeight: 1.35,
                  color: palette.muted,
                }}
              >
                {metric.sub}
              </div>
            </div>
          ))}
        </div>
      </div>
    </FrameShell>
  );
};

const RiskScene: React.FC<BkngDebateEditorialProps> = ({risk}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const exposureGlow = 0.3 + ((frame % 30) / 30) * 0.35;

  return (
    <FrameShell
      title="하지만 규제가 해자를 흔든다"
      kicker="Bear case / regulatory overhang"
      subtitle={risk.summary}
      tone="red"
      sceneNumber="04"
    >
      <div style={{display: "flex", gap: 28, flex: 1}}>
        <div
          style={{
            flex: 1.08,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 20,
          }}
        >
          {risk.items.map((item, index) => {
            const reveal = spring({
              frame: frame - index * 7,
              fps,
              config: {damping: 200},
            });
            return (
              <div
                key={item.label}
                style={{
                  padding: "26px 24px 24px",
                  borderRadius: 30,
                  border: `1px solid ${palette.red}3f`,
                  background:
                    "linear-gradient(180deg, rgba(27,11,16,0.95), rgba(12,10,16,0.9))",
                  boxShadow: `0 18px 42px rgba(0,0,0,0.3), inset 0 0 0 1px rgba(255,255,255,0.03)`,
                  transform: `translateY(${interpolate(reveal, [0, 1], [70, 0])}px)`,
                  opacity: interpolate(reveal, [0, 1], [0.15, 1]),
                  display: "flex",
                  flexDirection: "column",
                  gap: 18,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <div
                    style={{
                      fontFamily: monoFontFamily,
                      fontSize: 18,
                      letterSpacing: "0.16em",
                      textTransform: "uppercase",
                      color: palette.red,
                    }}
                  >
                    Risk 0{index + 1}
                  </div>
                  <div
                    style={{
                      padding: "10px 12px",
                      borderRadius: 999,
                      background: palette.redSoft,
                      border: `1px solid ${palette.red}33`,
                      fontFamily: monoFontFamily,
                      fontSize: 17,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                    }}
                  >
                    {item.highlight}
                  </div>
                </div>
                <div
                  style={{
                    fontFamily: displayFontFamily,
                    fontSize: 46,
                    lineHeight: 1,
                    letterSpacing: "-0.03em",
                  }}
                >
                  {item.label}
                </div>
                <div
                  style={{
                    fontFamily: bodyFontFamily,
                    fontSize: 28,
                    lineHeight: 1.38,
                    color: palette.text,
                  }}
                >
                  {item.detail}
                </div>
              </div>
            );
          })}
        </div>
        <div
          style={{
            width: 322,
            padding: "28px 24px",
            borderRadius: 34,
            border: `1px solid ${palette.red}44`,
            background:
              "linear-gradient(180deg, rgba(19,9,13,0.94), rgba(12,10,16,0.92))",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div style={{display: "flex", flexDirection: "column", gap: 18}}>
            <TonePill label="Systemic exposure" tone="red" />
            <div
              style={{
                fontFamily: displayFontFamily,
                fontSize: 84,
                lineHeight: 0.92,
                color: palette.red,
              }}
            >
              {risk.totalExposure}
            </div>
            <div
              style={{
                fontFamily: bodyFontFamily,
                fontSize: 28,
                lineHeight: 1.4,
                color: palette.text,
              }}
            >
              벌금 그 자체보다, 유럽 전역에서 이어지는 구조적 수익성 훼손이 더 큽니다.
            </div>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}
          >
            <div
              style={{
                fontFamily: monoFontFamily,
                fontSize: 20,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: palette.muted,
              }}
            >
              Risk pricing
            </div>
            <div
              style={{
                height: 16,
                borderRadius: 999,
                background: "rgba(255,255,255,0.08)",
                overflow: "hidden",
                boxShadow: `0 0 28px rgba(255,104,104,${exposureGlow})`,
              }}
            >
              <div
                style={{
                  width: `${72 + ((frame / 5) % 8)}%`,
                  height: "100%",
                  background: "linear-gradient(90deg, #ff6868, #ffb347)",
                }}
              />
            </div>
            <div
              style={{
                fontFamily: bodyFontFamily,
                fontSize: 22,
                lineHeight: 1.35,
                color: palette.muted,
              }}
            >
              규제와 소송이 동시에 발생하면 현금 창출력보다 할인율이 먼저 올라갑니다.
            </div>
          </div>
        </div>
      </div>
    </FrameShell>
  );
};

const SentimentScene: React.FC<BkngDebateEditorialProps> = ({sentiment}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const range = sentiment.priceRange.high - sentiment.priceRange.low || 1;
  const closePct =
    ((sentiment.priceRange.close - sentiment.priceRange.low) / range) * 100;

  return (
    <FrameShell
      title="시장 심리는 이미 서사에 취했다"
      kicker="Tape / reflexivity"
      subtitle={sentiment.summary}
      tone="cyan"
      sceneNumber="05"
    >
      <div style={{display: "flex", gap: 28, flex: 1}}>
        <div
          style={{
            flex: 1,
            padding: "28px 26px",
            borderRadius: 34,
            border: `1px solid ${palette.line}`,
            background:
              "linear-gradient(180deg, rgba(11,14,23,0.96), rgba(8,10,16,0.9))",
            display: "flex",
            flexDirection: "column",
            gap: 28,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
            }}
          >
            <div
              style={{
                fontFamily: displayFontFamily,
                fontSize: 64,
                lineHeight: 0.98,
              }}
            >
              ${sentiment.priceRange.close.toLocaleString()}
            </div>
            <div
              style={{
                fontFamily: monoFontFamily,
                fontSize: 22,
                letterSpacing: "0.12em",
                color: palette.cyan,
                textTransform: "uppercase",
              }}
            >
              Close {sentiment.priceRange.dayChangePct > 0 ? "+" : ""}
              {sentiment.priceRange.dayChangePct.toFixed(2)}%
            </div>
          </div>
          <div
            style={{
              position: "relative",
              height: 260,
              borderRadius: 26,
              background: "rgba(255,255,255,0.03)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 20,
                border: `1px solid ${palette.line}`,
                borderRadius: 22,
              }}
            />
            <div
              style={{
                position: "absolute",
                left: 70,
                right: 70,
                top: 126,
                height: 2,
                background: `linear-gradient(90deg, ${palette.red}, ${palette.cyan})`,
              }}
            />
            <div
              style={{
                position: "absolute",
                left: 70,
                width: `${closePct * 0.01 * (fullWidth - 404)}px`,
                top: 126,
                height: 2,
                background: "rgba(255,255,255,0.14)",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: `calc(70px + ${closePct}% * ((100% - 140px) / 100))`,
                top: 62,
                width: 4,
                height: 128,
                background: palette.cyan,
                boxShadow: "0 0 26px rgba(124,233,255,0.55)",
                transform: `translateX(${interpolate(
                  spring({frame: frame - 12, fps, config: {damping: 200}}),
                  [0, 1],
                  [-110, 0],
                )}px)`,
              }}
            />
            <div
              style={{
                position: "absolute",
                left: 60,
                bottom: 28,
                fontFamily: monoFontFamily,
                fontSize: 18,
                letterSpacing: "0.12em",
                color: palette.muted,
              }}
            >
              LOW ${sentiment.priceRange.low.toLocaleString()}
            </div>
            <div
              style={{
                position: "absolute",
                right: 60,
                bottom: 28,
                fontFamily: monoFontFamily,
                fontSize: 18,
                letterSpacing: "0.12em",
                color: palette.muted,
              }}
            >
              HIGH ${sentiment.priceRange.high.toLocaleString()}
            </div>
          </div>
          <div
            style={{
              fontFamily: bodyFontFamily,
              fontSize: 31,
              lineHeight: 1.42,
            }}
          >
            {sentiment.insight}
          </div>
        </div>
        <div
          style={{
            width: 330,
            display: "flex",
            flexDirection: "column",
            gap: 18,
          }}
        >
          {sentiment.keywords.map((keyword, index) => {
            const reveal = spring({
              frame: frame - index * 6,
              fps,
              config: {damping: 16, stiffness: 120},
            });
            return (
              <div
                key={keyword}
                style={{
                  padding: "20px 22px",
                  borderRadius: 999,
                  border: `1px solid ${palette.cyan}44`,
                  background: "rgba(11,20,26,0.82)",
                  transform: `translateX(${interpolate(reveal, [0, 1], [80, 0])}px)`,
                  opacity: interpolate(reveal, [0, 1], [0, 1]),
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    fontFamily: displayFontFamily,
                    fontSize: 38,
                    lineHeight: 1,
                  }}
                >
                  {keyword}
                </span>
                <span
                  style={{
                    fontFamily: monoFontFamily,
                    fontSize: 18,
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    color: palette.cyan,
                  }}
                >
                  active
                </span>
              </div>
            );
          })}
          <div
            style={{
              marginTop: 12,
              padding: "26px 24px",
              borderRadius: 30,
              border: `1px solid ${palette.line}`,
              background: "rgba(255,255,255,0.03)",
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}
          >
            <div
              style={{
                fontFamily: monoFontFamily,
                fontSize: 18,
                letterSpacing: "0.14em",
                color: palette.muted,
                textTransform: "uppercase",
              }}
            >
              Narrative heat
            </div>
            <div
              style={{
                fontFamily: displayFontFamily,
                fontSize: 72,
                lineHeight: 0.92,
                color: palette.cyan,
              }}
            >
              {formatConfidence(sentiment.confidence)}
            </div>
            <div
              style={{
                fontFamily: bodyFontFamily,
                fontSize: 26,
                lineHeight: 1.38,
                color: palette.text,
              }}
            >
              가격이 서사를 강화하는 반사성 구간이라, 작은 악재에도 되돌림 폭이 커질 수 있습니다.
            </div>
          </div>
        </div>
      </div>
    </FrameShell>
  );
};

const FinaleScene: React.FC<BkngDebateEditorialProps> = ({
  ticker,
  fundamental,
  growth,
  risk,
  sentiment,
  finale,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const stances = [
    {
      label: fundamental.label,
      stance: fundamental.stance,
      confidence: fundamental.confidence,
      tone: "cyan" as const,
    },
    {
      label: growth.label,
      stance: growth.stance,
      confidence: growth.confidence,
      tone: "amber" as const,
    },
    {
      label: risk.label,
      stance: risk.stance,
      confidence: risk.confidence,
      tone: "red" as const,
    },
    {
      label: sentiment.label,
      stance: sentiment.stance,
      confidence: sentiment.confidence,
      tone: "cyan" as const,
    },
  ];

  return (
    <FrameShell
      title="전문가 4명의 결론"
      kicker={`Verdict / ${ticker}`}
      subtitle="숫자, 서사, 규제, 테이프를 한 화면에서 정리합니다."
      tone="amber"
      sceneNumber="06"
    >
      <div style={{display: "flex", flexDirection: "column", gap: 24, flex: 1}}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 18,
          }}
        >
          {stances.map((stance, index) => {
            const reveal = spring({
              frame: frame - index * 6,
              fps,
              config: {damping: 200},
            });
            const toneColor =
              stance.tone === "cyan"
                ? palette.cyan
                : stance.tone === "amber"
                  ? palette.amber
                  : palette.red;
            return (
              <div
                key={stance.label}
                style={{
                  padding: "22px 18px",
                  borderRadius: 28,
                  background: "rgba(255,255,255,0.03)",
                  border: `1px solid ${palette.line}`,
                  transform: `translateY(${interpolate(reveal, [0, 1], [46, 0])}px)`,
                  opacity: interpolate(reveal, [0, 1], [0.1, 1]),
                }}
              >
                <div
                  style={{
                    fontFamily: monoFontFamily,
                    fontSize: 17,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: palette.muted,
                  }}
                >
                  {stance.label}
                </div>
                <div
                  style={{
                    marginTop: 16,
                    fontFamily: displayFontFamily,
                    fontSize: 38,
                    lineHeight: 1,
                    color: toneColor,
                  }}
                >
                  {stance.stance}
                </div>
                <div
                  style={{
                    marginTop: 18,
                    height: 8,
                    borderRadius: 999,
                    background: "rgba(255,255,255,0.08)",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${stance.confidence * 100}%`,
                      height: "100%",
                      background: toneColor,
                    }}
                  />
                </div>
                <div
                  style={{
                    marginTop: 10,
                    fontFamily: monoFontFamily,
                    fontSize: 16,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: toneColor,
                  }}
                >
                  conviction {formatConfidence(stance.confidence)}
                </div>
              </div>
            );
          })}
        </div>
        <div style={{display: "flex", gap: 24, flex: 1}}>
          <div
            style={{
              flex: 1.1,
              padding: "34px 30px",
              borderRadius: 36,
              border: `1px solid ${palette.line}`,
              background:
                "linear-gradient(180deg, rgba(17,19,28,0.96), rgba(10,12,18,0.92))",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div style={{display: "flex", flexDirection: "column", gap: 18}}>
              <div
                style={{
                  fontFamily: displayFontFamily,
                  fontSize: 74,
                  lineHeight: 0.95,
                }}
              >
                {finale.headline.split("\n").map((line) => (
                  <div key={line}>{line}</div>
                ))}
              </div>
              <div
                style={{
                  fontFamily: bodyFontFamily,
                  fontSize: 30,
                  lineHeight: 1.46,
                  color: palette.text,
                }}
              >
                현재 화면은 성장 스토리에 끌리지만, 가격 결정력을 흔드는 규제가 더 오래 남는 변수로 보입니다.
              </div>
            </div>
            <div
              style={{
                fontFamily: monoFontFamily,
                fontSize: 20,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: palette.amber,
              }}
            >
              {finale.cta}
            </div>
          </div>
          <div
            style={{
              width: 360,
              display: "flex",
              flexDirection: "column",
              gap: 18,
            }}
          >
            {finale.bullets.map((bullet, index) => (
              <div
                key={bullet}
                style={{
                  flex: 1,
                  padding: "24px 22px",
                  borderRadius: 28,
                  border: `1px solid ${palette.line}`,
                  background: "rgba(255,255,255,0.03)",
                  display: "flex",
                  gap: 16,
                }}
              >
                <div
                  style={{
                    width: 46,
                    height: 46,
                    flexShrink: 0,
                    borderRadius: 999,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background:
                      index === 0
                        ? palette.cyanSoft
                        : index === 1
                          ? palette.redSoft
                          : palette.amberSoft,
                    color:
                      index === 0
                        ? palette.cyan
                        : index === 1
                          ? palette.red
                          : palette.amber,
                    fontFamily: monoFontFamily,
                    fontSize: 18,
                  }}
                >
                  0{index + 1}
                </div>
                <div
                  style={{
                    fontFamily: bodyFontFamily,
                    fontSize: 28,
                    lineHeight: 1.36,
                    color: palette.text,
                  }}
                >
                  {bullet}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </FrameShell>
  );
};

const AnimatedBackdrop: React.FC<{ticker: string}> = ({ticker}) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill
      style={{
        width: fullWidth,
        height: fullHeight,
        background: palette.bg,
        color: palette.text,
        fontFamily: bodyFontFamily,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 10% 18%, rgba(124,233,255,0.14), transparent 28%), radial-gradient(circle at 80% 16%, rgba(255,179,71,0.16), transparent 34%), radial-gradient(circle at 76% 78%, rgba(255,104,104,0.12), transparent 32%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: -180,
          transform: `rotate(-14deg) translateX(${interpolate(
            frame,
            [0, 1800],
            [-80, 80],
          )}px)`,
          background:
            "repeating-linear-gradient(90deg, rgba(255,255,255,0.035) 0, rgba(255,255,255,0.035) 1px, transparent 1px, transparent 112px)",
          opacity: 0.35,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(3,4,8,0.18) 0%, rgba(3,4,8,0.54) 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          right: 52,
          top: 120,
          fontFamily: displayFontFamily,
          fontSize: 246,
          lineHeight: 0.9,
          color: "rgba(255,255,255,0.03)",
          letterSpacing: "-0.05em",
        }}
      >
        {ticker}
      </div>
    </AbsoluteFill>
  );
};

export const BkngDebateEditorialShort: React.FC<
  BkngDebateEditorialProps
> = (props) => {
  return (
    <AbsoluteFill
      style={{
        width: fullWidth,
        height: fullHeight,
        background: palette.bg,
        overflow: "hidden",
      }}
    >
      <AnimatedBackdrop ticker={props.ticker} />
      {props.includeAudio && props.audioSrc ? (
        <Audio src={staticFile(props.audioSrc)} />
      ) : null}
      <Sequence
        from={0}
        durationInFrames={sceneDurations.hook}
        premountFor={30}
      >
        <HookScene {...props} />
      </Sequence>
      <Sequence
        from={sceneDurations.hook}
        durationInFrames={sceneDurations.market}
        premountFor={30}
      >
        <MarketScene {...props} />
      </Sequence>
      <Sequence
        from={sceneDurations.hook + sceneDurations.market}
        durationInFrames={sceneDurations.bull}
        premountFor={30}
      >
        <BullScene {...props} />
      </Sequence>
      <Sequence
        from={sceneDurations.hook + sceneDurations.market + sceneDurations.bull}
        durationInFrames={sceneDurations.risk}
        premountFor={30}
      >
        <RiskScene {...props} />
      </Sequence>
      <Sequence
        from={
          sceneDurations.hook +
          sceneDurations.market +
          sceneDurations.bull +
          sceneDurations.risk
        }
        durationInFrames={sceneDurations.sentiment}
        premountFor={30}
      >
        <SentimentScene {...props} />
      </Sequence>
      <Sequence
        from={
          sceneDurations.hook +
          sceneDurations.market +
          sceneDurations.bull +
          sceneDurations.risk +
          sceneDurations.sentiment
        }
        durationInFrames={sceneDurations.finale}
        premountFor={30}
      >
        <FinaleScene {...props} />
      </Sequence>
    </AbsoluteFill>
  );
};
