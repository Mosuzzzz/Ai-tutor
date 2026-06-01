import { Button } from "../../components/ui/Button";
import { AppShellBrand } from "./AppShellBrand";
import { AppShellLogoutButton } from "./AppShellLogoutButton";
import { AppShellNavigationGroup } from "./AppShellNavigationGroup";
import { aiAction, primaryNavigation, secondaryNavigation } from "./navigationData";

type DesktopSidebarProps = {
  pathname: string;
};

export const DesktopSidebar = ({ pathname }: DesktopSidebarProps) => {
  const AiActionIcon = aiAction.icon;

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
