import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';

import {
  MyHomeHub,
  Lease,
  Deposit,
  Repairs,
  ReportRepair,
  RepairDetail,
  Checklist,
  MoveOut,
  Roommates,
  Statements,
} from '@/screens';
import COLORS from '../../constants/Theme';

const Stack = createStackNavigator();

const titleStyle = {
  color: COLORS.primary,
  fontSize: 18,
  fontFamily: 'Inter-SemiBold',
};
const opts = title => ({
  headerShown: true,
  title,
  headerShadowVisible: false,
  headerTitleStyle: titleStyle,
});

// Tenant "My Home" tab — the home & landlord-feeding capture hub
// (mirrors the landlord Leases + Reports tabs).
const MyHomeStack = () => (
  <Stack.Navigator
    screenOptions={{headerShown: false, animationEnabled: true}}
    initialRouteName="my_home_hub">
    <Stack.Screen name="my_home_hub" component={MyHomeHub} options={opts('My home')} />
    <Stack.Screen name="lease" component={Lease} options={opts('My lease')} />
    <Stack.Screen name="deposit" component={Deposit} options={opts('Security deposit')} />
    <Stack.Screen name="repairs" component={Repairs} options={opts('Repairs')} />
    <Stack.Screen name="report_repair" component={ReportRepair} options={opts('Report a repair')} />
    <Stack.Screen name="repair_detail" component={RepairDetail} options={opts('Repair')} />
    <Stack.Screen name="checklist" component={Checklist} options={opts('Condition checklist')} />
    <Stack.Screen name="move_out" component={MoveOut} options={opts('Renew or move out')} />
    <Stack.Screen name="roommates" component={Roommates} options={opts('Roommates')} />
    <Stack.Screen name="statements" component={Statements} options={opts('Statement')} />
  </Stack.Navigator>
);

export default MyHomeStack;
