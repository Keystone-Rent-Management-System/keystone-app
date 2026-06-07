import React from 'react';
import {SafeAreaView, StatusBar, Text, TouchableOpacity, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {
  KeystoneLogo,
  Icon,
  FadeScaleIn,
  useCountUp,
} from '../../components/premium';
import COLORS from '../../constants/Theme';

// Front door — "quiet confidence". Keystone is a landlord-first rent-protection
// product (instant payments + insurance). The cold-open sells the wedge with
// private-banking restraint: one shield, one promise, one proof point — then
// routes the two audiences (landlord → get started; tenant → claim their home).
//
// NOTE: RENT_PROTECTED_THIS_MONTH is a PLACEHOLDER marketing figure for the
// hero proof-point. Replace it with a real, sourced number (or remove the stat)
// before any production release — do not ship a fabricated metric.
const RENT_PROTECTED_THIS_MONTH = 2400000;

const compactUsd = n => `$${(n / 1_000_000).toFixed(1)}M`;

const Welcome = () => {
  const nav = useNavigation();
  const protectedNow = useCountUp(RENT_PROTECTED_THIS_MONTH, 1600);

  return (
    <View className="flex-1 bg-keystone_navy">
      <StatusBar barStyle="light-content" backgroundColor={COLORS.keystone_navy} />
      <SafeAreaView className="flex-1">
        <View className="flex-1 px-7 pt-8 pb-7 justify-between">
          {/* Brand */}
          <View className="self-start bg-keystone_cream rounded-2xl px-3 py-2">
            <KeystoneLogo height={34} />
          </View>

          {/* Hero — lots of air, staggered settle */}
          <View>
            <FadeScaleIn delay={80}>
              <View
                className="w-16 h-16 rounded-2xl items-center justify-center mb-8"
                style={{
                  backgroundColor: 'rgba(168,153,119,0.14)',
                  borderWidth: 1,
                  borderColor: 'rgba(168,153,119,0.35)',
                }}>
                <Icon name="shield" size={28} color={COLORS.keystone_gold} />
              </View>
            </FadeScaleIn>

            <FadeScaleIn delay={160}>
              <Text
                className="text-white font-inter-bold text-5xl"
                style={{lineHeight: 50, letterSpacing: -1}}>
                Rent you{'\n'}can count{'\n'}on.
              </Text>
            </FadeScaleIn>

            <FadeScaleIn delay={260}>
              <Text className="text-white/70 font-inter text-lg mt-5 leading-relaxed">
                Paid instantly. Insured always.
              </Text>
            </FadeScaleIn>

            {/* Proof point */}
            <FadeScaleIn delay={380}>
              <View className="mt-9">
                <View
                  className="mb-4"
                  style={{height: 1, width: 64, backgroundColor: 'rgba(255,255,255,0.18)'}}
                />
                <Text
                  className="text-keystone_gold font-inter-bold text-3xl"
                  style={{fontVariant: ['tabular-nums'], letterSpacing: -0.5}}>
                  {compactUsd(protectedNow)}
                </Text>
                <Text className="text-white/55 font-inter text-sm mt-1">
                  in rent protected this month
                </Text>
              </View>
            </FadeScaleIn>
          </View>

          {/* Doors */}
          <FadeScaleIn delay={480}>
            <View>
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => nav.navigate('auth__registration_email')}
                className="bg-keystone_gold rounded-2xl py-4 flex-row items-center justify-center">
                <Text className="text-keystone_navy font-inter-bold text-base">
                  Get started
                </Text>
                <Text className="text-keystone_navy font-inter-bold text-base ml-2">→</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => nav.navigate('auth__claim')}
                className="mt-3 border border-white/25 rounded-2xl py-4 items-center">
                <Text className="text-white font-inter-semibold text-base">
                  I’m a tenant — Claim my home
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => nav.navigate('auth__login')}
                className="mt-5 items-center">
                <Text className="text-white/55 font-inter text-sm">
                  Already have an account?{' '}
                  <Text className="text-white font-inter-semibold underline">Sign in</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </FadeScaleIn>
        </View>
      </SafeAreaView>
    </View>
  );
};

export default Welcome;
