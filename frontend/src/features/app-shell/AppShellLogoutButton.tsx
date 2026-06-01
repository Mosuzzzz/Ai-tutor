import { LogOut } from "lucide-react";

export const AppShellLogoutButton = () => {
  return (
    <button
      className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-body-md text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-primary"
      type="button"
    >
      <LogOut aria-hidden="true" className="h-5 w-5" />
      ออกจากระบบ
    </button>
  );
};
