import Link from "next/link";

import { cn } from "../../lib/cn";
import type { ShellAction } from "./types";

type AppShellPrimaryActionLinkProps = {
  action: ShellAction;
  className?: string;
  onNavigate?: () => void;
};

export const AppShellPrimaryActionLink = ({
  action,
  className,
  onNavigate
}: AppShellPrimaryActionLinkProps) => {
  const Icon = action.icon;

  return (
    <Link
      className={cn(
        "inline-flex min-h-9 items-center justify-between gap-2 rounded-md bg-primary px-3 py-2 text-label-md font-semibold text-on-primary transition-colors duration-150 hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary-fixed-dim focus:ring-offset-2 focus:ring-offset-surface-container-low",
        className
      )}
      href={action.href}
      onClick={onNavigate}
    >
      <span className="flex items-center gap-2">
        <Icon aria-hidden="true" className="h-[18px] w-[18px]" />
        {action.label}
      </span>
      <span aria-hidden="true" className="text-on-primary/70">→</span>
    </Link>
  );
};
