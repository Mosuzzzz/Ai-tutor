import { AppShell } from "./AppShell";
import { StudentDashboardPage } from "../features/student-dashboard/StudentDashboardPage";
import { fetchStudentDashboard } from "../features/student-dashboard/mockData";

const HomePage = async () => {
  const dashboard = await fetchStudentDashboard();

  return (
    <AppShell>
      <StudentDashboardPage dashboard={dashboard} />
    </AppShell>
  );
};

export default HomePage;
