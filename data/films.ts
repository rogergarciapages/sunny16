import { Film } from './types';

/** Selectable ISO / ASA film speeds. */
export const films: Film[] = [
  { iso: 25, label: 'ISO 25 / 15°' },
  { iso: 50, label: 'ISO 50 / 18°' },
  { iso: 100, label: 'ISO 100 / 21°' },
  { iso: 125, label: 'ISO 125 / 22°' },
  { iso: 160, label: 'ISO 160 / 23°' },
  { iso: 200, label: 'ISO 200 / 24°' },
  { iso: 400, label: 'ISO 400 / 27°' },
  { iso: 800, label: 'ISO 800 / 30°' },
  { iso: 1600, label: 'ISO 1600 / 33°' },
  { iso: 3200, label: 'ISO 3200 / 36°' },
];
