import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {LeaseExpiry} from '@/screens';
import Screening from '../../screens/landlord_home/screening/Screening';
import ScreeningReport from '../../screens/landlord_home/screening/ScreeningReport';

const Stack = createStackNavigator();

// Leases tab. Tenant screening lives here (design 4b): a vacant or
// expiring unit's natural next step is finding the next tenant — not
// a new tab. All screens draw their own kit Screen headers (S2).
const LeasesStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      animationEnabled: true,
    }}
    initialRouteName="lease_expiry">
    <Stack.Screen name="lease_expiry" component={LeaseExpiry} />
    <Stack.Screen name="screening" component={Screening} />
    <Stack.Screen name="screening_report" component={ScreeningReport} />
  </Stack.Navigator>
);

export default LeasesStack;
