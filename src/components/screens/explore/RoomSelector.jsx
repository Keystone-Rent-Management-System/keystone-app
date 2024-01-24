import {Text, TouchableOpacity, View} from 'react-native';
import React, {useMemo, useState} from 'react';
import {BottomSheetFlatList} from '@gorhom/bottom-sheet';

const RoomSelector = ({label, filter, containerClassName, labelClassName}) => {
  const [active, setActive] = useState(0);

  const handlePress = index => {
    setActive(index);
  };
  const filterName = useMemo(() => Object.keys(filter).at(0), [filter]);

  return (
    <View className={` flex flex-col mt-2 ${containerClassName}`}>
      <Text className={`font-inter text-xs text-black mb-3 ${labelClassName}`}>
        {filterName}
      </Text>

      {/* Buttons */}
      <View className={'flex-row'}>
        <BottomSheetFlatList
          data={filter[filterName]}
          renderItem={({item, index}) =>
            renderFilterItem({
              item,
              index,
              isActive: active === index,
              handlePress: () => handlePress(index),
            })
          }
          horizontal={true}
          showsHorizontalScrollIndicator={false}
        />
      </View>
    </View>
  );
};

const renderFilterItem = ({item, index: ind, isActive, handlePress}) => (
  <SelectorButton isActive={isActive} text={item} handlePress={handlePress} />
);
export const SelectorButton = ({text = '3', isActive, handlePress}) => (
  <TouchableOpacity
    className={`bg-white  border border-border_grey mr-3 py-1.5 px-4 rounded-full ${
      isActive ? 'bg-primary' : 'bg-white'
    }`}
    onPress={handlePress}>
    <Text
      className={`text-13 ${
        isActive ? 'text-white' : 'text-black'
      } font-inter`}>
      {text}
    </Text>
  </TouchableOpacity>
);
export default RoomSelector;
