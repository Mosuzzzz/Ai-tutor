import { PlaceholderRoute } from "../PlaceholderRoute";
import { requirePageSession } from "@/features/auth/authGuard";

export const dynamic = "force-dynamic";

const CoursesPage = async () => {
  const session = await requirePageSession("/courses");

  return <PlaceholderRoute moduleKey="courses" session={session} />;
};

export default CoursesPage;
