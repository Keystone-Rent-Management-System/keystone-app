import React from 'react';
import Svg, {Path, Rect, Circle} from 'react-native-svg';

// Landlord-tab icons. Kept tightly aligned with the existing nav
// glyph style (22×21 viewport, stroke-only, no fill) so the bottom
// bar reads consistently between landlord and tenant modes.

export const DashboardSvg = ({strokeWidth = '1.2', color = '#000'}) => (
  <Svg width="22" height="22" viewBox="0 0 22 22" fill="none">
    <Rect
      x="3"
      y="3"
      width="7"
      height="9"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinejoin="round"
    />
    <Rect
      x="3"
      y="14"
      width="7"
      height="5"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinejoin="round"
    />
    <Rect
      x="12"
      y="3"
      width="7"
      height="5"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinejoin="round"
    />
    <Rect
      x="12"
      y="10"
      width="7"
      height="9"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinejoin="round"
    />
  </Svg>
);

export const PaymentsSvg = ({strokeWidth = '1.2', color = '#000'}) => (
  <Svg width="22" height="22" viewBox="0 0 22 22" fill="none">
    <Path
      d="M11 4v14M7.5 7.5h5a2 2 0 0 1 0 4h-3a2 2 0 0 0 0 4h5.5"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const LeasesSvg = ({strokeWidth = '1.2', color = '#000'}) => (
  <Svg width="22" height="22" viewBox="0 0 22 22" fill="none">
    <Path
      d="M6 3h7l4 4v12a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinejoin="round"
    />
    <Path
      d="M13 3v4h4M8 12h6M8 15h6"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
  </Svg>
);

export const ReportsSvg = ({strokeWidth = '1.2', color = '#000'}) => (
  <Svg width="22" height="22" viewBox="0 0 22 22" fill="none">
    <Path
      d="M3 19h16"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
    <Rect
      x="5"
      y="11"
      width="3"
      height="6"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinejoin="round"
    />
    <Rect
      x="10"
      y="7"
      width="3"
      height="10"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinejoin="round"
    />
    <Rect
      x="15"
      y="4"
      width="3"
      height="13"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinejoin="round"
    />
  </Svg>
);
