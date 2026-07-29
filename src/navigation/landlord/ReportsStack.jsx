import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {Portfolio, Maintenance} from '@/screens';
import ReportsHub from '../../screens/landlord_home/ReportsHub';
import {titleStyling} from '../options';

const Stack = createStackNavigator();

// Lazy-loaded Phase 4 screens — keep imports below so the bundle
// doesn't depend on those files existing during the Phase 3 cut.
import OwnerReports from '../../screens/landlord_home/OwnerReports';
import Insurance from '../../screens/landlord_home/Insurance';
import Compliance from '../../screens/landlord_home/Compliance';

const ReportsStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      animationEnabled: true,
    }}
    initialRouteName="reports__home">
    {/* Hub draws its own kit Screen title (S2) */}
    <Stack.Screen name="reports__home" component={ReportsHub} />
    <Stack.Screen name="portfolio" component={Portfolio} />
    {/* Maintenance draws its own kit Screen header (S2) */}
    <Stack.Screen name="maintenance" component={Maintenance} />
    <Stack.Screen name="owner_reports" component={OwnerReports} />
    <Stack.Screen name="insurance" component={Insurance} />
    <Stack.Screen name="compliance" component={Compliance} />
  </Stack.Navigator>
);

export default ReportsStack;
