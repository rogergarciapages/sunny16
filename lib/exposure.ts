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

export interface Recommendation {
  ideal: { shutter: number; aperture: number };
  best: Setting | null;
  alternatives: Setting[];
}

const log2 = Math.log2;

/**
 * Sunny 16: shutter = 1/ISO at baseAperture. Any combination with the same
 * N²/t keeps the same exposure. We search every marked shutter × aperture on
 * the selected camera/lens for the closest matches.
 */
export function recommend(iso: number, condition: Condition, camera: Camera, lens: Lens): Recommendation {
  const target = (condition.baseAperture ** 2) * iso; // N²/t
  const all: Setting[] = [];
  for (const t of camera.shutterSpeeds) {
    for (const n of lens.apertures) {
      all.push({ shutter: t, aperture: n, errorStops: log2(target / (n * n / t)) });
    }
  }
  // Best per shutter speed (closest aperture), keep those within 1/2 stop.
  const perShutter = camera.shutterSpeeds
    .map((t) => all.filter((x) => x.shutter === t).sort((a, b) => Math.abs(a.errorStops) - Math.abs(b.errorStops))[0])
    .filter(Boolean);
  const good = perShutter.filter((x) => Math.abs(x.errorStops) <= 0.5);

  const ideal = { shutter: 1 / iso, aperture: condition.baseAperture };
  const pool = good.length ? good : perShutter;
  // Prefer exact exposure, then the shutter closest to 1/ISO (the classic rule).
  const best =
    [...pool].sort(
      (a, b) =>
        Math.abs(a.errorStops) - Math.abs(b.errorStops) ||
        Math.abs(log2(a.shutter * iso)) - Math.abs(log2(b.shutter * iso)),
    )[0] ?? null;

  const alternatives = good
    .filter((x) => x !== best)
    .sort((a, b) => b.shutter - a.shutter);

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
