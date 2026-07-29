import React from 'react';
import {RefreshControl, StatusBar, Text, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import {useTenantRepairs} from '../../hooks/useTenantHome';
import {Card} from '../../components/premium';
import {
  EmptyState,
  HeroCard,
  ListRow,
  Screen,
  SectionLabel,
  eventDate,
} from '../../components/kit';
import COLORS from '../../constants/Theme';

// Repairs list (design 4h): the half-clipped wrench button-card
// becomes a proper hero — label, promise line, cream CTA inside
// padding (H1/H5). Request rows gain photo counts (P5) and verb-dated
// meta ("sent Jul 24", "resolved Jul 9") per D2.

const CHIP = {
  SUBMITTED: {label: 'Submitted', tone: 'pending'},
  IN_PROGRESS: {label: 'In progress', tone: 'pending'},
  SCHEDULED: {label: 'Scheduled', tone: 'pending'},
  RESOLVED: {label: 'Resolved', tone: 'success'},
};

const Repairs = () => {
  const nav = useNavigation();
  const {repairs, isPending, isRefetching, refetch} = useTenantRepairs();

  return (
    <Screen
      title="Repairs"
      back="My Home"
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={refetch}
          tintColor={COLORS.keystone_gold}
        />
      }>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F2EC" />

      <HeroCard
        label="Something broken?"
        amount="Report it with a photo"
        amountSize={24}
        sub="Your landlord and their vendor see it the moment you send it."
        cta={{
          label: 'Report a repair',
          onPress: () => nav.navigate('report_repair'),
        }}
      />

      <View className="mt-5">
        <SectionLabel>Your requests</SectionLabel>
        {isPending ? (
          <Text className="text-text_muted font-inter text-sm ml-1">Loading…</Text>
        ) : repairs.length === 0 ? (
          <EmptyState
            icon="wrench"
            title="Nothing needs fixing"
            body="Report anything broken and it gets a vendor and a timeline — with photos as your record."
            ctaLabel="Report a repair"
            onPress={() => nav.navigate('report_repair')}
          />
        ) : (
          <Card style={{paddingVertical: 0, paddingHorizontal: 16}}>
            {repairs.map((r, i) => {
              const resolved = r.status === 'RESOLVED';
              const verb = resolved ? 'resolved' : 'sent';
              const when = resolved ? r.updatedOn : r.submittedOn;
              const metaParts = [
                r.category,
                eventDate(verb, when),
                r.photos
                  ? `${r.photos} photo${r.photos > 1 ? 's' : ''}`
                  : null,
                !resolved && r.assignedTo ? r.assignedTo : null,
              ].filter(Boolean);
              const chip =
                r.priority === 'URGENT' && !resolved
                  ? {label: 'Urgent', tone: 'danger'}
                  : CHIP[r.status] ?? {label: r.status, tone: 'neutral'};
              return (
                <ListRow
                  key={r.id}
                  icon="wrench"
                  title={r.title}
                  sub={metaParts.join(' · ')}
                  chip={chip}
                  last={i === repairs.length - 1}
                  onPress={() => nav.navigate('repair_detail', {repair: r})}
                />
              );
            })}
          </Card>
        )}
      </View>
    </Screen>
  );
};

export default Repairs;
