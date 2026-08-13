import { getServerAuthSession } from "@/features/auth/authGuard";
import { HomeLandingPage } from "@/features/home/HomeLandingPage";

export const dynamic = "force-dynamic";

const HomePage = async () => {
  const session = await getServerAuthSession();

  return <HomeLandingPage initialSession={session} />;
};

export default HomePage;
