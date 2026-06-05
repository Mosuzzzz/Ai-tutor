import { AppShell } from "../AppShell";
import { requirePageSession } from "@/features/auth/authGuard";
import { loadTeacherDashboardForSession } from "@/features/teacher-dashboard/teacherDashboardApi";
import { TeacherDashboardPage } from "../../features/teacher-dashboard/TeacherDashboardPage";

export const dynamic = "force-dynamic";

const TeacherPage = async () => {
  const session = await requirePageSession("/teacher");
  const dashboardResult = await loadTeacherDashboardForSession({
    session
  });

  return (
    <AppShell session={session}>
      <TeacherDashboardPage
        dashboard={"dashboard" in dashboardResult ? dashboardResult.dashboard : undefined}
        dataSource="api"
        errorMessage={"errorMessage" in dashboardResult ? dashboardResult.errorMessage : undefined}
        status={dashboardResult.status}
      />
    </AppShell>
  );
};

export default TeacherPage;
