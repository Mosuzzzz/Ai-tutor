import Link from "next/link";

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
      className={[
        "flex items-center gap-3 rounded-lg px-3 py-3 text-body-md transition-colors",
        active
          ? "bg-primary-fixed text-primary"
          : "text-on-surface-variant hover:bg-surface-container-low hover:text-primary"
      ].join(" ")}
      href={item.href}
      onClick={onNavigate}
    >
      <Icon aria-hidden="true" className="h-5 w-5" />
      <span>{item.label}</span>
    </Link>
  );
};
