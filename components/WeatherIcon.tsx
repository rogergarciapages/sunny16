import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ConditionId } from '../lib/exposure';

const INK = '#1E1A16';

function Sun({ size, color = INK, filled = false }: { size: number; color?: string; filled?: boolean }) {
  const core = size * 0.42;
  const rays = Array.from({ length: 12 });
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {rays.map((_, i) => (
        <View
          key={i}
          style={{
            position: 'absolute',
            width: 2,
            height: size,
            alignItems: 'center',
            transform: [{ rotate: `${i * 30}deg` }],
          }}
        >
          <View style={{ width: 2, height: size * 0.18, backgroundColor: color }} />
        </View>
      ))}
      <View
        style={{
          width: core,
          height: core,
          borderRadius: core,
          borderWidth: 2,
          borderColor: color,
          backgroundColor: filled ? color : 'transparent',
        }}
      />
    </View>
  );
}

function Cloud({ size, fill }: { size: number; fill: string }) {
  const b = { position: 'absolute' as const, backgroundColor: fill, borderColor: INK, borderWidth: 2 };
  return (
    <View style={{ width: size, height: size * 0.6 }}>
      <View style={[b, { left: size * 0.12, top: size * 0.2, width: size * 0.36, height: size * 0.36, borderRadius: size }]} />
      <View style={[b, { left: size * 0.32, top: 0, width: size * 0.48, height: size * 0.48, borderRadius: size }]} />
      <View style={[b, { left: 0, right: 0, bottom: 0, height: size * 0.28, borderRadius: size * 0.14 }]} />
      {/* hide inner outlines */}
      <View style={{ position: 'absolute', left: 2, right: 2, bottom: 2, height: size * 0.18, backgroundColor: fill, borderRadius: size * 0.1 }} />
    </View>
  );
}

const WEATHER_LABELS: Record<ConditionId, string> = {
  snow: 'Bright sun on snow or sand lighting icon (f/22)',
  sunny: 'Direct bright sunny lighting icon (f/16)',
  slight: 'Slight overcast clouds lighting icon (f/11)',
  overcast: 'Overcast sky lighting icon (f/8)',
  heavy: 'Heavy overcast storm clouds lighting icon (f/5.6)',
  shade: 'Open shade or sunset sky lighting icon (f/4)',
  golden: 'Golden hour warm low sun lighting icon (f/2.8)',
  dusk: 'Blue hour or twilight dusk lighting icon (f/2)',
  indoor: 'Bright indoor window lighting icon (f/1.4)',
  night: 'Night street and neon lighting icon (f/1.4)',
};

export default function WeatherIcon({ id, size = 48 }: { id: ConditionId; size?: number }) {
  const ariaLabel = WEATHER_LABELS[id];
  switch (id) {
    case 'snow':
      return (
        <View role="img" aria-label={ariaLabel} style={{ alignItems: 'center' }}>
          <Sun size={size * 0.8} />
          <View style={[styles.line, { width: size }]} />
          <View style={[styles.line, { width: size * 0.7, marginTop: 3 }]} />
        </View>
      );
    case 'sunny':
      return (
        <View role="img" aria-label={ariaLabel}>
          <Sun size={size} />
        </View>
      );
    case 'slight':
      return (
        <View role="img" aria-label={ariaLabel} style={{ width: size, height: size }}>
          <View style={{ position: 'absolute', right: 0, top: 0 }}><Sun size={size * 0.6} /></View>
          <View style={{ position: 'absolute', left: 0, bottom: 4 }}><Cloud size={size * 0.85} fill="#F3EAD3" /></View>
        </View>
      );
    case 'overcast':
      return (
        <View role="img" aria-label={ariaLabel}>
          <Cloud size={size} fill="#9FB8AE" />
        </View>
      );
    case 'heavy':
      return (
        <View role="img" aria-label={ariaLabel}>
          <Cloud size={size} fill={INK} />
        </View>
      );
    case 'shade':
      return (
        <View role="img" aria-label={ariaLabel} style={{ alignItems: 'center', width: size, height: size * 0.6, justifyContent: 'flex-end' }}>
          <View style={{ width: size * 0.5, height: size * 0.25, borderTopLeftRadius: size, borderTopRightRadius: size, borderWidth: 2, borderBottomWidth: 0, borderColor: INK }} />
          <View style={[styles.line, { width: size }]} />
          <View style={[styles.line, { width: size * 0.75, marginTop: 3 }]} />
          <View style={[styles.line, { width: size * 0.5, marginTop: 3 }]} />
        </View>
      );
    case 'golden':
      return (
        <View role="img" aria-label={ariaLabel} style={{ alignItems: 'center', width: size, height: size * 0.72, justifyContent: 'flex-end' }}>
          <View style={{ marginBottom: -size * 0.2 }}>
            <Sun size={size * 0.68} color="#D9622B" filled />
          </View>
          <View style={[styles.line, { width: size, height: 2.5 }]} />
          <View style={[styles.line, { width: size * 0.65, marginTop: 3, backgroundColor: '#D9622B' }]} />
        </View>
      );
    case 'dusk':
      return (
        <View role="img" aria-label={ariaLabel} style={{ width: size, height: size * 0.78, alignItems: 'center', justifyContent: 'center' }}>
          {/* Crescent Moon */}
          <View
            style={{
              width: size * 0.44,
              height: size * 0.44,
              borderRadius: size * 0.22,
              backgroundColor: '#3E8E8B',
              borderWidth: 2,
              borderColor: INK,
              marginBottom: 4,
            }}
          />
          <View style={[styles.line, { width: size }]} />
          <View style={[styles.line, { width: size * 0.6, marginTop: 3 }]} />
        </View>
      );
    case 'indoor':
      return (
        <View
          role="img"
          aria-label={ariaLabel}
          style={{
            width: size * 0.68,
            height: size * 0.76,
            borderWidth: 2.5,
            borderColor: INK,
            backgroundColor: '#E3A82B',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* 4-pane vintage window frame */}
          <View style={{ position: 'absolute', left: 0, right: 0, height: 2, backgroundColor: INK }} />
          <View style={{ position: 'absolute', top: 0, bottom: 0, width: 2, backgroundColor: INK }} />
        </View>
      );
    case 'night':
      return (
        <View
          role="img"
          aria-label={ariaLabel}
          style={{
            width: size * 0.78,
            height: size * 0.78,
            backgroundColor: INK,
            borderRadius: 6,
            borderWidth: 2,
            borderColor: '#E3A82B',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Neon / Streetlamp glow + star */}
          <View
            style={{
              width: size * 0.34,
              height: size * 0.34,
              borderRadius: size * 0.17,
              backgroundColor: '#E3A82B',
            }}
          />
          <View style={{ width: 2, height: size * 0.22, backgroundColor: '#F3EAD3', marginTop: 2 }} />
        </View>
      );
  }
}

const styles = StyleSheet.create({
  line: { height: 2, backgroundColor: INK },
});
