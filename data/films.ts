import { Film } from './types';

/** Selectable ISO / ASA film speeds. */
export const films: Film[] = [
  { iso: 25, label: 'ISO 25 / 15°' },
  { iso: 50, label: 'ISO 50 / 18°' },
  { iso: 100, label: 'ISO 100 / 21°' },
  { iso: 125, label: 'ISO 125 / 22°' },
  { iso: 160, label: 'ISO 160 / 23°' },
  { iso: 200, label: 'ISO 200 / 24°' },
  { iso: 320, label: 'ISO 320 / 26°' },
  { iso: 400, label: 'ISO 400 / 27°' },
  { iso: 800, label: 'ISO 800 / 30°' },
  { iso: 1600, label: 'ISO 1600 / 33°' },
  { iso: 3200, label: 'ISO 3200 / 36°' },
  { iso: 6400, label: 'ISO 6400 / 39°' },
  { iso: 12800, label: 'ISO 12800 / 42°' },
];

export type FilmProcess =
  | 'C-41 Color Neg'
  | 'B&W Silver'
  | 'B&W Reversal'
  | 'E-6 Slide'
  | 'ECN-2 / C-41';

export interface FilmStock {
  id: string;
  name: string;
  shortName: string;
  iso: number;
  process: FilmProcess;
  latitudeOverStops: number;
  latitudeUnderStops: number;
  grain: string;
  character: string;
  fieldTip: string;
}

/** Iconic analog film stocks for quick selection & latitude guidance. */
export const filmStocks: FilmStock[] = [
  {
    id: 'velvia-50',
    name: 'Fujifilm Velvia 50',
    shortName: 'VELVIA 50',
    iso: 50,
    process: 'E-6 Slide',
    latitudeOverStops: 0.5,
    latitudeUnderStops: 0.5,
    grain: 'Ultra-Fine',
    character: 'Hyper-saturated greens/reds & deep reversal contrast',
    fieldTip: 'Slide film has zero highlight mercy (±0.5 EV). Never overexpose; meter for bright highlights.',
  },
  {
    id: 'ektar-100',
    name: 'Kodak Ektar 100',
    shortName: 'EKTAR 100',
    iso: 100,
    process: 'C-41 Color Neg',
    latitudeOverStops: 2,
    latitudeUnderStops: 1,
    grain: 'World’s Finest C-41',
    character: 'Punchy micro-contrast, vivid primaries & slide-like saturation',
    fieldTip: 'Handles +1 to +2 EV overexposure well, but protect shadows from underexposure to avoid cyan casts.',
  },
  {
    id: 'fomapan-100',
    name: 'Fomapan 100 Classic',
    shortName: 'FOMAPAN 100',
    iso: 100,
    process: 'B&W Silver',
    latitudeOverStops: 2,
    latitudeUnderStops: 1,
    grain: 'Classic 1950s Cubic',
    character: 'Rich vintage Czech silver tonality, crisp acutance & broad red sensitivity',
    fieldTip: 'Loves Yellow #8 (+1 EV) & Red #25 (+3 EV) filters. Guard shadows in harsh sun (rate at EI 80–100) and beware steep reciprocity in >1s exposures.',
  },
  {
    id: 'fomapan-r100',
    name: 'Fomapan R 100 Reversal',
    shortName: 'FOMAPAN R 100',
    iso: 100,
    process: 'B&W Reversal',
    latitudeOverStops: 0.5,
    latitudeUnderStops: 0.5,
    grain: 'Ultra-Fine Direct Positive',
    character: 'True B&W transparency slide film with glowing highlights & deep D-max blacks',
    fieldTip: 'B&W slide film has strict ±0.5 EV latitude like Velvia — meter carefully for highlights so whites do not blow out.',
  },
  {
    id: 'fp4-125',
    name: 'Ilford FP4 Plus 125',
    shortName: 'ILFORD FP4+',
    iso: 125,
    process: 'B&W Silver',
    latitudeOverStops: 3,
    latitudeUnderStops: 1,
    grain: 'Fine Crisp',
    character: 'Classic acutance and smooth midtone separation in daylight',
    fieldTip: 'Pairs beautifully with a Yellow #8 (+1 EV) or Red #25 (+3 EV) filter for sculpted clouds.',
  },
  {
    id: 'portra-160',
    name: 'Kodak Portra 160',
    shortName: 'PORTRA 160',
    iso: 160,
    process: 'C-41 Color Neg',
    latitudeOverStops: 3,
    latitudeUnderStops: 1,
    grain: 'Very Fine',
    character: 'Natural skin tones, low contrast & smooth highlight roll-off',
    fieldTip: 'Ideal for bright sun portraits at f/2–f/4; loves +1 EV overexposure (rate at EI 100) for pastel tones.',
  },
  {
    id: 'gold-200',
    name: 'Kodak Gold 200',
    shortName: 'KODAK GOLD 200',
    iso: 200,
    process: 'C-41 Color Neg',
    latitudeOverStops: 2.5,
    latitudeUnderStops: 1,
    grain: 'Fine Classic',
    character: 'Nostalgic golden warmth, amber highlights & rich summer blues',
    fieldTip: 'Meter for the shadows! In Sidelit or Backlit scenes, add +1 to +2 EV to avoid muddy green shadows.',
  },
  {
    id: 'fomapan-200',
    name: 'Fomapan 200 Creative',
    shortName: 'FOMAPAN 200',
    iso: 200,
    process: 'B&W Silver',
    latitudeOverStops: 2,
    latitudeUnderStops: 1,
    grain: 'Hybrid Tabular/Cubic',
    character: 'Smooth midtone gradation, fine grain & crisp European contrast',
    fieldTip: 'The most balanced Fomapan emulsion. Shines at box ISO 200 or slightly overexposed (+0.5 EV at EI 160) in Rodinal or XTOL.',
  },
  {
    id: 'retropan-320',
    name: 'Foma Retropan 320 Soft',
    shortName: 'RETROPAN 320',
    iso: 320,
    process: 'B&W Silver',
    latitudeOverStops: 3,
    latitudeUnderStops: 1.5,
    grain: 'Tactile Vintage',
    character: 'Low-contrast pictorial look with dreamy highlight halation & 1930s silver glow',
    fieldTip: 'Designed for backlit portraits, Golden Hour & atmospheric street scenes. Wide highlight latitude makes it very forgiving.',
  },
  {
    id: 'portra-400',
    name: 'Kodak Portra 400',
    shortName: 'PORTRA 400',
    iso: 400,
    process: 'C-41 Color Neg',
    latitudeOverStops: 4,
    latitudeUnderStops: 1.5,
    grain: 'Fine T-Grain',
    character: 'Legendary highlight latitude (+4 EV) & warm, forgiving skin tones',
    fieldTip: 'Virtually impossible to blow highlights — when in doubt between two speeds, always choose the slower shutter (+EV).',
  },
  {
    id: 'trix-400',
    name: 'Kodak Tri-X 400',
    shortName: 'TRI-X 400',
    iso: 400,
    process: 'B&W Silver',
    latitudeOverStops: 3,
    latitudeUnderStops: 2,
    grain: 'Classic Cubic Grit',
    character: 'Punchy silver midtones, deep blacks & iconic photojournalism grain',
    fieldTip: 'The street benchmark since 1954. Pushes effortlessly to EI 800 (+1) or EI 1600 (+2) for low-light grit.',
  },
  {
    id: 'hp5-400',
    name: 'Ilford HP5 Plus 400',
    shortName: 'ILFORD HP5+',
    iso: 400,
    process: 'B&W Silver',
    latitudeOverStops: 3.5,
    latitudeUnderStops: 2,
    grain: 'Organic Medium',
    character: 'Wide shadow detail & smoother highlight curve than Tri-X',
    fieldTip: 'Extremely forgiving across Sunny, Overcast, and pushed Night Street scenes up to EI 3200.',
  },
  {
    id: 'fomapan-400',
    name: 'Fomapan 400 Action',
    shortName: 'FOMAPAN 400',
    iso: 400,
    process: 'B&W Silver',
    latitudeOverStops: 2.5,
    latitudeUnderStops: 1,
    grain: 'Gritty Bohemian Cubic',
    character: 'Moody old-world silver grain, deep shadows & dramatic street character',
    fieldTip: 'True speed is closer to ISO 250–320: give +1 EV in Sidelit/Backlit scenes for rich shadows, or pair with Push +1 / Noir (−1 EV) for raw Eastern European grit.',
  },
  {
    id: 'cinestill-800t',
    name: 'CineStill 800T',
    shortName: 'CINESTILL 800T',
    iso: 800,
    process: 'ECN-2 / C-41',
    latitudeOverStops: 3,
    latitudeUnderStops: 1.5,
    grain: 'Cinema Vision3',
    character: 'Tungsten-balanced (3200K) with red halation glow around highlights',
    fieldTip: 'Made for Night Street, Neon & Indoor scenes. In daylight, shoot with an 85B warming filter or overexpose +1 stop.',
  },
  {
    id: 'delta-3200',
    name: 'Ilford Delta 3200',
    shortName: 'DELTA 3200',
    iso: 3200,
    process: 'B&W Silver',
    latitudeOverStops: 2,
    latitudeUnderStops: 2,
    grain: 'Bold Expressive',
    character: 'High-speed tabular grain built for available-darkness photography',
    fieldTip: 'Unlocks handheld shutter speeds in Blue Hour, Indoor Window, and Night Street without flash.',
  },
];
