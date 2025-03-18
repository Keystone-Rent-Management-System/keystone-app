import React from 'react';
import Svg, {Path} from 'react-native-svg';

const ArrowDownUp = () => {
  return (
    <Svg width="25" height="24" viewBox="0 0 25 24" fill="none">
      <Path
        d="M11.5 16L8.5 19M8.5 19L5.5 16M8.5 19V5M13.5 8L16.5 5M16.5 5L19.5 8M16.5 5V19"
        stroke="#022374"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default ArrowDownUp;
