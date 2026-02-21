import React from 'react';
import Svg, { Rect } from 'react-native-svg';

const AppLogo = ({ size = 100 }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      {/* Background Rounded Square */}
      <Rect width="100" height="100" rx="24" fill="#1A2232" />
      
      {/* 4 Inner Squares */}
      {/* Top Left - Active Blue */}
      <Rect x="28" y="28" width="20" height="20" rx="6" fill="#00D1FF" />
      
      {/* Top Right - Muted */}
      <Rect x="52" y="28" width="20" height="20" rx="6" fill="#334155" />
      
      {/* Bottom Left - Muted */}
      <Rect x="28" y="52" width="20" height="20" rx="6" fill="#334155" />
      
      {/* Bottom Right - Muted */}
      <Rect x="52" y="52" width="20" height="20" rx="6" fill="#334155" />
    </Svg>
  );
};

export default AppLogo;