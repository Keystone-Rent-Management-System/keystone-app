import React from 'react';
import {RefreshControl, StatusBar, Text, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import {useTenantHome} from '../../hooks/useTenantHome';
import {Card} from '../../components/premium';
import {
  HeroCard,
  ListRow,
  Screen,
  SectionLabel,
  eventDate,
  usd,
} from '../../components/kit';
import COLORS from '../../constants/Theme';

// My Home hub (design 6a). The Home-tab property card relocates here
// as the hub hero (per 2c); rows carry live state in sub-lines and
// count chips so the hub answers before you drill. Chips only where
// something is open — quiet rows stay quiet (C4).

const MyHomeHub = () => {
  const nav = useNavigation();
  const {home, isRefetching, refetch} = useTenantHome();
  const lease = home?.lease ?? {};
  const checklist = home?.checklist ?? {};
  const openRepairs = home?.openRepairs ?? 0;
  const renewal = home?.renewal ?? {};
  const household = home?.household ?? {};
  const deposit = home?.deposit ?? {};
  const repairs = home?.openRepairs ?? 0;

  const roomsLeft =
    checklist.status === 'IN_PROGRESS'
      ? (checklist.total ?? 0) - (checklist.completed ?? 0)
      : 0;

  return (
    <Screen
      variant="hub"
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={refetch}
          tintColor={COLORS.keystone_gold}
        />
      }
      contentStyle={{paddingTop: 16}}>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F2EC" />

      <Text className="text-keystone_navy font-inter-bold text-3xl">
        My Home
      </Text>
      <Text className="text-keystone_slate font-inter text-base mt-1 mb-5">
        Your lease, your deposit, your place.
      </Text>

      {/* Hub hero — the property card, relocated from Home (2c) */}
      <HeroCard
        label="Your home"
        badge={
          lease.endDate
            ? {text: eventDate('Ends', lease.endDate).toUpperCase()}
            : undefined
        }
        amount={`${lease.property ?? ''}${lease.unit ? ` · ${lease.unit}` : ''}`}
        amountSize={24}
        sub={`${lease.address ?? ''}${
          lease.monthlyRent ? ` · ${usd(lease.monthlyRent)}/mo` : ''
        }`}
      />

      <View className="mt-5">
        <SectionLabel>Your place</SectionLabel>
        <Card style={{paddingVertical: 0, paddingHorizontal: 16}}>
          <ListRow
            icon="lease"
            title="My lease"
            sub={`${lease.term ?? '12 months'} · ${
              lease.endDate ? eventDate('ends', lease.endDate) : ''
            } · ${(lease.documents ?? []).length} documents`}
            chip={
              lease.agreementStatus === 'PENDING'
                ? {label: 'Accept', tone: 'pending'}
                : undefined
            }
            chevron={lease.agreementStatus !== 'PENDING'}
            onPress={() => nav.navigate('lease')}
          />
          <ListRow
            icon="shield"
            title="Security deposit"
            sub={`${usd(deposit.held ?? lease.deposit)} held${
              deposit.moveInLogged ? ' · checklist logged' : ''
            }`}
            chevron
            onPress={() => nav.navigate('deposit')}
          />
          {household.isShared ? (
            <ListRow
              icon="users"
              title="Roommates"
              sub={`Your share ${usd(household.yourShare)}/mo${
                household.members?.some(m => !m.you && m.status === 'PAID')
                  ? ` · ${household.members.find(m => !m.you)?.name?.split(' ')[0]} paid`
                  : ''
              }`}
              chevron
              onPress={() => nav.navigate('roommates')}
            />
          ) : null}
          <ListRow
            icon="wrench"
            title="Repairs"
            sub={repairs > 0 ? `${repairs} in progress` : 'Report an issue · track status'}
            chip={repairs > 0 ? {label: `${repairs} open`, tone: 'pending'} : undefined}
            chevron={repairs === 0}
            onPress={() => nav.navigate('repairs')}
          />
          <ListRow
            icon="reports"
            title="Condition checklist"
            sub={
              checklist.status === 'IN_PROGRESS'
                ? `${checklist.completed} of ${checklist.total} rooms · your move-out record`
                : 'Move-in / move-out walkthrough'
            }
            chip={
              roomsLeft > 0 ? {label: `${roomsLeft} left`, tone: 'pending'} : undefined
            }
            chevron={roomsLeft === 0}
            onPress={() => nav.navigate('checklist')}
          />
          <ListRow
            icon="calendar"
            title="Renew or move out"
            sub={
              renewal.status === 'OFFERED'
                ? `Renewal offered · lease ends in ${lease.daysToEnd} days`
                : 'Give notice to vacate · respond to a renewal'
            }
            chip={
              renewal.status === 'OFFERED'
                ? {label: 'Offer', tone: 'pending'}
                : undefined
            }
            chevron={renewal.status !== 'OFFERED'}
            last
            onPress={() => nav.navigate('move_out')}
          />
        </Card>
      </View>
    </Screen>
  );
};

export default MyHomeHub;
