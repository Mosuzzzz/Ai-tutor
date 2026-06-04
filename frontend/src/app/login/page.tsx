import { LoginPage } from "../../features/auth/LoginPage";
import { redirectAuthenticatedRoute } from "@/features/auth/authGuard";

export const dynamic = "force-dynamic";

const LoginRoute = async () => {
  await redirectAuthenticatedRoute();

  return <LoginPage />;
};

export default LoginRoute;
