import React from 'react';
import {StatusBar, Text, TouchableOpacity, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import {demoOnly, mockScreening} from '../../../services/mocks';
import {Card} from '../../../components/premium';
import {
  HeroCard,
  Screen,
  SectionLabel,
  StatusChip,
  eventDate,
} from '../../../components/kit';
import COLORS from '../../../constants/Theme';
import {toast} from '../../../utils/toast';
import {can} from '../../../constants/capabilities';

// Tenant screening — landlord applicants list (design 4b, NEW
// feature). Lives in Leases (a vacant/expiring unit's natural next
// step) plus a Dashboard needs-you row — not a new tab. Invite reuses
// the KS-code mechanic tenants already know. One report; the
// applicant pays the fee. BE endpoints TBD — serving mockScreening.

const CHIP = {
  REPORT_READY: {label: 'Report ready', tone: 'success'},
  IN_PROGRESS: {label: 'In progress', tone: 'pending'},
  INVITED: {label: 'Invited', tone: 'neutral'},
};

const Screening = () => {
  const nav = useNavigation();
  // Read the fixture through demoOnly like every other fixture-backed
  // screen. This imported `mockScreening` directly, so in a LIVE build a
  // landlord saw invented applicants — real-looking names attached to a
  // unit that isn't theirs — with no endpoint behind any of it.
  const screening = can('tenantScreening') ? demoOnly(mockScreening) : null;
  const unit = screening?.unit ?? {};
  const applications = screening?.applications ?? [];

  if (!screening) {
    return (
      <Screen title="Screening" back="Leases">
        <StatusBar barStyle="dark-content" backgroundColor="#F4F2EC" />
        <HeroCard
          label="Screening"
          amount="Not available yet"
          amountSize={22}
          sub="Keystone doesn’t screen applicants yet. Use your own process for now."
        />
      </Screen>
    );
  }

  return (
    <Screen title="Screening" back="Leases">
      <StatusBar barStyle="dark-content" backgroundColor="#F4F2EC" />

      <HeroCard
        label={`${unit.unitName} · ${unit.vacantLabel}`}
        badge={{text: `${unit.applicantCount} applicants`}}
        amount="Find your next tenant"
        amountSize={24}
        sub="Identity, credit, income and background — one report, applicant pays the fee."
        cta={{
          label: 'Invite an applicant',
          // Claimed an invite was sent without collecting a name, email,
          // phone, unit or expiry — and without any request.
          onPress: () =>
            toast.show(
              'Inviting applicants isn’t available yet.',
              toast.SHORT,
            ),
        }}
      />

      <View className="mt-5">
        <SectionLabel>
          Applications · {unit.unitName}
        </SectionLabel>
        <Card style={{paddingVertical: 0, paddingHorizontal: 16}}>
          {applications.map((a, i) => {
            const chip = CHIP[a.status] ?? CHIP.INVITED;
            const sub =
              a.status === 'REPORT_READY'
                ? `${eventDate('Applied', a.appliedOn)} · report ready ${eventDate('', a.reportReadyOn).trim()}`
                : a.status === 'IN_PROGRESS'
                  ? `${eventDate('Started', a.appliedOn)} · ${a.pendingItem}`
                  : `${eventDate('Invited', a.invitedOn)} · not started`;
            return (
              <TouchableOpacity
                key={a.id}
                activeOpacity={a.status === 'REPORT_READY' ? 0.7 : 1}
                disabled={a.status !== 'REPORT_READY'}
                onPress={() =>
                  nav.navigate('screening_report', {applicationId: a.id})
                }
                className="flex-row items-center py-3.5"
                style={
                  i < applications.length - 1 && {
                    borderBottomWidth: 0.5,
                    borderBottomColor: COLORS.keystone_hairline,
                  }
                }>
                <View
                  className="w-10 h-10 rounded-full items-center justify-center mr-3"
                  style={{backgroundColor: COLORS.keystone_chip}}>
                  <Text className="text-keystone_navy font-inter-semibold text-sm">
                    {a.initials}
                  </Text>
                </View>
                <View className="flex-1" style={{minWidth: 0}}>
                  <Text
                    numberOfLines={1}
                    className="text-keystone_navy font-inter-semibold text-base">
                    {a.name}
                  </Text>
                  <Text
                    numberOfLines={1}
                    className="text-text_muted font-inter text-xs mt-0.5">
                    {sub}
                  </Text>
                </View>
                <View style={{flexShrink: 0, maxWidth: '45%'}}>
                  <StatusChip label={chip.label} tone={chip.tone} />
                </View>
              </TouchableOpacity>
            );
          })}
        </Card>
        <Text className="text-keystone_slate font-inter text-xs mt-3 leading-5">
          Tap an applicant with a ready report to review it. Applicants see
          exactly what's checked before they consent (FCRA).
        </Text>
      </View>
    </Screen>
  );
};

export default Screening;
