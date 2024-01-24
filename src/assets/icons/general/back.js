import React from 'react';
import Svg, {Path} from 'react-native-svg';

const Back = ({size = '24'}) => {
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none">
      <Path
        d="M9.71732 5L3.00024 12L9.71732 19M4.26712 12.0317H20.0002"
        stroke="#14142B"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default Back;
