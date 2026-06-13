import { X } from "lucide-react";
import { useEffect, useRef } from "react";

import { AppShellBrand } from "./AppShellBrand";
import { AppShellLogoutButton } from "./AppShellLogoutButton";
import { AppShellNavigationGroup } from "./AppShellNavigationGroup";
import { AppShellPrimaryActionLink } from "./AppShellPrimaryActionLink";
import { aiAction, getPrimaryNavigationForRole, getSecondaryNavigationForRole } from "./navigationData";
import type { AuthSession } from "../auth/types";

type MobileNavigationDialogProps = {
  onClose: () => void;
  pathname: string;
  session: AuthSession;
};

const focusableElementSelector = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])"
].join(", ");

const getFocusableElements = (container: HTMLElement | null) => {
  if (!container) {
    return [];
  }

  return Array.from(container.querySelectorAll<HTMLElement>(focusableElementSelector)).filter(
    (element) => element.tabIndex !== -1 && element.getAttribute("aria-hidden") !== "true"
  );
};

export const MobileNavigationDialog = ({ onClose, pathname, session }: MobileNavigationDialogProps) => {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const primaryNavigation = getPrimaryNavigationForRole(session.user.role);
  const secondaryNavigation = getSecondaryNavigationForRole(session.user.role);

  useEffect(() => {
    const previouslyFocusedElement =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;

    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

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
        return;
      }

      if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocusedElement?.focus();
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-40 lg:hidden">
      <button
        aria-hidden="true"
        className="absolute inset-0 bg-inverse-surface/45"
        onClick={onClose}
        tabIndex={-1}
        type="button"
      />
      <div
        aria-label="เมนูหลัก"
        aria-modal="true"
        className="relative flex h-full w-[min(88vw,360px)] flex-col bg-surface-container-low px-4 py-4 shadow-elevated"
        id="mobile-navigation"
        ref={dialogRef}
        role="dialog"
      >
        <div className="flex items-center justify-between gap-4 rounded border border-outline-variant/60 bg-surface-container-lowest p-4">
          <AppShellBrand />
          <button
            aria-label="ปิดเมนู"
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded text-on-surface-variant transition-colors duration-200 hover:bg-surface-container-low hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary-fixed-dim focus:ring-offset-2"
            onClick={onClose}
            ref={closeButtonRef}
            type="button"
          >
            <X aria-hidden="true" className="h-5 w-5" />
          </button>
        </div>

        <AppShellPrimaryActionLink action={aiAction} className="mt-5 w-full" onNavigate={onClose} />

        <AppShellNavigationGroup
          ariaLabel="เมนูหลักบนมือถือ"
          className="mt-5 flex flex-1 flex-col gap-1 overflow-y-auto pr-1"
          items={primaryNavigation}
          onNavigate={onClose}
          pathname={pathname}
        />

        <div className="space-y-3 border-t border-outline-variant/40 pt-4">
          <AppShellNavigationGroup
            ariaLabel="เมนูรองบนมือถือ"
            className="flex flex-col gap-1"
            items={secondaryNavigation}
            onNavigate={onClose}
            pathname={pathname}
          />
          <AppShellLogoutButton />
        </div>
      </div>
    </div>
  );
};
