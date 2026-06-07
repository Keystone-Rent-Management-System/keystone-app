import React from 'react';
import {SafeAreaView, StatusBar, Text, TouchableOpacity, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {
  KeystoneLogo,
  Icon,
  IconChip,
  FadeScaleIn,
  useCountUp,
} from '../../components/premium';
import COLORS from '../../constants/Theme';

// Front door — "quiet confidence", but now it SHOWS the product and earns
// trust instead of only stating a promise:
//   • a money-landed card (rent received → counts into the bank) = the magic,
//     demonstrated, and the one anchoring visual.
//   • two benefit lines so both audiences see themselves (landlord + renter).
//   • a trust row (encryption + payment partners) — it's a money app; screen 1
//     should feel safe before it asks for a bank.
// The illustrative $1,800 card replaces the old fabricated "$Xm protected"
// stat — an honest product glimpse, not a claimed metric.

const EXAMPLE_RENT = 1800;
const usd = n => `$${Math.round(n).toLocaleString()}`;

const Benefit = ({who, text}) => (
  <View className="flex-row items-start mb-2.5">
    <View className="w-1.5 h-1.5 rounded-full bg-keystone_gold mt-2 mr-3" />
    <Text
      className="text-white/75 font-inter flex-1 leading-relaxed"
      style={{fontSize: 15}}>
      <Text className="text-white font-inter-semibold">{who} — </Text>
      {text}
    </Text>
  </View>
);

const Welcome = () => {
  const nav = useNavigation();
  const landed = useCountUp(EXAMPLE_RENT, 1400);

  return (
    <View className="flex-1 bg-keystone_navy">
      <StatusBar barStyle="light-content" backgroundColor={COLORS.keystone_navy} />
      <SafeAreaView className="flex-1">
        <View className="flex-1 px-7 pt-8 pb-7 justify-between">
          {/* Brand */}
          <View className="self-start bg-keystone_cream rounded-2xl px-3 py-2">
            <KeystoneLogo height={34} />
          </View>

          {/* Hero */}
          <View>
            <FadeScaleIn delay={80}>
              <Text
                className="text-white font-inter-bold"
                style={{fontSize: 44, lineHeight: 46, letterSpacing: -1}}>
                Rent you{'\n'}can count on.
              </Text>
            </FadeScaleIn>

            <FadeScaleIn delay={180}>
              <View className="mt-5">
                <Benefit who="Landlords" text="rent in your own bank in seconds — protected." />
                <Benefit who="Renters" text="pay in two taps, and build credit doing it." />
              </View>
            </FadeScaleIn>

            {/* Money-landed moment — the magic, shown */}
            <FadeScaleIn delay={320}>
              <View
                className="mt-7 rounded-2xl p-4"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.06)',
                  borderWidth: 1,
                  borderColor: 'rgba(255,255,255,0.10)',
                }}>
                <View className="flex-row items-center">
                  <IconChip size={42} onDark>
                    <Icon name="bank" size={19} color={COLORS.keystone_gold} />
                  </IconChip>
                  <View className="flex-1 ml-3">
                    <Text className="text-white/55 font-inter text-xs">Rent received</Text>
                    <Text
                      className="text-white font-inter-bold text-2xl"
                      style={{fontVariant: ['tabular-nums'], letterSpacing: -0.5}}>
                      {usd(landed)}
                    </Text>
                  </View>
                  <View
                    className="px-2.5 py-1 rounded-full"
                    style={{backgroundColor: 'rgba(168,153,119,0.18)'}}>
                    <Text className="text-keystone_gold font-inter-semibold text-2xs uppercase tracking-wider">
                      Instant
                    </Text>
                  </View>
                </View>
                <View className="h-px bg-white/10 my-3" />
                <Text className="text-white/50 font-inter text-xs">
                  Landed in your bank · just now
                </Text>
              </View>
            </FadeScaleIn>
          </View>

          {/* Trust + doors */}
          <FadeScaleIn delay={460}>
            <View>
              <View className="flex-row items-center justify-center mb-5">
                <Icon name="shield" size={13} color="rgba(255,255,255,0.45)" />
                <Text className="text-white/45 font-inter text-xs ml-1.5">
                  Bank-level encryption · Powered by Dwolla & Plaid
                </Text>
              </View>

              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => nav.navigate('auth__registration_email')}
                className="bg-keystone_gold rounded-2xl py-4 flex-row items-center justify-center">
                <Text className="text-keystone_navy font-inter-bold text-base">Get started</Text>
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
                className="mt-4 items-center">
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
