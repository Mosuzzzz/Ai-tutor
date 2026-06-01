import type { ReactNode } from "react";

type AppShellIconButtonProps = {
  children: ReactNode;
  label: string;
};

export const AppShellIconButton = ({ children, label }: AppShellIconButtonProps) => {
  return (
    <button
      aria-label={label}
      className="inline-flex h-10 w-10 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-primary"
      type="button"
    >
      {children}
    </button>
  );
};
