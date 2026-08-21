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
        "group relative flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-body-md transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        active
          ? "bg-primary-fixed/70 font-semibold text-primary"
          : "text-on-surface-variant hover:bg-primary-fixed/35 hover:text-primary"
      )}
      href={item.href}
      onClick={onNavigate}
    >
      <span
        aria-hidden="true"
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-current transition-colors duration-200",
          active ? "bg-surface-container-lowest/90" : "group-hover:bg-surface-container-lowest/80"
        )}
      >
        <Icon aria-hidden="true" className="h-5 w-5" />
      </span>
      <span className="min-w-0 truncate">{item.label}</span>
    </Link>
  );
};
