import React, {useEffect, useRef} from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import * as Sentry from '@sentry/react-native';

import BottomNav from './BottomNav';
import {ApartmentSearch, ApartmentView, InvoiceView} from '@/screens';
import {
  AccountChangePassword,
  ClaimLanding,
  CurrentAgreements,
  Login,
  RecoveryEmail,
  RecoveryReset,
  RecoveryVerification,
  SavedUnits,
  Welcome,
} from '../screens';
import NavOptions from './options';
import MyUnitsStack from './MyUnitsStack';
import useGlobals from '../provider/store/useGlobals';
import useAuthSession, {
  AUTHENTICATED,
  SIGNED_OUT,
} from '../provider/store/authSession';
import * as RootNavigation from '../RootNavigation';
import {useSessionPersistenceWarning} from '../hooks/useSessionPersistenceWarning';
import {useSessionPushRegistration} from '../hooks/useSessionPushRegistration';
import {useDevRoleStore} from '../provider/store/devRole';
import {useAuth} from '../hooks';
import ScreeningConsent from '../screens/landlord_home/screening/ScreeningConsent';
import OnboardingStack from './OnboardingStack';

const Stack = createStackNavigator();
const MainNav = () => {
  const {auth} = useGlobals(data => data.state);
  const {profile} = useAuth();

  // NEVER SEND A CREDENTIAL TO TELEMETRY.
  //
  // This used `auth.access_token` as the Sentry user id, transmitting a
  // live bearer token to a third-party service on every session — where
  // it lands in event payloads, is retained, and is visible to anyone
  // with access to the Sentry project. A token is a credential, not an
  // identifier.
  //
  // `userId` from the profile is the correct id: stable, non-secret, and
  // already known to the backend. `setUser(null)` on sign-out clears any
  // previously attached context, including tokens attached by earlier
  // builds of this app.
  useEffect(() => {
    if (auth?.access_token && profile?.userId) {
      Sentry.setUser({id: profile.userId});
    } else {
      Sentry.setUser(null);
    }
  }, [auth, profile?.userId]);

  // THE GATE IS THE AUTHORITY, not the presence of a token.
  //
  // `!!auth.access_token` conflated "no session" with "not asked yet",
  // and it also went stale in the other direction: the token sits in the
  // store until something clears it, so the protected tree stayed mounted
  // across a failed refresh until the teardown landed. `Main.jsx` does
  // not render this component at all while bootstrapping, so by the time
  // we are here the answer is known and final.
  const status = useAuthSession(s => s.status);
  const isAuthed = status === AUTHENTICATED;
  // Mounted here rather than in a screen: it must cover every path that
  // can produce a non-durable session, and this component renders for all
  // of them (and only after bootstrapping has concluded).
  useSessionPersistenceWarning();
  // Registration follows the SESSION, not the login screen.
  useSessionPushRegistration();
  // Debug-only: a previewed role boots straight into the tab navigator
  // (so role screens are reachable without a real token), skipping the
  // Welcome front door. __DEV__-gated; no effect in release.
  const devRole = useDevRoleStore(s => s.role);
  const forceRole = __DEV__ && devRole !== 'auto';

  // EVICTION FROM THE PROTECTED TREE.
  //
  // Unregistering the screens (below) is what makes the private route
  // impossible to keep rendering; this is what makes where the user ends
  // up deterministic. `initialRouteName` cannot do it — React Navigation
  // reads it once, when the navigator first mounts, so a status change
  // three screens deep in the tabs never consults it again.
  //
  // Without both halves, a refresh that failed while the user was inside
  // the tabs cleared the token and the store and left them looking at the
  // private screen they were already on.
  const prevStatus = useRef(status);
  useEffect(() => {
    const was = prevStatus.current;
    if (was === status) return;
    prevStatus.current = status;
    if (status === SIGNED_OUT && was === AUTHENTICATED) {
      RootNavigation.resetTo('welcome');
    }
    if (status === AUTHENTICATED && was === SIGNED_OUT) {
      // The mirror image, and the reason `useLogin` no longer navigates
      // itself: `bottom-nav` does not exist as a route until this render
      // registers it, so a `navigate('bottom-nav')` fired in the same
      // tick as `markAuthenticated()` would be dropped as unhandled.
      // Driving both directions from the status transition keeps the gate
      // the only thing that decides which tree the user is in.
      RootNavigation.resetTo('bottom-nav');
    }
  }, [status]);

  // PREVIEW IS A TRANSITION TOO. Tapping "Preview as" on Welcome sets the
  // role, which registers `bottom-nav` on this render — but nothing above
  // navigates to it (`initialRouteName` was read at mount, and the status
  // effect only watches the session). The button looked dead: the tabs
  // existed, the user was still on Welcome, and only a full relaunch —
  // which re-reads `initialRouteName` — landed inside them. Drive the
  // same resetTo from the forceRole transition, in both directions. A
  // real session outranks preview: when authenticated, the status effect
  // above owns navigation and this one must not fight it.
  const prevForce = useRef(forceRole);
  useEffect(() => {
    const was = prevForce.current;
    if (was === forceRole) return;
    prevForce.current = forceRole;
    if (status === AUTHENTICATED) return;
    RootNavigation.resetTo(forceRole ? 'bottom-nav' : 'welcome');
  }, [forceRole, status]);

  return (
    <Stack.Navigator
      screenOptions={{headerShown: false}}
      // Option A: auth is the front door. Unauthenticated cold-open
      // lands on the branded Welcome (value prop + landlord/tenant
      // doors), NOT the Pallax-era Explore listings marketplace.
      initialRouteName={isAuthed || forceRole ? 'bottom-nav' : 'welcome'}>
      <Stack.Screen name={'welcome'} component={Welcome} />
      <Stack.Screen name={'auth__claim'} component={ClaimLanding} />
      {/* ALWAYS REGISTERED, and deliberately so. The applicant journey
          starts from a resolved invite while the user is UNAUTHENTICATED
          — `ClaimLanding`'s "Set up my account" navigates straight here,
          and `/tenants/claim` is served without a token. Moving this
          inside the authed block (as an earlier pass did) deleted the
          route out from under the only screen that navigates to it, so
          the CTA raised an unhandled navigation action and the invite
          flow dead-ended on a fresh install. Onboarding is a door into
          the product, not a room behind it. */}
      <Stack.Screen name={'onboarding'} component={OnboardingStack} />
      <Stack.Screen name={'apartment_view'} component={ApartmentView} />
      <Stack.Screen name={'apartment-search'} component={ApartmentSearch} />

      {!isAuthed ? (
        <>
          {/*  Authentication screens*/}
          {/* Login draws its own kit Screen header (S2) */}
          <Stack.Screen name={'auth__login'} component={Login} />

          {/* Registration screens — each draws its own kit Screen
              header (S2: "‹ Welcome" etc.), so the stack header
              stays hidden. */}
          {/* TENANT SELF-REGISTRATION IS REMOVED (capability
              `tenantSelfRegistration`). The journey was labelled
              "Landlords start here" but posted to `/profile/tenant`,
              which returns 422 for every input by design (§T16 makes
              Keystone provisioned-only). On the way there it asked the
              user to accept Terms and a Privacy policy that are not
              published, collected a government ID number, promised
              identity verification and bank payouts that do not exist,
              and persisted their password and ID into an MMKV store with
              no encryption key. Deleting the routes closes all of it at
              once. Tenants claim an invite; landlords are onboarded by
              the team until a real signup exists. */}

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
          debug build can reach them without a real token.
          `bottom-nav` LIVES HERE, not at the top level. Registering it
          unconditionally meant the tab navigator — the whole protected
          product — stayed mounted through a session ending, because a
          screen that is still registered and still the current route is
          never torn down. */}
      {isAuthed || forceRole ? (
        <>
          <Stack.Screen name={'bottom-nav'} component={BottomNav} />
          {/*  private screens*/}
          <Stack.Screen name={'invoice_view'} component={InvoiceView} />
          {/* `invoice_make_payment` REMOVED. It rendered a "Processing
              Payment" animation and told the user "We sent you an Mpesa
              Prompt" — a Pallax-era Kenyan flow that initiates nothing,
              on a US product with no settlement path at all. A registered
              route is reachable, so this was a live false-payment
              surface. */}
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
