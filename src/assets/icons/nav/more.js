import React from 'react';
import Svg, {Path} from 'react-native-svg';

const More = ({color}) => {
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      width="21"
      height="21"
      viewBox="0 0 21 21">
      <Path
        d="M14.7977 10.3146C14.7977 10.7893 15.1825 11.1741 15.6572 11.1741C16.1319 11.1741 16.5167 10.7893 16.5167 10.3146C16.5167 9.8399 16.1319 9.45508 15.6572 9.45508C15.1825 9.45508 14.7977 9.8399 14.7977 10.3146Z"
        stroke={color}
        strokeWidth="0.859532"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M9.64047 10.3146C9.64047 10.7893 10.0253 11.1741 10.5 11.1741C10.9747 11.1741 11.3595 10.7893 11.3595 10.3146C11.3595 9.8399 10.9747 9.45508 10.5 9.45508C10.0253 9.45508 9.64047 9.8399 9.64047 10.3146Z"
        stroke={color}
        strokeWidth="0.859532"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M4.48328 10.3146C4.48328 10.7893 4.8681 11.1741 5.34281 11.1741C5.81751 11.1741 6.20234 10.7893 6.20234 10.3146C6.20234 9.8399 5.81751 9.45508 5.34281 9.45508C4.8681 9.45508 4.48328 9.8399 4.48328 10.3146Z"
        stroke={color}
        strokeWidth="0.859532"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default More;
