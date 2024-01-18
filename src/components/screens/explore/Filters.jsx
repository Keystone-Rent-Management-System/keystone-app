import React, {useState} from 'react';
import {Text, TouchableOpacity, View} from 'react-native';

import {BedSvg, StudioSvg, VillaSvg} from '../../../assets/icons';
import COLORS from '../../../constants/Theme';

const Filters = () => {
  const [current, setCurrent] = useState(1);

  const handleChooseFilter = key => {
    setCurrent(key);
  };

  return (
    <View
      className={
        'px-4 flex-row justify-between border-b border-border_grey space-x-2'
      }>
      {filters.map(({icon, title, key}) => (
        <FilterButton
          isCurrent={key === current}
          key={key}
          icon={icon}
          text={title}
          handlePress={() => handleChooseFilter(key)}
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
    title: 'Studio',
    key: 1,
  },
  {
    icon: color => <BedSvg color={color} />,
    title: '1 Bedroom',
    key: 2,
  },
  {
    icon: color => <BedSvg color={color} />,
    title: '2 Bedroom',
    key: 3,
  },
  {
    icon: color => <BedSvg color={color} />,
    title: '3 Bedroom',
    key: 4,
  },
  {
    icon: color => <VillaSvg color={color} />,
    title: 'Villa',
    key: 5,
  },
];
