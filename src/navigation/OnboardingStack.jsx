import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';

import OnboardingChecklist from '../screens/onboarding/OnboardingChecklist';
import AboutYou from '../screens/onboarding/AboutYou';
import ScreeningStep from '../screens/onboarding/ScreeningStep';
import IdentityCheck from '../screens/onboarding/IdentityCheck';
import AgreementReview from '../screens/onboarding/AgreementReview';
import AgreementSign from '../screens/onboarding/AgreementSign';
import Help from '../screens/tenant_home/Help';

const Stack = createStackNavigator();

// What an applicant can reach before they are a tenant: the checklist,
// the steps they can act on, Help, and Sign out (rendered on the
// checklist itself). Nothing else — no tabs, no Home, no Pay. Those
// describe a tenancy that does not exist yet, and showing them would let
// someone browse a home they have not been approved for.

const OnboardingStack = () => (
  <Stack.Navigator
    screenOptions={{headerShown: false}}
    initialRouteName="onboarding__checklist">
    <Stack.Screen name="onboarding__checklist" component={OnboardingChecklist} />
    <Stack.Screen name="onboarding__about" component={AboutYou} />
    {/* Demo-only identity step. The screen itself refuses to render
        without `identityVerification`, which is false outside
        __DEV__ + Fixtures — so in a real build this route exists but
        leads to an honest "not available yet". */}
    <Stack.Screen name="onboarding__identity" component={IdentityCheck} />
    <Stack.Screen
      name="onboarding__screening_consent"
      component={ScreeningStep}
    />
    <Stack.Screen name="onboarding__agreement" component={AgreementReview} />
    {/* In-app signing ceremony — BoldSign embedded link in live mode,
        labelled simulation in demo. See BE_ASKS_MOBILE §T17. */}
    <Stack.Screen name="onboarding__sign" component={AgreementSign} />
    <Stack.Screen name="help" component={Help} />
  </Stack.Navigator>
);

export default OnboardingStack;
