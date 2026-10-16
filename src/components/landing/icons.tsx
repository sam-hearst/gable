// Lucide icons (2px stroke) used on the landing pages, inlined so there's no icon dependency.

type IconProps = { size?: number; strokeWidth?: number };

function Svg({ size = 20, strokeWidth = 2, children }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export function ShieldCheck(props: IconProps) {
  return (
    <Svg size={16} {...props}>
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
      <path d="m9 12 2 2 4-4" />
    </Svg>
  );
}

export function ArrowUp(props: IconProps) {
  return (
    <Svg strokeWidth={2.4} {...props}>
      <path d="m5 12 7-7 7 7" />
      <path d="M12 19V5" />
    </Svg>
  );
}

export function CircleCheck(props: IconProps) {
  return (
    <Svg strokeWidth={2.4} {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </Svg>
  );
}

export function Check(props: IconProps) {
  return (
    <Svg strokeWidth={2.4} {...props}>
      <path d="M20 6 9 17l-5-5" />
    </Svg>
  );
}
