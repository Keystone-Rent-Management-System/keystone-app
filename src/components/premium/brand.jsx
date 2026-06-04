import React from 'react';
import {View, Text} from 'react-native';
import Svg, {Path} from 'react-native-svg';
import COLORS from '../../constants/Theme';

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
