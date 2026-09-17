import type { SVGProps } from 'react';

export type IconProps = SVGProps<SVGSVGElement> & { size?: number | string; title?: string };

export function Email({ size = 24, title, ...props }: IconProps) {
  return (
    <svg viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"2"} strokeLinecap={"round"} strokeLinejoin={"round"} width={size} height={size} aria-hidden={title ? undefined : true} aria-label={title} {...props}>
      <path d={"m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7"}  />
  <rect x={"2"} y={"4"} width={"20"} height={"16"} rx={"2"}  />
    </svg>
  );
}
