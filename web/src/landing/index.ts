import type { Slide } from '@/types/slide';
import { slides as slides20251222 } from './20251222/slides';
import { slides as slides20260121 } from './20260121/slides';
import { slides as slides20260122 } from './20260122/slides';
import { slides as slides20260123 } from './20260123/slides';
import { slides as slides20260124 } from './20260124/slides';

const slidesMap: Record<string, Slide[]> = {
  '20260124': slides20260124,
  '20260123': slides20260123,
  '20260122': slides20260122,
  '20260121': slides20260121,
  '20251222': slides20251222,
};

export function getSlides(episodeDate: string): Slide[] {
  return slidesMap[episodeDate] || [];
}

export function hasSlides(episodeDate: string): boolean {
  return episodeDate in slidesMap;
}
