import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {}

export const PilotIcon: React.FC<IconProps> = (props) => (
  <svg 
    {...props}
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M12 2L12 7" />
    <path d="M12 22L12 17" />
    <path d="M22 12L17 12" />
    <path d="M7 12L2 12" />
    <path d="M19.07 4.93L15.54 8.46" />
    <path d="M8.46 15.54L4.93 19.07" />
    <path d="M19.07 19.07L15.54 15.54" />
    <path d="M8.46 8.46L4.93 4.93" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
