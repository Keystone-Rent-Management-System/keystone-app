import React from 'react';
import {FlatList, StyleSheet, Text, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

import {Layout, ProfileView} from '@/components';
import COLORS from '@/constants/Theme';
import Helper from '@/utils/Helper';
import {
  AgreementSvg,
  ApartmentSvg,
  InfoSvg,
  LikeSvg,
  LogoutSvg,
  UserSvg,
  WavingSvg,
} from '@/assets/icons';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {useNavigation} from '@react-navigation/native';

const More = () => {
  const navigation = useNavigation();

  const handleNavigate = screen => {
    navigation.navigate(screen);
  };
  return (
    <Layout className={''}>
      <LinearGradient
        className={'h-40 bg-primary relative'}
        colors={[COLORS.primary, COLORS.gradient_2]}>
        <View
          className={'absolute px-4 inset-x-0 bottom-8 flex-row items-center'}
          style={styles.profileStyle}>
          <ProfileView
            text={'EM'}
            textClassName={'text-primary'}
            containerClassName={'bg-white'}
          />

          <View>
            <Text
              className={
                'text-xs font-inter mb-0.5 flex text-white flex-row items-center'
              }>
              {Helper.getGreetings()} <WavingSvg />
            </Text>

            <Text className={'font-inter-semibold text-sm text-white'}>
              Evans Mutambuki
            </Text>
          </View>
        </View>
      </LinearGradient>

      <FlatList
        className={'py-4'}
        style={styles.listStyle}
        data={navList}
        renderItem={({item}) => renderNavItem({item}, handleNavigate)}
      />
    </Layout>
  );
};

const renderNavItem = ({item}, handleNavigate) => {
  const {icon, title} = item;
  return (
    <TouchableOpacity
      className={'flex-row my-3 px-5 items-center space-x-3'}
      onPress={() => handleNavigate(item?.screen ?? '')}>
      <View className={'items-center justify-center h-6 w-6'}>{icon}</View>

      <Text className={'text-black font-inter text-13'}>{title}</Text>
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

const navList = [
  {
    icon: <UserSvg />,
    title: 'Account Information',
  },
  {
    icon: <ApartmentSvg size={'24'} color={COLORS.primary} />,
    title: 'My Unit',
  },
  {
    icon: <LikeSvg strokeColor={COLORS.primary} size={24} />,
    title: 'Saved Units',
    screen: 'more__saved_units',
  },
  {
    icon: <AgreementSvg color={COLORS.primary} size={22} />,
    title: 'Agreements',
  },
  {
    icon: <InfoSvg />,
    title: 'About us',
  },
  {
    icon: <LogoutSvg size={'24'} color={COLORS.primary} />,
    title: 'Logout',
  },
];

export default More;
