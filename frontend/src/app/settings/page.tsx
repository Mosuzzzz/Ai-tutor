import { PlaceholderRoute } from "../PlaceholderRoute";
import { requirePageSession } from "@/features/auth/authGuard";

export const dynamic = "force-dynamic";

const SettingsPage = async () => {
  const session = await requirePageSession("/settings");

  return <PlaceholderRoute moduleKey="settings" session={session} />;
};

export default SettingsPage;
