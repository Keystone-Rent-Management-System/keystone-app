import React from 'react';
import {Alert, StatusBar, Text, ToastAndroid, TouchableOpacity, View} from 'react-native';
import VersionCheck from 'react-native-version-check';

import COLORS from '@/constants/Theme';
import {useNavigation} from '@react-navigation/native';
import {useQueryClient} from '@tanstack/react-query';
import {useAuth} from '../../hooks';
import {useTenantHome} from '../../hooks/useTenantHome';
import {useDashboard, useComplianceAlerts} from '../../hooks';
import {ZustandStorage} from '../../provider/store/MMKV';
import {useNotificationStore} from '../../provider/store/notification';
import useGlobals from '../../provider/store/useGlobals';
import AuthServices from '../../services/AuthServices';
import {useDevRole, useDevRoleStore} from '../../provider/store/devRole';
import {Avatar, Card} from '../../components/premium';
import {
  ListRow,
  Screen,
  SectionLabel,
  SegmentedChoice,
} from '../../components/kit';

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
  const realTenant = !!profile?.access_types?.roles?.includes('ROLE_TENANT');
  const realLandlord = !!profile?.access_types?.roles?.includes('ROLE_LANDLORD');
  const {isTenant} = useDevRole(realTenant, realLandlord);
  const devRole = useDevRoleStore(s => s.role);
  const setDevRole = useDevRoleStore(s => s.setRole);

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

  const handleSignout = () => {
    AuthServices.logout(auth?.refresh_token).catch(() => {});
    queryClient.clear();
    ZustandStorage.clear();
    resetState();
    removeDeviceToken();
    navigation.navigate('welcome');
  };
  const confirmSignout = () => {
    Alert.alert('Sign out?', 'Please confirm you want to sign out.', [
      {text: 'Cancel', style: 'cancel', onPress: () => {}},
      {text: 'Sign out', style: 'destructive', onPress: handleSignout},
    ]);
  };

  const legal = () =>
    ToastAndroid.show(
      'Privacy policy · terms · licenses — published in-app when legal review completes',
      ToastAndroid.LONG,
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
                  credit.enabled
                    ? `${credit.score} · reporting on`
                    : 'Turn on rent reporting'
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
                  ToastAndroid.show(
                    'Payout account management arrives with BE support',
                    ToastAndroid.SHORT,
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
