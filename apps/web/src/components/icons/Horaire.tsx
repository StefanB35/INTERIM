import type { SVGProps } from 'react';

export type IconProps = SVGProps<SVGSVGElement> & { size?: number | string; title?: string };

export function Horaire({ size = 24, title, ...props }: IconProps) {
  return (
    <svg viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"2"} strokeLinecap={"round"} strokeLinejoin={"round"} width={size} height={size} aria-hidden={title ? undefined : true} aria-label={title} {...props}>
      <circle cx={"12"} cy={"12"} r={"10"}  />
  <path d={"M12 6v6l4 2"}  />
    </svg>
  );
}
