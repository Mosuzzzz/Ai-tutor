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
        className="flex min-h-9 w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-label-md font-medium text-on-surface-variant transition-colors duration-150 hover:bg-surface-container hover:text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-fixed-dim focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={isSubmitting}
        onClick={handleLogout}
        type="button"
      >
        <LogOut aria-hidden="true" className="h-[18px] w-[18px]" />
        {isSubmitting ? "กำลังออกจากระบบ" : "ออกจากระบบ"}
      </button>
      {errorMessage && (
        <p className="px-3 pt-1 text-label-sm text-error" role="status">
          {errorMessage}
        </p>
      )}
    </div>
  );
};
