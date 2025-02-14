import {View, Text, ActivityIndicator} from 'react-native';
import React from 'react';
import {TouchableOpacity} from 'react-native-gesture-handler';
import COLORS from '../../../../constants/Theme';

interface IDetailsHeaderProps {
  handleSave: () => void;
  showSave: boolean;
  isLoading?: boolean;
  loadingMessage?: string | undefined | boolean;
}

const DetailsHeader = ({
  handleSave,
  showSave,
  isLoading,
  loadingMessage,
}: IDetailsHeaderProps) => {
  return (
    <View className={'bg-white flex-row justify-between py-2 px-5'}>
      <Text className={'text-primary font-inter-semibold capitalize text-base'}>
        Account Details
      </Text>

      {showSave && (
        <TouchableOpacity
          className="flex-row items-center gap-1"
          onPress={handleSave}>
          <Text
            className={`text-primary font-inter-semibold uppercases ${
              isLoading ? 'opacity-70' : ''
            }`}>
            {loadingMessage || 'Save'}
          </Text>
          {isLoading && (
            <ActivityIndicator
              animating={true}
              color={COLORS.primary}
              size={15}
            />
          )}
        </TouchableOpacity>
      )}
    </View>
  );
};

export default DetailsHeader;
