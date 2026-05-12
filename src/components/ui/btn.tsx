import type { ComponentPropsWithoutRef, ReactNode } from "react";

type Variant = "primary" | "ghost";

const base =
  "inline-flex items-center justify-center gap-2 rounded-lexi font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-60";

const variants: Record<Variant, string> = {
  primary: "bg-primary text-white px-[18px] py-3 hover:opacity-90 shadow-lexi-sm",
  ghost: "bg-card text-ink border border-line px-[14px] py-[10px] hover:bg-bg-2",
};

type CommonProps = {
  children: ReactNode;
  variant?: Variant;
  className?: string;
};

type AnchorProps = CommonProps & ComponentPropsWithoutRef<"a"> & { href: string };
type ButtonProps = CommonProps & ComponentPropsWithoutRef<"button"> & { href?: undefined };

export function Btn(props: AnchorProps | ButtonProps) {
  const { children, variant = "primary", className = "", ...rest } = props;
  const cls = `${base} ${variants[variant]} ${className}`.trim();
  if ("href" in props && props.href) {
    return (
      <a {...(rest as ComponentPropsWithoutRef<"a">)} className={cls}>
        {children}
      </a>
    );
  }
  return (
    <button {...(rest as ComponentPropsWithoutRef<"button">)} className={cls}>
      {children}
    </button>
  );
}
