import {useNavigation} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import React, {useEffect} from 'react';
import useGlobals from '../provider/store/useGlobals';

import {
  Credit,
  InvoiceReceipt,
  LandlordHome,
  Lease,
  PayRent,
  Payments,
  Receipts,
  RentReceipt,
  Statements,
  TenantHome,
  Units,
} from '@/screens';
import {View} from 'react-native';
import {LoadingModal} from '../components/modals';
import COLORS from '../constants/Theme';
import {useAuth} from '../hooks';
import {DEV_FORCE_TENANT} from '../services/mocks';
import PropertyStack from './PropertyStack';
import StatementStack from './StatementStack';
import TransactionTopTabNav from './TransactionTopTabNav';
import {InvoiceAll, PaymentReceipt} from '../screens';

const Stack = createStackNavigator();

const HomeStack = () => {
  const {auth} = useGlobals(state => state.state);
  const navigation = useNavigation();
  const {isPending, profile} = useAuth();

  // Dev-only: tour the tenant experience without a real tenant token.
  const forceTenant = __DEV__ && DEV_FORCE_TENANT;

  useEffect(() => {
    if (!auth?.access_token && !forceTenant) {
      navigation.navigate('auth__login');
    }
  }, [auth?.access_token, navigation, forceTenant]);

  if (isPending && !forceTenant) {
    return <LoadingModal />;
  } else if (
    !forceTenant &&
    profile?.access_types?.roles?.includes('ROLE_LANDLORD')
  ) {
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
  } else if (
    forceTenant ||
    profile?.access_types?.roles?.includes('ROLE_TENANT')
  ) {
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
          name={'pay_rent'}
          component={PayRent}
          options={{
            headerShown: true,
            title: 'Pay rent',
            headerShadowVisible: false,
            headerTitleStyle: {
              color: COLORS.primary,
              fontSize: 18,
              fontFamily: 'Inter-SemiBold',
            },
          }}
        />
        <Stack.Screen
          name={'rent_receipt'}
          component={RentReceipt}
          options={{
            headerShown: true,
            title: 'Receipt',
            headerShadowVisible: false,
            headerTitleStyle: {
              color: COLORS.primary,
              fontSize: 18,
              fontFamily: 'Inter-SemiBold',
            },
          }}
        />
        <Stack.Screen
          name={'lease'}
          component={Lease}
          options={{
            headerShown: true,
            title: 'My lease',
            headerShadowVisible: false,
            headerTitleStyle: {
              color: COLORS.primary,
              fontSize: 18,
              fontFamily: 'Inter-SemiBold',
            },
          }}
        />
        <Stack.Screen
          name={'receipts'}
          component={Receipts}
          options={{
            headerShown: true,
            title: 'Receipts',
            headerShadowVisible: false,
            headerTitleStyle: {
              color: COLORS.primary,
              fontSize: 18,
              fontFamily: 'Inter-SemiBold',
            },
          }}
        />
        <Stack.Screen
          name={'credit'}
          component={Credit}
          options={{
            headerShown: true,
            title: 'Credit building',
            headerShadowVisible: false,
            headerTitleStyle: {
              color: COLORS.primary,
              fontSize: 18,
              fontFamily: 'Inter-SemiBold',
            },
          }}
        />
        <Stack.Screen
          name={'invoices'}
          component={InvoiceAll}
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
          name={'payments'}
          component={Payments}
          options={{
            headerShown: true,
            title: 'My Payments',
            headerTitleStyle: {
              color: COLORS.primary,
              fontSize: 18,
              fontFamily: 'Inter-SemiBold',
            },
          }}
        />
        <Stack.Screen
          name={'payment_receipt'}
          component={PaymentReceipt}
          options={{
            headerShown: true,
            title: 'Receipt',
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
