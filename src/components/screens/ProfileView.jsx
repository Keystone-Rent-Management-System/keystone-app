import {Image} from 'react-native';
import React from 'react';

export const ProfileView = ({image}) => (
  <Image
    className={'h-12 w-12 rounded-full'}
    source={{
      uri: image,
    }}
    alt="profile"
  />
);

export default ProfileView;
