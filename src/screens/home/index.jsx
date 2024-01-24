import React from 'react';

import {Text, View} from 'react-native';
import {HomeHeader} from '@/components';

const Home = () => {
  return (
    <View className={'bg-bg flex-1'}>
      {/* Header */}
      <HomeHeader />

      <Text className={'font-inter'}>This is the Home screen</Text>
    </View>
  );
};

export default Home;
