import type { SVGProps } from 'react';

export type IconProps = SVGProps<SVGSVGElement> & { size?: number | string; title?: string };

export function Creneau({ size = 24, title, ...props }: IconProps) {
  return (
    <svg viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"2"} strokeLinecap={"round"} strokeLinejoin={"round"} width={size} height={size} aria-hidden={title ? undefined : true} aria-label={title} {...props}>
      <path d={"M8 2v3"}  />
  <path d={"M16 2v3"}  />
  <rect x={"3"} y={"3"} width={"18"} height={"18"} rx={"2"}  />
  <path d={"M3 9h18"}  />
    </svg>
  );
}
