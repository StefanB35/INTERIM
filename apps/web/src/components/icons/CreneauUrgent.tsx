import type { SVGProps } from 'react';

export type IconProps = SVGProps<SVGSVGElement> & { size?: number | string; title?: string };

export function CreneauUrgent({ size = 24, title, ...props }: IconProps) {
  return (
    <svg viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"2"} strokeLinecap={"round"} strokeLinejoin={"round"} width={size} height={size} aria-hidden={title ? undefined : true} aria-label={title} {...props}>
      <path d={"M16 14v2.2l1.6 1"}  />
  <path d={"M16 2v3"}  />
  <path d={"M21 7.338V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2h2.338"}  />
  <path d={"M3 9h5.859"}  />
  <path d={"M8 2v3"}  />
  <circle cx={"16"} cy={"16"} r={"6"}  />
    </svg>
  );
}
