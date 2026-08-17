import React from 'react';
import {SafeAreaView, StatusBar, Text, TouchableOpacity, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {
  KSTile,
  Icon,
  FadeScaleIn,
} from '../../components/premium';
import COLORS from '../../constants/Theme';
import {can} from '../../constants/capabilities';
import {useDevRoleStore} from '../../provider/store/devRole';

// Front door — "quiet confidence", but now it SHOWS the product and earns
// trust instead of only stating a promise:
//   • a money-landed card (rent received → counts into the bank) = the magic,
//     demonstrated, and the one anchoring visual.
//   • two benefit lines so both audiences see themselves (landlord + renter).
//   • a trust row (encryption + payment partners) — it's a money app; screen 1
//     should feel safe before it asks for a bank.
// The illustrative $1,800 card replaces the old fabricated "$Xm protected"
// stat — an honest product glimpse, not a claimed metric.


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
  const setDevRole = useDevRoleStore(s => s.setRole);

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
                {/* Promised settlement "in seconds", two-tap payments and
                    credit building on the app's front door. None of the
                    three works yet, and this is the first thing anyone
                    sees. Restore each claim as its capability ships. */}
                <Benefit who="Landlords" text="your properties, tenants and leases in one place." />
                <Benefit who="Renters" text="your lease, rent and repairs, always to hand." />
              </View>
            </FadeScaleIn>

            {/* The "Rent received · $X · Landed in your bank · just now"
                card is REMOVED. It count-up animated a specific amount
                behind a live green "Instant" dot, which reads as a real
                payment that had just settled — a fabricated money event on
                the public front door, for a settlement path that does not
                run. Restore it as an explicitly labelled illustration, or
                with real data, once §T2 ships. */}
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
                  Your landlord, your lease, your rent
                </Text>
              </View>

              {/* Cream (not the muddy bronze gold) so the dark label reads
                  with strong contrast on the navy front door. */}
              {/* Opened the removed self-registration journey. Keystone
                  is provisioned-only today, so the honest primary door is
                  signing in; new landlords are set up by the team. */}
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() =>
                  nav.navigate(
                    can('tenantSelfRegistration')
                      ? 'auth__registration_email'
                      : 'auth__login',
                  )
                }
                className="bg-keystone_cream rounded-2xl py-4 flex-row items-center justify-center">
                <Text className="text-keystone_navy font-inter-bold text-base">
                  {can('tenantSelfRegistration') ? 'Get started' : 'Sign in'}
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
                className="mt-4 items-center">
                <Text className="font-inter text-sm" style={{color: 'rgba(231,229,218,0.72)'}}>
                  Already have an account?{' '}
                  <Text className="text-keystone_cream font-inter-semibold underline">
                    Sign in
                  </Text>
                </Text>
              </TouchableOpacity>

              {/* DEBUG-ONLY role preview, reachable WITHOUT a session.
                  The equivalent control lives in Account → "Preview as",
                  which is inside the tabs — so before this existed, the
                  only way into preview was a default that forced every
                  debug build into the protected tree from launch, and the
                  only way out was a screen that default had put you in.
                  Preview is now opt-in from here. Stripped from release
                  by __DEV__, exactly like the store it writes to. */}
              {__DEV__ ? (
                <View className="mt-8 items-center">
                  <Text
                    className="font-inter text-xs mb-2"
                    style={{color: 'rgba(231,229,218,0.4)'}}>
                    PREVIEW AS · DEBUG ONLY
                  </Text>
                  <View className="flex-row">
                    {['tenant', 'landlord'].map(r => (
                      <TouchableOpacity
                        key={r}
                        activeOpacity={0.7}
                        onPress={() => setDevRole(r)}
                        className="px-4 py-2 mx-1 rounded-lg"
                        style={{borderWidth: 1, borderColor: 'rgba(231,229,218,0.25)'}}>
                        <Text
                          className="font-inter text-xs"
                          style={{color: 'rgba(231,229,218,0.72)'}}>
                          {r}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              ) : null}
            </View>
          </FadeScaleIn>
        </View>
      </SafeAreaView>
    </View>
  );
};

export default Welcome;
