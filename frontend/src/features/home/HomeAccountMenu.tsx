"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { logout } from "../auth/authApiClient";
import type { AuthSession } from "../auth/types";
import { HOME_CONTENT } from "./homeContent";
import type { HomeLanguage } from "./types";

type HomeAccountMenuProps = {
  language: HomeLanguage;
  session: AuthSession;
};

export const HomeAccountMenu = ({ language, session }: HomeAccountMenuProps) => {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [hasError, setHasError] = useState(false);
  const content = HOME_CONTENT[language].navbar;
  const greeting = content.accountGreeting.replace("{email}", session.user.email);
  const menuId = `home-account-menu-${language}`;

  const closeMenu = (restoreFocus = false) => {
    setIsOpen(false);
    setHasError(false);
    if (restoreFocus) triggerRef.current?.focus();
  };

  useEffect(() => {
    if (!isOpen) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) closeMenu();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMenu(true);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  const handleLogout = async () => {
    if (isPending) return;
    setIsPending(true);
    setHasError(false);
    const result = await logout();
    if (result.ok) {
      setIsOpen(false);
      router.replace("/home");
      router.refresh();
      return;
    }
    setIsPending(false);
    setHasError(true);
  };

  return (
    <div className="home-account-menu" ref={containerRef}>
      <button
        aria-controls={menuId}
        aria-expanded={isOpen}
        aria-label={greeting}
        className="home-account-trigger"
        onClick={() => { setIsOpen((open) => !open); setHasError(false); }}
        ref={triggerRef}
        title={greeting}
        type="button"
      >
        <span aria-hidden="true">{greeting}</span>
      </button>
      {isOpen ? (
        <div aria-label={greeting} className="home-account-dropdown" id={menuId} role="menu">
          <button disabled={isPending} onClick={handleLogout} role="menuitem" type="button">
            {content.logoutLabel}
          </button>
          {hasError ? <p role="status">{content.logoutError}</p> : null}
        </div>
      ) : null}
    </div>
  );
};
