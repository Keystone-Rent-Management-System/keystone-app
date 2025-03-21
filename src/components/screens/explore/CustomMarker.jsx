import React from 'react';

import {Text, View} from 'react-native';

const CustomMarker = ({text, handlePress, isCurrent}) => (
  <View
    className={`py-0.5 px-3 rounded-full ${
      isCurrent ? 'bg-black' : 'bg-white'
    } relative mb-1.5`}
    onPress={handlePress}>
    <Text
      className={`font-open-sauce-sans-medium ${
        isCurrent ? 'text-white' : 'text-black'
      } shadow text-2xs`}>
      KES {text}
    </Text>

    <View
      className={`h-3 w-3 rotate-45 absolute mx-auto -bottom-1 left-[60%] -z-1 ${
        isCurrent ? 'bg-black' : 'bg-white'
      } `}
    />
  </View>
);

export default CustomMarker;
