import React from "react";
import {
    AbsoluteFill,
    Audio,
    Series,
    staticFile,
    useCurrentFrame,
    useVideoConfig,
    interpolate,
    spring,
    Easing,
} from "remotion";
import "./bkng-debate-editorial-fonts.css";

/* ────────────────────────── fonts ────────────────────────── */
const headingFont = '"Montserrat", "Noto Sans KR", sans-serif';
const bodyFont = '"Noto Sans KR", sans-serif';

/* ────────────────────────── palette ────────────────────────── */
const C = {
    bg: "#08080F",
    bgCard: "#12121F",
    cyan: "#00E5FF",
    amber: "#FFB300",
    red: "#FF3B5C",
    green: "#00E676",
    purple: "#B388FF",
    blue: "#6DB8FF",
    white: "#F5F5F5",
    muted: "#8E8E9E",
};

/* ────────────────────────── types ────────────────────────── */
type FundMetric = { label: string; value: string; sub: string; pct: number };
type GrowthColumn = { label: string; value: string; pct: number };
type RiskItem = { label: string; detail: string; highlight: string };
type PriceRange = { low: number; high: number; close: number; dayChangePct: number };
type SceneTimingWindow = { startSec: number; endSec: number };
type ExpertSceneKey = "fundamental" | "growth" | "risk" | "sentiment";
type SceneTimingMap = Partial<Record<ExpertSceneKey, SceneTimingWindow>>;
type StanceBadge = { label: string; stance: string; color: string };

export type BkngDebateShortsProps = {
    date: string;
    ticker: string;
    durationSeconds: number;
    audioSrc: string;
    sceneTiming?: SceneTimingMap;
    hook: {
        eyebrow: string;
        headlineTop: string;
        headlineBottom: string;
        subheadline: string;
        dayChange: string;
    };
    fundamental: {
        label: string;
        stance: string;
        confidence: number;
        summary: string;
        metrics: FundMetric[];
    };
    growth: {
        label: string;
        stance: string;
        confidence: number;
        summary: string;
        columns: GrowthColumn[];
        footnote: string;
    };
    risk: {
        label: string;
        stance: string;
        confidence: number;
        summary: string;
        items: RiskItem[];
        totalExposure: string;
    };
    sentiment: {
        label: string;
        stance: string;
        confidence: number;
        summary: string;
        priceRange: PriceRange;
        keywords: string[];
        insight: string;
    };
    finale: {
        headline: string;
        bullets: string[];
        cta: string;
    };
};

const EXPERT_SCENE_KEYS: ExpertSceneKey[] = ["fundamental", "growth", "risk", "sentiment"];
const EDGE_SCENE_SECONDS = 3;

const secondsToFrames = (seconds: number, fps: number) => Math.max(0, Math.round(seconds * fps));

const isValidSceneTimingWindow = (value: SceneTimingWindow | undefined): value is SceneTimingWindow => {
    if (!value) {
        return false;
    }
    return Number.isFinite(value.startSec) && Number.isFinite(value.endSec) && value.endSec > value.startSec;
};

const resolveExpertSceneFrames = (
    sceneTiming: SceneTimingMap | undefined,
    durationSeconds: number,
    fps: number,
): Record<ExpertSceneKey, number> => {
    const safeDurationSeconds = Number.isFinite(durationSeconds) && durationSeconds > 0 ? durationSeconds : 60;
    const totalFrames = Math.max(EXPERT_SCENE_KEYS.length, secondsToFrames(safeDurationSeconds, fps));
    const fallbackBase = Math.floor(totalFrames / EXPERT_SCENE_KEYS.length);
    const fallbackFrames = [
        Math.max(1, fallbackBase),
        Math.max(1, fallbackBase),
        Math.max(1, fallbackBase),
        Math.max(1, totalFrames - Math.max(1, fallbackBase) * 3),
    ];
    const rawWindows = EXPERT_SCENE_KEYS.map((key) => sceneTiming?.[key]);
    if (!rawWindows.every((window) => isValidSceneTimingWindow(window))) {
        return {
            fundamental: fallbackFrames[0],
            growth: fallbackFrames[1],
            risk: fallbackFrames[2],
            sentiment: fallbackFrames[3],
        };
    }

    const windows = rawWindows as SceneTimingWindow[];
    const firstThreeFrames = windows.slice(0, -1).map((window) => Math.max(1, secondsToFrames(window.endSec - window.startSec, fps)));
    const usedFrames = firstThreeFrames.reduce((sum, frameCount) => sum + frameCount, 0);
    const lastFrames = Math.max(1, totalFrames - usedFrames);

    return {
        fundamental: firstThreeFrames[0],
        growth: firstThreeFrames[1],
        risk: firstThreeFrames[2],
        sentiment: lastFrames,
    };
};

/* ──────────────── shared: scanline ──────────────── */
const Scanline: React.FC<{ color?: string }> = ({ color = C.cyan }) => {
    const frame = useCurrentFrame();
    const { height } = useVideoConfig();
    const y = interpolate(frame % 120, [0, 120], [-20, height + 20]);
    return (
        <div
            style={{
                position: "absolute",
                left: 0, right: 0, top: y,
                height: 2,
                background: `linear-gradient(90deg, transparent, ${color}30, transparent)`,
                pointerEvents: "none",
            }}
        />
    );
};

/* ──────────────── shared: expert header ──────────────── */
const ExpertHeader: React.FC<{
    label: string; stance: string; color: string; confidence: number;
}> = ({ label, stance, color, confidence }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const s = spring({ frame, fps, delay: 2, config: { damping: 200 } });
    const confWidth = interpolate(frame, [15, 50], [0, confidence * 100], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: Easing.out(Easing.quad),
    });

    return (
        <div style={{ width: "100%", marginBottom: 40 }}>
            <div style={{
                opacity: interpolate(s, [0, 1], [0, 1]),
                display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24,
            }}>
                <div style={{ flex: 1, marginRight: 20, fontFamily: headingFont, fontSize: 36, fontWeight: 600, color, letterSpacing: 6, textTransform: "uppercase" as const, lineHeight: 1.3 }}>
                    {label}
                </div>
                <div style={{
                    fontFamily: bodyFont, fontSize: 32, fontWeight: 700, color,
                    background: `${color}15`, padding: "10px 26px", borderRadius: 30, border: `1.5px solid ${color}40`,
                    flexShrink: 0,
                }}>
                    {stance}
                </div>
            </div>
            <div style={{ height: 8, background: `${C.white}10`, borderRadius: 4, overflow: "hidden" }}>
                <div style={{
                    width: `${confWidth}%`, height: "100%",
                    background: `linear-gradient(90deg, ${color}88, ${color})`, borderRadius: 4,
                }} />
            </div>
        </div>
    );
};

/* ────────────────────────── Scene 1: HOOK ────────────────────────── */
const HookScene: React.FC<
    BkngDebateShortsProps["hook"] & { ticker: string; date: string }
> = ({ eyebrow, headlineTop, headlineBottom, subheadline, dayChange, ticker, date }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const badgeScale = spring({ frame, fps, config: { damping: 16, stiffness: 140 } });
    const h1 = spring({ frame, fps, config: { damping: 200 } });
    const h2 = spring({ frame, fps, delay: 2, config: { damping: 200 } });
    const sub = spring({ frame, fps, delay: 4, config: { damping: 200 } });
    const changeS = spring({ frame, fps, delay: 3, config: { damping: 18, stiffness: 180 } });
    const glowPulse = interpolate(Math.sin(frame * 0.06), [-1, 1], [0.06, 0.18]);

    return (
        <AbsoluteFill style={{
            background: `linear-gradient(170deg, #0D0D1A 0%, ${C.bg} 40%, #100820 100%)`,
            justifyContent: "center", alignItems: "center", padding: "60px 44px",
        }}>
            <div style={{
                position: "absolute", width: 600, height: 600, borderRadius: "50%",
                background: `radial-gradient(circle, rgba(0,229,255,${glowPulse}) 0%, transparent 65%)`,
                top: "8%", left: "50%", transform: "translate(-50%, 0)",
            }} />
            <div style={{
                position: "absolute", width: 400, height: 400, borderRadius: "50%",
                background: `radial-gradient(circle, rgba(255,59,92,${glowPulse * 0.6}) 0%, transparent 65%)`,
                bottom: "15%", right: "-5%",
            }} />
            <Scanline />

            <div style={{
                opacity: interpolate(spring({ frame, fps, config: { damping: 200 } }), [0, 1], [0.7, 1]),
                fontFamily: headingFont, fontSize: 36, fontWeight: 600, letterSpacing: 8,
                color: C.cyan, textTransform: "uppercase" as const, marginBottom: 24,
            }}>
                {eyebrow || date}
            </div>

            <div style={{
                transform: `scale(${interpolate(badgeScale, [0, 1], [0.92, 1])})`,
                background: `linear-gradient(135deg, ${C.cyan}18, ${C.cyan}06)`,
                border: `2px solid ${C.cyan}55`, borderRadius: 20, padding: "18px 60px", marginBottom: 24,
            }}>
                <span style={{ fontFamily: headingFont, fontSize: 110, fontWeight: 700, color: C.white, letterSpacing: 10 }}>
                    {ticker}
                </span>
            </div>

            <div style={{
                opacity: interpolate(h1, [0, 1], [0.55, 1]),
                transform: `translateY(${interpolate(h1, [0, 1], [18, 0])}px)`,
                fontFamily: bodyFont, fontSize: 52, fontWeight: 700, color: C.white, marginBottom: 12,
            }}>
                {headlineTop}
            </div>

            <div style={{
                opacity: interpolate(h2, [0, 1], [0.55, 1]),
                transform: `scale(${interpolate(h2, [0, 1], [0.92, 1])})`,
                fontFamily: headingFont, fontSize: 130, fontWeight: 700, color: C.white, letterSpacing: 3, marginBottom: 10,
            }}>
                {headlineBottom}
            </div>

            <div style={{
                transform: `scale(${interpolate(changeS, [0, 1], [0.84, 1])})`,
                background: `${C.green}20`, border: `2px solid ${C.green}66`,
                borderRadius: 40, padding: "10px 36px", marginBottom: 40,
            }}>
                <span style={{ fontFamily: headingFont, fontSize: 48, fontWeight: 700, color: C.green }}>
                    {dayChange}
                </span>
            </div>

            <div style={{
                opacity: interpolate(sub, [0, 1], [0.55, 1]),
                transform: `translateY(${interpolate(sub, [0, 1], [16, 0])}px)`,
                fontFamily: bodyFont, fontSize: 40, fontWeight: 500, color: `${C.white}BB`,
                textAlign: "center", lineHeight: 1.45, maxWidth: 950,
            }}>
                {subheadline}
            </div>

            <div style={{
                position: "absolute", bottom: 100,
                width: interpolate(h2, [0, 1], [0, 700]), height: 3,
                background: `linear-gradient(90deg, transparent, ${C.cyan}AA, transparent)`,
            }} />
        </AbsoluteFill>
    );
};

/* ─────────────── Scene 3: FUNDAMENTAL — Animated Horizontal Bars ─────────────── */
const FundamentalScene: React.FC<BkngDebateShortsProps["fundamental"]> = ({
    label, stance, confidence, summary, metrics,
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const summaryS = spring({ frame, fps, delay: 6, config: { damping: 200 } });
    const ac = C.blue;

    return (
        <AbsoluteFill style={{
            background: C.bg,
            backgroundImage: `radial-gradient(ellipse at 50% 25%, ${ac}08 0%, transparent 55%)`,
            justifyContent: "center", alignItems: "center", padding: "50px 44px",
        }}>
            <Scanline color={ac} />
            <ExpertHeader label={label} stance={stance} color={ac} confidence={confidence} />

            <div style={{
                opacity: interpolate(summaryS, [0, 1], [0, 1]),
                fontFamily: bodyFont, fontSize: 38, fontWeight: 700, color: C.white,
                textAlign: "center", lineHeight: 1.4, marginBottom: 70, maxWidth: 980,
            }}>
                {summary}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 48, width: "100%", maxWidth: 980 }}>
                {metrics.map((m, i) => {
                    const delay = 14 + i * 8;
                    const fadeS = spring({ frame, fps, delay, config: { damping: 200 } });
                    const barWidth = interpolate(frame, [delay + 5, delay + 30], [0, m.pct * 2.5], {
                        extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic),
                    });

                    return (
                        <div key={m.label} style={{
                            opacity: interpolate(fadeS, [0, 1], [0, 1]),
                            transform: `translateX(${interpolate(fadeS, [0, 1], [40, 0])}px)`,
                        }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 20 }}>
                                <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1, marginRight: 20 }}>
                                    <div style={{ fontFamily: bodyFont, fontSize: 34, fontWeight: 700, color: C.white, lineHeight: 1.2 }}>{m.label}</div>
                                    <div style={{ fontFamily: bodyFont, fontSize: 26, color: `${C.white}77`, lineHeight: 1.3 }}>{m.sub}</div>
                                </div>
                                <div style={{ fontFamily: headingFont, fontSize: 52, fontWeight: 700, color: ac, flexShrink: 0 }}>{m.value}</div>
                            </div>
                            <div style={{ height: 28, background: `${C.white}08`, borderRadius: 14, overflow: "hidden" }}>
                                <div style={{
                                    width: `${barWidth}%`, height: "100%",
                                    background: `linear-gradient(90deg, ${ac}55, ${ac})`,
                                    borderRadius: 14, boxShadow: `0 0 24px ${ac}30`,
                                }} />
                            </div>
                        </div>
                    );
                })}
            </div>
        </AbsoluteFill>
    );
};

/* ─────────────── Scene 4: GROWTH — Animated Vertical Column Chart ─────────────── */
const GrowthScene: React.FC<BkngDebateShortsProps["growth"]> = ({
    label, stance, confidence, summary, columns, footnote,
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const summaryS = spring({ frame, fps, delay: 6, config: { damping: 200 } });
    const ac = C.green;
    const maxPct = Math.max(...columns.map((c) => c.pct));
    const maxH = 620;

    return (
        <AbsoluteFill style={{
            background: C.bg,
            backgroundImage: `radial-gradient(ellipse at 60% 30%, ${ac}08 0%, transparent 55%)`,
            justifyContent: "center", alignItems: "center", padding: "50px 44px",
        }}>
            <Scanline color={ac} />
            <ExpertHeader label={label} stance={stance} color={ac} confidence={confidence} />

            <div style={{
                opacity: interpolate(summaryS, [0, 1], [0, 1]),
                fontFamily: bodyFont, fontSize: 38, fontWeight: 700, color: C.white,
                textAlign: "center", lineHeight: 1.4, marginBottom: 60, maxWidth: 980,
            }}>
                {summary}
            </div>

            <div style={{
                display: "flex", alignItems: "flex-end", justifyContent: "center",
                gap: 36, width: "100%", maxWidth: 980, height: maxH + 130,
            }}>
                {columns.map((col, i) => {
                    const delay = 14 + i * 6;
                    const colHeight = interpolate(frame, [delay, delay + 25], [0, (col.pct / maxPct) * maxH], {
                        extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic),
                    });
                    const labelS = spring({ frame, fps, delay: delay + 10, config: { damping: 200 } });
                    const brightness = 0.5 + (col.pct / maxPct) * 0.5;

                    return (
                        <div key={col.label} style={{
                            display: "flex", flexDirection: "column", alignItems: "center", gap: 12,
                        }}>
                            <div style={{
                                opacity: interpolate(labelS, [0, 1], [0, 1]),
                                transform: `translateY(${interpolate(labelS, [0, 1], [10, 0])}px)`,
                                fontFamily: headingFont, fontSize: 44, fontWeight: 700, color: ac,
                                textShadow: `0 0 20px ${ac}40`,
                            }}>
                                {col.value}
                            </div>
                            <div style={{
                                width: 190, height: colHeight,
                                background: `linear-gradient(180deg, ${ac}, ${ac}${Math.round(brightness * 99).toString().padStart(2, "0")})`,
                                borderRadius: "14px 14px 4px 4px",
                                boxShadow: `0 0 30px ${ac}20, inset 0 1px 0 rgba(255,255,255,0.15)`,
                                position: "relative",
                            }}>
                                <div style={{
                                    position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
                                    background: "linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 50%)",
                                    borderRadius: "14px 14px 4px 4px",
                                }} />
                            </div>
                            <div style={{
                                fontFamily: bodyFont, fontSize: 30, fontWeight: 700,
                                color: `${C.white}CC`, textAlign: "center",
                            }}>
                                {col.label}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div style={{
                position: "absolute", bottom: 60,
                fontFamily: bodyFont, fontSize: 22, color: `${C.muted}88`,
                textAlign: "center", maxWidth: 950,
            }}>
                {footnote}
            </div>
        </AbsoluteFill>
    );
};

/* ─────────────── Scene 5: RISK — Threat Cards + Exposure Bar ─────────────── */
const RiskScene: React.FC<BkngDebateShortsProps["risk"]> = ({
    label, stance, confidence, summary, items, totalExposure,
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const summaryS = spring({ frame, fps, delay: 6, config: { damping: 200 } });
    const ac = C.red;
    const warnPulse = interpolate(Math.sin(frame * 0.08), [-1, 1], [0.03, 0.10]);

    return (
        <AbsoluteFill style={{
            background: C.bg,
            backgroundImage: `radial-gradient(ellipse at 50% 30%, rgba(255,59,92,${warnPulse}) 0%, transparent 50%)`,
            justifyContent: "center", alignItems: "center", padding: "50px 44px",
        }}>
            <Scanline color={ac} />
            <ExpertHeader label={label} stance={stance} color={ac} confidence={confidence} />

            <div style={{
                opacity: interpolate(summaryS, [0, 1], [0, 1]),
                fontFamily: bodyFont, fontSize: 38, fontWeight: 700, color: C.white,
                textAlign: "center", lineHeight: 1.4, marginBottom: 40, maxWidth: 980,
            }}>
                {summary}
            </div>

            <div style={{
                opacity: interpolate(spring({ frame, fps, delay: 10, config: { damping: 200 } }), [0, 1], [0, 1]),
                fontFamily: headingFont, fontSize: 34, fontWeight: 600, color: ac,
                background: `${ac}10`, border: `1.5px solid ${ac}30`,
                borderRadius: 14, padding: "14px 32px", marginBottom: 48,
                letterSpacing: 2,
            }}>
                TOTAL EXPOSURE: {totalExposure}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 32, width: "100%", maxWidth: 980 }}>
                {items.map((item, i) => {
                    const delay = 16 + i * 7;
                    const fadeS = spring({ frame, fps, delay, config: { damping: 200 } });
                    const borderGlow = interpolate(Math.sin((frame - delay) * 0.1), [-1, 1], [0.4, 1]);

                    return (
                        <div key={item.label} style={{
                            opacity: interpolate(fadeS, [0, 1], [0, 1]),
                            transform: `translateX(${interpolate(fadeS, [0, 1], [-60, 0])}px)`,
                            background: `linear-gradient(135deg, ${C.bgCard}, ${ac}06)`,
                            borderRadius: 16, padding: "26px 30px",
                            borderLeft: `4px solid rgba(255,59,92,${borderGlow})`,
                            display: "flex", alignItems: "center", justifyContent: "space-between",
                        }}>
                            <div style={{ flex: 1, marginRight: 24 }}>
                                <div style={{ fontFamily: bodyFont, fontSize: 32, fontWeight: 700, color: C.white, marginBottom: 8, lineHeight: 1.3 }}>
                                    {item.label}
                                </div>
                                <div style={{ fontFamily: bodyFont, fontSize: 26, color: `${C.white}88`, lineHeight: 1.4 }}>
                                    {item.detail}
                                </div>
                            </div>
                            <div style={{
                                fontFamily: headingFont, fontSize: 28, fontWeight: 700, color: ac,
                                background: `${ac}15`, border: `1.5px solid ${ac}35`,
                                borderRadius: 12, padding: "12px 22px", flexShrink: 0, textAlign: "center",
                            }}>
                                {item.highlight}
                            </div>
                        </div>
                    );
                })}
            </div>
        </AbsoluteFill>
    );
};

/* ─────────────── Scene 6: SENTIMENT — Price Range + Keyword Cloud ─────────────── */
const SentimentScene: React.FC<BkngDebateShortsProps["sentiment"]> = ({
    label, stance, confidence, summary, priceRange, keywords, insight,
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const summaryS = spring({ frame, fps, delay: 6, config: { damping: 200 } });
    const insightS = spring({ frame, fps, delay: 44, config: { damping: 200 } });
    const ac = C.amber;

    const rangeSpread = priceRange.high - priceRange.low;
    const closePos = rangeSpread > 0
        ? ((priceRange.close - priceRange.low) / rangeSpread) * 100
        : 50;

    const rangeReveal = interpolate(frame, [18, 45], [0, 1], {
        extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic),
    });

    const closePulse = interpolate(Math.sin(frame * 0.08), [-1, 1], [0.6, 1]);
    const arrowAngle = priceRange.dayChangePct >= 0 ? -45 : 45;
    const arrowColor = priceRange.dayChangePct >= 0 ? C.green : C.red;
    const arrowS = spring({ frame, fps, delay: 8, config: { damping: 14, stiffness: 120 } });

    return (
        <AbsoluteFill style={{
            background: C.bg,
            backgroundImage: `radial-gradient(ellipse at 50% 35%, ${ac}08 0%, transparent 55%)`,
            justifyContent: "center", alignItems: "center", padding: "50px 44px",
        }}>
            <Scanline color={ac} />
            <ExpertHeader label={label} stance={stance} color={ac} confidence={confidence} />

            <div style={{
                opacity: interpolate(summaryS, [0, 1], [0, 1]),
                fontFamily: bodyFont, fontSize: 38, fontWeight: 700, color: C.white,
                textAlign: "center", lineHeight: 1.4, marginBottom: 50, maxWidth: 980,
            }}>
                {summary}
            </div>

            <div style={{
                display: "flex", alignItems: "center", gap: 24, marginBottom: 60,
                transform: `scale(${arrowS})`,
            }}>
                <div style={{
                    fontFamily: headingFont, fontSize: 88, fontWeight: 700, color: arrowColor,
                    textShadow: `0 0 40px ${arrowColor}40`,
                }}>
                    +{priceRange.dayChangePct}%
                </div>
                <svg width={60} height={60} viewBox="0 0 50 50" style={{
                    transform: `rotate(${arrowAngle}deg)`,
                }}>
                    <path
                        d="M 10 40 L 25 10 L 40 40"
                        fill="none"
                        stroke={arrowColor}
                        strokeWidth={5}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </div>

            <div style={{
                width: "100%", maxWidth: 960,
                opacity: rangeReveal,
                marginBottom: 20,
            }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                    <span style={{ fontFamily: headingFont, fontSize: 28, color: C.muted }}>LOW</span>
                    <span style={{ fontFamily: headingFont, fontSize: 28, color: C.muted }}>HIGH</span>
                </div>
                <div style={{
                    height: 32, background: `linear-gradient(90deg, ${C.red}25, ${ac}15, ${C.green}25)`,
                    borderRadius: 12, position: "relative",
                }}>
                    <div style={{
                        position: "absolute", left: `${closePos * rangeReveal}%`, top: -8,
                        width: 48, height: 48, borderRadius: "50%",
                        background: C.white,
                        boxShadow: `0 0 ${20 * closePulse}px ${ac}80`,
                        border: `3px solid ${ac}`,
                        transform: "translateX(-50%)",
                    }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12 }}>
                    <div style={{ fontFamily: headingFont, fontSize: 34, fontWeight: 700, color: `${C.white}CC`, flex: 1, textAlign: "left" }}>
                        ${priceRange.low.toLocaleString()}
                    </div>
                    <div style={{ fontFamily: headingFont, fontSize: 36, fontWeight: 700, color: ac, flexShrink: 0, textAlign: "center", whiteSpace: "nowrap" as const, padding: "0 10px" }}>
                        CLOSE ${priceRange.close.toLocaleString()}
                    </div>
                    <div style={{ fontFamily: headingFont, fontSize: 34, fontWeight: 700, color: `${C.white}CC`, flex: 1, textAlign: "right" }}>
                        ${priceRange.high.toLocaleString()}
                    </div>
                </div>
            </div>

            <div style={{
                display: "flex", gap: 14, flexWrap: "wrap" as const, justifyContent: "center",
                marginTop: 60, marginBottom: 60,
            }}>
                {keywords.map((kw, i) => {
                    const kwS = spring({ frame, fps, delay: 28 + i * 5, config: { damping: 200 } });
                    return (
                        <div key={kw} style={{
                            opacity: interpolate(kwS, [0, 1], [0, 1]),
                            transform: `scale(${interpolate(kwS, [0, 1], [0.7, 1])})`,
                            fontFamily: bodyFont, fontSize: 32, fontWeight: 700, color: ac,
                            background: `${ac}12`, border: `1.5px solid ${ac}40`,
                            borderRadius: 30, padding: "12px 30px",
                        }}>
                            {kw}
                        </div>
                    );
                })}
            </div>

            <div style={{
                opacity: interpolate(insightS, [0, 1], [0, 1]),
                transform: `translateY(${interpolate(insightS, [0, 1], [15, 0])}px)`,
                fontFamily: bodyFont, fontSize: 32, fontWeight: 500, color: `${C.white}99`,
                textAlign: "center", lineHeight: 1.5, maxWidth: 940,
                borderTop: `1px solid ${ac}25`, paddingTop: 40,
            }}>
                {insight}
            </div>
        </AbsoluteFill>
    );
};

/* ────────────────────────── Scene 6: FINALE ────────────────────────── */
const FinaleScene: React.FC<
    BkngDebateShortsProps["finale"] & {
        ticker: string;
        stances: StanceBadge[];
    }
> = ({ headline, bullets, cta, ticker, stances }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const reveal = spring({ frame, fps, config: { damping: 18, stiffness: 120 } });
    const headlineReveal = spring({ frame, fps, delay: 2, config: { damping: 20, stiffness: 140 } });
    const ctaOpacity = interpolate(frame, [20, 38], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
    });
    const pulseOpacity = interpolate(Math.sin(frame * 0.05), [-1, 1], [0.05, 0.13]);

    return (
        <AbsoluteFill style={{
            background: "linear-gradient(180deg, rgba(17,12,28,0.96) 0%, rgba(8,8,15,1) 100%)",
            justifyContent: "center",
            alignItems: "center",
            padding: "56px 44px",
        }}>
            <Scanline color={C.purple} />
            <div style={{
                position: "absolute",
                top: 84,
                left: 54,
                fontFamily: headingFont,
                fontSize: 28,
                fontWeight: 600,
                letterSpacing: 8,
                color: C.purple,
                textTransform: "uppercase" as const,
                opacity: interpolate(reveal, [0, 1], [0.72, 1]),
            }}>
                FINAL TAKE
            </div>
            <div style={{
                position: "absolute",
                inset: 0,
                background: `radial-gradient(circle at 82% 18%, rgba(179,136,255,${pulseOpacity}) 0%, transparent 34%)`,
            }} />
            <div style={{
                position: "absolute",
                right: 0,
                bottom: -90,
                width: 560,
                height: 560,
                borderRadius: "50%",
                background: `radial-gradient(circle, rgba(179,136,255,${pulseOpacity}) 0%, transparent 65%)`,
                filter: "blur(12px)",
            }} />
            <div style={{
                position: "relative",
                borderRadius: 30,
                border: `1px solid ${C.purple}40`,
                background: "linear-gradient(180deg, rgba(23,18,39,0.96) 0%, rgba(8,8,15,0.98) 100%)",
                boxShadow: "0 24px 80px rgba(0,0,0,0.42)",
                overflow: "hidden",
                width: "100%",
                maxWidth: 960,
                transform: `translateY(${interpolate(reveal, [0, 1], [26, 0])}px)`,
            }}>
                <div style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 4,
                    background: `linear-gradient(90deg, ${C.purple}, transparent)`,
                }} />
                <div style={{ padding: "28px 30px 34px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
                        <div style={{
                            fontFamily: headingFont,
                            fontSize: 52,
                            fontWeight: 700,
                            letterSpacing: 6,
                            color: C.white,
                        }}>
                            {ticker}
                        </div>
                    </div>
                    <div style={{ display: "flex", gap: 10, marginBottom: 22, flexWrap: "wrap" as const }}>
                        {stances.map((stance) => (
                            <div
                                key={stance.label}
                                style={{
                                    borderRadius: 999,
                                    padding: "9px 16px",
                                    border: `1px solid ${stance.color}40`,
                                    background: `${stance.color}12`,
                                    fontFamily: bodyFont,
                                    fontSize: 22,
                                    fontWeight: 700,
                                    color: stance.color,
                                }}
                            >
                                {stance.stance}
                            </div>
                        ))}
                    </div>
                    <div style={{
                        opacity: interpolate(headlineReveal, [0, 1], [0.6, 1]),
                        transform: `translateY(${interpolate(headlineReveal, [0, 1], [10, 0])}px)`,
                        fontFamily: bodyFont,
                        fontSize: 38,
                        fontWeight: 700,
                        color: C.white,
                        lineHeight: 1.35,
                        marginBottom: bullets.length > 0 ? 22 : 10,
                        whiteSpace: "pre-line" as const,
                    }}>
                        {headline}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                        {bullets.slice(0, 3).map((bullet, index) => (
                            <div
                                key={`${bullet}-${index}`}
                                style={{
                                    display: "flex",
                                    gap: 14,
                                    alignItems: "flex-start",
                                    fontFamily: bodyFont,
                                    fontSize: 26,
                                    lineHeight: 1.45,
                                    color: `${C.white}D8`,
                                }}
                            >
                                <div style={{
                                    width: 10,
                                    height: 10,
                                    marginTop: 10,
                                    borderRadius: "50%",
                                    background: `${C.purple}CC`,
                                    boxShadow: `0 0 16px ${C.purple}88`,
                                    flexShrink: 0,
                                }} />
                                <div>{bullet}</div>
                            </div>
                        ))}
                    </div>
                    <div style={{
                        marginTop: 26,
                        opacity: ctaOpacity,
                        fontFamily: headingFont,
                        fontSize: 22,
                        fontWeight: 500,
                        letterSpacing: 5,
                        color: `${C.white}90`,
                    }}>
                        {cta}
                    </div>
                </div>
            </div>
        </AbsoluteFill>
    );
};

/* ────────────────────────── MAIN COMPOSITION ────────────────────────── */
export const BkngDebateShorts: React.FC<BkngDebateShortsProps> = (props) => {
    const { fps } = useVideoConfig();
    const audioSrc = props.audioSrc.replace(/^\/+/, "");
    const sceneFrames = resolveExpertSceneFrames(props.sceneTiming, props.durationSeconds, fps);
    const edgeSceneFrames = Math.max(1, Math.round(EDGE_SCENE_SECONDS * fps));
    const hookFrames = Math.min(edgeSceneFrames, Math.max(0, sceneFrames.fundamental - 1));
    const fundamentalFrames = Math.max(1, sceneFrames.fundamental - hookFrames);
    const finaleFrames = Math.min(edgeSceneFrames, Math.max(0, sceneFrames.sentiment - 1));
    const sentimentFrames = Math.max(1, sceneFrames.sentiment - finaleFrames);

    const stances = [
        { label: props.fundamental.label, stance: props.fundamental.stance, color: C.blue },
        { label: props.growth.label, stance: props.growth.stance, color: C.green },
        { label: props.risk.label, stance: props.risk.stance, color: C.red },
        { label: props.sentiment.label, stance: props.sentiment.stance, color: C.amber },
    ];

    return (
        <AbsoluteFill style={{ background: C.bg }}>
            {audioSrc ? <Audio src={staticFile(audioSrc)} /> : null}
            <Series>
                {hookFrames > 0 ? (
                    <Series.Sequence durationInFrames={hookFrames}>
                        <HookScene
                            {...props.hook}
                            ticker={props.ticker}
                            date={props.date}
                        />
                    </Series.Sequence>
                ) : null}
                <Series.Sequence durationInFrames={fundamentalFrames}>
                    <FundamentalScene {...props.fundamental} />
                </Series.Sequence>
                <Series.Sequence durationInFrames={sceneFrames.growth}>
                    <GrowthScene {...props.growth} />
                </Series.Sequence>
                <Series.Sequence durationInFrames={sceneFrames.risk}>
                    <RiskScene {...props.risk} />
                </Series.Sequence>
                <Series.Sequence durationInFrames={sentimentFrames}>
                    <SentimentScene {...props.sentiment} />
                </Series.Sequence>
                {finaleFrames > 0 ? (
                    <Series.Sequence durationInFrames={finaleFrames}>
                        <FinaleScene
                            {...props.finale}
                            ticker={props.ticker}
                            stances={stances}
                        />
                    </Series.Sequence>
                ) : null}
            </Series>
        </AbsoluteFill>
    );
};
