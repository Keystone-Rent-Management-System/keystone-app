import React from 'react';
import {
  Alert,
  FlatList,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import VersionCheck from 'react-native-version-check';

import {
  AgreementSvg,
  ApartmentSvg,
  InfoSvg,
  LikeSvg,
  LogoutSvg,
  UserSvg,
  WavingSvg,
} from '@/assets/icons';
import {Layout, ProfileView} from '@/components';
import COLORS from '@/constants/Theme';
import Helper from '@/utils/Helper';
import {useNavigation} from '@react-navigation/native';
import {ABOUT_URL, PRIVACY_POLICY_URL} from '../../constants';
import {useAuth} from '../../hooks';
import useGlobals from '../../provider/store/useGlobals';
import {useNotificationStore} from '../../provider/store/notification';
import {ZustandStorage} from '../../provider/store/MMKV';

const More = () => {
  const navigation = useNavigation();
  const {
    state: {auth},
    resetState,
  } = useGlobals(state => state);
  const {isPending, profile} = useAuth();
  const {removeDeviceToken} = useNotificationStore();

  const handleNavigate = screen => {
    navigation.navigate(screen);
  };

  const handleSignout = () => {
    ZustandStorage.clear();
    resetState();
    removeDeviceToken();
    navigation.navigate('bottom-nav', {screen: 'explore_stack'});
  };
  const handleConfirmSignout = () => {
    Alert.alert('Signout?', 'please confirm you want to sign out', [
      {
        text: 'Cancel',
        onPress: () => {},
        style: 'cancel',
      },
      {text: 'OK', onPress: handleSignout},
    ]);
  };

  return (
    <Layout className={''}>
      <LinearGradient
        className={'h-40 bg-primary relative'}
        colors={[COLORS.primary, COLORS.gradient_2]}>
        <View
          className={'absolute px-4 inset-x-0 bottom-8 flex-row items-center'}
          style={styles.profileStyle}>
          {!isPending && (
            <ProfileView
              text={`${profile?.name
                ?.split(' ')[0]
                ?.charAt(0)
                ?.toLowerCase()}${profile?.name
                ?.split(' ')[1]
                ?.charAt(0)
                ?.toLowerCase()}`}
              textClassName={'text-primary'}
              containerClassName={'bg-white'}
            />
          )}

          {!isPending && (
            <View>
              <Text
                className={
                  'text-xs font-inter mb-0.5 flex text-white flex-row items-center'
                }>
                {Helper.getGreetings()} <WavingSvg />
              </Text>

              <Text className={'font-inter-semibold text-sm text-white'}>
                {profile?.name}
              </Text>
            </View>
          )}
        </View>
      </LinearGradient>

      {!isPending && profile?.access_types?.roles?.includes('ROLE_TENANT') ? (
        <FlatList
          className={'py-4'}
          style={styles.listStyle}
          data={tenantNavList}
          renderItem={({item}) =>
            renderNavItem(
              {item},
              handleNavigate,
              auth?.access_token,
              handleConfirmSignout,
            )
          }
        />
      ) : (
        <FlatList
          className={'py-4'}
          style={styles.listStyle}
          data={navList}
          renderItem={({item}) =>
            renderNavItem(
              {item},
              handleNavigate,
              auth?.access_token,
              handleConfirmSignout,
            )
          }
        />
      )}

      <View className={'flex-row justify-center p-3'}>
        <Text className={'text-gray-300 font-inter text-13'}>
          Version {VersionCheck.getCurrentVersion()}
        </Text>
      </View>
    </Layout>
  );
};

const renderNavItem = ({item}, handleNavigate, token, signout) => {
  const {icon, title} = item;

  const handlePress = () => {
    !token
      ? () => {}
      : title?.toLowerCase() === 'logout'
      ? signout()
      : handleNavigate(item?.screen ?? '');
  };
  const handleOpenLink = () => {
    Linking.openURL(item?.link);
  };

  return (
    <TouchableOpacity
      className={'flex flex-row my-3.5 px-5 items-center space-x-3'}
      onPress={item?.link ? handleOpenLink : handlePress}>
      <View className={'items-center justify-center h-6 w-6 mr-3'}>{icon}</View>

      <Text className={'text-black font-inter text-sm'}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  profileStyle: {
    gap: 10,
  },
  listStyle: {
    gap: 15,
  },
});

const tenantNavList = [
  {
    icon: <UserSvg />,
    title: 'Account Information',
    screen: 'more__account_details',
  },
  {
    icon: <ApartmentSvg size={'24'} color={COLORS.primary} />,
    title: 'My Unit',
    screen: 'my_units',
  },
  {
    icon: <LikeSvg strokeColor={COLORS.primary} size={24} />,
    title: 'Saved Units',
    screen: 'more__saved_units',
  },
  {
    icon: <AgreementSvg color={COLORS.primary} size={22} />,
    title: 'Agreements',
    screen: 'more__agreements',
  },
  {
    icon: <InfoSvg />,
    title: 'About us',
    link: ABOUT_URL,
  },
  {
    icon: <AgreementSvg />,
    title: 'Privacy Policy',
    link: PRIVACY_POLICY_URL,
  },
  {
    icon: <LogoutSvg size={'24'} color={COLORS.primary} />,
    title: 'Logout',
  },
];

const navList = [
  {
    icon: <UserSvg />,
    title: 'Account Information',
    screen: 'more__account_details',
  },
  {
    icon: <InfoSvg />,
    title: 'About us',
    link: ABOUT_URL,
  },
  {
    icon: <AgreementSvg />,
    title: 'Privacy Policy',
    link: PRIVACY_POLICY_URL,
  },
  {
    icon: <LogoutSvg size={'24'} color={COLORS.primary} />,
    title: 'Logout',
  },
];

export default More;
