import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {ScrollView, Text, TouchableOpacity, View} from 'react-native';
import {Portfolio, Maintenance} from '@/screens';
import {titleStyling} from '../options';

const Stack = createStackNavigator();

// Reports hub — landing page lists the three reports the landlord
// actually reaches for (Portfolio Performance, Maintenance,
// Owner Reports). Tap-through to each. Insurance and Compliance
// (Phase 4) land under their own stack entries as they ship.
const ReportsHub = ({navigation}) => (
  <ScrollView className="flex-1 bg-keystone_stone">
    <View className="px-5 pt-6 pb-2">
      <Text className="text-grey_1 font-inter text-xs uppercase tracking-widest">
        Reports
      </Text>
    </View>

    <HubRow
      title="Portfolio Performance"
      subtitle="Gross rent, vacancy, occupancy — the accountant view"
      onPress={() => navigation.navigate('portfolio')}
    />
    <HubRow
      title="Maintenance"
      subtitle="Open / overdue counts. Read-only."
      onPress={() => navigation.navigate('maintenance')}
    />
    <HubRow
      title="Owner Reports"
      subtitle="One-tap PDF per property owner"
      onPress={() => navigation.navigate('owner_reports')}
    />
    <HubRow
      title="Rent Insurance"
      subtitle="Coverage, claims, payouts"
      onPress={() => navigation.navigate('insurance')}
    />
    <HubRow
      title="Compliance Alerts"
      subtitle="Notices due — Washington HB 1217 + others"
      onPress={() => navigation.navigate('compliance')}
    />
  </ScrollView>
);

const HubRow = ({title, subtitle, onPress}) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.7}
    className="mx-4 mb-3 bg-white rounded-2xl p-4 shadow-sm flex-row items-center justify-between">
    <View className="flex-1">
      <Text className="text-keystone_navy font-inter-semibold text-base">
        {title}
      </Text>
      <Text className="text-grey_1 font-inter text-xs mt-1">{subtitle}</Text>
    </View>
    <Text className="text-keystone_navy font-inter-semibold text-lg">→</Text>
  </TouchableOpacity>
);

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
    <Stack.Screen
      name="reports__home"
      component={ReportsHub}
      options={{
        headerShown: true,
        title: 'Reports',
        headerShadowVisible: false,
        headerTitleStyle: titleStyling,
      }}
    />
    <Stack.Screen
      name="portfolio"
      component={Portfolio}
      options={{
        headerShown: true,
        title: 'Portfolio Performance',
        headerShadowVisible: false,
        headerTitleStyle: titleStyling,
      }}
    />
    <Stack.Screen
      name="maintenance"
      component={Maintenance}
      options={{
        headerShown: true,
        title: 'Maintenance',
        headerShadowVisible: false,
        headerTitleStyle: titleStyling,
      }}
    />
    <Stack.Screen
      name="owner_reports"
      component={OwnerReports}
      options={{
        headerShown: true,
        title: 'Owner Reports',
        headerShadowVisible: false,
        headerTitleStyle: titleStyling,
      }}
    />
    <Stack.Screen
      name="insurance"
      component={Insurance}
      options={{
        headerShown: true,
        title: 'Rent Insurance',
        headerShadowVisible: false,
        headerTitleStyle: titleStyling,
      }}
    />
    <Stack.Screen
      name="compliance"
      component={Compliance}
      options={{
        headerShown: true,
        title: 'Compliance Alerts',
        headerShadowVisible: false,
        headerTitleStyle: titleStyling,
      }}
    />
  </Stack.Navigator>
);

export default ReportsStack;
