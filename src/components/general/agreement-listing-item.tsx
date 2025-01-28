import React, {ReactNode} from 'react';

import {Text, TouchableOpacity, View} from 'react-native';

interface IAgreementListingItem {
  icon: ReactNode;
  title: string;
  unit: string;
  customDate?: string;
  disabled?: boolean;
  handlePress?: () => void;
  amount: number;
}

const AgreementListingItem = ({
  icon,
  title,
  customDate,
  unit,
  amount,
  disabled,
  handlePress,
}: IAgreementListingItem) => {
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
          <Text className={` font-inter-medium text-xs ${'text-primary'}`}>
            {title}
          </Text>

          {customDate ? (
            <Text className={'font-inter text-2xs text-inactive_text'}>
              {customDate}
            </Text>
          ) : null}
        </View>

        <View className={'flex-row justify-between w-full mt-2'}>
          <Text className={'font-inter text-2xs text-black'}>Unit {unit}</Text>

          <View className={'flex-row'}>
            {amount ? (
              <Text
                className={`text-black font-inter-medium text-xs
              ${'text-black'}
              `}>
                KES. {amount}
              </Text>
            ) : null}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default AgreementListingItem;
