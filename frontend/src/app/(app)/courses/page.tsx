import { PlaceholderRoute } from "../../PlaceholderRoute";
import { requirePageSession } from "@/features/auth/authGuard";

export const dynamic = "force-dynamic";

const CoursesPage = async () => {
  await requirePageSession("/courses");

  return <PlaceholderRoute moduleKey="courses" />;
};

export default CoursesPage;
