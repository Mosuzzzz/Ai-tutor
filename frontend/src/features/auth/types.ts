export type AuthRole = "student" | "teacher";

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

export type AuthMockSession = {
  mode: "http-only-cookie";
  storesTokenInClient: false;
  user: {
    displayName?: string;
    email: string;
    role: AuthRole;
  };
};

export type AuthSubmissionResult =
  | {
      ok: true;
      message: string;
      session: AuthMockSession;
    }
  | {
      ok: false;
      message: string;
    };
