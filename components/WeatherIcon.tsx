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

export default function WeatherIcon({ id, size = 48 }: { id: ConditionId; size?: number }) {
  switch (id) {
    case 'snow':
      return (
        <View style={{ alignItems: 'center' }}>
          <Sun size={size * 0.8} />
          <View style={[styles.line, { width: size }]} />
          <View style={[styles.line, { width: size * 0.7, marginTop: 3 }]} />
        </View>
      );
    case 'sunny':
      return <Sun size={size} />;
    case 'slight':
      return (
        <View style={{ width: size, height: size }}>
          <View style={{ position: 'absolute', right: 0, top: 0 }}><Sun size={size * 0.6} /></View>
          <View style={{ position: 'absolute', left: 0, bottom: 4 }}><Cloud size={size * 0.85} fill="#F3EAD3" /></View>
        </View>
      );
    case 'overcast':
      return <Cloud size={size} fill="#9FB8AE" />;
    case 'heavy':
      return <Cloud size={size} fill={INK} />;
    case 'shade':
      return (
        <View style={{ alignItems: 'center', width: size, height: size * 0.6, justifyContent: 'flex-end' }}>
          <View style={{ width: size * 0.5, height: size * 0.25, borderTopLeftRadius: size, borderTopRightRadius: size, borderWidth: 2, borderBottomWidth: 0, borderColor: INK }} />
          <View style={[styles.line, { width: size }]} />
          <View style={[styles.line, { width: size * 0.75, marginTop: 3 }]} />
          <View style={[styles.line, { width: size * 0.5, marginTop: 3 }]} />
        </View>
      );
  }
}

const styles = StyleSheet.create({
  line: { height: 2, backgroundColor: INK },
});
