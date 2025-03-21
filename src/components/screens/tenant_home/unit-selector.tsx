import React from 'react';
import {
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
} from 'react-native';
import FontAwesome5Icon from 'react-native-vector-icons/FontAwesome5';

import {useActiveAgrement} from '../../../hooks';

interface IUnitSelector extends TouchableOpacityProps {}

const UnitSelector = (props: IUnitSelector) => {
  const {agreement} = useActiveAgrement();

  return (
    <TouchableOpacity className={'flex-1'} {...props}>
      <View className="flex-row items-center gap-2">
        <Text className={'text-black font-open-sauce-sans-medium text-15'}>
          {/* @ts-ignore */}
          {agreement?.propertyUnits?.property?.name}
        </Text>

        {/* dropdown icon */}
        <FontAwesome5Icon name="angle-down" color={'black'} size={20} />
      </View>

      <Text className={'text-xs mt-1 font-open-sauce-sans text-black'}>
        {/* @ts-ignore */}
        Unit {agreement?.propertyUnits?.name}
      </Text>
    </TouchableOpacity>
  );
};

export default UnitSelector;
