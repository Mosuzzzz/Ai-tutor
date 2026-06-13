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
        "inline-flex min-h-11 items-center justify-between gap-2 rounded bg-primary px-4 py-2 text-label-md font-bold text-on-primary shadow-control transition-colors duration-200 hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary-fixed-dim focus:ring-offset-2",
        className
      )}
      href={action.href}
      onClick={onNavigate}
    >
      <span className="flex items-center gap-2">
        <Icon aria-hidden="true" className="h-5 w-5" />
        {action.label}
      </span>
      <span aria-hidden="true">→</span>
    </Link>
  );
};
