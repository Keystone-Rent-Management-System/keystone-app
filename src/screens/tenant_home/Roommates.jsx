import React from 'react';
import {
  RefreshControl,
  ScrollView,
  StatusBar,
  Text,
  View,
} from 'react-native';

import {useTenantHome} from '../../hooks/useTenantHome';
import {usd} from '../../utils/money';
import {Card, Label, Divider, Icon, IconChip, Avatar, StatusPill} from '../../components/premium';
import COLORS from '../../constants/Theme';

// Roommates — Keystone's differentiator. In a shared unit, each roommate has
// their OWN agreement: their own share, their own credit, their own liability.
// Unlike a joint-and-several lease, a roommate's missed payment is never on you,
// and your credit only reflects what YOU paid. This screen makes that legible.

const initials = name =>
  (name || '')
    .split(' ')
    .slice(0, 2)
    .map(p => p?.[0] ?? '')
    .join('')
    .toUpperCase();

const Roommates = () => {
  const {home, isRefetching, refetch} = useTenantHome();
  const hh = home?.household ?? {};
  const members = hh.members ?? [];

  return (
    <View className="flex-1 bg-keystone_canvas">
      <StatusBar barStyle="dark-content" backgroundColor="#F4F2EC" />
      <ScrollView
        contentContainerStyle={{paddingBottom: 28}}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={COLORS.keystone_gold} />
        }>
        {/* Your share */}
        <View className="px-4 pt-5">
          <Card feature>
            <Label onDark>Your share of rent</Label>
            <Text className="text-white font-inter-bold text-3xl mt-2" style={{letterSpacing: -0.5}}>
              {usd(hh.yourShare)}
              <Text className="text-white/55 font-inter text-base">/mo</Text>
            </Text>
            <Text className="text-white/55 font-inter text-xs mt-1">
              of {usd(hh.totalRent)} household rent · {hh.splitLabel ?? 'Split'}
            </Text>
          </Card>
        </View>

        {/* The differentiator */}
        <View className="px-4 mt-4">
          <Card style={{borderColor: COLORS.keystone_gold, borderWidth: 1}}>
            <View className="flex-row items-center gap-3">
              <IconChip>
                <Icon name="shield" size={19} color={COLORS.keystone_gold} />
              </IconChip>
              <Text className="text-keystone_navy font-inter-semibold text-sm flex-1">
                Your lease is yours alone
              </Text>
            </View>
            <Divider style={{marginVertical: 12}} />
            <Text className="text-text_muted font-inter text-xs leading-5">
              You only owe your share. If a roommate pays late or moves out, it’s
              never on you — and your credit reflects only the payments you make.
              Each roommate has their own agreement.
            </Text>
          </Card>
        </View>

        {/* Household */}
        <View className="px-4 mt-5">
          <Text className="text-text_muted font-inter-semibold text-xs uppercase tracking-widest ml-1 mb-3">
            Your household
          </Text>
          <Card style={{paddingVertical: 6}}>
            {members.map((m, i) => (
              <View key={m.id}>
                {i > 0 && <Divider style={{marginHorizontal: 12}} />}
                <View className="flex-row items-center px-3 py-3">
                  <Avatar initials={initials(m.name)} size={40} />
                  <View className="flex-1 ml-3">
                    <Text className="text-keystone_navy font-inter-semibold text-sm">
                      {m.name}
                      {m.you ? ' (you)' : ''}
                    </Text>
                    <Text className="text-text_muted font-inter text-xs mt-0.5">
                      {usd(m.share)}/mo share
                    </Text>
                  </View>
                  <StatusPill
                    label={m.status === 'PAID' ? 'Paid' : 'Due'}
                    tone={m.status === 'PAID' ? 'success' : 'pending'}
                  />
                </View>
              </View>
            ))}
          </Card>
          <Text className="text-text_muted font-inter text-xs mt-3 ml-1 leading-5">
            Everyone pays their own share through Keystone and builds their own
            credit. You only ever see and owe yours.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default Roommates;
