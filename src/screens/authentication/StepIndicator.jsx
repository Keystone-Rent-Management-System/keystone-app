import React from 'react';
import {Text, View} from 'react-native';
import COLORS from '../../constants/Theme';

// Registration step indicator (design 3a–3d): "STEP N OF 4" + gold
// progress segments (gold as progress fill only — F5).
const StepIndicator = ({step, total = 4}) => (
  <View style={{flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8}}>
    <Text
      style={{
        color: COLORS.keystone_slate,
        fontFamily: 'Inter-SemiBold',
        fontSize: 11,
        letterSpacing: 0.9,
        flexShrink: 0,
      }}>
      STEP {step} OF {total}
    </Text>
    <View style={{flex: 1, flexDirection: 'row', gap: 4}}>
      {Array.from({length: total}, (_, i) => (
        <View
          key={i}
          style={{
            flex: 1,
            height: 4,
            borderRadius: 999,
            backgroundColor: i < step ? COLORS.keystone_gold : 'rgba(21,37,53,0.10)',
          }}
        />
      ))}
    </View>
  </View>
);

export default StepIndicator;
