import { AppShellBrand } from "./AppShellBrand";
import { AppShellAccountMenu } from "./AppShellAccountMenu";
import { AppShellNavigationGroup } from "./AppShellNavigationGroup";
import type { AppShellUser } from "./types";

type DesktopSidebarProps = {
  user: AppShellUser;
};

export const DesktopSidebar = ({ user }: DesktopSidebarProps) => {
  return (
    <aside
      aria-label="แถบนำทางหลัก"
      className="hidden w-sidebar shrink-0 border-r border-primary/10 bg-surface-container-lowest px-5 pb-5 pt-7 lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col"
    >
      <div className="flex min-h-12 items-center px-2">
        <AppShellBrand />
      </div>

      <AppShellNavigationGroup
        ariaLabel="เมนูหลัก"
        className="mt-10 flex flex-1 flex-col gap-1.5 overflow-y-auto pr-1"
        role={user.role}
        variant="primary"
      />

      <div className="space-y-4 border-t border-primary/10 pt-4">
        <AppShellNavigationGroup
          ariaLabel="เมนูรอง"
          className="flex flex-col gap-1"
          role={user.role}
          variant="secondary"
        />
        <AppShellAccountMenu user={user} />
      </div>
    </aside>
  );
};
