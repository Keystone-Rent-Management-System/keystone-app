import React from 'react';
import {View, Text, Image} from 'react-native';
import Svg, {Path} from 'react-native-svg';
import COLORS from '../../constants/Theme';

// The real Keystone logo (KS monogram on stone shapes + wordmark).
// Transparent PNG, so it sits cleanly on any surface.
const LOGO = require('../../assets/images/keystone-logo.png');

/** The actual Keystone logo image. Default height 40, width auto. */
export const KeystoneLogo = ({height = 40, style}) => (
  <Image
    source={LOGO}
    resizeMode="contain"
    style={[{height, width: height * 1.18}, style]}
  />
);

// Keystone monogram — an architectural keystone (the wedge stone at
// the crown of an arch): wider at the top, tapering down, with an
// inset facet line. Used in the app header and the native splash.

export const KeystoneMark = ({size = 28, color = COLORS.keystone_gold, inset = COLORS.keystone_navy}) => (
  <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    {/* outer keystone */}
    <Path d="M15 9 L33 9 L29 39 L19 39 Z" fill={color} />
    {/* inset facet for a carved, dimensional read */}
    <Path d="M21 14 L27 14 L24.6 34 L23.4 34 Z" fill={inset} opacity={0.18} />
  </Svg>
);

/**
 * Flat KS monogram tile (design 2a–2c) — the app-header brand mark.
 * Navy tile with cream KS on light canvas; `onDark` flips to a cream
 * tile with navy KS for navy screens. No raster artwork.
 */
export const KSTile = ({size = 40, onDark = false, style}) => (
  <View
    style={[
      {
        width: size,
        height: size,
        borderRadius: size >= 48 ? 16 : 12,
        backgroundColor: onDark ? COLORS.keystone_cream : COLORS.keystone_navy,
        alignItems: 'center',
        justifyContent: 'center',
      },
      style,
    ]}>
    <Text
      style={{
        color: onDark ? COLORS.keystone_navy : COLORS.keystone_cream,
        fontFamily: 'Inter-Bold',
        fontSize: size >= 48 ? 15 : 12,
        letterSpacing: size >= 48 ? 0.6 : 0,
      }}>
      KS
    </Text>
  </View>
);

/** Horizontal brand lockup: mark + KEYSTONE wordmark. */
export const BrandLockup = ({size = 24, color = COLORS.keystone_navy, markColor}) => (
  <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
    <KeystoneMark size={size} color={markColor ?? COLORS.keystone_gold} inset={color} />
    <Text
      style={{
        color,
        fontFamily: 'Inter-Bold',
        fontSize: size * 0.62,
        letterSpacing: 3,
      }}>
      KEYSTONE
    </Text>
  </View>
);
