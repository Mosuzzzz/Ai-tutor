import { GraduationCap, ShieldCheck, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

type AuthShellProps = {
  children: ReactNode;
  mode: "login" | "register";
};

const authVisualSlides = [
  "/auth/login-slide-1.webp",
  "/auth/login-slide-2.webp",
  "/auth/login-slide-3.webp"
] as const;

export const AuthShell = ({ children, mode }: AuthShellProps) => {
  const isRegister = mode === "register";

  return (
    <main className="auth-body min-h-screen bg-[#f4f7fb] px-4 py-6 text-[#132238] md:px-8 md:py-10">
      <div className="mx-auto grid min-h-[calc(100vh-80px)] w-full max-w-[1220px] overflow-hidden rounded-xl border border-[#c7cfdd] bg-white shadow-[0_24px_80px_rgba(15,35,61,0.10)] lg:grid-cols-2">
        <section className="relative hidden min-h-[680px] overflow-hidden bg-[#0f243d] p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div
            aria-hidden="true"
            className="animate-auth-carousel absolute inset-0"
            data-testid="auth-visual-carousel"
          >
            {authVisualSlides.map((slide) => (
              <Image
                alt=""
                className="auth-carousel-slide absolute inset-0 h-full w-full object-cover brightness-[0.52] contrast-[0.92] saturate-[0.85]"
                data-testid="auth-visual-slide"
                fill
                key={slide}
                priority={slide === authVisualSlides[0]}
                sizes="(min-width: 1024px) 50vw, 100vw"
                src={slide}
              />
            ))}
          </div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(244,179,91,0.22),transparent_28%),linear-gradient(140deg,rgba(7,17,31,0.92),rgba(9,30,52,0.74)_45%,rgba(4,12,24,0.95))]" />
          <div className="relative z-10">
            <Link
              className="inline-flex items-center gap-3 rounded-lg bg-white/10 px-4 py-3 text-label-md font-bold text-white ring-1 ring-white/15 backdrop-blur transition-colors hover:bg-white/15"
              href="/"
            >
              <Sparkles aria-hidden="true" className="h-5 w-5 text-[#f4b35b]" />
              AI Tutor Platform
            </Link>
          </div>

          <div className="relative z-10 max-w-md">
            <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-[#f4b35b] text-[#10253f] shadow-[0_16px_40px_rgba(244,179,91,0.28)]">
              {isRegister ? (
                <GraduationCap aria-hidden="true" className="h-7 w-7" />
              ) : (
                <ShieldCheck aria-hidden="true" className="h-7 w-7" />
              )}
            </div>
            <p className="auth-display text-[44px] font-bold leading-tight text-white">
              {isRegister ? "Empower Your Learning" : "Learn with clarity, safely."}
            </p>
            <p className="mt-5 text-body-lg text-[#d9e5f6]">
              {isRegister
                ? "เลือกเส้นทางของคุณ แล้วเริ่มสร้างพื้นที่เรียนรู้ที่ AI ช่วยจัดระเบียบทุกบทเรียน"
                : "พื้นที่เข้าสู่ระบบที่เรียบง่าย ปลอดภัย และพร้อมเชื่อม backend เมื่อทีม API เปิดใช้งาน"}
            </p>
          </div>

          <div className="relative z-10 grid grid-cols-2 gap-3">
            <AuthInsight label="Learning path" value="Personalized AI" />
            <AuthInsight label="Study mode" value="Safe by design" />
          </div>
        </section>

        <section className="flex min-h-[680px] items-center justify-center px-5 py-10 sm:px-10">
          <div className="w-full max-w-[470px]">{children}</div>
        </section>
      </div>
    </main>
  );
};

const AuthInsight = ({ label, value }: { label: string; value: string }) => {
  return (
    <div className="rounded-lg border border-white/15 bg-white/10 p-4 backdrop-blur">
      <p className="text-label-sm uppercase tracking-[0.08em] text-[#f6d39a]">{label}</p>
      <p className="mt-1 text-label-md font-bold text-white">{value}</p>
    </div>
  );
};
