"use client";

import { useCallback, useEffect, useRef } from "react";
import type { RefObject } from "react";
import Link from "next/link";
import { X } from "lucide-react";

import type { AuthSession } from "../auth/types";
import { HomeAccountMenu } from "./HomeAccountMenu";
import { HOME_CONTENT, HOME_NAVIGATION } from "./homeContent";
import type { HomeLanguage } from "./types";

type HomeMobileMenuProps = {
  isOpen: boolean;
  language: HomeLanguage;
  onClose: () => void;
  session: AuthSession | null;
  triggerRef: RefObject<HTMLElement | null>;
};

export const HomeMobileMenu = ({ isOpen, language, onClose, session, triggerRef }: HomeMobileMenuProps) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const content = HOME_CONTENT[language];

  const close = useCallback(() => {
    onClose();
    triggerRef.current?.focus();
  }, [onClose, triggerRef]);

  useEffect(() => {
    if (!isOpen) return;
    closeButtonRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>("a[href], button:not([disabled])");
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [close, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="home-mobile-menu-layer">
      <button aria-label="Close navigation menu" className="home-mobile-menu-backdrop" data-testid="home-mobile-backdrop" onClick={close} type="button" />
      <div aria-label={content.navbar.menuLabel} aria-modal="true" className="home-mobile-menu" ref={dialogRef} role="dialog">
        <button aria-label="Close navigation menu" className="home-mobile-menu-close" onClick={close} ref={closeButtonRef} type="button">
          <X aria-hidden="true" size={20} />
        </button>
        <nav aria-label="Primary navigation">
          {HOME_NAVIGATION.map(({ href, icon }) => <Link href={href} key={href}>{content.navigation[icon]}</Link>)}
        </nav>
        {session ? <HomeAccountMenu language={language} session={session} /> : <Link className="home-login-link" href="/login">{content.navbar.loginLabel}</Link>}
      </div>
    </div>
  );
};
