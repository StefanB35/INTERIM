import type { SVGProps } from 'react';

export type IconProps = SVGProps<SVGSVGElement> & { size?: number | string; title?: string };

export function CumulCreneaux({ size = 24, title, ...props }: IconProps) {
  return (
    <svg viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"2"} strokeLinecap={"round"} strokeLinejoin={"round"} width={size} height={size} aria-hidden={title ? undefined : true} aria-label={title} {...props}>
      <path d={"m17 2 4 4-4 4"}  />
  <path d={"M3 11v-1a4 4 0 0 1 4-4h14"}  />
  <path d={"m7 22-4-4 4-4"}  />
  <path d={"M21 13v1a4 4 0 0 1-4 4H3"}  />
    </svg>
  );
}
