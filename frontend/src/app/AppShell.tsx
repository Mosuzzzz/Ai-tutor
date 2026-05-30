"use client";

import { Bell, HelpCircle, LogOut, Menu, Search, Sparkles, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { ReactNode } from "react";

import { Button } from "../components/ui/Button";
import { aiAction, primaryNavigation, secondaryNavigation } from "./navigation";
import type { NavigationItem } from "./navigation";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname() ?? "/";
  const [mobileNavigationOpen, setMobileNavigationOpen] = useState(false);

  const closeMobileNavigation = () => {
    setMobileNavigationOpen(false);
  };

  return (
    <div className="min-h-screen bg-background text-on-background lg:flex">
      <aside className="hidden w-sidebar shrink-0 border-r border-outline-variant/40 bg-surface-container-lowest px-6 py-5 lg:flex lg:min-h-screen lg:flex-col">
        <Brand />

        <Button className="mt-8 w-full" type="button">
          <aiAction.icon aria-hidden="true" className="h-5 w-5" />
          {aiAction.label}
        </Button>

        <nav aria-label="เมนูหลัก" className="mt-8 flex flex-1 flex-col gap-1">
          {primaryNavigation.map((item) => (
            <NavigationLink active={isActiveHref(pathname, item.href)} key={item.href} item={item} />
          ))}
        </nav>

        <nav aria-label="เมนูรอง" className="border-t border-outline-variant/30 pt-4">
          {secondaryNavigation.map((item) => (
            <NavigationLink active={isActiveHref(pathname, item.href)} key={item.href} item={item} />
          ))}
          <button className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-body-md text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-primary">
            <LogOut aria-hidden="true" className="h-5 w-5" />
            ออกจากระบบ
          </button>
        </nav>
      </aside>

      {mobileNavigationOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            aria-label="ปิดเมนู"
            className="absolute inset-0 bg-inverse-surface/45"
            onClick={closeMobileNavigation}
            type="button"
          />
          <div
            aria-label="เมนูหลัก"
            aria-modal="true"
            className="relative flex h-full w-[min(86vw,340px)] flex-col bg-surface-container-lowest px-5 py-5 shadow-ambient"
            id="mobile-navigation"
            role="dialog"
          >
            <div className="flex items-center justify-between gap-4">
              <Brand />
              <button
                aria-label="ปิดเมนู"
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container-low hover:text-primary"
                onClick={closeMobileNavigation}
                type="button"
              >
                <X aria-hidden="true" className="h-5 w-5" />
              </button>
            </div>

            <Button className="mt-8 w-full" type="button">
              <aiAction.icon aria-hidden="true" className="h-5 w-5" />
              {aiAction.label}
            </Button>

            <nav aria-label="เมนูหลักบนมือถือ" className="mt-8 flex flex-1 flex-col gap-1">
              {primaryNavigation.map((item) => (
                <NavigationLink
                  active={isActiveHref(pathname, item.href)}
                  key={item.href}
                  item={item}
                  onNavigate={closeMobileNavigation}
                />
              ))}
            </nav>

            <nav aria-label="เมนูรองบนมือถือ" className="border-t border-outline-variant/30 pt-4">
              {secondaryNavigation.map((item) => (
                <NavigationLink
                  active={isActiveHref(pathname, item.href)}
                  key={item.href}
                  item={item}
                  onNavigate={closeMobileNavigation}
                />
              ))}
              <button className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-body-md text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-primary">
                <LogOut aria-hidden="true" className="h-5 w-5" />
                ออกจากระบบ
              </button>
            </nav>
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-topbar items-center gap-3 border-b border-outline-variant/40 bg-surface-container-lowest/95 px-4 backdrop-blur md:px-8">
          <button
            aria-controls="mobile-navigation"
            aria-expanded={mobileNavigationOpen}
            aria-label="เปิดเมนู"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container-low hover:text-primary lg:hidden"
            onClick={() => setMobileNavigationOpen(true)}
            type="button"
          >
            <Menu aria-hidden="true" className="h-6 w-6" />
          </button>

          <div className="lg:hidden">
            <Brand compact />
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
            <IconButton label="การแจ้งเตือน">
              <Bell aria-hidden="true" className="h-5 w-5" />
            </IconButton>
            <IconButton label="ช่วยเหลือ">
              <HelpCircle aria-hidden="true" className="h-5 w-5" />
            </IconButton>
            <div className="ml-1 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-label-md font-bold text-on-primary">
              S
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
          <div className="mx-auto w-full max-w-app">{children}</div>
        </main>
      </div>
    </div>
  );
}

function isActiveHref(pathname: string, href: string) {
  if (href === "/") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-on-primary">
        <Sparkles aria-hidden="true" className="h-6 w-6" />
      </div>
      {!compact && (
        <div>
          <h1 className="text-headline-md font-bold text-primary">AI Tutor</h1>
          <p className="text-label-sm text-on-surface-variant">Learning Platform</p>
        </div>
      )}
      {compact && <h1 className="text-headline-md font-bold text-primary">AI Tutor</h1>}
    </div>
  );
}

function NavigationLink({
  active,
  item,
  onNavigate
}: {
  active: boolean;
  item: NavigationItem;
  onNavigate?: () => void;
}) {
  const Icon = item.icon;

  return (
    <Link
      aria-current={active ? "page" : undefined}
      className={[
        "flex items-center gap-3 rounded-lg px-3 py-3 text-body-md transition-colors",
        active
          ? "bg-primary-fixed text-primary"
          : "text-on-surface-variant hover:bg-surface-container-low hover:text-primary"
      ].join(" ")}
      href={item.href}
      onClick={onNavigate}
    >
      <Icon aria-hidden="true" className="h-5 w-5" />
      <span>{item.label}</span>
    </Link>
  );
}

function IconButton({ children, label }: { children: ReactNode; label: string }) {
  return (
    <button
      aria-label={label}
      className="inline-flex h-10 w-10 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-primary"
      type="button"
    >
      {children}
    </button>
  );
}
