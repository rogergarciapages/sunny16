import React, { useMemo, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View, Pressable, Platform, useWindowDimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFonts, BebasNeue_400Regular } from '@expo-google-fonts/bebas-neue';
import { SpecialElite_400Regular } from '@expo-google-fonts/special-elite';

import { brands } from './data/brands';
import { cameras } from './data/cameras';
import { lenses } from './data/lenses';
import { films } from './data/films';
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
  grittyStyles,
  GrittyStyleId,
} from './lib/exposure';
import WeatherIcon from './components/WeatherIcon';

const C = {
  paper: '#F3EAD3',
  paperDark: '#E6D9B8',
  ink: '#1E1A16',
  teal: '#3E8E8B',
  orange: '#D9622B',
  mustard: '#E3A82B',
  brown: '#7A4E2D',
};

function Chip({ label, sub, active, onPress, id }: { label: string; sub?: string; active: boolean; onPress: () => void; id: string }) {
  return (
    <Pressable
      nativeID={id}
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
    <View style={styles.section}>
      <View style={styles.sectionHead}>
        <View style={styles.stepBadge}><Text style={styles.stepText}>{step}</Text></View>
        <Text style={styles.sectionTitle}>{title}</Text>
        <View style={styles.rule} />
      </View>
      <View style={styles.chipRow}>{children}</View>
    </View>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({ BebasNeue_400Regular, SpecialElite_400Regular });
  const { width } = useWindowDimensions();
  const wide = width > 760;

  const [iso, setIso] = useState(400);
  const [brandId, setBrandId] = useState(brands[0].id);
  const brandCameras = useMemo(() => cameras.filter((c) => c.brandId === brandId), [brandId]);
  const [cameraId, setCameraId] = useState<string | undefined>(brandCameras[0]?.id);
  const camera = cameras.find((c) => c.id === cameraId && c.brandId === brandId) ?? brandCameras[0];

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
  const [filterId, setFilterId] = useState<FilterId>('none');
  const activeFilter = lensFilters.find((f) => f.id === filterId) ?? lensFilters[0];
  const [grittyId, setGrittyId] = useState<GrittyStyleId>('off');
  const activeGritty = grittyStyles.find((g) => g.id === grittyId) ?? grittyStyles[0];

  if (!fontsLoaded) return <View style={{ flex: 1, backgroundColor: C.paper }} />;

  const selectBrand = (id: string) => {
    setBrandId(id);
    setCameraId(cameras.find((c) => c.brandId === id)?.id);
    setLensId(undefined);
  };

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.page}>
          {/* Masthead */}
          <View style={styles.stripes}>
            {[C.mustard, C.orange, C.brown, C.teal].map((c) => <View key={c} style={[styles.stripe, { backgroundColor: c }]} />)}
          </View>
          <View style={styles.masthead}>
            <Text style={styles.kicker}>THE ANALOG PHOTOGRAPHER'S POCKET GUIDE · NO. 16</Text>
            <Text style={styles.title} accessibilityRole="header">SUNNY 16</Text>
            <Text style={styles.tagline}>"Set shutter speed closest to the film speed"</Text>
          </View>

          <Section step="1" title="Film Speed · ISO / ASA">
            {films.map((f) => (
              <Chip key={f.iso} id={`iso-${f.iso}`} label={`${f.iso}`} sub={f.label.split('/ ')[1]} active={iso === f.iso} onPress={() => setIso(f.iso)} />
            ))}
          </Section>

          <Section step="2" title="Camera Brand">
            {brands.map((b) => (
              <Chip key={b.id} id={`brand-${b.id}`} label={b.name} sub={b.country} active={brandId === b.id} onPress={() => selectBrand(b.id)} />
            ))}
          </Section>

          <Section step="3" title="Camera Model">
            {brandCameras.map((c) => (
              <Chip key={c.id} id={`camera-${c.id}`} label={c.name} sub={`${c.year} · ${c.format}`} active={camera?.id === c.id} onPress={() => { setCameraId(c.id); setLensId(undefined); }} />
            ))}
          </Section>

          <Section step="4" title="Lens">
            {cameraLenses.length === 0 ? (
              <Text style={styles.body}>No lenses listed for this mount yet — add one in data/lenses.ts</Text>
            ) : (
              cameraLenses.map((l) => (
                <Chip key={l.id} id={`lens-${l.id}`} label={l.name} sub={`f/${l.apertures[0]} – f/${l.apertures[l.apertures.length - 1]}`} active={lens?.id === l.id} onPress={() => setLensId(l.id)} />
              ))
            )}
          </Section>

          {/* Exposure table */}
          {camera && lens && (
            <View style={styles.tableWrap}>
              <View style={styles.tableHeader}>
                <Text style={styles.tableHeaderText}>EXPOSURE TABLE</Text>
                <View style={styles.headerBadges}>
                  {activeGritty.id !== 'off' && (
                    <View style={[styles.isoBox, { backgroundColor: C.orange }]}>
                      <Text style={[styles.isoBoxText, { color: C.paper }]}>
                        {activeGritty.shortName} · EI {Math.round(iso * 2 ** -activeGritty.evShiftStops)}
                      </Text>
                    </View>
                  )}
                  {activeFilter.id !== 'none' && (
                    <View style={[styles.isoBox, { backgroundColor: activeFilter.color }]}>
                      <Text style={styles.isoBoxText}>{activeFilter.shortName} ({activeFilter.factor})</Text>
                    </View>
                  )}
                  <View style={styles.isoBox}>
                    <Text style={styles.isoBoxText}>ISO {iso}</Text>
                  </View>
                </View>
              </View>
              <Text style={styles.cameraLine}>
                {brands.find((b) => b.id === brandId)?.name} {camera.name} · {lens.name}
                {activeFilter.id !== 'none' ? ` · ${activeFilter.name}` : ''}
                {activeGritty.id !== 'off' ? ` · ${activeGritty.name}` : ''}
              </Text>

              <View style={[styles.grid, wide && { flexDirection: 'row', flexWrap: 'wrap' }]}>
                {conditions.map((cond) => {
                  const r = recommend(iso, cond, camera, lens, activeFilter.stops, activeGritty.evShiftStops);
                  const gr =
                    activeGritty.id === 'kinetic'
                      ? recommendGritty(iso, cond, camera, lens, activeFilter.stops, activeGritty)
                      : null;
                  const cellBest = gr?.dragSetting ?? r.best;
                  const active = cond.id === conditionId;
                  return (
                    <Pressable
                      key={cond.id}
                      nativeID={`condition-${cond.id}`}
                      onPress={() => setConditionId(cond.id)}
                      style={[styles.cell, wide && { width: '33.333%' }, active && styles.cellActive]}
                    >
                      <View style={styles.iconBox}><WeatherIcon id={cond.id} size={44} /></View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.condTitle}>{cond.title}</Text>
                        <Text style={styles.condHint}>{cond.hint}</Text>
                        {cellBest ? (
                          <Text style={styles.condValue}>
                            {formatAperture(cellBest.aperture)} · {formatShutter(cellBest.shutter)}
                          </Text>
                        ) : null}
                      </View>
                    </Pressable>
                  );
                })}
              </View>

              <Result iso={iso} conditionId={conditionId} />
            </View>
          )}

          <Text style={styles.footer}>
            Rule of thumb only — trust your eyes, and bracket when in doubt. Printed in the spirit of 1968.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );

  function Result({ iso, conditionId }: { iso: number; conditionId: Condition['id'] }) {
    const cond = conditions.find((c) => c.id === conditionId)!;
    const r = recommend(iso, cond, camera!, lens!, activeFilter.stops, activeGritty.evShiftStops);
    const activeGrittyRec = recommendGritty(
      iso,
      cond,
      camera!,
      lens!,
      activeFilter.stops,
      activeGritty.id === 'off' ? grittyStyles[1] : activeGritty,
    );
    const bestDisplay =
      activeGritty.id === 'kinetic' && activeGrittyRec.dragSetting
        ? activeGrittyRec.dragSetting
        : r.best;
    const dofLabel = (aperture: number) =>
      aperture <= 2.8 ? 'SHALLOW / BOKEH' : aperture <= 8 ? 'BALANCED DOF' : 'DEEP FOCUS';

    return (
      <View style={styles.result} nativeID="result-panel">
        <Text style={styles.resultKicker}>
          RECOMMENDED SETTING · {cond.title.toUpperCase()}
          {activeFilter.id !== 'none' ? ` · ${activeFilter.shortName} (${activeFilter.factor})` : ''}
          {activeGritty.id !== 'off' ? ` · ${activeGritty.shortName}` : ''}
        </Text>
        {bestDisplay ? (
          <>
            <View style={styles.bigRow}>
              <View style={styles.bigBox}>
                <Text style={styles.bigLabel}>APERTURE</Text>
                <Text style={styles.bigValue}>{formatAperture(bestDisplay.aperture)}</Text>
              </View>
              <View style={[styles.bigBox, { backgroundColor: C.orange }]}>
                <Text style={styles.bigLabel}>SHUTTER</Text>
                <Text style={styles.bigValue}>{formatShutter(bestDisplay.shutter)}</Text>
              </View>
            </View>
            <Text style={styles.resultNote}>
              Pure Sunny 16
              {activeFilter.stops > 0 ? ` (+${activeFilter.stops} EV filter)` : ''}
              {activeGritty.evShiftStops !== 0
                ? ` (${activeGritty.evShiftStops} EV gritty shift · EI ${Math.round(iso * 2 ** -activeGritty.evShiftStops)})`
                : ''}
              : {formatAperture(r.ideal.aperture)} @ {formatShutter(r.ideal.shutter)} · On your gear:{' '}
              {formatError(bestDisplay.errorStops)}
            </Text>
            {(activeFilter.id !== 'none' || activeGritty.id !== 'off') && (
              <View style={styles.cumulativeBanner}>
                <Text style={styles.cumulativeText}>
                  <Text style={styles.grittyGearHighlight}>CUMULATIVE MATH: </Text>
                  Filter ({activeFilter.shortName}: +{activeFilter.stops} EV) + Gritty ({activeGritty.shortName}:{' '}
                  {activeGritty.evShiftStops >= 0 ? `+${activeGritty.evShiftStops}` : activeGritty.evShiftStops} EV) ={' '}
                  <Text style={{ color: C.mustard, fontFamily: display, fontSize: 14 }}>
                    NET {r.netEvStops >= 0 ? `+${r.netEvStops}` : r.netEvStops} EV
                  </Text>
                  {' · '}Effective Camera ISO: {Number(r.effectiveIso.toFixed(1))}
                  {activeGritty.pushStops > 0 ? ` · Lab Dev: +${activeGritty.pushStops} stop(s)` : ''}
                </Text>
              </View>
            )}
            {r.alternatives.length > 0 && (
              <>
                <Text style={styles.altTitle}>
                  EQUIVALENT EXPOSURES {activeFilter.id !== 'none' ? `· WITH ${activeFilter.shortName}` : ''}
                </Text>
                <Text style={styles.altHint}>
                  Same exposure — pick wider apertures (left) for creamy bokeh or smaller apertures (right) for deep focus:
                </Text>
                <View style={styles.altRow}>
                  {r.alternatives.map((a) => (
                    <View
                      key={a.shutter}
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
                    </View>
                  ))}
                </View>
              </>
            )}

            {/* Filter Compensation & Equivalent Exposures Comparison */}
            <View style={styles.filterSection}>
              <Text style={styles.altTitle}>LENS FILTER COMPENSATION · UV / YELLOW / RED</Text>
              <Text style={styles.altHint}>
                Tap a filter below to apply it across the table, or compare how UV, Yellow (#8), and Red (#25) shift your exposure & bokeh options:
              </Text>

              <View style={styles.filterPillRow}>
                {lensFilters.map((f) => {
                  const isSelected = f.id === activeFilter.id;
                  return (
                    <Pressable
                      key={f.id}
                      nativeID={`filter-${f.id}`}
                      onPress={() => setFilterId(f.id)}
                      style={[
                        styles.filterPill,
                        isSelected && { backgroundColor: f.color, borderColor: f.color },
                      ]}
                    >
                      <Text style={[styles.filterPillTitle, isSelected && { color: C.ink }]}>
                        {f.shortName}
                      </Text>
                      <Text style={[styles.filterPillSub, isSelected && { color: C.brown }]}>
                        {f.factor}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <View style={[styles.filterGrid, wide && { flexDirection: 'row', flexWrap: 'wrap' }]}>
                {lensFilters
                  .filter((f) => f.id !== 'none')
                  .map((f) => {
                    const fr = recommend(iso, cond, camera!, lens!, f.stops, activeGritty.evShiftStops);
                    const allPairs = fr.best ? [fr.best, ...fr.alternatives] : [];
                    const widest = [...allPairs].sort((a, b) => a.aperture - b.aperture)[0];
                    const isSelected = f.id === activeFilter.id;
                    return (
                      <Pressable
                        key={f.id}
                        onPress={() => setFilterId(isSelected ? 'none' : f.id)}
                        style={[
                          styles.filterCard,
                          wide && { width: '48.5%' },
                          isSelected && { borderColor: f.color, borderWidth: 2 },
                        ]}
                      >
                        <View style={styles.filterCardHead}>
                          <View style={[styles.filterDot, { backgroundColor: f.color }]} />
                          <Text style={styles.filterCardTitle}>{f.name}</Text>
                          <View style={[styles.filterFactorBadge, { backgroundColor: f.color }]}>
                            <Text style={styles.filterFactorText}>{f.factor}</Text>
                          </View>
                        </View>
                        <Text style={styles.filterEffect}>{f.effect}</Text>
                        {fr.best ? (
                          <>
                            <View style={styles.filterSummaryRow}>
                              <Text style={styles.filterRecLabel}>
                                Recommended:{' '}
                                <Text style={styles.filterRecVal}>
                                  {formatAperture(fr.best.aperture)} · {formatShutter(fr.best.shutter)}
                                </Text>
                              </Text>
                              {widest && (
                                <Text style={styles.filterBokehLabel}>
                                  Max Bokeh:{' '}
                                  <Text style={styles.filterBokehVal}>
                                    {formatAperture(widest.aperture)} · {formatShutter(widest.shutter)}
                                  </Text>
                                </Text>
                              )}
                            </View>
                            <View style={styles.filterEqRow}>
                              {allPairs
                                .sort((a, b) => a.aperture - b.aperture)
                                .map((pair) => (
                                  <View key={`${f.id}-${pair.shutter}`} style={styles.filterEqChip}>
                                    <Text style={styles.filterEqAperture}>{formatAperture(pair.aperture)}</Text>
                                    <Text style={styles.filterEqShutter}>{formatShutter(pair.shutter)}</Text>
                                  </View>
                                ))}
                            </View>
                          </>
                        ) : (
                          <Text style={styles.altHint}>Out of range for this camera/lens.</Text>
                        )}
                      </Pressable>
                    );
                  })}
              </View>
            </View>

            {/* Gritty / Street Style Section */}
            <View style={styles.grittySection} nativeID="gritty-section">
              <View style={styles.grittyHeaderRow}>
                <Text style={styles.altTitle}>
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
                    const gr = recommendGritty(iso, cond, camera!, lens!, activeFilter.stops, g);
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
                          {activeFilter.id !== 'none' && (
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

  tableWrap: { marginTop: 28, borderWidth: 3, borderColor: C.ink },
  tableHeader: { backgroundColor: C.teal, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 10, borderBottomWidth: 3, borderColor: C.ink, flexWrap: 'wrap', gap: 8 },
  tableHeaderText: { fontFamily: display, fontSize: 34, color: C.ink, letterSpacing: 3 },
  headerBadges: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  isoBox: { borderWidth: 2, borderColor: C.ink, backgroundColor: C.paper, paddingHorizontal: 10, paddingVertical: 2 },
  isoBoxText: { fontFamily: display, fontSize: 22, color: C.ink },
  cameraLine: { fontFamily: type, fontSize: 13, color: C.ink, padding: 10, borderBottomWidth: 2, borderColor: C.ink },
  grid: {},
  cell: { flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: 1, borderRightWidth: 1, borderColor: C.ink, gap: 12 },
  cellActive: { backgroundColor: C.mustard },
  iconBox: { width: 56, height: 56, alignItems: 'center', justifyContent: 'center' },
  condTitle: { fontFamily: display, fontSize: 22, color: C.ink, letterSpacing: 1 },
  condHint: { fontFamily: type, fontSize: 11, color: C.brown },
  condValue: { fontFamily: type, fontSize: 16, color: C.ink, marginTop: 2 },

  result: { padding: 16, backgroundColor: C.ink },
  resultKicker: { fontFamily: type, fontSize: 12, color: C.mustard, letterSpacing: 1 },
  bigRow: { flexDirection: 'row', gap: 12, marginTop: 10 },
  bigBox: { flex: 1, backgroundColor: C.teal, borderWidth: 2, borderColor: C.paper, padding: 10, alignItems: 'center' },
  bigLabel: { fontFamily: type, fontSize: 12, color: C.ink },
  bigValue: { fontFamily: display, fontSize: 64, lineHeight: 68, color: C.paper },
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
});
