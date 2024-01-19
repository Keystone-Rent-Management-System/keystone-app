import React from 'react';

import {View} from 'react-native';

const Layout = ({children, ClassName}) => {
  return <View className={`flex-1 bg-bg ${ClassName}`}>{children}</View>;
};

export default Layout;
