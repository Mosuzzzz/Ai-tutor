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
      className="hidden w-sidebar shrink-0 border-r border-outline-variant bg-surface-container-low px-3 py-4 lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col"
    >
      <div className="px-1.5">
        <AppShellBrand />
      </div>

      <AppShellPrimaryActionLink action={aiAction} className="mt-5 w-full" />

      <AppShellNavigationGroup
        ariaLabel="เมนูหลัก"
        className="mt-5 flex flex-1 flex-col gap-0.5 overflow-y-auto pr-0.5"
        items={primaryNavigation}
        pathname={pathname}
      />

      <div className="space-y-1 border-t border-outline-variant pt-3">
        <AppShellNavigationGroup
          ariaLabel="เมนูรอง"
          className="flex flex-col gap-0.5"
          items={secondaryNavigation}
          pathname={pathname}
        />
        <AppShellLogoutButton />
      </div>
    </aside>
  );
};
