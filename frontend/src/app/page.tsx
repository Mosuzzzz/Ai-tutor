import { AppShell } from "./AppShell";
import { requirePageSession } from "@/features/auth/authGuard";
import { loadStudentDashboardForSession } from "@/features/student-dashboard/studentDashboardApi";
import { StudentDashboardPage } from "../features/student-dashboard/StudentDashboardPage";

export const dynamic = "force-dynamic";

const HomePage = async () => {
  const session = await requirePageSession("/");
  const dashboardResult = await loadStudentDashboardForSession({
    session
  });

  return (
    <AppShell session={session}>
      <StudentDashboardPage
        dashboard={"dashboard" in dashboardResult ? dashboardResult.dashboard : undefined}
        dataSource="api"
        errorMessage={"errorMessage" in dashboardResult ? dashboardResult.errorMessage : undefined}
        status={dashboardResult.status}
      />
    </AppShell>
  );
};

export default HomePage;
