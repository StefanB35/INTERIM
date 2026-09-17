import type { SVGProps } from 'react';

export type IconProps = SVGProps<SVGSVGElement> & { size?: number | string; title?: string };

export function Structure({ size = 24, title, ...props }: IconProps) {
  return (
    <svg viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"2"} strokeLinecap={"round"} strokeLinejoin={"round"} width={size} height={size} aria-hidden={title ? undefined : true} aria-label={title} {...props}>
      <path d={"M10 12h4"}  />
  <path d={"M10 8h4"}  />
  <path d={"M14 21v-3a2 2 0 0 0-4 0v3"}  />
  <path d={"M6 10H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2"}  />
  <path d={"M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16"}  />
    </svg>
  );
}
