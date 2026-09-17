import type { SVGProps } from 'react';

export type IconProps = SVGProps<SVGSVGElement> & { size?: number | string; title?: string };

export function MiseEnRelation({ size = 24, title, ...props }: IconProps) {
  return (
    <svg viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"2"} strokeLinecap={"round"} strokeLinejoin={"round"} width={size} height={size} aria-hidden={title ? undefined : true} aria-label={title} {...props}>
      <path d={"M8 3 4 7l4 4"}  />
  <path d={"M4 7h16"}  />
  <path d={"m16 21 4-4-4-4"}  />
  <path d={"M20 17H4"}  />
    </svg>
  );
}
