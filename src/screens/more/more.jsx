import React from 'react';
import {
  Alert,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import VersionCheck from 'react-native-version-check';

import COLORS from '@/constants/Theme';
import {useNavigation} from '@react-navigation/native';
import {useQueryClient} from '@tanstack/react-query';
import {useAuth} from '../../hooks';
import {useTenantHome} from '../../hooks/useTenantHome';
import {useDashboard, useComplianceAlerts} from '../../hooks';
import {ZustandStorage} from '../../provider/store/MMKV';
import {useNotificationStore} from '../../provider/store/notification';
import NotificationService from '../../services/Notification';
import useGlobals from '../../provider/store/useGlobals';
import {endSession} from '../../provider/store/authSession';
import {clearDemoIdentity} from '../../provider/store/demoIdentity';
import AuthServices from '../../services/AuthServices';
import {useDevRole, useDevRoleStore} from '../../provider/store/devRole';
import {useDataSourceStore} from '../../provider/store/devDataSource';
import {useDemoOnboardingStore} from '../../provider/store/demoOnboarding';
import {ONBOARDING_STATES} from '../../services/mocks/villa';
import {isLandlordProfile, isTenantProfile} from '../../utils/roles';
import {BASE_URL} from '../../services/AxiosServices';
import {Avatar, Card} from '../../components/premium';
import {
  ListRow,
  Screen,
  SectionLabel,
  SegmentedChoice,
} from '../../components/kit';
import {toast} from '../../utils/toast';
import {can} from '../../constants/capabilities';

// Account menu — tenant 8d / landlord 8h variants of one component.
// The clipped navy greeting sliver becomes a real identity card
// (name, role, home) that opens Account details. Rows grouped
// YOUR MONEY (tenant) / YOUR BUSINESS (landlord) + SETTINGS & SUPPORT
// with live-state sub-lines. Complaints left the menu — messaging
// lives in Help & contact; About/Privacy collapse into one legal row
// that routes in-app (P1-4: no dead keystonerent.app links).

const More = () => {
  const queryClient = useQueryClient();
  const navigation = useNavigation();
  const {
    state: {auth},
    resetState,
  } = useGlobals(state => state);
  const {isPending, profile} = useAuth();
  const {removeDeviceToken} = useNotificationStore();

  // Role preview mirrors BottomNav/HomeStack. __DEV__-gated.
  const realTenant = isTenantProfile(profile);
  const realLandlord = isLandlordProfile(profile);
  const {isTenant} = useDevRole(realTenant, realLandlord);
  const devRole = useDevRoleStore(s => s.role);
  const setDevRole = useDevRoleStore(s => s.setRole);

  // Live backend ⇄ bundled fixtures.
  const demoOnboarding = useDemoOnboardingStore(s => s.state);
  const setDemoOnboarding = useDemoOnboardingStore(s => s.setState);

  const dataSource = useDataSourceStore(s => s.source);
  const setDataSourceRaw = useDataSourceStore(s => s.setSource);
  const setDataSource = source => {
    setDataSourceRaw(source);
    // clear(), NOT invalidateQueries(). Invalidation refetches but keeps
    // the previous data mounted while the new request is in flight — and
    // keeps it on error — so flipping Fixtures → Live left the demo
    // persona's rent, lease and repairs on screen next to a load-error
    // strip, which is exactly the "invented data looks real" failure this
    // toggle exists to prevent. A source change is a session boundary:
    // drop the cache so screens re-enter loading with nothing carried over.
    queryClient.clear();
  };

  // Live state for sub-lines. Both hooks serve from cache/mocks; only
  // the relevant one renders.
  const {home} = useTenantHome();
  const {dashboard} = useDashboard();
  const {alerts} = useComplianceAlerts();

  const name = profile?.name || home?.tenant
    ? profile?.name ??
      `${home?.tenant?.firstName ?? ''} ${home?.tenant?.lastName ?? ''}`.trim()
    : '';
  const initials = (name || 'KS')
    .split(' ')
    .slice(0, 2)
    .map(p => p?.[0] ?? '')
    .join('')
    .toUpperCase();

  const lease = home?.lease ?? {};
  const credit = home?.credit ?? {};
  const insurance = home?.insuranceSummary ?? {};
  const portfolio = dashboard?.portfolio ?? {};
  const noticesDue = alerts.filter(a => a.status === 'NOT_SENT').length;

  const roleLine = isTenant
    ? `Tenant${lease.property ? ` · ${lease.property}` : ''}${lease.unit ? ` · ${lease.unit}` : ''}`
    : `Landlord${portfolio.properties ? ` · ${portfolio.properties} properties` : ''}${
        portfolio.units ? ` · ${portfolio.units} units` : ''
      }`;

  // SIGN-OUT IS NOT COMPLETE UNTIL THE SECURE STORE SAYS SO.
  //
  // The old version was entirely synchronous: it dropped an un-awaited
  // `clearSession()` inside `resetState` and navigated away in the same
  // tick. The user was on the Welcome screen — told, in effect, that they
  // were signed out — while the Keychain delete was still in flight, and
  // if that delete rejected, nothing anywhere noticed. The refresh token
  // stayed on disk and the next launch signed them straight back in.
  //
  // Order matters: memory and the in-process session die first (so
  // nothing can authenticate from this point on, and the gate unmounts
  // the protected tree), then we await the durable deletion, and only
  // then do we present sign-out as done.
  const [signingOut, setSigningOut] = React.useState(false);

  const handleSignout = async () => {
    if (signingOut) return;
    setSigningOut(true);

    // Best-effort server-side revoke. It must not gate local teardown:
    // if the network is down we still have to end the session on device.
    AuthServices.logout(auth?.refresh_token).catch(() => {});

    queryClient.clear();
    ZustandStorage.clear();
    resetState();
    removeDeviceToken();
    // Dispose of any push-registration subscriber or scheduled retry.
    // Signing out before APNs answered used to leave a live subscriber
    // that would later register this handset against a session that no
    // longer exists.
    NotificationService.cancelPendingRegistration();
    // Demo identity material must not outlive the session either. No-op
    // outside the demo journey; the photo is deleted from disk when there
    // is one.
    clearDemoIdentity().catch(() => {});

    try {
      await endSession();
      navigation.navigate('welcome');
    } catch (err) {
      // The session is dead in this process either way — the gate is
      // already `signedOut` — but the refresh token may still be on disk.
      // Say that rather than reporting a clean sign-out.
      navigation.navigate('welcome');
      toast.show(
        'Signed out on this device, but we could not erase the saved session. ' +
          'Sign out again when you have a connection, or remove the app to be certain.',
        toast.LONG,
      );
    } finally {
      setSigningOut(false);
    }
  };

  const confirmSignout = () => {
    Alert.alert('Sign out?', 'Please confirm you want to sign out.', [
      {text: 'Cancel', style: 'cancel', onPress: () => {}},
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: () => {
          handleSignout();
        },
      },
    ]);
  };

  const legal = () =>
    toast.show(
      'Privacy policy · terms · licenses — published in-app when legal review completes',
      toast.LONG,
    );

  return (
    <Screen variant="hub" contentStyle={{paddingTop: 16}}>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F2EC" />

      <Text className="text-keystone_navy font-inter-bold text-3xl mb-5">
        Account
      </Text>

      {/* Identity card → Account details */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => navigation.navigate('more__account_details')}>
        {/* 8d/8h: navy identity card, cream avatar */}
        <Card feature>
          <View className="flex-row items-center">
            <Avatar initials={initials} size={52} onDark />
            <View className="flex-1 ml-3" style={{minWidth: 0}}>
              <Text
                numberOfLines={1}
                className="text-white font-inter-bold text-lg capitalize">
                {isPending && !name ? '…' : name || 'Welcome'}
              </Text>
              <Text
                numberOfLines={1}
                className="font-inter text-xs mt-0.5"
                style={{color: 'rgba(231,229,218,0.72)'}}>
                {roleLine}
              </Text>
            </View>
            <Text
              className="font-inter-semibold text-lg"
              style={{color: 'rgba(231,229,218,0.72)'}}>
              ›
            </Text>
          </View>
        </Card>
      </TouchableOpacity>

      {/* Role money/business group */}
      <View className="mt-5">
        <SectionLabel>{isTenant ? 'Your money' : 'Your business'}</SectionLabel>
        <Card style={{paddingVertical: 0, paddingHorizontal: 16}}>
          {isTenant ? (
            <>
              <ListRow
                icon="trending"
                title="Credit building"
                sub={
                  can('creditReporting') && credit.enabled
                    ? `${credit.score}`
                    : 'Not available yet'
                }
                chevron
                onPress={() => navigation.navigate('credit')}
              />
              <ListRow
                icon="shield"
                title="Renters insurance"
                sub="Coverage & proof of policy"
                chevron
                last
                onPress={() => navigation.navigate('insurance')}
              />
            </>
          ) : (
            <>
              <ListRow
                icon="bank"
                title="Payout account"
                sub="Where your rent lands"
                chevron
                onPress={() =>
                  toast.show(
                    'Managing your payout account isn’t available yet.',
                    toast.SHORT,
                  )
                }
              />
              <ListRow
                icon="scale"
                title="Compliance"
                sub="Notices due — Washington"
                chip={
                  noticesDue > 0
                    ? {label: `${noticesDue} due`, tone: 'pending'}
                    : undefined
                }
                chevron={noticesDue === 0}
                last
                onPress={() =>
                  navigation.navigate('reports_stack', {screen: 'compliance'})
                }
              />
            </>
          )}
        </Card>
      </View>

      {/* Settings & support */}
      <View className="mt-5">
        <SectionLabel>Settings & support</SectionLabel>
        <Card style={{paddingVertical: 0, paddingHorizontal: 16}}>
          <ListRow
            icon="bell"
            title="Notifications"
            sub="Channels, topics & reminders"
            chevron
            onPress={() => navigation.navigate('notification_prefs')}
          />
          <ListRow
            icon="phone"
            title="Help & contact"
            sub={
              isTenant
                ? 'Reach your landlord or Keystone'
                : 'Keystone support · tenant messages'
            }
            chevron
            onPress={() => navigation.navigate('help')}
          />
          <ListRow
            icon="lease"
            title="About & legal"
            sub="Privacy policy · terms · licenses"
            chevron
            last
            onPress={legal}
          />
        </Card>
      </View>

      {/* Role preview — debug builds only, stripped from release by
          __DEV__. Lets one build tour both product surfaces. */}
      {__DEV__ && (
        <View className="mt-5">
          <SectionLabel>Preview as · debug only</SectionLabel>
          <Card>
            <SegmentedChoice
              options={[
                {value: 'tenant', label: 'Tenant'},
                {value: 'landlord', label: 'Landlord'},
                {value: 'auto', label: 'Auto', sub: 'real role'},
              ]}
              value={devRole}
              onChange={setDevRole}
            />
            <Text className="text-keystone_slate font-inter text-xs mt-3 leading-5">
              Switches the whole app between the tenant and landlord
              surfaces. Not present in release builds.
            </Text>
          </Card>
        </View>
      )}

      {/* Data source — debug builds only. 'Live' talks to the Keystone
          gateway; 'Fixtures' forces every service onto bundled mock
          data for off-network demos. Endpoints BE has not shipped fall
          back to fixtures in either mode. */}
      {__DEV__ && (
        <View className="mt-5">
          <SectionLabel>Data source · debug only</SectionLabel>
          <Card>
            <SegmentedChoice
              options={[
                {value: 'live', label: 'Live', sub: 'real backend'},
                {value: 'mock', label: 'Fixtures', sub: 'offline demo'},
              ]}
              value={dataSource}
              onChange={setDataSource}
            />
            <Text className="text-keystone_slate font-inter text-xs mt-3 leading-5">
              {dataSource === 'live'
                ? `Requests hit ${BASE_URL}. Sign in for anything beyond the front door.`
                : 'Every screen serves bundled fixtures — no network, no sign-in needed.'}
            </Text>
          </Card>
        </View>
      )}

      {/* Onboarding demo — debug only. Most of the applicant journey is
          reached by waiting on a landlord or a screening provider, so
          there is no way to walk it from the UI; this jumps to any of the
          ten VILLA_5_TENANTS states. */}
      {__DEV__ && isTenant && (
        <View className="mt-5">
          <SectionLabel>Onboarding demo · debug only</SectionLabel>
          <Card>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row" style={{gap: 8}}>
                {ONBOARDING_STATES.map(st => {
                  const on = st === demoOnboarding;
                  return (
                    <TouchableOpacity
                      key={st}
                      onPress={() => setDemoOnboarding(st)}
                      activeOpacity={0.85}
                      style={{
                        paddingVertical: 8,
                        paddingHorizontal: 12,
                        borderRadius: 10,
                        backgroundColor: on ? COLORS.keystone_navy : '#FFFFFF',
                        borderWidth: 1,
                        borderColor: on
                          ? COLORS.keystone_navy
                          : 'rgba(21,37,53,0.16)',
                      }}>
                      <Text
                        className="font-inter-semibold"
                        style={{
                          fontSize: 11,
                          color: on ? COLORS.keystone_cream : COLORS.keystone_navy,
                        }}>
                        {st.replace(/_/g, ' ')}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
            <Text className="text-keystone_slate font-inter text-xs mt-3 leading-5">
              Anything other than ONBOARDED replaces the tenant tabs with the
              applicant checklist.
            </Text>
          </Card>
        </View>
      )}

      {/* Sign out */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={confirmSignout}
        className="mt-5">
        <Card style={{padding: 14}}>
          <Text
            className="font-inter-semibold text-sm text-center"
            style={{color: COLORS.c_danger}}>
            Sign out
          </Text>
        </Card>
      </TouchableOpacity>

      <Text className="text-text_muted font-inter text-xs text-center mt-5">
        Keystone · v{VersionCheck.getCurrentVersion()}
      </Text>
    </Screen>
  );
};

export default More;
