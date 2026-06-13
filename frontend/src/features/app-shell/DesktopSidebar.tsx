import { AppShellBrand } from "./AppShellBrand";
import { AppShellLogoutButton } from "./AppShellLogoutButton";
import { AppShellNavigationGroup } from "./AppShellNavigationGroup";
import { AppShellPrimaryActionLink } from "./AppShellPrimaryActionLink";
import { aiAction, getPrimaryNavigationForRole, getSecondaryNavigationForRole } from "./navigationData";
import type { AuthSession } from "../auth/types";

type DesktopSidebarProps = {
  pathname: string;
  session: AuthSession;
};

export const DesktopSidebar = ({ pathname, session }: DesktopSidebarProps) => {
  const primaryNavigation = getPrimaryNavigationForRole(session.user.role);
  const secondaryNavigation = getSecondaryNavigationForRole(session.user.role);

  return (
    <aside
      aria-label="แถบนำทางหลัก"
      className="hidden w-sidebar shrink-0 border-r border-outline-variant/50 bg-surface-container-low px-4 py-4 lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col"
    >
      <div className="rounded border border-outline-variant/60 bg-surface-container-lowest p-4">
        <AppShellBrand />
      </div>

      <AppShellPrimaryActionLink action={aiAction} className="mt-5 w-full" />

      <AppShellNavigationGroup
        ariaLabel="เมนูหลัก"
        className="mt-5 flex flex-1 flex-col gap-1 overflow-y-auto pr-1"
        items={primaryNavigation}
        pathname={pathname}
      />

      <div className="space-y-3 border-t border-outline-variant/40 pt-4">
        <AppShellNavigationGroup
          ariaLabel="เมนูรอง"
          className="flex flex-col gap-1"
          items={secondaryNavigation}
          pathname={pathname}
        />
        <AppShellLogoutButton />
      </div>
    </aside>
  );
};
