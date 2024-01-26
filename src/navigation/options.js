import React from 'react';
import {View} from 'react-native';

const emptyBarOptions = {
  headerShown: true,
  title: '',
  headerLeft: () => <View />,
  headerShadowVisible: false,
};
const withBackBarOptions = {
  headerShown: true,
  title: '',
  headerShadowVisible: false,
};
const defaultOptions = {
  headerShown: true,
  headerTitleStyle: {fontFamily: 'Barlow-Semibold'},
};

const NavOptions = {
  emptyBarOptions,
  withBackBarOptions,
  defaultOptions,
};

export default NavOptions;
