import React from 'react';
import Svg, {Path} from 'react-native-svg';

const Close = ({size = '12'}) => {
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 12 12"
      fill="none">
      <Path
        d="M3 3.00001L9.3871 9.38711M3 9.3871L9.3871 3"
        stroke="#14142B"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default Close;
