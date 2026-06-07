export type AuthRole = "student" | "teacher";
export type AuthRouteRole = AuthRole | "global_admin" | "tenant_admin";

export type LoginInput = {
  email: string;
  password: string;
};

export type RegisterInput = {
  acceptedTerms: boolean;
  confirmPassword: string;
  email: string;
  fullName: string;
  password: string;
  role: AuthRole | "";
};

export type RegisterValues = Omit<RegisterInput, "confirmPassword"> & {
  role: AuthRole;
};

export type ValidationSuccess<TValues> = {
  ok: true;
  values: TValues;
};

export type ValidationFailure<TFields extends string> = {
  fieldErrors: Partial<Record<TFields, string>>;
  ok: false;
};

export type LoginFields = keyof LoginInput;
export type RegisterFields = keyof RegisterInput;

export type AuthSubmissionStatus = "idle" | "submitting" | "success" | "error";

export type AuthSession = {
  mode: "http-only-cookie";
  storesTokenInClient: false;
  user: {
    displayName?: string | null;
    email: string;
    role: AuthRouteRole;
  };
};

export type AuthMockSession = AuthSession;

export type AuthSubmissionResult =
  | {
      email?: string;
      ok: true;
      message: string;
      requiresEmailVerification?: boolean;
      session?: AuthSession;
      verifiedInDevelopment?: boolean;
    }
  | {
      ok: false;
      message: string;
    };
