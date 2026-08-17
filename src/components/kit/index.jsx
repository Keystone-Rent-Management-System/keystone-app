import React, {useRef, useState} from 'react';
import {
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import COLORS from '../../constants/Theme';
import {Card, IconChip} from '../premium';
import Icon from '../premium/icons';

// ── Keystone kit — the Phase-3 component contracts ─────────────────
// Each component encodes the testable rules from the design-system
// spec (Keystone Kit 1a–1h) so the P0 bug classes are unrepresentable:
//   HeroCard    H1–H7  (navy hero clipping)
//   Screen      S1–S5  (status-bar overlap, "default" headers)
//   StatusChip  C1–C4  (chip clipping, AA text colors)
//   Buttons     K2–K4  · FormField/ConsentBlock L1–L5
//   Timeline/EmptyState T1–T3 · money.js D1–D4
// Existing premium primitives (Card, IconChip, charts, motion) stay
// the base layer; kit components compose them.

const NAVY = COLORS.keystone_navy;
const GOLD = COLORS.keystone_gold;
const CREAM = COLORS.keystone_cream;
const CANVAS = COLORS.keystone_canvas;
const SLATE = COLORS.keystone_slate;
const HAIRLINE = COLORS.keystone_hairline;
const tabular = {fontVariant: ['tabular-nums']};

export * from './money';
export {PhotoCaptureTile, PhotoThumbRow, PhotoCountChip, pickPhoto} from './photo';

// ── HeroCard — the navy hero, contract H1–H7 ───────────────────────
// H1 padding 20, nothing outside it. H2 content-driven height.
// H3 bounded label/badge flex row. H4 sub clamps at 2 lines.
// H5 CTA inside padding, cream fill. H6 caller owns the 24px gap.
export const HeroCard = ({
  label,
  badge, // {text, dot?: 'success'|'pending'|'danger'} — cream-on-tint per C2
  amount, // string, pre-formatted (usd())
  amountSize = 40,
  sub,
  cta, // {label, onPress, disabled}
  footnote, // 13px reassurance line BELOW the CTA (2c), clamps at 2
  children,
  style,
}) => (
  <Card feature style={style}>
    {(label || badge) && (
      <View style={h.labelRow}>
        {label ? (
          <Text numberOfLines={1} ellipsizeMode="tail" style={h.label}>
            {label}
          </Text>
        ) : (
          <View style={{flex: 1}} />
        )}
        {badge ? (
          <View style={h.badge}>
            {badge.dot ? (
              <View
                style={[
                  h.dot,
                  {
                    backgroundColor:
                      badge.dot === 'pending'
                        ? COLORS.c_pending
                        : badge.dot === 'danger'
                        ? COLORS.c_danger
                        : COLORS.c_success,
                  },
                ]}
              />
            ) : null}
            <Text numberOfLines={1} ellipsizeMode="tail" style={h.badgeText}>
              {badge.text}
            </Text>
          </View>
        ) : null}
      </View>
    )}
    {amount != null && (
      <Text style={[h.amount, tabular, {fontSize: amountSize, lineHeight: amountSize * 1.12}]}>
        {amount}
      </Text>
    )}
    {sub ? (
      <Text numberOfLines={2} ellipsizeMode="tail" style={h.sub}>
        {sub}
      </Text>
    ) : null}
    {children}
    {cta ? (
      <TouchableOpacity
        activeOpacity={0.9}
        disabled={cta.disabled}
        onPress={cta.onPress}
        style={[h.cta, cta.disabled && h.ctaDisabled]}>
        <Text style={[h.ctaText, cta.disabled && h.ctaTextDisabled]}>{cta.label}</Text>
      </TouchableOpacity>
    ) : null}
    {footnote ? (
      <Text numberOfLines={2} ellipsizeMode="tail" style={h.footnote}>
        {footnote}
      </Text>
    ) : null}
  </Card>
);

const h = StyleSheet.create({
  labelRow: {flexDirection: 'row', alignItems: 'center', gap: 12, minWidth: 0},
  label: {
    flex: 1,
    minWidth: 0,
    color: 'rgba(231,229,218,0.72)',
    fontFamily: 'Inter-SemiBold',
    fontSize: 11,
    letterSpacing: 0.9,
    textTransform: 'uppercase',
  },
  badge: {
    flexShrink: 0,
    maxWidth: '45%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(231,229,218,0.10)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    minWidth: 0,
  },
  dot: {width: 6, height: 6, borderRadius: 999, flexShrink: 0},
  badgeText: {
    color: CREAM,
    fontFamily: 'Inter-SemiBold',
    fontSize: 11,
    letterSpacing: 0.66,
    flexShrink: 1,
    textTransform: 'uppercase',
  },
  amount: {color: '#FFFFFF', fontFamily: 'Inter-Bold', letterSpacing: -0.4, marginTop: 10, marginBottom: 6},
  sub: {color: 'rgba(231,229,218,0.72)', fontFamily: 'Inter', fontSize: 15, lineHeight: 22},
  cta: {
    marginTop: 16,
    backgroundColor: CREAM,
    borderRadius: 14,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  ctaDisabled: {backgroundColor: 'rgba(231,229,218,0.25)'},
  footnote: {
    color: 'rgba(231,229,218,0.72)',
    fontFamily: 'Inter',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 12,
  },
  ctaText: {color: NAVY, fontFamily: 'Inter-SemiBold', fontSize: 17},
  ctaTextDisabled: {color: 'rgba(21,37,53,0.45)'},
});

// ── Screen — header & safe-area system, contract S1–S5 ─────────────
// S1 opaque canvas status zone; content clips beneath it.
// S2 hub vs child header variants. S3 hairline only after scroll.
// S4 sticky CTA on opaque strip above the home indicator.
// S5 title/back labels are real nouns — never "default".
// Shown when a screen's data could not be loaded. This exists because
// release builds no longer substitute fixtures for a failed request
// (see services/unavailable.js): without a visible signal, a hero that
// renders "$0" from an empty object reads as fact — "your rent is $0",
// "you collected nothing" — when the truth is that we don't know.
// Naming the failure and offering a retry is the honest version.
const LoadErrorStrip = ({onRetry}) => (
  <View style={s.errStrip}>
    <View style={{flex: 1, minWidth: 0}}>
      <Text style={s.errTitle}>We couldn’t load this</Text>
      <Text style={s.errBody}>
        The numbers below may be incomplete. Check your connection and try
        again.
      </Text>
    </View>
    {onRetry ? (
      <TouchableOpacity onPress={onRetry} hitSlop={8} style={s.errBtn}>
        <Text style={s.errBtnText}>Retry</Text>
      </TouchableOpacity>
    ) : null}
  </View>
);

export const Screen = ({
  variant = 'child', // 'hub' | 'child'
  title, // child: centered 17 SemiBold
  back, // child: parent name for "‹ Pay" (S5). Falls back to "Back".
  headerRight = null,
  logoRow = null, // hub: custom pinned row (e.g. KS mark + avatar)
  scroll = true,
  stickyFooter = null, // rendered on opaque canvas strip (S4)
  refreshControl,
  loadError = null, // truthy → "couldn't load" strip above the content
  onRetry,
  children,
  contentStyle,
}) => {
  const insets = useSafeAreaInsets();
  const nav = useNavigation();
  const [scrolled, setScrolled] = useState(false);

  const header =
    variant === 'child' ? (
      <View style={s.childBar}>
        <TouchableOpacity
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
          onPress={() => nav.goBack()}
          style={s.backBtn}>
          <Icon name="chevron-left" size={20} color={NAVY} strokeWidth={2.2} />
          {back ? (
            <Text numberOfLines={1} style={s.backText}>
              {back}
            </Text>
          ) : null}
        </TouchableOpacity>
        <Text numberOfLines={1} style={s.childTitle}>
          {title}
        </Text>
        <View style={s.rightSlot}>{headerRight}</View>
      </View>
    ) : (
      logoRow && <View style={s.hubBar}>{logoRow}</View>
    );

  const body = scroll ? (
    <ScrollView
      style={{flex: 1}}
      contentContainerStyle={[
        {padding: 20, paddingBottom: (stickyFooter ? 12 : 32) + insets.bottom},
        contentStyle,
      ]}
      scrollEventThrottle={32}
      onScroll={e => setScrolled(e.nativeEvent.contentOffset.y > 0)}
      refreshControl={refreshControl}
      showsVerticalScrollIndicator={false}>
      {loadError ? <LoadErrorStrip onRetry={onRetry} /> : null}
      {children}
    </ScrollView>
  ) : (
    <View style={[{flex: 1, padding: 20}, contentStyle]}>
      {loadError ? <LoadErrorStrip onRetry={onRetry} /> : null}
      {children}
    </View>
  );

  return (
    <View style={[s.root, {paddingTop: insets.top}]}>
      {/* S1: kit screens sit on canvas — status bar text is always dark */}
      <StatusBar barStyle="dark-content" backgroundColor={CANVAS} />
      {header}
      <View style={[s.hairline, {opacity: scrolled ? 1 : 0}]} />
      {body}
      {stickyFooter ? (
        <View style={[s.footer, {paddingBottom: Math.max(insets.bottom, 16)}]}>
          {stickyFooter}
        </View>
      ) : null}
    </View>
  );
};

const s = StyleSheet.create({
  root: {flex: 1, backgroundColor: CANVAS},
  errStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(179,32,32,0.08)',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 16,
  },
  errTitle: {color: '#B32020', fontFamily: 'Inter-SemiBold', fontSize: 15},
  errBody: {
    color: '#B32020',
    fontFamily: 'Inter',
    fontSize: 13,
    lineHeight: 18,
    marginTop: 2,
    opacity: 0.9,
  },
  errBtn: {
    backgroundColor: '#B32020',
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  errBtnText: {color: '#FFFFFF', fontFamily: 'Inter-SemiBold', fontSize: 13},
  childBar: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  backBtn: {flexDirection: 'row', alignItems: 'center', minWidth: 76, maxWidth: 110},
  backText: {color: NAVY, fontFamily: 'Inter-SemiBold', fontSize: 15, marginLeft: 2, flexShrink: 1},
  childTitle: {
    flex: 1,
    textAlign: 'center',
    color: NAVY,
    fontFamily: 'Inter-SemiBold',
    fontSize: 17,
  },
  rightSlot: {minWidth: 76, maxWidth: 110, alignItems: 'flex-end'},
  hubBar: {minHeight: 44, paddingHorizontal: 20, justifyContent: 'center'},
  hairline: {height: StyleSheet.hairlineWidth, backgroundColor: HAIRLINE},
  footer: {
    backgroundColor: CANVAS,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: HAIRLINE,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
});

// ── StatusChip — contract C1–C4 ────────────────────────────────────
// One chip: height 24, padding 4/10, radius 999, 11 SemiBold caps,
// single line + ellipsis, AA-darkened text colors (C3). On navy (C2):
// cream-on-tint with the semantic hue only as the 6px dot.
const CHIP_TONES = {
  success: {fg: '#037147', bg: 'rgba(5,166,96,0.10)'},
  pending: {fg: '#7A6100', bg: 'rgba(205,160,0,0.14)'},
  danger: {fg: '#B32020', bg: 'rgba(229,53,53,0.10)'},
  neutral: {fg: SLATE, bg: 'rgba(21,37,53,0.06)'},
};

export const StatusChip = ({label, tone = 'neutral', onDark, dot, style}) => {
  const c = CHIP_TONES[tone] ?? CHIP_TONES.neutral;
  return (
    <View
      style={[
        chip.base,
        {backgroundColor: onDark ? 'rgba(231,229,218,0.10)' : c.bg},
        style,
      ]}>
      {(onDark || dot) && tone !== 'neutral' ? (
        <View style={[chip.dot, {backgroundColor: CHIP_TONES[tone].fg}]} />
      ) : null}
      <Text
        numberOfLines={1}
        ellipsizeMode="tail"
        style={[chip.text, {color: onDark ? CREAM : c.fg}]}>
        {label}
      </Text>
    </View>
  );
};

const chip = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 24,
    borderRadius: 999,
    paddingHorizontal: 10,
    alignSelf: 'flex-start',
    maxWidth: '100%',
    minWidth: 0,
  },
  dot: {width: 6, height: 6, borderRadius: 999, flexShrink: 0},
  text: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 11,
    letterSpacing: 0.66,
    textTransform: 'uppercase',
    flexShrink: 1,
  },
});

// ── Buttons — contract K2–K4 ───────────────────────────────────────
// 52pt height, radius 14, 17 SemiBold. Disabled = same geometry,
// 35% text on 5% fill (K3) — never a gray fill of the primary.
const btnBase = {
  minHeight: 52,
  borderRadius: 14,
  alignItems: 'center',
  justifyContent: 'center',
  paddingHorizontal: 16,
  flexDirection: 'row',
  gap: 8,
};

export const PrimaryButton = ({label, onPress, disabled, onNavy, icon, style}) => (
  <TouchableOpacity
    activeOpacity={0.9}
    disabled={disabled}
    onPress={onPress}
    style={[
      btnBase,
      disabled
        ? {backgroundColor: 'rgba(21,37,53,0.05)'}
        : {backgroundColor: onNavy ? CREAM : NAVY},
      style,
    ]}>
    {icon}
    <Text
      style={{
        fontFamily: 'Inter-SemiBold',
        fontSize: 17,
        color: disabled ? 'rgba(21,37,53,0.35)' : onNavy ? NAVY : CREAM,
      }}>
      {label}
    </Text>
  </TouchableOpacity>
);

export const SecondaryButton = ({label, onPress, disabled, danger, icon, style}) => (
  <TouchableOpacity
    activeOpacity={0.85}
    disabled={disabled}
    onPress={onPress}
    style={[
      btnBase,
      {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: danger ? 'rgba(229,53,53,0.4)' : 'rgba(21,37,53,0.16)',
      },
      disabled && {opacity: 0.5},
      style,
    ]}>
    {icon}
    <Text
      style={{
        fontFamily: 'Inter-SemiBold',
        fontSize: 17,
        color: danger ? '#B32020' : NAVY,
      }}>
      {label}
    </Text>
  </TouchableOpacity>
);

// ── SectionLabel + ListRow — contract K1 ───────────────────────────
export const SectionLabel = ({children, right, style}) => (
  <View style={[{flexDirection: 'row', alignItems: 'center', marginBottom: 10}, style]}>
    <Text
      style={{
        flex: 1,
        color: SLATE,
        fontFamily: 'Inter-SemiBold',
        fontSize: 11,
        letterSpacing: 0.9,
        textTransform: 'uppercase',
      }}>
      {children}
    </Text>
    {right}
  </View>
);

/**
 * K1 list row: 40px icon chip, flex:1 text column with ellipsis,
 * bounded right slot. `chipMax` enforces C1 (50% max width in rows).
 */
export const ListRow = ({
  icon, // glyph name or node
  iconColor = GOLD,
  title,
  sub,
  right, // node (amount stack) — flexShrink 0
  chip: chipProps, // {label, tone} — rendered bounded at 50%
  chevron,
  onPress,
  last,
  style,
}) => {
  const inner = (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          paddingVertical: 14,
          borderBottomWidth: last ? 0 : StyleSheet.hairlineWidth,
          borderBottomColor: HAIRLINE,
        },
        style,
      ]}>
      {icon ? (
        <IconChip size={40}>
          {typeof icon === 'string' ? <Icon name={icon} size={20} color={iconColor} /> : icon}
        </IconChip>
      ) : null}
      <View style={{flex: 1, minWidth: 0}}>
        <Text numberOfLines={1} ellipsizeMode="tail" style={{color: NAVY, fontFamily: 'Inter-SemiBold', fontSize: 16}}>
          {title}
        </Text>
        {sub ? (
          <Text numberOfLines={1} ellipsizeMode="tail" style={{color: SLATE, fontFamily: 'Inter', fontSize: 13, marginTop: 2}}>
            {sub}
          </Text>
        ) : null}
      </View>
      {chipProps ? (
        <View style={{flexShrink: 0, maxWidth: '50%'}}>
          <StatusChip {...chipProps} />
        </View>
      ) : null}
      {right ? <View style={{flexShrink: 0, alignItems: 'flex-end'}}>{right}</View> : null}
      {chevron ? <Icon name="chevron-right" size={16} color="rgba(21,37,53,0.35)" /> : null}
    </View>
  );
  return onPress ? (
    <TouchableOpacity activeOpacity={0.7} onPress={onPress}>
      {inner}
    </TouchableOpacity>
  ) : (
    inner
  );
};

// ── FormField — contract L4/L5 ─────────────────────────────────────
// 52pt, radius 14, 13 Medium slate label above, leading icon matches
// content type, focus = 2px navy border, error = danger border + line.
export const FormField = ({
  label,
  icon, // glyph name — calendar for dates, mail, phone, lock…
  error,
  helper,
  prefix, // e.g. "🇺🇸 +1"
  inputRef,
  style,
  onFocus,
  onBlur,
  ...inputProps
}) => {
  const [focused, setFocused] = useState(false);
  return (
    <View style={style}>
      {label ? (
        <Text style={{color: SLATE, fontFamily: 'Inter-Medium', fontSize: 13, marginBottom: 6}}>
          {label}
        </Text>
      ) : null}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          backgroundColor: '#FFFFFF',
          borderRadius: 14,
          minHeight: 52,
          paddingHorizontal: 14,
          borderWidth: focused ? 2 : 1,
          borderColor: error
            ? COLORS.c_danger
            : focused
            ? NAVY
            : 'rgba(21,37,53,0.16)',
        }}>
        {icon ? <Icon name={icon} size={20} color={GOLD} /> : null}
        {prefix ? (
          <Text style={{color: SLATE, fontFamily: 'Inter', fontSize: 17, flexShrink: 0}}>{prefix}</Text>
        ) : null}
        <TextInput
          ref={inputRef}
          placeholderTextColor="rgba(21,37,53,0.35)"
          style={{
            flex: 1,
            color: NAVY,
            fontFamily: 'Inter',
            fontSize: 17,
            paddingVertical: Platform.OS === 'ios' ? 14 : 10,
          }}
          onFocus={e => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={e => {
            setFocused(false);
            onBlur?.(e);
          }}
          {...inputProps}
        />
      </View>
      {error ? (
        <Text style={{color: '#B32020', fontFamily: 'Inter', fontSize: 12, marginTop: 4}}>{error}</Text>
      ) : helper ? (
        <Text style={{color: SLATE, fontFamily: 'Inter', fontSize: 12, marginTop: 4}}>{helper}</Text>
      ) : null}
    </View>
  );
};

/** Tappable field-shaped control (date pickers, selects). L4: calendar for dates. */
export const FieldButton = ({label, icon = 'calendar', value, placeholder, onPress, error, style}) => (
  <View style={style}>
    {label ? (
      <Text style={{color: SLATE, fontFamily: 'Inter-Medium', fontSize: 13, marginBottom: 6}}>{label}</Text>
    ) : null}
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        minHeight: 52,
        paddingHorizontal: 14,
        borderWidth: 1,
        borderColor: error ? COLORS.c_danger : 'rgba(21,37,53,0.16)',
      }}>
      <Icon name={icon} size={20} color={GOLD} />
      <Text
        numberOfLines={1}
        style={{
          flex: 1,
          fontFamily: 'Inter',
          fontSize: 17,
          color: value ? NAVY : 'rgba(21,37,53,0.35)',
        }}>
        {value ?? placeholder}
      </Text>
    </TouchableOpacity>
    {error ? (
      <Text style={{color: '#B32020', fontFamily: 'Inter', fontSize: 12, marginTop: 4}}>{error}</Text>
    ) : null}
  </View>
);

// ── ConsentBlock — contract L1–L3 ──────────────────────────────────
// Full legal copy at 15/1.5, never collapsed. DRAFT chip precedes it.
// Links slate + underline, "·"-separated. Checkbox 24px, 2px navy.
export const ConsentBlock = ({
  draft = true,
  copy,
  links = [], // [{label, onPress}]
  checked,
  onToggle,
  agreeText,
  children,
  style,
}) => (
  <View
    style={[
      {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: 'rgba(21,37,53,0.16)',
        borderRadius: 16,
        padding: 16,
      },
      style,
    ]}>
    {draft ? <StatusChip label="Draft — pending legal review" tone="pending" /> : null}
    <Text style={{color: NAVY, fontFamily: 'Inter', fontSize: 15, lineHeight: 22, marginTop: draft ? 10 : 0}}>
      {copy}
    </Text>
    {links.length ? (
      <Text style={{marginTop: 10, marginBottom: 2, fontSize: 15, lineHeight: 22}}>
        {links.map((l, i) => (
          <Text key={l.label}>
            {i > 0 ? <Text style={{color: SLATE}}> · </Text> : null}
            <Text
              onPress={l.onPress}
              style={{color: SLATE, textDecorationLine: 'underline', fontFamily: 'Inter'}}>
              {l.label}
            </Text>
          </Text>
        ))}
      </Text>
    ) : null}
    {agreeText ? (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onToggle}
        style={{flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginTop: 12}}>
        <View
          style={{
            width: 24,
            height: 24,
            borderRadius: 7,
            borderWidth: 2,
            borderColor: NAVY,
            backgroundColor: checked ? NAVY : 'transparent',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
          {checked ? <Icon name="check" size={14} color={CREAM} strokeWidth={2.6} /> : null}
        </View>
        <Text style={{flex: 1, color: NAVY, fontFamily: 'Inter', fontSize: 15, lineHeight: 21}}>
          {agreeText}
        </Text>
      </TouchableOpacity>
    ) : null}
    {children}
  </View>
);

// ── Timeline — contract T1 ─────────────────────────────────────────
// done = success dot · current = gold dot + 4px halo · upcoming =
// hollow, 45% ink copy.
export const Timeline = ({steps, style}) => (
  <View style={style}>
    {steps.map((step, i) => {
      const last = i === steps.length - 1;
      const dim = step.state === 'upcoming';
      return (
        <View key={`${step.title}-${i}`} style={{flexDirection: 'row', gap: 12}}>
          <View style={{alignItems: 'center', width: 20}}>
            {step.state === 'current' ? (
              <View
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 999,
                  backgroundColor: 'rgba(168,153,119,0.25)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <View style={{width: 12, height: 12, borderRadius: 999, backgroundColor: GOLD}} />
              </View>
            ) : step.state === 'done' ? (
              <View style={{width: 12, height: 12, borderRadius: 999, backgroundColor: COLORS.c_success, marginVertical: 4}} />
            ) : (
              <View
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 999,
                  borderWidth: 2,
                  borderColor: 'rgba(21,37,53,0.16)',
                  backgroundColor: '#fff',
                  marginVertical: 4,
                }}
              />
            )}
            {!last && <View style={{width: 2, flex: 1, backgroundColor: HAIRLINE, marginVertical: 2}} />}
          </View>
          <View style={{flex: 1, paddingBottom: last ? 4 : 16}}>
            <Text style={{fontFamily: 'Inter-SemiBold', fontSize: 15, color: dim ? 'rgba(21,37,53,0.45)' : NAVY}}>
              {step.title}
            </Text>
            {step.sub ? (
              <Text style={{fontFamily: 'Inter', fontSize: 13, marginTop: 2, color: dim ? 'rgba(59,83,102,0.6)' : SLATE}}>
                {step.sub}
              </Text>
            ) : null}
          </View>
        </View>
      );
    })}
  </View>
);

// ── EmptyState — contract T2/T3 ────────────────────────────────────
// Always names the value; always exactly one CTA.
export const EmptyState = ({icon = 'reports', title, body, ctaLabel, onPress, style}) => (
  <View
    style={[
      {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: HAIRLINE,
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
      },
      style,
    ]}>
    <IconChip size={48}>
      <Icon name={icon} size={22} color={GOLD} />
    </IconChip>
    <Text style={{color: NAVY, fontFamily: 'Inter-SemiBold', fontSize: 17, marginTop: 12, textAlign: 'center'}}>
      {title}
    </Text>
    <Text
      style={{
        color: SLATE,
        fontFamily: 'Inter',
        fontSize: 15,
        lineHeight: 22,
        marginTop: 4,
        marginBottom: 14,
        textAlign: 'center',
      }}>
      {body}
    </Text>
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={{backgroundColor: NAVY, borderRadius: 12, paddingHorizontal: 18, paddingVertical: 10}}>
      <Text style={{color: CREAM, fontFamily: 'Inter-SemiBold', fontSize: 15}}>{ctaLabel}</Text>
    </TouchableOpacity>
  </View>
);

// ── Segmented choice (urgency, condition, reminder days) ───────────
export const SegmentedChoice = ({options, value, onChange, style}) => (
  <View style={[{flexDirection: 'row', gap: 8}, style]}>
    {options.map(opt => {
      const key = opt.value ?? opt;
      const label = opt.label ?? opt;
      const sub = opt.sub; // optional second line (2e: "1st / due date")
      const active = value === key;
      return (
        <TouchableOpacity
          key={key}
          activeOpacity={0.8}
          onPress={() => onChange(key)}
          style={{
            flex: 1,
            minHeight: 44,
            borderRadius: sub ? 14 : 12,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: active ? NAVY : '#FFFFFF',
            borderWidth: 1,
            borderColor: active ? NAVY : 'rgba(21,37,53,0.16)',
            paddingHorizontal: 8,
            paddingVertical: sub ? 13 : 0,
          }}>
          <Text
            numberOfLines={1}
            style={{
              fontFamily: 'Inter-SemiBold',
              fontSize: 15,
              color: active ? CREAM : NAVY,
            }}>
            {label}
          </Text>
          {sub ? (
            <Text
              numberOfLines={1}
              style={{
                fontFamily: 'Inter-Medium',
                fontSize: 11,
                color: active ? 'rgba(231,229,218,0.72)' : SLATE,
              }}>
              {sub}
            </Text>
          ) : null}
        </TouchableOpacity>
      );
    })}
  </View>
);

// Demo walkthrough driver — renders nothing outside __DEV__ + Fixtures.
export {DemoBar} from './DemoBar';
