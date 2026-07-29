import React from 'react';
import {SafeAreaView, StatusBar, Text, TouchableOpacity, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {
  KSTile,
  Icon,
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
          {/* Brand — flat cream KS tile (2a: no raster artifacts on navy) */}
          <KSTile size={56} onDark style={{alignSelf: 'flex-start'}} />

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
                <Benefit who="Landlords" text="rent in your own bank in seconds, protected." />
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
                {/* H3: label column flex:1 min-width:0; chip bounded
                    at 45% with ellipsis — cannot exit the card. */}
                <View className="flex-row items-center" style={{minWidth: 0}}>
                  <Text
                    numberOfLines={1}
                    className="flex-1 font-inter-semibold text-2xs uppercase"
                    style={{color: 'rgba(231,229,218,0.72)', letterSpacing: 0.9, minWidth: 0}}>
                    Rent received
                  </Text>
                  <View
                    className="px-2.5 py-1 rounded-full flex-row items-center"
                    style={{backgroundColor: 'rgba(231,229,218,0.10)', maxWidth: '45%', flexShrink: 0}}>
                    <View
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: 999,
                        backgroundColor: COLORS.c_success,
                        marginRight: 6,
                      }}
                    />
                    <Text
                      numberOfLines={1}
                      className="text-keystone_cream font-inter-semibold text-2xs uppercase tracking-wider">
                      Instant
                    </Text>
                  </View>
                </View>
                <Text
                  className="text-white font-inter-bold"
                  style={{
                    fontSize: 34,
                    lineHeight: 40,
                    marginTop: 8,
                    fontVariant: ['tabular-nums'],
                    letterSpacing: -0.5,
                  }}>
                  {usd(landed)}
                </Text>
                <View className="h-px bg-white/10 my-3" />
                <Text className="font-inter text-xs" style={{color: 'rgba(231,229,218,0.72)'}}>
                  Landed in your bank · just now
                </Text>
              </View>
            </FadeScaleIn>
          </View>

          {/* Trust + doors */}
          <FadeScaleIn delay={460}>
            <View>
              {/* F4: trust line at cream 72% — the AA floor on navy.
                  Retires the invisible dark-on-navy pattern. */}
              <View className="flex-row items-center justify-center mb-5">
                <Icon name="shield" size={13} color="rgba(231,229,218,0.72)" />
                <Text
                  className="font-inter text-xs ml-1.5"
                  style={{color: 'rgba(231,229,218,0.72)'}}>
                  Bank-level encryption · Powered by Dwolla & Plaid
                </Text>
              </View>

              {/* Cream (not the muddy bronze gold) so the dark label reads
                  with strong contrast on the navy front door. */}
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => nav.navigate('auth__registration_email')}
                className="bg-keystone_cream rounded-2xl py-4 flex-row items-center justify-center">
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
                <Text className="font-inter text-sm" style={{color: 'rgba(231,229,218,0.72)'}}>
                  Already have an account?{' '}
                  <Text className="text-keystone_cream font-inter-semibold underline">
                    Sign in
                  </Text>
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
