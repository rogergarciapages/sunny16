import React from 'react';
import { Platform, View, StyleSheet } from 'react-native';

interface IconProps {
  size?: number;
  color?: string;
}

/**
 * Vintage 1968 SLR Camera SVG icon (replaces camera emoji).
 * Renders a native <svg> vector on Web and crisp geometric Views on native mobile.
 */
export function CameraSvgIcon({ size = 20, color = '#E3A82B' }: IconProps) {
  if (Platform.OS === 'web') {
    return React.createElement(
      'svg',
      {
        width: size,
        height: size,
        viewBox: '0 0 24 24',
        fill: 'none',
         style: { display: 'block', flexShrink: 0 },
      },
      // Shutter button on left shoulder
      React.createElement('rect', {
        x: '4',
        y: '4',
        width: '3',
        height: '2',
        fill: color,
      }),
      // SLR Pentaprism housing + camera body outline
      React.createElement('path', {
        d: 'M8.5 6L10.2 3.5H13.8L15.5 6H20C21.1 6 22 6.9 22 8V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V8C2 6.9 2.9 6 4 6H8.5Z',
        stroke: color,
        strokeWidth: '2',
        strokeLinejoin: 'round',
      }),
      // Outer lens barrel
      React.createElement('circle', {
        cx: '12',
        cy: '13',
        r: '4.3',
        stroke: color,
        strokeWidth: '2',
      }),
      // Inner lens element
      React.createElement('circle', {
        cx: '12',
        cy: '13',
        r: '1.6',
        fill: color,
      }),
      // Viewfinder window dot
      React.createElement('rect', {
        x: '17.5',
        y: '8.2',
        width: '2',
        height: '1.5',
        fill: color,
      }),
    );
  }

  return (
    <View style={[styles.nativeWrap, { width: size, height: size }]}>
      <View
        style={{
          width: size * 0.36,
          height: size * 0.16,
          borderWidth: 1.5,
          borderColor: color,
          marginBottom: -1,
        }}
      />
      <View
        style={{
          width: size * 0.86,
          height: size * 0.58,
          borderWidth: 1.8,
          borderColor: color,
          borderRadius: 2,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <View
          style={{
            width: size * 0.36,
            height: size * 0.36,
            borderRadius: size * 0.18,
            borderWidth: 1.5,
            borderColor: color,
          }}
        />
      </View>
    </View>
  );
}

/**
 * Vintage 1968 Steady Hand / Anti-Shake SVG icon (replaces hand emoji on 1/f Handheld Priority).
 * Features an open palm with fingers and lateral anti-vibration brackets.
 */
export function HandSvgIcon({ size = 16, color = '#1E1A16' }: IconProps) {
  if (Platform.OS === 'web') {
    return React.createElement(
      'svg',
      {
        width: size,
        height: size,
        viewBox: '0 0 24 24',
        fill: 'none',
        style: { display: 'block', flexShrink: 0 },
      },
      // Left anti-shake wave bracket
      React.createElement('path', {
        d: 'M3.2 8.5C2 10.7 2 13.3 3.2 15.5',
        stroke: color,
        strokeWidth: '1.8',
        strokeLinecap: 'round',
      }),
      // Right anti-shake wave bracket
      React.createElement('path', {
        d: 'M20.8 8.5C22 10.7 22 13.3 20.8 15.5',
        stroke: color,
        strokeWidth: '1.8',
        strokeLinecap: 'round',
      }),
      // Raised steady hand outline (palm + 4 fingers + thumb)
      React.createElement('path', {
        d: 'M8.5 11.5V5.5C8.5 4.8 9 4.2 9.7 4.2C10.4 4.2 10.9 4.8 10.9 5.5V10M10.9 10V4C10.9 3.3 11.4 2.8 12.1 2.8C12.8 2.8 13.3 3.3 13.3 4V10M13.3 10V4.8C13.3 4.1 13.8 3.6 14.5 3.6C15.2 3.6 15.7 4.1 15.7 4.8V11M15.7 10V6.8C15.7 6.1 16.2 5.6 16.9 5.6C17.6 5.6 18.1 6.1 18.1 6.8V14.2C18.1 18 15.3 20.8 11.8 20.8H11.2C8.3 20.8 6.4 18.9 5.5 16.3L4.4 13.1C4.1 12.3 4.6 11.5 5.4 11.3C6.1 11.1 6.8 11.5 7.2 12.2L8.5 14V11.5Z',
        stroke: color,
        strokeWidth: '1.8',
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
      }),
    );
  }

  return (
    <View style={[styles.nativeWrap, { width: size, height: size }]}>
      <View
        style={{
          width: size * 0.65,
          height: size * 0.78,
          borderWidth: 1.6,
          borderColor: color,
          borderRadius: 3,
        }}
      />
    </View>
  );
}

/**
 * Vintage 35mm Perforated Film Strip SVG icon (replaces film emoji in Film Guide tab).
 */
export function FilmStripSvgIcon({ size = 16, color = '#F3EAD3' }: IconProps) {
  if (Platform.OS === 'web') {
    return React.createElement(
      'svg',
      {
        width: size,
        height: size,
        viewBox: '0 0 24 24',
        fill: 'none',
        style: { display: 'block', flexShrink: 0 },
      },
      React.createElement('rect', {
        x: '3',
        y: '3',
        width: '18',
        height: '18',
        rx: '1.5',
        stroke: color,
        strokeWidth: '2',
      }),
      React.createElement('line', { x1: '7', y1: '3', x2: '7', y2: '21', stroke: color, strokeWidth: '1.8' }),
      React.createElement('line', { x1: '17', y1: '3', x2: '17', y2: '21', stroke: color, strokeWidth: '1.8' }),
      React.createElement('line', { x1: '7', y1: '12', x2: '17', y2: '12', stroke: color, strokeWidth: '1.8' }),
      React.createElement('line', { x1: '3', y1: '7.5', x2: '7', y2: '7.5', stroke: color, strokeWidth: '1.6' }),
      React.createElement('line', { x1: '3', y1: '12', x2: '7', y2: '12', stroke: color, strokeWidth: '1.6' }),
      React.createElement('line', { x1: '3', y1: '16.5', x2: '7', y2: '16.5', stroke: color, strokeWidth: '1.6' }),
      React.createElement('line', { x1: '17', y1: '7.5', x2: '21', y2: '7.5', stroke: color, strokeWidth: '1.6' }),
      React.createElement('line', { x1: '17', y1: '12', x2: '21', y2: '12', stroke: color, strokeWidth: '1.6' }),
      React.createElement('line', { x1: '17', y1: '16.5', x2: '21', y2: '16.5', stroke: color, strokeWidth: '1.6' }),
    );
  }

  return (
    <View
      style={{
        width: size,
        height: size,
        borderWidth: 1.5,
        borderColor: color,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    />
  );
}

const styles = StyleSheet.create({
  nativeWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

