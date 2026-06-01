"use client";

import { ArrowRight, GraduationCap, Presentation, UserRound } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import type { FormEvent, ReactNode } from "react";

import { Button } from "../../components/ui/Button";
import { AuthDivider, AuthField, MockSocialButton, MockStatus } from "./AuthFormFields";
import { AuthShell } from "./AuthShell";
import {
  AUTH_COPY,
  AUTH_MESSAGES,
  AUTH_ROLE_DESCRIPTIONS,
  AUTH_ROLE_LABELS,
  INITIAL_REGISTER_FORM
} from "./authContent";
import { validateRegister } from "./authValidation";
import { submitMockRegister } from "./mockAuthClient";
import type { AuthRole, AuthSubmissionStatus, RegisterInput } from "./types";

export const RegisterPage = () => {
  const [form, setForm] = useState<RegisterInput>(INITIAL_REGISTER_FORM);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof RegisterInput, string>>>({});
  const [submissionStatus, setSubmissionStatus] = useState<AuthSubmissionStatus>("idle");
  const [submissionMessage, setSubmissionMessage] = useState("");
  const isSubmitting = submissionStatus === "submitting";

  const updateField = <TField extends keyof RegisterInput>(
    field: TField,
    value: RegisterInput[TField]
  ) => {
    setForm((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
    setSubmissionStatus("idle");
    setSubmissionMessage("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = validateRegister(form);

    if (!result.ok) {
      setFieldErrors(result.fieldErrors);
      setSubmissionStatus("idle");
      setSubmissionMessage("");
      return;
    }

    setFieldErrors({});
    setSubmissionStatus("submitting");
    setSubmissionMessage(AUTH_MESSAGES.registerSubmitting);

    try {
      const submission = await submitMockRegister(result.values);

      setSubmissionStatus(submission.ok ? "success" : "error");
      setSubmissionMessage(submission.message);
    } catch {
      setSubmissionStatus("error");
      setSubmissionMessage(AUTH_MESSAGES.genericError);
    }
  };

  return (
    <AuthShell mode="register">
      <div className="mb-8">
        <p className="text-label-md font-bold uppercase tracking-[0.12em] text-[#a9660a]">
          {AUTH_COPY.register.eyebrow}
        </p>
        <h1 className="auth-display mt-2 text-[42px] font-bold leading-tight text-[#10253f]">
          {AUTH_COPY.register.heading}
        </h1>
        <p className="mt-3 text-body-lg text-[#596273]">{AUTH_COPY.register.intro}</p>
      </div>

      <form className="space-y-5" noValidate onSubmit={handleSubmit}>
        {submissionStatus !== "idle" && (
          <MockStatus tone={submissionStatus === "error" ? "error" : "success"}>{submissionMessage}</MockStatus>
        )}

        <fieldset>
          <legend className="mb-3 text-label-md font-bold text-[#132238]">
            {AUTH_COPY.register.roleLegend}
          </legend>
          <div className="grid gap-3 sm:grid-cols-2">
            <RoleOption
              checked={form.role === "student"}
              icon={<GraduationCap aria-hidden="true" className="h-6 w-6" />}
              label="นักเรียน"
              onChange={() => updateField("role", "student")}
              value="student"
            />
            <RoleOption
              checked={form.role === "teacher"}
              icon={<Presentation aria-hidden="true" className="h-6 w-6" />}
              label="ผู้สอน"
              onChange={() => updateField("role", "teacher")}
              value="teacher"
            />
          </div>
          {fieldErrors.role && <p className="mt-2 text-label-sm text-error">{fieldErrors.role}</p>}
        </fieldset>

        <div className="rounded-lg border border-[#d8deea] bg-[#f8f9ff] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#10253f] text-[#f4b35b]">
              <UserRound aria-hidden="true" className="h-5 w-5" />
            </div>
            <div>
              <p className="text-label-md font-bold text-[#10253f]">
                {form.role ? AUTH_ROLE_LABELS[form.role] : AUTH_COPY.register.roleFallback}
              </p>
              <p className="text-label-sm text-[#596273]">
                {form.role ? AUTH_ROLE_DESCRIPTIONS[form.role] : AUTH_ROLE_DESCRIPTIONS.student}
              </p>
            </div>
          </div>
        </div>

        <AuthField
          autoComplete="name"
          error={fieldErrors.fullName}
          id="register-full-name"
          label="ชื่อ-นามสกุล"
          onChange={(event) => updateField("fullName", event.target.value)}
          placeholder="ระบุชื่อ-นามสกุลของคุณ"
          type="text"
          value={form.fullName}
        />
        <AuthField
          autoComplete="email"
          error={fieldErrors.email}
          id="register-email"
          label="อีเมล"
          onChange={(event) => updateField("email", event.target.value)}
          placeholder="ระบุอีเมลของคุณ"
          type="email"
          value={form.email}
        />
        <AuthField
          autoComplete="new-password"
          error={fieldErrors.password}
          id="register-password"
          label="รหัสผ่าน"
          onChange={(event) => updateField("password", event.target.value)}
          placeholder="สร้างรหัสผ่าน"
          type="password"
          value={form.password}
        />
        <AuthField
          autoComplete="new-password"
          error={fieldErrors.confirmPassword}
          id="register-confirm-password"
          label="ยืนยันรหัสผ่าน"
          onChange={(event) => updateField("confirmPassword", event.target.value)}
          placeholder="ยืนยันรหัสผ่านอีกครั้ง"
          type="password"
          value={form.confirmPassword}
        />

        <div>
          <label className="flex items-start gap-3 text-body-md text-[#3e4a5c]" htmlFor="register-terms">
            <input
              checked={form.acceptedTerms}
              className="mt-1 h-5 w-5 rounded border-[#bcc5d6] text-[#10253f] focus:ring-[#f4b35b]"
              id="register-terms"
              onChange={(event) => updateField("acceptedTerms", event.target.checked)}
              type="checkbox"
            />
            <span>{AUTH_COPY.register.termsLabel}</span>
          </label>
          {fieldErrors.acceptedTerms && (
            <p className="mt-2 text-label-sm text-error">{fieldErrors.acceptedTerms}</p>
          )}
        </div>

        <Button className="w-full bg-[#10253f] text-white hover:bg-[#18395e]" disabled={isSubmitting} type="submit">
          {AUTH_COPY.register.submitLabel}
          <ArrowRight aria-hidden="true" className="h-5 w-5" />
        </Button>
      </form>

      <AuthDivider>{AUTH_COPY.register.divider}</AuthDivider>

      <div className="grid gap-3 sm:grid-cols-2">
        <MockSocialButton provider="Google" />
        <MockSocialButton provider="Facebook" />
      </div>

      <p className="mt-8 text-center text-body-md text-[#596273]">
        {AUTH_COPY.register.footerPrompt}{" "}
        <Link className="font-bold text-[#a9660a] hover:text-[#704512]" href="/login">
          {AUTH_COPY.register.footerLink}
        </Link>
      </p>
    </AuthShell>
  );
};

const RoleOption = ({
  checked,
  icon,
  label,
  onChange,
  value
}: {
  checked: boolean;
  icon: ReactNode;
  label: string;
  onChange: () => void;
  value: AuthRole;
}) => {
  return (
    <label
      className={[
        "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border px-4 py-4 text-center transition-colors",
        checked
          ? "border-[#10253f] bg-[#edf3fb] text-[#10253f]"
          : "border-[#c7cfdd] bg-white text-[#596273] hover:border-[#f4b35b]"
      ].join(" ")}
    >
      <input
        checked={checked}
        className="sr-only"
        name="role"
        onChange={onChange}
        type="radio"
        value={value}
      />
      <span className="text-[#a9660a]">{icon}</span>
      <span className="text-label-md font-bold">{label}</span>
    </label>
  );
};
