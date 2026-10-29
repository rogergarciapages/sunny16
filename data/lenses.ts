import { Lens } from './types';

const STOPS = [1, 1.2, 1.4, 1.7, 1.8, 1.9, 2, 2.4, 2.5, 2.8, 3.5, 4, 4.5, 5.6, 8, 11, 16, 22, 32];
/** Helper: full stops from `widest` to `smallest` (widest included even if half/third-stop). */
const range = (widest: number, smallest: number): number[] => [
  widest,
  ...STOPS.filter((s) => s > widest && s <= smallest && [1.4, 2, 2.8, 4, 5.6, 8, 11, 16, 22, 32].includes(s)),
];

const NIKON_AI_BODIES = [
  'nikon-fm', 'nikon-fe', 'nikon-em', 'nikon-f3', 'nikon-fg', 'nikon-fm2',
  'nikon-fe2', 'nikon-fa', 'nikon-f301', 'nikon-f4', 'nikon-f801', 'nikon-f90x',
  'nikon-fm10', 'nikon-f5', 'nikon-fe10', 'nikon-f100',
];

const NIKON_AF_BODIES = ['nikon-f4', 'nikon-f801', 'nikon-f90x', 'nikon-f5', 'nikon-f100'];

export const lenses: Lens[] = [
  // Nikon F — AI / AI-S (with metering prong + AI coupling: compatible with all Nikon F bodies 1959–1999)
  { id: 'nikkor-24-2.8', name: 'Nikkor 24mm f/2.8 AI-S', mount: 'nikon-f', brandId: 'nikon', focalLength: 24, apertures: range(2.8, 22) },
  { id: 'nikkor-28-2.8', name: 'Nikkor 28mm f/2.8 AI-S', mount: 'nikon-f', brandId: 'nikon', focalLength: 28, apertures: range(2.8, 22) },
  { id: 'nikkor-35-2', name: 'Nikkor 35mm f/2 AI-S', mount: 'nikon-f', brandId: 'nikon', focalLength: 35, apertures: range(2, 22) },
  { id: 'nikkor-35-1.4', name: 'Nikkor 35mm f/1.4 AI-S', mount: 'nikon-f', brandId: 'nikon', focalLength: 35, apertures: range(1.4, 16) },
  { id: 'nikkor-50-1.4', name: 'Nikkor 50mm f/1.4 AI', mount: 'nikon-f', brandId: 'nikon', focalLength: 50, apertures: range(1.4, 16) },
  { id: 'nikkor-50-1.2', name: 'Nikkor 50mm f/1.2 AI-S', mount: 'nikon-f', brandId: 'nikon', focalLength: 50, apertures: range(1.2, 16) },
  { id: 'nikkor-85-2', name: 'Nikkor 85mm f/2 AI-S', mount: 'nikon-f', brandId: 'nikon', focalLength: 85, apertures: range(2, 22) },
  { id: 'nikkor-105-2.5', name: 'Nikkor 105mm f/2.5 AI-S', mount: 'nikon-f', brandId: 'nikon', focalLength: 105, apertures: range(2.5, 22) },
  { id: 'nikkor-135-2.8', name: 'Nikkor 135mm f/2.8 AI-S', mount: 'nikon-f', brandId: 'nikon', focalLength: 135, apertures: range(2.8, 32) },
  // Nikon Series E (AI-only, no pre-AI metering prong — for 1977+ AI/AF bodies)
  { id: 'nikkor-50-1.8', name: 'Nikon Series E 50mm f/1.8', mount: 'nikon-f', brandId: 'nikon', focalLength: 50, apertures: range(1.8, 22), compatibleCameraIds: NIKON_AI_BODIES },
  { id: 'nikon-e-35-2.5', name: 'Nikon Series E 35mm f/2.5', mount: 'nikon-f', brandId: 'nikon', focalLength: 35, apertures: range(2.5, 22), compatibleCameraIds: NIKON_AI_BODIES },
  { id: 'nikon-e-100-2.8', name: 'Nikon Series E 100mm f/2.8', mount: 'nikon-f', brandId: 'nikon', focalLength: 100, apertures: range(2.8, 22), compatibleCameraIds: NIKON_AI_BODIES },
  // Nikon AF-D (for Nikon AF SLRs: F4, F-801, F90X, F5, F100)
  { id: 'nikkor-af-50-1.8d', name: 'AF Nikkor 50mm f/1.8D', mount: 'nikon-f', brandId: 'nikon', focalLength: 50, apertures: range(1.8, 22), compatibleCameraIds: NIKON_AF_BODIES },
  { id: 'nikkor-af-50-1.4d', name: 'AF Nikkor 50mm f/1.4D', mount: 'nikon-f', brandId: 'nikon', focalLength: 50, apertures: range(1.4, 16), compatibleCameraIds: NIKON_AF_BODIES },
  { id: 'nikkor-af-28-2.8d', name: 'AF Nikkor 28mm f/2.8D', mount: 'nikon-f', brandId: 'nikon', focalLength: 28, apertures: range(2.8, 22), compatibleCameraIds: NIKON_AF_BODIES },
  { id: 'nikkor-af-85-1.8d', name: 'AF Nikkor 85mm f/1.8D', mount: 'nikon-f', brandId: 'nikon', focalLength: 85, apertures: range(1.8, 16), compatibleCameraIds: NIKON_AF_BODIES },
  { id: 'nikkor-af-35-70-2.8d', name: 'AF Zoom-Nikkor 35-70mm f/2.8D', mount: 'nikon-f', brandId: 'nikon', focalLength: 50, apertures: range(2.8, 22), compatibleCameraIds: NIKON_AF_BODIES },

  // Canon FD (FT QL, F-1, FTb, EF, AE-1, AT-1, A-1, AV-1, New F-1, AE-1 Program, AL-1, T70, T90, T60)
  { id: 'canon-fd-24-2.8', name: 'Canon FD 24mm f/2.8', mount: 'canon-fd', brandId: 'canon', focalLength: 24, apertures: range(2.8, 22) },
  { id: 'canon-fd-28-2.8', name: 'Canon FD 28mm f/2.8', mount: 'canon-fd', brandId: 'canon', focalLength: 28, apertures: range(2.8, 22) },
  { id: 'canon-fd-35-2', name: 'Canon FD 35mm f/2', mount: 'canon-fd', brandId: 'canon', focalLength: 35, apertures: range(2, 22) },
  { id: 'canon-fd-50-1.8', name: 'Canon FD 50mm f/1.8', mount: 'canon-fd', brandId: 'canon', focalLength: 50, apertures: range(1.8, 22) },
  { id: 'canon-fd-50-1.4', name: 'Canon FD 50mm f/1.4', mount: 'canon-fd', brandId: 'canon', focalLength: 50, apertures: range(1.4, 22) },
  { id: 'canon-fd-50-1.2l', name: 'Canon FD 50mm f/1.2L', mount: 'canon-fd', brandId: 'canon', focalLength: 50, apertures: range(1.2, 16) },
  { id: 'canon-fd-85-1.8', name: 'Canon FD 85mm f/1.8', mount: 'canon-fd', brandId: 'canon', focalLength: 85, apertures: range(1.8, 22) },
  { id: 'canon-fd-100-2.8', name: 'Canon FD 100mm f/2.8', mount: 'canon-fd', brandId: 'canon', focalLength: 100, apertures: range(2.8, 22) },
  { id: 'canon-fd-135-2.8', name: 'Canon FD 135mm f/2.8', mount: 'canon-fd', brandId: 'canon', focalLength: 135, apertures: range(2.8, 32) },

  // Canon EF (EOS 650, EOS-1, EOS-1N, EOS-3)
  { id: 'canon-ef-24-2.8', name: 'Canon EF 24mm f/2.8', mount: 'canon-ef', brandId: 'canon', focalLength: 24, apertures: range(2.8, 22) },
  { id: 'canon-ef-28-2.8', name: 'Canon EF 28mm f/2.8', mount: 'canon-ef', brandId: 'canon', focalLength: 28, apertures: range(2.8, 22) },
  { id: 'canon-ef-35-2', name: 'Canon EF 35mm f/2', mount: 'canon-ef', brandId: 'canon', focalLength: 35, apertures: range(2, 22) },
  { id: 'canon-ef-50-1.8', name: 'Canon EF 50mm f/1.8', mount: 'canon-ef', brandId: 'canon', focalLength: 50, apertures: range(1.8, 22) },
  { id: 'canon-ef-50-1.4', name: 'Canon EF 50mm f/1.4 USM', mount: 'canon-ef', brandId: 'canon', focalLength: 50, apertures: range(1.4, 22) },
  { id: 'canon-ef-85-1.8', name: 'Canon EF 85mm f/1.8 USM', mount: 'canon-ef', brandId: 'canon', focalLength: 85, apertures: range(1.8, 22) },
  { id: 'canon-ef-100-2.8', name: 'Canon EF 100mm f/2.8 Macro', mount: 'canon-ef', brandId: 'canon', focalLength: 100, apertures: range(2.8, 32) },
  { id: 'canon-ef-28-70-2.8l', name: 'Canon EF 28-70mm f/2.8L USM', mount: 'canon-ef', brandId: 'canon', focalLength: 50, apertures: range(2.8, 22) },

  // Pentax K (Pentax K/M/A/F/FA bodies & Zenit Automat / 212k)
  { id: 'smc-50-1.7', name: 'SMC Pentax-M 50mm f/1.7', mount: 'pentax-k', brandId: 'pentax', focalLength: 50, apertures: range(1.7, 22) },
  { id: 'smc-50-1.4', name: 'SMC Pentax-M 50mm f/1.4', mount: 'pentax-k', brandId: 'pentax', focalLength: 50, apertures: range(1.4, 22) },
  { id: 'smc-50-2', name: 'SMC Pentax-M 50mm f/2', mount: 'pentax-k', brandId: 'pentax', focalLength: 50, apertures: range(2, 22) },
  { id: 'smc-28-2.8', name: 'SMC Pentax-M 28mm f/2.8', mount: 'pentax-k', brandId: 'pentax', focalLength: 28, apertures: range(2.8, 22) },
  { id: 'smc-35-2', name: 'SMC Pentax-M 35mm f/2', mount: 'pentax-k', brandId: 'pentax', focalLength: 35, apertures: range(2, 22) },
  { id: 'smc-85-2', name: 'SMC Pentax-M 85mm f/2', mount: 'pentax-k', brandId: 'pentax', focalLength: 85, apertures: range(2, 22) },
  { id: 'smc-135-3.5', name: 'SMC Pentax-M 135mm f/3.5', mount: 'pentax-k', brandId: 'pentax', focalLength: 135, apertures: range(3.5, 32) },
  { id: 'smc-a-50-1.7', name: 'SMC Pentax-A 50mm f/1.7', mount: 'pentax-k', brandId: 'pentax', focalLength: 50, apertures: range(1.7, 22) },
  { id: 'smc-fa-50-1.4', name: 'SMC Pentax-FA 50mm f/1.4', mount: 'pentax-k', brandId: 'pentax', focalLength: 50, apertures: range(1.4, 22), compatibleCameraIds: ['pentax-sf1', 'pentax-z1', 'pentax-mz5', 'pentax-mzm'] },
  { id: 'smc-fa-28-70-4', name: 'SMC Pentax-FA 28-70mm f/4 AL', mount: 'pentax-k', brandId: 'pentax', focalLength: 50, apertures: range(4, 22), compatibleCameraIds: ['pentax-sf1', 'pentax-z1', 'pentax-mz5', 'pentax-mzm'] },
  // Zenit K-mount lenses
  { id: 'helios-44k-4', name: 'MC Helios-44K-4 58mm f/2', mount: 'pentax-k', brandId: 'zenit', focalLength: 58, apertures: range(2, 16) },
  { id: 'zenitar-k2-50-2', name: 'MC Zenitar-K2 50mm f/2', mount: 'pentax-k', brandId: 'zenit', focalLength: 50, apertures: range(2, 16) },
  { id: 'mir-47k-20-2.5', name: 'MC Mir-47K 20mm f/2.5', mount: 'pentax-k', brandId: 'zenit', focalLength: 20, apertures: range(2.5, 22) },

  // Pentax 67 (Pentax 6x7, Pentax 67 II)
  { id: 'smc-67-55-4', name: 'SMC Pentax 67 55mm f/4', mount: 'pentax-67', brandId: 'pentax', focalLength: 55, apertures: range(4, 22) },
  { id: 'smc-67-75-4.5', name: 'SMC Pentax 67 75mm f/4.5', mount: 'pentax-67', brandId: 'pentax', focalLength: 75, apertures: range(4.5, 22) },
  { id: 'smc-67-90-2.8', name: 'SMC Pentax 67 90mm f/2.8', mount: 'pentax-67', brandId: 'pentax', focalLength: 90, apertures: range(2.8, 22) },
  { id: 'smc-67-105-2.4', name: 'SMC Pentax 67 105mm f/2.4', mount: 'pentax-67', brandId: 'pentax', focalLength: 105, apertures: range(2.4, 22) },
  { id: 'smc-67-165-2.8', name: 'SMC Pentax 67 165mm f/2.8', mount: 'pentax-67', brandId: 'pentax', focalLength: 165, apertures: range(2.8, 22) },

  // M42 Screw Mount (Pentax SV/Spotmatic/Spotmatic F, Zenit 3M/E/B/EM/TTL/19/11/12XP/122, Yashica TL Electro-X)
  { id: 'takumar-55-1.8', name: 'Super-Takumar 55mm f/1.8', mount: 'm42', brandId: 'pentax', focalLength: 55, apertures: range(1.8, 16) },
  { id: 'takumar-50-1.4', name: 'Super-Takumar 50mm f/1.4', mount: 'm42', brandId: 'pentax', focalLength: 50, apertures: range(1.4, 16) },
  { id: 'takumar-28-3.5', name: 'Super-Takumar 28mm f/3.5', mount: 'm42', brandId: 'pentax', focalLength: 28, apertures: range(3.5, 16) },
  { id: 'takumar-35-3.5', name: 'Super-Takumar 35mm f/3.5', mount: 'm42', brandId: 'pentax', focalLength: 35, apertures: range(3.5, 16) },
  { id: 'takumar-135-3.5', name: 'Super-Takumar 135mm f/3.5', mount: 'm42', brandId: 'pentax', focalLength: 135, apertures: range(3.5, 22) },
  { id: 'helios-44-2', name: 'Helios 44-2 58mm f/2', mount: 'm42', brandId: 'zenit', focalLength: 58, apertures: range(2, 16) },
  { id: 'helios-44m-4', name: 'Helios 44M-4 58mm f/2', mount: 'm42', brandId: 'zenit', focalLength: 58, apertures: range(2, 16) },
  { id: 'industar-50-2', name: 'Industar-50-2 50mm f/3.5', mount: 'm42', brandId: 'zenit', focalLength: 50, apertures: range(3.5, 16) },
  { id: 'mir-1b-37-2.8', name: 'Mir-1B 37mm f/2.8', mount: 'm42', brandId: 'zenit', focalLength: 37, apertures: range(2.8, 16) },
  { id: 'jupiter-9-85-2', name: 'Jupiter-9 85mm f/2', mount: 'm42', brandId: 'zenit', focalLength: 85, apertures: range(2, 16) },
  { id: 'yashinon-dx-50-1.7', name: 'Auto Yashinon-DX 50mm f/1.7', mount: 'm42', brandId: 'yashica', focalLength: 50, apertures: range(1.7, 16) },
  { id: 'yashinon-dx-50-1.4', name: 'Auto Yashinon-DX 50mm f/1.4', mount: 'm42', brandId: 'yashica', focalLength: 50, apertures: range(1.4, 16) },
  { id: 'yashinon-dx-28-2.8', name: 'Auto Yashinon-DX 28mm f/2.8', mount: 'm42', brandId: 'yashica', focalLength: 28, apertures: range(2.8, 16) },

  // Olympus Pen F (Half-frame bayonet)
  { id: 'penf-38-1.8', name: 'F.Zuiko Auto-S 38mm f/1.8', mount: 'olympus-pen-f', brandId: 'olympus', focalLength: 38, apertures: range(1.8, 16) },
  { id: 'penf-40-1.4', name: 'G.Zuiko Auto-S 40mm f/1.4', mount: 'olympus-pen-f', brandId: 'olympus', focalLength: 40, apertures: range(1.4, 16) },
  { id: 'penf-25-4', name: 'E.Zuiko Auto-W 25mm f/4', mount: 'olympus-pen-f', brandId: 'olympus', focalLength: 25, apertures: range(4, 16) },
  { id: 'penf-100-3.5', name: 'E.Zuiko Auto-T 100mm f/3.5', mount: 'olympus-pen-f', brandId: 'olympus', focalLength: 100, apertures: range(3.5, 22) },

  // Olympus OM (OM-1, OM-2, OM-10, OM-2N, OM-20, OM-3, OM-4, OM-40, OM-4 Ti, OM-3 Ti, OM-2000)
  { id: 'zuiko-50-1.8', name: 'Zuiko 50mm f/1.8', mount: 'olympus-om', brandId: 'olympus', focalLength: 50, apertures: range(1.8, 16) },
  { id: 'zuiko-50-1.4', name: 'Zuiko 50mm f/1.4', mount: 'olympus-om', brandId: 'olympus', focalLength: 50, apertures: range(1.4, 16) },
  { id: 'zuiko-24-2.8', name: 'Zuiko 24mm f/2.8', mount: 'olympus-om', brandId: 'olympus', focalLength: 24, apertures: range(2.8, 16) },
  { id: 'zuiko-28-3.5', name: 'Zuiko 28mm f/3.5', mount: 'olympus-om', brandId: 'olympus', focalLength: 28, apertures: range(3.5, 16) },
  { id: 'zuiko-28-2.8', name: 'Zuiko 28mm f/2.8', mount: 'olympus-om', brandId: 'olympus', focalLength: 28, apertures: range(2.8, 22) },
  { id: 'zuiko-35-2.8', name: 'Zuiko 35mm f/2.8', mount: 'olympus-om', brandId: 'olympus', focalLength: 35, apertures: range(2.8, 16) },
  { id: 'zuiko-85-2', name: 'Zuiko 85mm f/2', mount: 'olympus-om', brandId: 'olympus', focalLength: 85, apertures: range(2, 16) },
  { id: 'zuiko-100-2.8', name: 'Zuiko 100mm f/2.8', mount: 'olympus-om', brandId: 'olympus', focalLength: 100, apertures: range(2.8, 22) },
  { id: 'zuiko-135-3.5', name: 'Zuiko 135mm f/3.5', mount: 'olympus-om', brandId: 'olympus', focalLength: 135, apertures: range(3.5, 22) },

  // Minolta SR / MC / MD (SR-7, SR-T 101, SR-T 102, XE-7, SR-T 201, XD-11, XG-7, X-700, XG-M, X-570, X-370, X-300s)
  { id: 'rokkor-50-1.7', name: 'MD Rokkor 50mm f/1.7', mount: 'minolta-sr', brandId: 'minolta', focalLength: 50, apertures: range(1.7, 16) },
  { id: 'rokkor-50-1.4', name: 'MD Rokkor 50mm f/1.4', mount: 'minolta-sr', brandId: 'minolta', focalLength: 50, apertures: range(1.4, 16) },
  { id: 'rokkor-58-1.4', name: 'MC Rokkor-PF 58mm f/1.4', mount: 'minolta-sr', brandId: 'minolta', focalLength: 58, apertures: range(1.4, 16) },
  { id: 'rokkor-45-2', name: 'MD Rokkor-X 45mm f/2', mount: 'minolta-sr', brandId: 'minolta', focalLength: 45, apertures: range(2, 16) },
  { id: 'rokkor-28-2.8', name: 'MD W.Rokkor 28mm f/2.8', mount: 'minolta-sr', brandId: 'minolta', focalLength: 28, apertures: range(2.8, 22) },
  { id: 'rokkor-35-2.8', name: 'MD W.Rokkor 35mm f/2.8', mount: 'minolta-sr', brandId: 'minolta', focalLength: 35, apertures: range(2.8, 22) },
  { id: 'rokkor-85-2', name: 'MD Rokkor 85mm f/2', mount: 'minolta-sr', brandId: 'minolta', focalLength: 85, apertures: range(2, 22) },
  { id: 'rokkor-135-2.8', name: 'MD Tele Rokkor 135mm f/2.8', mount: 'minolta-sr', brandId: 'minolta', focalLength: 135, apertures: range(2.8, 22) },

  // Minolta A-Mount AF (Maxxum 7000, Maxxum 9000, Dynax 7xi, Dynax 9xi, Dynax 600si Classic, Dynax 9)
  { id: 'minolta-af-50-1.7', name: 'Minolta AF 50mm f/1.7', mount: 'minolta-a', brandId: 'minolta', focalLength: 50, apertures: range(1.7, 22) },
  { id: 'minolta-af-50-1.4', name: 'Minolta AF 50mm f/1.4', mount: 'minolta-a', brandId: 'minolta', focalLength: 50, apertures: range(1.4, 22) },
  { id: 'minolta-af-24-2.8', name: 'Minolta AF 24mm f/2.8', mount: 'minolta-a', brandId: 'minolta', focalLength: 24, apertures: range(2.8, 22) },
  { id: 'minolta-af-28-2.8', name: 'Minolta AF 28mm f/2.8', mount: 'minolta-a', brandId: 'minolta', focalLength: 28, apertures: range(2.8, 22) },
  { id: 'minolta-af-85-1.4g', name: 'Minolta AF 85mm f/1.4 G', mount: 'minolta-a', brandId: 'minolta', focalLength: 85, apertures: range(1.4, 22) },
  { id: 'minolta-af-35-70-4', name: 'Minolta AF 35-70mm f/4', mount: 'minolta-a', brandId: 'minolta', focalLength: 50, apertures: range(4, 22) },
  { id: 'minolta-af-70-210-4', name: 'Minolta AF 70-210mm f/4 ("Beercan")', mount: 'minolta-a', brandId: 'minolta', focalLength: 135, apertures: range(4, 32) },

  // Leica M (Leica M3, M2, M4, M5, CL, M4-2, M4-P, M6, M6 TTL & Minolta CLE)
  { id: 'summicron-50-2', name: 'Summicron-M 50mm f/2', mount: 'leica-m', brandId: 'leica', focalLength: 50, apertures: range(2, 16) },
  { id: 'summilux-50-1.4', name: 'Summilux-M 50mm f/1.4', mount: 'leica-m', brandId: 'leica', focalLength: 50, apertures: range(1.4, 16) },
  { id: 'summicron-35-2', name: 'Summicron-M 35mm f/2', mount: 'leica-m', brandId: 'leica', focalLength: 35, apertures: range(2, 16) },
  { id: 'summilux-35-1.4', name: 'Summilux-M 35mm f/1.4', mount: 'leica-m', brandId: 'leica', focalLength: 35, apertures: range(1.4, 16) },
  { id: 'summaron-35-2.8', name: 'Summaron 35mm f/2.8', mount: 'leica-m', brandId: 'leica', focalLength: 35, apertures: range(2.8, 22) },
  { id: 'elmarit-28-2.8', name: 'Elmarit-M 28mm f/2.8', mount: 'leica-m', brandId: 'leica', focalLength: 28, apertures: range(2.8, 22) },
  { id: 'summicron-c-40-2', name: 'Summicron-C 40mm f/2', mount: 'leica-m', brandId: 'leica', focalLength: 40, apertures: range(2, 16) },
  { id: 'tele-elmarit-90-2.8', name: 'Tele-Elmarit-M 90mm f/2.8', mount: 'leica-m', brandId: 'leica', focalLength: 90, apertures: range(2.8, 22) },
  // Minolta M-Rokkor (Leica M mount, native to Minolta CLE / Leica CL)
  { id: 'm-rokkor-40-2', name: 'M-Rokkor 40mm f/2', mount: 'leica-m', brandId: 'minolta', focalLength: 40, apertures: range(2, 16) },
  { id: 'm-rokkor-28-2.8', name: 'M-Rokkor 28mm f/2.8', mount: 'leica-m', brandId: 'minolta', focalLength: 28, apertures: range(2.8, 22) },
  { id: 'm-rokkor-90-4', name: 'M-Rokkor 90mm f/4', mount: 'leica-m', brandId: 'minolta', focalLength: 90, apertures: range(4, 22) },

  // Leica R (Leicaflex SL, R3, R4, R5, R6, R6.2, R8)
  { id: 'summicron-r-50-2', name: 'Summicron-R 50mm f/2', mount: 'leica-r', brandId: 'leica', focalLength: 50, apertures: range(2, 16) },
  { id: 'summilux-r-50-1.4', name: 'Summilux-R 50mm f/1.4', mount: 'leica-r', brandId: 'leica', focalLength: 50, apertures: range(1.4, 16) },
  { id: 'elmarit-r-28-2.8', name: 'Elmarit-R 28mm f/2.8', mount: 'leica-r', brandId: 'leica', focalLength: 28, apertures: range(2.8, 22) },
  { id: 'elmarit-r-35-2.8', name: 'Elmarit-R 35mm f/2.8', mount: 'leica-r', brandId: 'leica', focalLength: 35, apertures: range(2.8, 22) },
  { id: 'elmarit-r-90-2.8', name: 'Elmarit-R 90mm f/2.8', mount: 'leica-r', brandId: 'leica', focalLength: 90, apertures: range(2.8, 22) },
  { id: 'elmarit-r-135-2.8', name: 'Elmarit-R 135mm f/2.8', mount: 'leica-r', brandId: 'leica', focalLength: 135, apertures: range(2.8, 22) },

  // Hasselblad V (500C, 500EL, 500 C/M, 500EL/M, 2000FC, 500ELX, 503CX, 205TCC, 501C, 503CW, 501CM)
  { id: 'planar-80-2.8', name: 'Zeiss Planar 80mm f/2.8 C/CF', mount: 'hasselblad-v', brandId: 'hasselblad', focalLength: 80, apertures: range(2.8, 22) },
  { id: 'distagon-50-4', name: 'Zeiss Distagon 50mm f/4 C/CF', mount: 'hasselblad-v', brandId: 'hasselblad', focalLength: 50, apertures: range(4, 22) },
  { id: 'distagon-60-3.5', name: 'Zeiss Distagon 60mm f/3.5 C/CF', mount: 'hasselblad-v', brandId: 'hasselblad', focalLength: 60, apertures: range(3.5, 22) },
  { id: 'planar-100-3.5', name: 'Zeiss Planar 100mm f/3.5 C/CF', mount: 'hasselblad-v', brandId: 'hasselblad', focalLength: 100, apertures: range(3.5, 22) },
  { id: 'sonnar-150-4', name: 'Zeiss Sonnar 150mm f/4 C/CF', mount: 'hasselblad-v', brandId: 'hasselblad', focalLength: 150, apertures: range(4, 32) },
  { id: 'sonnar-250-5.6', name: 'Zeiss Sonnar 250mm f/5.6 C/CF', mount: 'hasselblad-v', brandId: 'hasselblad', focalLength: 250, apertures: range(5.6, 32) },
  // Shutterless F/FE lens — only compatible with focal-plane shutter Hasselblad bodies (2000FC, 205TCC)
  { id: 'planar-110-2-fe', name: 'Zeiss Planar 110mm f/2 F/FE', mount: 'hasselblad-v', brandId: 'hasselblad', focalLength: 110, apertures: range(2, 16), compatibleCameraIds: ['hasselblad-2000fc', 'hasselblad-205tcc'] },

  // Contax / Yashica C/Y (Yashica FX-1, FX-2, FR, FX-3, FX-D Quartz, FX-3 Super 2000, 108 Multi Program)
  { id: 'yashica-ml-50-1.7', name: 'Yashica ML 50mm f/1.7', mount: 'contax-yashica', brandId: 'yashica', focalLength: 50, apertures: range(1.7, 16) },
  { id: 'yashica-ml-50-1.4', name: 'Yashica ML 50mm f/1.4', mount: 'contax-yashica', brandId: 'yashica', focalLength: 50, apertures: range(1.4, 16) },
  { id: 'yashica-dsb-50-1.9', name: 'Yashica DSB 50mm f/1.9', mount: 'contax-yashica', brandId: 'yashica', focalLength: 50, apertures: range(1.9, 16) },
  { id: 'yashica-ml-28-2.8', name: 'Yashica ML 28mm f/2.8', mount: 'contax-yashica', brandId: 'yashica', focalLength: 28, apertures: range(2.8, 22) },
  { id: 'yashica-ml-35-2.8', name: 'Yashica ML 35mm f/2.8', mount: 'contax-yashica', brandId: 'yashica', focalLength: 35, apertures: range(2.8, 22) },
  { id: 'yashica-ml-135-2.8', name: 'Yashica ML 135mm f/2.8', mount: 'contax-yashica', brandId: 'yashica', focalLength: 135, apertures: range(2.8, 22) },
  { id: 'zeiss-planar-50-1.7-cy', name: 'Carl Zeiss Planar 50mm f/1.7 T*', mount: 'contax-yashica', brandId: 'yashica', focalLength: 50, apertures: range(1.7, 16) },
  { id: 'zeiss-distagon-28-2.8-cy', name: 'Carl Zeiss Distagon 28mm f/2.8 T*', mount: 'contax-yashica', brandId: 'yashica', focalLength: 28, apertures: range(2.8, 22) },

  // Fixed lenses (matched 1-to-1 via camera.fixedLensIds)
  { id: 'canonet-40-1.7', name: 'Canon 40mm f/1.7 (fixed)', mount: 'fixed', brandId: 'canon', focalLength: 40, apertures: range(1.7, 16) },
  { id: 'olympus-trip35-lens', name: 'D.Zuiko 40mm f/2.8 (fixed)', mount: 'fixed', brandId: 'olympus', focalLength: 40, apertures: range(2.8, 22) },
  { id: 'olympus-35sp-lens', name: 'G.Zuiko 42mm f/1.7 (fixed)', mount: 'fixed', brandId: 'olympus', focalLength: 42, apertures: range(1.7, 16) },
  { id: 'olympus-35rc-lens', name: 'E.Zuiko 42mm f/2.8 (fixed)', mount: 'fixed', brandId: 'olympus', focalLength: 42, apertures: range(2.8, 22) },
  { id: 'olympus-xa-lens', name: 'F.Zuiko 35mm f/2.8 (fixed)', mount: 'fixed', brandId: 'olympus', focalLength: 35, apertures: range(2.8, 22) },
  { id: 'yashinon-80-3.5-mat', name: 'Yashinon 80mm f/3.5 (fixed)', mount: 'fixed', brandId: 'yashica', focalLength: 80, apertures: range(3.5, 22) },
  { id: 'yashinon-80-3.5', name: 'Yashinon 80mm f/3.5 (fixed)', mount: 'fixed', brandId: 'yashica', focalLength: 80, apertures: range(3.5, 32) },
  { id: 'yashinon-dx-45-1.7', name: 'Color-Yashinon DX 45mm f/1.7 (fixed)', mount: 'fixed', brandId: 'yashica', focalLength: 45, apertures: range(1.7, 16) },
  { id: 'yashica-t4-tessar-35-3.5', name: 'Carl Zeiss Tessar 35mm f/3.5 T* (fixed)', mount: 'fixed', brandId: 'yashica', focalLength: 35, apertures: range(3.5, 16) },
];
