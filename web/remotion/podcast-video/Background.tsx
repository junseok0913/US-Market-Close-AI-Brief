import type { FC } from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS, seededRandom } from "./styles";

const PARTICLE_COUNT = 35;

const particles = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
  x: seededRandom(i * 3.1) * 1920,
  y: seededRandom(i * 7.7) * 1080,
  size: seededRandom(i * 5.3) * 3 + 1,
  speed: seededRandom(i * 11.1) * 0.3 + 0.05,
  baseOpacity: seededRandom(i * 13.7) * 0.25 + 0.05,
  phaseOffset: seededRandom(i * 17.3) * Math.PI * 2,
  driftAmp: seededRandom(i * 19.1) * 40 + 10,
}));

export const Background: FC<{ chapterColor: string }> = ({
  chapterColor,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const time = frame / fps;

  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `
            radial-gradient(ellipse 120% 80% at 15% 50%, ${chapterColor}0a 0%, transparent 60%),
            radial-gradient(ellipse 80% 60% at 85% 30%, ${COLORS.primary}06 0%, transparent 50%),
            radial-gradient(ellipse 60% 100% at 50% 100%, ${chapterColor}05 0%, transparent 40%),
            linear-gradient(180deg, ${COLORS.bg} 0%, #060a14 100%)
          `,
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            linear-gradient(${COLORS.border}15 1px, transparent 1px),
            linear-gradient(90deg, ${COLORS.border}15 1px, transparent 1px)
          `,
          backgroundSize: "80px 80px",
          transform: `translateY(${(frame * 0.15) % 80}px)`,
          opacity: interpolate(
            Math.sin(time * 0.5),
            [-1, 1],
            [0.15, 0.35],
          ),
        }}
      />

      {particles.map((p, i) => {
        const yPos =
          ((p.y - frame * p.speed * 1.5 + 2000) % 1200) - 60;
        const xDrift =
          Math.sin(time * 0.8 + p.phaseOffset) * p.driftAmp;
        const pulse = interpolate(
          Math.sin(time * 1.5 + p.phaseOffset),
          [-1, 1],
          [0.3, 1],
        );

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: p.x + xDrift,
              top: yPos,
              width: p.size,
              height: p.size,
              borderRadius: "50%",
              backgroundColor: i % 3 === 0 ? chapterColor : COLORS.primary,
              opacity: p.baseOpacity * pulse,
              boxShadow: `0 0 ${p.size * 6}px ${i % 3 === 0 ? chapterColor : COLORS.primary}50`,
            }}
          />
        );
      })}

      <div
        style={{
          position: "absolute",
          left: "8%",
          top: "25%",
          width: 700,
          height: 700,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${chapterColor}08 0%, transparent 70%)`,
          transform: `translate(${Math.sin(time * 0.3) * 60}px, ${Math.cos(time * 0.25) * 40}px)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          right: "3%",
          bottom: "8%",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${COLORS.accent}06 0%, transparent 70%)`,
          transform: `translate(${Math.cos(time * 0.35) * 50}px, ${Math.sin(time * 0.28) * 35}px)`,
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, transparent 0%, transparent 85%, rgba(0,0,0,0.4) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};
