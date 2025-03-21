import {Text, TouchableOpacity, View} from 'react-native';
import React, {useEffect, useMemo, useState} from 'react';
import {BottomSheetFlatList} from '@gorhom/bottom-sheet';

const RoomSelector = ({
  label = null,
  filter,
  containerClassName = '',
  labelClassName = '',
  handleActiveChange,
}) => {
  const [active, setActive] = useState(0);

  const handlePress = index => {
    setActive(index);
  };
  const filterName = useMemo(() => Object.keys(filter).at(0), [filter]);

  useEffect(() => {
    handleActiveChange(`${filterName?.toLowerCase() ?? ''}_${active}`);
  }, [active, handleActiveChange, filterName]);

  return (
    <View className={` flex flex-col mt-2 ${containerClassName}`}>
      <Text className={`font-open-sauce-sans text-xs text-black mb-3 ${labelClassName}`}>
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
export const SelectorButton = ({
  text = '3',
  isActive = false,
  handlePress = () => {},
  ClassName = '',
}) => (
  <TouchableOpacity
    className={`bg-white flex-row items-center  border border-border_grey mr-3 py-1.5 px-4 rounded-full ${
      isActive ? 'bg-primary' : 'bg-white'
    } ${ClassName}`}
    onPress={handlePress}>
    <Text
      className={`text-xs ${
        isActive ? 'text-white' : 'text-black'
      } font-open-sauce-sans`}>
      {text}
    </Text>
  </TouchableOpacity>
);
export default RoomSelector;
