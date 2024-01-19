import React from 'react';

import {View} from 'react-native';

const Badge = ({ClassName, children}) => {
  return (
    <View className={`py-1.5 px-5 rounded-full ${ClassName}`}>{children}</View>
  );
};

export default Badge;
