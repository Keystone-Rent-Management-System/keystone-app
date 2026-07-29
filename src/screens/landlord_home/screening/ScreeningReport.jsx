import React from 'react';
import {StatusBar, Text, ToastAndroid, View} from 'react-native';
import {useRoute} from '@react-navigation/native';

import {mockScreening} from '../../../services/mocks';
import {Card} from '../../../components/premium';
import {
  HeroCard,
  PrimaryButton,
  Screen,
  SecondaryButton,
  SectionLabel,
  StatusChip,
  eventDate,
} from '../../../components/kit';
import COLORS from '../../../constants/Theme';

// Screening report (design 4c, NEW feature). Plain-language verdict
// in the hero (microcopy voice); evidence rows below. Credit shows a
// BAND, not a raw score. If the landlord declines based on this
// report, federal law (FCRA) requires an adverse-action notice —
// Keystone sends it, and the screen says so before the decision.

const ScreeningReport = () => {
  const {params = {}} = useRoute();
  const report =
    mockScreening.reports[params.applicationId] ??
    Object.values(mockScreening.reports)[0];

  return (
    <Screen title="Report" back="Screening">
      <StatusBar barStyle="dark-content" backgroundColor="#F4F2EC" />

      <HeroCard
        label={`${report.applicant.toUpperCase()} · ${report.unitName.toUpperCase()}`}
        badge={{text: 'Report ready', dot: 'success'}}
        amount={report.verdict}
        amountSize={28}
        sub={report.verdictLine}
      />

      <View className="mt-5">
        <SectionLabel>
          Checks · completed {eventDate('', report.completedOn).trim()}
        </SectionLabel>
        <Card style={{paddingVertical: 0, paddingHorizontal: 16}}>
          {report.checks.map((c, i) => (
            <View
              key={c.key}
              className="flex-row items-center py-3.5"
              style={
                i < report.checks.length - 1 && {
                  borderBottomWidth: 0.5,
                  borderBottomColor: COLORS.keystone_hairline,
                }
              }>
              <View className="flex-1" style={{minWidth: 0}}>
                <Text
                  numberOfLines={1}
                  className="text-keystone_navy font-inter-semibold text-base">
                  {c.label}
                </Text>
                <Text
                  numberOfLines={1}
                  className="text-text_muted font-inter text-xs mt-0.5">
                  {c.sub}
                </Text>
              </View>
              {/* 4c: verdicts are chips; measured values read as plain
                  numbers in the right slot, not status. */}
              <View style={{flexShrink: 0, maxWidth: '50%'}}>
                {c.measure ? (
                  <Text
                    numberOfLines={1}
                    className="text-keystone_navy font-inter-bold text-base">
                    {c.value}
                  </Text>
                ) : (
                  <StatusChip label={c.value} tone={c.tone} />
                )}
              </View>
            </View>
          ))}
        </Card>
      </View>

      {/* FCRA adverse-action note — stated before the decision */}
      <Text className="text-keystone_slate font-inter text-xs mt-4 leading-5">
        If you decline based on this report, federal law (FCRA) requires an
        adverse-action notice — Keystone sends it for you.
      </Text>

      <View className="flex-row gap-3 mt-4">
        <PrimaryButton
          label="Offer the lease"
          style={{flex: 1}}
          onPress={() =>
            ToastAndroid.show(
              'Lease offer drafted — sends with BE support',
              ToastAndroid.SHORT,
            )
          }
        />
        <SecondaryButton
          label="Decline"
          style={{flex: 1}}
          onPress={() =>
            ToastAndroid.show(
              'Adverse-action notice will be sent (FCRA)',
              ToastAndroid.SHORT,
            )
          }
        />
      </View>
    </Screen>
  );
};

export default ScreeningReport;
