import { Camera, Lens } from '../data/types';

export type ConditionId = 'snow' | 'sunny' | 'slight' | 'overcast' | 'heavy' | 'shade';

export interface Condition {
  id: ConditionId;
  title: string;
  hint: string;
  /** Sunny 16 aperture at shutter = 1/ISO. */
  baseAperture: number;
}

export const conditions: Condition[] = [
  { id: 'snow', title: 'Snow / Sand', hint: 'Bright sun on light sand or snow', baseAperture: 22 },
  { id: 'sunny', title: 'Sunny', hint: 'Distinct, hard-edged shadows', baseAperture: 16 },
  { id: 'slight', title: 'Slight Overcast', hint: 'Soft shadow edges', baseAperture: 11 },
  { id: 'overcast', title: 'Overcast', hint: 'Barely visible shadows', baseAperture: 8 },
  { id: 'heavy', title: 'Heavy Overcast', hint: 'No shadows', baseAperture: 5.6 },
  { id: 'shade', title: 'Open Shade / Sunset', hint: 'Subject in shade or sun on the horizon', baseAperture: 4 },
];

export interface Setting {
  shutter: number; // seconds
  aperture: number;
  /** Exposure error in stops (+ = overexposed). */
  errorStops: number;
}

export type FilterId = 'none' | 'uv' | 'yellow' | 'red' | 'uv-yellow' | 'uv-red';

export interface LensFilter {
  id: FilterId;
  name: string;
  shortName: string;
  factor: string;
  /** Stops of light absorbed by the filter (requires +stops exposure compensation). */
  stops: number;
  color: string;
  effect: string;
}

export const lensFilters: LensFilter[] = [
  {
    id: 'none',
    name: 'No Filter (Bare Lens)',
    shortName: 'NONE',
    factor: '1× (0 EV)',
    stops: 0,
    color: '#F3EAD3',
    effect: 'Unfiltered baseline exposure',
  },
  {
    id: 'uv',
    name: 'UV / Skylight Filter',
    shortName: 'UV',
    factor: '1× (+0 EV)',
    stops: 0,
    color: '#D8E8E6',
    effect: 'Cuts atmospheric UV haze · No exposure compensation needed',
  },
  {
    id: 'yellow',
    name: 'Yellow Filter (#8 / K2)',
    shortName: 'YELLOW #8',
    factor: '2× (+1 EV)',
    stops: 1,
    color: '#E3A82B',
    effect: '+1 stop compensation · Natural B&W sky/cloud separation & 1 stop wider aperture for bokeh',
  },
  {
    id: 'red',
    name: 'Red Filter (#25 / 25A)',
    shortName: 'RED #25',
    factor: '8× (+3 EV)',
    stops: 3,
    color: '#D9622B',
    effect: '+3 stops compensation · Dramatic B&W contrast & opens 3 stops wider for shallow DOF / bokeh',
  },
  {
    id: 'uv-yellow',
    name: 'UV + Yellow (#8) Stacked',
    shortName: 'UV + YELLOW',
    factor: '2× (+1 EV)',
    stops: 1,
    color: '#E3A82B',
    effect: '+1 stop compensation (UV adds 0 stops; Yellow #8 adds +1 stop)',
  },
  {
    id: 'uv-red',
    name: 'UV + Red (#25) Stacked',
    shortName: 'UV + RED',
    factor: '8× (+3 EV)',
    stops: 3,
    color: '#D9622B',
    effect: '+3 stops compensation (UV adds 0 stops; Red #25 adds +3 stops)',
  },
];

export interface Recommendation {
  ideal: { shutter: number; aperture: number };
  best: Setting | null;
  alternatives: Setting[];
}

const log2 = Math.log2;

/**
 * Sunny 16: shutter = 1/ISO at baseAperture. Any combination with the same
 * N²/t keeps the same exposure. When a filter with `filterStops` light loss is
 * mounted, we compensate by +filterStops (equivalent to dividing effective ISO
 * by 2^filterStops).
 */
export function recommend(
  iso: number,
  condition: Condition,
  camera: Camera,
  lens: Lens,
  filterStops = 0,
): Recommendation {
  const effectiveIso = iso / 2 ** filterStops;
  const target = condition.baseAperture ** 2 * effectiveIso; // N²/t
  const all: Setting[] = [];
  for (const t of camera.shutterSpeeds) {
    for (const n of lens.apertures) {
      all.push({ shutter: t, aperture: n, errorStops: log2(target / ((n * n) / t)) });
    }
  }
  // Best per shutter speed (closest aperture), keep those within 1/2 stop.
  const perShutter = camera.shutterSpeeds
    .map((t) => all.filter((x) => x.shutter === t).sort((a, b) => Math.abs(a.errorStops) - Math.abs(b.errorStops))[0])
    .filter(Boolean);
  const good = perShutter.filter((x) => Math.abs(x.errorStops) <= 0.5);

  const idealAperture = Number((condition.baseAperture / Math.sqrt(2 ** filterStops)).toFixed(1));
  const ideal = { shutter: 1 / iso, aperture: idealAperture };
  const pool = good.length ? good : perShutter;
  // Prefer exact exposure, then the shutter closest to 1/ISO (the classic rule).
  const close = pool.filter((x) => Math.abs(x.errorStops) <= 0.34);
  const shutterDist = (x: Setting) => Math.abs(log2(x.shutter * iso));
  const best =
    (close.length
      ? [...close].sort((a, b) => shutterDist(a) - shutterDist(b) || Math.abs(a.errorStops) - Math.abs(b.errorStops))
      : [...pool].sort((a, b) => Math.abs(a.errorStops) - Math.abs(b.errorStops) || shutterDist(a) - shutterDist(b))
    )[0] ?? null;

  const alternatives = good
    .filter((x) => x !== best)
    .sort((a, b) => a.aperture - b.aperture || a.shutter - b.shutter);

  return { ideal, best, alternatives };
}

export function formatShutter(t: number): string {
  if (t >= 1) return `${Math.round(t)}s`;
  return `1/${Math.round(1 / t)}`;
}

export function formatAperture(n: number): string {
  return `f/${n}`;
}

export function formatError(stops: number): string {
  if (Math.abs(stops) < 0.17) return 'Exact';
  const r = Math.round(stops * 3) / 3;
  const sign = r > 0 ? '+' : '−';
  const abs = Math.abs(r);
  const whole = Math.floor(abs + 0.01);
  const thirds = Math.round((abs - whole) * 3);
  const frac = thirds === 0 ? '' : thirds === 1 ? '⅓' : '⅔';
  return `${sign}${whole ? whole : ''}${frac} EV`;
}
