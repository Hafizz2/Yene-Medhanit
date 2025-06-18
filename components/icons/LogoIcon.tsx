
import React from 'react';

const LogoIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    viewBox="0 0 100 100" 
    xmlns="http://www.w3.org/2000/svg" 
    aria-label="Yene Medhanit Logo"
    {...props}
  >
    <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{stopColor: 'currentColor', stopOpacity: 1}} />
        <stop offset="100%" style={{stopColor: 'currentColor', stopOpacity: 0.7}} />
        </linearGradient>
    </defs>
    <circle cx="50" cy="50" r="45" fill="url(#logoGradient)" stroke="currentColor" strokeWidth="3"/>
    <text 
      x="50" 
      y="62" 
      fontFamily="Arial, sans-serif" 
      fontSize="40" 
      fontWeight="bold" 
      textAnchor="middle" 
      fill="white"
      // className="dark:fill-slate-900" removed
    >
      YM
    </text>
  </svg>
);

export default LogoIcon;
