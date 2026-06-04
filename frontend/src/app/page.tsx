import { AppShell } from "./AppShell";
import { requirePageSession } from "@/features/auth/authGuard";
import { StudentDashboardPage } from "../features/student-dashboard/StudentDashboardPage";
import { fetchStudentDashboard } from "../features/student-dashboard/mockData";

export const dynamic = "force-dynamic";

const HomePage = async () => {
  const session = await requirePageSession("/");
  const dashboard = await fetchStudentDashboard();

  return (
    <AppShell session={session}>
      <StudentDashboardPage dashboard={dashboard} />
    </AppShell>
  );
};

export default HomePage;
