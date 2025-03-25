import React from 'react';

import {Text, TouchableOpacity, View} from 'react-native';
import {CheckSvg, RightArrowSvg} from '../../../../assets/icons';
import COLORS from '../../../../constants/Theme';

const HelpItem = props => {
  return (
    <TouchableOpacity
      onPress={props?.handlePress}
      className={
        'flex-row p-3 border border-border_grey rounded-xl space-x-2 items-center'
      }>
      <CheckSvg size={'28'} color={COLORS.primary} />

      <View className={'flex-1'}>
        <Text className={'text-black font-open-sauce-sans-semibold mb-1'}>
          {props.title}
        </Text>
        <Text className={'text-grey_1 font-open-sauce-sans text-xs'}>{props.desc}</Text>
      </View>

      <TouchableOpacity className={'mr-2'} onPress={props?.handlePress}>
        <RightArrowSvg size={'22'} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

export default HelpItem;
