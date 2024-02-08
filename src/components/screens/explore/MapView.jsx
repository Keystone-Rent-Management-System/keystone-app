import React from 'react';
import MapView, {Marker} from 'react-native-maps';

import listings from '@/provider/listings';
import CustomMarker from './CustomMarker';

const initialRegion = {
  latitude: -1.2881012218277417,
  longitude: 36.82609607136736,
  latitudeDelta: 1,
  longitudeDelta: 0.5,
};

const Map = ({current, setCurrent}) => {
  return (
    <MapView className={'flex-1'} region={initialRegion}>
      {listings.map(item => {
        return (
          <Marker
            key={item.id}
            coordinate={item?.coordinates}
            onPress={() => setCurrent(item.id)}>
            <CustomMarker isCurrent={item.id === current} text={item?.price} />
          </Marker>
        );
      })}
    </MapView>
  );
};

export default Map;
