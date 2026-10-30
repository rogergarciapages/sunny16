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
  /** Net exposure compensation in stops (filterStops + evShiftStops). */
  netEvStops: number;
  /** Effective ISO after combining box ISO, filter factor, and gritty EV shift. */
  effectiveIso: number;
}

export type GrittyStyleId = 'off' | 'push-1' | 'push-2' | 'crushed' | 'kinetic';

export interface GrittyStyle {
  id: GrittyStyleId;
  name: string;
  shortName: string;
  badge: string;
  /** In-camera exposure shift in stops (e.g. -1 = underexpose 1 stop / rate at 2x ISO). */
  evShiftStops: number;
  /** Lab development push in stops (+1, +2, or 0 for normal dev). */
  pushStops: number;
  /** Suggested filter pairing for this gritty look. */
  recommendedFilter: string;
  description: string;
}

export const grittyStyles: GrittyStyle[] = [
  {
    id: 'off',
    name: 'Standard Clean (Box Speed)',
    shortName: 'CLEAN (0 EV)',
    badge: 'BOX SPEED',
    evShiftStops: 0,
    pushStops: 0,
    recommendedFilter: 'None or UV',
    description: 'Balanced box-speed exposure with full shadow detail and normal development.',
  },
  {
    id: 'push-1',
    name: 'Street Grit · Push +1 Stop',
    shortName: 'PUSH +1 (−1 EV)',
    badge: '2× ISO · +1 DEV',
    evShiftStops: -1,
    pushStops: 1,
    recommendedFilter: 'Yellow #8 (+1 EV)',
    description: 'Underexpose 1 stop in-camera & push +1 stop in lab. Boosts midtone bite, grain texture & shutter speed.',
  },
  {
    id: 'push-2',
    name: 'Raw / Daido Grit · Push +2 Stops',
    shortName: 'PUSH +2 (−2 EV)',
    badge: '4× ISO · +2 DEV',
    evShiftStops: -2,
    pushStops: 2,
    recommendedFilter: 'Yellow #8 or Red #25',
    description: 'Underexpose 2 stops in-camera & push +2 stops in lab. Heavy silver grain, crushed blacks & chalky highlights.',
  },
  {
    id: 'crushed',
    name: 'Noir Silhouette · Crushed Shadows',
    shortName: 'NOIR (−1 EV)',
    badge: '−1 EV · NORMAL DEV',
    evShiftStops: -1,
    pushStops: 0,
    recommendedFilter: 'Red #25 (+3 EV)',
    description: 'Expose for highlights (−1 EV) with normal development so shadows drop into deep ink-black silhouettes.',
  },
  {
    id: 'kinetic',
    name: 'Kinetic Street Drag · Slow Shutter',
    shortName: 'MOTION DRAG',
    badge: '1/8s–1/30s BLUR',
    evShiftStops: 0,
    pushStops: 0,
    recommendedFilter: 'Red #25 (+3 EV) in sun',
    description: 'Stops down the lens (f/11–f/32) to force a slow 1/8s–1/30s shutter for raw handheld street motion blur.',
  },
];

export interface GrittyRecommendation {
  style: GrittyStyle;
  /** Film rating from the gritty push/underexposure alone (e.g. ISO 400 -> EI 800). */
  ratedIso: number;
  /** Combined effective ISO in-camera after accumulating both filter factor and gritty shift. */
  effectiveCameraIso: number;
  /** Net accumulated stops (filterStops + style.evShiftStops). */
  netEvStops: number;
  grainProfile: string;
  labNote: string;
  isoDialNote: string;
  zoneFocusHint: string;
  primary: Setting | null;
  zoneSetting: Setting | null;
  bokehSetting: Setting | null;
  dragSetting: Setting | null;
}

const log2 = Math.log2;

/**
 * Sunny 16: shutter = 1/ISO at baseAperture. Any combination with the same
 * N²/t keeps the same exposure.
 * - `filterStops`: stops of light absorbed by a lens filter (+compensation needed).
 * - `evShiftStops`: intentional exposure shift (e.g. -1 for Push +1 underexposes by 1 stop,
 *   effectively rating the film at 2× ISO).
 */
export function recommend(
  iso: number,
  condition: Condition,
  camera: Camera,
  lens: Lens,
  filterStops = 0,
  evShiftStops = 0,
): Recommendation {
  // Net exposure compensation in stops:
  // +filterStops (more light needed for filter) + evShiftStops (negative for push/underexposure)
  const netEvStops = filterStops + evShiftStops;
  const effectiveIso = iso / 2 ** netEvStops;
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

  const idealAperture = Number((condition.baseAperture / Math.sqrt(2 ** netEvStops)).toFixed(1));
  const ideal = { shutter: 1 / iso, aperture: idealAperture };
  const pool = good.length ? good : perShutter;
  // Prefer exact exposure, then the shutter closest to 1/effectiveIso.
  const close = pool.filter((x) => Math.abs(x.errorStops) <= 0.34);
  const shutterDist = (x: Setting) => Math.abs(log2(x.shutter * effectiveIso));
  const best =
    (close.length
      ? [...close].sort((a, b) => shutterDist(a) - shutterDist(b) || Math.abs(a.errorStops) - Math.abs(b.errorStops))
      : [...pool].sort((a, b) => Math.abs(a.errorStops) - Math.abs(b.errorStops) || shutterDist(a) - shutterDist(b))
    )[0] ?? null;

  const alternatives = good
    .filter((x) => x !== best)
    .sort((a, b) => a.aperture - b.aperture || a.shutter - b.shutter);

  return { ideal, best, alternatives, netEvStops, effectiveIso };
}

/**
 * Computes equipment- and ISO-specific gritty photography settings for the
 * selected camera, lens, film speed, lighting condition, and active filter.
 */
export function recommendGritty(
  iso: number,
  condition: Condition,
  camera: Camera,
  lens: Lens,
  filterStops: number,
  style: GrittyStyle,
): GrittyRecommendation {
  const ratedIso = Math.round(iso * 2 ** -style.evShiftStops);
  const netEvStops = filterStops + style.evShiftStops;
  const effectiveCameraIso = Number((iso / 2 ** netEvStops).toFixed(1));
  const rec = recommend(iso, condition, camera, lens, filterStops, style.evShiftStops);
  const candidates = rec.best ? [rec.best, ...rec.alternatives] : [];

  // Zone-focus / street setting: prefer f/8–f/16 with shutter >= 1/125s
  const zoneSetting =
    [...candidates]
      .filter((c) => c.aperture >= 5.6 && c.aperture <= 16 && c.shutter <= 1 / 125)
      .sort((a, b) => Math.abs(a.aperture - 8) - Math.abs(b.aperture - 8))[0] ??
    rec.best;

  // Wide-open gritty bokeh: widest available aperture in the valid exposure pool
  const bokehSetting = [...candidates].sort((a, b) => a.aperture - b.aperture)[0] ?? null;

  // Kinetic motion drag: prefer shutter between 1/8s and 1/60s (closest to 1/15s–1/30s)
  const dragSetting =
    [...candidates]
      .filter((c) => c.shutter >= 1 / 60 && c.shutter <= 1 / 4)
      .sort((a, b) => Math.abs(log2(a.shutter / (1 / 15))) - Math.abs(log2(b.shutter / (1 / 15))))[0] ??
    [...candidates].sort((a, b) => b.shutter - a.shutter)[0] ??
    null;

  const primary =
    style.id === 'kinetic'
      ? dragSetting ?? rec.best
      : rec.best;

  const grainProfile =
    ratedIso <= 100
      ? 'FINE / HIGH-ACUTANCE GRIT'
      : ratedIso <= 400
      ? 'CLASSIC STREET GRAIN'
      : ratedIso <= 1600
      ? 'COARSE / PUNCHY SILVER GRIT'
      : 'EXTREME GOLF-BALL GRAIN';

  const labNote =
    style.pushStops === 0
      ? style.id === 'crushed'
        ? `Rate at EI ${ratedIso} (−1 EV) · Develop at normal ISO ${iso} time for ink-black shadows.`
        : `Rate at box ISO ${iso} · Standard development; use high-contrast grade 3.5–4 print/scan curve.`
      : `Rate film at EI ${ratedIso} · Push-process +${style.pushStops} stop${style.pushStops > 1 ? 's' : ''} in lab (e.g. Rodinal 1+25 for sharp grain or Microphen/XTOL for shadow speed).`;

  const isoDialNote = !camera.isoRange
    ? `Fully mechanical body (no meter dial limit) — set effective ISO ${effectiveCameraIso} exposure directly on shutter & aperture.`
    : effectiveCameraIso >= camera.isoRange[0] && effectiveCameraIso <= camera.isoRange[1]
    ? `${camera.name} meter supports effective ISO ${effectiveCameraIso} directly (range: ISO ${camera.isoRange[0]}–${camera.isoRange[1]}).`
    : `Effective ISO ${effectiveCameraIso} exceeds ${camera.name} meter dial (ISO ${camera.isoRange[0]}–${camera.isoRange[1]}) — use manual settings below.`;

  const zoneFocusHint =
    lens.focalLength <= 35
      ? `${lens.focalLength}mm Wide Street Zone: Set f/8–f/11 focused at ~2.5m (sharp from 1.4m to ∞).`
      : lens.focalLength <= 58
      ? `${lens.focalLength}mm Standard Street Zone: Set f/8–f/11 focused at ~3.5m (sharp from 2.2m to ∞).`
      : `${lens.focalLength}mm Tele / Medium Format: Use ${formatAperture(bokehSetting?.aperture ?? lens.apertures[0])} for gritty subject isolation or f/8+ for compressed street layers.`;

  return {
    style,
    ratedIso,
    effectiveCameraIso,
    netEvStops,
    grainProfile,
    labNote,
    isoDialNote,
    zoneFocusHint,
    primary,
    zoneSetting,
    bokehSetting,
    dragSetting,
  };
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
