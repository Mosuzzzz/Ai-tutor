"use client";

import { usePathname } from "next/navigation";

import { isActiveHref } from "./appShellHelpers";
import { NavigationLink } from "./NavigationLink";
import { getPrimaryNavigationForRole, getSecondaryNavigationForRole } from "./navigationData";
import type { AuthRouteRole } from "../auth/types";

type AppShellNavigationGroupProps = {
  ariaLabel: string;
  className: string;
  onNavigate?: () => void;
  role: AuthRouteRole;
  variant: "primary" | "secondary";
};

export const AppShellNavigationGroup = ({
  ariaLabel,
  className,
  onNavigate,
  role,
  variant
}: AppShellNavigationGroupProps) => {
  const pathname = usePathname() ?? "/";
  const items =
    variant === "primary" ? getPrimaryNavigationForRole(role) : getSecondaryNavigationForRole(role);

  return (
    <nav aria-label={ariaLabel} className={className}>
      {items.map((item) => (
        <NavigationLink
          active={isActiveHref(pathname, item.href)}
          item={item}
          key={item.href}
          onNavigate={onNavigate}
        />
      ))}
    </nav>
  );
};
