"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { logout } from "../auth/authApiClient";

export const ProductLogoutButton = ({ language, redirectTo, role }: { language: "en" | "th"; redirectTo: "/home" | "/login"; role?: "menuitem" }) => {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const handleLogout = async () => {
    if (pending) return;
    setPending(true); setError("");
    const result = await logout();
    if (result.ok) { router.replace(redirectTo); router.refresh(); return; }
    setPending(false); setError(result.message);
  };
  return <div><button aria-busy={pending} disabled={pending} onClick={handleLogout} role={role} type="button">{pending ? (language === "th" ? "กำลังออกจากระบบ" : "Logging out") : (language === "th" ? "ออกจากระบบ" : "Log out")}</button>{error ? <p role="status">{error}</p> : null}</div>;
};
