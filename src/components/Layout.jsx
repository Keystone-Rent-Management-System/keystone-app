import React from 'react';

import {View} from 'react-native';

const Layout = ({children, className}) => {
  return <View className={`flex-1 bg-bg p-5 ${className}`}>{children}</View>;
};

export default Layout;
