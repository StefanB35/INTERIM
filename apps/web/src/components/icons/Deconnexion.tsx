import type { SVGProps } from 'react';

export type IconProps = SVGProps<SVGSVGElement> & { size?: number | string; title?: string };

export function Deconnexion({ size = 24, title, ...props }: IconProps) {
  return (
    <svg viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"2"} strokeLinecap={"round"} strokeLinejoin={"round"} width={size} height={size} aria-hidden={title ? undefined : true} aria-label={title} {...props}>
      <path d={"m16 17 5-5-5-5"}  />
  <path d={"M21 12H9"}  />
  <path d={"M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"}  />
    </svg>
  );
}
