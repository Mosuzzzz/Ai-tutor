import { Bell, HelpCircle, Menu, Search } from "lucide-react";

import { AppShellBrand } from "./AppShellBrand";
import { AppShellIconButton } from "./AppShellIconButton";

type AppShellTopBarProps = {
  mobileNavigationOpen: boolean;
  onOpenMobileNavigation: () => void;
};

export const AppShellTopBar = ({
  mobileNavigationOpen,
  onOpenMobileNavigation
}: AppShellTopBarProps) => {
  return (
    <header className="sticky top-0 z-20 flex h-topbar items-center gap-3 border-b border-outline-variant/40 bg-surface-container-lowest/95 px-4 backdrop-blur md:px-8">
      <button
        aria-controls="mobile-navigation"
        aria-expanded={mobileNavigationOpen}
        aria-label="เปิดเมนู"
        className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container-low hover:text-primary lg:hidden"
        onClick={onOpenMobileNavigation}
        type="button"
      >
        <Menu aria-hidden="true" className="h-6 w-6" />
      </button>

      <div className="lg:hidden">
        <AppShellBrand compact />
      </div>

      <div className="relative ml-auto hidden w-full max-w-sm md:block">
        <Search
          aria-hidden="true"
          className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-on-surface-variant"
        />
        <input
          className="h-11 w-full rounded-lg border border-outline-variant/50 bg-surface-container-low py-2 pl-10 pr-4 text-body-md text-on-surface placeholder:text-on-surface-variant focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-fixed-dim"
          placeholder="ค้นหาคอร์ส, บทเรียน..."
          type="search"
        />
      </div>

      <div className="ml-auto flex items-center gap-2 md:ml-0">
        <AppShellIconButton label="การแจ้งเตือน">
          <Bell aria-hidden="true" className="h-5 w-5" />
        </AppShellIconButton>
        <AppShellIconButton label="ช่วยเหลือ">
          <HelpCircle aria-hidden="true" className="h-5 w-5" />
        </AppShellIconButton>
        <div className="ml-1 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-label-md font-bold text-on-primary">
          S
        </div>
      </div>
    </header>
  );
};
