import React from 'react';
import {Alert, ScrollView, Text, TouchableOpacity, View} from 'react-native';
import VersionCheck from 'react-native-version-check';

import {Layout} from '@/components';
import COLORS from '@/constants/Theme';
import Helper from '@/utils/Helper';
import {useNavigation} from '@react-navigation/native';
import {useQueryClient} from '@tanstack/react-query';
import {ABOUT_URL, PRIVACY_POLICY_URL} from '../../constants';
import {useAuth} from '../../hooks';
import {ZustandStorage} from '../../provider/store/MMKV';
import {useNotificationStore} from '../../provider/store/notification';
import useGlobals from '../../provider/store/useGlobals';
import AuthServices from '../../services/AuthServices';
import {openLinkInBrowser} from '../../utils/openLinkInBrowser';
import {Avatar, Card, IconChip, Icon, Divider} from '../../components/premium';

// More — account + settings, brand-matched. A calm navy header with the
// tenant's name, then a clean list of rows. Logout in its own card.

const More = () => {
  const queryClient = useQueryClient();
  const navigation = useNavigation();
  const {
    state: {auth},
    resetState,
  } = useGlobals(state => state);
  const {isPending, profile} = useAuth();
  const {removeDeviceToken} = useNotificationStore();

  const isTenant = profile?.access_types?.roles?.includes('ROLE_TENANT');
  const name = profile?.name ?? '';
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map(p => p?.[0] ?? '')
    .join('')
    .toUpperCase();

  const handleNavigate = screen => navigation.navigate(screen);
  const handleLink = link => openLinkInBrowser(link);

  const handleSignout = () => {
    AuthServices.logout(auth?.refresh_token).catch(() => {});
    queryClient.clear();
    ZustandStorage.clear();
    resetState();
    removeDeviceToken();
    navigation.navigate('bottom-nav', {screen: 'explore_stack'});
  };
  const confirmSignout = () => {
    Alert.alert('Sign out?', 'Please confirm you want to sign out.', [
      {text: 'Cancel', style: 'cancel', onPress: () => {}},
      {text: 'Sign out', style: 'destructive', onPress: handleSignout},
    ]);
  };

  const list = isTenant ? TENANT_ITEMS : LANDLORD_ITEMS;

  return (
    <Layout ClassName={''}>
      <ScrollView
        contentContainerStyle={{paddingBottom: 28}}
        showsVerticalScrollIndicator={false}>
        {/* Profile header */}
        <View className="px-4 pt-12">
          <Card feature>
            <View className="flex-row items-center">
              <Avatar initials={initials || 'KS'} size={52} />
              <View className="ml-3">
                <Text className="text-white/60 font-inter text-xs">
                  {Helper.getGreetings()}
                </Text>
                <Text className="text-white font-inter-bold text-lg capitalize">
                  {isPending ? '…' : name || 'Welcome'}
                </Text>
              </View>
            </View>
          </Card>
        </View>

        {/* Nav list */}
        <View className="px-4 mt-5">
          <Card style={{paddingVertical: 6}}>
            {list.map((item, i) => (
              <View key={item.title}>
                {i > 0 && <Divider style={{marginHorizontal: 12}} />}
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() =>
                    item.link ? handleLink(item.link) : handleNavigate(item.screen)
                  }
                  className="flex-row items-center px-3 py-3.5">
                  <IconChip size={38}>
                    <Icon name={item.icon} size={18} />
                  </IconChip>
                  <Text className="flex-1 ml-3 text-keystone_navy font-inter-semibold text-sm">
                    {item.title}
                  </Text>
                  <Text className="text-text_muted font-inter-semibold text-base">
                    ›
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </Card>
        </View>

        {/* Sign out */}
        <View className="px-4 mt-4">
          <TouchableOpacity activeOpacity={0.85} onPress={confirmSignout}>
            <Card style={{padding: 14}}>
              <Text
                className="font-inter-semibold text-sm text-center"
                style={{color: COLORS.c_danger}}>
                Sign out
              </Text>
            </Card>
          </TouchableOpacity>
        </View>

        <Text className="text-text_muted font-inter text-xs text-center mt-5">
          Keystone · v{VersionCheck.getCurrentVersion()}
        </Text>
      </ScrollView>
    </Layout>
  );
};

const TENANT_ITEMS = [
  {icon: 'users', title: 'Account information', screen: 'more__account_details'},
  {icon: 'trending', title: 'Credit building', screen: 'credit'},
  {icon: 'shield', title: 'Renters insurance', screen: 'insurance'},
  {icon: 'bell', title: 'Help & contact', screen: 'help'},
  {icon: 'reports', title: 'Privacy policy', link: PRIVACY_POLICY_URL},
];

const LANDLORD_ITEMS = [
  {icon: 'users', title: 'Account information', screen: 'more__account_details'},
  {icon: 'shield', title: 'About Keystone', link: ABOUT_URL},
  {icon: 'reports', title: 'Privacy policy', link: PRIVACY_POLICY_URL},
  {icon: 'scale', title: 'Complaints', screen: 'more__complains'},
];

export default More;
