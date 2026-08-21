import { PlaceholderRoute } from "../../PlaceholderRoute";
import { requirePageSession } from "@/features/auth/authGuard";

export const dynamic = "force-dynamic";

const SettingsPage = async () => {
  await requirePageSession("/settings");

  return <PlaceholderRoute moduleKey="settings" />;
};

export default SettingsPage;
