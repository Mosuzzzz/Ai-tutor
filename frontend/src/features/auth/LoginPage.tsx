"use client";

import { ArrowRight, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";

import { Button } from "../../components/ui/Button";
import { AuthField, AuthStatus, PlannedGoogleAuth } from "./AuthFormFields";
import { AuthShell } from "./AuthShell";
import type { AuthVisualState } from "./AuthStudyCompanion";
import { submitLogin } from "./authApiClient";
import { AUTH_COPY, AUTH_FEEDBACK, AUTH_MESSAGES, INITIAL_LOGIN_FORM } from "./authContent";
import { AUTHENTICATED_HOME_ROUTE } from "./authRoutePolicy";
import { validateLogin } from "./authValidation";
import type { AuthSubmissionResult, AuthSubmissionStatus, LoginInput } from "./types";

export const LOGIN_SUCCESS_REDIRECT_DELAY_MS = 650;

type AuthFeedback = {
  detail?: string;
  title: string;
};

const getLoginFailureFeedback = (submission: Extract<AuthSubmissionResult, { ok: false }>): AuthFeedback => {
  if (submission.kind === "invalid-credentials") {
    return AUTH_FEEDBACK.login.invalidCredentials;
  }

  if (submission.kind === "verification-required") {
    return { title: AUTH_MESSAGES.emailVerificationRequired };
  }

  return AUTH_FEEDBACK.login.unavailable;
};

export const LoginPage = () => {
  const router = useRouter();
  const [form, setForm] = useState<LoginInput>(INITIAL_LOGIN_FORM);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof LoginInput, string>>>({});
  const [submissionStatus, setSubmissionStatus] = useState<AuthSubmissionStatus>("idle");
  const [submissionFeedback, setSubmissionFeedback] = useState<AuthFeedback | null>(null);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [visualState, setVisualState] = useState<AuthVisualState>("idle");
  const redirectTimerRef = useRef<number | null>(null);
  const submissionLockedRef = useRef(false);
  const isSubmitting = submissionStatus === "submitting";
  const isRedirecting = submissionStatus === "success";
  const isBusy = isSubmitting || isRedirecting;

  useEffect(() => () => {
    if (redirectTimerRef.current !== null) {
      window.clearTimeout(redirectTimerRef.current);
    }
  }, []);

  const updateField = (field: keyof LoginInput, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
    if (!submissionLockedRef.current) {
      setSubmissionStatus("idle");
      setSubmissionFeedback(null);
    }
    setVisualState(field === "email" ? "email" : "password");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submissionLockedRef.current) {
      return;
    }
    const result = validateLogin(form);

    if (!result.ok) {
      setFieldErrors(result.fieldErrors);
      setSubmissionStatus("idle");
      setSubmissionFeedback(null);
      return;
    }

    submissionLockedRef.current = true;
    setFieldErrors({});
    setSubmissionStatus("submitting");
    setSubmissionFeedback({ title: AUTH_MESSAGES.loginSubmitting });
    setVisualState("submitting");

    try {
      const submission = await submitLogin(result.values);

      if (submission.ok && submission.session) {
        setSubmissionStatus("success");
        setSubmissionFeedback({ detail: AUTH_FEEDBACK.login.redirecting, title: AUTH_FEEDBACK.login.success });
        setVisualState("success");
        redirectTimerRef.current = window.setTimeout(() => {
          redirectTimerRef.current = null;
          router.replace(AUTHENTICATED_HOME_ROUTE);
        }, LOGIN_SUCCESS_REDIRECT_DELAY_MS);
        return;
      }

      setSubmissionStatus("error");
      setSubmissionFeedback(submission.ok ? AUTH_FEEDBACK.login.unavailable : getLoginFailureFeedback(submission));
      setVisualState("error");
      submissionLockedRef.current = false;
    } catch {
      setSubmissionStatus("error");
      setSubmissionFeedback(AUTH_FEEDBACK.login.unavailable);
      setVisualState("error");
      submissionLockedRef.current = false;
    }
  };

  return (
    <AuthShell mode="login" visualState={visualState}>
      <div className="mb-8">
        <p className="auth-entrance-item text-label-sm font-bold uppercase tracking-[0.12em] text-foundation-brand" data-auth-enter="0">AI Tutor</p>
        <h1 className="auth-entrance-item mt-3 font-[var(--font-display)] text-3xl font-bold leading-tight text-foundation-ink sm:text-4xl" data-auth-enter="1">
          {AUTH_COPY.login.heading}
        </h1>
        <p className="auth-entrance-item mt-3 max-w-md text-body-md text-foundation-ink-secondary" data-auth-enter="2">{AUTH_COPY.login.intro}</p>
      </div>

      <form className="space-y-5" noValidate onSubmit={handleSubmit}>
        {submissionStatus !== "idle" && submissionFeedback && (
          <AuthStatus
            tone={
              submissionStatus === "submitting" ? "info" : submissionStatus === "error" ? "error" : "success"
            }
            {...submissionFeedback}
          />
        )}
        <div className="auth-entrance-item" data-auth-enter="3">
          <AuthField
            autoComplete="email"
            error={fieldErrors.email}
            id="login-email"
            label="อีเมล"
            onChange={(event) => updateField("email", event.target.value)}
            onFocus={() => setVisualState("email")}
            placeholder="example@email.com"
            type="email"
            value={form.email}
          />
        </div>
        <div className="auth-entrance-item" data-auth-enter="4">
          <AuthField
            autoComplete="current-password"
            error={fieldErrors.password}
            id="login-password"
            label="รหัสผ่าน"
            onChange={(event) => updateField("password", event.target.value)}
            onFocus={() => setVisualState(isPasswordVisible ? "password-visible" : "password")}
            placeholder="กรอกรหัสผ่าน"
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

        <Button className="auth-entrance-item auth-primary-submit w-full" data-auth-enter="5" isLoading={isBusy} loadingLabel={isRedirecting ? AUTH_COPY.login.redirectingLabel : AUTH_COPY.login.loadingLabel} type="submit">
          {AUTH_COPY.login.submitLabel}
          <ArrowRight aria-hidden="true" className="h-5 w-5" />
        </Button>
        <div className="auth-entrance-item" data-auth-enter="6"><PlannedGoogleAuth /></div>
      </form>

      <p className="auth-entrance-item mt-7 text-center text-body-md text-foundation-ink-secondary" data-auth-enter="7">
        {AUTH_COPY.login.footerPrompt}{" "}
        <Link className="rounded-sm font-bold text-foundation-brand transition-colors hover:text-foundation-brand-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foundation-focus" href="/register">
          {AUTH_COPY.login.footerLink}
        </Link>
      </p>
    </AuthShell>
  );
};
