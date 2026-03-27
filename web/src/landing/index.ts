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
import { slides as slides20260224 } from './20260224/slides';
import { slides as slides20260225 } from './20260225/slides';
import { slides as slides20260226 } from './20260226/slides';
import { slides as slides20260227 } from './20260227/slides';
import { slides as slides20260302 } from './20260302/slides';
import { slides as slides20260303 } from './20260303/slides';
import { slides as slides20260304 } from './20260304/slides';
import { slides as slides20260305 } from './20260305/slides';
import { slides as slides20260306 } from './20260306/slides';
import { slides as slides20260309 } from './20260309/slides';
import { slides as slides20260310 } from './20260310/slides';
import { slides as slides20260311 } from './20260311/slides';
import { slides as slides20260312 } from './20260312/slides';
import { slides as slides20260313 } from './20260313/slides';
import { slides as slides20260316 } from './20260316/slides';
import { slides as slides20260317 } from './20260317/slides';
import { slides as slides20260318 } from './20260318/slides';
import { slides as slides20260319 } from './20260319/slides';
import { slides as slides20260320 } from './20260320/slides';
import { slides as slides20260323 } from './20260323/slides';
import { slides as slides20260324 } from './20260324/slides';
import { slides as slides20260325 } from './20260325/slides';
import { slides as slides20260326 } from './20260326/slides';
import { slides as slides20260327 } from './20260327/slides';

const slidesMap: Record<string, Slide[]> = {
  '20260327': slides20260327,
  '20260326': slides20260326,
  '20260325': slides20260325,
  '20260324': slides20260324,
  '20260323': slides20260323,
  '20260320': slides20260320,
  '20260319': slides20260319,
  '20260318': slides20260318,
  '20260317': slides20260317,
  '20260316': slides20260316,
  '20260313': slides20260313,
  '20260312': slides20260312,
  '20260311': slides20260311,
  '20260310': slides20260310,
  '20260309': slides20260309,
  '20260306': slides20260306,
  '20260305': slides20260305,
  '20260304': slides20260304,
  '20260303': slides20260303,
  '20260302': slides20260302,
  '20260227': slides20260227,
  '20260226': slides20260226,
  '20260225': slides20260225,
  '20260224': slides20260224,
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
