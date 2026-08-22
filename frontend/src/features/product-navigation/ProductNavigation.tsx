"use client";

import { Languages, LogIn, Menu, Moon, Sun, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import type { AuthSession } from "../auth/types";
import type { HomeLanguage, HomeTheme } from "../home/types";
import { ProductAccountMenu } from "./ProductAccountMenu";
import { ProductBrand } from "./ProductBrand";
import { ProductLogoutButton } from "./ProductLogoutButton";
import { getProductNavigation, marketingNavigation } from "./navigationData";
import { isActiveProductHref } from "./navigationHelpers";

type ProductNavigationProps = {
  language: HomeLanguage;
  mode: "marketing" | "product";
  onLanguageToggle: () => void;
  onThemeToggle: () => void;
  session: AuthSession | null;
  theme: HomeTheme;
  logoutRedirect?: "/home" | "/login";
};

export const ProductNavigation = ({ language, logoutRedirect = "/home", mode, onLanguageToggle, onThemeToggle, session, theme }: ProductNavigationProps) => {
  const pathname = usePathname() ?? "/home";
  const [mobileOpen, setMobileOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const languageControlRef = useRef<HTMLButtonElement>(null);
  const closeMobile = useCallback(() => {
    setMobileOpen(false);
    triggerRef.current?.focus();
  }, []);
  const closeForDesktop = useCallback(() => {
    setMobileOpen(false);
    languageControlRef.current?.focus();
  }, []);
  useEffect(() => {
    if (!mobileOpen || typeof window.matchMedia !== "function") return;
    const desktop = window.matchMedia("(min-width: 1200px)");
    const handleDesktop = (event: MediaQueryListEvent | { matches: boolean }) => {
      if (event.matches) closeForDesktop();
    };
    desktop.addEventListener?.("change", handleDesktop);
    return () => desktop.removeEventListener?.("change", handleDesktop);
  }, [closeForDesktop, mobileOpen]);
  const labels = language === "th" ? { lang: "ภาษา", theme: "ธีม", menu: "เปิดเมนูนำทาง", dialog: "เมนูผลิตภัณฑ์", close: "ปิดเมนู", login: "เข้าสู่ระบบ", register: "เริ่มเรียน" } : { lang: "Language", theme: "Theme", menu: "Open navigation menu", dialog: "Product navigation", close: "Close navigation menu", login: "Log in", register: "Start studying" };
  const links = mode === "product" && session ? getProductNavigation(session.user.role) : marketingNavigation;

  return <>
    <header aria-label={language === "th" ? "แถบนำทางผลิตภัณฑ์" : "Product header"} className="product-header">
      <div className="product-header-inner">
        <ProductBrand />
        <nav aria-label="Primary navigation" className="product-desktop-nav">
          {links.map((item) => {
            const label = item.labels[language];
            const active = mode === "product" && isActiveProductHref(pathname, item.href);
            return <Link aria-current={active ? "page" : undefined} className="product-nav-link" href={item.href} key={item.href}>{label}</Link>;
          })}
        </nav>
        <div className="product-controls">
          <button aria-label={`${labels.lang}: ${language.toUpperCase()}`} className="product-control" onClick={onLanguageToggle} ref={languageControlRef} type="button"><Languages aria-hidden="true" size={17} /><span>{language.toUpperCase()}</span></button>
          <button aria-label={`${labels.theme}: ${theme === "light" ? "Light" : "Dark"}`} aria-pressed={theme === "dark"} className="product-control" onClick={onThemeToggle} type="button">{theme === "light" ? <Sun aria-hidden="true" size={17} /> : <Moon aria-hidden="true" size={17} />}</button>
          {session ? <ProductAccountMenu language={language} redirectTo={logoutRedirect} session={session} /> : <><Link aria-label={labels.login} className="product-login" href="/login"><LogIn aria-hidden="true" size={17} /><span>{labels.login}</span></Link><Link className="product-register" href="/register">{labels.register}</Link></>}
          <button aria-expanded={mobileOpen} aria-label={labels.menu} className="product-menu-trigger" onClick={() => setMobileOpen(true)} ref={triggerRef} type="button"><Menu aria-hidden="true" size={20} /></button>
        </div>
      </div>
    </header>
    {mobileOpen ? <ProductMobileDialog language={language} links={links} mode={mode} onClose={closeMobile} pathname={pathname} redirectTo={logoutRedirect} session={session} triggerRef={triggerRef} /> : null}
  </>;
};

type NavItem = (typeof marketingNavigation)[number] | (typeof import("./navigationData").productNavigation)[number];
const ProductMobileDialog = ({ language, links, mode, onClose, pathname, redirectTo, session, triggerRef }: { language: HomeLanguage; links: readonly NavItem[]; mode: "marketing" | "product"; onClose: () => void; pathname: string; redirectTo: "/home" | "/login"; session: AuthSession | null; triggerRef: React.RefObject<HTMLButtonElement | null> }) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const initialPath = useRef(pathname);
  const close = useCallback(() => { onClose(); triggerRef.current?.focus(); }, [onClose, triggerRef]);
  useEffect(() => {
    const previous = document.body.style.overflow; document.body.style.overflow = "hidden"; closeRef.current?.focus();
    const key = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); close(); return; }
      if (event.key !== "Tab") return;
      const focusable = Array.from(dialogRef.current?.querySelectorAll<HTMLElement>("a[href],button:not([disabled])") ?? []);
      const first = focusable[0], last = focusable.at(-1); if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", key);
    return () => { document.removeEventListener("keydown", key); document.body.style.overflow = previous; };
  }, [close]);
  useEffect(() => { if (pathname !== initialPath.current) close(); }, [close, pathname]);
  const th = language === "th";
  return <div className="product-mobile-layer"><button aria-label={th ? "ปิดฉากหลังเมนู" : "Close navigation backdrop"} className="product-mobile-backdrop" onClick={close} type="button" /><div aria-label={th ? "เมนูผลิตภัณฑ์" : "Product navigation"} aria-modal="true" className="product-mobile-dialog" ref={dialogRef} role="dialog"><div className="product-mobile-heading"><ProductBrand /><button aria-label={th ? "ปิดเมนู" : "Close navigation menu"} onClick={close} ref={closeRef} type="button"><X aria-hidden="true" size={20} /></button></div><nav aria-label="Mobile navigation">{links.map((item) => { const active = mode === "product" && isActiveProductHref(pathname, item.href); return <Link aria-current={active ? "page" : undefined} href={item.href} key={item.href} onClick={close}>{item.labels[language]}</Link>; })}</nav>{session ? <div className="product-mobile-account"><div><strong>{session.user.displayName?.trim() || (th ? "บัญชี" : "Account")}</strong><small>{session.user.email}</small></div><Link href="/settings" onClick={close}>{th ? "การตั้งค่า" : "Settings"}</Link><ProductLogoutButton language={language} redirectTo={redirectTo} /></div> : <div className="product-mobile-auth"><Link href="/login" onClick={close}>{th ? "เข้าสู่ระบบ" : "Log in"}</Link><Link href="/register" onClick={close}>{th ? "เริ่มเรียน" : "Start studying"}</Link></div>}</div></div>;
};
