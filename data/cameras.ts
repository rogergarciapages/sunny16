import { Camera } from './types';

/** Shutter speeds are in seconds. Helper to build "1/x" lists. */
const s = (...denoms: number[]) => denoms.map((d) => (d <= 1 ? 1 / d : 1 / d));
const full = (fastest: number) =>
  [1, 2, 4, 8, 15, 30, 60, 125, 250, 500, 1000, 2000, 4000].filter((d) => d <= fastest).map((d) => 1 / d);

export const cameras: Camera[] = [
  { id: 'nikon-fm2', brandId: 'nikon', name: 'FM2', year: 1982, format: '35mm', mount: 'nikon-f', shutterSpeeds: full(4000), isoRange: [12, 6400] },
  { id: 'nikon-f2', brandId: 'nikon', name: 'F2', year: 1971, format: '35mm', mount: 'nikon-f', shutterSpeeds: full(2000), isoRange: [6, 6400] },
  { id: 'nikon-em', brandId: 'nikon', name: 'EM', year: 1979, format: '35mm', mount: 'nikon-f', shutterSpeeds: full(1000), isoRange: [25, 1600] },

  { id: 'canon-ae1', brandId: 'canon', name: 'AE-1', year: 1976, format: '35mm', mount: 'canon-fd', shutterSpeeds: full(1000), isoRange: [25, 3200] },
  { id: 'canon-a1', brandId: 'canon', name: 'A-1', year: 1978, format: '35mm', mount: 'canon-fd', shutterSpeeds: full(1000), isoRange: [6, 12800] },
  { id: 'canon-canonet-ql17', brandId: 'canon', name: 'Canonet QL17 GIII', year: 1972, format: '35mm', mount: 'fixed', fixedLensIds: ['canonet-40-1.7'], shutterSpeeds: full(500), isoRange: [25, 800] },

  { id: 'pentax-k1000', brandId: 'pentax', name: 'K1000', year: 1976, format: '35mm', mount: 'pentax-k', shutterSpeeds: full(1000), isoRange: [20, 3200] },
  { id: 'pentax-spotmatic', brandId: 'pentax', name: 'Spotmatic', year: 1964, format: '35mm', mount: 'm42', shutterSpeeds: full(1000), isoRange: [20, 1600] },

  { id: 'olympus-om1', brandId: 'olympus', name: 'OM-1', year: 1972, format: '35mm', mount: 'olympus-om', shutterSpeeds: full(1000), isoRange: [25, 1600] },
  { id: 'olympus-35rc', brandId: 'olympus', name: '35 RC', year: 1970, format: '35mm', mount: 'fixed', fixedLensIds: ['olympus-35rc-lens'], shutterSpeeds: s(15, 30, 60, 125, 250, 500), isoRange: [25, 800] },

  { id: 'minolta-x700', brandId: 'minolta', name: 'X-700', year: 1981, format: '35mm', mount: 'minolta-sr', shutterSpeeds: full(1000), isoRange: [25, 1600] },
  { id: 'minolta-srt101', brandId: 'minolta', name: 'SR-T 101', year: 1966, format: '35mm', mount: 'minolta-sr', shutterSpeeds: full(1000), isoRange: [6, 6400] },

  { id: 'leica-m3', brandId: 'leica', name: 'M3', year: 1954, format: '35mm', mount: 'leica-m', shutterSpeeds: full(1000) },
  { id: 'leica-m6', brandId: 'leica', name: 'M6', year: 1984, format: '35mm', mount: 'leica-m', shutterSpeeds: full(1000), isoRange: [6, 6400] },

  { id: 'zenit-e', brandId: 'zenit', name: 'E', year: 1965, format: '35mm', mount: 'm42', shutterSpeeds: s(30, 60, 125, 250, 500) },

  { id: 'hasselblad-500cm', brandId: 'hasselblad', name: '500 C/M', year: 1970, format: '120', mount: 'hasselblad-v', shutterSpeeds: full(500) },

  { id: 'yashica-mat-124g', brandId: 'yashica', name: 'Mat-124 G', year: 1970, format: '120', mount: 'fixed', fixedLensIds: ['yashinon-80-3.5'], shutterSpeeds: full(500), isoRange: [25, 400] },
];
