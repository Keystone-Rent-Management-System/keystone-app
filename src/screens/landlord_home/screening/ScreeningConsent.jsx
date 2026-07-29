import React, {useState} from 'react';
import {StatusBar, Text, ToastAndroid, View} from 'react-native';

import {
  ConsentBlock,
  PrimaryButton,
  Screen,
} from '../../../components/kit';
import COLORS from '../../../constants/Theme';

// Screening — applicant side, FCRA consent step (design 4d, NEW
// feature). Screening consent is FCRA-sensitive: the full copy stays
// visible (never collapsed, L1) with the DRAFT badge until legal
// sign-off (L2). Reached by the applicant from the screening invite
// deep link (route registered in Main; email/link wiring lands with
// the BE). This is a soft inquiry — stated plainly.

const CONSENT_COPY =
  'By continuing, you authorize Keystone and its consumer-reporting ' +
  'partner to obtain your credit report, eviction history, and criminal ' +
  'background records to evaluate your rental application for this unit, ' +
  "as permitted by the Fair Credit Reporting Act (FCRA). You'll get a " +
  "copy of your report, and if the decision is adverse you'll receive " +
  "the notice the law requires. This is a soft inquiry — it won't lower " +
  'your credit score.';

const StepDone = ({children}) => (
  <View style={{flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6}}>
    <Text style={{color: '#037147', fontFamily: 'Inter-SemiBold', fontSize: 15}}>✓</Text>
    <Text style={{color: COLORS.keystone_navy, fontFamily: 'Inter', fontSize: 15}}>
      {children}
    </Text>
  </View>
);

const ScreeningConsent = ({route}) => {
  const unitLabel =
    route?.params?.unitLabel ?? 'Unit 7C · 128 Magnolia Ave, Austin, TX';
  const [agreed, setAgreed] = useState(false);

  return (
    <Screen
      title="Your consent"
      back="Application"
      stickyFooter={
        <PrimaryButton
          label="Run my screening"
          disabled={!agreed}
          onPress={() =>
            ToastAndroid.show(
              'Screening started — report goes to you and the landlord',
              ToastAndroid.LONG,
            )
          }
        />
      }>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F2EC" />

      <Text
        style={{
          color: COLORS.keystone_slate,
          fontFamily: 'Inter-SemiBold',
          fontSize: 11,
          letterSpacing: 0.9,
          marginBottom: 8,
        }}>
        STEP 3 OF 3
      </Text>
      <Text
        style={{
          color: COLORS.keystone_navy,
          fontFamily: 'Inter-Bold',
          fontSize: 28,
          letterSpacing: -0.3,
          marginBottom: 6,
        }}>
        Your consent
      </Text>
      <Text
        style={{
          color: COLORS.keystone_slate,
          fontFamily: 'Inter',
          fontSize: 15,
          lineHeight: 22,
          marginBottom: 12,
        }}>
        Applying for {unitLabel}
      </Text>

      <View style={{marginBottom: 16}}>
        <StepDone>Identity verified</StepDone>
        <StepDone>Income documents · 2 uploads</StepDone>
      </View>

      <ConsentBlock
        copy={CONSENT_COPY}
        links={[
          {
            label: 'Summary of your FCRA rights',
            onPress: () =>
              ToastAndroid.show('Opens the CFPB FCRA summary', ToastAndroid.SHORT),
          },
        ]}
        checked={agreed}
        onToggle={() => setAgreed(a => !a)}
        agreeText="I have read the above and authorize this screening for my rental application."
      />
    </Screen>
  );
};

export default ScreeningConsent;
