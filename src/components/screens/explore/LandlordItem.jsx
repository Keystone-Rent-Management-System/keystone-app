import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

import ProfileView from '../ProfileView';
import {ExploreActionBtn} from './index';
import {MessageSvg, PhoneSvg} from '@/assets/icons';
import Helper from '../../../utils/Helper';

const LandlordItem = ({userName, phoneNumber, ClassName}) => {
  return (
    <View className={`p-4 border-b border-border_grey flex-row ${ClassName}`}>
      <ProfileView
        text={Helper.getInitials(userName)}
        textClassName={'text-white text-lg'}
        containerClassName={'bg-primary'}
      />

      <View className={'mx-3 flex-1'}>
        <Text className={'font-inter-medium text-black'}>{userName}</Text>
        <Text className={'font-inter capitalize text-13 text-grey_1'}>
          {phoneNumber}
        </Text>
      </View>

      <View
        className={'flex-row items-center'}
        style={styles.actionButtonWrapper}>
        {/* message button */}
        <ExploreActionBtn
          icon={<MessageSvg />}
          handlePress={Helper.handleSmsSupport}
        />

        {/* call button */}
        <ExploreActionBtn
          icon={<PhoneSvg />}
          handlePress={Helper.handleCallSupport}
        />
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
