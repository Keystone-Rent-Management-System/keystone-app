import React from 'react';
import {SafeAreaView, StatusBar, Text, TouchableOpacity, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {KeystoneMark} from '../../components/premium';
import COLORS from '../../constants/Theme';

// Option A front door. Keystone is a landlord-first rent-protection
// product (instant payments + rent insurance), NOT a listings
// marketplace — so the cold-open sells the wedge and routes the two
// real audiences:
//   - Landlord  → create an account (the buyer / customer)
//   - Tenant    → sign in (they already have an account, provisioned
//                 by their landlord; a true invite-code flow is a
//                 separate slice)
// The Pallax-era Explore/listings marketplace is no longer the entry
// point (its code is parked, not deleted).

const Bullet = ({title, sub}) => (
  <View className="flex-row items-start gap-3 mb-4">
    <View className="w-2 h-2 rounded-full bg-keystone_gold mt-2" />
    <View className="flex-1">
      <Text className="text-white font-inter-semibold text-base">{title}</Text>
      <Text className="text-white/60 font-inter text-sm mt-0.5">{sub}</Text>
    </View>
  </View>
);

const Welcome = () => {
  const nav = useNavigation();

  return (
    <View className="flex-1 bg-keystone_navy">
      <StatusBar barStyle="light-content" backgroundColor={COLORS.keystone_navy} />
      <SafeAreaView className="flex-1">
        <View className="flex-1 px-6 pt-10 pb-6 justify-between">
          {/* Brand + value prop */}
          <View>
            <View className="flex-row items-center gap-2 mb-12">
              <KeystoneMark size={34} />
              <Text className="text-white font-inter-bold text-xl tracking-tight">
                Keystone
              </Text>
            </View>

            <Text className="text-white font-inter-bold text-4xl leading-tight">
              Rent, paid{'\n'}instantly.{'\n'}
              <Text className="text-keystone_gold">Protected.</Text>
            </Text>
            <Text className="text-white/70 font-inter text-base mt-4 leading-relaxed">
              Get rent in your bank the moment your tenant pays — and never
              chase a late payment again.
            </Text>

            <View className="mt-10">
              <Bullet
                title="Instant payouts"
                sub="Rent lands in your own bank in seconds — no holding account."
              />
              <Bullet
                title="Rent protection"
                sub="Your income is covered when a tenant can't pay."
              />
              <Bullet
                title="One command center"
                sub="Collections, leases, owners and maintenance in a glance."
              />
            </View>
          </View>

          {/* Two doors */}
          <View>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => nav.navigate('auth__registration_email')}
              className="bg-keystone_gold rounded-2xl py-4 items-center">
              <Text className="text-keystone_navy font-inter-bold text-base">
                I’m a landlord — Get started
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => nav.navigate('auth__login')}
              className="mt-3 border border-white/25 rounded-2xl py-4 items-center">
              <Text className="text-white font-inter-semibold text-base">
                I’m a tenant — Sign in
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => nav.navigate('auth__login')}
              className="mt-5 items-center">
              <Text className="text-white/55 font-inter text-sm">
                Already have an account?{' '}
                <Text className="text-white font-inter-semibold underline">
                  Sign in
                </Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
};

export default Welcome;
