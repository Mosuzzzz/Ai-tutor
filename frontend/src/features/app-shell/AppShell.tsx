"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";

import { AppShellTopBar } from "./AppShellTopBar";
import { DesktopSidebar } from "./DesktopSidebar";
import { MobileNavigationDialog } from "./MobileNavigationDialog";
import type { AppShellProps } from "./types";

export const AppShell = ({ children, session }: AppShellProps) => {
  const pathname = usePathname() ?? "/";
  const [mobileNavigationOpen, setMobileNavigationOpen] = useState(false);

  const closeMobileNavigation = () => {
    setMobileNavigationOpen(false);
  };

  return (
    <div className="min-h-screen bg-background text-on-background lg:flex">
      <DesktopSidebar pathname={pathname} session={session} />

      {mobileNavigationOpen && (
        <MobileNavigationDialog onClose={closeMobileNavigation} pathname={pathname} session={session} />
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <AppShellTopBar
          mobileNavigationOpen={mobileNavigationOpen}
          onOpenMobileNavigation={() => setMobileNavigationOpen(true)}
          session={session}
        />

        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
          <div className="mx-auto w-full max-w-app">{children}</div>
        </main>
      </div>
    </div>
  );
};
