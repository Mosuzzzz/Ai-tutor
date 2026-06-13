import type { ReactNode } from "react";

type AppShellIconButtonProps = {
  children: ReactNode;
  label: string;
};

export const AppShellIconButton = ({ children, label }: AppShellIconButtonProps) => {
  return (
    <button
      aria-label={label}
      className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full text-on-surface-variant transition-colors duration-200 hover:bg-surface-container-low hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary-fixed-dim focus:ring-offset-2"
      type="button"
    >
      {children}
    </button>
  );
};
