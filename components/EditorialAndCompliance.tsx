import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  TextInput,
  StyleSheet,
  Platform,
  Linking,
} from 'react-native';

export type AppRoute = 'calculator' | 'about' | 'privacy-policy' | 'terms' | 'contact';
export type CookieConsentStatus = 'undecided' | 'accepted_all' | 'essential_only';

export const C = {
  paper: '#F3EAD3',
  paperDark: '#E6D9B8',
  ink: '#1E1A16',
  teal: '#3E8E8B',
  orange: '#D9622B',
  mustard: '#E3A82B',
  brown: '#7A4E2D',
};

const display = 'BebasNeue_400Regular';
const type = 'SpecialElite_400Regular';

export interface FaqItem {
  question: string;
  answer: string;
}

export const SEO_FAQS: FaqItem[] = [
  {
    question: 'How do I shoot film without a light meter?',
    answer:
      'Use the Sunny 16 rule: on a bright, sunny day with distinct shadows, set your lens aperture to f/16 and your shutter speed to the closest reciprocal of your film ISO/ASA (1/ISO). As light decreases, open your aperture by one stop per weather condition: f/11 for slight overcast, f/8 for overcast, f/5.6 for heavy overcast, f/4 for open shade or sunset, f/2.8 for golden hour, f/2 for dusk, and f/1.4 for bright indoor window or night street scenes.',
  },
  {
    question: 'What shutter speed should I use with 400 ISO film on a sunny day?',
    answer:
      'With ISO 400 film in direct bright sunlight, set your shutter speed to 1/500s (the closest mechanical speed to 1/400s) at f/16. You can also use any equivalent exposure pair that lets the same amount of light reach the film, such as f/11 at 1/1000s, f/22 at 1/250s, or add a Neutral Density / Polarizer filter to shoot wider apertures like f/2.8 or f/4.',
  },
  {
    question: 'How do lens filters affect Sunny 16 exposure?',
    answer:
      'Screw-in optical filters absorb light and require positive exposure compensation (+EV) by opening your aperture or slowing your shutter speed. A Yellow #8 or 85B Warming filter requires +1 stop (2x filter factor); a Circular Polarizer (CPL), Orange #16, Green #11, or ND4 filter requires +2 stops (4x factor); and a Red #25 or ND8 filter requires +3 stops (8x factor). When stacking filters, add their stop values together.',
  },
  {
    question: 'Can I use the Sunny 16 rule with fast lenses like a 50mm f/1.4?',
    answer:
      'Yes. By using reciprocal equivalent exposures, you can open your aperture from f/16 toward f/1.4 while increasing your shutter speed by the same number of stops. Because most vintage 35mm mechanical SLRs and rangefinders top out at 1/1000s, shooting wide open at f/1.4 or f/2 in bright daylight requires either slower film (ISO 50–100) or a screw-in Polarizer (+2 EV) or ND8 filter (+3 EV) so you do not exceed your camera’s maximum shutter speed.',
  },
  {
    question: 'What is a safe handheld shutter speed on a 35mm film camera?',
    answer:
      'Follow the classic 1/Focal Length reciprocal rule: use a shutter speed at least as fast as 1 divided by your lens focal length in millimeters (with a practical floor of 1/30s–1/60s). For a 50mm standard lens, shoot at 1/60s or faster; for a 28mm or 35mm wide-angle lens, 1/30s or faster is safe handheld; for a 135mm telephoto lens, use 1/125s or 1/250s to prevent camera shake.',
  },
  {
    question: 'How does film latitude protect against overexposure and underexposure?',
    answer:
      'Film latitude measures how many stops of overexposure (+EV) or underexposure (-EV) an emulsion can tolerate while retaining printable detail. Color negative (C-41) stocks like Kodak Portra 400 and black-and-white silver stocks like Ilford HP5 Plus or Fomapan 400 tolerate +2 to +3 stops of overexposure gracefully, whereas E-6 color slide films like Ektachrome E100 or Velvia 50 have a narrow ±0.5 EV latitude and must be metered carefully for highlights.',
  },
];

export const EXPOSURE_REFERENCE_ROWS = [
  {
    condition: 'Snow / Beach Sand',
    aperture: 'f/22',
    ev100: 'EV 16',
    shadows: 'Glaring reflection; razor-sharp dark shadows',
    recommendedUse: 'Alpine snowfields, white sand beaches & sunlit desert dunes',
  },
  {
    condition: 'Bright Direct Sun',
    aperture: 'f/16',
    ev100: 'EV 15',
    shadows: 'Distinct, crisp, hard-edged shadows',
    recommendedUse: 'Clear midday sunlight; baseline Sunny 16 reference',
  },
  {
    condition: 'Slight Overcast',
    aperture: 'f/11',
    ev100: 'EV 14',
    shadows: 'Soft, diffused shadow edges visible on ground',
    recommendedUse: 'High thin cirrus clouds or hazy bright afternoon sun',
  },
  {
    condition: 'Overcast',
    aperture: 'f/8',
    ev100: 'EV 13',
    shadows: 'Barely visible shadows; even diffused sky light',
    recommendedUse: 'Cloudy daylight portraits & low-contrast street scenes',
  },
  {
    condition: 'Heavy Overcast',
    aperture: 'f/5.6',
    ev100: 'EV 12',
    shadows: 'No shadows on ground; thick grey cloud deck',
    recommendedUse: 'Rainy days, pre-storm skies & dense overcast afternoons',
  },
  {
    condition: 'Open Shade / Sunset',
    aperture: 'f/4',
    ev100: 'EV 11',
    shadows: 'No direct sun; lit by open sky dome',
    recommendedUse: 'North-facing building shade, forest canopy & sunset sky',
  },
  {
    condition: 'Golden Hour',
    aperture: 'f/2.8',
    ev100: 'EV 10',
    shadows: 'Long, warm raking shadows 30 min before sunset',
    recommendedUse: 'Warm directional portraits & backlit golden hour street shots',
  },
  {
    condition: 'Blue Hour / Dusk',
    aperture: 'f/2',
    ev100: 'EV 9',
    shadows: 'Ambient twilight glow just after sunset / before sunrise',
    recommendedUse: 'Cityscape twilight, dusk street corners & fast prime lenses',
  },
  {
    condition: 'Bright Indoor / Window',
    aperture: 'f/1.4',
    ev100: 'EV 8',
    shadows: 'Soft directional window falloff indoors',
    recommendedUse: 'Natural window-lit portraits, cafes & museums (ISO 400–800)',
  },
  {
    condition: 'Night Street / Neon',
    aperture: 'f/1.4 (+1 EV slower shutter)',
    ev100: 'EV 7',
    shadows: 'High-contrast pools of neon & streetlamp light',
    recommendedUse: 'Night street photography with ISO 800–3200 or tripod Bulb',
  },
];

/**
 * Layout-shift-free (CLS = 0) AdSense container slot placed safely away from interactive dials.
 * Includes the exact HTML comment markers for AdSense placement verification.
 */
export function AdSenseSlot({
  slotName,
  commentMarker,
  consentStatus,
}: {
  slotName: 'ADSENSE SLOT 1: BELOW CALCULATOR' | 'ADSENSE SLOT 2: MID-ARTICLE';
  commentMarker: string;
  consentStatus: CookieConsentStatus;
}) {
  if (Platform.OS === 'web') {
    return React.createElement(
      'aside',
      {
        'aria-label': 'Sponsored Advertisement Slot',
        'data-ad-slot-placeholder': slotName,
        'data-consent-state': consentStatus,
        style: {
          marginTop: 22,
          marginBottom: 18,
          minHeight: 110,
          border: `1.5px dashed ${C.brown}`,
          backgroundColor: C.paperDark,
          padding: '10px 14px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          boxSizing: 'border-box',
        },
      },
      React.createElement('div', {
        dangerouslySetInnerHTML: {
          __html: `<!-- ${commentMarker} -->`,
        },
      }),
      React.createElement(
        'span',
        {
          style: {
            fontFamily: type,
            fontSize: 10,
            color: C.brown,
            letterSpacing: 1,
            textTransform: 'uppercase',
          },
        },
        `SPONSORED FIELD DISPATCH · ${slotName} (RESERVED 110PX MIN-HEIGHT · ZERO CLS)`,
      ),
      React.createElement(
        'span',
        {
          style: {
            fontFamily: type,
            fontSize: 10,
            color: C.ink,
            marginTop: 4,
            textAlign: 'center',
          },
        },
        'AdSense Container Ready — Paste your <ins class="adsbygoogle"> unit here once approved.',
      ),
    );
  }

  return (
    <View style={styles.adSlotBox} aria-label="Advertisement Placeholder">
      <Text style={styles.adSlotLabel}>SPONSORED FIELD DISPATCH · {slotName}</Text>
      <Text style={styles.adSlotSub}>Reserved AdSense Layout Slot (Zero CLS)</Text>
    </View>
  );
}

/**
 * Renders a genuine semantic HTML <table> on Web for search engine crawlers and AI Answer Engines,
 * and a clean structured table on native platforms.
 */
function SemanticExposureReferenceTable() {
  if (Platform.OS === 'web') {
    return React.createElement(
      'div',
      {
        style: {
          overflowX: 'auto',
          border: `2px solid ${C.ink}`,
          backgroundColor: C.paper,
          marginTop: 8,
        },
      },
      React.createElement(
        'table',
        {
          style: {
            width: '100%',
            borderCollapse: 'collapse',
            fontFamily: type,
            fontSize: 12,
            color: C.ink,
          },
        },
        React.createElement(
          'caption',
          {
            style: {
              fontFamily: display,
              fontSize: 16,
              letterSpacing: 1,
              backgroundColor: C.ink,
              color: C.mustard,
              padding: '8px 12px',
              textAlign: 'left',
            },
          },
          'SUNNY 16 EXPOSURE CHART · BASELINE SHUTTER SPEED = 1 / FILM ISO (E.G. 1/125S AT ISO 100 · 1/500S AT ISO 400)',
        ),
        React.createElement(
          'thead',
          null,
          React.createElement(
            'tr',
            {
              style: {
                backgroundColor: C.teal,
                color: C.paper,
                borderBottom: `2px solid ${C.ink}`,
              },
            },
            ['LIGHTING CONDITION', 'APERTURE (F-STOP)', 'EV (ISO 100)', 'SHADOW CHARACTERISTICS', 'RECOMMENDED 35MM USE'].map(
              (heading) =>
                React.createElement(
                  'th',
                  {
                    key: heading,
                    scope: 'col',
                    style: {
                      fontFamily: display,
                      fontSize: 15,
                      letterSpacing: 1,
                      padding: '8px 10px',
                      textAlign: 'left',
                      borderRight: `1px solid ${C.ink}`,
                      color: C.paper,
                    },
                  },
                  heading,
                ),
            ),
          ),
        ),
        React.createElement(
          'tbody',
          null,
          EXPOSURE_REFERENCE_ROWS.map((row, idx) =>
            React.createElement(
              'tr',
              {
                key: row.condition,
                style: {
                  backgroundColor: idx % 2 === 0 ? C.paper : C.paperDark,
                  borderBottom: `1px solid ${C.ink}`,
                },
              },
              React.createElement(
                'td',
                {
                  style: {
                    fontFamily: display,
                    fontSize: 16,
                    letterSpacing: 0.8,
                    padding: '8px 10px',
                    borderRight: `1px solid ${C.ink}`,
                    color: C.ink,
                  },
                },
                row.condition,
              ),
              React.createElement(
                'td',
                {
                  style: {
                    fontFamily: display,
                    fontSize: 17,
                    letterSpacing: 0.8,
                    padding: '8px 10px',
                    borderRight: `1px solid ${C.ink}`,
                    color: C.orange,
                  },
                },
                row.aperture,
              ),
              React.createElement(
                'td',
                {
                  style: {
                    fontFamily: display,
                    fontSize: 15,
                    padding: '8px 10px',
                    borderRight: `1px solid ${C.ink}`,
                    color: C.teal,
                  },
                },
                row.ev100,
              ),
              React.createElement(
                'td',
                {
                  style: {
                    padding: '8px 10px',
                    borderRight: `1px solid ${C.ink}`,
                    lineHeight: '17px',
                  },
                },
                row.shadows,
              ),
              React.createElement(
                'td',
                {
                  style: {
                    padding: '8px 10px',
                    lineHeight: '17px',
                  },
                },
                row.recommendedUse,
              ),
            ),
          ),
        ),
      ),
    );
  }

  return (
    <View style={styles.nativeTableWrap}>
      {EXPOSURE_REFERENCE_ROWS.map((row) => (
        <View key={row.condition} style={styles.nativeTableRow}>
          <Text style={styles.nativeTableCond}>
            {row.condition} · <Text style={{ color: C.orange }}>{row.aperture}</Text> ({row.ev100})
          </Text>
          <Text style={styles.manualBodyText}>{row.shadows} — {row.recommendedUse}</Text>
        </View>
      ))}
    </View>
  );
}

/**
 * PART 2: Editorial Content ("THE ANALOG FIELD MANUAL") rendered below the interactive calculator
 * for Google Search, AI Answer Engines (ChatGPT, Perplexity, AI Overviews), and AdSense approval.
 */
export function AnalogFieldManual({
  wide,
  consentStatus,
}: {
  wide: boolean;
  consentStatus: CookieConsentStatus;
}) {
  return (
    <View
      style={styles.manualContainer}
      nativeID="analog-field-manual"
      role="region"
      aria-label="The Analog Field Manual: Complete Guide to the Sunny 16 Rule, Exposure Chart, Filter Factors, and Depth of Field"
    >
      {/* Masthead Banner for the Editorial Manual */}
      <View style={styles.manualMasthead}>
        <Text style={styles.manualKicker}>
          TECHNICAL REFERENCE MANUAL · SECTION II · METERLESS 35MM FILM PHOTOGRAPHY
        </Text>
        <Text
          style={styles.manualMainTitle}
          accessibilityRole="header"
          aria-level={2}
        >
          THE ANALOG FIELD MANUAL: MASTERING THE SUNNY 16 RULE WITHOUT A LIGHT METER
        </Text>
        <Text style={styles.manualIntro}>
          Whether you are shooting a fully mechanical 35mm SLR with a dead battery (such as a Nikon F, Pentax K1000, Canon FTb, or Olympus OM-1) or a meterless rangefinder (like a Leica M2, M3, M4, or Contax IIa), the Sunny 16 rule gives you reliable incident-style exposure settings anywhere in the world using only your eyes, your aperture ring, and your shutter speed dial.
        </Text>
      </View>

      {/* 1. Step-by-Step Guide: How the Sunny 16 Rule Works */}
      <View style={styles.manualSectionBox}>
        <Text
          style={styles.manualSectionTitle}
          accessibilityRole="header"
          aria-level={2}
        >
          1. HOW THE SUNNY 16 RULE WORKS (STEP-BY-STEP GUIDE)
        </Text>
        <Text style={styles.manualBodyText}>
          Unlike reflective in-camera light meters that can be fooled by bright snow, backlit skies, or dark clothing, the Sunny 16 rule measures the actual intensity of ambient sunlight falling on your scene. The core formula requires three simple steps:
        </Text>

        <View style={[styles.manualGridRow, wide && { flexDirection: 'row' }]}>
          <View style={styles.manualCard}>
            <Text
              style={styles.manualCardHeading}
              accessibilityRole="header"
              aria-level={3}
            >
              STEP A · SET BASELINE APERTURE TO F/16 IN BRIGHT SUN
            </Text>
            <Text style={styles.manualBodyText}>
              On a clear, sunny day when subjects cast crisp, hard-edged shadows on the ground, rotate your lens aperture ring to <Text style={styles.manualBold}>f/16</Text>. At f/16 in direct midday sun (Exposure Value <Text style={styles.manualBold}>EV 15</Text> at ISO 100), the correct shutter speed in seconds is simply the reciprocal of your loaded film’s ISO/ASA rating: <Text style={styles.manualHighlight}>Shutter Speed = 1 / ISO</Text>.
            </Text>
          </View>

          <View style={styles.manualCard}>
            <Text
              style={styles.manualCardHeading}
              accessibilityRole="header"
              aria-level={3}
            >
              STEP B · MATCH SHUTTER SPEED TO FILM ISO / ASA
            </Text>
            <Text style={styles.manualBodyText}>
              Mechanical 35mm shutter dials use standardized fractional steps (<Text style={styles.manualBold}>1/60s, 1/125s, 1/250s, 1/500s, 1/1000s</Text>). Always pick the marked shutter speed closest to your film’s box speed:{'\n'}
              • <Text style={styles.manualBold}>ISO 50 Film:</Text> f/16 at <Text style={styles.manualBold}>1/60s</Text>{'\n'}
              • <Text style={styles.manualBold}>ISO 100 / 125 Film:</Text> f/16 at <Text style={styles.manualBold}>1/125s</Text>{'\n'}
              • <Text style={styles.manualBold}>ISO 200 Film:</Text> f/16 at <Text style={styles.manualBold}>1/250s</Text>{'\n'}
              • <Text style={styles.manualBold}>ISO 400 Film:</Text> f/16 at <Text style={styles.manualBold}>1/500s</Text>{'\n'}
              • <Text style={styles.manualBold}>ISO 800 Film:</Text> f/16 at <Text style={styles.manualBold}>1/1000s</Text>
            </Text>
          </View>

          <View style={styles.manualCard}>
            <Text
              style={styles.manualCardHeading}
              accessibilityRole="header"
              aria-level={3}
            >
              STEP C · USE RECIPROCAL EQUIVALENT EXPOSURES
            </Text>
            <Text style={styles.manualBodyText}>
              You are never forced to shoot at f/16. By the law of optical reciprocity, opening your lens aperture by <Text style={styles.manualBold}>+1 stop</Text> (which doubles the area of the iris) while increasing your shutter speed by <Text style={styles.manualBold}>1 stop</Text> (which halves the exposure duration) delivers the exact same total exposure to the film plane. For example, on ISO 100 film in bright sun, <Text style={styles.manualBold}>f/16 @ 1/125s = f/11 @ 1/250s = f/8 @ 1/500s = f/5.6 @ 1/1000s</Text>.
            </Text>
          </View>
        </View>
      </View>

      {/* 2. Static Semantic HTML Exposure Reference Table */}
      <View style={styles.manualSectionBox}>
        <Text
          style={styles.manualSectionTitle}
          accessibilityRole="header"
          aria-level={2}
        >
          2. COMPLETE SUNNY 16 F-STOP &amp; EV EXPOSURE REFERENCE TABLE
        </Text>
        <Text style={styles.manualBodyText}>
          Keep your shutter speed anchored to <Text style={styles.manualBold}>1 / ISO</Text> and adjust your aperture ring according to the sky and shadow edges below. If the sun is at your subject’s side (<Text style={styles.manualBold}>Sidelit</Text>), open up an additional <Text style={styles.manualBold}>+1 stop</Text>; if the sun is directly behind your subject (<Text style={styles.manualBold}>Backlit</Text>), open up <Text style={styles.manualBold}>+2 stops</Text> to expose for skin tones:
        </Text>
        <SemanticExposureReferenceTable />
      </View>

      {/* 3. Deep-Dive Technical Guides */}
      <View style={styles.manualSectionBox}>
        <Text
          style={styles.manualSectionTitle}
          accessibilityRole="header"
          aria-level={2}
        >
          3. DEEP-DIVE 35MM TECHNICAL GUIDES: FILTERS, FILM LATITUDE &amp; ZONE FOCUSING
        </Text>

        <View style={[styles.manualGridRow, wide && { flexDirection: 'row' }]}>
          <View style={styles.manualCard}>
            <Text
              style={styles.manualCardHeading}
              accessibilityRole="header"
              aria-level={3}
            >
              LENS FILTER FACTORS &amp; STACKING COMPENSATION
            </Text>
            <Text style={styles.manualBodyText}>
              When shooting meterless or using rangefinders and external meters that do not read through the lens (non-TTL), you must manually compensate for the light absorbed by screw-in optical filters:{'\n'}
              • <Text style={styles.manualBold}>UV / Skylight 1A (1× · +0 EV):</Text> Protects front element glass with zero stop loss.{'\n'}
              • <Text style={styles.manualBold}>Yellow #8 &amp; 85B Warming (2× · +1 EV):</Text> Open aperture 1 stop wider (e.g. f/16 → f/11). Yellow naturally separates clouds on B&amp;W film; 85B converts 3200K tungsten film like CineStill 800T to 5500K daylight.{'\n'}
              • <Text style={styles.manualBold}>Circular Polarizer (CPL), Orange #16, Green #11 &amp; ND4 (4× · +2 EV):</Text> Open 2 stops wider (e.g. f/16 → f/8). Polarizers cut water/glass reflections and darken blue skies at a 90° angle to the sun.{'\n'}
              • <Text style={styles.manualBold}>Red #25 &amp; ND8 (8× · +3 EV):</Text> Open 3 stops wider (e.g. f/16 → f/5.6). Red #25 creates dramatic black B&amp;W skies; ND8 lets 1/1000s mechanical cameras shoot f/1.4–f/2 bokeh in bright sun.{'\n'}
              • <Text style={styles.manualBold}>Stacking Filters:</Text> Add the EV stop values together (e.g. stacking a <Text style={styles.manualBold}>CPL (+2 EV)</Text> with a <Text style={styles.manualBold}>Red #25 (+3 EV)</Text> equals <Text style={styles.manualBold}>+5 EV</Text> or a 32× filter factor).
            </Text>
          </View>

          <View style={styles.manualCard}>
            <Text
              style={styles.manualCardHeading}
              accessibilityRole="header"
              aria-level={3}
            >
              FILM LATITUDE, PUSH / PULL &amp; RECIPROCITY FAILURE
            </Text>
            <Text style={styles.manualBodyText}>
              Understanding your emulsion’s dynamic range is the secret to stress-free Sunny 16 shooting:{'\n'}
              • <Text style={styles.manualBold}>Color Negative (C-41) &amp; B&amp;W Negative Latitude:</Text> Negative films such as Kodak Portra 400, Kodak Gold 200, Ilford HP5 Plus, Kodak Tri-X 400, and Fomapan 100/200/400 build density in highlights and tolerate <Text style={styles.manualBold}>+2 to +3 stops of overexposure</Text> easily, but lose shadow detail quickly if underexposed beyond <Text style={styles.manualBold}>−1 stop</Text>. Rule of thumb: <Text style={styles.manualHighlight}>meter for the shadows</Text>.{'\n'}
              • <Text style={styles.manualBold}>Color Reversal Slide Film (E-6):</Text> Stocks like Ektachrome E100 and Fujifilm Velvia 50 have a tight <Text style={styles.manualBold}>±0.5 EV latitude</Text>. Always protect highlights.{'\n'}
              • <Text style={styles.manualBold}>Push Processing (+1 / +2 Stops):</Text> Rating ISO 400 B&amp;W film at <Text style={styles.manualBold}>EI 800 (+1 push)</Text> or <Text style={styles.manualBold}>EI 1600 (+2 push)</Text> lets you shoot handheld in dim streets and clubs; tell your lab to extend development time to restore highlight density.{'\n'}
              • <Text style={styles.manualBold}>Schwarzschild Reciprocity (≥1s):</Text> During tripod exposures of 1 second or longer, film sensitivity drops non-linearly (<Text style={styles.manualBold}>T_corrected = T_metered^p</Text>), requiring extra Bulb time.
            </Text>
          </View>

          <View style={styles.manualCard}>
            <Text
              style={styles.manualCardHeading}
              accessibilityRole="header"
              aria-level={3}
            >
              ZONE FOCUSING &amp; HYPERFOCAL DISTANCE
            </Text>
            <Text style={styles.manualBodyText}>
              Pair the Sunny 16 rule with <Text style={styles.manualBold}>zone focusing</Text> to capture candid street photographs instantaneously without looking through the viewfinder:{'\n'}
              • <Text style={styles.manualBold}>35mm Circle of Confusion (0.029mm):</Text> Depth of field depends on focal length, aperture f-stop, and focus distance. Wider lenses (28mm, 35mm) and smaller apertures (f/8, f/11, f/16) create deep zones of acceptable sharpness.{'\n'}
              • <Text style={styles.manualBold}>The Street Snap Preset:</Text> On a 35mm or 50mm lens stopped down to <Text style={styles.manualBold}>f/8 or f/11</Text>, pre-focus your lens barrel to <Text style={styles.manualBold}>3.0 meters (10 ft)</Text>. Everything from roughly <Text style={styles.manualBold}>1.8m to 8m+</Text> will render sharp on 35mm film.{'\n'}
              • <Text style={styles.manualBold}>Hyperfocal Focusing (H):</Text> When you focus your lens at the hyperfocal distance for your chosen aperture, your depth of field extends from exactly <Text style={styles.manualBold}>half the hyperfocal distance (H/2) all the way to infinity (∞)</Text>, maximizing landscape and architectural sharpness.
            </Text>
          </View>
        </View>
      </View>

      {/* AdSense Slot 2: Mid-Article */}
      <AdSenseSlot
        slotName="ADSENSE SLOT 2: MID-ARTICLE"
        commentMarker="ADSENSE SLOT 2: MID-ARTICLE"
        consentStatus={consentStatus}
      />

      {/* 4. Frequently Asked Questions (6 Authoritative Q&As matching JSON-LD FAQPage Schema) */}
      <View style={styles.manualSectionBox} nativeID="sunny16-faq-section">
        <Text
          style={styles.manualSectionTitle}
          accessibilityRole="header"
          aria-level={2}
        >
          4. FREQUENTLY ASKED QUESTIONS (SUNNY 16 &amp; ANALOG METERING FAQ)
        </Text>
        <View style={[styles.manualGridRow, wide && { flexDirection: 'row', flexWrap: 'wrap' }]}>
          {SEO_FAQS.map((item, idx) => (
            <View
              key={`editorial-faq-${idx}`}
              style={[styles.faqCard, wide && { width: '48.8%' }]}
            >
              <Text
                style={styles.faqQuestion}
                accessibilityRole="header"
                aria-level={3}
              >
                {idx + 1}. {item.question}
              </Text>
              <Text style={styles.manualBodyText}>{item.answer}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

/**
 * PART 3: Institutional Pages (/about, /privacy-policy, /terms, /contact)
 * Styled in the exact 1968 pocket field-guide theme with a Return to Calculator button.
 */
export function InstitutionalPageView({
  route,
  onNavigate,
}: {
  route: Exclude<AppRoute, 'calculator'>;
  onNavigate: (target: AppRoute) => void;
}) {
  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [messageTopic, setMessageTopic] = useState('Camera / Lens Database Request');
  const [messageBody, setMessageBody] = useState('');
  const [submittedNotice, setSubmittedNotice] = useState(false);

  const handleContactSubmit = () => {
    const subject = encodeURIComponent(`[Sunny 16 Field Guide] ${messageTopic}`);
    const body = encodeURIComponent(
      `Name: ${senderName || 'Analog Photographer'}\nEmail: ${senderEmail || 'Not provided'}\nTopic: ${messageTopic}\n\nMessage:\n${messageBody}`,
    );
    Linking.openURL(`mailto:contact@sunny16rule.com?subject=${subject}&body=${body}`);
    setSubmittedNotice(true);
  };

  return (
    <View style={styles.instContainer} role="region" aria-label={`Sunny 16 Rule ${route} page`}>
      <View style={styles.instTopBar}>
        <Pressable
          nativeID="btn-back-to-calculator"
          accessibilityRole="button"
          aria-label="Return to Sunny 16 Rule Exposure Calculator"
          onPress={() => onNavigate('calculator')}
          style={styles.instBackBtn}
        >
          <Text style={styles.instBackBtnText}>← RETURN TO SUNNY 16 CALCULATOR</Text>
        </Pressable>
        <Text style={styles.instBreadcrumb}>SUNNY16RULE.COM / {route.toUpperCase()}</Text>
      </View>

      {route === 'about' && (
        <View style={styles.instCard}>
          <Text
            style={styles.instTitle}
            accessibilityRole="header"
            aria-level={1}
          >
            ABOUT SUNNY 16 RULE (SUNNY16RULE.COM)
          </Text>
          <Text style={styles.instSubtitle}>
            A Free Optical Pocket Guide &amp; Exposure Calculator for 35mm Analog Film Photographers
          </Text>

          <Text
            style={styles.instHeading}
            accessibilityRole="header"
            aria-level={2}
          >
            OUR MISSION: KEEPING MECHANICAL 35MM CAMERAS SHOOTING
          </Text>
          <Text style={styles.manualBodyText}>
            <Text style={styles.manualBold}>Sunny 16 Rule (sunny16rule.com)</Text> was built by analog photographers and optical engineers to give 35mm film shooters an instant, reliable, field-ready exposure and depth-of-field reference. Millions of classic mechanical 35mm SLRs and rangefinders—such as the <Text style={styles.manualBold}>Nikon F and FM2, Leica M2/M3/M4, Canon F-1 and FTb, Pentax Spotmatic and K1000, Olympus OM-1, Contax S2, and Minolta SR-T 101</Text>—operate with 100% mechanical clockwork shutters that never require batteries, yet their vintage CdS or selenium light meters have either drifted out of calibration or rely on discontinued 1.35V mercury cells.
          </Text>

          <Text
            style={styles.instHeading}
            accessibilityRole="header"
            aria-level={2}
          >
            HOW OUR OPTICAL &amp; EXPOSURE ENGINE WORKS
          </Text>
          <Text style={styles.manualBodyText}>
            Unlike generic static charts, the Sunny 16 Rule Calculator models the real mechanical constraints of your specific 35mm camera body and mounted lens:{'\n'}
            • <Text style={styles.manualBold}>Hardware-Matched Shutter &amp; Aperture Pools:</Text> Every camera in our catalog (spanning 1950s rangefinders with 1/500s leaf shutters to late-1990s SLRs with 1/4000s–1/8000s focal-plane shutters) is cross-referenced against your mounted lens’s actual f-stop ring so we never recommend an impossible shutter speed or aperture.{'\n'}
            • <Text style={styles.manualBold}>True Optical Depth of Field &amp; Bokeh Math:</Text> Our Depth of Field visualizer uses exact lens equations with a <Text style={styles.manualBold}>0.029mm circle of confusion</Text> for 35mm full-frame (24×36mm) and <Text style={styles.manualBold}>0.020mm</Text> for 35mm half-frame (18×24mm) cameras, computing near/far sharpness limits, hyperfocal distance, and background blur disc ratios.{'\n'}
            • <Text style={styles.manualBold}>Cumulative Filter Stacking &amp; Schwarzschild Reciprocity:</Text> Our engine calculates multi-ring filter stacks (CPL Polarizers, B&amp;W Yellow/Orange/Red/Green contrast filters, 85B warming filters, and ND4/ND8 neutral density filters), B&amp;W push/pull ratings, and long-exposure Schwarzschild reciprocity failure (<Text style={styles.manualBold}>≥1s Bulb</Text>) across 26 iconic 35mm film emulsions.
          </Text>

          <Text
            style={styles.instHeading}
            accessibilityRole="header"
            aria-level={2}
          >
            DESIGNED IN THE SPIRIT OF 1968 TECHNICAL MANUALS
          </Text>
          <Text style={styles.manualBodyText}>
            Inspired by the timeless Kodak Master Photoguide and 1960s camera instruction booklets, the interface is designed for high-contrast readability under bright outdoor sun and quick one-handed operation on mobile devices in the field.
          </Text>
        </View>
      )}

      {route === 'privacy-policy' && (
        <View style={styles.instCard}>
          <Text
            style={styles.instTitle}
            accessibilityRole="header"
            aria-level={1}
          >
            PRIVACY POLICY &amp; COOKIE DISCLOSURE
          </Text>
          <Text style={styles.instSubtitle}>
            Last Updated: November 16, 2026 · Effective for https://sunny16rule.com
          </Text>

          <Text
            style={styles.instHeading}
            accessibilityRole="header"
            aria-level={2}
          >
            1. OVERVIEW &amp; DATA MINIMIZATION
          </Text>
          <Text style={styles.manualBodyText}>
            At <Text style={styles.manualBold}>Sunny 16 Rule (https://sunny16rule.com)</Text>, we respect your privacy. Our analog photography exposure calculator and depth-of-field visualizer run entirely in your web browser. You do not need to create an account or submit personal information to use the calculator.
          </Text>

          <Text
            style={styles.instHeading}
            accessibilityRole="header"
            aria-level={2}
          >
            2. GOOGLE ADSENSE &amp; DOUBLECLICK DART ADVERTISING COOKIES
          </Text>
          <Text style={styles.manualBodyText}>
            To keep this tool 100% free for the analog photography community, we may display advertisements served by third-party vendors, including <Text style={styles.manualBold}>Google AdSense</Text>:{'\n'}
            • Third-party vendors, including Google, use cookies (such as the <Text style={styles.manualBold}>DoubleClick DART cookie</Text>) to serve ads based on a user’s prior visits to <Text style={styles.manualBold}>https://sunny16rule.com</Text> or other websites on the internet.{'\n'}
            • Google’s use of advertising cookies enables it and its partners to serve ads to our users based on their visit to our site and/or other sites on the Internet.{'\n'}
            • <Text style={styles.manualBold}>How to Opt Out of Personalized Advertising:</Text> Users may opt out of personalized advertising at any time by visiting{' '}
            <Text
              style={styles.inlineLink}
              onPress={() => Linking.openURL('https://adssettings.google.com')}
            >
              Google Ads Settings (https://adssettings.google.com)
            </Text>{' '}
            or by visiting{' '}
            <Text
              style={styles.inlineLink}
              onPress={() => Linking.openURL('https://www.aboutads.info/choices/')}
            >
              www.aboutads.info/choices
            </Text>
            . You may also manage your consent preferences directly on our site using the <Text style={styles.manualBold}>Cookie Settings</Text> link in the footer.
          </Text>

          <Text
            style={styles.instHeading}
            accessibilityRole="header"
            aria-level={2}
          >
            3. LOCAL STORAGE, COOKIES &amp; ANALYTICS
          </Text>
          <Text style={styles.manualBodyText}>
            We use browser <Text style={styles.manualBold}>localStorage</Text> to remember your cookie consent choice (<Text style={styles.manualBold}>sunny16_cookie_consent_v1</Text>) so you are not prompted repeatedly on every visit. When analytics or advertising cookies are enabled with your consent, standard non-personally-identifiable log data (browser type, device viewport, referring page, and anonymized IP address) may be processed to measure site performance and Core Web Vitals.
          </Text>

          <Text
            style={styles.instHeading}
            accessibilityRole="header"
            aria-level={2}
          >
            4. YOUR GDPR (EEA/UK) &amp; CCPA (CALIFORNIA) PRIVACY RIGHTS
          </Text>
          <Text style={styles.manualBodyText}>
            If you reside in the European Economic Area (EEA), the United Kingdom, Switzerland, or California, you have the right to:{'\n'}
            • Withdraw or modify your cookie consent at any time via the <Text style={styles.manualBold}>Cookie Settings</Text> button in our footer.{'\n'}
            • Request access to, correction of, or deletion of any personal data you have voluntarily sent us (for example, via email support).{'\n'}
            • Opt out of the sale or sharing of personal information for cross-context behavioral advertising.{'\n'}
            For any privacy inquiries, contact us at <Text style={styles.manualBold}>contact@sunny16rule.com</Text>.
          </Text>
        </View>
      )}

      {route === 'terms' && (
        <View style={styles.instCard}>
          <Text
            style={styles.instTitle}
            accessibilityRole="header"
            aria-level={1}
          >
            TERMS OF SERVICE &amp; OPTICAL DISCLAIMER
          </Text>
          <Text style={styles.instSubtitle}>
            Last Updated: November 16, 2026 · Governing Use of https://sunny16rule.com
          </Text>

          <Text
            style={styles.instHeading}
            accessibilityRole="header"
            aria-level={2}
          >
            1. ACCEPTANCE OF TERMS
          </Text>
          <Text style={styles.manualBodyText}>
            By accessing and using <Text style={styles.manualBold}>Sunny 16 Rule (https://sunny16rule.com)</Text>, you agree to these Terms of Service. This web application is provided free of charge for personal, educational, and professional photographic reference.
          </Text>

          <Text
            style={styles.instHeading}
            accessibilityRole="header"
            aria-level={2}
          >
            2. ANALOG PHOTOGRAPHY &amp; EXPOSURE APPROXIMATION DISCLAIMER
          </Text>
          <Text style={styles.manualBodyText}>
            All exposure values (EV), f-stop recommendations, shutter speeds, filter compensation factors, Schwarzschild long-exposure reciprocity times, and depth-of-field calculations provided by <Text style={styles.manualBold}>sunny16rule.com</Text> are <Text style={styles.manualBold}>educational field-guide approximations</Text>.{'\n'}
            Real-world film exposure depends on many physical variables outside the scope of any calculator—including geographic latitude, season, altitude, atmospheric haze, mechanical shutter curtain wear on vintage cameras, actual lens T-stop transmission, film storage conditions, and lab development chemistry. When shooting critical or irreplaceable scenes on film, always bracket your exposures. <Text style={styles.manualBold}>Sunny 16 Rule</Text> and its creators assume no liability for underexposed, overexposed, or out-of-focus film rolls, lab processing costs, or equipment damage.
          </Text>

          <Text
            style={styles.instHeading}
            accessibilityRole="header"
            aria-level={2}
          >
            3. TRADEMARKS &amp; CAMERA / FILM DATABASE NOMENCLATURE
          </Text>
          <Text style={styles.manualBodyText}>
            All camera brand names, model names, lens designations, and film stock names (including Nikon, Canon, Leica, Pentax, Olympus, Minolta, Contax, Fujifilm, Yashica, Rollei, Voigtländer, Kodak, Ilford, Fomapan, CineStill, Agfa, and Kentmere) are the trademarks of their respective owners and are used strictly for nominative technical compatibility and optical reference.
          </Text>
        </View>
      )}

      {route === 'contact' && (
        <View style={styles.instCard}>
          <Text
            style={styles.instTitle}
            accessibilityRole="header"
            aria-level={1}
          >
            CONTACT &amp; GEAR DATABASE REQUESTS
          </Text>
          <Text style={styles.instSubtitle}>
            Reach the Sunny 16 Rule Team · Direct Email: contact@sunny16rule.com
          </Text>

          <Text style={styles.manualBodyText}>
            Spot a missing 35mm camera body, vintage lens mount, or film emulsion? Found a bug or have feedback on our optical calculators? Send us a dispatch directly at{' '}
            <Text
              style={styles.inlineLink}
              onPress={() => Linking.openURL('mailto:contact@sunny16rule.com')}
            >
              contact@sunny16rule.com
            </Text>{' '}
            or use the field form below:
          </Text>

          <View style={styles.contactFormBox}>
            <View style={styles.contactFieldGroup}>
              <Text style={styles.contactLabel} accessibilityRole={'label' as any}>
                YOUR NAME OR HANDLE:
              </Text>
              <TextInput
                nativeID="contact-name-input"
                aria-label="Your Name or Handle"
                value={senderName}
                onChangeText={setSenderName}
                placeholder="e.g. Henri / 35mm Shooter"
                placeholderTextColor={C.brown}
                style={styles.contactInput}
              />
            </View>

            <View style={styles.contactFieldGroup}>
              <Text style={styles.contactLabel} accessibilityRole={'label' as any}>
                YOUR EMAIL ADDRESS:
              </Text>
              <TextInput
                nativeID="contact-email-input"
                aria-label="Your Email Address"
                value={senderEmail}
                onChangeText={setSenderEmail}
                placeholder="you@example.com"
                placeholderTextColor={C.brown}
                style={styles.contactInput}
              />
            </View>

            <View style={styles.contactFieldGroup}>
              <Text style={styles.contactLabel} accessibilityRole={'label' as any}>
                INQUIRY TOPIC:
              </Text>
              <View style={styles.topicPillsRow}>
                {[
                  'Camera / Lens Database Request',
                  '35mm Film Stock Request',
                  'Bug Report / Optical Math',
                  'General Feedback',
                ].map((topic) => {
                  const active = messageTopic === topic;
                  return (
                    <Pressable
                      key={topic}
                      accessibilityRole="button"
                      aria-label={`Select inquiry topic: ${topic}`}
                      onPress={() => setMessageTopic(topic)}
                      style={[styles.topicPill, active && styles.topicPillActive]}
                    >
                      <Text style={[styles.topicPillText, active && { color: C.paper }]}>
                        {topic.toUpperCase()}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={styles.contactFieldGroup}>
              <Text style={styles.contactLabel} accessibilityRole={'label' as any}>
                MESSAGE / CAMERA &amp; LENS SPECS:
              </Text>
              <TextInput
                nativeID="contact-message-input"
                aria-label="Message or Camera and Lens Specifications"
                value={messageBody}
                onChangeText={setMessageBody}
                placeholder="Tell us the camera model, shutter speed range, lens focal length & aperture stops..."
                placeholderTextColor={C.brown}
                multiline
                numberOfLines={4}
                style={[styles.contactInput, { minHeight: 90, textAlignVertical: 'top' }]}
              />
            </View>

            <Pressable
              nativeID="btn-submit-contact"
              accessibilityRole="button"
              aria-label="Send email message to contact@sunny16rule.com"
              onPress={handleContactSubmit}
              style={styles.contactSubmitBtn}
            >
              <Text style={styles.contactSubmitBtnText}>
                ✉ SEND DISPATCH TO CONTACT@SUNNY16RULE.COM
              </Text>
            </Pressable>

            {submittedNotice && (
              <Text style={styles.contactSuccessText}>
                ✓ Your email client has been opened addressed to contact@sunny16rule.com. Thank you for helping expand the 35mm database!
              </Text>
            )}
          </View>
        </View>
      )}
    </View>
  );
}

/**
 * PART 3: Retro-styled Footer Navigation with links to Calculator, About, Privacy Policy,
 * Terms of Service, Contact, and Cookie Settings.
 */
export function RetroFooterNav({
  activeRoute,
  onNavigate,
  onOpenCookieSettings,
}: {
  activeRoute: AppRoute;
  onNavigate: (route: AppRoute) => void;
  onOpenCookieSettings: () => void;
}) {
  const navItems: { id: AppRoute; label: string; href: string }[] = [
    { id: 'calculator', label: 'CALCULATOR', href: '/' },
    { id: 'about', label: 'ABOUT', href: '/about' },
    { id: 'privacy-policy', label: 'PRIVACY POLICY', href: '/privacy-policy' },
    { id: 'terms', label: 'TERMS OF SERVICE', href: '/terms' },
    { id: 'contact', label: 'CONTACT', href: '/contact' },
  ];

  return (
    <View style={styles.footerWrap} role="contentinfo">
      <View style={styles.footerNavRow} role="navigation" aria-label="Footer Institutional Navigation">
        {navItems.map((item) => {
          const active = activeRoute === item.id;
          return (
            <Pressable
              key={item.id}
              nativeID={`footer-link-${item.id}`}
              accessibilityRole="button"
              aria-label={`Navigate to ${item.label}`}
              onPress={() => onNavigate(item.id)}
              style={[styles.footerNavPill, active && styles.footerNavPillActive]}
            >
              <Text style={[styles.footerNavText, active && { color: C.paper }]}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}
        <Pressable
          nativeID="footer-link-cookie-settings"
          accessibilityRole="button"
          aria-label="Open GDPR and AdSense Cookie Consent Settings"
          onPress={onOpenCookieSettings}
          style={styles.footerNavPill}
        >
          <Text style={styles.footerNavText}>COOKIE SETTINGS</Text>
        </Pressable>
      </View>

      <Text style={styles.footerDisclaimer}>
        Rule of thumb only — trust your eyes, and bracket when in doubt. Printed in the spirit of 1968.
      </Text>
      <Text style={styles.footerCopy}>
        © {new Date().getFullYear()} Sunny 16 Rule (sunny16rule.com) · Free 35mm Analog Photography Exposure &amp; Depth of Field Pocket Guide · Contact: contact@sunny16rule.com
      </Text>
    </View>
  );
}

/**
 * PART 3: GDPR / AdSense Cookie Consent Banner (stores preferences in localStorage and updates Google Consent Mode v2).
 */
export function CookieConsentBanner({
  visible,
  onAcceptAll,
  onEssentialOnly,
  onNavigatePrivacy,
}: {
  visible: boolean;
  onAcceptAll: () => void;
  onEssentialOnly: () => void;
  onNavigatePrivacy: () => void;
}) {
  if (!visible) return null;

  return (
    <View
      style={styles.cookieBanner}
      nativeID="cookie-consent-banner"
      role="region"
      aria-label="Cookie and Advertising Consent Notice"
    >
      <View style={styles.cookieTextCol}>
        <Text style={styles.cookieTitle}>
          PRIVACY &amp; COOKIE CONSENT NOTICE (GDPR / ADSENSE COMPLIANCE)
        </Text>
        <Text style={styles.cookieBody}>
          We use local storage and cookies (including Google AdSense advertising and analytics cookies) to keep this 35mm analog photography calculator free and measure site performance. You can accept all cookies or choose essential storage only. Read our{' '}
          <Text style={styles.cookieLink} onPress={onNavigatePrivacy}>
            Privacy Policy
          </Text>{' '}
          for details.
        </Text>
      </View>
      <View style={styles.cookieBtnRow}>
        <Pressable
          nativeID="btn-cookie-essential"
          accessibilityRole="button"
          aria-label="Use Essential Storage Only"
          onPress={onEssentialOnly}
          style={styles.cookieBtnSecondary}
        >
          <Text style={styles.cookieBtnSecondaryText}>ESSENTIAL ONLY</Text>
        </Pressable>
        <Pressable
          nativeID="btn-cookie-accept-all"
          accessibilityRole="button"
          aria-label="Accept All Cookies"
          onPress={onAcceptAll}
          style={styles.cookieBtnPrimary}
        >
          <Text style={styles.cookieBtnPrimaryText}>✓ ACCEPT ALL COOKIES</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  adSlotBox: {
    marginTop: 22,
    marginBottom: 18,
    minHeight: 110,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: C.brown,
    backgroundColor: C.paperDark,
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  adSlotLabel: {
    fontFamily: type,
    fontSize: 10,
    color: C.brown,
    letterSpacing: 1,
  },
  adSlotSub: {
    fontFamily: type,
    fontSize: 10,
    color: C.ink,
    marginTop: 4,
  },

  manualContainer: {
    marginTop: 22,
    borderWidth: 3,
    borderColor: C.ink,
    backgroundColor: C.paperDark,
    padding: 14,
    gap: 16,
  },
  manualMasthead: {
    borderBottomWidth: 2,
    borderColor: C.ink,
    paddingBottom: 12,
    gap: 4,
  },
  manualKicker: {
    fontFamily: type,
    fontSize: 10,
    color: C.brown,
    letterSpacing: 1.2,
  },
  manualMainTitle: {
    fontFamily: display,
    fontSize: 28,
    lineHeight: 30,
    color: C.ink,
    letterSpacing: 1.5,
  },
  manualIntro: {
    fontFamily: type,
    fontSize: 12,
    lineHeight: 18,
    color: C.ink,
    marginTop: 4,
  },
  manualSectionBox: {
    gap: 8,
  },
  manualSectionTitle: {
    fontFamily: display,
    fontSize: 22,
    color: C.ink,
    letterSpacing: 1.2,
    backgroundColor: C.mustard,
    borderWidth: 1.5,
    borderColor: C.ink,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  manualGridRow: {
    gap: 10,
    justifyContent: 'space-between',
  },
  manualCard: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: C.ink,
    backgroundColor: C.paper,
    padding: 12,
    gap: 6,
  },
  manualCardHeading: {
    fontFamily: display,
    fontSize: 18,
    color: C.orange,
    letterSpacing: 1,
  },
  manualBodyText: {
    fontFamily: type,
    fontSize: 11,
    lineHeight: 18,
    color: C.ink,
  },
  manualBold: {
    fontFamily: display,
    fontSize: 13,
    color: C.ink,
    letterSpacing: 0.5,
  },
  manualHighlight: {
    fontFamily: display,
    fontSize: 14,
    color: C.teal,
    letterSpacing: 0.6,
  },
  nativeTableWrap: {
    borderWidth: 2,
    borderColor: C.ink,
    backgroundColor: C.paper,
  },
  nativeTableRow: {
    padding: 8,
    borderBottomWidth: 1,
    borderColor: C.ink,
    gap: 2,
  },
  nativeTableCond: {
    fontFamily: display,
    fontSize: 16,
    color: C.ink,
  },
  faqCard: {
    borderWidth: 1.5,
    borderColor: C.ink,
    backgroundColor: C.paper,
    padding: 12,
    gap: 4,
  },
  faqQuestion: {
    fontFamily: display,
    fontSize: 18,
    color: C.teal,
    letterSpacing: 0.8,
  },

  // --- INSTITUTIONAL PAGES (/about, /privacy-policy, /terms, /contact) ---
  instContainer: {
    marginTop: 14,
    gap: 12,
  },
  instTopBar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  instBackBtn: {
    borderWidth: 2,
    borderColor: C.ink,
    backgroundColor: C.mustard,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  instBackBtnText: {
    fontFamily: display,
    fontSize: 16,
    color: C.ink,
    letterSpacing: 1,
  },
  instBreadcrumb: {
    fontFamily: type,
    fontSize: 11,
    color: C.brown,
    letterSpacing: 0.8,
  },
  instCard: {
    borderWidth: 3,
    borderColor: C.ink,
    backgroundColor: C.paper,
    padding: 16,
    gap: 10,
  },
  instTitle: {
    fontFamily: display,
    fontSize: 32,
    lineHeight: 34,
    color: C.ink,
    letterSpacing: 1.5,
  },
  instSubtitle: {
    fontFamily: type,
    fontSize: 11,
    color: C.brown,
    borderBottomWidth: 1.5,
    borderColor: C.ink,
    paddingBottom: 8,
  },
  instHeading: {
    fontFamily: display,
    fontSize: 20,
    color: C.orange,
    letterSpacing: 1,
    marginTop: 6,
  },
  inlineLink: {
    color: C.teal,
    textDecorationLine: 'underline',
  },
  contactFormBox: {
    marginTop: 8,
    borderWidth: 2,
    borderColor: C.ink,
    backgroundColor: C.paperDark,
    padding: 14,
    gap: 10,
  },
  contactFieldGroup: {
    gap: 4,
  },
  contactLabel: {
    fontFamily: display,
    fontSize: 15,
    color: C.ink,
    letterSpacing: 1,
  },
  contactInput: {
    borderWidth: 1.5,
    borderColor: C.ink,
    backgroundColor: C.paper,
    fontFamily: type,
    fontSize: 12,
    color: C.ink,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  topicPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  topicPill: {
    borderWidth: 1.5,
    borderColor: C.ink,
    backgroundColor: C.paper,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  topicPillActive: {
    backgroundColor: C.ink,
  },
  topicPillText: {
    fontFamily: display,
    fontSize: 13,
    color: C.ink,
    letterSpacing: 0.8,
  },
  contactSubmitBtn: {
    borderWidth: 2,
    borderColor: C.ink,
    backgroundColor: C.orange,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  contactSubmitBtnText: {
    fontFamily: display,
    fontSize: 18,
    color: C.paper,
    letterSpacing: 1.2,
  },
  contactSuccessText: {
    fontFamily: type,
    fontSize: 11,
    color: C.teal,
    marginTop: 4,
  },

  // --- RETRO FOOTER NAVIGATION ---
  footerWrap: {
    marginTop: 24,
    paddingTop: 14,
    borderTopWidth: 2,
    borderColor: C.ink,
    alignItems: 'center',
    gap: 8,
  },
  footerNavRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  footerNavPill: {
    borderWidth: 1.5,
    borderColor: C.ink,
    backgroundColor: C.paperDark,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  footerNavPillActive: {
    backgroundColor: C.ink,
  },
  footerNavText: {
    fontFamily: display,
    fontSize: 14,
    color: C.ink,
    letterSpacing: 1,
  },
  footerDisclaimer: {
    fontFamily: type,
    fontSize: 11,
    color: C.brown,
    textAlign: 'center',
    marginTop: 4,
  },
  footerCopy: {
    fontFamily: type,
    fontSize: 10,
    color: C.ink,
    textAlign: 'center',
  },

  // --- GDPR / ADSENSE COOKIE CONSENT BANNER ---
  cookieBanner: {
    marginTop: 16,
    borderWidth: 2.5,
    borderColor: C.mustard,
    backgroundColor: C.ink,
    padding: 14,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  cookieTextCol: {
    flex: 1,
    minWidth: 240,
    gap: 4,
  },
  cookieTitle: {
    fontFamily: display,
    fontSize: 17,
    color: C.mustard,
    letterSpacing: 1,
  },
  cookieBody: {
    fontFamily: type,
    fontSize: 11,
    lineHeight: 16,
    color: C.paper,
  },
  cookieLink: {
    color: C.mustard,
    textDecorationLine: 'underline',
  },
  cookieBtnRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
  },
  cookieBtnSecondary: {
    borderWidth: 1.5,
    borderColor: C.paperDark,
    backgroundColor: '#2A231B',
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  cookieBtnSecondaryText: {
    fontFamily: display,
    fontSize: 14,
    color: C.paper,
    letterSpacing: 0.8,
  },
  cookieBtnPrimary: {
    borderWidth: 1.5,
    borderColor: C.paper,
    backgroundColor: C.mustard,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  cookieBtnPrimaryText: {
    fontFamily: display,
    fontSize: 15,
    color: C.ink,
    letterSpacing: 0.8,
  },
});

