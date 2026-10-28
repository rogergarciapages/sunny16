import { Lens } from './types';

const STOPS = [1, 1.2, 1.4, 1.7, 1.8, 2, 2.8, 3.5, 4, 5.6, 8, 11, 16, 22, 32];
/** Helper: full stops from `widest` to `smallest` (widest included even if non-standard). */
const range = (widest: number, smallest: number): number[] => [
  widest,
  ...STOPS.filter((s) => s > widest && s <= smallest && [2, 2.8, 4, 5.6, 8, 11, 16, 22, 32].includes(s)),
];

export const lenses: Lens[] = [
  // Nikon F
  { id: 'nikkor-50-1.4', name: 'Nikkor 50mm f/1.4 AI', mount: 'nikon-f', focalLength: 50, apertures: range(1.4, 16) },
  { id: 'nikkor-50-1.8', name: 'Nikon Series E 50mm f/1.8', mount: 'nikon-f', focalLength: 50, apertures: range(1.8, 22) },
  { id: 'nikkor-28-2.8', name: 'Nikkor 28mm f/2.8 AI-S', mount: 'nikon-f', focalLength: 28, apertures: range(2.8, 22) },
  { id: 'nikkor-105-2.5', name: 'Nikkor 105mm f/2.5', mount: 'nikon-f', focalLength: 105, apertures: range(2.5, 22) },
  // Canon FD
  { id: 'canon-fd-50-1.8', name: 'Canon FD 50mm f/1.8', mount: 'canon-fd', focalLength: 50, apertures: range(1.8, 22) },
  { id: 'canon-fd-50-1.4', name: 'Canon FD 50mm f/1.4', mount: 'canon-fd', focalLength: 50, apertures: range(1.4, 22) },
  { id: 'canon-fd-28-2.8', name: 'Canon FD 28mm f/2.8', mount: 'canon-fd', focalLength: 28, apertures: range(2.8, 22) },
  // Pentax K
  { id: 'smc-50-1.7', name: 'SMC Pentax-M 50mm f/1.7', mount: 'pentax-k', focalLength: 50, apertures: range(1.7, 22) },
  { id: 'smc-28-2.8', name: 'SMC Pentax-M 28mm f/2.8', mount: 'pentax-k', focalLength: 28, apertures: range(2.8, 22) },
  // M42
  { id: 'helios-44-2', name: 'Helios 44-2 58mm f/2', mount: 'm42', focalLength: 58, apertures: range(2, 16) },
  { id: 'takumar-55-1.8', name: 'Super-Takumar 55mm f/1.8', mount: 'm42', focalLength: 55, apertures: range(1.8, 16) },
  // Olympus OM
  { id: 'zuiko-50-1.8', name: 'Zuiko 50mm f/1.8', mount: 'olympus-om', focalLength: 50, apertures: range(1.8, 16) },
  { id: 'zuiko-28-3.5', name: 'Zuiko 28mm f/3.5', mount: 'olympus-om', focalLength: 28, apertures: range(3.5, 16) },
  // Minolta SR
  { id: 'rokkor-50-1.7', name: 'MD Rokkor 50mm f/1.7', mount: 'minolta-sr', focalLength: 50, apertures: range(1.7, 16) },
  // Leica M
  { id: 'summicron-50-2', name: 'Summicron 50mm f/2', mount: 'leica-m', focalLength: 50, apertures: range(2, 16) },
  { id: 'summaron-35-2.8', name: 'Summaron 35mm f/2.8', mount: 'leica-m', focalLength: 35, apertures: range(2.8, 22) },
  // Hasselblad V
  { id: 'planar-80-2.8', name: 'Zeiss Planar 80mm f/2.8 C', mount: 'hasselblad-v', focalLength: 80, apertures: range(2.8, 22) },
  // Fixed lenses
  { id: 'olympus-35rc-lens', name: 'E.Zuiko 42mm f/2.8 (fixed)', mount: 'fixed', focalLength: 42, apertures: range(2.8, 22) },
  { id: 'yashinon-80-3.5', name: 'Yashinon 80mm f/3.5 (fixed)', mount: 'fixed', focalLength: 80, apertures: range(3.5, 32) },
  { id: 'canonet-40-1.7', name: 'Canon 40mm f/1.7 (fixed)', mount: 'fixed', focalLength: 40, apertures: range(1.7, 16) },
];
