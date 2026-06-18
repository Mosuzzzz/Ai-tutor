import { AppShell } from "./AppShell";
import { requirePageSession } from "@/features/auth/authGuard";
import { loadStudyDashboardForSession } from "@/features/study-dashboard/studyDashboardApi";
import { StudyDashboardPage } from "../features/study-dashboard/StudyDashboardPage";

export const dynamic = "force-dynamic";

const HomePage = async () => {
  const session = await requirePageSession("/");
  const dashboardResult = await loadStudyDashboardForSession({
    session
  });

  return (
    <AppShell session={session}>
      <StudyDashboardPage
        dashboard={"dashboard" in dashboardResult ? dashboardResult.dashboard : undefined}
        dataSource="api"
        errorMessage={"errorMessage" in dashboardResult ? dashboardResult.errorMessage : undefined}
        status={dashboardResult.status}
      />
    </AppShell>
  );
};

export default HomePage;
