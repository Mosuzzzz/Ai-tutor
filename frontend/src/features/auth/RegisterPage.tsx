"use client";

import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import type { FormEvent } from "react";

import { Button } from "../../components/ui/Button";
import { AuthDivider, AuthField, MockSocialButton, MockStatus } from "./AuthFormFields";
import { AuthShell } from "./AuthShell";
import { submitRegister } from "./authApiClient";
import {
  AUTH_COPY,
  AUTH_MESSAGES,
  INITIAL_REGISTER_FORM
} from "./authContent";
import { validateRegister } from "./authValidation";
import type { AuthSubmissionStatus, RegisterInput } from "./types";

export const RegisterPage = () => {
  const [form, setForm] = useState<RegisterInput>(INITIAL_REGISTER_FORM);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof RegisterInput, string>>>({});
  const [submissionStatus, setSubmissionStatus] = useState<AuthSubmissionStatus>("idle");
  const [submissionMessage, setSubmissionMessage] = useState("");
  const [hasDevVerifiedRegistration, setHasDevVerifiedRegistration] = useState(false);
  const isSubmitting = submissionStatus === "submitting";

  const updateField = <TField extends keyof RegisterInput>(
    field: TField,
    value: RegisterInput[TField]
  ) => {
    setForm((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
    setSubmissionStatus("idle");
    setSubmissionMessage("");
    setHasDevVerifiedRegistration(false);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = validateRegister(form);

    if (!result.ok) {
      setFieldErrors(result.fieldErrors);
      setSubmissionStatus("idle");
      setSubmissionMessage("");
      setHasDevVerifiedRegistration(false);
      return;
    }

    setFieldErrors({});
    setSubmissionStatus("submitting");
    setSubmissionMessage(AUTH_MESSAGES.registerSubmitting);
    setHasDevVerifiedRegistration(false);

    try {
      const submission = await submitRegister(result.values);

      setSubmissionStatus(submission.ok ? "success" : "error");
      setSubmissionMessage(submission.message);
      setHasDevVerifiedRegistration(submission.ok && Boolean(submission.verifiedInDevelopment));
    } catch {
      setSubmissionStatus("error");
      setSubmissionMessage(AUTH_MESSAGES.genericError);
      setHasDevVerifiedRegistration(false);
    }
  };

  return (
    <AuthShell mode="register">
      <div className="mb-8">
        <p className="text-label-md font-bold uppercase tracking-[0.12em] text-[#5c636e]">
          {AUTH_COPY.register.eyebrow}
        </p>
        <h1 className="auth-display mt-2 text-[42px] font-bold leading-tight text-[#15181d]">
          {AUTH_COPY.register.heading}
        </h1>
        <p className="mt-3 text-body-lg text-[#5c636e]">{AUTH_COPY.register.intro}</p>
      </div>

      <form className="space-y-5" noValidate onSubmit={handleSubmit}>
        {submissionStatus !== "idle" && (
          <MockStatus
            tone={
              submissionStatus === "submitting" ? "info" : submissionStatus === "error" ? "error" : "success"
            }
          >
            {submissionMessage}
          </MockStatus>
        )}

        {hasDevVerifiedRegistration && (
          <div className="rounded-lg border border-[#e4e7eb] bg-[#f6f7f9] p-4 text-body-md text-[#2b3038]">
            <p>อีเมลถูกยืนยันสำหรับ local dev แล้ว คุณสามารถเข้าสู่ระบบด้วยบัญชีนี้ได้ทันที</p>
            <Link
              className="mt-3 inline-flex min-h-11 items-center justify-center rounded-lg bg-[#15181d] px-4 text-label-md font-bold text-white transition-colors hover:bg-[#2b3038]"
              href="/login"
            >
              ไปหน้าเข้าสู่ระบบ
            </Link>
          </div>
        )}

        <div className="rounded-lg border border-[#e4e7eb] bg-[#f6f7f9] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#15181d] text-[#5a4fe0]">
              <Sparkles aria-hidden="true" className="h-5 w-5" />
            </div>
            <div>
              <p className="text-label-md font-bold text-[#15181d]">บัญชีเดียวสำหรับพื้นที่เรียนรู้ของคุณ</p>
              <p className="text-label-sm text-[#5c636e]">
                หลังสมัครแล้วคุณจะอัปโหลดเอกสาร สรุป ถาม AI และสร้างควิซทบทวนได้จากพื้นที่เดียวกัน
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
          <label className="flex items-start gap-3 text-body-md text-[#2b3038]" htmlFor="register-terms">
            <input
              checked={form.acceptedTerms}
              className="mt-1 h-5 w-5 rounded border-[#e4e7eb] text-[#15181d] focus:ring-[#5a4fe0]"
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

        <Button className="w-full bg-[#15181d] text-white hover:bg-[#2b3038]" disabled={isSubmitting} type="submit">
          {AUTH_COPY.register.submitLabel}
          <ArrowRight aria-hidden="true" className="h-5 w-5" />
        </Button>
      </form>

      <AuthDivider>{AUTH_COPY.register.divider}</AuthDivider>

      <div className="grid gap-3 sm:grid-cols-2">
        <MockSocialButton provider="Google" />
        <MockSocialButton provider="Facebook" />
      </div>

      <p className="mt-8 text-center text-body-md text-[#5c636e]">
        {AUTH_COPY.register.footerPrompt}{" "}
        <Link className="font-bold text-[#5c636e] hover:text-[#5c636e]" href="/login">
          {AUTH_COPY.register.footerLink}
        </Link>
      </p>
    </AuthShell>
  );
};
