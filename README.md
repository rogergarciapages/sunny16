# ☀️ SUNNY 16 — The Analog Photographer's Pocket Guide · No. 16

> *"Set shutter speed closest to the film speed."* — Printed in the spirit of 1968.

[![Expo](https://img.shields.io/badge/Expo-SDK_58-1E1A16?style=flat-square&logo=expo)](https://expo.dev)
[![React Native](https://img.shields.io/badge/React_Native-0.88-3E8E8B?style=flat-square&logo=react)](https://reactnative.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-D9622B?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![Platform](https://img.shields.io/badge/Platform-Web_%7C_iOS_%7C_Android-E3A82B?style=flat-square)](#getting-started)

**Sunny 16** is a retro-styled, hardware-aware exposure calculator built for film photographers. Unlike generic Sunny 16 charts that assume theoretical `1/ISO` shutter speeds and infinite aperture stops, **Sunny 16** matches target exposure against the **actual marked shutter speeds and aperture ring stops** on your specific vintage camera body and lens—complete with third-stop EV error readouts, bokeh-oriented equivalent exposures, and B&W/UV filter compensation.

---

## ✨ Features

### 1. Hardware-Accurate Exposure Matching
- Calculates the exact exposure value ($N^2 / t$) for your selected film speed and lighting condition, then searches every physical shutter speed × aperture combination on your camera and lens.
- Displays the closest real-world setting alongside the pure theoretical Sunny 16 rule and reports any mechanical deviation in third-stops (`Exact`, `+⅓ EV`, `−⅔ EV`, etc.).

### 2. 120+ Classic Analog Cameras (1950s–1990s)
Covers four decades of 35mm and 120 medium-format history across **9 iconic manufacturers**, from 1/500s mechanical leaf-shutter rangefinders and TLRs up to the `1/12000`s Minolta Dynax 9:

| Brand | Origin | Mounts / Systems Covered | Notable Models Included |
| :--- | :--- | :--- | :--- |
| **Nikon** | 🇯🇵 Japan | `nikon-f` (Pre-AI, AI/AI-S, AF) | F, Nikkormat FTN, F2, FM, FE, EM, F3, FG, FM2, FE2, FA, F4, F-801, F90X, F5, F100 |
| **Canon** | 🇯🇵 Japan | `canon-fd`, `canon-ef`, `fixed` | FT QL, F-1, FTb, Canonet QL17 GIII, EF, AE-1, A-1, New F-1, AE-1 Program, T90, EOS-1, EOS-3 |
| **Pentax** | 🇯🇵 Japan | `m42`, `pentax-k`, `pentax-67` | SV, Spotmatic, Spotmatic F, 6x7, KX, K2, K1000, ME, MX, ME Super, LX, Super A, Z-1, 67 II |
| **Olympus** | 🇯🇵 Japan | `olympus-om`, `olympus-pen-f`, `fixed` | Pen F, Trip 35, 35 SP, 35 RC, XA, OM-1, OM-2, OM-2N, OM-10, OM-3, OM-4, OM-4 Ti, OM-3 Ti |
| **Minolta** | 🇯🇵 Japan | `minolta-sr`, `minolta-a`, `leica-m` | SR-7, SR-T 101, XE-7, XD-11, CLE, X-700, X-570, Maxxum 7000/9000, Dynax 7xi/9xi, Dynax 807si/807ii, Dynax 9 |
| **Leica** | 🇩🇪 Germany | `leica-m`, `leica-r` | M3, M2, M4, M5, CL, M4-2, M4-P, M6, M6 TTL, Leicaflex SL, R3, R4, R5, R6, R6.2, R8 |
| **Zenit** | 🚩 USSR | `m42`, `pentax-k` | 3M, E, B, EM, TTL, 19, 11, 12XP, Automat, 122, 212k |
| **Hasselblad** | 🇸🇪 Sweden | `hasselblad-v` (C/CF & F/FE) | 500C, 500EL, 500 C/M, 500EL/M, 2000FC, 500ELX, 503CX, 205TCC, 501C, 503CW, 501CM |
| **Yashica** | 🇯🇵 Japan | `contax-yashica`, `m42`, `fixed` | Yashica-Mat, Mat-124 G, Electro 35 / GSN, TL Electro-X, FX-1, FX-2, FR, FX-3, FX-3 Super / 2000, T4 |

### 3. Smart Mount & Era Lens Compatibility
- Automatically filters lenses by camera mount (`nikon-f`, `canon-fd`, `canon-ef`, `pentax-k`, `pentax-67`, `m42`, `olympus-pen-f`, `olympus-om`, `minolta-sr`, `minolta-a`, `leica-m`, `leica-r`, `hasselblad-v`, `contax-yashica`, and `fixed`).
- **Sub-mount & body compatibility rules**:
  - **Nikon F**: AI/AI-S lenses (with metering prongs) pair with all Nikon F bodies (`1959–1999`), Series E lenses appear on AI/AF bodies (`1977+`), and AF-D lenses appear on Nikon AF bodies (`F4`, `F-801`, `F90X`, `F5`, `F100`).
  - **Hasselblad V**: Leaf-shutter Zeiss `C/CF` lenses appear on all V-system bodies, whereas the shutterless `Zeiss Planar 110mm f/2 F/FE` appears only on focal-plane shutter bodies (`2000FC`, `205TCC`).
  - **Pentax K**: `SMC Pentax-FA` autofocus lenses appear on autofocus K-mount bodies (`SF1`, `Z-1`, `MZ-5`, `MZ-M`).
  - **Shared Mounts (`m42`, `pentax-k`, `leica-m`)**: Native-brand lenses (e.g. Takumar on Pentax, Helios/Jupiter on Zenit, Yashinon-DX on Yashica, M-Rokkor on Minolta CLE) are automatically prioritized first.

### 4. Equivalent Exposures & Bokeh Guide
- Lists every valid reciprocal shutter + aperture combination within `±0.5 EV` on your gear.
- Sorted from **widest aperture (left)** to **smallest aperture (right)** with depth-of-field tags:
  - `SHALLOW / BOKEH` (`f/1.2` – `f/2.8`) for subject isolation and creamy background blur
  - `BALANCED DOF` (`f/3.5` – `f/8`) for street and general photography
  - `DEEP FOCUS` (`f/11` – `f/32`) for landscapes and zone focusing

### 5. Lens Filter Compensation (`UV` · `Yellow #8` · `Red #25`)
Interactive filter selector and side-by-side comparison cards showing how classic screw-in filters affect both exposure and maximum bokeh in bright light:
- **UV / Skylight (`1× · +0 EV`)**: Cuts atmospheric UV haze without affecting exposure.
- **Yellow #8 / K2 (`2× · +1 EV`)**: `+1 stop` compensation — natural B&W sky/cloud separation and opens your lens 1 stop wider for shallower depth of field.
- **Red #25 / 25A (`8× · +3 EV`)**: `+3 stops` compensation — dramatic B&W contrast and opens your lens 3 stops wider in bright sunlight (unlocking `f/2`–`f/2.8` bokeh even on `1/500`s or `1/1000`s mechanical shutters).
- **UV + Yellow (`2× · +1 EV`)** & **UV + Red (`8× · +3 EV`)**: Stacked filter combinations demonstrating that UV (`0 EV`) adds zero additional stop loss when paired with color contrast filters.

---

## 📐 How the Math Works

Under the classic Sunny 16 rule, incident luminance in bright sunlight gives a baseline exposure at aperture $N_0 = 16$ and shutter speed $t_0 = \frac{1}{\text{ISO}}$.

When a lighting condition defines a base aperture $N_{\text{cond}}$ (from `f/22` on snow/sand down to `f/4` in open shade) and a lens filter with filter factor $F = 2^{\Delta_{\text{filter}}}$ is mounted:

$$\text{ISO}_{\text{eff}} = \frac{\text{ISO}}{2^{\Delta_{\text{filter}}}}, \qquad E_{\text{target}} = N_{\text{cond}}^2 \cdot \text{ISO}_{\text{eff}}$$

For every marked shutter speed $t$ on the camera and marked aperture stop $N$ on the lens, the exposure error in stops is:

$$\Delta \text{EV}(N, t) = \log_2\!\left(\frac{E_{\text{target}}}{N^2 / t}\right)$$

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- npm or Bun

### Installation & Running Locally

```bash
# Install dependencies
npm install

# Start the Expo web app in your browser
npx expo start --web

# Or run on iOS / Android simulators
npx expo start --ios
npx expo start --android
```

### Typecheck & Lint

```bash
npx tsc --noEmit
npx expo lint
```

---

## 🗂️ Project Structure

```text
sunny16/
├── App.tsx                  # Main 1968 pocket-guide UI, interactive steps & filter comparison
├── components/
│   └── WeatherIcon.tsx      # Custom retro vector weather icons for the 6 lighting conditions
├── data/
│   ├── types.ts             # TypeScript interfaces for Brand, Camera, Lens, and Film
│   ├── brands.ts            # 9 vintage camera manufacturers
│   ├── cameras.ts           # 120+ analog cameras (1950s–1990s) with shutter speeds & mounts
│   ├── lenses.ts            # Mount- & era-compatible lenses and fixed-lens definitions
│   └── films.ts             # Selectable film speeds (ISO 25 / 15° to ISO 12800 / 42°)
└── lib/
    └── exposure.ts          # Sunny 16 calculation engine, filter compensation & EV formatting
```

---

## 🛠️ Adding New Gear

- **Add a Camera**: Append an entry to [`data/cameras.ts`](./data/cameras.ts) with its `brandId`, `mount` (or `'fixed'` + `fixedLensIds`), and `shutterSpeeds`.
- **Add a Lens**: Append an entry to [`data/lenses.ts`](./data/lenses.ts) with its `mount`, `focalLength`, `apertures`, and optional `brandId` or `compatibleCameraIds`.
- **Add a Film Speed**: Append an `{ iso, label }` entry to [`data/films.ts`](./data/films.ts).

---

*Rule of thumb only — trust your eyes, and bracket when in doubt.*

