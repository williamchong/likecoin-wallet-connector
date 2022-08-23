import * as React from 'react';
import { SVGProps } from 'react';

export const AlertIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
    <g
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      fill="none"
    >
      <path d="M12 6.03v8" />
      <circle cx={12} cy={12} r={11} />
    </g>
    <circle cx={12} cy={18.47} r={1.5} fill="currentColor" />
  </svg>
);

export default AlertIcon;
