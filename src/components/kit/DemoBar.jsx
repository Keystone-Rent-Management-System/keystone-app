import React, {useState} from 'react';
import {Text, TouchableOpacity, View} from 'react-native';

import {
  advanceDemo,
  declineDemo,
  needsInfoDemo,
  resetDemoJourney,
  useDemoOnboardingStore,
} from '../../provider/store/demoOnboarding';
import {isDemoMode} from '../../constants/capabilities';

// The walkthrough driver.
//
// Most of the onboarding journey is spent waiting on somebody else — a
// screening provider, then a landlord. That is correct product behaviour
// and completely unwalkable: there is no way to feel the sequence if half
// of it can only be reached by a backend that does not exist.
//
// This is a floating control that moves the demo along, and it is
// deliberately UGLY and always labelled. A demo affordance that looks
// like part of the product is how a simulation ends up in front of
// someone who thinks it is real.
//
// Renders nothing unless __DEV__ AND the data source is Fixtures — the
// same two locks as the demo capabilities.

const Btn = ({label, onPress, tone = 'default'}) => (
  <TouchableOpacity
    activeOpacity={0.7}
    onPress={onPress}
    style={{
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 8,
      marginRight: 6,
      backgroundColor:
        tone === 'danger' ? 'rgba(179,32,32,0.16)' : 'rgba(255,255,255,0.14)',
    }}>
    <Text
      style={{
        color: tone === 'danger' ? '#FFB4B4' : '#FFFFFF',
        fontFamily: 'Inter-SemiBold',
        fontSize: 12,
      }}>
      {label}
    </Text>
  </TouchableOpacity>
);

export const DemoBar = ({style}) => {
  const state = useDemoOnboardingStore(s => s.state);
  const [open, setOpen] = useState(false);

  if (!isDemoMode()) return null;

  return (
    <View
      pointerEvents="box-none"
      style={[
        {
          position: 'absolute',
          left: 12,
          right: 12,
          // High enough to clear the iPhone Mirroring control strip, which
          // swallows taps in the bottom ~50pt of a mirrored screen — at
          // bottom:24 the driver could not be tapped in a mirrored
          // walkthrough at all. Demo-only UI, so overlap is acceptable.
          bottom: 120,
          borderRadius: 12,
          backgroundColor: 'rgba(12,20,29,0.94)',
          paddingHorizontal: 12,
          paddingVertical: 10,
        },
        style,
      ]}>
      <TouchableOpacity activeOpacity={0.8} onPress={() => setOpen(o => !o)}>
        <Text
          style={{
            color: '#CDA000',
            fontFamily: 'Inter-SemiBold',
            fontSize: 11,
            letterSpacing: 0.4,
          }}>
          DEMO WALKTHROUGH · NOT REAL · {state.replace(/_/g, ' ')}
        </Text>
      </TouchableOpacity>

      {open ? (
        <View style={{flexDirection: 'row', flexWrap: 'wrap', marginTop: 10}}>
          <Btn label="Next step →" onPress={() => advanceDemo()} />
          <Btn label="Decline" tone="danger" onPress={() => declineDemo()} />
          <Btn label="Need more info" onPress={() => needsInfoDemo()} />
          <Btn label="Restart" onPress={() => resetDemoJourney()} />
        </View>
      ) : (
        <Text
          style={{
            color: 'rgba(255,255,255,0.55)',
            fontFamily: 'Inter',
            fontSize: 11,
            marginTop: 2,
          }}>
          Tap to drive the journey
        </Text>
      )}
    </View>
  );
};

export default DemoBar;
