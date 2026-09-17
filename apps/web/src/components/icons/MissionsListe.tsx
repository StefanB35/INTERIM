import type { SVGProps } from 'react';

export type IconProps = SVGProps<SVGSVGElement> & { size?: number | string; title?: string };

export function MissionsListe({ size = 24, title, ...props }: IconProps) {
  return (
    <svg viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"2"} strokeLinecap={"round"} strokeLinejoin={"round"} width={size} height={size} aria-hidden={title ? undefined : true} aria-label={title} {...props}>
      <path d={"M13 5h8"}  />
  <path d={"M13 12h8"}  />
  <path d={"M13 19h8"}  />
  <path d={"m3 17 2 2 4-4"}  />
  <path d={"m3 7 2 2 4-4"}  />
    </svg>
  );
}
