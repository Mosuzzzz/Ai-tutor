import { Button } from "../../components/ui/Button";
import { AppShellBrand } from "./AppShellBrand";
import { AppShellLogoutButton } from "./AppShellLogoutButton";
import { AppShellNavigationGroup } from "./AppShellNavigationGroup";
import { aiAction, getPrimaryNavigationForRole, getSecondaryNavigationForRole } from "./navigationData";
import type { AuthSession } from "../auth/types";

type DesktopSidebarProps = {
  pathname: string;
  session: AuthSession;
};

export const DesktopSidebar = ({ pathname, session }: DesktopSidebarProps) => {
  const AiActionIcon = aiAction.icon;
  const primaryNavigation = getPrimaryNavigationForRole(session.user.role);
  const secondaryNavigation = getSecondaryNavigationForRole(session.user.role);

  return (
    <aside className="hidden w-sidebar shrink-0 border-r border-outline-variant/40 bg-surface-container-lowest px-6 py-5 lg:flex lg:min-h-screen lg:flex-col">
      <AppShellBrand />

      <Button className="mt-8 w-full" type="button">
        <AiActionIcon aria-hidden="true" className="h-5 w-5" />
        {aiAction.label}
      </Button>

      <AppShellNavigationGroup
        ariaLabel="เมนูหลัก"
        className="mt-8 flex flex-1 flex-col gap-1"
        items={primaryNavigation}
        pathname={pathname}
      />

      <div className="border-t border-outline-variant/30 pt-4">
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
