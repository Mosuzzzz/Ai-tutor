"use client";

import { Settings, X } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import { AppShellBrand } from "./AppShellBrand";
import { AppShellLogoutButton } from "./AppShellLogoutButton";
import { AppShellNavigationGroup } from "./AppShellNavigationGroup";
import type { AppShellUser } from "./types";

type MobileNavigationDialogProps = {
  onClose: () => void;
  pathname: string;
  user: AppShellUser;
};

const DRAWER_TRANSITION_MS = 220;
const focusableElementSelector = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])"
].join(", ");

const getFocusableElements = (container: HTMLElement | null) => {
  if (!container) return [];
  return Array.from(container.querySelectorAll<HTMLElement>(focusableElementSelector)).filter(
    (element) => element.tabIndex !== -1 && element.getAttribute("aria-hidden") !== "true"
  );
};

export const MobileNavigationDialog = ({ onClose, pathname, user }: MobileNavigationDialogProps) => {
  const [visible, setVisible] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initialPathnameRef = useRef(pathname);
  const displayName = user.displayName?.trim() || user.email;

  const requestClose = useCallback(() => {
    setVisible(false);
    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    if (reduceMotion) {
      onClose();
      return;
    }
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    closeTimerRef.current = setTimeout(onClose, DRAWER_TRANSITION_MS);
  }, [onClose]);

  useEffect(() => {
    const previouslyFocusedElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    const desktopMediaQuery = window.matchMedia?.("(min-width: 1024px)");
    document.body.style.overflow = "hidden";
    const animationFrame = requestAnimationFrame(() => setVisible(true));
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        requestClose();
        return;
      }
      if (event.key !== "Tab") return;

      const focusableElements = getFocusableElements(dialogRef.current);
      const [firstElement] = focusableElements;
      const lastElement = focusableElements.at(-1);
      if (!firstElement || !lastElement) {
        event.preventDefault();
        closeButtonRef.current?.focus();
        return;
      }
      if (!dialogRef.current?.contains(document.activeElement)) {
        event.preventDefault();
        firstElement.focus();
        return;
      }
      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    const handleDesktopViewport = (event: MediaQueryListEvent) => {
      if (event.matches) onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    desktopMediaQuery?.addEventListener?.("change", handleDesktopViewport);
    if (desktopMediaQuery?.matches) onClose();
    return () => {
      cancelAnimationFrame(animationFrame);
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
      document.removeEventListener("keydown", handleKeyDown);
      desktopMediaQuery?.removeEventListener?.("change", handleDesktopViewport);
      document.body.style.overflow = previousOverflow;
      previouslyFocusedElement?.focus();
    };
  }, [onClose, requestClose]);

  useEffect(() => {
    if (pathname !== initialPathnameRef.current) requestClose();
  }, [pathname, requestClose]);

  return (
    <div className="fixed inset-0 z-40 lg:hidden">
      <button
        aria-hidden="true"
        className={`absolute inset-0 bg-inverse-surface/40 transition-opacity duration-[220ms] motion-reduce:transition-none ${visible ? "opacity-100" : "opacity-0"}`}
        onClick={requestClose}
        tabIndex={-1}
        type="button"
      />
      <div
        aria-label="เมนูหลัก"
        aria-modal="true"
        className={`relative flex h-full w-[min(88vw,360px)] flex-col border-r border-primary/10 bg-surface-container-lowest px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))] shadow-elevated transition-transform duration-[220ms] ease-out motion-reduce:transition-none ${visible ? "translate-x-0" : "-translate-x-full"}`}
        id="mobile-navigation"
        ref={dialogRef}
        role="dialog"
      >
        <div className="flex min-h-14 items-center justify-between gap-4 px-2">
          <AppShellBrand />
          <button
            aria-label="ปิดเมนู"
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl text-on-surface-variant transition-colors hover:bg-primary-fixed/40 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            onClick={requestClose}
            ref={closeButtonRef}
            type="button"
          >
            <X aria-hidden="true" className="h-5 w-5" />
          </button>
        </div>

        <AppShellNavigationGroup
          ariaLabel="เมนูหลักบนมือถือ"
          className="mt-8 flex flex-1 flex-col gap-1.5 overflow-y-auto pr-1"
          onNavigate={requestClose}
          role={user.role}
          variant="primary"
        />

        <div className="space-y-3 border-t border-primary/10 pt-4">
          <div className="flex min-w-0 items-center gap-3 px-2 py-1">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-label-md font-bold text-on-primary">
              {displayName.charAt(0).toLocaleUpperCase("th-TH")}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-label-md font-bold text-on-surface">{displayName}</span>
              <span className="block truncate text-label-sm text-on-surface-variant">{user.email}</span>
            </span>
          </div>
          <Link
            className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-body-md text-on-surface-variant transition-colors hover:bg-primary-fixed/35 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            href="/settings"
            onClick={requestClose}
          >
            <Settings aria-hidden="true" className="h-5 w-5" />
            การตั้งค่า
          </Link>
          <AppShellLogoutButton />
        </div>
      </div>
    </div>
  );
};
