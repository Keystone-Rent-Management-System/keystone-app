import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

import ProfileView from '../ProfileView';
import {ExploreActionBtn} from './index';
import {MessageSvg, PhoneSvg} from '../../../assets/icons';
import Helper from '../../../utils/Helper';

interface ILandlordItem {
  name: string;
  phoneNumber: string;
  rent: string;
  ClassName?: string;
}

const LandlordItem = ({name, phoneNumber, ClassName, rent}: ILandlordItem) => {
  return (
    <View className={`px-4 py-2 flex-row items-center ${ClassName}`}>
      <ProfileView
        text={Helper.getInitials(name)}
        textClassName={'text-white text-lg'}
        containerClassName={'bg-primary'}
      />

      <View className={'mx-3 flex-1 '} style={{gap: 2}}>
        <Text className={'font-inter-medium text-black'}>{name}</Text>
        <Text className={'pl-1 font-inter capitalize text-13 text-grey_1'}>
          {phoneNumber}
        </Text>
        <Text className={'pl-1 font-inter capitalize text-13 text-grey_1'}>
          Rent: {rent}
        </Text>
      </View>

      <View
        className={'flex-row items-center'}
        style={styles.actionButtonWrapper}>
        {/* message button */}
        <ExploreActionBtn
          icon={<MessageSvg />}
          handlePress={() => Helper.handleSms(phoneNumber)}
        />

        {/* call button */}
        <ExploreActionBtn
          icon={<PhoneSvg />}
          handlePress={() => Helper.handleCall(phoneNumber)}
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
