import type { ReactNode } from "react";

import { AppShell } from "@/features/app-shell/AppShell";
import { requireAuthenticatedSession } from "@/features/auth/authGuard";

type ProtectedAppLayoutProps = {
  children: ReactNode;
};

const ProtectedAppLayout = async ({ children }: ProtectedAppLayoutProps) => {
  const session = await requireAuthenticatedSession();

  return <AppShell session={session}>{children}</AppShell>;
};

export default ProtectedAppLayout;
