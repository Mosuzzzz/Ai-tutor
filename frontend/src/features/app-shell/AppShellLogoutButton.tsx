"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { logout } from "../auth/authApiClient";

export const AppShellLogoutButton = () => {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogout = async () => {
    setErrorMessage("");
    setIsSubmitting(true);

    const result = await logout();

    if (result.ok) {
      router.replace("/login");
      router.refresh();
      return;
    }

    setErrorMessage(result.message);
    setIsSubmitting(false);
  };

  return (
    <div>
      <button
        aria-busy={isSubmitting}
        className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-body-md text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-primary disabled:cursor-not-allowed disabled:opacity-60"
        disabled={isSubmitting}
        onClick={handleLogout}
        type="button"
      >
        <LogOut aria-hidden="true" className="h-5 w-5" />
        {isSubmitting ? "กำลังออกจากระบบ" : "ออกจากระบบ"}
      </button>
      {errorMessage && <p className="px-3 pt-1 text-label-sm text-error">{errorMessage}</p>}
    </div>
  );
};
