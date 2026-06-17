import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "../../lib/cn";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  isLoading?: boolean;
  loadingLabel?: string;
  variant?: ButtonVariant;
};

const buttonVariantClassNames: Record<ButtonVariant, string> = {
  primary: "bg-primary text-on-primary hover:bg-primary-hover",
  secondary:
    "border border-outline-variant bg-surface-container-lowest text-on-surface hover:bg-surface-container-low",
  ghost: "text-on-surface-variant hover:bg-surface-container hover:text-on-surface",
  danger: "bg-error text-on-error hover:bg-on-error-container"
};

export const Button = ({
  children,
  className,
  disabled,
  isLoading = false,
  loadingLabel = "กำลังดำเนินการ",
  type = "button",
  variant = "primary",
  ...props
}: ButtonProps) => {
  const isDisabled = disabled || isLoading;

  return (
    <button
      {...props}
      aria-busy={isLoading ? "true" : undefined}
      className={cn(
        "inline-flex min-h-10 items-center justify-center gap-2 rounded-md px-3.5 py-2 text-label-md font-semibold transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary-fixed-dim focus:ring-offset-2 focus:ring-offset-background disabled:cursor-not-allowed disabled:opacity-60",
        isLoading && "cursor-wait",
        buttonVariantClassNames[variant],
        className
      )}
      disabled={isDisabled}
      type={type}
    >
      {isLoading ? (
        <>
          <span
            aria-hidden="true"
            className="h-3.5 w-3.5 rounded-full border-2 border-current border-t-transparent"
          />
          {loadingLabel}
        </>
      ) : (
        children
      )}
    </button>
  );
};
