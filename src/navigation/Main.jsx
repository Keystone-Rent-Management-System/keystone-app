import React, {useEffect} from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import * as Sentry from '@sentry/react-native';

import BottomNav from './BottomNav';
import {ApartmentSearch, ApartmentView, InvoiceView} from '@/screens';
import {
  AccountChangePassword,
  CurrentAgreements,
  InvoiceMakePayment,
  Login,
  RecoveryEmail,
  RecoveryReset,
  RecoveryVerification,
  SavedUnits,
} from '../screens';
import NavOptions from './options';
import MyUnitsStack from './MyUnitsStack';
import {
  RegistrationEmail,
  RegistrationPassword,
  RegistrationProfile,
  RegistrationVerification,
} from '../screens/authentication/registration';
import useGlobals from '../provider/store/useGlobals';

const Stack = createStackNavigator();
const MainNav = () => {
  const {auth} = useGlobals(data => data.state);

  useEffect(() => {
    if (auth?.access_token) {
      Sentry.setUser({email: '', id: auth.access_token});
    } else {
      Sentry.setUser({email: null, id: null});
    }
  }, [auth]);

  return (
    <Stack.Navigator
      screenOptions={{headerShown: false}}
      initialRouteName="bottom-nav">
      <Stack.Screen name={'bottom-nav'} component={BottomNav} />
      <Stack.Screen name={'apartment_view'} component={ApartmentView} />
      <Stack.Screen name={'apartment-search'} component={ApartmentSearch} />

      {!auth?.access_token ? (
        <>
          {/*  Authentication screens*/}
          <Stack.Screen
            name={'auth__login'}
            component={Login}
            options={{
              ...NavOptions.emptyBarOptions,
              title: 'Sign into your account.',
            }}
          />

          {/*  Registration screens   */}
          <Stack.Screen
            name={'auth__registration_email'}
            component={RegistrationEmail}
            options={{
              ...NavOptions.withBackBarOptions,
              title: 'Create an Account',
            }}
          />
          <Stack.Screen
            name={'auth__registration_verification'}
            component={RegistrationVerification}
            options={{
              ...NavOptions.withBackBarOptions,
              title: 'Verify Your Email.',
            }}
          />
          <Stack.Screen
            name={'auth__registration_password'}
            component={RegistrationPassword}
            options={{
              ...NavOptions.withBackBarOptions,
              title: 'Secure your account.',
            }}
          />
          <Stack.Screen
            name={'auth__registration_profile'}
            component={RegistrationProfile}
            options={{
              ...NavOptions.withBackBarOptions,
              title: 'Create Profile.',
            }}
          />

          {/* Auth > recover password screens */}
          <Stack.Screen
            name={'auth__recovery_email'}
            component={RecoveryEmail}
            options={{
              ...NavOptions.withBackBarOptions,
              title: 'Recovery Your Password.',
            }}
          />
          <Stack.Screen
            name={'auth__recovery_verification'}
            component={RecoveryVerification}
            options={{
              ...NavOptions.withBackBarOptions,
              title: 'Verify Your Email.',
            }}
          />
          <Stack.Screen
            name={'auth__recovery_reset'}
            component={RecoveryReset}
            options={{
              ...NavOptions.withBackBarOptions,
              title: 'Reset Your Password',
            }}
          />
        </>
      ) : (
        <>
          {/*  private screens*/}
          <Stack.Screen name={'invoice_view'} component={InvoiceView} />
          <Stack.Screen
            name={'invoice_make_payment'}
            component={InvoiceMakePayment}
            options={NavOptions.withBackBarOptions}
          />
          <Stack.Screen
            name={'more__saved_units'}
            component={SavedUnits}
            options={{
              ...NavOptions.withBackBarOptions,
              title: 'Saved Units',
            }}
          />
          <Stack.Screen
            name={'more__account_password'}
            component={AccountChangePassword}
            options={{
              ...NavOptions.withBackBarOptions,
              title: 'Change Password',
            }}
          />
          <Stack.Screen
            name={'my_units'}
            component={MyUnitsStack}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name={'more__agreements'}
            component={CurrentAgreements}
            options={{
              ...NavOptions.withBackBarOptions,
              title: 'Current Agreement',
            }}
          />
        </>
      )}
    </Stack.Navigator>
  );
};

export default MainNav;
