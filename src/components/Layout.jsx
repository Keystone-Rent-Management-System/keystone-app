import React from 'react';

import {View} from 'react-native';

const Layout = ({children, className}) => {
  return <View className={`flex-1 bg-bg ${className}`}>{children}</View>;
};

export default Layout;
