"use client";

import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import type { AuthSession } from "../auth/types";
import { ProductLogoutButton } from "./ProductLogoutButton";

export const ProductAccountMenu = ({ language, redirectTo, session }: { language: "en" | "th"; redirectTo: "/home" | "/login"; session: AuthSession }) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const displayName = session.user.displayName?.trim();
  const safeDisplayName = displayName && !displayName.includes("@") && displayName.toLocaleLowerCase() !== session.user.email.toLocaleLowerCase()
    ? displayName
    : null;
  const name = safeDisplayName || (language === "th" ? "บัญชี" : "Account");
  useEffect(() => {
    if (!open) return;
    const pointer = (event: PointerEvent) => { if (!rootRef.current?.contains(event.target as Node)) setOpen(false); };
    const key = (event: KeyboardEvent) => { if (event.key === "Escape") { setOpen(false); triggerRef.current?.focus(); } };
    document.addEventListener("pointerdown", pointer); document.addEventListener("keydown", key);
    return () => { document.removeEventListener("pointerdown", pointer); document.removeEventListener("keydown", key); };
  }, [open]);
  const menuLabel = language === "th" ? "เมนูบัญชี" : "Account menu";
  return <div className="product-account" ref={rootRef}>
    <button aria-expanded={open} aria-haspopup="menu" aria-label={`${language === "th" ? "เปิดเมนูบัญชี" : "Open account menu"} ${name}`} className="product-account-trigger" onClick={() => setOpen((value) => !value)} ref={triggerRef} type="button"><span>{name.charAt(0).toLocaleUpperCase()}</span><b>{name}</b><ChevronDown aria-hidden="true" size={14} /></button>
    {open ? <div aria-label={menuLabel} className="product-account-menu" role="menu"><div className="product-account-identity"><strong>{name}</strong><small>{session.user.email}</small></div><Link href="/settings" onClick={() => setOpen(false)} role="menuitem">{language === "th" ? "การตั้งค่า" : "Settings"}</Link><ProductLogoutButton language={language} redirectTo={redirectTo} role="menuitem" /></div> : null}
  </div>;
};
