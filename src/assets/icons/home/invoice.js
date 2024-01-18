import React from 'react';
import Svg, {Path} from 'react-native-svg';

const Invoice = () => {
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      width="36"
      height="36"
      viewBox="0 0 36 36"
      fill="none">
      <Path
        d="M22.5 10.5H13.5M22.5 16.5H13.5M22.5 22.5H16.5M7.5 4.5H28.5V31.5L26.952 30.174C26.4083 29.708 25.7158 29.4519 24.9998 29.4519C24.2837 29.4519 23.5912 29.708 23.0475 30.174L21.4995 31.5L19.953 30.174C19.4092 29.7076 18.7164 29.4512 18 29.4512C17.2836 29.4512 16.5908 29.7076 16.047 30.174L14.5005 31.5L12.9525 30.174C12.4088 29.708 11.7163 29.4519 11.0002 29.4519C10.2842 29.4519 9.59171 29.708 9.048 30.174L7.5 31.5V4.5Z"
        stroke="#8001A1"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default Invoice;
