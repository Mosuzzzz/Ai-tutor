import { Bell, HelpCircle, Menu, Search } from "lucide-react";

import { AppShellBrand } from "./AppShellBrand";
import { AppShellIconButton } from "./AppShellIconButton";
import { AppShellUserSummary } from "./AppShellUserSummary";
import type { AuthSession } from "../auth/types";

type AppShellTopBarProps = {
  mobileNavigationOpen: boolean;
  onOpenMobileNavigation: () => void;
  session: AuthSession;
};

export const AppShellTopBar = ({
  mobileNavigationOpen,
  onOpenMobileNavigation,
  session
}: AppShellTopBarProps) => {
  return (
    <header
      aria-label="แถบบนของแอป"
      className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-outline-variant/50 bg-surface-container-lowest/95 px-4 backdrop-blur md:h-topbar md:px-8"
    >
      <button
        aria-controls="mobile-navigation"
        aria-expanded={mobileNavigationOpen}
        aria-label="เปิดเมนู"
        className="inline-flex min-h-11 min-w-11 items-center justify-center rounded text-on-surface-variant transition-colors duration-200 hover:bg-surface-container-low hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary-fixed-dim focus:ring-offset-2 lg:hidden"
        onClick={onOpenMobileNavigation}
        type="button"
      >
        <Menu aria-hidden="true" className="h-6 w-6" />
      </button>

      <div className="lg:hidden">
        <AppShellBrand compact />
      </div>

      <form aria-label="ค้นหาในแอป" className="relative ml-auto hidden w-full max-w-md md:block" role="search">
        <label className="sr-only" htmlFor="app-shell-search">
          ค้นหาคอร์สและบทเรียน
        </label>
        <Search
          aria-hidden="true"
          className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-on-surface-variant"
        />
        <input
          className="h-11 w-full rounded border border-outline-variant/60 bg-surface-container-low py-2 pl-10 pr-4 text-body-md text-on-surface shadow-control placeholder:text-on-surface-variant focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-fixed-dim"
          id="app-shell-search"
          placeholder="ค้นหาคอร์ส, บทเรียน..."
          type="search"
        />
      </form>

      <div className="ml-auto flex items-center gap-2 md:ml-0">
        <AppShellIconButton label="การแจ้งเตือน">
          <Bell aria-hidden="true" className="h-5 w-5" />
        </AppShellIconButton>
        <AppShellIconButton label="ช่วยเหลือ">
          <HelpCircle aria-hidden="true" className="h-5 w-5" />
        </AppShellIconButton>
        <AppShellUserSummary
          avatarClassName="h-10 w-10"
          className="ml-1 min-w-11 rounded-full border border-outline-variant/60 bg-surface-container-low px-1.5 py-1.5 sm:min-w-[180px] sm:pl-3 sm:pr-1.5"
          detailsClassName="hidden min-w-0 flex-1 sm:block"
          session={session}
        />
      </div>
    </header>
  );
};
