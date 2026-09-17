import type { SVGProps } from 'react';

export type IconProps = SVGProps<SVGSVGElement> & { size?: number | string; title?: string };

export function VerificationDossier({ size = 24, title, ...props }: IconProps) {
  return (
    <svg viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"2"} strokeLinecap={"round"} strokeLinejoin={"round"} width={size} height={size} aria-hidden={title ? undefined : true} aria-label={title} {...props}>
      <rect width={"8"} height={"4"} x={"8"} y={"2"} rx={"1"} ry={"1"}  />
  <path d={"M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"}  />
  <path d={"m9 14 2 2 4-4"}  />
    </svg>
  );
}
