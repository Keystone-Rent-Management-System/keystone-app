import React from "react";
import { ScrollView, View } from "react-native";

const Layout = ({
  children,
  ClassName,
  isScrollable = false,
  scrollViewProps,
}) => {
  if (isScrollable) {
    return (
      <ScrollView
        className={`flex-1 relative bg-bg ${ClassName}`}
        {...scrollViewProps}>
        {children}
      </ScrollView>
    );
  } else {
    return (
      <View className={`flex-1 relative bg-bg ${ClassName}`}>{children}</View>
    );
  }
};

export default Layout;
