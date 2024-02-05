import React, {useState} from 'react';
import MapView, {Marker} from 'react-native-maps';
import {Text, View} from 'react-native';

import listings from '@/provider/listings';

const initialRegion = {
  latitude: -1.2881012218277417,
  longitude: 36.82609607136736,
  latitudeDelta: 1,
  longitudeDelta: 0.5,
};

const Map = () => {
  const [current, setCurrent] = useState(null);

  const handleSetCurrent = id => {
    setCurrent(id);
  };

  return (
    <MapView className={'flex-1'} region={initialRegion}>
      {listings.map(item => {
        return (
          <Marker
            key={item.id}
            coordinate={item?.coordinates}
            onPress={() => handleSetCurrent(item.id)}>
            <CustomMarker text={item?.price} isCurrent={current === item.id} />
          </Marker>
        );
      })}
    </MapView>
  );
};

export default Map;

const CustomMarker = ({text, handlePress, isCurrent}) => (
  <View
    className={`py-0.5 px-3 rounded-full ${
      isCurrent ? 'bg-black' : 'bg-white'
    } relative mb-1.5`}
    onPress={handlePress}>
    <Text
      style={{elevation: 3}}
      className={`font-inter-medium ${
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
