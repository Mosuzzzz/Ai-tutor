import { forwardRef } from "react";
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
  primary: "bg-primary text-on-primary shadow-control hover:bg-primary-hover",
  secondary:
    "border border-outline-variant/70 bg-surface-container-lowest text-primary shadow-control hover:bg-surface-container-low",
  ghost: "text-on-surface-variant hover:bg-surface-container-low hover:text-primary",
  danger:
    "border border-error-container bg-error-container text-on-error-container hover:border-error hover:bg-error hover:text-on-error"
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  children,
  className,
  disabled,
  isLoading = false,
  loadingLabel = "กำลังดำเนินการ",
  type = "button",
  variant = "primary",
  ...props
}, ref) => {
  const isDisabled = disabled || isLoading;

  return (
    <button
      {...props}
      aria-busy={isLoading ? "true" : undefined}
      className={cn(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-4 py-2 text-label-md font-bold transition-[background-color,border-color,color,box-shadow,transform] duration-control ease-standard motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-fixed-dim focus-visible:ring-offset-2 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-60 disabled:active:translate-y-0",
        isLoading && "cursor-wait",
        buttonVariantClassNames[variant],
        className
      )}
      disabled={isDisabled}
      ref={ref}
      type={type}
    >
      {isLoading ? (
        <>
          <span
            aria-hidden="true"
            className="h-3.5 w-3.5 rounded-full border-2 border-current border-t-transparent motion-safe:animate-spin"
          />
          {loadingLabel}
        </>
      ) : (
        children
      )}
    </button>
  );
});

Button.displayName = "Button";
