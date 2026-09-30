import { LoginPage } from "../../features/auth/LoginPage";
import { redirectAuthenticatedRoute } from "@/features/auth/authGuard";

type LoginRouteProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export const dynamic = "force-dynamic";

const LoginRoute = async ({ searchParams }: LoginRouteProps) => {
  const params: Record<string, string | string[] | undefined> = searchParams ? await searchParams : {};
  const action = Array.isArray(params.action) ? params.action[0] : params.action;
  const rawToken = Array.isArray(params.token) ? params.token[0] : params.token;

  if (action !== "verify-email") {
    await redirectAuthenticatedRoute();
  }

  return <LoginPage verificationToken={action === "verify-email" ? rawToken : undefined} />;
};

export default LoginRoute;
