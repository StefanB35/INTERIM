import type { SVGProps } from 'react';

export type IconProps = SVGProps<SVGSVGElement> & { size?: number | string; title?: string };

export function Localisation({ size = 24, title, ...props }: IconProps) {
  return (
    <svg viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"2"} strokeLinecap={"round"} strokeLinejoin={"round"} width={size} height={size} aria-hidden={title ? undefined : true} aria-label={title} {...props}>
      <path d={"M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"}  />
  <circle cx={"12"} cy={"10"} r={"3"}  />
    </svg>
  );
}
