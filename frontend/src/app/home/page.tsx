import { getServerAuthSession } from "@/features/auth/authGuard";
import { HomeLandingPage } from "@/features/home/HomeLandingPage";
import "@/features/home/home.css";

export const dynamic = "force-dynamic";

const HomePage = async () => {
  const session = await getServerAuthSession();

  return <HomeLandingPage initialSession={session} />;
};

export default HomePage;
