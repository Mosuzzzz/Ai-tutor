import { z } from "zod";

import type {
  AuthRole,
  LoginFields,
  LoginInput,
  RegisterFields,
  RegisterInput,
  RegisterValues,
  ValidationFailure,
  ValidationSuccess
} from "./types";

export type { AuthRole, LoginInput, RegisterInput, RegisterValues } from "./types";

export const DEFAULT_REGISTER_ROLE: AuthRole = "user";

const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, "กรุณากรอกอีเมล")
  .email("กรุณากรอกอีเมลให้ถูกต้อง");

const passwordSchema = z
  .string()
  .min(1, "กรุณากรอกรหัสผ่าน")
  .min(8, "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร");

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema
});

export const registerSchema = z
  .object({
    acceptedTerms: z.literal(true, {
      error: "กรุณายอมรับเงื่อนไขการใช้งาน"
    }),
    confirmPassword: z.string().min(1, "กรุณายืนยันรหัสผ่าน"),
    email: emailSchema,
    fullName: z.string().trim().min(1, "กรุณากรอกชื่อ-นามสกุล"),
    password: passwordSchema
  })
  .superRefine((values, context) => {
    if (values.confirmPassword && values.confirmPassword !== values.password) {
      context.addIssue({
        code: "custom",
        message: "รหัสผ่านยืนยันไม่ตรงกัน",
        path: ["confirmPassword"]
      });
    }
  });

export function validateLogin(
  input: LoginInput
): ValidationFailure<LoginFields> | ValidationSuccess<LoginInput> {
  const result = loginSchema.safeParse(input);

  if (!result.success) {
    return {
      fieldErrors: mapZodFieldErrors<LoginFields>(result.error),
      ok: false
    };
  }

  return {
    ok: true,
    values: result.data
  };
}

export function validateRegister(
  input: RegisterInput
): ValidationFailure<RegisterFields> | ValidationSuccess<RegisterValues> {
  const result = registerSchema.safeParse(input);

  if (!result.success) {
    const fieldErrors = mapZodFieldErrors<RegisterFields>(result.error);

    if (input.confirmPassword && input.confirmPassword !== input.password && !fieldErrors.confirmPassword) {
      fieldErrors.confirmPassword = "รหัสผ่านยืนยันไม่ตรงกัน";
    }

    return {
      fieldErrors,
      ok: false
    };
  }

  const { confirmPassword: _confirmPassword, ...values } = result.data;

  return {
    ok: true,
    values: {
      ...values,
      role: DEFAULT_REGISTER_ROLE
    }
  };
}

function mapZodFieldErrors<TFields extends string>(
  error: z.ZodError
): Partial<Record<TFields, string>> {
  const fieldErrors: Partial<Record<TFields, string>> = {};

  for (const issue of error.issues) {
    const field = issue.path[0];

    if (typeof field === "string" && !fieldErrors[field as TFields]) {
      fieldErrors[field as TFields] = issue.message;
    }
  }

  return fieldErrors;
}
