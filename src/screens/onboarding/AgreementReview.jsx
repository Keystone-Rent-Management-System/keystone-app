import React from 'react';
import {StatusBar, Text, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import {useOnboarding} from '../../hooks/useOnboarding';
import {Card, Divider, Row} from '../../components/premium';
import {DemoBar, PrimaryButton, Screen, SectionLabel, usd} from '../../components/kit';

// Review and sign — reachable only after an explicit landlord approval.
//
// The lock is structural, not cosmetic: the server (fixture) omits the
// agreement object entirely until the landlord has approved, so this
// screen has nothing to render before then and says so. There is no
// "agreement ready" boolean that a bug could flip early, and a completed
// background check cannot reach this screen on its own.
//
// LIABILITY IS QUOTED FROM THE AGREEMENT. Amina is liable for her own
// $1,000, not the villa's $5,000 — that is a term of the document, read
// from `agreement.liability`, never inferred from the property or the
// landlord's preference.

const fmt = iso =>
  iso
    ? new Date(iso).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : '—';

const AgreementReview = () => {
  const nav = useNavigation();
  const {status} = useOnboarding();
  const agreement = status?.agreement;

  // Review and ceremony are separate acts: this screen is for READING,
  // and the signature happens in the in-app signing ceremony (BoldSign
  // embedded in live mode, labelled simulation in demo).
  const onSign = () => nav.navigate('onboarding__sign');

  if (!agreement) {
    return (
      <Screen title="Agreement" back="Application">
        <StatusBar barStyle="dark-content" backgroundColor="#F4F2EC" />
        <Card>
          <Text className="text-keystone_navy font-inter-semibold text-[15px]">
            Not ready yet
          </Text>
          <Text className="text-keystone_slate font-inter text-[13px] leading-5 mt-1">
            Your agreement unlocks once {status?.landlord ?? 'your landlord'}{' '}
            has reviewed your application and approved it.
          </Text>
        </Card>
      </Screen>
    );
  }

  return (
    <Screen
      title="Your agreement"
      back="Application"
      stickyFooter={
        <View>
          <PrimaryButton label="Continue to signing" onPress={onSign} />
          <Text className="text-keystone_slate font-inter text-xs leading-5 mt-3 text-center">
            Signing creates a binding tenancy for {agreement.space}.
          </Text>
        </View>
      }>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F2EC" />

      {status?.demo ? (
        <View
          style={{
            backgroundColor: 'rgba(205,160,0,0.14)',
            borderRadius: 12,
            paddingVertical: 10,
            paddingHorizontal: 14,
            marginBottom: 16,
          }}>
          <Text
            style={{color: '#7A6100', fontFamily: 'Inter-SemiBold', fontSize: 13}}>
            Demo — this is not a real agreement
          </Text>
        </View>
      ) : null}

      <Text className="text-keystone_slate font-inter text-[15px] leading-6 mb-4">
        {agreement.landlord} approved your application for {agreement.space} at{' '}
        {agreement.property}. Read the terms below before you sign.
      </Text>

      <View>
        <SectionLabel>What you’re agreeing to</SectionLabel>
        <Card>
          <Row label="Your rent" value={`${usd(agreement.monthlyRent)}/mo`} bold />
          <Divider />
          <Row label="Deposit" value={usd(agreement.deposit)} />
          <Divider />
          <Row label="Room" value={agreement.space} />
          <Divider />
          <Row label="Starts" value={fmt(agreement.startDate)} />
          <Divider />
          <Row label="Ends" value={fmt(agreement.endDate)} />
          <Divider />
          <Row label="Landlord" value={agreement.landlord} />
        </Card>
      </View>

      {/* The single most consequential term for a per-room tenancy. */}
      <View className="mt-5">
        <SectionLabel>What you’re responsible for</SectionLabel>
        <Card>
          <Text className="text-keystone_navy font-inter text-[15px] leading-6">
            {agreement.liability?.summary}
          </Text>
          {agreement.liability?.type === 'PER_ROOM' ? (
            <>
              <Divider style={{marginVertical: 12}} />
              <Row
                label="Whole villa rent"
                value={`${usd(agreement.liability.villaRent)}/mo`}
              />
              <Divider />
              <Row
                label="Your share"
                value={`${usd(agreement.liability.yourShare)}/mo`}
                bold
              />
            </>
          ) : null}
        </Card>
      </View>

      {status?.roommates?.length ? (
        <View className="mt-5">
          <SectionLabel>Who else lives here</SectionLabel>
          <Card style={{paddingVertical: 0, paddingHorizontal: 16}}>
            {status.roommates.map((r, i) => (
              <View key={r.id}>
                {i > 0 && <Divider />}
                <View style={{paddingVertical: 12}}>
                  <Text className="text-keystone_navy font-inter-semibold text-sm">
                    {r.name}
                  </Text>
                  <Text className="text-text_muted font-inter text-xs mt-0.5">
                    {r.space}
                  </Text>
                </View>
              </View>
            ))}
          </Card>
        </View>
      ) : null}
    
      {/* Present on every journey screen, not just the
          checklist — the states in between are where the sequence
          actually gets judged. */}
      <DemoBar />
      <View style={{height: 96}} />
    </Screen>
  );
};

export default AgreementReview;
