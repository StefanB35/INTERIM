import type { SVGProps } from 'react';

export type IconProps = SVGProps<SVGSVGElement> & { size?: number | string; title?: string };

export function PicLigne({ size = 24, title, ...props }: IconProps) {
  return (
    <svg viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"2"} strokeLinecap={"round"} strokeLinejoin={"round"} width={size} height={size} aria-hidden={title ? undefined : true} aria-label={title} {...props}>
      <path d={"m8 3 4 8 5-5 5 15H2L8 3z"}  />
  <path d={"M4.14 15.08c2.62-1.57 5.24-1.43 7.86.42 2.74 1.94 5.49 2 8.23.19"}  />
    </svg>
  );
}
