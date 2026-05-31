import { AppShell } from "./AppShell";
import { StudentDashboardPage } from "../features/student-dashboard/StudentDashboardPage";

const HomePage = () => {
  return (
    <AppShell>
      <StudentDashboardPage />
    </AppShell>
  );
};

export default HomePage;
