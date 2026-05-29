import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "../../lib/cn";

type ButtonVariant = "primary" | "secondary" | "ghost";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: ButtonVariant;
};

const variantClassName: Record<ButtonVariant, string> = {
  primary: "bg-primary text-on-primary shadow-sm hover:bg-on-primary-fixed-variant",
  secondary:
    "border border-primary-container/20 bg-surface-container-low text-primary hover:bg-surface-container",
  ghost: "text-on-surface-variant hover:bg-surface-container-low hover:text-primary"
};

export function Button({
  children,
  className,
  type = "button",
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex min-h-12 items-center justify-center gap-2 rounded-lg px-4 py-2 text-label-md font-bold transition-all duration-200 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-primary-fixed-dim focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60",
        variantClassName[variant],
        className
      )}
      type={type}
      {...props}
    >
      {children}
    </button>
  );
}
