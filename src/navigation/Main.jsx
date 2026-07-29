import React, {useEffect} from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import * as Sentry from '@sentry/react-native';

import BottomNav from './BottomNav';
import {ApartmentSearch, ApartmentView, InvoiceView} from '@/screens';
import {
  AccountChangePassword,
  ClaimLanding,
  CurrentAgreements,
  InvoiceMakePayment,
  Login,
  RecoveryEmail,
  RecoveryReset,
  RecoveryVerification,
  SavedUnits,
  Welcome,
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
import {useDevRoleStore} from '../provider/store/devRole';
import ScreeningConsent from '../screens/landlord_home/screening/ScreeningConsent';

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

  const isAuthed = !!auth?.access_token;
  // Debug-only: a previewed role boots straight into the tab navigator
  // (so role screens are reachable without a real token), skipping the
  // Welcome front door. __DEV__-gated; no effect in release.
  const devRole = useDevRoleStore(s => s.role);
  const forceRole = __DEV__ && devRole !== 'auto';

  return (
    <Stack.Navigator
      screenOptions={{headerShown: false}}
      // Option A: auth is the front door. Unauthenticated cold-open
      // lands on the branded Welcome (value prop + landlord/tenant
      // doors), NOT the Pallax-era Explore listings marketplace.
      initialRouteName={isAuthed || forceRole ? 'bottom-nav' : 'welcome'}>
      <Stack.Screen name={'bottom-nav'} component={BottomNav} />
      <Stack.Screen name={'welcome'} component={Welcome} />
      <Stack.Screen name={'auth__claim'} component={ClaimLanding} />
      <Stack.Screen name={'apartment_view'} component={ApartmentView} />
      <Stack.Screen name={'apartment-search'} component={ApartmentSearch} />

      {!auth?.access_token ? (
        <>
          {/*  Authentication screens*/}
          {/* Login draws its own kit Screen header (S2) */}
          <Stack.Screen name={'auth__login'} component={Login} />

          {/* Registration screens — each draws its own kit Screen
              header (S2: "‹ Welcome" etc.), so the stack header
              stays hidden. */}
          <Stack.Screen
            name={'auth__registration_email'}
            component={RegistrationEmail}
          />
          <Stack.Screen
            name={'auth__registration_verification'}
            component={RegistrationVerification}
          />
          <Stack.Screen
            name={'auth__registration_password'}
            component={RegistrationPassword}
          />
          <Stack.Screen
            name={'auth__registration_profile'}
            component={RegistrationProfile}
          />

          {/* Applicant-side screening consent (design 4d) — reached
              from the screening-invite deep link once the BE emits it. */}
          <Stack.Screen
            name={'screening_consent'}
            component={ScreeningConsent}
          />

          {/* Auth > recover password screens — kit Screen headers */}
          <Stack.Screen
            name={'auth__recovery_email'}
            component={RecoveryEmail}
          />
          <Stack.Screen
            name={'auth__recovery_verification'}
            component={RecoveryVerification}
          />
          <Stack.Screen
            name={'auth__recovery_reset'}
            component={RecoveryReset}
          />
        </>
      ) : null}

      {/* Private screens — also mounted under a previewed role so a
          debug build can reach them without a real token. */}
      {isAuthed || forceRole ? (
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
      ) : null}
    </Stack.Navigator>
  );
};

export default MainNav;
