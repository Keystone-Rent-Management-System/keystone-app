import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';

import {
  Bills,
  TenantHome,
  InvoiceReceipt,
  Statements,
  LandlordHome,
  Units,
} from '@/screens';
import InvoiceTopTabNav from './InvoiceTopTabNav';
import COLORS from '../constants/Theme';
import {View} from 'react-native';
import {useAuth} from '../hooks';
import {LoadingModal} from '../components/modals';
import PropertyStack from './PropertyStack';
import StatementStack from './StatementStack';
import TransactionTopTabNav from './TransactionTopTabNav';

const Stack = createStackNavigator();

const HomeStack = () => {
  const {isPending, profile} = useAuth();

  if (isPending) {
    return <LoadingModal />;
  } else if (profile?.access_types?.roles?.includes('ROLE_LANDLORD')) {
    return (
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animationEnabled: true,
          animationTypeForReplace: 'push',
        }}
        initialRouteName="home">
        <Stack.Screen name={'home'} component={LandlordHome} />
        <Stack.Screen name={'properties'} component={PropertyStack} />
        <Stack.Screen
          name={'units'}
          component={Units}
          options={{
            headerShown: true,
            title: 'My Units',
            headerTitleStyle: {
              color: COLORS.primary,
              fontSize: 18,
              fontFamily: 'Inter-SemiBold',
              marginHorizontal: 'auto',
            },
          }}
        />
        <Stack.Screen
          name={'transactions'}
          component={TransactionTopTabNav}
          options={{
            headerShown: true,
            title: 'Transactions',
            headerTitleStyle: {
              color: COLORS.primary,
              fontSize: 18,
              fontFamily: 'Inter-SemiBold',
              marginHorizontal: 'auto',
            },
          }}
        />
        <Stack.Screen name={'statements'} component={StatementStack} />
      </Stack.Navigator>
    );
  } else if (profile?.access_types?.roles?.includes('ROLE_TENANT')) {
    return (
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animationEnabled: true,
          animationTypeForReplace: 'push',
        }}
        initialRouteName="home">
        <Stack.Screen name={'home'} component={TenantHome} />
        <Stack.Screen
          name={'invoice_top_tabs'}
          component={InvoiceTopTabNav}
          options={{
            headerShown: true,
            title: 'Invoices',
            headerTitleStyle: {
              color: COLORS.primary,
              fontSize: 18,
              fontFamily: 'Inter-SemiBold',
            },
          }}
        />
        <Stack.Screen
          options={{
            headerShown: true,
            headerLeft: renderEmpty,
            title: 'Receipt',
            headerTitleContainerStyle: {
              alignItems: 'center',
              width: '100%',
            },
            headerTitleStyle: {
              color: COLORS.primary,
              fontSize: 18,
              fontFamily: 'Inter-SemiBold',
              marginHorizontal: 'auto',
              marginLeft: 30,
            },
          }}
          name={'invoice_receipt'}
          component={InvoiceReceipt}
        />
        <Stack.Screen
          name={'statements'}
          component={Statements}
          options={{
            headerShown: true,
            title: 'Statements',
            headerTitleStyle: {
              color: COLORS.primary,
              fontSize: 18,
              fontFamily: 'Inter-SemiBold',
            },
          }}
        />
        <Stack.Screen
          name={'bills'}
          component={Bills}
          options={{
            headerShown: true,
            title: 'My Bills',
            headerTitleStyle: {
              color: COLORS.primary,
              fontSize: 18,
              fontFamily: 'Inter-SemiBold',
            },
          }}
        />
      </Stack.Navigator>
    );
  }
};

export default HomeStack;

export const renderEmpty = () => <View />;
