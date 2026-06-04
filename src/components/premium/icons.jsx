import React from 'react';
import Svg, {Path, Circle, Rect, Line, Polyline} from 'react-native-svg';
import COLORS from '../../constants/Theme';

// Monochrome line-icon set for the command center. Consistent 24×24
// viewport, stroke-only (no fill), rounded joins — replaces the
// placeholder emoji so the UI reads finished, not prototyped.
// Default color is navy; pass `color` for gold/white variants.
//
// Each glyph is a function of the shared stroke props so the line
// weight/color applies uniformly to every sub-path.

const GLYPHS = {
  collection: p => (
    <>
      <Line x1="4" y1="20" x2="20" y2="20" {...p} />
      <Rect x="5" y="11" width="3.4" height="6" rx="1" {...p} />
      <Rect x="10.3" y="7" width="3.4" height="10" rx="1" {...p} />
      <Rect x="15.6" y="4" width="3.4" height="13" rx="1" {...p} />
    </>
  ),
  card: p => (
    <>
      <Rect x="3" y="6" width="18" height="12" rx="2.5" {...p} />
      <Line x1="3" y1="10" x2="21" y2="10" {...p} />
      <Line x1="7" y1="14.5" x2="11" y2="14.5" {...p} />
    </>
  ),
  lease: p => (
    <>
      <Path d="M7 3h7l4 4v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" {...p} />
      <Path d="M14 3v4h4" {...p} />
      <Line x1="9" y1="12" x2="15" y2="12" {...p} />
      <Line x1="9" y1="15.5" x2="15" y2="15.5" {...p} />
    </>
  ),
  trending: p => (
    <>
      <Polyline points="3,16 9,10 13,14 21,6" {...p} />
      <Polyline points="15,6 21,6 21,12" {...p} />
    </>
  ),
  reports: p => (
    <Path
      d="M3 7a2 2 0 0 1 2-2h4l2 2.5h8a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z"
      {...p}
    />
  ),
  shield: p => (
    <>
      <Path d="M12 3l7 3v5c0 4.4-3 7.6-7 9-4-1.4-7-4.6-7-9V6l7-3z" {...p} />
      <Polyline points="9,12 11,14 15,9.5" {...p} />
    </>
  ),
  wrench: p => (
    <Path
      d="M15.5 5.5a4 4 0 0 0-5.2 5L4 16.8 7.2 20l6.3-6.3a4 4 0 0 0 5-5.2l-2.4 2.4-2.2-.6-.6-2.2 2.2-2.6z"
      {...p}
    />
  ),
  scale: p => (
    <>
      <Line x1="12" y1="4" x2="12" y2="20" {...p} />
      <Line x1="7" y1="20" x2="17" y2="20" {...p} />
      <Line x1="5" y1="7" x2="19" y2="7" {...p} />
      <Path d="M5 7l-2.5 5a2.5 2.5 0 0 0 5 0L5 7z" {...p} />
      <Path d="M19 7l-2.5 5a2.5 2.5 0 0 0 5 0L19 7z" {...p} />
    </>
  ),
  users: p => (
    <>
      <Circle cx="9" cy="8" r="3" {...p} />
      <Path d="M3.5 19a5.5 5.5 0 0 1 11 0" {...p} />
      <Path d="M16 5.5a3 3 0 0 1 0 5.5" {...p} />
      <Path d="M17.5 13.5a5.5 5.5 0 0 1 3 5" {...p} />
    </>
  ),
  bank: p => (
    <>
      <Polyline points="4,9 12,4 20,9" {...p} />
      <Line x1="4" y1="9" x2="20" y2="9" {...p} />
      <Line x1="6" y1="9" x2="6" y2="17" {...p} />
      <Line x1="10" y1="9" x2="10" y2="17" {...p} />
      <Line x1="14" y1="9" x2="14" y2="17" {...p} />
      <Line x1="18" y1="9" x2="18" y2="17" {...p} />
      <Line x1="3" y1="20" x2="21" y2="20" {...p} />
    </>
  ),
  bell: p => (
    <>
      <Path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6z" {...p} />
      <Path d="M10 19a2 2 0 0 0 4 0" {...p} />
    </>
  ),
};

const Icon = ({name, size = 22, color = COLORS.keystone_navy, strokeWidth = 1.7}) => {
  const glyph = GLYPHS[name];
  if (!glyph) return null;
  const strokeProps = {
    stroke: color,
    strokeWidth,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    fill: 'none',
  };
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {glyph(strokeProps)}
    </Svg>
  );
};

export default Icon;
