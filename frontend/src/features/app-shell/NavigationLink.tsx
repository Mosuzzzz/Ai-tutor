import Link from "next/link";

import { cn } from "../../lib/cn";
import type { NavigationItem } from "./types";

type NavigationLinkProps = {
  active: boolean;
  item: NavigationItem;
  onNavigate?: () => void;
};

export const NavigationLink = ({ active, item, onNavigate }: NavigationLinkProps) => {
  const Icon = item.icon;

  return (
    <Link
      aria-current={active ? "page" : undefined}
      className={cn(
        "group flex min-h-9 items-center gap-2.5 rounded-md px-2.5 py-2 text-label-md font-medium transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary-fixed-dim focus:ring-offset-2 focus:ring-offset-surface-container-low",
        active
          ? "bg-surface-container text-on-surface"
          : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
      )}
      href={item.href}
      onClick={onNavigate}
    >
      <Icon
        aria-hidden="true"
        className={cn("h-[18px] w-[18px] shrink-0", active ? "text-primary" : "text-on-surface-variant group-hover:text-on-surface")}
      />
      <span className="min-w-0 truncate">{item.label}</span>
    </Link>
  );
};
