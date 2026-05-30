"use client";

import { ArrowRight, GraduationCap } from "lucide-react";
import Link from "next/link";
import { FormEvent, useState } from "react";

import { Button } from "../../components/ui/Button";
import { AuthDivider, AuthField, MockSocialButton, MockStatus } from "./AuthFormFields";
import { AuthShell } from "./AuthShell";
import { validateLogin } from "./authValidation";

type LoginFormState = {
  email: string;
  password: string;
};

const initialLoginForm: LoginFormState = {
  email: "",
  password: ""
};

export const LoginPage = () => {
  const [form, setForm] = useState<LoginFormState>(initialLoginForm);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof LoginFormState, string>>>({});
  const [submitted, setSubmitted] = useState(false);

  function updateField(field: keyof LoginFormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
    setSubmitted(false);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = validateLogin(form);

    if (!result.ok) {
      setFieldErrors(result.fieldErrors);
      setSubmitted(false);
      return;
    }

    setFieldErrors({});
    setSubmitted(true);
  }

  return (
    <AuthShell mode="login">
      <div className="mb-10 text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-xl bg-[#10253f] text-[#f4b35b] shadow-[0_18px_44px_rgba(16,37,63,0.18)]">
          <GraduationCap aria-hidden="true" className="h-8 w-8" />
        </div>
        <h1 className="auth-display text-[44px] font-bold leading-tight text-[#10253f]">AI Tutor</h1>
        <p className="mt-3 text-body-lg text-[#596273]">เข้าสู่ระบบเพื่อดำเนินการต่อ</p>
      </div>

      <form className="space-y-5" noValidate onSubmit={handleSubmit}>
        {submitted && <MockStatus>เข้าสู่ระบบสำเร็จในโหมด mock</MockStatus>}
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
              ลืมรหัสผ่าน?
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

        <Button className="w-full bg-[#10253f] text-white hover:bg-[#18395e]" type="submit">
          เข้าสู่ระบบ
          <ArrowRight aria-hidden="true" className="h-5 w-5" />
        </Button>
      </form>

      <AuthDivider>หรือเข้าสู่ระบบด้วย</AuthDivider>

      <div className="grid gap-3 sm:grid-cols-2">
        <MockSocialButton provider="Google" />
        <MockSocialButton provider="Facebook" />
      </div>

      <p className="mt-8 text-center text-body-md text-[#596273]">
        ยังไม่มีบัญชี?{" "}
        <Link className="font-bold text-[#a9660a] hover:text-[#704512]" href="/register">
          สมัครสมาชิก
        </Link>
      </p>
    </AuthShell>
  );
};
