'use client';

import type { CSSProperties, HTMLAttributes } from 'react';
import { motion as framerMotion } from 'framer-motion';
import { useEpisodeRenderState } from './EpisodeRenderContext';
import {
  buildRenderMotionStyle,
  type RenderMotionTransition,
  type RenderMotionValues,
} from '@/lib/youtube-render';

type MotionElementProps<T> = HTMLAttributes<T> & {
  initial?: RenderMotionValues;
  animate?: RenderMotionValues;
  transition?: RenderMotionTransition;
  style?: CSSProperties;
};

function mergeAnimatedStyle(
  baseStyle: CSSProperties | undefined,
  animatedStyle: Record<string, number | string>,
): CSSProperties {
  const merged: CSSProperties = {
    ...(baseStyle ?? {}),
    ...animatedStyle,
  };

  const baseTransform = baseStyle?.transform?.trim();
  const animatedTransform = typeof animatedStyle.transform === 'string'
    ? animatedStyle.transform.trim()
    : '';

  if (animatedTransform && baseTransform) {
    merged.transform = `${animatedTransform} ${baseTransform}`;
  }

  return merged;
}

function MotionDiv({
  initial,
  animate,
  transition,
  style,
  ...rest
}: MotionElementProps<HTMLDivElement>) {
  const { renderMode, slideElapsedSec } = useEpisodeRenderState();

  if (!renderMode) {
    return (
      <framerMotion.div
        initial={initial as never}
        animate={animate as never}
        transition={transition as never}
        style={style}
        {...rest}
      />
    );
  }

  const animatedStyle = buildRenderMotionStyle({
    elapsedSec: slideElapsedSec,
    initial,
    animate,
    transition,
  });

  return <div style={mergeAnimatedStyle(style, animatedStyle)} {...rest} />;
}

function MotionP({
  initial,
  animate,
  transition,
  style,
  ...rest
}: MotionElementProps<HTMLParagraphElement>) {
  const { renderMode, slideElapsedSec } = useEpisodeRenderState();

  if (!renderMode) {
    return (
      <framerMotion.p
        initial={initial as never}
        animate={animate as never}
        transition={transition as never}
        style={style}
        {...rest}
      />
    );
  }

  const animatedStyle = buildRenderMotionStyle({
    elapsedSec: slideElapsedSec,
    initial,
    animate,
    transition,
  });

  return <p style={mergeAnimatedStyle(style, animatedStyle)} {...rest} />;
}

export const motion = {
  div: MotionDiv,
  p: MotionP,
};
