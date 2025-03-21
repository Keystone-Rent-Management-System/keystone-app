import {Image, Text, View} from 'react-native';
import React from 'react';

export const ProfileView = ({
  image = null,
  text,
  textClassName = '',
  containerClassName = '',
}) =>
  image ? (
    <Image
      className={'h-12 w-12 rounded-full'}
      source={{
        uri: image,
      }}
      alt="profile"
    />
  ) : (
    <View
      className={`rounded-full h-12 w-12 justify-center items-center p-2 ${containerClassName}`}>
      <Text className={` font-open-sauce-sans-bold text-xl ${textClassName}`}>
        {text}
      </Text>
    </View>
  );

export default ProfileView;
