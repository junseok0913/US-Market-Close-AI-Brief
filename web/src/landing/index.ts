import type { Slide } from '@/types/slide';
import { slides as slides20251222 } from './20251222/slides';
import { slides as slides20260121 } from './20260121/slides';
import { slides as slides20260122 } from './20260122/slides';
import { slides as slides20260123 } from './20260123/slides';
import { slides as slides20260124 } from './20260124/slides';
import { slides as slides20260126 } from './20260126/slides';
import { slides as slides20260127 } from './20260127/slides';
import { slides as slides20260128 } from './20260128/slides';
import { slides as slides20260129 } from './20260129/slides';
import { slides as slides20260130 } from './20260130/slides';
import { slides as slides20260202 } from './20260202/slides';
import { slides as slides20260203 } from './20260203/slides';
import { slides as slides20260204 } from './20260204/slides';
import { slides as slides20260205 } from './20260205/slides';
import { slides as slides20260206 } from './20260206/slides';
import { slides as slides20260209 } from './20260209/slides';
import { slides as slides20260210 } from './20260210/slides';
import { slides as slides20260211 } from './20260211/slides';
import { slides as slides20260212 } from './20260212/slides';
import { slides as slides20260213 } from './20260213/slides';
import { slides as slides20260217 } from './20260217/slides';
import { slides as slides20260218 } from './20260218/slides';
import { slides as slides20260219 } from './20260219/slides';
import { slides as slides20260220 } from './20260220/slides';
import { slides as slides20260223 } from './20260223/slides';

const slidesMap: Record<string, Slide[]> = {
  '20260223': slides20260223,
  '20260220': slides20260220,
  '20260219': slides20260219,
  '20260218': slides20260218,
  '20260217': slides20260217,
  '20260213': slides20260213,
  '20260212': slides20260212,
  '20260211': slides20260211,
  '20260210': slides20260210,
  '20260209': slides20260209,
  '20260206': slides20260206,
  '20260205': slides20260205,
  '20260204': slides20260204,
  '20260203': slides20260203,
  '20260202': slides20260202,
  '20260130': slides20260130,
  '20260129': slides20260129,
  '20260128': slides20260128,
  '20260127': slides20260127,
  '20260126': slides20260126,
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
