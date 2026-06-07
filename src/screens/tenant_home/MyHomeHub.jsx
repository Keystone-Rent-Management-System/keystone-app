import React from 'react';
import {
  RefreshControl,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import {useTenantHome} from '../../hooks/useTenantHome';
import {Card, IconChip, Icon, StatusPill} from '../../components/premium';
import COLORS from '../../constants/Theme';

// My Home — the home & landlord-feeding hub. Everything about the unit:
// lease, deposit, repairs, the move-in/out checklist, and moving out.
// Mirrors the landlord Reports hub.

const MyHomeHub = () => {
  const nav = useNavigation();
  const {home, isRefetching, refetch} = useTenantHome();
  const lease = home?.lease ?? {};
  const checklist = home?.checklist ?? {};
  const openRepairs = home?.openRepairs ?? 0;
  const renewal = home?.renewal ?? {};

  const HUB = [
    {
      key: 'lease',
      icon: 'lease',
      title: 'My lease',
      sub: `${lease.property ?? ''}${lease.unit ? ` · ${lease.unit}` : ''}`,
      badge: lease.agreementStatus === 'PENDING' ? {label: 'Accept', tone: 'pending'} : null,
    },
    {
      key: 'deposit',
      icon: 'shield',
      title: 'Security deposit',
      sub: 'What’s held & track your return',
    },
    {
      key: 'repairs',
      icon: 'wrench',
      title: 'Repairs',
      sub: 'Report an issue · track status',
      badge: openRepairs > 0 ? {label: `${openRepairs} open`, tone: 'danger'} : null,
    },
    {
      key: 'checklist',
      icon: 'reports',
      title: 'Condition checklist',
      sub: 'Move-in / move-out walkthrough',
      badge:
        checklist.status === 'IN_PROGRESS'
          ? {label: `${checklist.completed}/${checklist.total}`, tone: 'pending'}
          : null,
    },
    {
      key: 'move_out',
      icon: 'scale',
      title: 'Move out or renew',
      sub: 'Give notice to vacate · respond to a renewal',
      badge:
        renewal.status === 'OFFERED' ? {label: 'Renewal', tone: 'pending'} : null,
    },
  ];

  return (
    <ScrollView
      className="flex-1 bg-keystone_canvas"
      contentContainerStyle={{paddingTop: 16, paddingBottom: 24}}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={COLORS.keystone_gold} />
      }>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F2EC" />
      {HUB.map(item => (
        <TouchableOpacity
          key={item.key}
          onPress={() => nav.navigate(item.key)}
          activeOpacity={0.85}
          className="mx-4 mb-3">
          <Card>
            <View className="flex-row items-center gap-3">
              <IconChip size={44}>
                <Icon name={item.icon} size={21} />
              </IconChip>
              <View className="flex-1">
                <Text className="text-keystone_navy font-inter-semibold text-base">
                  {item.title}
                </Text>
                <Text className="text-text_muted font-inter text-xs mt-0.5">
                  {item.sub}
                </Text>
              </View>
              {item.badge ? (
                <StatusPill label={item.badge.label} tone={item.badge.tone} />
              ) : (
                <Text className="text-text_muted font-inter-semibold text-lg">›</Text>
              )}
            </View>
          </Card>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

export default MyHomeHub;
