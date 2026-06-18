"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { FormEvent } from "react";

import { AiTutorLogo } from "../../components/brand/AiTutorLogo";
import { Button } from "../../components/ui/Button";
import { AuthDivider, AuthField, MockSocialButton, MockStatus } from "./AuthFormFields";
import { AuthShell } from "./AuthShell";
import { submitLogin } from "./authApiClient";
import { AUTH_COPY, AUTH_MESSAGES, INITIAL_LOGIN_FORM } from "./authContent";
import { getDefaultRouteForRole } from "./authRoutePolicy";
import { validateLogin } from "./authValidation";
import type { AuthSubmissionStatus, LoginInput } from "./types";

export const LoginPage = () => {
  const router = useRouter();
  const [form, setForm] = useState<LoginInput>(INITIAL_LOGIN_FORM);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof LoginInput, string>>>({});
  const [submissionStatus, setSubmissionStatus] = useState<AuthSubmissionStatus>("idle");
  const [submissionMessage, setSubmissionMessage] = useState("");
  const isSubmitting = submissionStatus === "submitting";

  const updateField = (field: keyof LoginInput, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
    setSubmissionStatus("idle");
    setSubmissionMessage("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = validateLogin(form);

    if (!result.ok) {
      setFieldErrors(result.fieldErrors);
      setSubmissionStatus("idle");
      setSubmissionMessage("");
      return;
    }

    setFieldErrors({});
    setSubmissionStatus("submitting");
    setSubmissionMessage(AUTH_MESSAGES.loginSubmitting);

    try {
      const submission = await submitLogin(result.values);

      setSubmissionStatus(submission.ok ? "success" : "error");
      setSubmissionMessage(submission.message);

      if (submission.ok && submission.session) {
        router.replace(getDefaultRouteForRole(submission.session.user.role));
      }
    } catch {
      setSubmissionStatus("error");
      setSubmissionMessage(AUTH_MESSAGES.genericError);
    }
  };

  return (
    <AuthShell mode="login">
      <div className="mb-10 text-center">
        <div className="mb-5 flex justify-center">
          <AiTutorLogo className="h-24 w-full max-w-[240px] rounded-md" priority sizes="240px" />
        </div>
        <h1 className="sr-only">
          {AUTH_COPY.login.heading}
        </h1>
        <p className="mt-3 text-body-lg text-[#596273]">{AUTH_COPY.login.intro}</p>
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
        <AuthField
          autoComplete="email"
          error={fieldErrors.email}
          id="login-email"
          label="อีเมล"
          onChange={(event) => updateField("email", event.target.value)}
          placeholder="example@email.com"
          type="email"
          value={form.email}
        />
        <AuthField
          action={
            <button className="text-label-sm font-bold text-[#a9660a]" type="button">
              {AUTH_COPY.login.forgotPassword}
            </button>
          }
          autoComplete="current-password"
          error={fieldErrors.password}
          id="login-password"
          label="รหัสผ่าน"
          onChange={(event) => updateField("password", event.target.value)}
          placeholder="อย่างน้อย 8 ตัวอักษร"
          type="password"
          value={form.password}
        />

        <Button className="w-full bg-[#10253f] text-white hover:bg-[#18395e]" disabled={isSubmitting} type="submit">
          {AUTH_COPY.login.submitLabel}
          <ArrowRight aria-hidden="true" className="h-5 w-5" />
        </Button>
      </form>

      <AuthDivider>{AUTH_COPY.login.divider}</AuthDivider>

      <div className="grid gap-3 sm:grid-cols-2">
        <MockSocialButton provider="Google" />
        <MockSocialButton provider="Facebook" />
      </div>

      <p className="mt-8 text-center text-body-md text-[#596273]">
        {AUTH_COPY.login.footerPrompt}{" "}
        <Link className="font-bold text-[#a9660a] hover:text-[#704512]" href="/register">
          {AUTH_COPY.login.footerLink}
        </Link>
      </p>
    </AuthShell>
  );
};
