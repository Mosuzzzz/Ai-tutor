import { RegisterPage } from "../../features/auth/RegisterPage";
import { redirectAuthenticatedRoute } from "@/features/auth/authGuard";

export const dynamic = "force-dynamic";

const RegisterRoute = async () => {
  await redirectAuthenticatedRoute();

  return <RegisterPage />;
};

export default RegisterRoute;
