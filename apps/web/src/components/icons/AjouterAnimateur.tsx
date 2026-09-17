import type { SVGProps } from 'react';

export type IconProps = SVGProps<SVGSVGElement> & { size?: number | string; title?: string };

export function AjouterAnimateur({ size = 24, title, ...props }: IconProps) {
  return (
    <svg viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"2"} strokeLinecap={"round"} strokeLinejoin={"round"} width={size} height={size} aria-hidden={title ? undefined : true} aria-label={title} {...props}>
      <path d={"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"}  />
  <circle cx={"9"} cy={"7"} r={"4"}  />
  <line x1={"19"} x2={"19"} y1={"8"} y2={"14"}  />
  <line x1={"22"} x2={"16"} y1={"11"} y2={"11"}  />
    </svg>
  );
}
