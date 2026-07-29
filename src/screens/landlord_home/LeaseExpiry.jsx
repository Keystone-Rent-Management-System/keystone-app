import React from 'react';
import {
  RefreshControl,
  StatusBar,
  Text,
  ToastAndroid,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useLeaseExpiry} from '../../hooks';
import {mockScreening} from '../../services/mocks';
import {Card, IconChip, Stat, Divider, Icon} from '../../components/premium';
import {
  ListRow,
  PrimaryButton,
  Screen,
  SecondaryButton,
  SectionLabel,
  StatusChip,
  eventDate,
} from '../../components/kit';
import COLORS from '../../constants/Theme';

// Leases — renewals pipeline (design 2h). The flat "expiring soon"
// list re-grouped exception-first: NEEDS ACTION vs WAITING ON
// TENANTS. The red left-border card is replaced by the danger icon
// chip + ACTION NEEDED chip (C1/C4) with inline Send renewal / Don't
// renew actions. Deviation flag (per design): the inline dual CTA is
// a "decision row" — renewal is a two-way decision.

const LeaseExpiry = () => {
  const nav = useNavigation();
  const {buckets, expiring, isPending, refetch} = useLeaseExpiry();
  const screeningReady = mockScreening.applications.filter(
    a => a.status === 'REPORT_READY',
  ).length;

  const needsAction = expiring.filter(u => u.renewalStatus === 'NOT_SENT');
  const waiting = expiring.filter(u => u.renewalStatus === 'SENT_NOT_SIGNED');
  const signed = expiring.filter(u => u.renewalStatus === 'SIGNED');

  return (
    <Screen
      variant="hub"
      refreshControl={
        <RefreshControl
          refreshing={isPending}
          onRefresh={refetch}
          tintColor={COLORS.keystone_gold}
        />
      }
      contentStyle={{paddingTop: 16}}>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F2EC" />

      <Text className="text-keystone_navy font-inter-bold text-3xl">Leases</Text>
      <Text className="text-keystone_slate font-inter text-base mt-1 mb-5">
        Upcoming renewals across your portfolio.
      </Text>

      {/* Bucket summary */}
      <Card>
        <View className="flex-row">
          <Stat label="This month" value={`${buckets?.thisMonth ?? 0}`} unit="units" />
          <View className="w-px bg-keystone_hairline" />
          <Stat
            label="Next month"
            value={`${buckets?.nextMonth ?? 0}`}
            unit="units"
            align="left"
            style={{paddingLeft: 14}}
          />
          <View className="w-px bg-keystone_hairline" />
          <Stat
            label="In 60 days"
            value={`${buckets?.inSixtyDays ?? 0}`}
            unit="units"
            align="right"
          />
        </View>
      </Card>

      {/* Screening entry — a vacant/expiring unit's next step (4b) */}
      <View className="mt-4">
        <SectionLabel>Filling vacancies</SectionLabel>
        <Card style={{paddingVertical: 0, paddingHorizontal: 16}}>
          <ListRow
            icon="users"
            title="Screening"
            sub={`${mockScreening.unit.unitName} · ${mockScreening.unit.applicantCount} applicants`}
            chip={
              screeningReady > 0
                ? {label: `${screeningReady} report ready`, tone: 'success'}
                : undefined
            }
            chevron={screeningReady === 0}
            last
            onPress={() => nav.navigate('screening')}
          />
        </Card>
      </View>

      {expiring.length === 0 && !isPending && (
        <Text className="text-text_muted font-inter text-sm text-center py-10">
          No leases expiring in the next 60 days.
        </Text>
      )}

      {/* NEEDS ACTION — decision rows */}
      {needsAction.length > 0 && (
        <View className="mt-5">
          <SectionLabel>Needs action · {needsAction.length}</SectionLabel>
          {needsAction.map(unit => (
            <Card key={unit.unitId} style={{marginBottom: 12}}>
              <View className="flex-row items-center" style={{minWidth: 0}}>
                <View
                  style={{backgroundColor: 'rgba(229,53,53,0.10)'}}
                  className="w-10 h-10 rounded-xl items-center justify-center mr-3">
                  <Icon name="lease" size={19} color={COLORS.c_danger} />
                </View>
                <View className="flex-1" style={{minWidth: 0}}>
                  <Text
                    numberOfLines={1}
                    className="text-keystone_navy font-inter-semibold text-base">
                    {unit.unitName}
                    {unit.tenantName && unit.tenantName !== '—'
                      ? ` · ${unit.tenantName}`
                      : ''}
                  </Text>
                  <Text
                    numberOfLines={1}
                    className="text-text_muted font-inter text-xs mt-0.5">
                    {eventDate('Expires', unit.expiresOn)} · in {unit.daysToExpiry}{' '}
                    days
                  </Text>
                </View>
                <View style={{flexShrink: 0, maxWidth: '45%'}}>
                  <StatusChip label="Action needed" tone="danger" />
                </View>
              </View>
              {/* Decision row — renewal is a two-way decision */}
              <View className="flex-row gap-3 mt-4">
                <PrimaryButton
                  label="Send renewal"
                  style={{flex: 1, minHeight: 44}}
                  onPress={() =>
                    ToastAndroid.show(
                      `Renewal drafted for ${unit.unitName}`,
                      ToastAndroid.SHORT,
                    )
                  }
                />
                <SecondaryButton
                  label="Don't renew"
                  style={{flex: 1, minHeight: 44}}
                  onPress={() =>
                    ToastAndroid.show(
                      'Non-renewal flow coming with BE support',
                      ToastAndroid.SHORT,
                    )
                  }
                />
              </View>
            </Card>
          ))}
        </View>
      )}

      {/* WAITING ON TENANTS */}
      {waiting.length > 0 && (
        <View className="mt-4">
          <SectionLabel>Waiting on tenants · {waiting.length}</SectionLabel>
          <Card style={{paddingVertical: 0, paddingHorizontal: 16}}>
            {waiting.map((unit, i) => (
              <ListRow
                key={unit.unitId}
                icon="lease"
                title={`${unit.unitName}${
                  unit.tenantName && unit.tenantName !== '—'
                    ? ` · ${unit.tenantName}`
                    : ''
                }`}
                sub={`${eventDate('Expires', unit.expiresOn)}${
                  unit.renewalSentOn
                    ? ` · ${eventDate('sent', unit.renewalSentOn)}`
                    : ` · in ${unit.daysToExpiry} days`
                }`}
                chip={{label: 'Awaiting signature', tone: 'pending'}}
                last={i === waiting.length - 1}
              />
            ))}
          </Card>
        </View>
      )}

      {/* SIGNED */}
      {signed.length > 0 && (
        <View className="mt-4">
          <SectionLabel>Renewed · {signed.length}</SectionLabel>
          <Card style={{paddingVertical: 0, paddingHorizontal: 16}}>
            {signed.map((unit, i) => (
              <ListRow
                key={unit.unitId}
                icon="lease"
                title={`${unit.unitName}${
                  unit.tenantName && unit.tenantName !== '—'
                    ? ` · ${unit.tenantName}`
                    : ''
                }`}
                sub={eventDate('Expires', unit.expiresOn)}
                chip={{label: 'Signed', tone: 'success'}}
                last={i === signed.length - 1}
              />
            ))}
          </Card>
        </View>
      )}
    </Screen>
  );
};

export default LeaseExpiry;
