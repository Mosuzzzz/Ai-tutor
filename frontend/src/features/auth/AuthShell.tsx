import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { AuthStudyCompanion, type AuthVisualState } from "./AuthStudyCompanion";
import { AUTH_COPY } from "./authContent";

type AuthShellProps = {
  children: ReactNode;
  mode: "login" | "register";
  visualState?: AuthVisualState;
};

export const AuthShell = ({ children, mode, visualState = "idle" }: AuthShellProps) => {
  const visualLabel = mode === "register" ? "ภาพประกอบขั้นตอนเริ่มต้นพื้นที่เรียน" : "ภาพประกอบพื้นที่เรียน AI Tutor";

  return (
    <main className="min-h-screen bg-foundation-canvas px-4 py-4 text-foundation-ink sm:px-6 sm:py-6 lg:px-10 lg:py-8">
      <div className="mx-auto w-full max-w-[1120px]">
        <header className="flex min-h-11 items-center justify-between gap-4">
          <Link aria-label="AI Tutor home" className="inline-flex w-32 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foundation-focus focus-visible:ring-offset-4 focus-visible:ring-offset-foundation-canvas sm:w-36" href="/home">
            <Image alt="" height={120} priority sizes="(max-width: 640px) 128px, 144px" src="/brand/ai-tutor-wordmark-green.png" width={360} />
          </Link>
          <Link className="inline-flex min-h-11 items-center rounded-md px-3 text-label-md font-bold text-foundation-ink-secondary transition-colors duration-control ease-standard hover:bg-foundation-brand-soft hover:text-foundation-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foundation-focus focus-visible:ring-offset-2 focus-visible:ring-offset-foundation-canvas" href="/home">
            {AUTH_COPY.common.backHomeLabel}
          </Link>
        </header>

        <div className="mt-5 grid lg:mt-8 lg:min-h-[650px] lg:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)]">
          <section
            className="flex items-center px-1 py-8 sm:px-7 sm:py-12 lg:order-1 lg:px-10"
            data-testid="auth-form-panel"
          >
            <div className="w-full max-w-[440px]">{children}</div>
          </section>

          <section
            aria-label={visualLabel}
            className="mt-2 hidden overflow-hidden rounded-lg border border-foundation-border-subtle bg-foundation-brand-soft/70 px-5 py-8 md:flex md:min-h-[430px] md:items-center md:justify-center lg:order-2 lg:mt-0 lg:rounded-l-none lg:border-y-0 lg:border-r-0 lg:px-7 lg:py-10"
            data-testid="auth-visual-panel"
          >
            <div className="w-full max-w-[34rem]">
              <p className="text-label-sm font-bold uppercase tracking-[0.12em] text-foundation-brand">AI Tutor</p>
              <h2 className="mt-3 max-w-sm font-[var(--font-display)] text-2xl font-bold leading-tight text-foundation-ink">
                เริ่มจากเนื้อหาของคุณ แล้วทบทวนอย่างมีจุดหมาย
              </h2>
              <AuthStudyCompanion mode={mode} state={visualState} />
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};
