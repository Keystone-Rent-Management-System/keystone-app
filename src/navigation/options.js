import React from "react";
import { View } from "react-native";
import COLORS from "../constants/Theme";

export const titleStyling = {
  color: COLORS.primary,
  fontSize: 18,
  fontFamily: "Inter-SemiBold",
  marginHorizontal: "auto",
};

const emptyBarOptions = {
  headerShown: true,
  title: "",
  headerLeft: () => <View />,
  headerShadowVisible: false,
  headerTitleStyle: titleStyling,
};
const withBackBarOptions = {
  headerShown: true,
  title: "",
  headerShadowVisible: false,
  headerTitleStyle: titleStyling,
};
const defaultOptions = {
  headerShown: true,
  headerTitleStyle: titleStyling,
};

const NavOptions = {
  emptyBarOptions,
  withBackBarOptions,
  defaultOptions,
};

export default NavOptions;
