"use client";

import { ChevronDown, Settings } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { AppShellLogoutButton } from "./AppShellLogoutButton";
import type { AppShellUser } from "./types";

type AppShellAccountMenuProps = {
  user: AppShellUser;
};

export const AppShellAccountMenu = ({ user }: AppShellAccountMenuProps) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const displayName = user.displayName?.trim() || user.email;
  const initial = displayName.charAt(0).toLocaleUpperCase("th-TH");

  useEffect(() => {
    if (!open) {
      return;
    }

    const closeOnOutsidePointer = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener("pointerdown", closeOnOutsidePointer);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsidePointer);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  return (
    <div className="relative" ref={containerRef}>
      {open && (
        <div
          aria-label="เมนูบัญชี"
          className="absolute bottom-[calc(100%+0.5rem)] left-0 z-30 w-full min-w-0 rounded-2xl border border-primary/10 bg-surface-container-lowest p-2 shadow-elevated"
          role="menu"
        >
          <div className="min-w-0 border-b border-primary/10 px-3 py-2.5">
            <p className="truncate text-label-md font-bold text-on-surface">{displayName}</p>
            <p className="truncate text-label-sm text-on-surface-variant">{user.email}</p>
          </div>
          <Link
            className="mt-1 flex min-h-11 items-center gap-3 rounded-xl px-3 text-body-md text-on-surface-variant transition-colors hover:bg-primary-fixed/35 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            href="/settings"
            onClick={() => setOpen(false)}
            role="menuitem"
          >
            <Settings aria-hidden="true" className="h-5 w-5" />
            การตั้งค่า
          </Link>
          <AppShellLogoutButton role="menuitem" />
        </div>
      )}

      <button
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={`เปิดเมนูบัญชี ${displayName}`}
        className="flex min-h-14 w-full min-w-0 items-center gap-3 rounded-2xl px-2.5 py-2 text-left transition-colors hover:bg-primary-fixed/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        onClick={() => setOpen((current) => !current)}
        ref={triggerRef}
        type="button"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-label-md font-bold text-on-primary">
          {initial}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-label-md font-bold text-on-surface">{displayName}</span>
          <span className="block truncate text-label-sm text-on-surface-variant">{user.email}</span>
        </span>
        <ChevronDown aria-hidden="true" className="h-4 w-4 shrink-0 text-on-surface-variant" />
      </button>
    </div>
  );
};
