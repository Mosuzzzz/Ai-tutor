import { requirePageSession } from "@/features/auth/authGuard";
import { loadLearningAnalyticsForSession } from "@/features/learning-analytics/learningAnalyticsApi";
import { LearningAnalyticsPage } from "@/features/learning-analytics/LearningAnalyticsPage";

export const dynamic = "force-dynamic";

const AnalyticsPage = async () => {
  const session = await requirePageSession("/analytics");
  const analyticsResult = await loadLearningAnalyticsForSession({
    session
  });

  return (
    <LearningAnalyticsPage
      analytics={"analytics" in analyticsResult ? analyticsResult.analytics : undefined}
      dataSource="api"
      errorMessage={"errorMessage" in analyticsResult ? analyticsResult.errorMessage : undefined}
      status={analyticsResult.status}
    />
  );
};

export default AnalyticsPage;
