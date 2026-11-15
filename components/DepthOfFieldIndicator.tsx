import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Camera, Lens } from '../data/types';
import { calculateDof, formatAperture, formatShutter, Setting } from '../lib/exposure';

const C = {
  paper: '#F3EAD3',
  paperDark: '#E6D9B8',
  ink: '#1E1A16',
  teal: '#3E8E8B',
  orange: '#D9622B',
  mustard: '#E3A82B',
  brown: '#7A4E2D',
  grass: '#5E8C5A',
  skyTop: '#C9DFDC',
  skyBottom: '#EFE6CE',
};

const display = 'BebasNeue_400Regular';
const type = 'SpecialElite_400Regular';

export const PRESET_DISTANCES = [
  { label: '0.7m', role: 'CLOSE', m: 0.7, targetAperture: 2 },
  { label: '1.2m', role: 'HEADSHOT', m: 1.2, targetAperture: 2.8 },
  { label: '2.0m', role: 'HALF BODY', m: 2.0, targetAperture: 4 },
  { label: '3.0m', role: 'STREET', m: 3.0, targetAperture: 8 },
  { label: '5.0m', role: 'GROUP', m: 5.0, targetAperture: 11 },
  { label: '10m', role: 'VISTA', m: 10.0, targetAperture: 16 },
];

function formatDist(m: number): string {
  if (!Number.isFinite(m)) return '∞';
  if (m < 1) return `${Math.round(m * 100)}cm`;
  if (m < 10) return `${m.toFixed(2)}m`;
  return `${m.toFixed(1)}m`;
}

/** Vintage silhouette of the photographer at 0m holding the camera to the eye. */
function PhotographerSilhouette() {
  return (
    <View style={styles.photographerWrap} pointerEvents="none">
      {/* Head */}
      <View style={styles.photoHead} />
      {/* Raised arms + camera box */}
      <View style={styles.photoCameraBox} />
      <View style={styles.photoLensCone} />
      {/* Torso */}
      <View style={styles.photoTorso} />
      {/* Legs */}
      <View style={styles.photoLegsRow}>
        <View style={styles.photoLeg} />
        <View style={styles.photoLeg} />
      </View>
      {/* Red 0m reference line through photographer */}
      <View style={styles.photoCenterLine} />
    </View>
  );
}

/** Vintage silhouette of the subject standing at the focus plane. */
function SubjectSilhouette() {
  return (
    <View style={styles.subjectWrap} pointerEvents="none">
      {/* Head & hair silhouette */}
      <View style={styles.subjHead} />
      {/* Shoulders / arms pose */}
      <View style={styles.subjShoulders} />
      {/* Waist / dress silhouette */}
      <View style={styles.subjSkirt} />
      {/* Legs */}
      <View style={styles.subjLegsRow}>
        <View style={styles.subjLeg} />
        <View style={styles.subjLeg} />
      </View>
      {/* Red vertical focus plane line */}
      <View style={styles.subjFocusLine} />
    </View>
  );
}

/** Magnifying glass icon (+ inside circle with handle) for the sharp DOF zone. */
function MagnifierIcon() {
  return (
    <View style={styles.magWrap} pointerEvents="none">
      <View style={styles.magCircle}>
        <View style={styles.magPlusH} />
        <View style={styles.magPlusV} />
      </View>
      <View style={styles.magHandle} />
    </View>
  );
}

export default function DepthOfFieldIndicator({
  camera,
  lens,
  selectedAperture,
  hasApertureLock,
  distanceM,
  isHyperfocalMode,
  allExposurePairs,
  onSelectAperture,
  onSelectDistance,
  onSelectHyperfocal,
}: {
  camera: Camera;
  lens: Lens;
  selectedAperture: number;
  hasApertureLock: boolean;
  distanceM: number;
  isHyperfocalMode: boolean;
  allExposurePairs: Setting[];
  onSelectAperture: (aperture: number | undefined) => void;
  onSelectDistance: (distanceM: number, targetAperture: number) => void;
  onSelectHyperfocal: (targetAperture: number) => void;
}) {
  const sortedValidPairs = [...allExposurePairs].sort((a, b) => a.aperture - b.aperture);
  const widestValidAp = sortedValidPairs[0]?.aperture;
  const narrowestValidAp = sortedValidPairs[sortedValidPairs.length - 1]?.aperture;
  const fastestCameraShutter = Math.min(...camera.shutterSpeeds);

  const resolveValidPair = (targetAp: number): Setting | undefined => {
    if (sortedValidPairs.length === 0) return undefined;
    return [...sortedValidPairs].sort(
      (a, b) =>
        Math.abs(Math.log2(a.aperture / targetAp)) - Math.abs(Math.log2(b.aperture / targetAp)) ||
        Math.abs(a.errorStops) - Math.abs(b.errorStops),
    )[0];
  };

  // Ensure the active aperture is always one of the apertures possible in this light condition
  const activePair =
    sortedValidPairs.find((p) => p.aperture === selectedAperture) ??
    resolveValidPair(selectedAperture);
  const effectiveAperture = activePair?.aperture ?? selectedAperture;
  const hyperfocalPair = resolveValidPair(11);
  const hyperfocalTargetAp = hyperfocalPair?.aperture ?? effectiveAperture;

  // Compute hyperfocal first so Hyperfocal mode can lock onto it
  const baseDof = calculateDof(camera, lens, effectiveAperture, distanceM);
  const effectiveDistanceM = isHyperfocalMode
    ? Number(Math.max(0.5, baseDof.hyperfocalM).toFixed(2))
    : distanceM;
  const dof = calculateDof(camera, lens, effectiveAperture, effectiveDistanceM);

  // Determine ruler max scale in meters (like the 0..5..10..12m ruler in the concept screenshot)
  const rawMax =
    effectiveDistanceM <= 3.5
      ? 12
      : effectiveDistanceM <= 6
      ? 16
      : Math.ceil((effectiveDistanceM * 2.2) / 5) * 5;
  const maxRulerM = Math.max(10, Math.min(60, rawMax));

  const toPct = (m: number) => {
    if (!Number.isFinite(m)) return 100;
    return Math.max(0, Math.min(100, (m / maxRulerM) * 100));
  };

  const nearPct = toPct(dof.nearLimitM);
  const farPct = toPct(dof.farLimitM);
  const subjPct = toPct(effectiveDistanceM);
  const dofWidthPct = Math.max(1.5, farPct - nearPct);

  // Generate ruler ticks
  const majorStep = maxRulerM <= 15 ? 5 : maxRulerM <= 30 ? 5 : 10;
  const minorStep = maxRulerM <= 16 ? 1 : 2;
  const ticks: { m: number; major: boolean; half: boolean }[] = [];
  for (let m = 0; m <= maxRulerM; m += minorStep / 2) {
    const rounded = Number(m.toFixed(1));
    const isMajor = rounded % majorStep === 0;
    const isUnit = rounded % minorStep === 0;
    ticks.push({ m: rounded, major: isMajor, half: !isUnit });
  }

  // Bokeh circle preview diameter in px (6px = pin-sharp, up to 34px = ultra-creamy bokeh)
  const bokehCirclePx = Number.isFinite(dof.farLimitM)
    ? Math.max(8, Math.min(34, Math.round(6 + dof.bokehRatio * 2.2)))
    : 6;

  const unavailableLensStops = lens.apertures.filter(
    (ap) => !sortedValidPairs.some((p) => p.aperture === ap),
  );

  return (
    <View style={styles.container} nativeID="dof-indicator">
      {/* Section Header */}
      <View style={styles.headerRow}>
        <View style={styles.titleRow}>
          <View style={styles.compassBadge}>
            <Text style={styles.compassText}>⊕</Text>
          </View>
          <Text style={styles.sectionTitle}>DEPTH OF FIELD & BOKEH VISUALIZER</Text>
        </View>
        <View style={styles.lensBadge}>
          <Text style={styles.lensBadgeText}>
            {lens.focalLength}mm · {formatAperture(effectiveAperture)}
            {activePair ? ` · ${formatShutter(activePair.shutter)}` : ''}
          </Text>
        </View>
      </View>

      {/* Top Optical Readout Bar (modeled after screenshot header) */}
      <View style={styles.opticalBar}>
        <Text style={styles.opticalItem}>
          Circle of confusion:{' '}
          <Text style={styles.opticalBold}>
            {dof.cocMm.toFixed(4)}mm ({camera.format})
          </Text>
        </Text>
        <Text style={styles.opticalItem}>
          In front of subject:{' '}
          <Text style={[styles.opticalBold, { color: C.teal }]}>
            {formatDist(dof.inFrontM)} ({dof.inFrontPct.toFixed(1)}%)
          </Text>
        </Text>
        <Text style={styles.opticalItem}>
          Behind subject:{' '}
          <Text style={[styles.opticalBold, { color: C.orange }]}>
            {formatDist(dof.behindM)} ({dof.behindPct.toFixed(1)}%)
          </Text>
        </Text>
      </View>

      {/* Interactive Controls: Subject Distance & Aperture Stop */}
      <View style={styles.controlsWrap}>
        <View style={styles.controlGroup}>
          <Text style={styles.controlLabel}>
            SUBJECT FOCUS DISTANCE (CONDITIONED BY LIGHT — TAP TO UPDATE EXPOSURE & DOF):
          </Text>
          <View style={styles.pillRow}>
            {PRESET_DISTANCES.map((d) => {
              const active = !isHyperfocalMode && Math.abs(distanceM - d.m) < 0.05;
              const validPairForDist = resolveValidPair(d.targetAperture);
              const resolvedAp = validPairForDist?.aperture ?? d.targetAperture;
              return (
                <Pressable
                  key={d.label}
                  nativeID={`dof-dist-${d.m}`}
                  onPress={() => onSelectDistance(d.m, resolvedAp)}
                  style={[styles.distPill, active && styles.distPillActive]}
                >
                  <Text style={[styles.distPillText, active && { color: C.ink }]}>{d.label}</Text>
                  <Text style={[styles.distPillSub, active && { color: C.brown }]}>
                    {d.role} · {formatAperture(resolvedAp)}
                  </Text>
                  {validPairForDist && (
                    <Text style={[styles.distPillShutter, active && { color: C.ink }]}>
                      {formatShutter(validPairForDist.shutter)}
                    </Text>
                  )}
                </Pressable>
              );
            })}
            <Pressable
              nativeID="dof-dist-hyperfocal"
              onPress={() => onSelectHyperfocal(hyperfocalTargetAp)}
              style={[styles.distPill, isHyperfocalMode && styles.distPillHyperfocal]}
            >
              <Text style={[styles.distPillText, isHyperfocalMode && { color: C.paper }]}>
                H = {formatDist(baseDof.hyperfocalM)}
              </Text>
              <Text style={[styles.distPillSub, isHyperfocalMode && { color: C.paperDark }]}>
                HYPERFOCAL · {formatAperture(hyperfocalTargetAp)}
              </Text>
              {hyperfocalPair && (
                <Text style={[styles.distPillShutter, isHyperfocalMode && { color: C.paper }]}>
                  {formatShutter(hyperfocalPair.shutter)}
                </Text>
              )}
            </Pressable>
          </View>
        </View>

        <View style={[styles.controlGroup, { marginTop: 8 }]}>
          <Text style={styles.controlLabel}>
            APERTURES POSSIBLE IN THIS LIGHT (UNAVAILABLE LENS STOPS ARE LOCKED OUT):
          </Text>
          <View style={styles.pillRow}>
            <Pressable
              nativeID="dof-ap-auto"
              onPress={() => onSelectAperture(undefined)}
              style={[styles.apPill, !hasApertureLock && styles.apPillActive]}
            >
              <Text style={[styles.apPillText, !hasApertureLock && { color: C.ink }]}>AUTO</Text>
              <Text style={[styles.apPillSub, !hasApertureLock && { color: C.brown }]}>1/ISO</Text>
            </Pressable>
            {lens.apertures.map((ap) => {
              const pair = sortedValidPairs.find((p) => p.aperture === ap);
              const isPossible = pair !== undefined;
              const isSelected = isPossible && ap === effectiveAperture;
              const limitLabel =
                widestValidAp !== undefined && ap < widestValidAp
                  ? `>${formatShutter(fastestCameraShutter)}`
                  : 'OUT EV';
              return (
                <Pressable
                  key={ap}
                  nativeID={`dof-ap-${ap}`}
                  disabled={!isPossible}
                  onPress={() => {
                    if (isPossible) onSelectAperture(ap);
                  }}
                  style={[
                    styles.apPill,
                    !isPossible && styles.apPillDisabled,
                    isSelected && hasApertureLock && styles.apPillActive,
                    isSelected && !hasApertureLock && { borderColor: C.mustard, borderWidth: 1.5 },
                  ]}
                >
                  <Text
                    style={[
                      styles.apPillText,
                      !isPossible && styles.apPillTextDisabled,
                      isSelected && hasApertureLock && { color: C.ink },
                    ]}
                  >
                    {formatAperture(ap)}
                  </Text>
                  <Text
                    style={[
                      styles.apPillSub,
                      !isPossible && styles.apPillSubDisabled,
                      isSelected && hasApertureLock && { color: C.brown },
                    ]}
                  >
                    {pair ? formatShutter(pair.shutter) : limitLabel}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          {unavailableLensStops.length > 0 && widestValidAp !== undefined && narrowestValidAp !== undefined && (
            <Text style={styles.lightLimitNote}>
              Light limit: Only{' '}
              <Text style={{ color: C.mustard }}>
                {widestValidAp === narrowestValidAp
                  ? formatAperture(widestValidAp)
                  : `${formatAperture(widestValidAp)} – ${formatAperture(narrowestValidAp)}`}
              </Text>{' '}
              can be properly exposed in this light with your camera shutter range (max{' '}
              {formatShutter(fastestCameraShutter)}). Wider stops ({unavailableLensStops.map(formatAperture).join(', ')}) are locked out to prevent overexposure — add a Yellow/Red filter or lower ISO to use wider bokeh stops.
            </Text>
          )}
        </View>
      </View>

      {/* VISUAL INDICATOR 1: Side-Profile Depth of Field Scene Diagram */}
      <View style={styles.diagramFrame}>
        {/* Sky & Ground Backdrop */}
        <View style={styles.skyBand} />
        <View style={styles.skyHorizonBand} />
        <View style={styles.groundBand} />

        {/* Shaded Depth of Field Sharp Zone */}
        <View
          style={[
            styles.dofZoneBox,
            {
              left: `${nearPct}%`,
              width: `${dofWidthPct}%`,
            },
          ]}
        >
          <View style={styles.magRow}>
            <MagnifierIcon />
            <Text style={styles.dofZoneBadgeText}>
              SHARP ZONE · {Number.isFinite(dof.totalDofM) ? formatDist(dof.totalDofM) : '∞ HYPERFOCAL'}
            </Text>
          </View>
        </View>

        {/* Near Limit Line (Teal/Blue like screenshot) */}
        <View style={[styles.nearLine, { left: `${nearPct}%` }]}>
          <View style={styles.nearFlag}>
            <Text style={styles.flagText}>NEAR {formatDist(dof.nearLimitM)}</Text>
          </View>
        </View>

        {/* Far Limit Line (Orange like screenshot) */}
        {Number.isFinite(dof.farLimitM) && dof.farLimitM <= maxRulerM ? (
          <View style={[styles.farLine, { left: `${farPct}%` }]}>
            <View style={styles.farFlag}>
              <Text style={styles.flagText}>FAR {formatDist(dof.farLimitM)}</Text>
            </View>
          </View>
        ) : (
          <View style={styles.infinityBanner}>
            <Text style={styles.infinityBannerText}>
              FAR: {Number.isFinite(dof.farLimitM) ? formatDist(dof.farLimitM) : '∞ SHARP TO INFINITY'} →
            </Text>
          </View>
        )}

        {/* Photographer at 0m */}
        <View style={styles.photographerPos}>
          <PhotographerSilhouette />
        </View>

        {/* Subject at Focus Distance */}
        <View style={[styles.subjectPos, { left: `${subjPct}%` }]}>
          <View style={styles.subjFlag}>
            <Text style={styles.subjFlagText}>FOCUS {formatDist(effectiveDistanceM)}</Text>
          </View>
          <SubjectSilhouette />
        </View>

        {/* Calibrated Distance Ruler along bottom */}
        <View style={styles.rulerBar}>
          {ticks.map((t) => {
            const leftPct = (t.m / maxRulerM) * 100;
            return (
              <View
                key={t.m}
                style={[
                  styles.tickWrap,
                  { left: `${leftPct}%` },
                ]}
              >
                <View
                  style={[
                    styles.tickLine,
                    t.major
                      ? styles.tickMajor
                      : t.half
                      ? styles.tickHalf
                      : styles.tickMinor,
                  ]}
                />
                {t.major && (
                  <Text style={styles.tickLabel}>{t.m === 0 ? '0' : `${t.m}m`}</Text>
                )}
              </View>
            );
          })}
        </View>
      </View>

      {/* VISUAL INDICATOR 2: Front/Behind DOF Split Bar & Bokeh Disc Gauge */}
      <View style={styles.secondaryRow}>
        {/* Front vs Behind Subject Split Bar */}
        <View style={styles.splitCard}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>DOF DISTRIBUTION AROUND SUBJECT</Text>
            <Text style={styles.cardSub}>
              TOTAL DOF: {Number.isFinite(dof.totalDofM) ? formatDist(dof.totalDofM) : '∞ (INFINITE)'}
            </Text>
          </View>
          <View style={styles.splitBarTrack}>
            <View
              style={[
                styles.splitFrontFill,
                { flex: Math.max(5, dof.inFrontPct) },
              ]}
            >
              <Text style={styles.splitBarText} numberOfLines={1}>
                FRONT {dof.inFrontPct.toFixed(0)}% ({formatDist(dof.inFrontM)})
              </Text>
            </View>
            <View style={styles.splitSubjectPin}>
              <Text style={styles.splitPinText}>♦</Text>
            </View>
            <View
              style={[
                styles.splitBehindFill,
                { flex: Math.max(5, dof.behindPct) },
              ]}
            >
              <Text style={styles.splitBarText} numberOfLines={1}>
                BEHIND {dof.behindPct.toFixed(0)}% ({formatDist(dof.behindM)})
              </Text>
            </View>
          </View>
          <View style={styles.metricsFooterRow}>
            <Text style={styles.metricSmall}>
              NEAR LIMIT: <Text style={styles.metricSmallVal}>{formatDist(dof.nearLimitM)}</Text>
            </Text>
            <Text style={styles.metricSmall}>
              SUBJECT: <Text style={styles.metricSmallVal}>{formatDist(effectiveDistanceM)}</Text>
            </Text>
            <Text style={styles.metricSmall}>
              FAR LIMIT: <Text style={styles.metricSmallVal}>{formatDist(dof.farLimitM)}</Text>
            </Text>
            <Text style={styles.metricSmall}>
              HYPERFOCAL: <Text style={styles.metricSmallVal}>{formatDist(dof.hyperfocalM)}</Text>
            </Text>
          </View>
        </View>

        {/* Bokeh Blur Disc Indicator */}
        <View style={styles.bokehCard}>
          <Text style={styles.cardTitle}>BACKGROUND BOKEH DISC</Text>
          <View style={styles.bokehVisualRow}>
            <View style={styles.bokehPreviewBox}>
              <View
                style={[
                  styles.bokehCircle,
                  {
                    width: bokehCirclePx,
                    height: bokehCirclePx,
                    borderRadius: bokehCirclePx / 2,
                    opacity: Number.isFinite(dof.farLimitM) ? 0.85 : 1,
                  },
                ]}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.bokehGradeText}>{dof.bokehLabel}</Text>
              <Text style={styles.bokehDetailText}>
                Infinity blur disc: {dof.infinityBlurMm.toFixed(2)}mm ({dof.bokehRatio.toFixed(1)}× CoC)
              </Text>
              <Text style={styles.bokehDetailText}>
                {dof.bokehRatio >= 6
                  ? 'Strong subject separation & soft background rendering.'
                  : Number.isFinite(dof.farLimitM)
                  ? 'Moderate background softness; recognizable environment.'
                  : 'Everything from near limit to infinity is in crisp focus.'}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* VISUAL INDICATOR 3: Vintage Engraved Lens Barrel DOF Scale */}
      <View style={styles.barrelCard}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardTitle}>ENGRAVED LENS BARREL DOF SCALE (1968 STYLE)</Text>
          <Text style={styles.cardSub}>
            ZONE BRACKET AT {formatAperture(effectiveAperture)}: [{formatDist(dof.nearLimitM)} — ♦ {formatDist(effectiveDistanceM)} — {formatDist(dof.farLimitM)}]
          </Text>
        </View>
        <View style={styles.barrelScaleWrap}>
          {/* Distance Ring */}
          <View style={styles.barrelDistanceRow}>
            <Text style={styles.barrelNearText}>{formatDist(dof.nearLimitM)}</Text>
            <View style={styles.barrelBracketLine} />
            <View style={styles.barrelCenterFocusBadge}>
              <Text style={styles.barrelCenterFocusText}>{formatDist(effectiveDistanceM)}</Text>
            </View>
            <View style={[styles.barrelBracketLine, { backgroundColor: C.orange }]} />
            <Text style={styles.barrelFarText}>{formatDist(dof.farLimitM)}</Text>
          </View>
          {/* Aperture Index Marks (only stops possible in this light are highlighted) */}
          <View style={styles.barrelApertureRow}>
            {[...lens.apertures].reverse().map((stop) => {
              const possible = sortedValidPairs.some((p) => p.aperture === stop);
              const active = stop === effectiveAperture;
              return (
                <Text
                  key={`L-${stop}`}
                  style={[
                    styles.barrelStopMark,
                    !possible && { opacity: 0.25 },
                    active && styles.barrelStopMarkActiveTeal,
                  ]}
                >
                  {stop}
                </Text>
              );
            })}
            <Text style={styles.barrelDiamond}>♦</Text>
            {lens.apertures.map((stop) => {
              const possible = sortedValidPairs.some((p) => p.aperture === stop);
              const active = stop === effectiveAperture;
              return (
                <Text
                  key={`R-${stop}`}
                  style={[
                    styles.barrelStopMark,
                    !possible && { opacity: 0.25 },
                    active && styles.barrelStopMarkActiveOrange,
                  ]}
                >
                  {stop}
                </Text>
              );
            })}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 18,
    paddingTop: 14,
    borderTopWidth: 2,
    borderColor: C.teal,
  },
  headerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  compassBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: C.teal,
    borderWidth: 1,
    borderColor: C.paper,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compassText: {
    fontFamily: display,
    fontSize: 16,
    color: C.paper,
    lineHeight: 18,
  },
  sectionTitle: {
    fontFamily: display,
    fontSize: 22,
    color: C.mustard,
    letterSpacing: 2,
  },
  lensBadge: {
    backgroundColor: C.teal,
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: C.paper,
  },
  lensBadgeText: {
    fontFamily: display,
    fontSize: 15,
    color: C.ink,
    letterSpacing: 1,
  },

  opticalBar: {
    marginTop: 8,
    backgroundColor: C.paper,
    borderWidth: 2,
    borderColor: C.ink,
    paddingVertical: 6,
    paddingHorizontal: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
  },
  opticalItem: {
    fontFamily: type,
    fontSize: 11,
    color: C.ink,
  },
  opticalBold: {
    fontFamily: display,
    fontSize: 14,
    color: C.ink,
    letterSpacing: 0.5,
  },

  controlsWrap: {
    marginTop: 10,
    backgroundColor: '#262019',
    borderWidth: 1,
    borderColor: '#4A4035',
    padding: 10,
  },
  controlGroup: {},
  controlLabel: {
    fontFamily: type,
    fontSize: 10,
    color: C.paperDark,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  distPill: {
    borderWidth: 1,
    borderColor: C.paperDark,
    backgroundColor: C.ink,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignItems: 'center',
    minWidth: 58,
  },
  distPillActive: {
    backgroundColor: C.mustard,
    borderColor: C.paper,
  },
  distPillHyperfocal: {
    backgroundColor: C.teal,
    borderColor: C.paper,
  },
  distPillText: {
    fontFamily: display,
    fontSize: 15,
    color: C.paper,
    letterSpacing: 0.5,
  },
  distPillSub: {
    fontFamily: type,
    fontSize: 8,
    color: C.paperDark,
  },
  distPillShutter: {
    fontFamily: type,
    fontSize: 8,
    color: C.mustard,
    marginTop: 1,
  },
  apPill: {
    borderWidth: 1,
    borderColor: '#5A4E40',
    backgroundColor: C.ink,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignItems: 'center',
    minWidth: 52,
  },
  apPillActive: {
    backgroundColor: C.paper,
    borderColor: C.mustard,
  },
  apPillDisabled: {
    backgroundColor: '#191512',
    borderColor: '#362E25',
    borderStyle: 'dashed',
    opacity: 0.42,
  },
  apPillText: {
    fontFamily: display,
    fontSize: 15,
    color: C.paper,
  },
  apPillTextDisabled: {
    color: '#7A6E5D',
    textDecorationLine: 'line-through',
  },
  apPillSub: {
    fontFamily: type,
    fontSize: 8,
    color: C.mustard,
  },
  apPillSubDisabled: {
    color: '#7A6E5D',
  },
  lightLimitNote: {
    fontFamily: type,
    fontSize: 10,
    color: C.paperDark,
    marginTop: 6,
    lineHeight: 14,
  },

  diagramFrame: {
    marginTop: 10,
    height: 178,
    borderWidth: 2,
    borderColor: C.paper,
    backgroundColor: C.skyBottom,
    overflow: 'hidden',
    position: 'relative',
  },
  skyBand: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 62,
    backgroundColor: C.skyTop,
  },
  skyHorizonBand: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 62,
    height: 54,
    backgroundColor: C.skyBottom,
  },
  groundBand: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 116,
    height: 34,
    backgroundColor: C.grass,
    borderTopWidth: 2,
    borderColor: C.ink,
  },

  dofZoneBox: {
    position: 'absolute',
    top: 0,
    height: 150,
    backgroundColor: 'rgba(30, 26, 22, 0.22)',
  },
  magRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 6,
    paddingVertical: 5,
  },
  dofZoneBadgeText: {
    fontFamily: display,
    fontSize: 13,
    color: C.ink,
    letterSpacing: 0.8,
  },

  nearLine: {
    position: 'absolute',
    top: 0,
    height: 150,
    width: 2,
    backgroundColor: C.teal,
    zIndex: 4,
  },
  nearFlag: {
    position: 'absolute',
    bottom: 36,
    left: 3,
    backgroundColor: C.teal,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderWidth: 1,
    borderColor: C.ink,
  },
  farLine: {
    position: 'absolute',
    top: 0,
    height: 150,
    width: 2,
    backgroundColor: C.orange,
    zIndex: 4,
  },
  farFlag: {
    position: 'absolute',
    bottom: 36,
    right: 3,
    backgroundColor: C.orange,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderWidth: 1,
    borderColor: C.ink,
  },
  flagText: {
    fontFamily: display,
    fontSize: 11,
    color: C.paper,
    letterSpacing: 0.5,
  },
  infinityBanner: {
    position: 'absolute',
    right: 6,
    top: 6,
    backgroundColor: C.orange,
    borderWidth: 1,
    borderColor: C.ink,
    paddingHorizontal: 7,
    paddingVertical: 2,
    zIndex: 5,
  },
  infinityBannerText: {
    fontFamily: display,
    fontSize: 12,
    color: C.paper,
    letterSpacing: 0.8,
  },

  photographerPos: {
    position: 'absolute',
    left: 6,
    top: 30,
    height: 120,
    width: 34,
    zIndex: 5,
  },
  photographerWrap: {
    width: 32,
    height: 120,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  photoHead: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: C.ink,
    marginBottom: 2,
  },
  photoCameraBox: {
    position: 'absolute',
    top: 10,
    right: 1,
    width: 10,
    height: 8,
    backgroundColor: C.ink,
  },
  photoLensCone: {
    position: 'absolute',
    top: 12,
    right: -4,
    width: 6,
    height: 4,
    backgroundColor: C.brown,
  },
  photoTorso: {
    width: 18,
    height: 44,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    backgroundColor: C.ink,
  },
  photoLegsRow: {
    flexDirection: 'row',
    gap: 3,
  },
  photoLeg: {
    width: 7,
    height: 44,
    backgroundColor: C.ink,
  },
  photoCenterLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1.5,
    backgroundColor: C.orange,
  },

  subjectPos: {
    position: 'absolute',
    top: 22,
    height: 128,
    width: 36,
    marginLeft: -18,
    alignItems: 'center',
    zIndex: 6,
  },
  subjFlag: {
    backgroundColor: C.ink,
    borderWidth: 1,
    borderColor: C.mustard,
    paddingHorizontal: 5,
    paddingVertical: 1,
    marginBottom: 2,
  },
  subjFlagText: {
    fontFamily: display,
    fontSize: 11,
    color: C.mustard,
    letterSpacing: 0.5,
  },
  subjectWrap: {
    width: 30,
    height: 106,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  subjHead: {
    width: 13,
    height: 15,
    borderRadius: 7,
    backgroundColor: C.ink,
    marginBottom: 1,
  },
  subjShoulders: {
    width: 22,
    height: 24,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    backgroundColor: C.ink,
  },
  subjSkirt: {
    width: 20,
    height: 26,
    backgroundColor: C.ink,
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
  },
  subjLegsRow: {
    flexDirection: 'row',
    gap: 3,
  },
  subjLeg: {
    width: 5,
    height: 36,
    backgroundColor: C.ink,
  },
  subjFocusLine: {
    position: 'absolute',
    top: -6,
    bottom: 0,
    width: 2,
    backgroundColor: C.orange,
  },

  magWrap: {
    width: 22,
    height: 22,
    position: 'relative',
  },
  magCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2.5,
    borderColor: C.ink,
    backgroundColor: 'rgba(243, 234, 211, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  magPlusH: {
    position: 'absolute',
    width: 8,
    height: 2,
    backgroundColor: C.ink,
  },
  magPlusV: {
    position: 'absolute',
    width: 2,
    height: 8,
    backgroundColor: C.ink,
  },
  magHandle: {
    position: 'absolute',
    bottom: 1,
    right: 1,
    width: 8,
    height: 3,
    backgroundColor: C.ink,
    transform: [{ rotate: '45deg' }],
  },

  rulerBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 28,
    backgroundColor: C.paper,
    borderTopWidth: 2,
    borderColor: C.ink,
  },
  tickWrap: {
    position: 'absolute',
    top: 0,
    alignItems: 'center',
    transform: [{ translateX: -1 }],
  },
  tickLine: {
    backgroundColor: C.ink,
  },
  tickMajor: {
    width: 2,
    height: 11,
  },
  tickMinor: {
    width: 1.5,
    height: 7,
  },
  tickHalf: {
    width: 1,
    height: 4,
    opacity: 0.6,
  },
  tickLabel: {
    fontFamily: display,
    fontSize: 12,
    color: C.ink,
    marginTop: 1,
  },

  secondaryRow: {
    marginTop: 10,
    gap: 10,
  },
  splitCard: {
    backgroundColor: '#262019',
    borderWidth: 1,
    borderColor: '#4A4035',
    padding: 10,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 6,
  },
  cardTitle: {
    fontFamily: display,
    fontSize: 16,
    color: C.mustard,
    letterSpacing: 1,
  },
  cardSub: {
    fontFamily: display,
    fontSize: 14,
    color: C.paper,
    letterSpacing: 0.8,
  },
  splitBarTrack: {
    flexDirection: 'row',
    height: 26,
    borderWidth: 1,
    borderColor: C.paper,
    marginTop: 6,
    overflow: 'hidden',
  },
  splitFrontFill: {
    backgroundColor: C.teal,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  splitSubjectPin: {
    width: 20,
    backgroundColor: C.ink,
    alignItems: 'center',
    justifyContent: 'center',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: C.mustard,
  },
  splitPinText: {
    fontFamily: display,
    fontSize: 14,
    color: C.mustard,
  },
  splitBehindFill: {
    backgroundColor: C.orange,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  splitBarText: {
    fontFamily: display,
    fontSize: 12,
    color: C.paper,
    letterSpacing: 0.5,
  },
  metricsFooterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 6,
  },
  metricSmall: {
    fontFamily: type,
    fontSize: 10,
    color: C.paperDark,
  },
  metricSmallVal: {
    fontFamily: display,
    fontSize: 13,
    color: C.paper,
  },

  bokehCard: {
    backgroundColor: '#262019',
    borderWidth: 1,
    borderColor: '#4A4035',
    padding: 10,
  },
  bokehVisualRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 6,
  },
  bokehPreviewBox: {
    width: 48,
    height: 48,
    borderWidth: 1,
    borderColor: C.paperDark,
    backgroundColor: C.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bokehCircle: {
    backgroundColor: C.mustard,
    borderWidth: 1.5,
    borderColor: C.paper,
  },
  bokehGradeText: {
    fontFamily: display,
    fontSize: 18,
    color: C.mustard,
    letterSpacing: 1,
  },
  bokehDetailText: {
    fontFamily: type,
    fontSize: 10,
    color: C.paperDark,
    marginTop: 2,
  },

  barrelCard: {
    marginTop: 10,
    backgroundColor: '#191512',
    borderWidth: 1,
    borderColor: '#5A4E40',
    padding: 10,
  },
  barrelScaleWrap: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#3A3127',
    backgroundColor: C.ink,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  barrelDistanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  barrelNearText: {
    fontFamily: display,
    fontSize: 16,
    color: C.teal,
    letterSpacing: 0.5,
  },
  barrelBracketLine: {
    flex: 1,
    height: 3,
    backgroundColor: C.teal,
    maxWidth: 70,
  },
  barrelCenterFocusBadge: {
    backgroundColor: C.mustard,
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: C.paper,
  },
  barrelCenterFocusText: {
    fontFamily: display,
    fontSize: 16,
    color: C.ink,
    letterSpacing: 0.8,
  },
  barrelFarText: {
    fontFamily: display,
    fontSize: 16,
    color: C.orange,
    letterSpacing: 0.5,
  },
  barrelApertureRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
    paddingTop: 4,
    borderTopWidth: 1,
    borderColor: '#3A3127',
  },
  barrelStopMark: {
    fontFamily: display,
    fontSize: 13,
    color: '#7A6E5D',
  },
  barrelStopMarkActiveTeal: {
    color: C.teal,
    fontSize: 16,
    textDecorationLine: 'underline',
  },
  barrelStopMarkActiveOrange: {
    color: C.orange,
    fontSize: 16,
    textDecorationLine: 'underline',
  },
  barrelDiamond: {
    fontFamily: display,
    fontSize: 16,
    color: C.mustard,
    marginHorizontal: 4,
  },
});

