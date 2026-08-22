import { AppShellFrame } from "./AppShellFrame.client";
import type { AppShellProps } from "./types";

export const AppShell = ({ children, session }: AppShellProps) => (
  <AppShellFrame session={session}>{children}</AppShellFrame>
);
