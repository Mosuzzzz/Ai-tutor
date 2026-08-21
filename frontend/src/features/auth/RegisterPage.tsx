"use client";

import { ArrowRight, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import type { FormEvent } from "react";

import { Button } from "../../components/ui/Button";
import { AuthField, AuthStatus, PlannedGoogleAuth } from "./AuthFormFields";
import { AuthShell } from "./AuthShell";
import type { AuthVisualState } from "./AuthStudyCompanion";
import { submitRegister } from "./authApiClient";
import { AUTH_COPY, AUTH_FEEDBACK, AUTH_MESSAGES, INITIAL_REGISTER_FORM } from "./authContent";
import { validateRegister } from "./authValidation";
import type { AuthSubmissionResult, AuthSubmissionStatus, RegisterInput } from "./types";

type AuthFeedback = {
  detail?: string;
  title: string;
};

const getRegisterFailureFeedback = (submission: Extract<AuthSubmissionResult, { ok: false }>): AuthFeedback => {
  return submission.kind === "invalid-input" ? AUTH_FEEDBACK.register.invalidInput : AUTH_FEEDBACK.register.unavailable;
};

export const RegisterPage = () => {
  const [form, setForm] = useState<RegisterInput>(INITIAL_REGISTER_FORM);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof RegisterInput, string>>>({});
  const [submissionStatus, setSubmissionStatus] = useState<AuthSubmissionStatus>("idle");
  const [submissionFeedback, setSubmissionFeedback] = useState<AuthFeedback | null>(null);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmationPasswordVisible, setIsConfirmationPasswordVisible] = useState(false);
  const [visualState, setVisualState] = useState<AuthVisualState>("idle");
  const isSubmitting = submissionStatus === "submitting";

  const updateField = <TField extends keyof RegisterInput>(
    field: TField,
    value: RegisterInput[TField]
  ) => {
    setForm((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
    setSubmissionStatus("idle");
    setSubmissionFeedback(null);
    setVisualState(field === "email" ? "email" : field === "password" || field === "confirmPassword" ? "password" : "document");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = validateRegister(form);

    if (!result.ok) {
      setFieldErrors(result.fieldErrors);
      setSubmissionStatus("idle");
      setSubmissionFeedback(null);
      return;
    }

    setFieldErrors({});
    setSubmissionStatus("submitting");
    setSubmissionFeedback({ title: AUTH_MESSAGES.registerSubmitting });
    setVisualState("submitting");

    try {
      const submission = await submitRegister(result.values);

      if (submission.ok) {
        setSubmissionStatus("success");
        setSubmissionFeedback({
          detail: submission.requiresEmailVerification
            ? AUTH_FEEDBACK.register.verificationRequired
            : AUTH_FEEDBACK.register.verified,
          title: AUTH_FEEDBACK.register.success
        });
        setVisualState("success");
        return;
      }

      setSubmissionStatus("error");
      setSubmissionFeedback(getRegisterFailureFeedback(submission));
      setVisualState("error");
    } catch {
      setSubmissionStatus("error");
      setSubmissionFeedback(AUTH_FEEDBACK.register.unavailable);
      setVisualState("error");
    }
  };

  return (
    <AuthShell mode="register" visualState={visualState}>
      <div className="mb-8">
        <p className="auth-entrance-item text-label-sm font-bold uppercase tracking-[0.12em] text-foundation-brand" data-auth-enter="0">AI Tutor</p>
        <h1 className="auth-entrance-item mt-3 font-[var(--font-display)] text-3xl font-bold leading-tight text-foundation-ink sm:text-4xl" data-auth-enter="1">
          {AUTH_COPY.register.heading}
        </h1>
        <p className="auth-entrance-item mt-3 max-w-md text-body-md text-foundation-ink-secondary" data-auth-enter="2">{AUTH_COPY.register.intro}</p>
      </div>

      <form className="space-y-5" noValidate onSubmit={handleSubmit}>
        {submissionStatus !== "idle" && submissionFeedback && (
          <AuthStatus
            action={submissionStatus === "success" ? (
              <Link
                className="inline-flex min-h-11 items-center justify-center rounded-md bg-foundation-brand px-4 text-label-md font-bold text-white transition-colors duration-control ease-standard hover:bg-foundation-brand-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foundation-focus focus-visible:ring-offset-2"
                href="/login"
              >
                ไปหน้าเข้าสู่ระบบ
              </Link>
            ) : undefined}
            tone={
              submissionStatus === "submitting" ? "info" : submissionStatus === "error" ? "error" : "success"
            }
            {...submissionFeedback}
          />
        )}

        <div className="grid gap-4">
          <div className="auth-entrance-item" data-auth-enter="3">
            <AuthField
              autoComplete="name"
              error={fieldErrors.fullName}
              id="register-full-name"
              label="ชื่อ-นามสกุล"
              onChange={(event) => updateField("fullName", event.target.value)}
              onFocus={() => setVisualState("document")}
              placeholder="ระบุชื่อ-นามสกุล"
              type="text"
              value={form.fullName}
            />
          </div>
          <div className="auth-entrance-item" data-auth-enter="4">
            <AuthField
              autoComplete="email"
              error={fieldErrors.email}
              id="register-email"
              label="อีเมล"
              onChange={(event) => updateField("email", event.target.value)}
              onFocus={() => setVisualState("email")}
              placeholder="ระบุอีเมล"
              type="email"
              value={form.email}
            />
          </div>
          <div className="auth-entrance-item" data-auth-enter="5">
            <AuthField
              autoComplete="new-password"
              error={fieldErrors.password}
              id="register-password"
              label="รหัสผ่าน"
              onChange={(event) => updateField("password", event.target.value)}
              onFocus={() => setVisualState(isPasswordVisible ? "password-visible" : "password")}
              placeholder="สร้างรหัสผ่าน"
              description={AUTH_COPY.register.passwordRequirement}
              trailingAction={
                <button
                  aria-label={isPasswordVisible ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
                  className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-sm text-foundation-ink-secondary transition-colors duration-control ease-standard hover:bg-foundation-brand-soft hover:text-foundation-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foundation-focus"
                  onClick={() => setIsPasswordVisible((current) => {
                    const next = !current;
                    setVisualState(next ? "password-visible" : "password");
                    return next;
                  })}
                  type="button"
                >
                  {isPasswordVisible ? <EyeOff aria-hidden="true" className="h-5 w-5" /> : <Eye aria-hidden="true" className="h-5 w-5" />}
                </button>
              }
              type={isPasswordVisible ? "text" : "password"}
              value={form.password}
            />
          </div>
          <div className="auth-entrance-item" data-auth-enter="6">
            <AuthField
              autoComplete="new-password"
              error={fieldErrors.confirmPassword}
              id="register-confirm-password"
              label="ยืนยันรหัสผ่าน"
              onChange={(event) => updateField("confirmPassword", event.target.value)}
              onFocus={() => setVisualState(isConfirmationPasswordVisible ? "password-visible" : "password")}
              placeholder="ยืนยันรหัสผ่านอีกครั้ง"
              trailingAction={
                <button
                  aria-label={isConfirmationPasswordVisible ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
                  className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-sm text-foundation-ink-secondary transition-colors duration-control ease-standard hover:bg-foundation-brand-soft hover:text-foundation-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foundation-focus"
                  onClick={() => setIsConfirmationPasswordVisible((current) => {
                    const next = !current;
                    setVisualState(next ? "password-visible" : "password");
                    return next;
                  })}
                  type="button"
                >
                  {isConfirmationPasswordVisible ? <EyeOff aria-hidden="true" className="h-5 w-5" /> : <Eye aria-hidden="true" className="h-5 w-5" />}
                </button>
              }
              type={isConfirmationPasswordVisible ? "text" : "password"}
              value={form.confirmPassword}
            />
          </div>
        </div>

        <div className="auth-entrance-item" data-auth-enter="7">
          <label className="flex items-start gap-3 text-body-md text-foundation-ink-secondary" htmlFor="register-terms">
            <input
              aria-describedby={fieldErrors.acceptedTerms ? "register-terms-error" : undefined}
              aria-invalid={Boolean(fieldErrors.acceptedTerms)}
              checked={form.acceptedTerms}
              className="mt-1 h-5 w-5 rounded border-foundation-border-control text-foundation-brand focus:ring-foundation-focus"
              id="register-terms"
              onChange={(event) => updateField("acceptedTerms", event.target.checked)}
              type="checkbox"
            />
            <span>{AUTH_COPY.register.termsLabel}</span>
          </label>
          {fieldErrors.acceptedTerms && (
            <p className="mt-2 text-label-sm font-semibold text-foundation-error" id="register-terms-error">{fieldErrors.acceptedTerms}</p>
          )}
        </div>

        <Button className="auth-entrance-item auth-primary-submit w-full" data-auth-enter="8" isLoading={isSubmitting} loadingLabel={AUTH_COPY.register.loadingLabel} type="submit">
          {AUTH_COPY.register.submitLabel}
          <ArrowRight aria-hidden="true" className="h-5 w-5" />
        </Button>
        <div className="auth-entrance-item" data-auth-enter="9"><PlannedGoogleAuth /></div>
      </form>

      <p className="auth-entrance-item mt-7 text-center text-body-md text-foundation-ink-secondary" data-auth-enter="10">
        {AUTH_COPY.register.footerPrompt}{" "}
        <Link className="rounded-sm font-bold text-foundation-brand transition-colors hover:text-foundation-brand-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foundation-focus" href="/login">
          {AUTH_COPY.register.footerLink}
        </Link>
      </p>
    </AuthShell>
  );
};
