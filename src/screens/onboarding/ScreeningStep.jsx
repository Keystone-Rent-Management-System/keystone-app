import React from 'react';
import {StatusBar, Text, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import {useOnboarding, useOnboardingAction} from '../../hooks/useOnboarding';
import OnboardingServices from '../../services/OnboardingServices';
import {Card, Divider} from '../../components/premium';
import {DemoBar, PrimaryButton, Screen} from '../../components/kit';
import {toast} from '../../utils/toast';
import {getError} from '../../utils/getError';

// Background check — the applicant's decision point.
//
// WHAT THIS IS NOT: a completed FCRA authorization. Written authorization
// and permissible purpose, and the adverse-action sequence that has to
// follow a decline, are legal design work that needs counsel (see the FTC
// guidance for landlords and the CFPB guidance on an applicant's right to
// the report and to dispute it). Approximating that in a fixture would
// produce an authorization record that is worth nothing and might be
// relied on.
//
// So in Fixtures mode this advances the demo and stores nothing, and says
// so on screen. In a live build the request fails and the failure is
// shown — it never silently "succeeds".
//
// The result is never reported to the applicant as a verdict. When the
// check finishes the tenant is told it is complete and with the landlord.
// "Passed", "approved" and "strong applicant" are the landlord's
// conclusions to draw, not ours to announce.

const ScreeningStep = () => {
  const nav = useNavigation();
  const {status} = useOnboarding();
  const needsInfo = status?.state === 'SCREENING_NEEDS_INFORMATION';

  const consent = useOnboardingAction(() =>
    OnboardingServices.giveScreeningConsent(),
  );

  const onConsent = async () => {
    try {
      await consent.mutateAsync();
    } catch (err) {
      toast.show(
        `We couldn’t start the check — ${getError(err)}. Nothing was submitted.`,
        toast.LONG,
      );
      return;
    }
    nav.goBack();
  };

  return (
    <Screen
      title="Background check"
      back="Application"
      stickyFooter={
        needsInfo ? null : (
          <PrimaryButton
            label={consent.isPending ? 'Starting…' : 'I agree — run the check'}
            disabled={consent.isPending}
            onPress={onConsent}
          />
        )
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
            Demo — no screening report is being pulled
          </Text>
        </View>
      ) : null}

      {needsInfo ? (
        <Card>
          <Text className="text-keystone_navy font-inter-semibold text-[15px]">
            We need one more thing
          </Text>
          <Text className="text-keystone_slate font-inter text-[13px] leading-5 mt-1">
            Your background check couldn’t be completed with the details we
            have. {status?.landlord ?? 'Your landlord'} will be in touch about
            what’s missing.
          </Text>
        </Card>
      ) : (
        <>
          <Text className="text-keystone_slate font-inter text-[15px] leading-6 mb-4">
            {status?.landlord ?? 'Your landlord'} would like to run a background
            check as part of your application for {status?.space ?? 'this room'}.
          </Text>

          <Card>
            <Text className="text-keystone_navy font-inter-semibold text-[15px]">
              What happens
            </Text>
            <Text className="text-keystone_slate font-inter text-[13px] leading-5 mt-1">
              A consumer reporting agency puts together a report about you. Your
              landlord reads it and decides. The report doesn’t decide anything
              on its own.
            </Text>
            <Divider style={{marginVertical: 12}} />
            <Text className="text-keystone_navy font-inter-semibold text-[15px]">
              Your rights
            </Text>
            <Text className="text-keystone_slate font-inter text-[13px] leading-5 mt-1">
              You can ask for a free copy of the report, and dispute anything in
              it that’s wrong. If your landlord decides not to move forward
              because of it, they have to tell you.
            </Text>
            <Divider style={{marginVertical: 12}} />
            <Text className="text-keystone_navy font-inter-semibold text-[15px]">
              It’s your choice
            </Text>
            <Text className="text-keystone_slate font-inter text-[13px] leading-5 mt-1">
              Nothing runs unless you agree. You can close this and talk to your
              landlord first.
            </Text>
          </Card>

          <Text className="text-text_muted font-inter text-xs leading-5 mt-4">
            The full authorization wording is still with our lawyers. In this
            demo nothing is requested, stored, or sent to anyone.
          </Text>
        </>
      )}
    
      {/* Present on every journey screen, not just the
          checklist — the states in between are where the sequence
          actually gets judged. */}
      <DemoBar />
      <View style={{height: 96}} />
    </Screen>
  );
};

export default ScreeningStep;
