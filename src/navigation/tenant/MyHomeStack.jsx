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
import ChecklistRoom from '../../screens/tenant_home/ChecklistRoom';

const Stack = createStackNavigator();

// Tenant "My Home" tab — the home & landlord-feeding capture hub
// (mirrors the landlord Leases + Reports tabs).
const MyHomeStack = () => (
  <Stack.Navigator
    screenOptions={{headerShown: false, animationEnabled: true}}
    initialRouteName="my_home_hub">
    {/* All routes draw their own kit Screen headers (S2). */}
    <Stack.Screen name="my_home_hub" component={MyHomeHub} />
    <Stack.Screen name="lease" component={Lease} />
    <Stack.Screen name="deposit" component={Deposit} />
    <Stack.Screen name="repairs" component={Repairs} />
    <Stack.Screen name="report_repair" component={ReportRepair} />
    <Stack.Screen name="repair_detail" component={RepairDetail} />
    <Stack.Screen name="checklist" component={Checklist} />
    <Stack.Screen name="checklist_room" component={ChecklistRoom} />
    <Stack.Screen name="move_out" component={MoveOut} />
    <Stack.Screen name="roommates" component={Roommates} />
    <Stack.Screen name="statements" component={Statements} />
  </Stack.Navigator>
);

export default MyHomeStack;
