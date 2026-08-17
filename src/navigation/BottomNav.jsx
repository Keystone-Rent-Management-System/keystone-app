import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {TouchableOpacity} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import Nav from '@/constants/nav';
import {BottomTabBtn} from '@/components';
import {BottomNavScreens, LandlordBottomNavScreens} from '@/constants';
import useAuthSession, {AUTHENTICATED} from '../provider/store/authSession';
import {useAuth} from '../hooks';
import {useDevRole, useDevRoleStore} from '../provider/store/devRole';
import {isLandlordProfile, isTenantProfile} from '../utils/roles';
import {toast} from '../utils/toast';
import {useOnboarding} from '../hooks/useOnboarding';
import OnboardingStack from './OnboardingStack';
import {LoadingModal} from '../components/modals';

const Tab = createBottomTabNavigator();

const renderTab = ({focused, scr}) => (
  <BottomTabBtn icon={scr.tab.icon} text={scr.tab.title} isCurrent={focused} />
);

// Role-aware bottom nav.
//   - Unauthenticated → tenant tab set (Explore is auth-optional).
//   - ROLE_LANDLORD → landlord command-center tabs (Dashboard /
//     Payments / Leases / Reports / More).
//   - ROLE_TENANT → original tenant tabs (Explore / Home /
//     Notifications / More).
//
// Read profile once at the nav layer so the bottom bar is consistent
// across screen transitions; the per-screen guards in the stacks
// continue to do their own auth checks.
const BottomNav = () => {
  // The gate, not the token mirror — see provider/store/authSession.
  const isAuthed = useAuthSession(s => s.status) === AUTHENTICATED;
  const navigation = useNavigation();
  const {profile} = useAuth();

  // NOTE: this used to call `useRefreshToken()`, which installed a SECOND
  // 401 response interceptor — a new one on every effect run — whose only
  // behaviour was `resetState()`. Token attachment, refresh, replay and
  // failure handling now have exactly one owner (services/AxiosServices).
  // Two owners meant two independent reactions to the same 401: the
  // refresh interceptor would begin a refresh while this one had already
  // torn the session down, so concurrent failures raced into competing
  // auth transitions.

  const realLandlord = isLandlordProfile(profile);
  const realTenant = isTenantProfile(profile);
  // Debug builds can preview either surface (Account → Preview as);
  // useDevRole is __DEV__-gated, so release respects the real role.
  const {isLandlord} = useDevRole(realTenant, realLandlord);
  const devRole = useDevRoleStore(s => s.role);
  const screens = isLandlord ? LandlordBottomNavScreens : BottomNavScreens;

  // TENANT TABS STAY HIDDEN UNTIL ONBOARDING SUCCEEDS.
  //
  // `onboarded` is true only on a confirmed ONBOARDED status — a failed
  // or in-flight request is NOT onboarded. An applicant who has not been
  // approved and has not signed must not be able to browse Home, Pay or
  // My Home: those describe a tenancy they do not have. Landlords are
  // unaffected; this journey is the tenant's front door.
  //
  // THREE STATES, NOT TWO. This read:
  //
  //   if (!isLandlord && !onboardingPending && !onboarded)
  //
  // which renders the TABS while the request is in flight — "still
  // asking" defaulting to the reassuring branch, the same absence-of-an-
  // answer-as-a-conclusion bug the auth gate had. The visible effect is
  // worse than the logic suggests: it swaps the whole navigator on every
  // fetch, so the tab bar appears and is then torn down and replaced by
  // the applicant checklist. On focus, on foregrounding, on any
  // invalidation. On device it reads as the app flickering between two
  // apps, and it made the tenant surface unusable to walk.
  //
  // Now: pending renders NEITHER branch, and the decision is taken only
  // from a settled query.
  const {onboarded, isPending: onboardingPending} = useOnboarding();

  // A previewed role is browsing screens without a real session, so the
  // onboarding query can never resolve (it 401s against a live gateway).
  // Gating the preview on it means the preview never works — and the
  // preview is the only way into these screens right now.
  const previewing = __DEV__ && devRole !== 'auto';

  if (!isLandlord && !previewing) {
    if (onboardingPending) {
      // Stable third state. Not the tabs, not the checklist.
      return <LoadingModal />;
    }
    if (!onboarded) {
      // Settled, and not onboarded — including the error case, where the
      // checklist shows its own "we can't reach your application" state.
      return <OnboardingStack />;
    }
  }

  return (
    <Tab.Navigator screenOptions={Nav.BottomNavOptions}>
      {screens.map((scr, ind) => (
        <Tab.Screen
          key={`${isLandlord ? 'L' : 'T'}-${ind}`}
          name={scr.title}
          component={scr?.component}
          options={{
            tabBarIcon: ({focused}) => renderTab({focused, scr}),
            ...scr.options,
            tabBarButton: props =>
              renderTabButton({props}, isAuthed, navigation, scr?.title, devRole),
          }}
        />
      ))}
    </Tab.Navigator>
  );
};

export default BottomNav;

const renderTabButton = ({props}, isAuthed, navigation, title, devRole) => (
  <TouchableOpacity
    {...props}
    onPress={() => {
      // A previewed role bypasses the auth gate so role screens are
      // reachable without a real token in debug builds.
      const devBypass = __DEV__ && devRole !== 'auto';
      if (
        !devBypass &&
        !isAuthed &&
        !title?.toLowerCase().includes('explore')
      ) {
        navigation.navigate('auth__login');
        toast.show('Please login to access screen', 4000);
      } else {
        props.onPress();
      }
    }}
  />
);
