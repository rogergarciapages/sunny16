import React, { useEffect, useMemo, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
  Platform,
  TextInput,
  useWindowDimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { FontDisplay } from 'expo-font';
import { useFonts, BebasNeue_400Regular } from '@expo-google-fonts/bebas-neue';
import { SpecialElite_400Regular } from '@expo-google-fonts/special-elite';

import { brands } from './data/brands';
import { cameras } from './data/cameras';
import { lenses } from './data/lenses';
import { films, filmStocks, FilmStock } from './data/films';
import {
  conditions,
  recommend,
  recommendGritty,
  formatShutter,
  formatAperture,
  formatError,
  Condition,
  lensFilters,
  FilterId,
  summarizeFilterStack,
  grittyStyles,
  GrittyStyleId,
  lightDirections,
  LightDirectionId,
  evaluateHandheldSafety,
  get35mmEquivalentFocalLength,
  isHalfFrame35mm,
  calculateReciprocity,
} from './lib/exposure';
import WeatherIcon from './components/WeatherIcon';
import DepthOfFieldIndicator from './components/DepthOfFieldIndicator';
import { CameraSvgIcon, HandSvgIcon, FilmStripSvgIcon } from './components/VintageIcons';
import {
  SEO_FAQS,
  AppRoute,
  CookieConsentStatus,
  AdSenseSlot,
  AnalogFieldManual,
  InstitutionalPageView,
  RetroHeaderNav,
  RetroFooterNav,
  CookieConsentBanner,
} from './components/EditorialAndCompliance';

const C = {
  paper: '#F3EAD3',
  paperDark: '#E6D9B8',
  ink: '#1E1A16',
  teal: '#3E8E8B',
  orange: '#D9622B',
  mustard: '#E3A82B',
  brown: '#7A4E2D',
};

const SEO_TITLE = 'Sunny 16 Rule Calculator & Analog Light Meter';
const SEO_DESCRIPTION =
  'Calculate accurate exposure settings, shutter speed, and depth of field for your film camera without a light meter. Free pocket guide for analog photography.';
const SEO_URL = 'https://sunny16rule.com';
const SEO_OG_IMAGE = 'https://sunny16rule.com/og-preview.png';
const COOKIE_STORAGE_KEY = 'sunny16_cookie_consent_v1';

const ROUTE_META: Record<
  AppRoute,
  { title: string; description: string; path: string; h1: string }
> = {
  calculator: {
    title: SEO_TITLE,
    description: SEO_DESCRIPTION,
    path: '/',
    h1: 'Sunny 16 Rule Exposure & Depth of Field Calculator',
  },
  about: {
    title: 'About Sunny 16 Rule | Analog Photography Field Guide',
    description:
      'Learn how Sunny 16 Rule helps film photographers calculate accurate exposure, filter factors, and depth of field without a light meter.',
    path: '/about',
    h1: 'About the Sunny 16 Rule Field Guide',
  },
  'privacy-policy': {
    title: 'Privacy Policy | Sunny 16 Rule',
    description:
      'Read the Privacy Policy for Sunny 16 Rule (sunny16rule.com), including information on cookies, analytics, GDPR rights, and Google AdSense advertising.',
    path: '/privacy-policy',
    h1: 'Privacy Policy',
  },
  terms: {
    title: 'Terms of Service | Sunny 16 Rule',
    description:
      'Terms of Service and optical calculation disclaimer for using the Sunny 16 Rule analog photography calculator and field guide.',
    path: '/terms',
    h1: 'Terms of Service',
  },
  contact: {
    title: 'Contact Us | Sunny 16 Rule',
    description:
      'Get in touch with Sunny 16 Rule for feedback, bug reports, or to request new vintage cameras, lenses, and film stocks in our database.',
    path: '/contact',
    h1: 'Contact & Gear Requests',
  },
};

function parsePathnameToRoute(pathname: string): AppRoute {
  const clean = pathname.replace(/\/+$/, '').toLowerCase();
  if (clean === '/about' || clean === '/about.html') return 'about';
  if (clean === '/privacy-policy' || clean === '/privacy-policy.html') return 'privacy-policy';
  if (clean === '/terms' || clean === '/terms.html') return 'terms';
  if (clean === '/contact' || clean === '/contact.html') return 'contact';
  return 'calculator';
}

const SEO_JSON_LD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebApplication',
      name: 'Sunny 16 Rule Calculator',
      url: SEO_URL,
      description: SEO_DESCRIPTION,
      applicationCategory: 'PhotographyApplication',
      operatingSystem: 'Any / Web',
      inLanguage: 'en',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
      featureList: [
        'Sunny 16 exposure calculator',
        'EV lighting table',
        'Depth of field & bokeh visualizer',
        '35mm screw-in lens filter stacker',
        'Push/pull film latitude guide',
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: SEO_FAQS.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer,
        },
      })),
    },
  ],
};

function Chip({ label, sub, active, onPress, id }: { label: string; sub?: string; active: boolean; onPress: () => void; id: string }) {
  return (
    <Pressable
      nativeID={id}
      accessibilityRole="button"
      aria-label={sub ? `${label} (${sub})` : label}
      onPress={onPress}
      style={({ pressed, hovered }: any) => [
        styles.chip,
        active && styles.chipActive,
        (pressed || hovered) && !active && { backgroundColor: C.paperDark },
        pressed && { transform: [{ translateY: 1 }] },
      ]}
    >
      <Text style={[styles.chipText, active && { color: C.paper }]}>{label}</Text>
      {sub ? <Text style={[styles.chipSub, active && { color: C.paperDark }]}>{sub}</Text> : null}
    </Pressable>
  );
}

function Section({ step, title, children }: { step: string; title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section} role="region" aria-label={`Step ${step}: ${title}`}>
      <View style={styles.sectionHead}>
        <View style={styles.stepBadge}><Text style={styles.stepText}>{step}</Text></View>
        <Text
          style={styles.sectionTitle}
          accessibilityRole="header"
          aria-level={2}
        >
          {title}
        </Text>
        <View style={styles.rule} />
      </View>
      <View style={styles.chipRow}>{children}</View>
    </View>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    BebasNeue_400Regular: {
      uri: BebasNeue_400Regular as any,
      display: FontDisplay.SWAP,
    },
    SpecialElite_400Regular: {
      uri: SpecialElite_400Regular as any,
      display: FontDisplay.SWAP,
    },
  });
  const { width } = useWindowDimensions();
  const wide = width > 760;
  const compact = width < 520;

  const [activeRoute, setActiveRoute] = useState<AppRoute>(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      return parsePathnameToRoute(window.location.pathname);
    }
    return 'calculator';
  });

  const [cookieConsent, setCookieConsent] = useState<CookieConsentStatus>('undecided');
  const [showCookieBanner, setShowCookieBanner] = useState<boolean>(false);

  const applyConsentMode = (status: CookieConsentStatus) => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;
    const granted = status === 'accepted_all' ? 'granted' : 'denied';
    const w = window as any;
    if (typeof w.gtag === 'function') {
      w.gtag('consent', 'update', {
        ad_storage: granted,
        ad_user_data: granted,
        ad_personalization: granted,
        analytics_storage: granted,
      });
    }
  };

  const updateCookieConsent = (status: Exclude<CookieConsentStatus, 'undecided'>) => {
    setCookieConsent(status);
    setShowCookieBanner(false);
    applyConsentMode(status);
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(COOKIE_STORAGE_KEY, status);
      } catch {
        // Ignore storage quota / privacy mode errors
      }
    }
  };

  const navigateToRoute = (target: AppRoute) => {
    setActiveRoute(target);
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const nextPath = ROUTE_META[target].path;
      if (window.location.pathname !== nextPath) {
        window.history.pushState({ route: target }, '', nextPath);
      }
      window.scrollTo?.({ top: 0, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;
    try {
      const saved = window.localStorage.getItem(COOKIE_STORAGE_KEY);
      if (saved === 'accepted_all' || saved === 'essential_only') {
        setCookieConsent(saved);
        setShowCookieBanner(false);
        applyConsentMode(saved);
      } else {
        setShowCookieBanner(true);
      }
    } catch {
      setShowCookieBanner(true);
    }

    const onPopState = () => {
      setActiveRoute(parsePathnameToRoute(window.location.pathname));
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;
    const routeMeta = ROUTE_META[activeRoute];
    const canonicalUrl =
      routeMeta.path === '/' ? SEO_URL : `${SEO_URL}${routeMeta.path}`;
    document.documentElement.lang = 'en';
    document.title = routeMeta.title;

    const upsertMeta = (attr: 'name' | 'property', key: string, content: string) => {
      let el = document.head.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    upsertMeta('name', 'description', routeMeta.description);
    upsertMeta('name', 'robots', 'index, follow, max-image-preview:large');
    upsertMeta('property', 'og:type', 'website');
    upsertMeta('property', 'og:url', canonicalUrl);
    upsertMeta('property', 'og:title', routeMeta.title);
    upsertMeta('property', 'og:description', routeMeta.description);
    upsertMeta('property', 'og:image', SEO_OG_IMAGE);
    upsertMeta('name', 'twitter:card', 'summary_large_image');
    upsertMeta('name', 'twitter:url', canonicalUrl);
    upsertMeta('name', 'twitter:title', routeMeta.title);
    upsertMeta('name', 'twitter:description', routeMeta.description);
    upsertMeta('name', 'twitter:image', SEO_OG_IMAGE);

    let canonical = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', canonicalUrl);

    let ldScript = document.head.querySelector(
      'script[type="application/ld+json"]',
    ) as HTMLScriptElement | null;
    if (!ldScript) {
      ldScript = document.createElement('script');
      ldScript.type = 'application/ld+json';
      document.head.appendChild(ldScript);
    }
    ldScript.text = JSON.stringify(SEO_JSON_LD);
  }, [activeRoute]);

  const [iso, setIso] = useState(400);
  const [filmStockId, setFilmStockId] = useState<string | undefined>('portra-400');
  const activeFilmStock: FilmStock | undefined = filmStocks.find(
    (s) => s.id === filmStockId && s.iso === iso,
  );
  const [brandId, setBrandId] = useState(brands[0].id);
  const brandCameras = useMemo(() => cameras.filter((c) => c.brandId === brandId), [brandId]);
  const [cameraId, setCameraId] = useState<string | undefined>(brandCameras[0]?.id);
  const camera = cameras.find((c) => c.id === cameraId && c.brandId === brandId) ?? brandCameras[0];

  const [gearCollapsed, setGearCollapsed] = useState<boolean>(false);
  const [filmDrawerOpen, setFilmDrawerOpen] = useState<boolean>(false);
  const [quickTweaksOpen, setQuickTweaksOpen] = useState<boolean>(false);
  const [reciprocityOpen, setReciprocityOpen] = useState<boolean>(false);
  const [cameraDecade, setCameraDecade] = useState<'all' | '60s' | '70s' | '80s' | '90s'>('all');
  const [cameraSearch, setCameraSearch] = useState<string>('');
  const [activeDetailTab, setActiveDetailTab] = useState<'none' | 'dof' | 'filters' | 'grit' | 'film' | 'all'>('dof');

  const filteredBrandCameras = useMemo(() => {
    const q = cameraSearch.trim().toLowerCase();
    return brandCameras.filter((c) => {
      if (c.id === camera?.id) return true;
      const matchesDecade =
        cameraDecade === 'all' ||
        (cameraDecade === '60s' && c.year < 1970) ||
        (cameraDecade === '70s' && c.year >= 1970 && c.year < 1980) ||
        (cameraDecade === '80s' && c.year >= 1980 && c.year < 1990) ||
        (cameraDecade === '90s' && c.year >= 1990);
      const matchesSearch =
        !q || c.name.toLowerCase().includes(q) || String(c.year).includes(q) || c.format.toLowerCase().includes(q);
      return matchesDecade && matchesSearch;
    });
  }, [brandCameras, camera?.id, cameraDecade, cameraSearch]);

  const cameraLenses = useMemo(() => {
    if (!camera) return [];
    if (camera.mount === 'fixed') {
      return lenses.filter((l) => camera.fixedLensIds?.includes(l.id));
    }
    return lenses
      .filter(
        (l) =>
          l.mount === camera.mount &&
          (!l.compatibleCameraIds || l.compatibleCameraIds.includes(camera.id)),
      )
      .sort((a, b) => Number(b.brandId === camera.brandId) - Number(a.brandId === camera.brandId));
  }, [camera]);
  const [lensId, setLensId] = useState<string | undefined>();
  const lens = cameraLenses.find((l) => l.id === lensId) ?? cameraLenses[0];
  const [conditionId, setConditionId] = useState<Condition['id']>('sunny');
  const [step1FilterId, setStep1FilterId] = useState<FilterId>('none');
  const [step2FilterId, setStep2FilterId] = useState<FilterId>('none');
  const [showStep3, setShowStep3] = useState<boolean>(false);
  const [step3FilterId, setStep3FilterId] = useState<FilterId>('none');

  const selectedFilterIds = useMemo(
    () =>
      [step1FilterId, step2FilterId, showStep3 ? step3FilterId : 'none'].filter(
        (id): id is FilterId => id !== 'none',
      ),
    [step1FilterId, step2FilterId, showStep3, step3FilterId],
  );

  const activeFilter = useMemo(
    () => summarizeFilterStack(selectedFilterIds, lens?.focalLength),
    [selectedFilterIds, lens?.focalLength],
  );
  const [lightDirId, setLightDirId] = useState<LightDirectionId>('front');
  const activeLightDir = lightDirections.find((d) => d.id === lightDirId) ?? lightDirections[0];
  const [grittyId, setGrittyId] = useState<GrittyStyleId>('off');
  const activeGritty = grittyStyles.find((g) => g.id === grittyId) ?? grittyStyles[0];
  const [preferredAperture, setPreferredAperture] = useState<number | undefined>();
  const [focusDistanceM, setFocusDistanceM] = useState<number>(3.0);
  const [isHyperfocalMode, setIsHyperfocalMode] = useState<boolean>(false);
  const [prioritizeHandheld, setPrioritizeHandheld] = useState<boolean>(false);
  const [sceneCategory, setSceneCategory] = useState<'all' | 'daylight' | 'lowlight'>('all');

  const clearAllFilters = () => {
    setStep1FilterId('none');
    setStep2FilterId('none');
    setShowStep3(false);
    setStep3FilterId('none');
  };

  const selectStep1Filter = (id: FilterId) => {
    if (id === 'none') {
      clearAllFilters();
      return;
    }
    setStep1FilterId(id);
    if (step2FilterId === id) {
      setStep2FilterId('none');
      setShowStep3(false);
      setStep3FilterId('none');
    } else if (step3FilterId === id) {
      setStep3FilterId('none');
    }
  };

  const selectStep2Filter = (id: FilterId) => {
    if (id === 'none' || step2FilterId === id) {
      setStep2FilterId('none');
      setShowStep3(false);
      setStep3FilterId('none');
      return;
    }
    setStep2FilterId(id);
    if (step3FilterId === id) {
      setStep3FilterId('none');
    }
  };

  const selectStep3Filter = (id: FilterId) => {
    if (id === 'none' || step3FilterId === id) {
      setStep3FilterId('none');
      return;
    }
    setStep3FilterId(id);
  };

  const equipOrStackFilter = (id: FilterId) => {
    if (id === 'none') {
      clearAllFilters();
      return;
    }
    if (step1FilterId === 'none') {
      setStep1FilterId(id);
    } else if (step1FilterId !== id && step2FilterId === 'none') {
      setStep2FilterId(id);
    } else if (step1FilterId !== id && step2FilterId !== id) {
      setShowStep3(true);
      setStep3FilterId(id);
    }
  };

  const totalPositiveStops = activeFilter.totalStops + activeLightDir.stops;

  const validPreferredAperture =
    preferredAperture !== undefined && lens?.apertures.includes(preferredAperture)
      ? preferredAperture
      : undefined;

  const activeCondition = conditions.find((c) => c.id === conditionId) ?? conditions[0];
  const lightConditionedAperture = useMemo(() => {
    if (validPreferredAperture === undefined || !camera || !lens) return undefined;
    const rec = recommend(
      iso,
      activeCondition,
      camera,
      lens,
      totalPositiveStops,
      activeGritty.evShiftStops,
      validPreferredAperture,
      prioritizeHandheld,
    );
    return rec.best?.aperture ?? validPreferredAperture;
  }, [
    validPreferredAperture,
    iso,
    activeCondition,
    camera,
    lens,
    totalPositiveStops,
    activeGritty.evShiftStops,
    prioritizeHandheld,
  ]);

  if (!fontsLoaded && Platform.OS !== 'web') return <View style={{ flex: 1, backgroundColor: C.paper }} />;

  const selectBrand = (id: string) => {
    setBrandId(id);
    setCameraId(cameras.find((c) => c.brandId === id)?.id);
    setLensId(undefined);
    setPreferredAperture(undefined);
    setCameraDecade('all');
    setCameraSearch('');
  };

  const hasActiveTweaks =
    activeFilter.hasFilters ||
    lightDirId !== 'front' ||
    grittyId !== 'off' ||
    validPreferredAperture !== undefined ||
    focusDistanceM !== 3.0 ||
    isHyperfocalMode ||
    prioritizeHandheld ||
    conditionId !== 'sunny';

  const defaultBrandId = brands[0].id;
  const defaultCameraId = cameras.find((c) => c.brandId === defaultBrandId)?.id;
  const isDefaultGear =
    iso === 400 &&
    filmStockId === 'portra-400' &&
    brandId === defaultBrandId &&
    camera?.id === defaultCameraId &&
    (lensId === undefined || lensId === cameraLenses[0]?.id);

  const resetTweaksToSunny16 = () => {
    setConditionId('sunny');
    clearAllFilters();
    setLightDirId('front');
    setGrittyId('off');
    setPreferredAperture(undefined);
    setFocusDistanceM(3.0);
    setIsHyperfocalMode(false);
    setPrioritizeHandheld(false);
    setSceneCategory('all');
  };

  const resetFullBoard = () => {
    setIso(400);
    setFilmStockId('portra-400');
    setBrandId(defaultBrandId);
    setCameraId(defaultCameraId);
    setLensId(undefined);
    setCameraDecade('all');
    setCameraSearch('');
    resetTweaksToSunny16();
  };

  const activeBrandName = brands.find((b) => b.id === brandId)?.name ?? '';

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={[styles.scroll, compact && { padding: 8 }]}>
        <View style={[styles.page, compact && { padding: 12 }]} role="main">
          {/* Masthead */}
          <View style={[styles.stripes, compact && { marginHorizontal: -12, marginTop: -12, marginBottom: 10 }]}>
            {[C.mustard, C.orange, C.brown, C.teal].map((c) => <View key={c} style={[styles.stripe, { backgroundColor: c }]} />)}
          </View>
          <View style={[styles.masthead, compact && { paddingBottom: 8, marginBottom: 4 }]} role="banner">
            <Text style={styles.kicker}>THE 35MM ANALOG PHOTOGRAPHER&apos;S POCKET GUIDE · NO. 16</Text>
            <Text
              style={[styles.title, compact && { fontSize: 58, lineHeight: 60 }]}
              accessibilityRole="header"
              aria-level={activeRoute === 'calculator' ? 1 : 2}
              onPress={() => navigateToRoute('calculator')}
            >
              SUNNY 16{'\n'}
              <Text style={styles.h1Sub}>
                SUNNY 16 RULE EXPOSURE &amp; DEPTH OF FIELD CALCULATOR
              </Text>
            </Text>
            <Text style={[styles.tagline, compact && { fontSize: 13 }]}>
              &quot;Set shutter speed closest to the 35mm film speed&quot;
            </Text>
          </View>

          {/* Global Header Navigation connecting all 5 routes */}
          <RetroHeaderNav
            activeRoute={activeRoute}
            onNavigate={navigateToRoute}
          />

          {activeRoute !== 'calculator' ? (
            <InstitutionalPageView
              route={activeRoute}
              onNavigate={navigateToRoute}
            />
          ) : (
            <>
              {/* UX #1: Collapsible Active Rig / Gear Locker Summary Bar */}
          {camera && lens && (
            <View style={styles.rigLockerBar} nativeID="rig-locker-bar" role="region" aria-label="Active Camera, Lens and Film Setup">
              <View style={styles.rigLockerTopRow}>
                <View style={styles.rigLockerTitleGroup}>
                  <View style={styles.rigBadgeIcon}>
                    <CameraSvgIcon size={18} color={C.mustard} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={styles.rigLockerTitle}
                      accessibilityRole="header"
                      aria-level={2}
                    >
                      ACTIVE CAMERA, LENS & FILM SETUP (STEPS 1–4)
                    </Text>
                    <Text style={styles.rigLockerSub}>
                      {gearCollapsed
                        ? 'Steps 1–4 are hidden so you can meter faster — tap any card below or the button to change your Film, Camera, or Lens'
                        : 'Select your 1. Film/ISO, 2. Brand, 3. Camera Model & 4. Lens below — or hide these steps to jump straight to the Exposure Table'}
                    </Text>
                  </View>
                </View>
                <Pressable
                  nativeID="btn-toggle-gear-locker"
                  accessibilityRole="button"
                  aria-label={
                    gearCollapsed
                      ? 'Expand Steps 1 to 4 to change camera, lens, or film'
                      : 'Collapse Steps 1 to 4 and focus on exposure table'
                  }
                  onPress={() => setGearCollapsed((v) => !v)}
                  style={[
                    styles.rigCollapseBtn,
                    gearCollapsed && { backgroundColor: C.mustard },
                  ]}
                >
                  <Text
                    style={[
                      styles.rigCollapseBtnText,
                      gearCollapsed && { color: C.ink },
                    ]}
                  >
                    {gearCollapsed
                      ? '▼ CHANGE CAMERA / LENS / FILM'
                      : '▲ HIDE CAMERA / LENS / FILM STEPS'}
                  </Text>
                  <Text style={styles.rigCollapseBtnSub}>
                    {gearCollapsed
                      ? 'Show Steps 1–4 to swap gear'
                      : 'Collapse Steps 1–4 & focus on meter'}
                  </Text>
                </Pressable>
              </View>

              <View style={styles.rigCardsRow}>
                <Pressable
                  nativeID="rig-card-film"
                  accessibilityRole="button"
                  aria-label={`Step 1 Film Stock: ${activeFilmStock ? activeFilmStock.shortName : `ISO ${iso}`}. Tap to change film`}
                  onPress={() => setGearCollapsed(false)}
                  style={styles.rigSummaryCard}
                >
                  <View style={styles.rigCardHeadRow}>
                    <Text style={styles.rigCardStep}>STEP 1 · FILM STOCK / ISO</Text>
                    {gearCollapsed && <Text style={styles.rigCardEditTag}>CHANGE FILM ▾</Text>}
                  </View>
                  <Text style={styles.rigCardVal} numberOfLines={1}>
                    {activeFilmStock ? activeFilmStock.shortName : `ISO ${iso}`}
                  </Text>
                  <Text style={styles.rigCardSub} numberOfLines={1}>
                    {activeFilmStock ? `ISO ${iso} · ${activeFilmStock.process}` : `ASA ${iso} Standard`}
                  </Text>
                </Pressable>

                <Pressable
                  nativeID="rig-card-camera"
                  accessibilityRole="button"
                  aria-label={`Steps 2 and 3 Camera Body: ${activeBrandName} ${camera.name}. Tap to change camera`}
                  onPress={() => setGearCollapsed(false)}
                  style={styles.rigSummaryCard}
                >
                  <View style={styles.rigCardHeadRow}>
                    <Text style={styles.rigCardStep}>STEPS 2–3 · CAMERA BODY</Text>
                    {gearCollapsed && <Text style={styles.rigCardEditTag}>CHANGE CAMERA ▾</Text>}
                  </View>
                  <Text style={styles.rigCardVal} numberOfLines={1}>
                    {activeBrandName} {camera.name}
                  </Text>
                  <Text style={styles.rigCardSub} numberOfLines={1}>
                    {camera.year} · {camera.format} · Max {formatShutter(Math.min(...camera.shutterSpeeds))}
                  </Text>
                </Pressable>

                <Pressable
                  nativeID="rig-card-lens"
                  accessibilityRole="button"
                  aria-label={`Step 4 Mounted Lens: ${lens.name}. Tap to change lens`}
                  onPress={() => setGearCollapsed(false)}
                  style={styles.rigSummaryCard}
                >
                  <View style={styles.rigCardHeadRow}>
                    <Text style={styles.rigCardStep}>STEP 4 · MOUNTED LENS</Text>
                    {gearCollapsed && <Text style={styles.rigCardEditTag}>CHANGE LENS ▾</Text>}
                  </View>
                  <Text style={styles.rigCardVal} numberOfLines={1}>
                    {lens.name}
                  </Text>
                  <Text style={styles.rigCardSub} numberOfLines={1}>
                    f/{lens.apertures[0]}–f/{lens.apertures[lens.apertures.length - 1]}
                    {get35mmEquivalentFocalLength(camera, lens) !== lens.focalLength
                      ? ` · ≈${get35mmEquivalentFocalLength(camera, lens)}mm eq.`
                      : ''}
                  </Text>
                </Pressable>
              </View>
            </View>
          )}

          {/* Steps 1–4 (Collapsible Gear Setup) */}
          {!gearCollapsed && (
            <View nativeID="gear-setup-steps">
              <Section step="1" title="Film Speed · ISO / ASA">
                {films.map((f) => (
                  <Chip
                    key={f.iso}
                    id={`iso-${f.iso}`}
                    label={`${f.iso}`}
                    sub={f.label.split('/ ')[1]}
                    active={iso === f.iso}
                    onPress={() => {
                      setIso(f.iso);
                      const matchingStock = filmStocks.find((s) => s.iso === f.iso);
                      setFilmStockId(matchingStock?.id);
                    }}
                  />
                ))}
              </Section>

              {/* Foldable Fine-Tuning Drawer: Classic 35mm Film Stock Presets & Latitude / Reciprocity Guide */}
              <View style={styles.filmStockBox} nativeID="film-stock-presets">
                <Pressable
                  nativeID="btn-toggle-film-drawer"
                  accessibilityRole="button"
                  aria-label="Toggle 35mm film emulsion, latitude and reciprocity selector"
                  onPress={() => setFilmDrawerOpen((v) => !v)}
                  style={styles.foldableDrawerHeader}
                >
                  <View style={styles.foldableHeaderLeft}>
                    <FilmStripSvgIcon size={15} color={C.ink} />
                    <View style={{ flex: 1 }}>
                      <Text
                        style={styles.foldableHeaderTitle}
                        accessibilityRole="header"
                        aria-level={3}
                      >
                        OPTIONAL FINE-TUNING: 35MM FILM EMULSION, LATITUDE & RECIPROCITY GUIDE
                      </Text>
                      <Text style={styles.foldableHeaderSub}>
                        {activeFilmStock
                          ? `Loaded: ${activeFilmStock.name} (${activeFilmStock.process} · Latitude +${activeFilmStock.latitudeOverStops}/−${activeFilmStock.latitudeUnderStops} EV)`
                          : `Loaded: Generic ISO ${iso} Standard Curve — tap to pick a specific 35mm film roll`}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.foldableToggleBadge}>
                    <Text style={styles.foldableToggleBadgeText}>
                      {filmDrawerOpen
                        ? '▲ HIDE FILM STOCKS'
                        : `▼ CHOOSE FILM STOCK (${filmStocks.length})`}
                    </Text>
                  </View>
                </Pressable>

                {filmDrawerOpen && (
                  <View style={styles.foldableDrawerBody}>
                    <Text style={styles.filmStockHeaderLabel}>
                      TAP ANY 35MM FILM ROLL BELOW TO LOAD ITS ISO, LATITUDE & RECIPROCITY CURVE:
                    </Text>
                    <View style={styles.chipRow}>
                      <Pressable
                        nativeID="stock-generic"
                        accessibilityRole="button"
                        aria-label={`Select Generic ISO ${iso} standard curve`}
                        onPress={() => setFilmStockId(undefined)}
                        style={[styles.stockPill, !activeFilmStock && styles.stockPillActive]}
                      >
                        <Text style={[styles.stockPillTitle, !activeFilmStock && { color: C.paper }]}>
                          GENERIC ISO {iso}
                        </Text>
                        <Text style={[styles.stockPillSub, !activeFilmStock && { color: C.paperDark }]}>
                          STANDARD CURVE
                        </Text>
                      </Pressable>
                      {filmStocks.map((stock) => {
                        const active = activeFilmStock?.id === stock.id;
                        return (
                          <Pressable
                            key={stock.id}
                            nativeID={`stock-${stock.id}`}
                            accessibilityRole="button"
                            aria-label={`Load ${stock.name} (ISO ${stock.iso})`}
                            onPress={() => {
                              setIso(stock.iso);
                              setFilmStockId(stock.id);
                            }}
                            style={[styles.stockPill, active && styles.stockPillActive]}
                          >
                            <Text style={[styles.stockPillTitle, active && { color: C.paper }]}>
                              {stock.shortName}
                            </Text>
                            <Text style={[styles.stockPillSub, active && { color: C.mustard }]}>
                              ISO {stock.iso} · {stock.process.split(' ')[0]}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                    {activeFilmStock && (
                      <View style={styles.filmStockBanner}>
                        <View style={styles.filmStockBannerHead}>
                          <Text style={styles.filmStockBannerTitle}>
                            {activeFilmStock.name.toUpperCase()} · {activeFilmStock.process.toUpperCase()}
                          </Text>
                          <View style={styles.filmStockBadgesRow}>
                            <View style={styles.filmLatitudeBadge}>
                              <Text style={styles.filmLatitudeBadgeText}>
                                LATITUDE: +{activeFilmStock.latitudeOverStops} / −{activeFilmStock.latitudeUnderStops} EV
                              </Text>
                            </View>
                            <View style={[styles.filmLatitudeBadge, { backgroundColor: C.teal }]}>
                              <Text style={[styles.filmLatitudeBadgeText, { color: C.paper }]}>
                                GRAIN: {activeFilmStock.grain.toUpperCase()}
                              </Text>
                            </View>
                          </View>
                        </View>
                        <Text style={styles.filmStockCharText}>{activeFilmStock.character}</Text>
                        <Text style={styles.filmStockTipText}>
                          <Text style={{ fontFamily: display, color: C.orange, fontSize: 13 }}>FIELD TIP: </Text>
                          {activeFilmStock.fieldTip}
                        </Text>
                        <Text style={styles.filmStockTipText}>
                          <Text style={{ fontFamily: display, color: C.mustard, fontSize: 13 }}>
                            LONG EXPOSURE RECIPROCITY (≥1S):{' '}
                          </Text>
                          {activeFilmStock.reciprocityNote}
                        </Text>
                      </View>
                    )}
                  </View>
                )}
              </View>

              <Section step="2" title="Camera Brand">
                {brands.map((b) => (
                  <Chip key={b.id} id={`brand-${b.id}`} label={b.name} sub={b.country} active={brandId === b.id} onPress={() => selectBrand(b.id)} />
                ))}
              </Section>

              {/* UX #2: Step 3 with Decade Filter Pills & Quick Search */}
              <View style={styles.section} role="region" aria-label={`Step 3: Camera Model (${activeBrandName})`}>
                <View style={styles.sectionHead}>
                  <View style={styles.stepBadge}><Text style={styles.stepText}>3</Text></View>
                  <Text
                    style={styles.sectionTitle}
                    accessibilityRole="header"
                    aria-level={2}
                  >
                    Camera Model ({activeBrandName})
                  </Text>
                  <View style={styles.rule} />
                </View>
                {brandCameras.length > 6 && (
                  <View style={styles.cameraFilterBar} nativeID="camera-filter-bar">
                    <View style={styles.decadePillsRow}>
                      {[
                        { id: 'all' as const, label: `ALL (${brandCameras.length})` },
                        { id: '60s' as const, label: '50s–60s' },
                        { id: '70s' as const, label: '1970s' },
                        { id: '80s' as const, label: '1980s' },
                        { id: '90s' as const, label: '1990s+' },
                      ].map((dec) => {
                        const active = cameraDecade === dec.id;
                        return (
                          <Pressable
                            key={dec.id}
                            nativeID={`decade-${dec.id}`}
                            accessibilityRole="button"
                            aria-label={`Filter ${activeBrandName} cameras by decade: ${dec.label}`}
                            onPress={() => setCameraDecade(dec.id)}
                            style={[styles.decadePill, active && styles.decadePillActive]}
                          >
                            <Text style={[styles.decadePillText, active && { color: C.paper }]}>
                              {dec.label}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                    <View style={styles.searchBoxWrap}>
                      <TextInput
                        nativeID="camera-search-input"
                        aria-label={`Search ${activeBrandName} camera model or year`}
                        value={cameraSearch}
                        onChangeText={setCameraSearch}
                        placeholder={`Search ${activeBrandName} model or year...`}
                        placeholderTextColor={C.brown}
                        style={styles.searchInput}
                      />
                      {cameraSearch.length > 0 && (
                        <Pressable
                          nativeID="clear-camera-search"
                          accessibilityRole="button"
                          aria-label="Clear camera search"
                          onPress={() => setCameraSearch('')}
                          style={styles.searchClearBtn}
                        >
                          <Text style={styles.searchClearText}>✕</Text>
                        </Pressable>
                      )}
                    </View>
                  </View>
                )}
                <View style={styles.chipRow}>
                  {filteredBrandCameras.map((c) => (
                    <Chip
                      key={c.id}
                      id={`camera-${c.id}`}
                      label={c.name}
                      sub={`${c.year} · ${c.format}`}
                      active={camera?.id === c.id}
                      onPress={() => {
                        setCameraId(c.id);
                        setLensId(undefined);
                        setPreferredAperture(undefined);
                      }}
                    />
                  ))}
                </View>
              </View>

              <Section step="4" title="Lens">
                {cameraLenses.length === 0 ? (
                  <Text style={styles.body}>No lenses listed for this mount yet — add one in data/lenses.ts</Text>
                ) : (
                  cameraLenses.map((l) => {
                    const eqMm = camera ? get35mmEquivalentFocalLength(camera, l) : l.focalLength;
                    const eqSuffix = eqMm !== l.focalLength ? ` · ≈${eqMm}mm eq.` : '';
                    return (
                      <Chip
                        key={l.id}
                        id={`lens-${l.id}`}
                        label={l.name}
                        sub={`f/${l.apertures[0]} – f/${l.apertures[l.apertures.length - 1]}${eqSuffix}`}
                        active={lens?.id === l.id}
                        onPress={() => {
                          setLensId(l.id);
                          setPreferredAperture(undefined);
                        }}
                      />
                    );
                  })
                )}
              </Section>

              <Pressable
                nativeID="btn-collapse-after-lens"
                onPress={() => setGearCollapsed(true)}
                style={styles.lockRigBottomBanner}
              >
                <Text style={styles.lockRigBottomText}>
                  ▲ DONE SELECTING GEAR — HIDE CAMERA / LENS / FILM STEPS & JUMP TO EXPOSURE TABLE ▲
                </Text>
                <Text style={styles.lockRigBottomSub}>
                  Loaded: {activeFilmStock ? activeFilmStock.shortName : `ISO ${iso}`} · {activeBrandName} {camera?.name} · {lens?.name} (you can reopen Steps 1–4 anytime above)
                </Text>
              </Pressable>
            </View>
          )}

          {/* Board Control Bar (Start / Reset before Exposure Table) */}
          {camera && lens && (
            <View style={styles.controlBar} nativeID="board-control-bar">
              <View style={styles.controlBarInfo}>
                <View style={styles.controlStatusRow}>
                  <View
                    style={[
                      styles.controlStatusDot,
                      { backgroundColor: hasActiveTweaks ? C.orange : C.teal },
                    ]}
                  />
                  <Text style={styles.controlBarTitle}>
                    {hasActiveTweaks
                      ? 'CUSTOM EXPOSURE MODIFIERS ACTIVE'
                      : 'BASELINE · PURE SUNNY 16 READY'}
                  </Text>
                </View>
                <Text style={styles.controlBarSub}>
                  {activeFilmStock ? `${activeFilmStock.name} (ISO ${iso})` : `ISO ${iso}`} ·{' '}
                  {brands.find((b) => b.id === brandId)?.name} {camera.name} · {lens.name}
                  {lightDirId !== 'front' ? ` · ${activeLightDir.shortName}` : ''}
                  {activeFilter.hasFilters ? ` · ${activeFilter.shortName} (${activeFilter.factorLabel})` : ''}
                  {grittyId !== 'off' ? ` · ${activeGritty.shortName}` : ''}
                  {prioritizeHandheld ? ' · 1/f Handheld Guard' : ''}
                  {lightConditionedAperture !== undefined
                    ? ` · Lock ${formatAperture(lightConditionedAperture)} (${isHyperfocalMode ? 'Hyperfocal' : `${focusDistanceM}m`})`
                    : ''}
                </Text>
              </View>

              <View style={styles.controlBarButtons}>
                <Pressable
                  nativeID="btn-start-pure-sunny16"
                  onPress={resetTweaksToSunny16}
                  style={({ pressed, hovered }: any) => [
                    styles.controlBtn,
                    styles.controlBtnStart,
                    !hasActiveTweaks && styles.controlBtnDisabled,
                    (pressed || hovered) && hasActiveTweaks && { opacity: 0.9 },
                    pressed && { transform: [{ translateY: 1 }] },
                  ]}
                >
                  <Text style={styles.controlBtnStartText}>
                    ↻ RESET METER TO PURE SUNNY 16
                  </Text>
                  <Text style={styles.controlBtnStartSub}>
                    Keep current camera/lens/film · Clear filters, push & DoF locks
                  </Text>
                </Pressable>

                <Pressable
                  nativeID="btn-reset-full-board"
                  onPress={resetFullBoard}
                  style={({ pressed, hovered }: any) => [
                    styles.controlBtn,
                    styles.controlBtnResetAll,
                    !hasActiveTweaks && isDefaultGear && styles.controlBtnDisabled,
                    (pressed || hovered) && (hasActiveTweaks || !isDefaultGear) && { backgroundColor: C.ink },
                    pressed && { transform: [{ translateY: 1 }] },
                  ]}
                >
                  <Text
                    style={[
                      styles.controlBtnResetText,
                      !hasActiveTweaks && isDefaultGear && { color: C.brown },
                    ]}
                  >
                    ⟲ RESET ENTIRE APP (DEFAULT GEAR)
                  </Text>
                  <Text style={styles.controlBtnResetSub}>
                    Reset film ISO, camera, lens & all settings to defaults
                  </Text>
                </Pressable>
              </View>
            </View>
          )}

          {/* Exposure table */}
          {camera && lens && (
            <View style={styles.tableWrap} role="region" aria-label="Exposure Table and Lighting Conditions">
              <View style={styles.tableHeader}>
                <Text
                  style={styles.tableHeaderText}
                  accessibilityRole="header"
                  aria-level={2}
                >
                  EXPOSURE TABLE
                </Text>
                <View style={styles.headerBadges}>
                  {lightConditionedAperture !== undefined && (
                    <Pressable
                      nativeID="reset-aperture-lock"
                      accessibilityRole="button"
                      aria-label={`Remove Depth of Field lock at ${formatAperture(lightConditionedAperture)}`}
                      onPress={() => setPreferredAperture(undefined)}
                      style={[styles.isoBox, { backgroundColor: C.mustard }]}
                    >
                      <Text style={styles.isoBoxText}>
                        DOF LOCK {formatAperture(lightConditionedAperture)} ✕
                      </Text>
                    </Pressable>
                  )}
                  {lightDirId !== 'front' && (
                    <Pressable
                      nativeID="reset-light-dir"
                      accessibilityRole="button"
                      aria-label={`Reset light direction from ${activeLightDir.shortName} to Frontlit`}
                      onPress={() => setLightDirId('front')}
                      style={[styles.isoBox, { backgroundColor: C.mustard }]}
                    >
                      <Text style={styles.isoBoxText}>
                        {activeLightDir.shortName} ✕
                      </Text>
                    </Pressable>
                  )}
                  {activeGritty.id !== 'off' && (
                    <View style={[styles.isoBox, { backgroundColor: C.orange }]}>
                      <Text style={[styles.isoBoxText, { color: C.paper }]}>
                        {activeGritty.shortName} · EI {Math.round(iso * 2 ** -activeGritty.evShiftStops)}
                      </Text>
                    </View>
                  )}
                  {activeFilter.hasFilters && (
                    <Pressable
                      nativeID="reset-filter-stack"
                      accessibilityRole="button"
                      aria-label={`Remove active lens filter ${activeFilter.shortName}`}
                      onPress={clearAllFilters}
                      style={[styles.isoBox, { backgroundColor: activeFilter.color }]}
                    >
                      <Text style={styles.isoBoxText}>
                        {activeFilter.shortName} ({activeFilter.factorLabel}) ✕
                      </Text>
                    </Pressable>
                  )}
                  <View style={styles.isoBox}>
                    <Text style={styles.isoBoxText}>
                      {activeFilmStock ? activeFilmStock.shortName : `ISO ${iso}`}
                    </Text>
                  </View>
                </View>
              </View>
              <Text style={styles.cameraLine}>
                {brands.find((b) => b.id === brandId)?.name} {camera.name} · {lens.name}
                {get35mmEquivalentFocalLength(camera, lens) !== lens.focalLength
                  ? ` (≈${get35mmEquivalentFocalLength(camera, lens)}mm 35mm-eq)`
                  : ''}
                {activeFilmStock ? ` · ${activeFilmStock.name}` : ''}
                {lightDirId !== 'front' ? ` · ${activeLightDir.name}` : ''}
                {activeFilter.hasFilters ? ` · ${activeFilter.name}` : ''}
                {activeGritty.id !== 'off' ? ` · ${activeGritty.name}` : ''}
                {lightConditionedAperture !== undefined ? ` · Priority: ${formatAperture(lightConditionedAperture)} (${isHyperfocalMode ? 'Hyperfocal' : `${focusDistanceM}m`})` : ''}
              </Text>

              {/* Subject Light Direction & Scene / Handheld Toolbar */}
              <View style={styles.fieldToolbar} nativeID="field-toolbar">
                <View style={styles.toolbarGroup}>
                  <Text
                    style={styles.toolbarLabel}
                    accessibilityRole={'label' as any}
                  >
                    SUBJECT LIGHT DIRECTION (OPENS APERTURE / SHUTTER WHEN SUN IS AT SIDE OR BEHIND SUBJECT):
                  </Text>
                  <View style={styles.toolbarRow}>
                    {lightDirections.map((dir) => {
                      const active = dir.id === lightDirId;
                      return (
                        <Pressable
                          key={dir.id}
                          nativeID={`light-dir-${dir.id}`}
                          accessibilityRole="button"
                          aria-label={`${dir.name} (${dir.badge})`}
                          onPress={() => setLightDirId(dir.id)}
                          style={[styles.dirPill, active && styles.dirPillActive]}
                        >
                          <Text style={[styles.dirPillTitle, active && { color: C.paper }]}>
                            {dir.shortName}
                          </Text>
                          <Text style={[styles.dirPillSub, active && { color: C.mustard }]}>
                            {dir.badge}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>

                <View style={styles.toolbarGroup}>
                  <Text
                    style={styles.toolbarLabel}
                    accessibilityRole={'label' as any}
                  >
                    LIGHTING SCENES TO DISPLAY & HANDHELD ANTI-SHAKE SHUTTER PRIORITY (1/FOCAL LENGTH RULE):
                  </Text>
                  <View style={styles.toolbarRow}>
                    {[
                      {
                        id: 'all' as const,
                        label: 'SHOW ALL SCENES (10)',
                        sub: 'Full day-to-night table',
                      },
                      {
                        id: 'daylight' as const,
                        label: 'DAYLIGHT ONLY (6)',
                        sub: 'Snow, sun, clouds & shade',
                      },
                      {
                        id: 'lowlight' as const,
                        label: 'GOLDEN / INDOOR / NIGHT (4)',
                        sub: 'Sunset, dusk, window & neon',
                      },
                    ].map((tab) => {
                      const active = sceneCategory === tab.id;
                      return (
                        <Pressable
                          key={tab.id}
                          nativeID={`scene-tab-${tab.id}`}
                          accessibilityRole="button"
                          aria-label={`${tab.label}: ${tab.sub}`}
                          onPress={() => {
                            setSceneCategory(tab.id);
                            if (tab.id !== 'all' && activeCondition.category !== tab.id) {
                              const firstMatch = conditions.find((c) => c.category === tab.id);
                              if (firstMatch) setConditionId(firstMatch.id);
                            }
                          }}
                          style={[styles.sceneTabPill, active && styles.sceneTabPillActive]}
                        >
                          <Text style={[styles.sceneTabText, active && { color: C.paper }]}>
                            {tab.label}
                          </Text>
                          <Text style={[styles.sceneTabSub, active && { color: C.paperDark }]}>
                            {tab.sub}
                          </Text>
                        </Pressable>
                      );
                    })}
                    <Pressable
                      nativeID="toggle-handheld-guard"
                      accessibilityRole="button"
                      aria-label={`Toggle 1 over focal length handheld priority guard, currently ${prioritizeHandheld ? 'on' : 'off'}`}
                      onPress={() => setPrioritizeHandheld((v) => !v)}
                      style={[
                        styles.handheldTogglePill,
                        prioritizeHandheld && styles.handheldTogglePillActive,
                      ]}
                    >
                      <View style={styles.handheldBtnRow}>
                        <HandSvgIcon
                          size={18}
                          color={prioritizeHandheld ? C.paper : C.ink}
                        />
                        <View>
                          <Text
                            style={[
                              styles.handheldToggleText,
                              prioritizeHandheld && { color: C.paper },
                            ]}
                          >
                            1/F HANDHELD PRIORITY: {prioritizeHandheld ? 'ON (AVOID CAMERA SHAKE)' : 'OFF'}
                          </Text>
                          <Text
                            style={[
                              styles.handheldToggleSub,
                              prioritizeHandheld && { color: C.paperDark },
                            ]}
                          >
                            {prioritizeHandheld
                              ? `Keeping shutter ≥ 1/${Math.max(30, lens.focalLength, get35mmEquivalentFocalLength(camera, lens))}s for ${lens.focalLength}mm lens`
                              : `Tap to keep shutter ≥ 1/${Math.max(30, lens.focalLength, get35mmEquivalentFocalLength(camera, lens))}s for sharp handheld shots`}
                          </Text>
                        </View>
                      </View>
                    </Pressable>
                  </View>
                </View>
              </View>

              {/* UX #3: Live Viewfinder Hero Strip above the 2-Column Mobile Scene Grid */}
              {(() => {
                const heroRec = recommend(
                  iso,
                  activeCondition,
                  camera,
                  lens,
                  totalPositiveStops,
                  activeGritty.evShiftStops,
                  validPreferredAperture,
                  prioritizeHandheld,
                );
                const heroGrit =
                  activeGritty.id === 'kinetic' && validPreferredAperture === undefined
                    ? recommendGritty(iso, activeCondition, camera, lens, totalPositiveStops, activeGritty)
                    : null;
                const heroBest = heroGrit?.dragSetting ?? heroRec.best;
                const heroShake = heroBest
                  ? evaluateHandheldSafety(heroBest.shutter, camera, lens)
                  : null;
                return (
                  <View style={styles.viewfinderHeroStrip} nativeID="viewfinder-hero-strip">
                    <View style={styles.viewfinderSceneCol}>
                      <Text style={styles.viewfinderKicker}>
                        SELECTED LIGHTING SCENE · TAP ANY WEATHER CARD BELOW TO CHANGE
                      </Text>
                      <Text
                        style={styles.viewfinderSceneTitle}
                        accessibilityRole="header"
                        aria-level={3}
                      >
                        {activeCondition.title.toUpperCase()}
                      </Text>
                      <Text style={styles.viewfinderSceneSub} numberOfLines={1}>
                        {activeCondition.hint}
                      </Text>
                    </View>
                    {heroBest ? (
                      <View style={styles.viewfinderDialsRow}>
                        <View
                          style={styles.viewfinderDialBox}
                          aria-label={`Recommended aperture: ${formatAperture(heroBest.aperture)}`}
                        >
                          <Text style={styles.viewfinderDialLabel}>SET APERTURE</Text>
                          <Text style={[styles.viewfinderDialVal, compact && { fontSize: 28 }]}>
                            {formatAperture(heroBest.aperture)}
                          </Text>
                        </View>
                        <View
                          style={[styles.viewfinderDialBox, { backgroundColor: C.orange }]}
                          aria-label={`Recommended shutter speed: ${formatShutter(heroBest.shutter)}`}
                        >
                          <Text style={styles.viewfinderDialLabel}>SET SHUTTER</Text>
                          <Text style={[styles.viewfinderDialVal, compact && { fontSize: 28 }]}>
                            {formatShutter(heroBest.shutter)}
                          </Text>
                        </View>
                        {heroShake && (
                          <View
                            style={[
                              styles.viewfinderShakePill,
                              heroShake.status === 'safe'
                                ? { backgroundColor: C.teal }
                                : heroShake.status === 'borderline'
                                  ? { backgroundColor: C.mustard }
                                  : { backgroundColor: C.orange },
                            ]}
                          >
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                              <HandSvgIcon
                                size={13}
                                color={heroShake.status === 'borderline' ? C.ink : C.paper}
                              />
                              <Text
                                style={[
                                  styles.viewfinderShakeText,
                                  heroShake.status === 'borderline' && { color: C.ink },
                                ]}
                              >
                                {heroShake.status === 'safe'
                                  ? 'HANDHELD SAFE'
                                  : heroShake.status === 'borderline'
                                    ? 'BRACE HANDS'
                                    : 'USE TRIPOD'}
                              </Text>
                            </View>
                          </View>
                        )}
                      </View>
                    ) : null}
                  </View>
                );
              })()}

              {/* UX #6: 2-Column Mobile Grid (50%) / 3-Column Desktop Grid (33.333%) */}
              <View style={[styles.grid, { flexDirection: 'row', flexWrap: 'wrap' }]}>
                {conditions
                  .filter((cond) => sceneCategory === 'all' || cond.category === sceneCategory)
                  .map((cond) => {
                    const r = recommend(
                      iso,
                      cond,
                      camera,
                      lens,
                      totalPositiveStops,
                      activeGritty.evShiftStops,
                      validPreferredAperture,
                      prioritizeHandheld,
                    );
                    const gr =
                      activeGritty.id === 'kinetic' && validPreferredAperture === undefined
                        ? recommendGritty(iso, cond, camera, lens, totalPositiveStops, activeGritty)
                        : null;
                    const cellBest = gr?.dragSetting ?? r.best;
                    const active = cond.id === conditionId;
                    const shake = cellBest
                      ? evaluateHandheldSafety(cellBest.shutter, camera, lens)
                      : null;
                    return (
                      <Pressable
                        key={cond.id}
                        nativeID={`condition-${cond.id}`}
                        accessibilityRole="button"
                        aria-label={`${cond.title} (${cond.hint})${cellBest ? `: ${formatAperture(cellBest.aperture)} at ${formatShutter(cellBest.shutter)}` : ''}`}
                        onPress={() => setConditionId(cond.id)}
                        style={[
                          styles.cell,
                          { width: wide ? '33.333%' : '50%' },
                          compact && { padding: 8, gap: 8 },
                          cond.category === 'lowlight' && !active && styles.cellLowLight,
                          active && styles.cellActive,
                        ]}
                      >
                        <View style={[styles.iconBox, compact && { width: 36, height: 36 }]}>
                          <WeatherIcon id={cond.id} size={compact ? 32 : 44} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <View style={styles.condTitleRow}>
                            <Text style={[styles.condTitle, compact && { fontSize: 17 }]}>
                              {cond.title}
                            </Text>
                            {cond.category === 'lowlight' && (
                              <View style={styles.lowLightTag}>
                                <Text style={styles.lowLightTagText}>LOW</Text>
                              </View>
                            )}
                          </View>
                          {!compact && <Text style={styles.condHint}>{cond.hint}</Text>}
                          {cellBest ? (
                            <View style={styles.condValueRow}>
                              <Text style={[styles.condValue, compact && { fontSize: 14 }]}>
                                {formatAperture(cellBest.aperture)} · {formatShutter(cellBest.shutter)}
                              </Text>
                              {shake && (
                                <View
                                  style={[
                                    styles.cellShakeBadge,
                                    shake.status === 'safe'
                                      ? { backgroundColor: C.teal }
                                      : shake.status === 'borderline'
                                        ? { backgroundColor: C.brown }
                                        : { backgroundColor: C.orange },
                                  ]}
                                >
                                  <Text style={styles.cellShakeText}>
                                    {shake.status === 'safe'
                                      ? '✓'
                                      : shake.status === 'borderline'
                                        ? '⚠'
                                        : '▲'}
                                  </Text>
                                </View>
                              )}
                            </View>
                          ) : null}
                        </View>
                      </Pressable>
                    );
                  })}
              </View>

              <Result iso={iso} conditionId={conditionId} />
            </View>
          )}

              {/* AdSense Slot 1: Placed safely below the interactive calculator (Zero CLS) */}
              <AdSenseSlot
                slotName="ADSENSE SLOT 1: BELOW CALCULATOR"
                commentMarker="ADSENSE SLOT 1: BELOW CALCULATOR"
                consentStatus={cookieConsent}
              />

              {/* PART 2: Editorial Content ("THE ANALOG FIELD MANUAL") */}
              <AnalogFieldManual wide={wide} consentStatus={cookieConsent} />
            </>
          )}

          {/* PART 3: GDPR / AdSense Cookie Consent Banner */}
          <CookieConsentBanner
            visible={showCookieBanner}
            onAcceptAll={() => updateCookieConsent('accepted_all')}
            onEssentialOnly={() => updateCookieConsent('essential_only')}
            onNavigatePrivacy={() => navigateToRoute('privacy-policy')}
          />

          {/* PART 3: Retro Institutional Footer Navigation */}
          <RetroFooterNav
            activeRoute={activeRoute}
            onNavigate={navigateToRoute}
            onOpenCookieSettings={() => setShowCookieBanner(true)}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );

  function Result({ iso, conditionId }: { iso: number; conditionId: Condition['id'] }) {
    const cond = conditions.find((c) => c.id === conditionId)!;
    const r = recommend(
      iso,
      cond,
      camera!,
      lens!,
      totalPositiveStops,
      activeGritty.evShiftStops,
      validPreferredAperture,
      prioritizeHandheld,
    );
    const rAuto = recommend(
      iso,
      cond,
      camera!,
      lens!,
      totalPositiveStops,
      activeGritty.evShiftStops,
      undefined,
      prioritizeHandheld,
    );
    const activeGrittyRec = recommendGritty(
      iso,
      cond,
      camera!,
      lens!,
      totalPositiveStops,
      activeGritty.id === 'off' ? grittyStyles[1] : activeGritty,
    );
    const bestDisplay =
      activeGritty.id === 'kinetic' && validPreferredAperture === undefined && activeGrittyRec.dragSetting
        ? activeGrittyRec.dragSetting
        : r.best;
    const dofLabel = (aperture: number) =>
      aperture <= 2.8 ? 'SHALLOW / BOKEH' : aperture <= 8 ? 'BALANCED DOF' : 'DEEP FOCUS';

    const handheldSafety = bestDisplay
      ? evaluateHandheldSafety(bestDisplay.shutter, camera!, lens!)
      : null;

    const reciprocity = bestDisplay
      ? calculateReciprocity(
        bestDisplay.shutter,
        r.ideal.shutter,
        bestDisplay.aperture,
        r.ideal.aperture,
        activeFilmStock?.name,
        activeFilmStock?.reciprocityExponent,
        activeFilmStock?.reciprocityNote,
      )
      : null;

    const pickClosestValidAperture = (targetAp: number): number => {
      const validPool = [
        ...(rAuto.best ? [rAuto.best.aperture] : []),
        ...rAuto.alternatives.map((a) => a.aperture),
      ];
      const candidates = validPool.length > 0 ? validPool : lens!.apertures;
      return candidates.reduce((prev, curr) =>
        Math.abs(Math.log2(curr / targetAp)) < Math.abs(Math.log2(prev / targetAp)) ? curr : prev,
      );
    };

    const handleSelectDistance = (distM: number, targetAp: number) => {
      setIsHyperfocalMode(false);
      setFocusDistanceM(distM);
      setPreferredAperture(pickClosestValidAperture(targetAp));
    };

    const handleSelectHyperfocal = (targetAp: number) => {
      setIsHyperfocalMode(true);
      setPreferredAperture(pickClosestValidAperture(targetAp));
    };

    return (
      <View
        style={[styles.result, compact && { padding: 12 }]}
        nativeID="result-panel"
        role="region"
        aria-label="Recommended Exposure Settings and Equivalent Exposures"
      >
        <Text
          style={styles.resultKicker}
          accessibilityRole="header"
          aria-level={2}
        >
          RECOMMENDED SETTING · {cond.title.toUpperCase()}
          {lightDirId !== 'front' ? ` · ${activeLightDir.shortName}` : ''}
          {activeFilter.hasFilters ? ` · ${activeFilter.shortName} (${activeFilter.factorLabel})` : ''}
          {activeGritty.id !== 'off' ? ` · ${activeGritty.shortName}` : ''}
          {validPreferredAperture !== undefined && bestDisplay
            ? ` · DOF PRIORITY (${isHyperfocalMode ? 'HYPERFOCAL' : `${focusDistanceM}M`} · ${formatAperture(bestDisplay.aperture)})`
            : ''}
        </Text>
        {bestDisplay ? (
          <>
            <View style={styles.bigRow}>
              <View
                style={styles.bigBox}
                aria-label={`Recommended Aperture: ${formatAperture(bestDisplay.aperture)}`}
              >
                <Text style={styles.bigLabel}>APERTURE</Text>
                <Text style={[styles.bigValue, compact && { fontSize: 48, lineHeight: 52 }]}>
                  {formatAperture(bestDisplay.aperture)}
                </Text>
              </View>
              <View
                style={[styles.bigBox, { backgroundColor: C.orange }]}
                aria-label={`Recommended Shutter Speed: ${formatShutter(bestDisplay.shutter)}`}
              >
                <Text style={styles.bigLabel}>SHUTTER</Text>
                <Text style={[styles.bigValue, compact && { fontSize: 48, lineHeight: 52 }]}>
                  {formatShutter(bestDisplay.shutter)}
                </Text>
              </View>
            </View>

            {/* Handheld 1/FocalLength Camera-Shake Indicator */}
            {handheldSafety && (
              <View
                style={[
                  styles.handheldBanner,
                  handheldSafety.status === 'safe'
                    ? { borderColor: C.teal }
                    : handheldSafety.status === 'borderline'
                      ? { borderColor: C.mustard }
                      : { borderColor: C.orange },
                ]}
                nativeID="handheld-safety-banner"
              >
                <View style={styles.handheldBannerRow}>
                  <View
                    style={[
                      styles.handheldBadgeBox,
                      handheldSafety.status === 'safe'
                        ? { backgroundColor: C.teal }
                        : handheldSafety.status === 'borderline'
                          ? { backgroundColor: C.mustard }
                          : { backgroundColor: C.orange },
                    ]}
                  >
                    <Text
                      style={[
                        styles.handheldBadgeText,
                        handheldSafety.status === 'borderline' ? { color: C.ink } : { color: C.paper },
                      ]}
                    >
                      {handheldSafety.badge}
                    </Text>
                  </View>
                  <Text style={styles.handheldDetailText}>{handheldSafety.detail}</Text>
                  {handheldSafety.status !== 'safe' &&
                    r.handheldSafeSetting &&
                    r.handheldSafeSetting.shutter < bestDisplay.shutter && (
                      <Pressable
                        nativeID="btn-jump-handheld-safe"
                        onPress={() => setPreferredAperture(r.handheldSafeSetting!.aperture)}
                        style={styles.handheldJumpBtn}
                      >
                        <Text style={styles.handheldJumpBtnText}>
                          USE SAFE SHUTTER ({formatAperture(r.handheldSafeSetting.aperture)} ·{' '}
                          {formatShutter(r.handheldSafeSetting.shutter)}) →
                        </Text>
                      </Pressable>
                    )}
                </View>
              </View>
            )}

            <Text style={styles.resultNote}>
              Pure Sunny 16
              {lightDirId !== 'front' ? ` (+${activeLightDir.stops} EV ${activeLightDir.id}lit)` : ''}
              {activeFilter.totalStops > 0
                ? ` (+${activeFilter.totalStops} EV ${activeFilter.isStacked ? 'stacked filters' : 'filter'})`
                : ''}
              {activeGritty.evShiftStops !== 0
                ? ` (${activeGritty.evShiftStops} EV gritty shift · EI ${Math.round(iso * 2 ** -activeGritty.evShiftStops)})`
                : ''}
              : {formatAperture(r.ideal.aperture)} @ {formatShutter(r.ideal.shutter)} · On your gear:{' '}
              {formatError(bestDisplay.errorStops)}
              {activeFilmStock
                ? ` · ${activeFilmStock.shortName} Latitude (+${activeFilmStock.latitudeOverStops}/−${activeFilmStock.latitudeUnderStops} EV): ${bestDisplay.errorStops <= activeFilmStock.latitudeOverStops &&
                  bestDisplay.errorStops >= -activeFilmStock.latitudeUnderStops
                  ? 'WITHIN SAFE FILM LATITUDE'
                  : 'OUTSIDE FILM LATITUDE — BRACKET / ADJUST'
                }`
                : ''}
            </Text>
            {(activeFilter.hasFilters || lightDirId !== 'front' || activeGritty.id !== 'off') && (
              <View style={styles.cumulativeBanner}>
                <Text style={styles.cumulativeText}>
                  <Text style={styles.grittyGearHighlight}>CUMULATIVE MATH: </Text>
                  {lightDirId !== 'front' ? `Light Dir (${activeLightDir.shortName}: +${activeLightDir.stops} EV) + ` : ''}
                  {activeFilter.isStacked ? 'Stacked Filters' : 'Filter'} ({activeFilter.shortName}: +{activeFilter.totalStops} EV) + Gritty ({activeGritty.shortName}:{' '}
                  {activeGritty.evShiftStops >= 0 ? `+${activeGritty.evShiftStops}` : activeGritty.evShiftStops} EV) ={' '}
                  <Text style={{ color: C.mustard, fontFamily: display, fontSize: 14 }}>
                    NET {r.netEvStops >= 0 ? `+${r.netEvStops}` : r.netEvStops} EV
                  </Text>
                  {' · '}Effective Camera ISO: {Number(r.effectiveIso.toFixed(1))}
                  {activeGritty.pushStops > 0 ? ` · Lab Dev: +${activeGritty.pushStops} stop(s)` : ''}
                </Text>
              </View>
            )}

            {/* Equivalent Exposures immediately below the primary readout */}
            {r.alternatives.length > 0 && (
              <>
                <Text
                  style={styles.altTitle}
                  accessibilityRole="header"
                  aria-level={3}
                >
                  EQUIVALENT EXPOSURES{' '}
                  {activeFilter.hasFilters ? `· WITH ${activeFilter.shortName} (${activeFilter.factorLabel})` : ''}
                </Text>
                <Text style={styles.altHint}>
                  Same exposure — tap any chip below (or in the DoF visualizer) to lock that aperture across the table:
                </Text>
                <View style={styles.altRow}>
                  {r.alternatives.map((a) => {
                    const chipShake = evaluateHandheldSafety(a.shutter, camera!, lens!);
                    return (
                      <Pressable
                        key={`${a.aperture}-${a.shutter}`}
                        nativeID={`eq-chip-${a.aperture}`}
                        accessibilityRole="button"
                        aria-label={`Equivalent exposure ${formatAperture(a.aperture)} at ${formatShutter(a.shutter)} (${dofLabel(a.aperture)})`}
                        onPress={() => setPreferredAperture(a.aperture)}
                        style={[
                          styles.altChip,
                          a.aperture <= 2.8 && { borderColor: C.mustard, backgroundColor: '#2A231B' },
                        ]}
                      >
                        <Text style={styles.altText}>{formatAperture(a.aperture)}</Text>
                        <Text style={styles.altSub}>{formatShutter(a.shutter)}</Text>
                        <Text style={[styles.altDof, a.aperture <= 2.8 && { color: C.mustard }]}>
                          {dofLabel(a.aperture)}
                        </Text>
                        <Text
                          style={[
                            styles.altShakeText,
                            chipShake.status === 'safe'
                              ? { color: C.teal }
                              : chipShake.status === 'borderline'
                                ? { color: C.mustard }
                                : { color: C.orange },
                          ]}
                        >
                          {chipShake.status === 'safe'
                            ? '✓ HANDHELD'
                            : chipShake.status === 'borderline'
                              ? '⚠ BRACE'
                              : '▲ TRIPOD'}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </>
            )}

            {/* Foldable Fine-Tuning 1: 35mm Schwarzschild Reciprocity Failure Calculator (Long Exposures & Low-Light Bulb Guide) */}
            {reciprocity && (reciprocity.isLongExposureScene || cond.category === 'lowlight') && (
              <View style={styles.reciprocityBanner} nativeID="reciprocity-banner">
                <Pressable
                  nativeID="btn-toggle-reciprocity"
                  onPress={() => setReciprocityOpen((v) => !v)}
                  style={styles.darkFoldableHeader}
                >
                  <View style={styles.reciprocityHeadRow}>
                    <View style={styles.reciprocityBadge}>
                      <Text style={styles.reciprocityBadgeText}>
                        LONG-EXPOSURE RECIPROCITY (≥1S BULB)
                      </Text>
                    </View>
                    <Text style={styles.reciprocitySubText}>
                      {reciprocity.isLongExposureScene
                        ? `Metered ${reciprocity.meteredSec}s → Shoot ${reciprocity.correctedSec}s on ${reciprocity.stockLabel}`
                        : `${reciprocity.stockLabel} · Tap to view ≥1s tripod Bulb correction table`}
                    </Text>
                  </View>
                  <Text style={styles.darkFoldableToggleText}>
                    {reciprocityOpen ? '▲ HIDE BULB TABLE' : '▼ SHOW BULB TABLE'}
                  </Text>
                </Pressable>

                {reciprocityOpen && (
                  <View style={{ marginTop: 6, gap: 6 }}>
                    <Text style={styles.reciprocitySubText}>{reciprocity.note}</Text>
                    {reciprocity.isLongExposureScene && (
                      <Text style={styles.reciprocityCallout}>
                        At {formatAperture(bestDisplay.aperture)}, metered{' '}
                        <Text style={{ color: C.mustard }}>{reciprocity.meteredSec}s</Text> requires{' '}
                        <Text style={{ color: C.orange, fontFamily: display, fontSize: 16 }}>
                          {reciprocity.correctedSec} SECONDS
                        </Text>{' '}
                        on tripod/Bulb to compensate for Schwarzschild emulsion slowdown.
                      </Text>
                    )}
                    <View style={styles.bulbTableRow}>
                      {reciprocity.bulbTable.map((entry) => (
                        <View key={entry.meteredSec} style={styles.bulbChip}>
                          <Text style={styles.bulbMeteredText}>METER {entry.meteredSec}S</Text>
                          <Text style={styles.bulbCorrectedText}>SHOOT {entry.correctedSec}S</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            )}

            {/* Foldable Fine-Tuning 2: Quick In-Field Filter & Gritty Strip */}
            <View style={styles.quickTweaksBox} nativeID="quick-tweaks-strip">
              <Pressable
                nativeID="btn-toggle-quick-tweaks"
                onPress={() => setQuickTweaksOpen((v) => !v)}
                style={styles.darkFoldableHeader}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.quickTweakLabel}>
                    OPTIONAL FINE-TUNING: SCREW-IN LENS FILTERS (STACKABLE CPL / B&W / ND) & PUSH / PULL
                  </Text>
                  <Text style={styles.darkFoldableSub}>
                    Active Filter{activeFilter.isStacked ? ' Stack' : ''}: {activeFilter.shortName} ({activeFilter.factorLabel}) · Push/Style: {activeGritty.shortName} ({activeGritty.badge})
                  </Text>
                </View>
                <Text style={styles.darkFoldableToggleText}>
                  {quickTweaksOpen ? '▲ HIDE MODIFIERS' : '▼ CHANGE / STACK FILTERS'}
                </Text>
              </Pressable>

              {quickTweaksOpen && (
                <View style={{ marginTop: 8, gap: 10 }}>
                  <View style={styles.quickTweakCol}>
                    <Text style={styles.quickTweakLabel}>
                      STEP 1 · SELECT PRIMARY LENS FILTER:
                    </Text>
                    <View style={styles.filterPillRow}>
                      {lensFilters.map((f) => {
                        const isSelected = f.id === step1FilterId;
                        return (
                          <Pressable
                            key={`quick-s1-${f.id}`}
                            nativeID={`quick-s1-${f.id}`}
                            onPress={() => selectStep1Filter(f.id)}
                            style={[
                              styles.quickMiniPill,
                              isSelected && {
                                backgroundColor: C.paper,
                                borderColor: f.color,
                                borderWidth: 2,
                              },
                            ]}
                          >
                            <View style={styles.filterBtnTitleRow}>
                              <View
                                style={[
                                  styles.filterBtnDot,
                                  { backgroundColor: f.color },
                                  isSelected && { borderColor: C.ink, borderWidth: 1.5 },
                                ]}
                              />
                              <Text
                                style={[
                                  styles.quickMiniPillText,
                                  isSelected && { color: C.ink },
                                ]}
                              >
                                {f.shortName} ({f.factor})
                              </Text>
                            </View>
                          </Pressable>
                        );
                      })}
                    </View>

                    {/* STEP 2: Only appears when a filter (not NONE) is selected in Step 1 */}
                    {step1FilterId !== 'none' && (
                      <View style={styles.filterStackSubBox} nativeID="quick-filter-step2-box">
                        <View style={styles.filterStackHeaderRow}>
                          <Text style={styles.filterStackTitle}>
                            ↳ STEP 2 · STACK A 2ND FILTER WITH {activeFilter.primaryFilter.shortName} ({activeFilter.primaryFilter.factor}):
                          </Text>
                          {step2FilterId !== 'none' && (
                            <Pressable
                              nativeID="quick-clear-step2"
                              onPress={() => selectStep2Filter('none')}
                              style={styles.clearStackBtn}
                            >
                              <Text style={styles.clearStackBtnText}>✕ CLEAR STEP 2</Text>
                            </Pressable>
                          )}
                        </View>
                        <View style={styles.filterPillRow}>
                          {lensFilters
                            .filter((f) => f.id !== 'none' && f.id !== step1FilterId)
                            .map((f) => {
                              const isSelected = f.id === step2FilterId;
                              return (
                                <Pressable
                                  key={`quick-s2-${f.id}`}
                                  nativeID={`quick-s2-${f.id}`}
                                  onPress={() => selectStep2Filter(f.id)}
                                  style={[
                                    styles.quickMiniPill,
                                    isSelected && {
                                      backgroundColor: C.paper,
                                      borderColor: f.color,
                                      borderWidth: 2,
                                    },
                                  ]}
                                >
                                  <View style={styles.filterBtnTitleRow}>
                                    <View
                                      style={[
                                        styles.filterBtnDot,
                                        { backgroundColor: f.color },
                                        isSelected && { borderColor: C.ink, borderWidth: 1.5 },
                                      ]}
                                    />
                                    <Text
                                      style={[
                                        styles.quickMiniPillText,
                                        isSelected && { color: C.ink },
                                      ]}
                                    >
                                      {isSelected ? '✓ ' : '+ '}
                                      {f.shortName} ({f.factor})
                                    </Text>
                                  </View>
                                </Pressable>
                              );
                            })}
                        </View>

                        {/* Button below Step 2: "STACK MORE?" */}
                        <View style={{ marginTop: 4, alignItems: 'flex-start' }}>
                          <Pressable
                            nativeID="quick-btn-stack-more"
                            onPress={() => {
                              if (showStep3) {
                                setShowStep3(false);
                                setStep3FilterId('none');
                              } else {
                                setShowStep3(true);
                              }
                            }}
                            style={[
                              styles.clearStackBtn,
                              showStep3 && { backgroundColor: C.mustard },
                            ]}
                          >
                            <Text
                              style={[
                                styles.clearStackBtnText,
                                showStep3 && { color: C.ink },
                              ]}
                            >
                              {showStep3 ? '▲ HIDE STEP 3' : '+ STACK MORE?'}
                            </Text>
                          </Pressable>
                        </View>

                        {/* STEP 3: Only appears when "STACK MORE?" is clicked */}
                        {showStep3 && (
                          <View
                            style={[styles.cardInlineStackBox, { marginTop: 6, paddingTop: 8 }]}
                            nativeID="quick-filter-step3-box"
                          >
                            <View style={styles.filterStackHeaderRow}>
                              <Text style={styles.filterStackTitle}>
                                ↳ STEP 3 · STACK A 3RD FILTER:
                              </Text>
                              {step3FilterId !== 'none' && (
                                <Pressable
                                  nativeID="quick-clear-step3"
                                  onPress={() => selectStep3Filter('none')}
                                  style={styles.clearStackBtn}
                                >
                                  <Text style={styles.clearStackBtnText}>✕ CLEAR STEP 3</Text>
                                </Pressable>
                              )}
                            </View>
                            <View style={styles.filterPillRow}>
                              {lensFilters
                                .filter(
                                  (f) =>
                                    f.id !== 'none' &&
                                    f.id !== step1FilterId &&
                                    f.id !== step2FilterId,
                                )
                                .map((f) => {
                                  const isSelected = f.id === step3FilterId;
                                  return (
                                    <Pressable
                                      key={`quick-s3-${f.id}`}
                                      nativeID={`quick-s3-${f.id}`}
                                      onPress={() => selectStep3Filter(f.id)}
                                      style={[
                                        styles.quickMiniPill,
                                        isSelected && {
                                          backgroundColor: C.paper,
                                          borderColor: f.color,
                                          borderWidth: 2,
                                        },
                                      ]}
                                    >
                                      <View style={styles.filterBtnTitleRow}>
                                        <View
                                          style={[
                                            styles.filterBtnDot,
                                            { backgroundColor: f.color },
                                            isSelected && { borderColor: C.ink, borderWidth: 1.5 },
                                          ]}
                                        />
                                        <Text
                                          style={[
                                            styles.quickMiniPillText,
                                            isSelected && { color: C.ink },
                                          ]}
                                        >
                                          {isSelected ? '✓ ' : '+ '}
                                          {f.shortName} ({f.factor})
                                        </Text>
                                      </View>
                                    </Pressable>
                                  );
                                })}
                            </View>
                          </View>
                        )}
                      </View>
                    )}
                  </View>
                  <View style={styles.quickTweakCol}>
                    <Text style={styles.quickTweakLabel}>
                      B&W PUSH / PULL DEVELOPMENT & STREET CONTRAST RECIPE:
                    </Text>
                    <View style={styles.filterPillRow}>
                      {grittyStyles.map((g) => {
                        const isSelected = g.id === activeGritty.id;
                        return (
                          <Pressable
                            key={`quick-g-${g.id}`}
                            onPress={() => setGrittyId(g.id)}
                            style={[
                              styles.quickMiniPill,
                              isSelected && { backgroundColor: C.orange, borderColor: C.mustard },
                            ]}
                          >
                            <Text style={[styles.quickMiniPillText, isSelected && { color: C.paper }]}>
                              {g.shortName} ({g.badge})
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>
                </View>
              )}
            </View>

            {/* UX #4: 1968 Folder Tabs for Deep-Dive Panels (Tap active tab to fold shut) */}
            <View style={styles.folderTabsWrap}>
              <View style={styles.folderTabsHeaderRow}>
                <Text style={styles.folderTabsKicker}>
                  OPTIONAL DEEP-DIVE REFERENCE PANELS (TAP ANY TAB TO OPEN · TAP ACTIVE TAB TO FOLD SHUT):
                </Text>
                {activeDetailTab !== 'none' && (
                  <Pressable
                    nativeID="btn-fold-all-tabs"
                    onPress={() => setActiveDetailTab('none')}
                    style={styles.foldTabsCloseBtn}
                  >
                    <Text style={styles.foldTabsCloseText}>▲ FOLD PANEL SHUT</Text>
                  </Pressable>
                )}
              </View>
              <View style={styles.folderTabsBar} nativeID="detail-folder-tabs">
                {[
                  {
                    id: 'dof' as const,
                    label: '⊕ DEPTH OF FIELD & BOKEH',
                    badge: `Focus & sharp zone (${formatAperture(bestDisplay.aperture)})`,
                  },
                  {
                    id: 'filters' as const,
                    label: '◐ LENS FILTER COMPARE',
                    badge: `Stackable CPL / B&W / ND (${activeFilter.shortName})`,
                  },
                  {
                    id: 'grit' as const,
                    label: '▨ PUSH / PULL & GRIT LAB',
                    badge: `B&W recipes (${activeGritty.shortName})`,
                  },
                  {
                    id: 'film' as const,
                    label: 'FILM TIPS & LATITUDE',
                    badge: `Guide for ${activeFilmStock ? activeFilmStock.shortName : `ISO ${iso}`}`,
                    isFilmTab: true,
                  },
                  {
                    id: 'all' as const,
                    label: '⊞ SHOW ALL 4 PANELS',
                    badge: 'Expand full reference sheet',
                  },
                ].map((tab) => {
                  const active = activeDetailTab === tab.id;
                  return (
                    <Pressable
                      key={tab.id}
                      nativeID={`tab-${tab.id}`}
                      onPress={() => setActiveDetailTab(active ? 'none' : tab.id)}
                      style={[styles.folderTab, active && styles.folderTabActive]}
                    >
                      <View style={styles.folderTabTitleRow}>
                        {tab.isFilmTab && (
                          <FilmStripSvgIcon size={14} color={active ? C.ink : C.paper} />
                        )}
                        <Text style={[styles.folderTabTitle, active && { color: C.ink }]}>
                          {tab.label}
                        </Text>
                      </View>
                      <Text style={[styles.folderTabSub, active && { color: C.brown }]}>
                        {tab.badge}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* TAB 1: Depth of Field & Bokeh Visualizer */}
            {(activeDetailTab === 'dof' || activeDetailTab === 'all') && (
              <DepthOfFieldIndicator
                camera={camera!}
                lens={lens!}
                selectedAperture={bestDisplay.aperture}
                hasApertureLock={validPreferredAperture !== undefined}
                distanceM={focusDistanceM}
                isHyperfocalMode={isHyperfocalMode}
                allExposurePairs={[bestDisplay, ...r.alternatives]}
                onSelectAperture={(ap) => {
                  setPreferredAperture(ap);
                  if (ap === undefined) setIsHyperfocalMode(false);
                }}
                onSelectDistance={handleSelectDistance}
                onSelectHyperfocal={handleSelectHyperfocal}
                onEquipFilter={(fid) => equipOrStackFilter(fid)}
              />
            )}

            {/* TAB 2: Progressive 3-Step Lens Filter Stacker (Nothing below when NONE is selected; no extra options below Step 2 or Step 3) */}
            {(activeDetailTab === 'filters' || activeDetailTab === 'all') && (
              <View style={styles.filterSection} nativeID="filter-compare-section" role="region" aria-label="35mm Screw-In Lens Filter Stacker">
                <Text
                  style={styles.altTitle}
                  accessibilityRole="header"
                  aria-level={2}
                >
                  35MM SCREW-IN LENS FILTER STACKER · CPL / B&W / ND / WARMING
                </Text>
                <Text style={styles.altHint}>
                  Select a filter in Step 1 below to see your updated exposure & unlock Step 2 to stack additional filters:
                </Text>

                {/* STEP 1: Primary Base Filter Row */}
                <Text
                  style={[styles.quickTweakLabel, { marginTop: 8 }]}
                  accessibilityRole="header"
                  aria-level={3}
                >
                  STEP 1 · SELECT PRIMARY LENS FILTER:
                </Text>
                <View style={styles.filterPillRow}>
                  {lensFilters.map((f) => {
                    const isSelected = f.id === step1FilterId;
                    return (
                      <Pressable
                        key={f.id}
                        nativeID={`filter-${f.id}`}
                        onPress={() => selectStep1Filter(f.id)}
                        style={[
                          styles.filterPill,
                          isSelected && {
                            backgroundColor: C.paper,
                            borderColor: f.color,
                            borderWidth: 2,
                          },
                        ]}
                      >
                        <View style={styles.filterBtnTitleRow}>
                          <View
                            style={[
                              styles.filterBtnDot,
                              { backgroundColor: f.color },
                              isSelected && { borderColor: C.ink, borderWidth: 1.5 },
                            ]}
                          />
                          <Text style={[styles.filterPillTitle, isSelected && { color: C.ink }]}>
                            {f.shortName}
                          </Text>
                        </View>
                        <Text style={[styles.filterPillSub, isSelected && { color: C.brown }]}>
                          {f.factor}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                {/* When NONE is selected in Step 1, nothing appears below. When a filter is selected, Step 2 appears: */}
                {step1FilterId !== 'none' && (
                  <View style={styles.filterStackSubBox} nativeID="tab-filter-step2-box">
                    <View style={styles.filterStackHeaderRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.filterStackTitle}>
                          ↳ STEP 2 · STACK A 2ND FILTER WITH {activeFilter.primaryFilter.shortName} ({activeFilter.primaryFilter.factor})
                        </Text>
                        <Text style={styles.filterStackHint}>
                          All other filters available to stack with {activeFilter.primaryFilter.shortName} — tap one to stack (exposure & aperture update automatically):
                        </Text>
                      </View>
                      {step2FilterId !== 'none' && (
                        <Pressable
                          nativeID="tab-clear-step2"
                          onPress={() => selectStep2Filter('none')}
                          style={styles.clearStackBtn}
                        >
                          <Text style={styles.clearStackBtnText}>✕ CLEAR STEP 2</Text>
                        </Pressable>
                      )}
                    </View>

                    <View style={styles.filterPillRow}>
                      {lensFilters
                        .filter((f) => f.id !== 'none' && f.id !== step1FilterId)
                        .map((f) => {
                          const isSelected = f.id === step2FilterId;
                          const previewStack = summarizeFilterStack(
                            [step1FilterId, f.id],
                            lens!.focalLength,
                          );
                          const previewRec = recommend(
                            iso,
                            cond,
                            camera!,
                            lens!,
                            previewStack.totalStops + activeLightDir.stops,
                            activeGritty.evShiftStops,
                            validPreferredAperture,
                            prioritizeHandheld,
                          );
                          return (
                            <Pressable
                              key={`tab-s2-${f.id}`}
                              nativeID={`tab-s2-${f.id}`}
                              onPress={() => selectStep2Filter(f.id)}
                              style={[
                                styles.stackOptionPill,
                                isSelected && {
                                  backgroundColor: C.paper,
                                  borderColor: f.color,
                                  borderWidth: 2,
                                },
                              ]}
                            >
                              <View style={styles.filterBtnTitleRow}>
                                <View
                                  style={[
                                    styles.filterBtnDot,
                                    { backgroundColor: f.color },
                                    isSelected && { borderColor: C.ink, borderWidth: 1.5 },
                                  ]}
                                />
                                <Text
                                  style={[
                                    styles.stackOptionTitle,
                                    isSelected && { color: C.ink },
                                  ]}
                                >
                                  {isSelected ? '✓ STACKED: ' : '+ '}
                                  {f.shortName} ({f.factor})
                                </Text>
                              </View>
                              <Text
                                style={[
                                  styles.stackOptionSub,
                                  isSelected && { color: C.brown },
                                ]}
                              >
                                +{previewStack.totalStops} EV →{' '}
                                {previewRec.best
                                  ? `${formatAperture(previewRec.best.aperture)} · ${formatShutter(previewRec.best.shutter)}`
                                  : 'Out of EV'}
                              </Text>
                            </Pressable>
                          );
                        })}
                    </View>

                    {/* Button below Step 2: "STACK MORE?" */}
                    <View style={{ marginTop: 6, alignItems: 'flex-start' }}>
                      <Pressable
                        nativeID="tab-btn-stack-more"
                        onPress={() => {
                          if (showStep3) {
                            setShowStep3(false);
                            setStep3FilterId('none');
                          } else {
                            setShowStep3(true);
                          }
                        }}
                        style={[
                          styles.clearStackBtn,
                          showStep3 && { backgroundColor: C.mustard },
                        ]}
                      >
                        <Text
                          style={[
                            styles.clearStackBtnText,
                            showStep3 && { color: C.ink },
                          ]}
                        >
                          {showStep3 ? '▲ HIDE STEP 3' : '+ STACK MORE?'}
                        </Text>
                      </Pressable>
                    </View>

                    {/* STEP 3: Appears when "STACK MORE?" is clicked */}
                    {showStep3 && (
                      <View
                        style={styles.cardInlineStackBox}
                        nativeID="tab-filter-step3-box"
                      >
                        <View style={styles.filterStackHeaderRow}>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.filterStackTitle}>
                              ↳ STEP 3 · STACK A 3RD FILTER
                            </Text>
                            <Text style={styles.filterStackHint}>
                              Select a 3rd filter from the available filters below to add to your stack:
                            </Text>
                          </View>
                          {step3FilterId !== 'none' && (
                            <Pressable
                              nativeID="tab-clear-step3"
                              onPress={() => selectStep3Filter('none')}
                              style={styles.clearStackBtn}
                            >
                              <Text style={styles.clearStackBtnText}>✕ CLEAR STEP 3</Text>
                            </Pressable>
                          )}
                        </View>

                        <View style={styles.filterPillRow}>
                          {lensFilters
                            .filter(
                              (f) =>
                                f.id !== 'none' &&
                                f.id !== step1FilterId &&
                                f.id !== step2FilterId,
                            )
                            .map((f) => {
                              const isSelected = f.id === step3FilterId;
                              const previewIds: FilterId[] = [
                                step1FilterId,
                                ...(step2FilterId !== 'none' ? [step2FilterId] : []),
                                f.id,
                              ];
                              const previewStack = summarizeFilterStack(
                                previewIds,
                                lens!.focalLength,
                              );
                              const previewRec = recommend(
                                iso,
                                cond,
                                camera!,
                                lens!,
                                previewStack.totalStops + activeLightDir.stops,
                                activeGritty.evShiftStops,
                                validPreferredAperture,
                                prioritizeHandheld,
                              );
                              return (
                                <Pressable
                                  key={`tab-s3-${f.id}`}
                                  nativeID={`tab-s3-${f.id}`}
                                  onPress={() => selectStep3Filter(f.id)}
                                  style={[
                                    styles.stackOptionPill,
                                    isSelected && {
                                      backgroundColor: C.paper,
                                      borderColor: f.color,
                                      borderWidth: 2,
                                    },
                                  ]}
                                >
                                  <View style={styles.filterBtnTitleRow}>
                                    <View
                                      style={[
                                        styles.filterBtnDot,
                                        { backgroundColor: f.color },
                                        isSelected && { borderColor: C.ink, borderWidth: 1.5 },
                                      ]}
                                    />
                                    <Text
                                      style={[
                                        styles.stackOptionTitle,
                                        isSelected && { color: C.ink },
                                      ]}
                                    >
                                      {isSelected ? '✓ STACKED: ' : '+ '}
                                      {f.shortName} ({f.factor})
                                    </Text>
                                  </View>
                                  <Text
                                    style={[
                                      styles.stackOptionSub,
                                      isSelected && { color: C.brown },
                                    ]}
                                  >
                                    +{previewStack.totalStops} EV →{' '}
                                    {previewRec.best
                                      ? `${formatAperture(previewRec.best.aperture)} · ${formatShutter(previewRec.best.shutter)}`
                                      : 'Out of EV'}
                                  </Text>
                                </Pressable>
                              );
                            })}
                        </View>
                      </View>
                    )}
                  </View>
                )}
              </View>
            )}

            {/* TAB 3: Gritty / Street Style Section */}
            {(activeDetailTab === 'grit' || activeDetailTab === 'all') && (
              <View style={styles.grittySection} nativeID="gritty-section" role="region" aria-label="Gritty and Street Style Exposure and Darkroom Tweaks">
                <View style={styles.grittyHeaderRow}>
                  <Text
                    style={styles.altTitle}
                    accessibilityRole="header"
                    aria-level={2}
                  >
                    GRITTY / STREET STYLE · EXPOSURE & DARKROOM TWEAKS
                  </Text>
                  <View style={styles.grittyGrainBadge}>
                    <Text style={styles.grittyGrainBadgeText}>{activeGrittyRec.grainProfile}</Text>
                  </View>
                </View>
                <Text style={styles.altHint}>
                  Tailored to your {brands.find((b) => b.id === brandId)?.name} {camera!.name}, {lens!.name} & ISO {iso}. Tap a gritty tweak to shift the exposure table, or compare recipes below:
                </Text>

                <View style={styles.filterPillRow}>
                  {grittyStyles.map((g) => {
                    const isSelected = g.id === activeGritty.id;
                    return (
                      <Pressable
                        key={g.id}
                        nativeID={`gritty-${g.id}`}
                        onPress={() => setGrittyId(g.id)}
                        style={[
                          styles.filterPill,
                          isSelected && { backgroundColor: C.orange, borderColor: C.mustard },
                        ]}
                      >
                        <Text style={[styles.filterPillTitle, isSelected && { color: C.paper }]}>
                          {g.shortName}
                        </Text>
                        <Text style={[styles.filterPillSub, isSelected && { color: C.paperDark }]}>
                          {g.badge}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                <View style={styles.grittyGearBanner}>
                  <Text style={styles.grittyGearText}>
                    <Text style={styles.grittyGearHighlight}>GEAR & ISO CHECK: </Text>
                    {activeGrittyRec.isoDialNote}
                  </Text>
                  <Text style={[styles.grittyGearText, { marginTop: 4 }]}>
                    <Text style={styles.grittyGearHighlight}>ZONE FOCUS TIP: </Text>
                    {activeGrittyRec.zoneFocusHint}
                  </Text>
                </View>

                <View style={[styles.filterGrid, wide && { flexDirection: 'row', flexWrap: 'wrap' }]}>
                  {grittyStyles
                    .filter((g) => g.id !== 'off')
                    .map((g) => {
                      const gr = recommendGritty(iso, cond, camera!, lens!, totalPositiveStops, g);
                      const isSelected = g.id === activeGritty.id;
                      return (
                        <Pressable
                          key={g.id}
                          nativeID={`gritty-card-${g.id}`}
                          onPress={() => setGrittyId(isSelected ? 'off' : g.id)}
                          style={[
                            styles.grittyCard,
                            wide && { width: '48.5%' },
                            isSelected && { borderColor: C.orange, borderWidth: 2 },
                          ]}
                        >
                          <View style={styles.filterCardHead}>
                            <View style={[styles.filterDot, { backgroundColor: C.orange }]} />
                            <Text style={styles.filterCardTitle}>{g.name}</Text>
                            {activeFilter.hasFilters && (
                              <View style={[styles.filterFactorBadge, { backgroundColor: activeFilter.color }]}>
                                <Text style={styles.filterFactorText}>
                                  NET {gr.netEvStops >= 0 ? `+${gr.netEvStops}` : gr.netEvStops} EV
                                </Text>
                              </View>
                            )}
                            <View style={[styles.filterFactorBadge, { backgroundColor: C.mustard }]}>
                              <Text style={styles.filterFactorText}>EI {gr.ratedIso}</Text>
                            </View>
                          </View>
                          <Text style={styles.filterEffect}>{g.description}</Text>

                          {gr.primary ? (
                            <View style={styles.grittyMetricsBox}>
                              <View style={styles.grittyMetricRow}>
                                <View style={styles.grittyMetricItem}>
                                  <Text style={styles.grittyMetricLabel}>RECOMMENDED GRIT</Text>
                                  <Text style={styles.grittyMetricValue}>
                                    {formatAperture(gr.primary.aperture)} · {formatShutter(gr.primary.shutter)}
                                  </Text>
                                </View>
                                {gr.zoneSetting && (
                                  <View style={styles.grittyMetricItem}>
                                    <Text style={styles.grittyMetricLabel}>STREET ZONE (f/8–16)</Text>
                                    <Text style={styles.grittyMetricValue}>
                                      {formatAperture(gr.zoneSetting.aperture)} · {formatShutter(gr.zoneSetting.shutter)}
                                    </Text>
                                  </View>
                                )}
                              </View>
                              <View style={[styles.grittyMetricRow, { marginTop: 6 }]}>
                                {gr.bokehSetting && (
                                  <View style={styles.grittyMetricItem}>
                                    <Text style={[styles.grittyMetricLabel, { color: C.mustard }]}>
                                      RAW BOKEH (WIDE)
                                    </Text>
                                    <Text style={[styles.grittyMetricValue, { color: C.mustard }]}>
                                      {formatAperture(gr.bokehSetting.aperture)} · {formatShutter(gr.bokehSetting.shutter)}
                                    </Text>
                                  </View>
                                )}
                                {gr.dragSetting && (
                                  <View style={styles.grittyMetricItem}>
                                    <Text style={[styles.grittyMetricLabel, { color: C.teal }]}>
                                      MOTION DRAG (SLOW)
                                    </Text>
                                    <Text style={[styles.grittyMetricValue, { color: C.paper }]}>
                                      {formatAperture(gr.dragSetting.aperture)} · {formatShutter(gr.dragSetting.shutter)}
                                    </Text>
                                  </View>
                                )}
                              </View>
                            </View>
                          ) : (
                            <Text style={styles.altHint}>Out of shutter/aperture range on this gear.</Text>
                          )}

                          <Text style={styles.grittyLabNote}>
                            <Text style={{ color: C.mustard }}>LAB / DEV: </Text>
                            {gr.labNote}
                          </Text>
                          <Text style={styles.grittyFilterNote}>
                            <Text style={{ color: C.teal }}>BEST FILTER PAIRING: </Text>
                            {g.recommendedFilter} · {gr.grainProfile}
                          </Text>
                        </Pressable>
                      );
                    })}
                </View>
              </View>
            )}

            {/* TAB 4: Loaded Film Field Guide & Shooting Tips (for the film selected in Step 1) */}
            {(activeDetailTab === 'film' || activeDetailTab === 'all') && (
              <View style={styles.filterSection} nativeID="film-guide-tab" role="region" aria-label="Loaded 35mm Film Field Guide and Shooting Tips">
                <Text
                  style={styles.altTitle}
                  accessibilityRole="header"
                  aria-level={2}
                >
                  LOADED 35MM FILM FIELD GUIDE ·{' '}
                  {activeFilmStock ? activeFilmStock.name.toUpperCase() : `GENERIC ISO ${iso} EMULSION`}
                </Text>
                <Text style={styles.altHint}>
                  Shooting tips, dynamic range latitude, and reciprocity guide for the 35mm film loaded in Step 1:
                </Text>

                <View
                  style={[
                    styles.filterCard,
                    { borderColor: C.mustard, borderWidth: 2, marginTop: 10 },
                  ]}
                >
                  <View style={styles.filterCardHead}>
                    <FilmStripSvgIcon size={16} color={C.mustard} />
                    <Text style={styles.filterCardTitle}>
                      {activeFilmStock ? activeFilmStock.name : `Standard ISO ${iso} 35mm Film`}
                    </Text>
                    <View style={[styles.filterFactorBadge, { backgroundColor: C.mustard }]}>
                      <Text style={styles.filterFactorText}>ISO {iso}</Text>
                    </View>
                    <View style={[styles.filterFactorBadge, { backgroundColor: C.teal }]}>
                      <Text style={[styles.filterFactorText, { color: C.paper }]}>
                        {activeFilmStock
                          ? `LATITUDE +${activeFilmStock.latitudeOverStops} / −${activeFilmStock.latitudeUnderStops} EV`
                          : 'LATITUDE +2 / −1 EV'}
                      </Text>
                    </View>
                  </View>

                  <Text style={[styles.filterEffect, { color: C.mustard, marginTop: 6 }]}>
                    {activeFilmStock
                      ? `${activeFilmStock.process} · Grain Structure: ${activeFilmStock.grain}`
                      : 'Standard 35mm Analog Curve · Balanced Grain'}
                  </Text>

                  <Text style={[styles.filterEffect, { marginTop: 4 }]}>
                    {activeFilmStock
                      ? activeFilmStock.character
                      : `Baseline ISO ${iso} film speed for 35mm cameras. Select a specific emulsion in Step 1 above if you want exact manufacturer latitude and reciprocity data.`}
                  </Text>

                  {/* Dynamic Range & Current Setting Safety Check */}
                  <View style={[styles.grittyMetricsBox, { marginTop: 10 }]}>
                    <View style={styles.grittyMetricRow}>
                      <View style={styles.grittyMetricItem}>
                        <Text style={[styles.grittyMetricLabel, { color: C.teal }]}>
                          HIGHLIGHT OVEREXPOSURE LIMIT
                        </Text>
                        <Text style={styles.grittyMetricValue}>
                          +{activeFilmStock ? activeFilmStock.latitudeOverStops : 2} STOPS (+EV)
                        </Text>
                      </View>
                      <View style={styles.grittyMetricItem}>
                        <Text style={[styles.grittyMetricLabel, { color: C.orange }]}>
                          SHADOW UNDEREXPOSURE LIMIT
                        </Text>
                        <Text style={styles.grittyMetricValue}>
                          −{activeFilmStock ? activeFilmStock.latitudeUnderStops : 1} STOPS (−EV)
                        </Text>
                      </View>
                    </View>
                    <Text style={[styles.grittyLabNote, { marginTop: 6 }]}>
                      <Text style={{ color: C.mustard }}>ON YOUR {camera!.name.toUpperCase()} RIGHT NOW: </Text>
                      {formatAperture(bestDisplay.aperture)} · {formatShutter(bestDisplay.shutter)} is{' '}
                      {formatError(bestDisplay.errorStops)} from ideal —{' '}
                      {bestDisplay.errorStops <= (activeFilmStock?.latitudeOverStops ?? 2) &&
                      bestDisplay.errorStops >= -(activeFilmStock?.latitudeUnderStops ?? 1)
                        ? '✓ SAFELY WITHIN THIS FILM’S LATITUDE WINDOW.'
                        : '⚠ OUTSIDE SAFE LATITUDE — ADJUST APERTURE/SHUTTER OR ADD AN ND/CPL FILTER.'}
                    </Text>
                  </View>

                  {/* Shooting Tips for this Loaded Film */}
                  <Text style={[styles.grittyLabNote, { marginTop: 8, fontSize: 11 }]}>
                    <Text style={{ color: C.orange }}>FIELD SHOOTING TIP: </Text>
                    {activeFilmStock
                      ? activeFilmStock.fieldTip
                      : 'When in doubt with negative film, favor +0.5 to +1 stop more light (wider aperture or 1 step slower shutter) to preserve shadow detail.'}
                  </Text>

                  <Text style={[styles.grittyLabNote, { marginTop: 6, fontSize: 11 }]}>
                    <Text style={{ color: C.teal }}>METERING & BRACKETING RULE FOR THIS ROLL: </Text>
                    {activeFilmStock?.process === 'E-6 Slide'
                      ? 'Slide reversal film has almost zero highlight tolerance (±0.5 EV). Meter for the brightest lit highlights and never overexpose.'
                      : activeFilmStock?.process.includes('B&W')
                      ? 'Expose for the shadows and develop for the highlights. Pair with Yellow (#8), Orange (#16), or Red (#25) filters in the Filter tab to separate clouds and skin tones.'
                      : 'Color negative film loves light in the shadows: erring +1 stop over (+1 EV) yields richer colors and finer grain than underexposing.'}
                  </Text>

                  <Text style={[styles.grittyLabNote, { marginTop: 6, fontSize: 11 }]}>
                    <Text style={{ color: C.mustard }}>LONG EXPOSURE RECIPROCITY (≥1S BULB): </Text>
                    {activeFilmStock
                      ? activeFilmStock.reciprocityNote
                      : 'Standard Schwarzschild p=1.30 (Metered 2s → Shoot 2.5s, 4s → 6s, 15s → 34s).'}
                  </Text>
                </View>
              </View>
            )}
          </>
        ) : (
          <Text style={styles.body}>No usable combination on this camera/lens.</Text>
        )}
      </View>
    );
  }
}

const display = 'BebasNeue_400Regular';
const type = 'SpecialElite_400Regular';

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.paperDark },
  scroll: { padding: 16, alignItems: 'center' },
  page: {
    width: '100%',
    maxWidth: 1000,
    backgroundColor: C.paper,
    borderWidth: 3,
    borderColor: C.ink,
    padding: 20,
    ...Platform.select({ web: { boxShadow: '8px 8px 0 #1E1A16' } as any, default: { elevation: 6 } }),
  },
  stripes: { flexDirection: 'row', height: 14, marginHorizontal: -20, marginTop: -20, marginBottom: 16 },
  stripe: { flex: 1 },
  masthead: { borderBottomWidth: 3, borderColor: C.ink, paddingBottom: 12, marginBottom: 8, alignItems: 'center' },
  kicker: { fontFamily: type, fontSize: 11, color: C.brown, letterSpacing: 1, textAlign: 'center' },
  title: { fontFamily: display, fontSize: 96, lineHeight: 96, color: C.ink, letterSpacing: 4, marginTop: 4 },
  tagline: { fontFamily: type, fontSize: 15, color: C.ink, fontStyle: 'italic', textAlign: 'center' },

  section: { marginTop: 18 },
  sectionHead: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  stepBadge: { width: 30, height: 30, borderRadius: 15, backgroundColor: C.teal, alignItems: 'center', justifyContent: 'center', marginRight: 10, borderWidth: 2, borderColor: C.ink },
  stepText: { fontFamily: display, fontSize: 18, color: C.paper },
  sectionTitle: { fontFamily: display, fontSize: 26, color: C.ink, letterSpacing: 1.5 },
  rule: { flex: 1, height: 2, backgroundColor: C.ink, marginLeft: 12, opacity: 0.6 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderWidth: 2, borderColor: C.ink, paddingVertical: 6, paddingHorizontal: 12, backgroundColor: C.paper, minWidth: 64, alignItems: 'center' },
  chipActive: { backgroundColor: C.ink },
  chipText: { fontFamily: display, fontSize: 20, color: C.ink, letterSpacing: 1 },
  chipSub: { fontFamily: type, fontSize: 10, color: C.brown },

  filmStockBox: {
    marginTop: 10,
    borderWidth: 2,
    borderColor: C.ink,
    backgroundColor: C.paperDark,
    padding: 10,
  },
  filmStockHeaderLabel: {
    fontFamily: type,
    fontSize: 10,
    color: C.brown,
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  stockPill: {
    borderWidth: 1.5,
    borderColor: C.ink,
    backgroundColor: C.paper,
    paddingVertical: 5,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  stockPillActive: {
    backgroundColor: C.ink,
  },
  stockPillTitle: {
    fontFamily: display,
    fontSize: 15,
    color: C.ink,
    letterSpacing: 1,
  },
  stockPillSub: {
    fontFamily: type,
    fontSize: 9,
    color: C.brown,
  },
  filmStockBanner: {
    marginTop: 8,
    padding: 10,
    backgroundColor: C.ink,
    borderWidth: 1.5,
    borderColor: C.mustard,
  },
  filmStockBannerHead: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  filmStockBannerTitle: {
    fontFamily: display,
    fontSize: 18,
    color: C.mustard,
    letterSpacing: 1.2,
  },
  filmStockBadgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  filmLatitudeBadge: {
    backgroundColor: C.mustard,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: C.paper,
  },
  filmLatitudeBadgeText: {
    fontFamily: display,
    fontSize: 12,
    color: C.ink,
    letterSpacing: 0.8,
  },
  filmStockCharText: {
    fontFamily: type,
    fontSize: 11,
    color: C.paper,
    marginTop: 4,
  },
  filmStockTipText: {
    fontFamily: type,
    fontSize: 11,
    color: C.paperDark,
    marginTop: 3,
  },

  controlBar: {
    marginTop: 24,
    borderWidth: 3,
    borderColor: C.ink,
    backgroundColor: C.paperDark,
    padding: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  controlBarInfo: { flex: 1, minWidth: 240 },
  controlStatusRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  controlStatusDot: { width: 12, height: 12, borderRadius: 6, borderWidth: 2, borderColor: C.ink },
  controlBarTitle: { fontFamily: display, fontSize: 22, color: C.ink, letterSpacing: 1.5 },
  controlBarSub: { fontFamily: type, fontSize: 12, color: C.brown, marginTop: 2 },
  controlBarButtons: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  controlBtn: {
    borderWidth: 2,
    borderColor: C.ink,
    paddingVertical: 8,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 190,
  },
  controlBtnStart: { backgroundColor: C.mustard },
  controlBtnResetAll: { backgroundColor: C.orange },
  controlBtnDisabled: { backgroundColor: C.paper, opacity: 0.65 },
  controlBtnStartText: { fontFamily: display, fontSize: 20, color: C.ink, letterSpacing: 1.2 },
  controlBtnStartSub: { fontFamily: type, fontSize: 10, color: C.ink },
  controlBtnResetText: { fontFamily: display, fontSize: 20, color: C.paper, letterSpacing: 1.2 },
  controlBtnResetSub: { fontFamily: type, fontSize: 10, color: C.paperDark },

  tableWrap: { marginTop: 14, borderWidth: 3, borderColor: C.ink },
  tableHeader: { backgroundColor: C.teal, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 10, borderBottomWidth: 3, borderColor: C.ink, flexWrap: 'wrap', gap: 8 },
  tableHeaderText: { fontFamily: display, fontSize: 34, color: C.ink, letterSpacing: 3 },
  headerBadges: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  isoBox: { borderWidth: 2, borderColor: C.ink, backgroundColor: C.paper, paddingHorizontal: 10, paddingVertical: 2 },
  isoBoxText: { fontFamily: display, fontSize: 22, color: C.ink },
  cameraLine: { fontFamily: type, fontSize: 13, color: C.ink, padding: 10, borderBottomWidth: 2, borderColor: C.ink },

  fieldToolbar: {
    padding: 10,
    backgroundColor: C.paperDark,
    borderBottomWidth: 2,
    borderColor: C.ink,
    gap: 10,
  },
  toolbarGroup: {},
  toolbarLabel: {
    fontFamily: type,
    fontSize: 10,
    color: C.brown,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  toolbarRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    alignItems: 'stretch',
  },
  dirPill: {
    borderWidth: 1.5,
    borderColor: C.ink,
    backgroundColor: C.paper,
    paddingVertical: 5,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 40,
  },
  dirPillActive: {
    backgroundColor: C.ink,
  },
  dirPillTitle: {
    fontFamily: display,
    fontSize: 15,
    color: C.ink,
    letterSpacing: 1,
  },
  dirPillSub: {
    fontFamily: type,
    fontSize: 9,
    color: C.brown,
  },
  sceneTabPill: {
    borderWidth: 1.5,
    borderColor: C.ink,
    backgroundColor: C.paper,
    paddingVertical: 5,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 40,
  },
  sceneTabPillActive: {
    backgroundColor: C.teal,
  },
  sceneTabText: {
    fontFamily: display,
    fontSize: 15,
    color: C.ink,
    letterSpacing: 1,
  },
  sceneTabSub: {
    fontFamily: type,
    fontSize: 9,
    color: C.brown,
  },
  handheldTogglePill: {
    borderWidth: 1.5,
    borderColor: C.ink,
    backgroundColor: C.paper,
    paddingVertical: 5,
    paddingHorizontal: 10,
    justifyContent: 'center',
    minHeight: 40,
  },
  handheldTogglePillActive: {
    backgroundColor: C.orange,
  },
  handheldBtnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  handheldToggleText: {
    fontFamily: display,
    fontSize: 15,
    color: C.ink,
    letterSpacing: 1,
  },
  handheldToggleSub: {
    fontFamily: type,
    fontSize: 9,
    color: C.brown,
  },

  grid: {},
  cell: { flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: 1, borderRightWidth: 1, borderColor: C.ink, gap: 12 },
  cellLowLight: { backgroundColor: '#EAE0C6' },
  cellActive: { backgroundColor: C.mustard },
  iconBox: { width: 56, height: 56, alignItems: 'center', justifyContent: 'center' },
  condTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  condTitle: { fontFamily: display, fontSize: 22, color: C.ink, letterSpacing: 1 },
  lowLightTag: {
    backgroundColor: C.ink,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  lowLightTagText: {
    fontFamily: display,
    fontSize: 10,
    color: C.mustard,
    letterSpacing: 0.8,
  },
  condHint: { fontFamily: type, fontSize: 11, color: C.brown },
  condValueRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2, flexWrap: 'wrap' },
  condValue: { fontFamily: type, fontSize: 16, color: C.ink },
  cellShakeBadge: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderWidth: 1,
    borderColor: C.ink,
  },
  cellShakeText: {
    fontFamily: display,
    fontSize: 10,
    color: C.paper,
    letterSpacing: 0.6,
  },

  result: { padding: 16, backgroundColor: C.ink },
  resultKicker: { fontFamily: type, fontSize: 12, color: C.mustard, letterSpacing: 1 },
  bigRow: { flexDirection: 'row', gap: 12, marginTop: 10 },
  bigBox: { flex: 1, backgroundColor: C.teal, borderWidth: 2, borderColor: C.paper, padding: 10, alignItems: 'center' },
  bigLabel: { fontFamily: type, fontSize: 12, color: C.ink },
  bigValue: { fontFamily: display, fontSize: 64, lineHeight: 68, color: C.paper },
  handheldBanner: {
    marginTop: 10,
    padding: 8,
    backgroundColor: '#262019',
    borderWidth: 1.5,
  },
  handheldBannerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
  },
  handheldBadgeBox: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: C.ink,
  },
  handheldBadgeText: {
    fontFamily: display,
    fontSize: 13,
    letterSpacing: 1,
  },
  handheldDetailText: {
    fontFamily: type,
    fontSize: 11,
    color: C.paper,
    flex: 1,
    minWidth: 180,
  },
  handheldJumpBtn: {
    backgroundColor: C.mustard,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: C.paper,
  },
  handheldJumpBtnText: {
    fontFamily: display,
    fontSize: 13,
    color: C.ink,
    letterSpacing: 0.8,
  },
  resultNote: { fontFamily: type, fontSize: 13, color: C.paper, marginTop: 10 },
  cumulativeBanner: { marginTop: 8, padding: 8, backgroundColor: '#2A231B', borderWidth: 1, borderColor: C.mustard },
  cumulativeText: { fontFamily: type, fontSize: 11, color: C.paper },
  altTitle: { fontFamily: display, fontSize: 20, color: C.mustard, marginTop: 14, letterSpacing: 2 },
  altHint: { fontFamily: type, fontSize: 11, color: C.paperDark, marginTop: 2 },
  altRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6 },
  altChip: { borderWidth: 1, borderColor: C.paper, paddingHorizontal: 10, paddingVertical: 5, alignItems: 'center', minWidth: 78 },
  altText: { fontFamily: display, fontSize: 20, color: C.paper },
  altSub: { fontFamily: type, fontSize: 11, color: C.paperDark },
  altDof: { fontFamily: display, fontSize: 10, color: C.teal, letterSpacing: 0.8, marginTop: 2 },
  altShakeText: { fontFamily: display, fontSize: 10, letterSpacing: 0.6, marginTop: 1 },

  filterSection: { marginTop: 18, paddingTop: 14, borderTopWidth: 1, borderColor: '#4A4035' },
  filterPillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  filterPill: { borderWidth: 1, borderColor: C.paperDark, paddingHorizontal: 10, paddingVertical: 5, alignItems: 'center', backgroundColor: '#2A231B' },
  filterPillTitle: { fontFamily: display, fontSize: 16, color: C.paper, letterSpacing: 1 },
  filterPillSub: { fontFamily: type, fontSize: 10, color: C.mustard },
  filterGrid: { gap: 10, marginTop: 12 },
  filterCard: { borderWidth: 1, borderColor: '#4A4035', backgroundColor: '#262019', padding: 10 },
  filterCardHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  filterDot: { width: 12, height: 12, borderRadius: 6, borderWidth: 1, borderColor: C.paper },
  filterCardTitle: { fontFamily: display, fontSize: 18, color: C.paper, letterSpacing: 1, flex: 1 },
  filterFactorBadge: { paddingHorizontal: 6, paddingVertical: 1, borderWidth: 1, borderColor: C.ink },
  filterFactorText: { fontFamily: display, fontSize: 13, color: C.ink, letterSpacing: 0.5 },
  filterEffect: { fontFamily: type, fontSize: 11, color: C.paperDark, marginTop: 4 },
  filterSummaryRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 8, marginTop: 6, paddingTop: 6, borderTopWidth: 1, borderColor: '#3A3127' },
  filterRecLabel: { fontFamily: type, fontSize: 11, color: C.paperDark },
  filterRecVal: { fontFamily: display, fontSize: 15, color: C.paper, letterSpacing: 0.5 },
  filterBokehLabel: { fontFamily: type, fontSize: 11, color: C.mustard },
  filterBokehVal: { fontFamily: display, fontSize: 15, color: C.mustard, letterSpacing: 0.5 },
  filterEqRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 6 },
  filterEqChip: { borderWidth: 1, borderColor: '#4A4035', paddingHorizontal: 6, paddingVertical: 2, alignItems: 'center', backgroundColor: C.ink },
  filterEqAperture: { fontFamily: display, fontSize: 14, color: C.paper },
  filterEqShutter: { fontFamily: type, fontSize: 9, color: C.paperDark },

  grittySection: { marginTop: 20, paddingTop: 16, borderTopWidth: 2, borderColor: C.orange },
  grittyHeaderRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  grittyGrainBadge: { backgroundColor: C.orange, paddingHorizontal: 8, paddingVertical: 2, borderWidth: 1, borderColor: C.paper },
  grittyGrainBadgeText: { fontFamily: display, fontSize: 13, color: C.paper, letterSpacing: 1 },
  grittyGearBanner: { marginTop: 10, padding: 10, backgroundColor: '#2A211B', borderLeftWidth: 3, borderColor: C.mustard },
  grittyGearText: { fontFamily: type, fontSize: 11, color: C.paperDark },
  grittyGearHighlight: { fontFamily: display, fontSize: 13, color: C.mustard, letterSpacing: 1 },
  grittyCard: { borderWidth: 1, borderColor: '#523D2E', backgroundColor: '#241C16', padding: 10 },
  grittyMetricsBox: { marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#3A2E25', paddingBottom: 8 },
  grittyMetricRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  grittyMetricItem: { flex: 1 },
  grittyMetricLabel: { fontFamily: display, fontSize: 12, color: C.paperDark, letterSpacing: 0.8 },
  grittyMetricValue: { fontFamily: display, fontSize: 18, color: C.paper, letterSpacing: 0.5 },
  grittyLabNote: { fontFamily: type, fontSize: 10, color: C.paperDark, marginTop: 6 },
  grittyFilterNote: { fontFamily: type, fontSize: 10, color: C.paperDark, marginTop: 3 },

  body: { fontFamily: type, fontSize: 13, color: C.ink },
  footer: { fontFamily: type, fontSize: 11, color: C.brown, textAlign: 'center', marginTop: 20 },

  // --- UX UPGRADE 1: COLLAPSIBLE RIG LOCKER BAR ---
  rigLockerBar: {
    marginTop: 12,
    borderWidth: 3,
    borderColor: C.ink,
    backgroundColor: C.paperDark,
    padding: 12,
    gap: 10,
  },
  rigLockerTopRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  rigLockerTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    minWidth: 200,
  },
  rigBadgeIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: C.ink,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: C.mustard,
  },
  rigBadgeIconText: {
    fontFamily: display,
    fontSize: 16,
    color: C.mustard,
  },
  rigLockerTitle: {
    fontFamily: display,
    fontSize: 22,
    color: C.ink,
    letterSpacing: 1.5,
  },
  rigLockerSub: {
    fontFamily: type,
    fontSize: 11,
    color: C.brown,
  },
  rigCollapseBtn: {
    borderWidth: 2,
    borderColor: C.ink,
    backgroundColor: C.mustard,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: 'center',
  },
  rigCollapseBtnText: {
    fontFamily: display,
    fontSize: 15,
    color: C.ink,
    letterSpacing: 1.2,
  },
  rigCollapseBtnSub: {
    fontFamily: type,
    fontSize: 9,
    color: C.ink,
    marginTop: 1,
  },
  rigCardsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  rigSummaryCard: {
    flex: 1,
    minWidth: 140,
    borderWidth: 2,
    borderColor: C.ink,
    backgroundColor: C.paper,
    padding: 8,
  },
  rigCardHeadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  rigCardStep: {
    fontFamily: type,
    fontSize: 9,
    color: C.brown,
    letterSpacing: 0.6,
  },
  rigCardEditTag: {
    fontFamily: display,
    fontSize: 11,
    color: C.orange,
    letterSpacing: 0.6,
  },
  rigCardVal: {
    fontFamily: display,
    fontSize: 20,
    color: C.ink,
    letterSpacing: 1,
    marginTop: 2,
  },
  rigCardSub: {
    fontFamily: type,
    fontSize: 10,
    color: C.brown,
    marginTop: 1,
  },
  lockRigBottomBanner: {
    marginTop: 14,
    borderWidth: 2,
    borderColor: C.ink,
    backgroundColor: C.ink,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: 'center',
  },
  lockRigBottomText: {
    fontFamily: display,
    fontSize: 17,
    color: C.mustard,
    letterSpacing: 1.5,
    textAlign: 'center',
  },
  lockRigBottomSub: {
    fontFamily: type,
    fontSize: 10,
    color: C.paperDark,
    textAlign: 'center',
    marginTop: 3,
  },

  // --- UX UPGRADE 2: DECADE PILLS & CAMERA SEARCH ---
  cameraFilterBar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 10,
    padding: 8,
    backgroundColor: C.paperDark,
    borderWidth: 1.5,
    borderColor: C.ink,
  },
  decadePillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  decadePill: {
    borderWidth: 1.5,
    borderColor: C.ink,
    backgroundColor: C.paper,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  decadePillActive: {
    backgroundColor: C.ink,
  },
  decadePillText: {
    fontFamily: display,
    fontSize: 14,
    color: C.ink,
    letterSpacing: 0.8,
  },
  searchBoxWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: C.ink,
    backgroundColor: C.paper,
    paddingHorizontal: 8,
    minWidth: 180,
    flex: 1,
    maxWidth: 280,
  },
  searchInput: {
    flex: 1,
    fontFamily: type,
    fontSize: 12,
    color: C.ink,
    paddingVertical: 5,
  },
  searchClearBtn: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  searchClearText: {
    fontFamily: display,
    fontSize: 14,
    color: C.brown,
  },

  // --- UX UPGRADE 3: LIVE VIEWFINDER HERO STRIP ---
  viewfinderHeroStrip: {
    backgroundColor: C.ink,
    borderBottomWidth: 3,
    borderColor: C.ink,
    padding: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  viewfinderSceneCol: {
    flex: 1,
    minWidth: 180,
  },
  viewfinderKicker: {
    fontFamily: type,
    fontSize: 10,
    color: C.mustard,
    letterSpacing: 0.8,
  },
  viewfinderSceneTitle: {
    fontFamily: display,
    fontSize: 28,
    color: C.paper,
    letterSpacing: 1.5,
    marginTop: 2,
  },
  viewfinderSceneSub: {
    fontFamily: type,
    fontSize: 11,
    color: C.paperDark,
    marginTop: 2,
  },
  viewfinderDialsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  viewfinderDialBox: {
    backgroundColor: C.teal,
    borderWidth: 2,
    borderColor: C.paper,
    paddingHorizontal: 14,
    paddingVertical: 6,
    alignItems: 'center',
    minWidth: 88,
  },
  viewfinderDialLabel: {
    fontFamily: type,
    fontSize: 9,
    color: C.ink,
    letterSpacing: 0.5,
  },
  viewfinderDialVal: {
    fontFamily: display,
    fontSize: 34,
    lineHeight: 36,
    color: C.paper,
    letterSpacing: 1,
  },
  viewfinderShakePill: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderWidth: 1.5,
    borderColor: C.paper,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewfinderShakeText: {
    fontFamily: display,
    fontSize: 13,
    color: C.paper,
    letterSpacing: 0.8,
  },

  // --- UX UPGRADE 4: QUICK IN-FIELD TWEAKS & 1968 FOLDER TABS ---
  quickTweaksBox: {
    marginTop: 12,
    padding: 10,
    backgroundColor: '#262019',
    borderWidth: 1,
    borderColor: '#4A4035',
    gap: 8,
  },
  quickTweakCol: {
    gap: 4,
  },
  quickTweakLabel: {
    fontFamily: type,
    fontSize: 10,
    color: C.mustard,
    letterSpacing: 0.6,
  },
  quickMiniPill: {
    borderWidth: 1,
    borderColor: '#5A4E40',
    backgroundColor: C.ink,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  quickMiniPillText: {
    fontFamily: display,
    fontSize: 13,
    color: C.paper,
    letterSpacing: 0.8,
  },
  folderTabsWrap: {
    marginTop: 18,
    paddingTop: 14,
    borderTopWidth: 2,
    borderColor: C.mustard,
    gap: 8,
  },
  folderTabsHeaderRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  folderTabsKicker: {
    fontFamily: type,
    fontSize: 10,
    color: C.mustard,
    letterSpacing: 0.6,
  },
  foldTabsCloseBtn: {
    borderWidth: 1,
    borderColor: C.mustard,
    backgroundColor: '#262019',
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  foldTabsCloseText: {
    fontFamily: display,
    fontSize: 12,
    color: C.mustard,
    letterSpacing: 0.8,
  },
  folderTabsBar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  folderTab: {
    flex: 1,
    minWidth: 115,
    borderWidth: 1.5,
    borderColor: C.paperDark,
    backgroundColor: '#262019',
    paddingVertical: 7,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  folderTabActive: {
    backgroundColor: C.mustard,
    borderColor: C.paper,
  },
  folderTabTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  folderTabTitle: {
    fontFamily: display,
    fontSize: 15,
    color: C.paper,
    letterSpacing: 1,
  },
  folderTabSub: {
    fontFamily: type,
    fontSize: 9,
    color: C.paperDark,
    marginTop: 1,
  },

  // --- FOLDABLE FINE-TUNING DRAWERS ---
  foldableDrawerHeader: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  foldableHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    minWidth: 200,
  },
  foldableHeaderTitle: {
    fontFamily: display,
    fontSize: 16,
    color: C.ink,
    letterSpacing: 1,
  },
  foldableHeaderSub: {
    fontFamily: type,
    fontSize: 10,
    color: C.brown,
    marginTop: 1,
  },
  foldableToggleBadge: {
    borderWidth: 1.5,
    borderColor: C.ink,
    backgroundColor: C.mustard,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  foldableToggleBadgeText: {
    fontFamily: display,
    fontSize: 13,
    color: C.ink,
    letterSpacing: 0.8,
  },
  foldableDrawerBody: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1.5,
    borderColor: C.ink,
  },
  darkFoldableHeader: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  darkFoldableSub: {
    fontFamily: type,
    fontSize: 10,
    color: C.paperDark,
    marginTop: 2,
  },
  darkFoldableToggleText: {
    fontFamily: display,
    fontSize: 13,
    color: C.mustard,
    letterSpacing: 0.8,
    borderWidth: 1,
    borderColor: C.mustard,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: C.ink,
  },

  // --- 35MM RECIPROCITY FAILURE & BULB GUIDE ---
  reciprocityBanner: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#231C16',
    borderWidth: 1.5,
    borderColor: C.mustard,
    gap: 6,
  },
  reciprocityHeadRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
  },
  reciprocityBadge: {
    backgroundColor: C.mustard,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: C.paper,
  },
  reciprocityBadgeText: {
    fontFamily: display,
    fontSize: 13,
    color: C.ink,
    letterSpacing: 1,
  },
  reciprocitySubText: {
    fontFamily: type,
    fontSize: 11,
    color: C.paper,
    flex: 1,
    minWidth: 200,
  },
  reciprocityCallout: {
    fontFamily: type,
    fontSize: 12,
    color: C.paper,
  },
  bulbTableRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 2,
  },
  bulbChip: {
    borderWidth: 1,
    borderColor: '#5A4E40',
    backgroundColor: C.ink,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignItems: 'center',
  },
  bulbMeteredText: {
    fontFamily: type,
    fontSize: 9,
    color: C.paperDark,
  },
  bulbCorrectedText: {
    fontFamily: display,
    fontSize: 15,
    color: C.mustard,
    letterSpacing: 0.8,
  },

  // --- STACKABLE LENS FILTERS ---
  filterStackSubBox: {
    marginTop: 8,
    padding: 10,
    backgroundColor: '#1E1914',
    borderWidth: 1.5,
    borderColor: C.mustard,
    borderLeftWidth: 4,
    gap: 6,
  },
  filterStackHeaderRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  filterStackTitle: {
    fontFamily: display,
    fontSize: 15,
    color: C.mustard,
    letterSpacing: 1,
  },
  filterStackHint: {
    fontFamily: type,
    fontSize: 10,
    color: C.paperDark,
    marginTop: 2,
  },
  filterStackActionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
  },
  clearStackBtn: {
    borderWidth: 1,
    borderColor: C.mustard,
    backgroundColor: C.ink,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  clearStackBtnText: {
    fontFamily: display,
    fontSize: 12,
    color: C.mustard,
    letterSpacing: 0.8,
  },
  stackOptionPill: {
    borderWidth: 1,
    borderColor: '#5A4E40',
    backgroundColor: C.ink,
    paddingHorizontal: 9,
    paddingVertical: 5,
    alignItems: 'flex-start',
  },
  stackOptionTitle: {
    fontFamily: display,
    fontSize: 14,
    color: C.paper,
    letterSpacing: 0.8,
  },
  stackOptionSub: {
    fontFamily: type,
    fontSize: 9,
    color: C.mustard,
    marginTop: 1,
  },
  activeStackChainBox: {
    marginTop: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderColor: '#4A4035',
    gap: 6,
  },
  activeStackChainRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
  },
  activeStackChainLabel: {
    fontFamily: display,
    fontSize: 13,
    color: C.paperDark,
    letterSpacing: 0.8,
  },
  ringBadge: {
    borderWidth: 1,
    borderColor: C.paper,
    backgroundColor: '#3A3127',
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  ringBadgeText: {
    fontFamily: display,
    fontSize: 13,
    color: C.paper,
    letterSpacing: 0.6,
  },
  ringArrowText: {
    fontFamily: display,
    fontSize: 15,
    color: C.mustard,
  },
  activeStackEffectText: {
    fontFamily: type,
    fontSize: 11,
    color: C.paper,
  },
  cardStackToggleBtn: {
    borderWidth: 1,
    borderColor: C.mustard,
    backgroundColor: C.ink,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  cardStackToggleText: {
    fontFamily: display,
    fontSize: 12,
    color: C.mustard,
    letterSpacing: 0.6,
  },
  cardInlineStackBox: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1.5,
    borderColor: C.mustard,
    gap: 6,
  },
  filterBtnTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  filterBtnDot: {
    width: 11,
    height: 11,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: C.paper,
  },

  // --- SEO SEMANTIC H1 SUBTITLE & COLLAPSIBLE FIELD GUIDE / FAQ ---
  h1Sub: {
    fontFamily: display,
    fontSize: 16,
    lineHeight: 20,
    color: C.brown,
    letterSpacing: 2,
  },
  seoGuideSection: {
    marginTop: 20,
    borderWidth: 2,
    borderColor: C.ink,
    backgroundColor: C.paperDark,
    padding: 12,
  },
  seoGuideHeader: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  seoGuideTitle: {
    fontFamily: display,
    fontSize: 20,
    color: C.ink,
    letterSpacing: 1.5,
  },
  seoGuideSub: {
    fontFamily: type,
    fontSize: 11,
    color: C.brown,
    marginTop: 2,
  },
  seoGuideBody: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1.5,
    borderColor: C.ink,
    gap: 12,
  },
  seoGuideBodyCollapsed: {
    maxHeight: 0,
    overflow: 'hidden',
    marginTop: 0,
    paddingTop: 0,
    borderTopWidth: 0,
    opacity: 0,
  },
  seoColumnsRow: {
    gap: 12,
    justifyContent: 'space-between',
  },
  seoCard: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: C.ink,
    backgroundColor: C.paper,
    padding: 12,
    gap: 6,
  },
  seoCardTitle: {
    fontFamily: display,
    fontSize: 17,
    color: C.ink,
    letterSpacing: 1,
  },
  seoCardText: {
    fontFamily: type,
    fontSize: 11,
    lineHeight: 17,
    color: C.ink,
  },
  seoFaqWrap: {
    borderTopWidth: 1.5,
    borderColor: C.ink,
    paddingTop: 10,
    gap: 8,
  },
  seoFaqHeading: {
    fontFamily: display,
    fontSize: 18,
    color: C.ink,
    letterSpacing: 1.2,
  },
  seoFaqItem: {
    borderWidth: 1.5,
    borderColor: C.ink,
    backgroundColor: C.paper,
    padding: 10,
    gap: 4,
  },
  seoFaqQ: {
    fontFamily: display,
    fontSize: 16,
    color: C.orange,
    letterSpacing: 0.8,
  },
  seoFaqA: {
    fontFamily: type,
    fontSize: 11,
    lineHeight: 16,
    color: C.ink,
  },
});
