import React from 'react';
import {ActivityIndicator, TouchableOpacity, View} from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import RefreshSvg from '@/assets/icons/home/refresh';
import COLORS from '@/constants/Theme';
import UnitSelector from './unit-selector';

const ApartmentTitle = ({handleSelect, refetch, isLoading}) => {
  const rotation = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{rotate: `${rotation.value}deg`}],
  }));

  const handlePress = () => {
    // Start rotation animation
    rotation.value = withTiming(rotation.value + 120, {duration: 300}, () => {
      // Call refetch on the JS thread using runOnJS
      runOnJS(refetch)();

      // Reset rotation value to 0
      rotation.value = withTiming(0, {duration: 200});
    });
  };
  return (
    <View className={'flex-row '}>
      <UnitSelector onPress={handleSelect} />

      <TouchableOpacity
        className={`flex-row items-center justify-center bg-bg_pale rounded-lg h-10 w-10 ${
          isLoading ? 'opacity-90' : ''
        }`}
        onPress={handlePress}
        disabled={isLoading}>
        {isLoading ? (
          <ActivityIndicator size={25} color={COLORS.primary} />
        ) : (
          <Animated.View style={animatedStyle}>
            <RefreshSvg />
          </Animated.View>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default ApartmentTitle;
