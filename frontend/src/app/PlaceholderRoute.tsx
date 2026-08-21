import { PlaceholderPage } from "../features/foundation/PlaceholderPage";
import { getPlaceholderModule } from "../features/foundation/placeholderContent";
import type { PlaceholderModuleKey } from "../features/foundation/types";

type PlaceholderRouteProps = {
  moduleKey: PlaceholderModuleKey;
};

export const PlaceholderRoute = ({ moduleKey }: PlaceholderRouteProps) => {
  const placeholder = getPlaceholderModule(moduleKey);

  return <PlaceholderPage module={placeholder} />;
};
