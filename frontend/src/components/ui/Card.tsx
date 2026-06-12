import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "../../lib/cn";

type CardPadding = "compact" | "default" | "none";
type CardVariant = "default" | "elevated" | "muted";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  padding?: CardPadding;
  variant?: CardVariant;
};

const cardPaddingClassNames: Record<CardPadding, string> = {
  compact: "p-4",
  default: "p-6",
  none: "p-0"
};

const cardVariantClassNames: Record<CardVariant, string> = {
  default: "border border-outline-variant/70 bg-surface-container-lowest",
  elevated: "bg-surface-container-lowest shadow-elevated",
  muted: "border border-outline-variant/70 bg-surface-container-low"
};

export const Card = ({
  children,
  className,
  padding = "default",
  variant = "default",
  ...props
}: CardProps) => {
  return (
    <div
      className={cn(
        "rounded",
        cardPaddingClassNames[padding],
        cardVariantClassNames[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
