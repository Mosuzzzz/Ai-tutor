import { PlaceholderPage } from "../features/foundation/PlaceholderPage";
import { getPlaceholderModule } from "../features/foundation/placeholderContent";
import type { PlaceholderModuleKey } from "../features/foundation/types";
import { AppShell } from "./AppShell";

type PlaceholderRouteProps = {
  moduleKey: PlaceholderModuleKey;
};

export const PlaceholderRoute = ({ moduleKey }: PlaceholderRouteProps) => {
  const placeholder = getPlaceholderModule(moduleKey);

  return (
    <AppShell>
      <PlaceholderPage module={placeholder} />
    </AppShell>
  );
};
