import { requirePageSession } from "@/features/auth/authGuard";
import { StudyDashboardPage } from "@/features/study-dashboard/StudyDashboardPage";
import { loadStudyDashboardForSession } from "@/features/study-dashboard/studyDashboardApi";

export const dynamic = "force-dynamic";

const DashboardPage = async () => {
  const session = await requirePageSession("/dashboard");
  const dashboardResult = await loadStudyDashboardForSession({
    session
  });

  return (
    <StudyDashboardPage
      dashboard={"dashboard" in dashboardResult ? dashboardResult.dashboard : undefined}
      dataSource="api"
      errorMessage={"errorMessage" in dashboardResult ? dashboardResult.errorMessage : undefined}
      status={dashboardResult.status}
    />
  );
};

export default DashboardPage;
