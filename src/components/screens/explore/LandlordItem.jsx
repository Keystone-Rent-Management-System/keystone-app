import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

import ProfileView from '../ProfileView';
import {ExploreActionBtn} from './index';
import {MessageSvg, PhoneSvg} from '@/assets/icons';

const LandlordItem = ({userName, ClassName}) => {
  return (
    <View className={`p-4 border-b border-border_grey flex-row ${ClassName}`}>
      <ProfileView
        image={
          'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg'
        }
      />

      <View className={'mx-3 flex-1'}>
        <Text className={'font-inter-medium text-black'}>Tom Cruise</Text>
        <Text className={'font-inter capitalize text-13 text-grey_1'}>
          {userName}
        </Text>
      </View>

      <View
        className={'flex-row items-center'}
        style={styles.actionButtonWrapper}>
        {/* message button */}
        <ExploreActionBtn icon={<MessageSvg />} />

        {/* call button */}
        <ExploreActionBtn icon={<PhoneSvg />} />
      </View>
    </View>
  );
};

export default LandlordItem;
const styles = StyleSheet.create({
  actionButtonWrapper: {
    gap: 15,
  },
});
