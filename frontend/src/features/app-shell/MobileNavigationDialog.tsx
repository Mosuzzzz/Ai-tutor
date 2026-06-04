import { X } from "lucide-react";

import { Button } from "../../components/ui/Button";
import { AppShellBrand } from "./AppShellBrand";
import { AppShellLogoutButton } from "./AppShellLogoutButton";
import { AppShellNavigationGroup } from "./AppShellNavigationGroup";
import { aiAction, getPrimaryNavigationForRole, getSecondaryNavigationForRole } from "./navigationData";
import type { AuthSession } from "../auth/types";

type MobileNavigationDialogProps = {
  onClose: () => void;
  pathname: string;
  session: AuthSession;
};

export const MobileNavigationDialog = ({ onClose, pathname, session }: MobileNavigationDialogProps) => {
  const AiActionIcon = aiAction.icon;
  const primaryNavigation = getPrimaryNavigationForRole(session.user.role);
  const secondaryNavigation = getSecondaryNavigationForRole(session.user.role);

  return (
    <div className="fixed inset-0 z-40 lg:hidden">
      <button
        aria-label="ปิดเมนู"
        className="absolute inset-0 bg-inverse-surface/45"
        onClick={onClose}
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
          <AppShellBrand />
          <button
            aria-label="ปิดเมนู"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container-low hover:text-primary"
            onClick={onClose}
            type="button"
          >
            <X aria-hidden="true" className="h-5 w-5" />
          </button>
        </div>

        <Button className="mt-8 w-full" type="button">
          <AiActionIcon aria-hidden="true" className="h-5 w-5" />
          {aiAction.label}
        </Button>

        <AppShellNavigationGroup
          ariaLabel="เมนูหลักบนมือถือ"
          className="mt-8 flex flex-1 flex-col gap-1"
          items={primaryNavigation}
          onNavigate={onClose}
          pathname={pathname}
        />

        <div className="border-t border-outline-variant/30 pt-4">
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
