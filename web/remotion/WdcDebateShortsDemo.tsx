import type { CSSProperties, FC } from "react";
import {
  AbsoluteFill,
  Audio,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

import "./shorty-fonts.css";

type Tone = "up" | "down" | "flat";
type Action = "BUY" | "HOLD" | "SELL";

type MarketMetric = {
  label: string;
  value: string;
  detail: string;
  tone: Tone;
};

type DebateSignal = {
  label: string;
  action: Action;
  confidence: number;
};

export type WdcDebateShortsDemoProps = {
  date: string;
  ticker: string;
  durationSeconds: number;
  audioSrc?: string;
  hook: {
    eyebrow: string;
    headlineTop: string;
    headlineBottom: string;
    subheadline: string;
  };
  marketPulse: {
    headline: string;
    metrics: MarketMetric[];
  };
  debateBoard: {
    headline: string;
    verdict: Action;
    confidence: number;
    counts: {
      buy: number;
      hold: number;
      sell: number;
    };
    signals: DebateSignal[];
  };
  storySplit: {
    leftTitle: string;
    leftValue: string;
    leftSubtitle: string;
    leftBullets: string[];
    rightTitle: string;
    rightValue: string;
    rightSubtitle: string;
    rightBullets: string[];
  };
  finale: {
    headline: string;
    bullets: string[];
    cta: string;
  };
};

const COLORS = {
  bg: "#071019",
  surface: "rgba(10, 19, 30, 0.76)",
  line: "rgba(255,255,255,0.08)",
  text: "#F7FAFF",
  textMuted: "rgba(236, 244, 255, 0.68)",
  cyan: "#49E1FF",
  lime: "#A7FF70",
  amber: "#FFB84F",
  red: "#FF5E7A",
  violet: "#8A7DFF"
};

const FONT_SANS = '"Noto Sans KR", sans-serif';
const FONT_DISPLAY = '"Space Grotesk", "Noto Sans KR", sans-serif';
const FONT_MONO = '"JetBrains Mono", monospace';

const sectionFrames = {
  hook: { from: 0, duration: 8 * 30 },
  market: { from: 8 * 30, duration: 10 * 30 },
  debate: { from: 18 * 30, duration: 18 * 30 },
  split: { from: 36 * 30, duration: 16 * 30 },
  finale: { from: 52 * 30, duration: 8 * 30 }
} as const;

const actionColors: Record<Action, string> = {
  BUY: COLORS.lime,
  HOLD: COLORS.amber,
  SELL: COLORS.red
};

const toneColors: Record<Tone, string> = {
  up: COLORS.lime,
  down: COLORS.red,
  flat: COLORS.amber
};

const fullFrameStyle: CSSProperties = {
  width: "100%",
  height: "100%",
  overflow: "hidden"
};

const cardStyle: CSSProperties = {
  background: COLORS.surface,
  border: `1px solid ${COLORS.line}`,
  boxShadow: "0 28px 80px rgba(0,0,0,0.35)",
  backdropFilter: "blur(20px)"
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const fadeUp = (frame: number, delay = 0) => {
  const progress = spring({
    frame: Math.max(0, frame - delay),
    fps: 30,
    config: { damping: 18, stiffness: 110, mass: 0.9 }
  });

  return {
    opacity: clamp(progress, 0, 1),
    transform: `translateY(${interpolate(progress, [0, 1], [36, 0])}px) scale(${interpolate(
      progress,
      [0, 1],
      [0.96, 1]
    )})`
  };
};

const slideX = (frame: number, from: number, delay = 0) => {
  const progress = spring({
    frame: Math.max(0, frame - delay),
    fps: 30,
    config: { damping: 20, stiffness: 120, mass: 0.9 }
  });
  return {
    opacity: clamp(progress, 0, 1),
    transform: `translateX(${interpolate(progress, [0, 1], [from, 0])}px)`
  };
};

const SectionTitle: FC<{ eyebrow: string; title: string; accent: string }> = ({
  eyebrow,
  title,
  accent
}) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18, ...fadeUp(frame, 0) }}>
      <div
        style={{
          alignSelf: "flex-start",
          padding: "10px 18px",
          borderRadius: 999,
          border: `1px solid ${accent}55`,
          background: `${accent}18`,
          color: accent,
          fontFamily: FONT_MONO,
          fontSize: 24,
          letterSpacing: "0.2em",
          textTransform: "uppercase"
        }}
      >
        {eyebrow}
      </div>
      {title ? (
        <div
          style={{
            fontFamily: FONT_DISPLAY,
            color: COLORS.text,
            fontSize: 72,
            fontWeight: 700,
            lineHeight: 1.02,
            letterSpacing: "-0.05em",
            textWrap: "balance"
          }}
        >
          {title}
        </div>
      ) : null}
    </div>
  );
};

const BackgroundField: FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const driftA = interpolate(frame % 240, [0, 239], [-120, 140]);
  const driftB = interpolate(frame % 180, [0, 179], [90, -80]);
  const rotation = interpolate(frame % 360, [0, 359], [0, 360]);

  return (
    <AbsoluteFill style={{ background: COLORS.bg }}>
      <AbsoluteFill
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          opacity: 0.22
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: -220,
          background:
            "radial-gradient(circle at center, rgba(73,225,255,0.18), transparent 38%), radial-gradient(circle at 60% 35%, rgba(167,255,112,0.16), transparent 32%), radial-gradient(circle at 35% 72%, rgba(255,94,122,0.14), transparent 28%)",
          transform: `translate(${driftA}px, ${driftB}px) rotate(${rotation}deg)`,
          filter: "blur(18px)"
        }}
      />
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={{ position: "absolute", inset: 0, opacity: 0.3 }}
      >
        <defs>
          <linearGradient id="wdc-demo-beam" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor={COLORS.cyan} stopOpacity="0.0" />
            <stop offset="50%" stopColor={COLORS.cyan} stopOpacity="0.55" />
            <stop offset="100%" stopColor={COLORS.red} stopOpacity="0.0" />
          </linearGradient>
        </defs>
        <path
          d={`M ${width * 0.08} ${height * 0.22} C ${width * 0.34} ${height * 0.06}, ${
            width * 0.62
          } ${height * 0.14}, ${width * 0.88} ${height * 0.03}`}
          stroke="url(#wdc-demo-beam)"
          strokeWidth="6"
          fill="none"
        />
        <path
          d={`M ${width * 0.14} ${height * 0.94} C ${width * 0.38} ${height * 0.72}, ${
            width * 0.62
          } ${height * 0.86}, ${width * 0.96} ${height * 0.62}`}
          stroke="url(#wdc-demo-beam)"
          strokeWidth="4"
          fill="none"
        />
      </svg>
    </AbsoluteFill>
  );
};

const HookSection: FC<Pick<WdcDebateShortsDemoProps, "ticker" | "hook" | "storySplit">> = ({
  ticker,
  hook,
  storySplit
}) => {
  const frame = useCurrentFrame();
  const spin = interpolate(frame, [0, sectionFrames.hook.duration], [0, 120]);
  const pulse = 1 + Math.sin(frame / 8) * 0.035;

  return (
    <AbsoluteFill style={{ ...fullFrameStyle, padding: "110px 72px 90px", justifyContent: "space-between" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <SectionTitle eyebrow={hook.eyebrow} title="" accent={COLORS.cyan} />
        <div
          style={{
            ...cardStyle,
            ...slideX(frame, 80, 6),
            padding: "18px 24px",
            borderRadius: 999,
            fontFamily: FONT_MONO,
            color: COLORS.text,
            fontSize: 26,
            letterSpacing: "0.28em"
          }}
        >
          {ticker}
        </div>
      </div>
      <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: 24 }}>
        <div
          style={{
            position: "absolute",
            right: 20,
            top: -40,
            width: 360,
            height: 360,
            borderRadius: "50%",
            border: `2px solid ${COLORS.cyan}55`,
            boxShadow: `0 0 80px ${COLORS.cyan}22`,
            transform: `rotate(${spin}deg) scale(${pulse})`
          }}
        />
        <div
          style={{
            ...fadeUp(frame, 2),
            color: COLORS.text,
            fontFamily: FONT_DISPLAY,
            fontSize: 162,
            lineHeight: 0.86,
            fontWeight: 700,
            letterSpacing: "-0.08em"
          }}
        >
          <div>{hook.headlineTop}</div>
          <div style={{ color: COLORS.red }}>{hook.headlineBottom}</div>
        </div>
        <div
          style={{
            ...fadeUp(frame, 10),
            width: 720,
            color: COLORS.textMuted,
            fontFamily: FONT_SANS,
            fontSize: 38,
            lineHeight: 1.4,
            fontWeight: 500
          }}
        >
          {hook.subheadline}
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 22 }}>
        {[
          {
            label: storySplit.leftTitle,
            value: storySplit.leftValue,
            tone: COLORS.lime,
            detail: storySplit.leftSubtitle
          },
          {
            label: storySplit.rightTitle,
            value: storySplit.rightValue,
            tone: COLORS.red,
            detail: storySplit.rightSubtitle
          }
        ].map((item, index) => (
          <div
            key={item.label}
            style={{
              ...cardStyle,
              ...slideX(frame, index === 0 ? -60 : 60, 14 + index * 4),
              borderRadius: 36,
              padding: "28px 30px",
              display: "flex",
              flexDirection: "column",
              gap: 16
            }}
          >
            <div style={{ color: item.tone, fontFamily: FONT_MONO, fontSize: 24, letterSpacing: "0.18em" }}>
              {item.label}
            </div>
            <div
              style={{
                color: item.tone,
                fontFamily: FONT_DISPLAY,
                fontSize: 72,
                lineHeight: 0.9,
                fontWeight: 700,
                letterSpacing: "-0.06em"
              }}
            >
              {item.value}
            </div>
            <div style={{ color: COLORS.textMuted, fontSize: 28, lineHeight: 1.35 }}>{item.detail}</div>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

const MarketPulseSection: FC<WdcDebateShortsDemoProps["marketPulse"]> = ({ headline, metrics }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ ...fullFrameStyle, padding: "120px 72px 100px", justifyContent: "space-between" }}>
      <SectionTitle eyebrow="Market Pulse" title={headline} accent={COLORS.amber} />
      <div style={{ display: "grid", gap: 26 }}>
        {metrics.map((metric, index) => {
          const accent = toneColors[metric.tone];
          const width = metric.tone === "down" ? 0.42 : 0.82;
          return (
            <div
              key={metric.label}
              style={{
                ...cardStyle,
                ...slideX(frame, index % 2 === 0 ? -90 : 90, index * 5),
                borderRadius: 42,
                padding: "26px 30px",
                display: "grid",
                gridTemplateColumns: "220px 1fr auto",
                alignItems: "center",
                gap: 24
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ color: accent, fontFamily: FONT_MONO, fontSize: 24, letterSpacing: "0.22em" }}>
                  {metric.label}
                </div>
                <div
                  style={{
                    color: COLORS.text,
                    fontFamily: FONT_DISPLAY,
                    fontSize: 70,
                    lineHeight: 0.92,
                    fontWeight: 700,
                    letterSpacing: "-0.06em"
                  }}
                >
                  {metric.value}
                </div>
              </div>
              <div style={{ position: "relative", height: 18, borderRadius: 999, background: "rgba(255,255,255,0.08)" }}>
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: `${width * 100}%`,
                    borderRadius: 999,
                    background: `linear-gradient(90deg, ${accent}, ${COLORS.cyan})`,
                    transformOrigin: "left center",
                    transform: `scaleX(${spring({
                      frame: Math.max(0, frame - index * 5),
                      fps: 30,
                      config: { damping: 20, stiffness: 120 }
                    })})`
                  }}
                />
              </div>
              <div style={{ color: COLORS.textMuted, fontSize: 28, textAlign: "right" }}>{metric.detail}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const DebateBoardSection: FC<WdcDebateShortsDemoProps["debateBoard"]> = ({
  headline,
  verdict,
  confidence,
  counts,
  signals
}) => {
  const frame = useCurrentFrame();
  const total = counts.buy + counts.hold + counts.sell;
  const verdictColor = actionColors[verdict];
  const verdictSweep = interpolate(confidence, [0, 1], [0, 360]);

  return (
    <AbsoluteFill style={{ ...fullFrameStyle, padding: "110px 72px 92px", justifyContent: "space-between" }}>
      <SectionTitle eyebrow="Debate Board" title={headline} accent={verdictColor} />
      <div style={{ display: "grid", gridTemplateColumns: "1.02fr 0.98fr", gap: 28 }}>
        <div
          style={{
            ...cardStyle,
            ...slideX(frame, -70, 4),
            borderRadius: 40,
            padding: "34px 34px 30px",
            display: "flex",
            flexDirection: "column",
            gap: 24
          }}
        >
          {([
            ["BUY", counts.buy],
            ["HOLD", counts.hold],
            ["SELL", counts.sell]
          ] as const).map(([label, value], index) => {
            const key = label as Action;
            const accent = actionColors[key];
            return (
              <div key={label} style={{ display: "grid", gridTemplateColumns: "130px 1fr auto", gap: 18, alignItems: "center" }}>
                <div style={{ color: accent, fontFamily: FONT_MONO, fontSize: 28, letterSpacing: "0.16em" }}>{label}</div>
                <div style={{ position: "relative", height: 22, borderRadius: 999, background: "rgba(255,255,255,0.06)" }}>
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      width: `${(value / total) * 100}%`,
                      borderRadius: 999,
                      background: `linear-gradient(90deg, ${accent}, ${accent}88)`,
                      transformOrigin: "left center",
                      transform: `scaleX(${spring({
                        frame: Math.max(0, frame - 8 - index * 4),
                        fps: 30,
                        config: { damping: 18, stiffness: 110 }
                      })})`
                    }}
                  />
                </div>
                <div style={{ color: COLORS.text, fontFamily: FONT_DISPLAY, fontSize: 42, fontWeight: 700 }}>{value}</div>
              </div>
            );
          })}
          <div
            style={{
              marginTop: 8,
              paddingTop: 24,
              borderTop: `1px solid ${COLORS.line}`,
              color: COLORS.textMuted,
              fontSize: 28,
              lineHeight: 1.5
            }}
          >
            BUY {counts.buy} / HOLD {counts.hold} / SELL {counts.sell}
          </div>
        </div>
        <div
          style={{
            ...cardStyle,
            ...slideX(frame, 70, 8),
            borderRadius: 40,
            padding: "34px",
            display: "grid",
            gridTemplateRows: "auto 1fr auto",
            gap: 26
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ color: verdictColor, fontFamily: FONT_MONO, fontSize: 22, letterSpacing: "0.2em" }}>FINAL</div>
              <div style={{ color: COLORS.text, fontFamily: FONT_DISPLAY, fontSize: 88, lineHeight: 0.92, fontWeight: 700 }}>
                {verdict}
              </div>
            </div>
            <svg width="170" height="170" viewBox="0 0 170 170">
              <circle cx="85" cy="85" r="66" stroke="rgba(255,255,255,0.08)" strokeWidth="10" fill="none" />
              <circle
                cx="85"
                cy="85"
                r="66"
                stroke={verdictColor}
                strokeWidth="10"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${(verdictSweep / 360) * 414} 414`}
                transform="rotate(-90 85 85)"
              />
              <text
                x="85"
                y="89"
                textAnchor="middle"
                fill={COLORS.text}
                style={{ fontFamily: FONT_DISPLAY, fontSize: 34, fontWeight: 700 }}
              >
                {Math.round(confidence * 100)}%
              </text>
            </svg>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {signals.map((signal, index) => (
              <div
                key={signal.label}
                style={{
                  borderRadius: 28,
                  border: `1px solid ${actionColors[signal.action]}44`,
                  background: `${actionColors[signal.action]}14`,
                  padding: "18px 18px 16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  ...fadeUp(frame, 12 + index * 3)
                }}
              >
                <div style={{ color: COLORS.textMuted, fontFamily: FONT_MONO, fontSize: 18, letterSpacing: "0.16em" }}>
                  {signal.label}
                </div>
                <div style={{ color: actionColors[signal.action], fontFamily: FONT_DISPLAY, fontSize: 40, fontWeight: 700 }}>
                  {signal.action}
                </div>
                <div style={{ color: COLORS.text, fontSize: 24 }}>{Math.round(signal.confidence * 100)}% confidence</div>
              </div>
            ))}
          </div>
          <div style={{ color: COLORS.textMuted, fontSize: 28, lineHeight: 1.5 }}>
            성장은 인정됐지만, 최종 토론은 구조적 취약성을 더 크게 봤습니다.
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const StorySplitSection: FC<WdcDebateShortsDemoProps["storySplit"]> = ({
  leftTitle,
  leftValue,
  leftSubtitle,
  leftBullets,
  rightTitle,
  rightValue,
  rightSubtitle,
  rightBullets
}) => {
  const frame = useCurrentFrame();
  const panel = (
    side: "left" | "right",
    title: string,
    value: string,
    subtitle: string,
    bullets: string[]
  ) => {
    const accent = side === "left" ? COLORS.lime : COLORS.red;
    return (
      <div
        style={{
          ...cardStyle,
          ...slideX(frame, side === "left" ? -80 : 80, side === "left" ? 0 : 6),
          borderRadius: 40,
          padding: "34px 32px",
          display: "flex",
          flexDirection: "column",
          gap: 18
        }}
      >
        <div style={{ color: accent, fontFamily: FONT_MONO, fontSize: 24, letterSpacing: "0.18em" }}>{title}</div>
        <div style={{ color: accent, fontFamily: FONT_DISPLAY, fontSize: 108, fontWeight: 700, lineHeight: 0.9 }}>
          {value}
        </div>
        <div style={{ color: COLORS.text, fontSize: 34, lineHeight: 1.3, fontWeight: 600 }}>{subtitle}</div>
        <div style={{ display: "grid", gap: 14, marginTop: 10 }}>
          {bullets.map((bullet, index) => (
            <div
              key={bullet}
              style={{
                display: "grid",
                gridTemplateColumns: "16px 1fr",
                gap: 16,
                alignItems: "start",
                ...fadeUp(frame, 10 + index * 3)
              }}
            >
              <div
                style={{
                  marginTop: 10,
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: accent,
                  boxShadow: `0 0 18px ${accent}`
                }}
              />
              <div style={{ color: COLORS.textMuted, fontSize: 28, lineHeight: 1.45 }}>{bullet}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <AbsoluteFill style={{ ...fullFrameStyle, padding: "120px 72px 90px", justifyContent: "space-between" }}>
      <SectionTitle eyebrow="Price vs Structure" title={"한쪽은 성장,\n다른 쪽은 취약성"} accent={COLORS.violet} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 26 }}>
        {panel("left", leftTitle, leftValue, leftSubtitle, leftBullets)}
        {panel("right", rightTitle, rightValue, rightSubtitle, rightBullets)}
      </div>
    </AbsoluteFill>
  );
};

const FinaleSection: FC<
  WdcDebateShortsDemoProps["finale"] &
    Pick<WdcDebateShortsDemoProps["debateBoard"], "verdict" | "confidence">
> = ({ headline, bullets, cta, verdict, confidence }) => {
  const frame = useCurrentFrame();
  const accent = actionColors[verdict];
  return (
    <AbsoluteFill style={{ ...fullFrameStyle, padding: "120px 72px 100px", justifyContent: "space-between" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", ...fadeUp(frame, 0) }}>
        <div
          style={{
            alignSelf: "flex-start",
            padding: "10px 18px",
            borderRadius: 999,
            border: `1px solid ${accent}55`,
            background: `${accent}18`,
            color: accent,
            fontFamily: FONT_MONO,
            fontSize: 22,
            letterSpacing: "0.18em",
            textTransform: "uppercase"
          }}
        >
          Final Take
        </div>
        <div style={{ color: COLORS.text, fontFamily: FONT_DISPLAY, fontSize: 82, fontWeight: 700 }}>
          {verdict} <span style={{ color: accent }}>{Math.round(confidence * 100)}%</span>
        </div>
      </div>
      <div
        style={{
          ...cardStyle,
          borderRadius: 46,
          padding: "42px 38px",
          display: "grid",
          gap: 28
        }}
      >
        <div
          style={{
            color: COLORS.text,
            fontFamily: FONT_DISPLAY,
            fontSize: 84,
            fontWeight: 700,
            lineHeight: 0.98,
            letterSpacing: "-0.06em",
            whiteSpace: "pre-line",
            ...fadeUp(frame, 2)
          }}
        >
          {headline}
        </div>
        <div style={{ display: "grid", gap: 18 }}>
          {bullets.map((bullet, index) => (
            <div
              key={bullet}
              style={{
                display: "grid",
                gridTemplateColumns: "20px 1fr",
                gap: 18,
                alignItems: "start",
                ...fadeUp(frame, 8 + index * 4)
              }}
            >
              <div
                style={{
                  width: 12,
                  height: 12,
                  marginTop: 13,
                  borderRadius: "50%",
                  background: accent,
                  boxShadow: `0 0 18px ${accent}`
                }}
              />
              <div style={{ color: COLORS.textMuted, fontSize: 32, lineHeight: 1.4 }}>{bullet}</div>
            </div>
          ))}
        </div>
      </div>
      <div
        style={{
          color: COLORS.textMuted,
          fontFamily: FONT_MONO,
          fontSize: 22,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          ...fadeUp(frame, 14)
        }}
      >
        {cta}
      </div>
    </AbsoluteFill>
  );
};

export const WdcDebateShortsDemo: FC<WdcDebateShortsDemoProps> = ({
  ticker,
  audioSrc,
  hook,
  marketPulse,
  debateBoard,
  storySplit,
  finale
}) => {
  return (
    <AbsoluteFill style={fullFrameStyle}>
      <BackgroundField />
      {audioSrc ? <Audio src={staticFile(audioSrc)} /> : null}
      <Sequence from={sectionFrames.hook.from} durationInFrames={sectionFrames.hook.duration}>
        <HookSection ticker={ticker} hook={hook} storySplit={storySplit} />
      </Sequence>
      <Sequence from={sectionFrames.market.from} durationInFrames={sectionFrames.market.duration}>
        <MarketPulseSection {...marketPulse} />
      </Sequence>
      <Sequence from={sectionFrames.debate.from} durationInFrames={sectionFrames.debate.duration}>
        <DebateBoardSection {...debateBoard} />
      </Sequence>
      <Sequence from={sectionFrames.split.from} durationInFrames={sectionFrames.split.duration}>
        <StorySplitSection {...storySplit} />
      </Sequence>
      <Sequence from={sectionFrames.finale.from} durationInFrames={sectionFrames.finale.duration}>
        <FinaleSection
          {...finale}
          verdict={debateBoard.verdict}
          confidence={debateBoard.confidence}
        />
      </Sequence>
    </AbsoluteFill>
  );
};
