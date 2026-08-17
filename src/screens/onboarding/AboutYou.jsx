import React, {useState} from 'react';
import {StatusBar, Text, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import {useOnboarding, useOnboardingAction} from '../../hooks/useOnboarding';
import OnboardingServices from '../../services/OnboardingServices';
import {Card} from '../../components/premium';
import {DemoBar, FormField, PrimaryButton, Screen} from '../../components/kit';
import {toast} from '../../utils/toast';
import {getError} from '../../utils/getError';

// "About you" — the applicant's own details.
//
// DELIBERATELY COLLECTS NO IDENTIFIERS. No SSN, no date of birth, no
// government ID, no document upload. Those belong to a real screening
// flow with a real provider and counsel-reviewed authorization; in a demo
// they would be sensitive data collected for nothing. Name, contact and
// move-in date are enough to demonstrate the journey.

const AboutYou = () => {
  const nav = useNavigation();
  const {status} = useOnboarding();

  const [fullName, setFullName] = useState(status?.applicant ?? '');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const submit = useOnboardingAction(payload =>
    OnboardingServices.submitAboutYou(payload),
  );

  const canSubmit = fullName.trim().length > 1 && email.trim().length > 3;

  const onSubmit = async () => {
    try {
      await submit.mutateAsync({fullName, email, phone});
    } catch (err) {
      toast.show(
        `We couldn’t save that — ${getError(err)}. Nothing was submitted.`,
        toast.LONG,
      );
      return;
    }
    nav.goBack();
  };

  return (
    <Screen
      title="About you"
      back="Application"
      stickyFooter={
        <PrimaryButton
          label={submit.isPending ? 'Saving…' : 'Continue'}
          disabled={!canSubmit || submit.isPending}
          onPress={onSubmit}
        />
      }>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F2EC" />

      <Text className="text-keystone_slate font-inter text-[15px] leading-6 mb-5">
        {status?.landlord ?? 'Your landlord'} will see this with your
        application for {status?.space ?? 'your room'}.
      </Text>

      <FormField
        label="Full name"
        value={fullName}
        onChangeText={setFullName}
        style={{marginBottom: 14}}
      />
      <FormField
        label="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        style={{marginBottom: 14}}
      />
      <FormField
        label="Phone"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        style={{marginBottom: 14}}
      />

      <Card>
        <Text className="text-keystone_slate font-inter text-[13px] leading-5">
          We don’t ask for your Social Security number or ID here. If a
          background check needs anything more, you’ll be asked before it runs.
        </Text>
      </Card>
    
      {/* Present on every journey screen, not just the
          checklist — the states in between are where the sequence
          actually gets judged. */}
      <DemoBar />
      <View style={{height: 96}} />
    </Screen>
  );
};

export default AboutYou;
