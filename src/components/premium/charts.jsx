import React from 'react';
import {View, Text} from 'react-native';
import Svg, {Circle, Rect, Path, Defs, LinearGradient as SvgGradient, Stop} from 'react-native-svg';
import COLORS from '../../constants/Theme';
import {useCountUp} from './motion';

const tabular = {fontVariant: ['tabular-nums']};

/**
 * Donut chart. `data`: [{value, color}]. Renders concentric arc
 * segments with a center label/sub. Mirrors the web SPA's
 * PaymentZonesDoghnut so mobile + web read the same.
 */
export const Donut = ({
  data = [],
  size = 160,
  thickness = 18,
  centerValue,
  centerLabel,
}) => {
  const total = data.reduce((s, d) => s + (d.value || 0), 0) || 1;
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  const cx = size / 2;
  const cy = size / 2;

  const countUp = typeof centerValue === 'number';
  const animated = useCountUp(countUp ? centerValue : 0);
  const shownCenter = countUp ? Math.round(animated) : centerValue;

  let offset = 0;
  const segments = data
    .filter(d => d.value > 0)
    .map((d, i) => {
      const frac = d.value / total;
      const len = frac * c;
      const seg = {
        key: i,
        color: d.color,
        dash: `${len} ${c - len}`,
        rotation: (offset / c) * 360,
      };
      offset += len;
      return seg;
    });

  return (
    <View style={{width: size, height: size, alignItems: 'center', justifyContent: 'center'}}>
      <Svg width={size} height={size}>
        {/* track */}
        <Circle
          cx={cx}
          cy={cy}
          r={r}
          stroke="rgba(21,37,53,0.06)"
          strokeWidth={thickness}
          fill="none"
        />
        {segments.map(s => (
          <Circle
            key={s.key}
            cx={cx}
            cy={cy}
            r={r}
            stroke={s.color}
            strokeWidth={thickness}
            strokelinecap="butt"
            fill="none"
            strokeDasharray={s.dash}
            strokeDashoffset={0}
            // start each arc at 12 o'clock, then advance by its share
            transform={`rotate(${-90 + s.rotation} ${cx} ${cy})`}
          />
        ))}
      </Svg>
      {(centerValue != null || centerLabel) && (
        <View style={{position: 'absolute', alignItems: 'center'}}>
          {centerValue != null && (
            <Text style={[{color: COLORS.keystone_navy, fontFamily: 'Inter-Bold', fontSize: 28}, tabular]}>
              {shownCenter}
            </Text>
          )}
          {centerLabel ? (
            <Text
              style={{
                color: COLORS.text_muted,
                fontFamily: 'Inter-SemiBold',
                fontSize: 10,
                letterSpacing: 0.8,
                textTransform: 'uppercase',
                marginTop: 2,
              }}>
              {centerLabel}
            </Text>
          ) : null}
        </View>
      )}
    </View>
  );
};

/**
 * Single-value progress ring with a center label. Used for occupancy
 * and compliance-health reads. `color` defaults to gold.
 */
export const Ring = ({
  percent = 0,
  size = 96,
  thickness = 9,
  color = COLORS.keystone_gold,
  trackColor = 'rgba(21,37,53,0.08)',
  centerValue,
  centerLabel,
  centerColor = COLORS.keystone_navy,
}) => {
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(100, percent));
  const dash = (clamped / 100) * c;
  const cx = size / 2;
  return (
    <View style={{width: size, height: size, alignItems: 'center', justifyContent: 'center'}}>
      <Svg width={size} height={size}>
        <Circle cx={cx} cy={cx} r={r} stroke={trackColor} strokeWidth={thickness} fill="none" />
        <Circle
          cx={cx}
          cy={cx}
          r={r}
          stroke={color}
          strokeWidth={thickness}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${dash} ${c - dash}`}
          transform={`rotate(-90 ${cx} ${cx})`}
        />
      </Svg>
      {(centerValue != null || centerLabel) && (
        <View style={{position: 'absolute', alignItems: 'center'}}>
          {centerValue != null && (
            <Text style={[{color: centerColor, fontFamily: 'Inter-Bold', fontSize: size * 0.24}, tabular]}>
              {centerValue}
            </Text>
          )}
          {centerLabel ? (
            <Text style={{color: COLORS.text_muted, fontFamily: 'Inter-SemiBold', fontSize: 9, letterSpacing: 0.6, textTransform: 'uppercase', marginTop: 1}}>
              {centerLabel}
            </Text>
          ) : null}
        </View>
      )}
    </View>
  );
};

/**
 * Mini bar sparkline. `data`: [numbers]. The last bar is highlighted
 * gold; the rest are a muted navy. Gives a "trend / life" read to the
 * collection card without the weight of a full chart.
 */
export const Sparkline = ({
  data = [],
  width = 220,
  height = 56,
  barColor = 'rgba(21,37,53,0.18)',
  lastColor = COLORS.keystone_gold,
  gap = 6,
}) => {
  if (!data.length) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  // Scale from a baseline near the min (not zero) so close-together
  // values still show month-to-month variation. Smallest bar keeps a
  // visible floor.
  const minFrac = 0.4;
  const barW = (width - gap * (data.length - 1)) / data.length;
  return (
    <Svg width={width} height={height}>
      {data.map((v, i) => {
        const frac = minFrac + (1 - minFrac) * ((v - min) / range);
        const h = Math.max(6, frac * (height - 4));
        const x = i * (barW + gap);
        const y = height - h;
        const isLast = i === data.length - 1;
        return (
          <Rect
            key={i}
            x={x}
            y={y}
            width={barW}
            height={h}
            rx={Math.min(4, barW / 2)}
            fill={isLast ? lastColor : barColor}
          />
        );
      })}
    </Svg>
  );
};

/**
 * Smooth area sparkline (line + soft gold fill) for hero trends.
 */
export const AreaTrend = ({data = [], width = 300, height = 64}) => {
  if (data.length < 2) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const stepX = width / (data.length - 1);
  const pts = data.map((v, i) => {
    const x = i * stepX;
    const y = height - 6 - ((v - min) / range) * (height - 12);
    return [x, y];
  });
  const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0]},${p[1]}`).join(' ');
  const area = `${line} L${width},${height} L0,${height} Z`;
  return (
    <Svg width={width} height={height}>
      <Defs>
        <SvgGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={COLORS.keystone_gold} stopOpacity="0.28" />
          <Stop offset="1" stopColor={COLORS.keystone_gold} stopOpacity="0" />
        </SvgGradient>
      </Defs>
      <Path d={area} fill="url(#areaFill)" />
      <Path d={line} stroke={COLORS.keystone_gold} strokeWidth={2.5} fill="none" strokeLinejoin="round" strokeLinecap="round" />
    </Svg>
  );
};
