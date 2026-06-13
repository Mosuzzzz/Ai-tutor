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
    <div className="min-h-screen bg-background text-on-background lg:grid lg:grid-cols-[280px_minmax(0,1fr)]">
      <a
        className="sr-only z-50 rounded bg-primary px-4 py-3 text-label-md font-bold text-on-primary focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:outline-none focus:ring-2 focus:ring-primary-fixed-dim focus:ring-offset-2"
        href="#main-content"
      >
        ข้ามไปยังเนื้อหาหลัก
      </a>
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

        <main
          aria-label="พื้นที่เนื้อหาหลัก"
          className="flex-1 px-4 py-5 outline-none sm:px-6 md:px-8 md:py-8"
          id="main-content"
          tabIndex={-1}
        >
          <div className="mx-auto w-full max-w-app">{children}</div>
        </main>
      </div>
    </div>
  );
};
