import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {ScrollView, Text, TouchableOpacity, View} from 'react-native';
import {Portfolio, Maintenance} from '@/screens';
import {Card, IconChip} from '../../components/premium';
import {titleStyling} from '../options';

const Stack = createStackNavigator();

// Reports hub — landing page lists the reports the landlord reaches
// for. Tap-through to each. Brand-matched card vocabulary.
const HUB = [
  {key: 'portfolio', glyph: '📈', title: 'Portfolio Performance', sub: 'Gross rent, vacancy, occupancy — the owner view'},
  {key: 'maintenance', glyph: '🔧', title: 'Maintenance', sub: 'Open / overdue counts · read-only'},
  {key: 'owner_reports', glyph: '🗂', title: 'Owner Reports', sub: 'One-tap PDF per property owner'},
  {key: 'insurance', glyph: '🛡', title: 'Rent Insurance', sub: 'Coverage, claims, payouts'},
  {key: 'compliance', glyph: '⚖', title: 'Compliance Alerts', sub: 'Notices due — Washington HB 1217 + others'},
];

const ReportsHub = ({navigation}) => (
  <ScrollView
    className="flex-1 bg-keystone_canvas"
    contentContainerStyle={{paddingTop: 8, paddingBottom: 24}}
    showsVerticalScrollIndicator={false}>
    {HUB.map(item => (
      <TouchableOpacity
        key={item.key}
        onPress={() => navigation.navigate(item.key)}
        activeOpacity={0.85}
        className="mx-4 mb-3">
        <Card>
          <View className="flex-row items-center gap-3">
            <IconChip size={44}>
              <Text style={{fontSize: 18}}>{item.glyph}</Text>
            </IconChip>
            <View className="flex-1">
              <Text className="text-keystone_navy font-inter-semibold text-base">
                {item.title}
              </Text>
              <Text className="text-text_muted font-inter text-xs mt-0.5">
                {item.sub}
              </Text>
            </View>
            <Text className="text-text_muted font-inter-semibold text-lg">›</Text>
          </View>
        </Card>
      </TouchableOpacity>
    ))}
  </ScrollView>
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
