import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "../../lib/cn";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};

export const Card = ({ children, className, ...props }: CardProps) => {
  return (
    <div
      className={cn(
        "rounded-xl border border-outline-variant/40 bg-surface-container-lowest p-6 shadow-ambient",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
