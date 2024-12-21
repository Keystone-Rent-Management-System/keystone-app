import React, {useMemo} from 'react';

import {Text, TouchableOpacity, View} from 'react-native';
import moment from 'moment/moment';

const ListingItem = ({
  icon,
  title,
  date,
  unit,
  amount,
  status,
  customDate,
  isPartial,
  handlePress,
  disabled,
  paymentStatus,
}) => {
  const isInactive = useMemo(() => {
    return paymentStatus?.toLowerCase() === 'inactive';
  }, [paymentStatus]);

  return (
    <TouchableOpacity
      className={
        'mb-4 flex-row space-x-3 pt-2 pb-3 border-b border-b-border_grey'
      }
      disabled={disabled}
      onPress={handlePress}>
      <View
        className={
          'items-center justify-center h-10 w-10 rounded-full bg-white overflow-hidden border border-border_grey'
        }>
        {icon}
      </View>

      <View className={'flex-1'}>
        <View className={'flex-row justify-between w-full'}>
          <Text
            className={` font-inter-medium text-xs ${
              isInactive ? 'text-[#000000A0]' : 'text-primary'
            }`}>
            {title}
          </Text>
          {status ? (
            <Text
              className={`${
                status?.toLowerCase() === 'occupied'
                  ? 'text-green-600'
                  : 'text-inactive_text'
              } font-inter-medium text-11 capitalize`}>
              {status?.toLowerCase()}
            </Text>
          ) : null}
          {customDate ? (
            <Text className={'font-inter text-2xs text-inactive_text'}>
              {customDate ? customDate : moment(date).format('MMM DD YYYY')}
            </Text>
          ) : null}
        </View>

        <View className={'flex-row justify-between w-full mt-2'}>
          <Text className={'font-inter text-2xs text-inactive_text'}>
            {unit}
          </Text>

          <View className={'flex-row'}>
            {isPartial ? (
              <Text className={'text-green-600 font-inter-medium text-11'}>
                Partial .&nbsp;
              </Text>
            ) : null}
            {amount ? (
              <Text
                className={`text-black font-inter-medium text-xs
              ${isInactive ? 'text-[#000000A0]' : 'text-black'}
              `}>
                KES. {amount}
                <Text className={`${isInactive ? '' : 'text-green-600'}`}>
                  {isInactive ? ' (settled)' : ' (open)'}
                </Text>
              </Text>
            ) : null}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default ListingItem;
