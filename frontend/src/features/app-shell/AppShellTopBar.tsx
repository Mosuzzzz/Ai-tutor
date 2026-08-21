"use client";

import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import { useCallback, useState } from "react";

import { AppShellBrand } from "./AppShellBrand";
import { getAppRouteLabel } from "./appShellHelpers";
import { MobileNavigationDialog } from "./MobileNavigationDialog";
import type { AppShellUser } from "./types";

type AppShellTopBarProps = {
  user: AppShellUser;
};

export const AppShellTopBar = ({ user }: AppShellTopBarProps) => {
  const pathname = usePathname() ?? "/dashboard";
  const [mobileNavigationOpen, setMobileNavigationOpen] = useState(false);
  const closeMobileNavigation = useCallback(() => setMobileNavigationOpen(false), []);

  return (
    <>
      <header
        aria-label="แถบบนของแอป"
        className="sticky top-0 z-20 flex h-16 min-w-0 items-center gap-3 border-b border-primary/10 bg-surface-container-lowest/95 px-4 backdrop-blur-sm md:h-topbar md:px-8 lg:px-10"
      >
        <button
          aria-controls="mobile-navigation"
          aria-expanded={mobileNavigationOpen}
          aria-label="เปิดเมนู"
          className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl text-on-surface-variant transition-colors duration-200 hover:bg-primary-fixed/40 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 lg:hidden"
          onClick={() => setMobileNavigationOpen(true)}
          type="button"
        >
          <Menu aria-hidden="true" className="h-6 w-6" />
        </button>

        <div className="shrink-0 lg:hidden">
          <AppShellBrand compact />
        </div>

        <div className="ml-auto min-w-0 text-right lg:ml-0 lg:text-left">
          <p className="truncate text-label-sm font-semibold text-on-surface-variant sm:text-label-md">
            {getAppRouteLabel(pathname)}
          </p>
        </div>
      </header>

      {mobileNavigationOpen && (
        <MobileNavigationDialog
          onClose={closeMobileNavigation}
          pathname={pathname}
          user={user}
        />
      )}
    </>
  );
};
