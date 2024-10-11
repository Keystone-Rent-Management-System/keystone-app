import React, {useState} from 'react';
import {Text, TouchableOpacity, View} from 'react-native';

import {BedSvg, StudioSvg, VillaSvg} from '../../../assets/icons';
import COLORS from '../../../constants/Theme';

const Filters = ({handleAddRemoveFilter}) => {
  const [current, setCurrent] = useState(null);

  const handleChooseFilter = (key, title, filterKey) => {
    // remove key if it already exists as the current
    if (key === current) {
      setCurrent(null);
    } else {
      setCurrent(key);
    }

    if (filterKey === 'houseType') {
      handleAddRemoveFilter(filterKey, title, true);
    } else if (filterKey === 'bedrooms') {
      //   extract the number of bedrooms from the title
      const bedrooms = parseInt(title.split(' ')[0], 10);
      handleAddRemoveFilter(filterKey, bedrooms, true);
    }
  };

  return (
    <View
      className={
        'px-4 flex-row justify-between border-b border-border_grey space-x-2'
      }>
      {filters.map(({icon, title, filterKey, key}) => (
        <FilterButton
          isCurrent={key === current}
          key={key}
          icon={icon}
          text={title}
          handlePress={() => handleChooseFilter(key, title, filterKey)}
        />
      ))}
    </View>
  );
};

export default Filters;

const FilterButton = ({icon, text, isCurrent, handlePress}) => (
  <TouchableOpacity
    className={`py-2.5 items-center min-w-[40px] ${
      isCurrent ? 'border-b-2 border-primary' : 'border-0'
    }`}
    onPress={handlePress}>
    <View className={'h-6 justify-center'}>
      {icon(isCurrent ? COLORS.primary : COLORS.grey_1)}
    </View>
    <Text
      className={`text-11 font-inter ${
        isCurrent ? 'text-primary' : 'text-grey_1'
      }`}>
      {text}
    </Text>
  </TouchableOpacity>
);

const filters = [
  {
    icon: color => {
      return <StudioSvg color={color} />;
    },
    title: 'Apartment',
    key: 1,
    filterKey: 'houseType',
  },
  {
    icon: color => <BedSvg color={color} />,
    title: '1 Bedroom',
    key: 2,
    filterKey: 'bedrooms',
  },
  {
    icon: color => <BedSvg color={color} />,
    title: '2 Bedroom',
    key: 3,
    filterKey: 'bedrooms',
  },
  {
    icon: color => <BedSvg color={color} />,
    title: '3 Bedroom',
    key: 4,
    filterKey: 'bedrooms',
  },
  {
    icon: color => <VillaSvg color={color} />,
    title: 'Villa',
    key: 5,
    filterKey: 'houseType',
  },
];
