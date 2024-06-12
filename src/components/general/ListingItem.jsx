import React from 'react';

import {Text, TouchableOpacity, View} from 'react-native';
import moment from 'moment/moment';

const ListingItem = ({
  icon,
  id,
  title,
  date,
  unit,
  amount,
  customDate,
  isPartial,
  handlePress,
}) => {
  return (
    <TouchableOpacity
      className={
        'mb-4 flex-row space-x-3 pt-2 pb-3 border-b border-b-border_grey'
      }
      onPress={() => handlePress(id)}>
      <View
        className={
          'items-center justify-center h-10 w-10 rounded-full bg-white overflow-hidden border border-border_grey'
        }>
        {icon}
      </View>

      <View className={'flex-1'}>
        <View className={'flex-row justify-between w-full'}>
          <Text className={'text-primary font-inter-medium text-xs'}>
            {title}
          </Text>
          <Text className={'font-inter text-2xs text-inactive_text'}>
            {customDate ? customDate : moment(date).format('MMM DD YYYY')}
          </Text>
        </View>

        <View className={'flex-row justify-between w-full mt-2'}>
          <Text className={'font-inter text-2xs text-inactive_text'}>
            {unit}
          </Text>

          <View className={'flex-row'}>
            {isPartial && (
              <Text className={'text-green-600 font-inter-medium text-11'}>
                Partial .&nbsp;
              </Text>
            )}
            <Text className={'text-black font-inter-medium text-xs'}>
              KES. {amount}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default ListingItem;
