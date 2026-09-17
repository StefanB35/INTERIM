import type { SVGProps } from 'react';

export type IconProps = SVGProps<SVGSVGElement> & { size?: number | string; title?: string };

export function TauxEncadrement({ size = 24, title, ...props }: IconProps) {
  return (
    <svg viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"2"} strokeLinecap={"round"} strokeLinejoin={"round"} width={size} height={size} aria-hidden={title ? undefined : true} aria-label={title} {...props}>
      <path d={"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"}  />
  <path d={"M16 3.128a4 4 0 0 1 0 7.744"}  />
  <path d={"M22 21v-2a4 4 0 0 0-3-3.87"}  />
  <circle cx={"9"} cy={"7"} r={"4"}  />
    </svg>
  );
}
