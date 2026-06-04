import { AppShell } from "../AppShell";
import { requirePageSession } from "@/features/auth/authGuard";
import { TeacherDashboardPage } from "../../features/teacher-dashboard/TeacherDashboardPage";

export const dynamic = "force-dynamic";

const TeacherPage = async () => {
  const session = await requirePageSession("/teacher");

  return (
    <AppShell session={session}>
      <TeacherDashboardPage />
    </AppShell>
  );
};

export default TeacherPage;
