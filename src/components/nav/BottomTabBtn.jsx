import React from 'react';

import {Text, View} from 'react-native';

const BottomTabBtn = ({icon, text, isCurrent}) => {
  return (
    <View className={'space-y-1 items-center'}>
      {icon(isCurrent)}

      <Text
        className={` text-11 ${
          isCurrent
            ? 'text-primary font-inter-medium'
            : 'text-grey_1 font-inter'
        }`}>
        {text}
      </Text>
    </View>
  );
};

export default BottomTabBtn;
