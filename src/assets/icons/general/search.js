import React from 'react';
import Svg, {Path} from 'react-native-svg';

const Search = ({size = '19'}) => {
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 19 19"
      fill="none">
      <Path
        d="M17.4167 17.4167L14.25 14.25M15.8334 8.70837C15.8334 12.6434 12.6434 15.8334 8.70837 15.8334C4.77335 15.8334 1.58337 12.6434 1.58337 8.70837C1.58337 4.77335 4.77335 1.58337 8.70837 1.58337C12.6434 1.58337 15.8334 4.77335 15.8334 8.70837Z"
        stroke="#14142B"
        stroke-width="1.8"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </Svg>
  );
};

export default Search;
