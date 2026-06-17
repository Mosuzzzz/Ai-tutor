import type { ReactNode } from "react";

type AppShellIconButtonProps = {
  children: ReactNode;
  label: string;
};

export const AppShellIconButton = ({ children, label }: AppShellIconButtonProps) => {
  return (
    <button
      aria-label={label}
      className="inline-flex h-9 w-9 items-center justify-center rounded-md text-on-surface-variant transition-colors duration-150 hover:bg-surface-container hover:text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-fixed-dim focus:ring-offset-2"
      type="button"
    >
      {children}
    </button>
  );
};
