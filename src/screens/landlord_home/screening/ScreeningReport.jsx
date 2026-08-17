import React from 'react';
import {StatusBar, Text, View} from 'react-native';
import {useRoute} from '@react-navigation/native';

import {demoOnly, mockScreening} from '../../../services/mocks';
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
import {toast} from '../../../utils/toast';
import {can} from '../../../constants/capabilities';

// Screening report (design 4c, NEW feature). Plain-language verdict
// in the hero (microcopy voice); evidence rows below. Credit shows a
// BAND, not a raw score. If the landlord declines based on this
// report, federal law (FCRA) requires an adverse-action notice.
// Keystone does NOT send it — saying otherwise let a landlord believe
// their obligation to the applicant was handled for them.

const ScreeningReport = () => {
  const {params = {}} = useRoute();
  // Same gate as the list. A fabricated consumer report — identity,
  // credit band, income, eviction and criminal findings about a named
  // person — must never render outside an explicit demo.
  const screening = can('tenantScreening') ? demoOnly(mockScreening) : null;
  const report =
    screening?.reports?.[params.applicationId] ??
    Object.values(screening?.reports ?? {})[0];

  if (!report) {
    return (
      <Screen title="Report" back="Screening">
        <StatusBar barStyle="dark-content" backgroundColor="#F4F2EC" />
        <HeroCard
          label="Applicant screening"
          amount="Not available yet"
          amountSize={22}
          sub="Keystone doesn’t run background checks yet, so there are no reports to read."
        />
      </Screen>
    );
  }

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
        adverse-action notice. Keystone does not send it for you.
      </Text>

      {/* Offer / Decline are DISABLED. "Decline" told the landlord an
          FCRA adverse-action notice "will be sent" — a legally required
          notice, from a screening report, with no request behind it and
          no adverse-action workflow in existence. A landlord could
          believe they had met their obligation to an applicant they
          rejected. "Offer the lease" was equally hollow. Neither may
          return until the full FCRA sequence exists (provider and report
          identity, applicant consent record, pre-adverse notice, waiting
          period, dispute path, final notice, decision audit trail) and
          counsel has reviewed the decision model. */}
      <View className="mt-4">
        <View className="flex-row gap-3">
          <PrimaryButton label="Offer the lease" style={{flex: 1}} disabled />
          <SecondaryButton label="Decline" style={{flex: 1}} disabled />
        </View>
        <Text className="text-keystone_slate font-inter text-xs leading-5 mt-3">
          Deciding on an applicant in the app isn’t available yet. Contact the
          applicant directly, and follow your usual process for declines.
        </Text>
      </View>
    </Screen>
  );
};

export default ScreeningReport;
