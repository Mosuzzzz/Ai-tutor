import { AppShell } from "../AppShell";
import { requirePageSession } from "@/features/auth/authGuard";
import { LearningAnalyticsPage } from "../../features/learning-analytics/LearningAnalyticsPage";

export const dynamic = "force-dynamic";

const AnalyticsPage = async () => {
  const session = await requirePageSession("/analytics");

  return (
    <AppShell session={session}>
      <LearningAnalyticsPage />
    </AppShell>
  );
};

export default AnalyticsPage;
