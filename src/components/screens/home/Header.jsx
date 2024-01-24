import React from 'react';
import {Text, View} from 'react-native';

import Helper from '@/utils/Helper';
import ProfileView from '../ProfileView';
import {WavingSvg} from '@/assets/icons';

const Header = () => {
  return (
    <View className={'py-4 flex-row items-center mb-2'}>
      <ProfileView
        image={
          'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg'
        }
      />

      <View className={'ml-1.5'}>
        <Text
          className={
            'text-11 font-inter mb-0.5 flex text-black flex-row items-center'
          }>
          {Helper.getGreetings()} <WavingSvg />
        </Text>

        <Text className={'font-inter-semibold text-13 text-black'}>
          {' '}
          Evans Mutambuki{' '}
        </Text>
      </View>
    </View>
  );
};

export default Header;
