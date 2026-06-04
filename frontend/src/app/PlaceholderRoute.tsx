import { PlaceholderPage } from "../features/foundation/PlaceholderPage";
import { getPlaceholderModule } from "../features/foundation/placeholderContent";
import type { PlaceholderModuleKey } from "../features/foundation/types";
import { AppShell } from "./AppShell";
import type { AuthSession } from "@/features/auth/types";

type PlaceholderRouteProps = {
  moduleKey: PlaceholderModuleKey;
  session: AuthSession;
};

export const PlaceholderRoute = ({ moduleKey, session }: PlaceholderRouteProps) => {
  const placeholder = getPlaceholderModule(moduleKey);

  return (
    <AppShell session={session}>
      <PlaceholderPage module={placeholder} />
    </AppShell>
  );
};
