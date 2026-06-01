import { isActiveHref } from "./appShellHelpers";
import { NavigationLink } from "./NavigationLink";
import type { NavigationItem } from "./types";

type AppShellNavigationGroupProps = {
  ariaLabel: string;
  className: string;
  items: NavigationItem[];
  onNavigate?: () => void;
  pathname: string;
};

export const AppShellNavigationGroup = ({
  ariaLabel,
  className,
  items,
  onNavigate,
  pathname
}: AppShellNavigationGroupProps) => {
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
