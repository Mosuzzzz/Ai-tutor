import { GraduationCap, ShieldCheck, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { AUTH_COPY, AUTH_VISUAL_SLIDES } from "./authContent";

type AuthShellProps = {
  children: ReactNode;
  mode: "login" | "register";
};

export const AuthShell = ({ children, mode }: AuthShellProps) => {
  const isRegister = mode === "register";
  const shellCopy = isRegister ? AUTH_COPY.register : AUTH_COPY.login;

  return (
    <main className="auth-body min-h-screen bg-[#f6f7f9] px-4 py-6 text-[#15181d] md:px-8 md:py-10">
      <div className="mx-auto grid min-h-[calc(100vh-80px)] w-full max-w-[1220px] overflow-hidden rounded-xl border border-[#e4e7eb] bg-white shadow-[0_24px_80px_rgba(15,35,61,0.10)] lg:grid-cols-2">
        <section className="relative hidden min-h-[680px] overflow-hidden bg-[#15181d] p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div
            aria-hidden="true"
            className="animate-auth-carousel absolute inset-0"
            data-testid="auth-visual-carousel"
          >
            {AUTH_VISUAL_SLIDES.map((slide) => (
              <Image
                alt=""
                className="auth-carousel-slide absolute inset-0 h-full w-full object-cover brightness-[0.52] contrast-[0.92] saturate-[0.85]"
                data-testid="auth-visual-slide"
                fill
                key={slide}
                priority={slide === AUTH_VISUAL_SLIDES[0]}
                sizes="(min-width: 1024px) 50vw, 100vw"
                src={slide}
              />
            ))}
          </div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(90,79,224,0.20),transparent_30%),linear-gradient(140deg,rgba(21,24,29,0.94),rgba(30,33,40,0.72)_45%,rgba(15,17,21,0.96))]" />
          <div className="relative z-10">
            <Link
              className="inline-flex items-center gap-3 rounded-lg bg-white/10 px-4 py-3 text-label-md font-bold text-white ring-1 ring-white/15 backdrop-blur transition-colors hover:bg-white/15"
              href="/"
            >
              <Sparkles aria-hidden="true" className="h-5 w-5 text-[#5a4fe0]" />
              AI Tutor Platform
            </Link>
          </div>

          <div className="relative z-10 max-w-md">
            <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-[#5a4fe0] text-white shadow-[0_16px_40px_rgba(90,79,224,0.32)]">
              {isRegister ? (
                <GraduationCap aria-hidden="true" className="h-7 w-7" />
              ) : (
                <ShieldCheck aria-hidden="true" className="h-7 w-7" />
              )}
            </div>
            <p className="auth-display text-[44px] font-bold leading-tight text-white">
              {shellCopy.shellHeadline}
            </p>
            <p className="mt-5 text-body-lg text-[#e4e7eb]">
              {shellCopy.shellDescription}
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
      <p className="text-label-sm uppercase tracking-[0.08em] text-[#c7c3f5]">{label}</p>
      <p className="mt-1 text-label-md font-bold text-white">{value}</p>
    </div>
  );
};
