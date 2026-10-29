// Shared data types. Edit brands.ts, cameras.ts, lenses.ts and films.ts to add data.

export interface Brand {
  id: string;
  name: string;
  country: string;
}

export type FilmFormat = '35mm' | '120' | 'Instant';

export interface Lens {
  id: string;
  name: string;
  /** Mount id, e.g. 'nikon-f'. Fixed lenses use 'fixed'. */
  mount: string;
  focalLength: number; // mm
  /** Marked aperture stops on the ring, widest first (e.g. [1.4, 2, 2.8, ...]). */
  apertures: number[];
  /** Optional native brand id (used to prioritize brand-matched lenses on shared mounts like M42/K/M). */
  brandId?: string;
  /** If set, restricts this lens to specific camera model ids within the mount. */
  compatibleCameraIds?: string[];
}

export interface Camera {
  id: string;
  brandId: string;
  name: string;
  year: number;
  format: FilmFormat;
  /** Interchangeable mount id, or 'fixed' for fixed-lens cameras. */
  mount: string;
  /** Lens ids for fixed-lens cameras (otherwise lenses are matched by mount). */
  fixedLensIds?: string[];
  /** Marked shutter speeds in SECONDS, e.g. 1/125 => 1/125. */
  shutterSpeeds: number[];
  /** ISO dial range supported by the camera (informational). */
  isoRange?: [number, number];
}

export interface Film {
  iso: number;
  label: string;
}
