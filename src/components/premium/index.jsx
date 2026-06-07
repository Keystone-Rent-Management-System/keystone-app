import React from 'react';
import {Animated, Text, View, StyleSheet} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import COLORS from '../../constants/Theme';
import {useCountUp, useSweep} from './motion';

export {default as Icon} from './icons';
export {Donut, Ring, Sparkline, AreaTrend} from './charts';
export {FadeScaleIn, useCountUp} from './motion';
export {KeystoneMark, BrandLockup, KeystoneLogo} from './brand';
export {DraftBadge, ConsentRow, LegalLink} from './consent';

// ── Keystone command-center kit (light, brand-matched) ─────────────
// Mirrors the web SPA's dashboard vocabulary so mobile + web feel
// like one product:
//   • white cards, rounded, hairline navy border, soft low shadow
//   • cream/gold icon chips (h-10 w-10 rounded-lg)
//   • uppercase tracked zinc labels over navy values
//   • gold accents, web semantic status hues
//
// Composability over cleverness — every landlord screen builds from
// these so the rhythm and hierarchy stay consistent.

const NAVY = COLORS.keystone_navy;
const GOLD = COLORS.keystone_gold;
const MUTED = COLORS.text_muted;

// Tabular figures so money columns align and don't jitter on refetch.
const tabular = {fontVariant: ['tabular-nums']};

/** White card — the workhorse surface. `feature` = navy hero card. */
export const Card = ({children, feature, style, className}) => {
  if (feature) {
    // Navy hero card: a subtle diagonal gradient for depth plus a
    // hairline gold top edge — reads as a precious "panel", not a
    // flat block.
    return (
      <LinearGradient
        colors={['#1B3047', '#152535', '#0F1E2C']}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={[styles.feature, style]}>
        <View style={styles.goldEdge} />
        {children}
      </LinearGradient>
    );
  }
  return (
    <View className={className} style={[styles.card, style]}>
      {children}
    </View>
  );
};

/** Cream/gold rounded icon chip, like the web's stat-card chip. */
export const IconChip = ({children, size = 40, onDark, style}) => (
  <View
    style={[
      styles.chip,
      {
        width: size,
        height: size,
        backgroundColor: onDark ? 'rgba(255,255,255,0.10)' : COLORS.keystone_chip,
      },
      style,
    ]}>
    {children}
  </View>
);

/** Initials avatar circle (web NameAvatar). */
export const Avatar = ({initials, size = 40, style}) => (
  <View style={[styles.avatar, {width: size, height: size}, style]}>
    <Text style={styles.avatarText}>{initials}</Text>
  </View>
);

/** Small uppercase tracked label — the section/overline. */
export const Label = ({children, onDark, style}) => (
  <Text style={[styles.label, onDark && {color: 'rgba(255,255,255,0.7)'}, style]}>
    {children}
  </Text>
);

/**
 * Hero amount. `size`: 'xl'(34) 'lg'(26) 'md'(20).
 * `onDark` flips to white for the navy feature card.
 */
export const Amount = ({children, size = 'lg', onDark, color, style}) => (
  <Text
    style={[
      styles.amount,
      tabular,
      size === 'xl' && styles.amountXl,
      size === 'lg' && styles.amountLg,
      size === 'md' && styles.amountMd,
      {color: color ?? (onDark ? '#FFFFFF' : NAVY)},
      style,
    ]}>
    {children}
  </Text>
);

/** Hairline divider. */
export const Divider = ({onDark, style}) => (
  <View
    style={[
      styles.divider,
      onDark && {backgroundColor: 'rgba(255,255,255,0.12)'},
      style,
    ]}
  />
);

/** Gold progress bar that sweeps to `percent` on mount. */
export const ProgressBar = ({percent = 0, onDark, style}) => {
  const width = useSweep(percent);
  return (
    <View
      style={[
        styles.track,
        onDark && {backgroundColor: 'rgba(255,255,255,0.14)'},
        style,
      ]}>
      <Animated.View style={[styles.fill, {width}]} />
    </View>
  );
};

/**
 * Hero amount that counts up to `value` on mount. `format` turns the
 * in-flight number into a string (usd, usdCents, etc.).
 */
export const AnimatedAmount = ({value, format, ...rest}) => {
  const n = useCountUp(value ?? 0);
  return <Amount {...rest}>{format ? format(n) : Math.round(n)}</Amount>;
};

/** Trend delta pill (web semantic green/red). */
export const Delta = ({value, suffix = '%', style}) => {
  const up = (value ?? 0) >= 0;
  return (
    <View
      style={[
        styles.pill,
        {backgroundColor: up ? 'rgba(5,166,96,0.10)' : 'rgba(229,53,53,0.10)'},
        style,
      ]}>
      <Text
        style={[styles.pillText, tabular, {color: up ? COLORS.c_success : COLORS.c_danger}]}>
        {up ? '▲' : '▼'} {Math.abs(value ?? 0)}
        {suffix}
      </Text>
    </View>
  );
};

/** Status pill — tone: 'success' | 'danger' | 'pending' | 'neutral'. */
export const StatusPill = ({label, tone = 'neutral', style}) => {
  const map = {
    success: {fg: COLORS.c_success, bg: 'rgba(5,166,96,0.10)'},
    danger: {fg: COLORS.c_danger, bg: 'rgba(229,53,53,0.10)'},
    pending: {fg: COLORS.c_pending, bg: 'rgba(205,160,0,0.12)'},
    neutral: {fg: COLORS.keystone_slate, bg: 'rgba(59,83,102,0.10)'},
  };
  const c = map[tone] ?? map.neutral;
  return (
    <View style={[styles.statusPill, {backgroundColor: c.bg}, style]}>
      <Text style={[styles.statusText, {color: c.fg}]}>{label}</Text>
    </View>
  );
};

/** Label-over-value stat cell (web Card stat pattern). */
export const Stat = ({label, value, sub, valueColor, onDark, align = 'left', style}) => (
  <View style={[{flex: 1, alignItems: align === 'right' ? 'flex-end' : 'flex-start'}, style]}>
    <Text style={[styles.statLabel, onDark && {color: 'rgba(255,255,255,0.6)'}]}>
      {label}
    </Text>
    <Text
      style={[
        styles.statValue,
        tabular,
        {color: valueColor ?? (onDark ? '#FFFFFF' : NAVY)},
      ]}>
      {value}
    </Text>
    {sub ? (
      <Text style={[styles.statSub, onDark && {color: 'rgba(255,255,255,0.55)'}]}>
        {sub}
      </Text>
    ) : null}
  </View>
);

/** Key/value detail row for lists inside cards. */
export const Row = ({label, value, valueColor, sub, bold, onDark, style}) => (
  <View style={[styles.row, style]}>
    <Text
      style={[
        styles.rowLabel,
        bold && styles.rowLabelBold,
        onDark && {color: bold ? '#FFFFFF' : 'rgba(255,255,255,0.7)'},
      ]}>
      {label}
    </Text>
    <View style={styles.rowRight}>
      <Text
        style={[
          bold ? styles.rowValueBold : styles.rowValue,
          tabular,
          {color: valueColor ?? (onDark ? '#FFFFFF' : bold ? NAVY : '#2A3947')},
        ]}>
        {value}
      </Text>
      {sub ? <Text style={styles.rowSub}>{sub}</Text> : null}
    </View>
  </View>
);

const cardShadow = {
  shadowColor: NAVY,
  shadowOffset: {width: 0, height: 6},
  shadowOpacity: 0.06,
  shadowRadius: 14,
  elevation: 3,
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.keystone_hairline,
    ...cardShadow,
  },
  feature: {
    borderRadius: 20,
    padding: 20,
    overflow: 'hidden',
    shadowColor: NAVY,
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: 0.22,
    shadowRadius: 20,
    elevation: 8,
  },
  goldEdge: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: GOLD,
    opacity: 0.5,
  },
  chip: {borderRadius: 12, alignItems: 'center', justifyContent: 'center'},
  avatar: {
    borderRadius: 99,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1EFE8',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  avatarText: {color: NAVY, fontFamily: 'Inter-Bold', fontSize: 13},
  label: {
    color: MUTED,
    fontFamily: 'Inter-SemiBold',
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  amount: {fontFamily: 'Inter-Bold', letterSpacing: -0.5},
  amountXl: {fontSize: 34, lineHeight: 40},
  amountLg: {fontSize: 26, lineHeight: 32},
  amountMd: {fontSize: 20, lineHeight: 26},
  divider: {height: StyleSheet.hairlineWidth, backgroundColor: COLORS.keystone_hairline},
  track: {
    height: 8,
    borderRadius: 99,
    backgroundColor: 'rgba(21,37,53,0.07)',
    overflow: 'hidden',
  },
  fill: {height: 8, borderRadius: 99, backgroundColor: GOLD},
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 99,
  },
  pillText: {fontFamily: 'Inter-SemiBold', fontSize: 12},
  statusPill: {paddingHorizontal: 10, paddingVertical: 4, borderRadius: 99},
  statusText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 10,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  statLabel: {
    color: MUTED,
    fontFamily: 'Inter-SemiBold',
    fontSize: 10,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 5,
  },
  statValue: {fontFamily: 'Inter-Bold', fontSize: 17},
  statSub: {color: MUTED, fontFamily: 'Inter', fontSize: 11, marginTop: 2},
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  rowLabel: {color: MUTED, fontFamily: 'Inter', fontSize: 14},
  rowLabelBold: {color: NAVY, fontFamily: 'Inter-SemiBold'},
  rowRight: {flexDirection: 'row', alignItems: 'baseline', gap: 8},
  rowValue: {fontFamily: 'Inter-SemiBold', fontSize: 15},
  rowValueBold: {fontFamily: 'Inter-Bold', fontSize: 19},
  rowSub: {color: MUTED, fontFamily: 'Inter', fontSize: 12},
});
