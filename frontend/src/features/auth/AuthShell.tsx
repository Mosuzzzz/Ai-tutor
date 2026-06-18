import Image from "next/image";
import type { ReactNode } from "react";

import { AUTH_ILLUSTRATION_IMAGE } from "./authContent";

type AuthShellProps = {
  children: ReactNode;
  mode: "login" | "register";
};

export const AuthShell = ({ children, mode }: AuthShellProps) => {
  const isRegisterMode = mode === "register";
  const visualPanelOrder = isRegisterMode ? "lg:order-2" : "lg:order-1";
  const formPanelOrder = isRegisterMode ? "lg:order-1" : "lg:order-2";
  const visualPanelMotion = isRegisterMode ? "auth-panel-enter-from-right" : "auth-panel-enter-from-left";
  const formPanelMotion = isRegisterMode ? "auth-panel-enter-from-left" : "auth-panel-enter-from-right";
  const visualLabel = isRegisterMode ? "ภาพประกอบหน้าสมัครสมาชิก" : "ภาพประกอบหน้าเข้าสู่ระบบ";

  return (
    <main className="auth-body min-h-screen bg-[#f4f7fb] px-4 py-6 text-[#132238] md:px-8 md:py-10">
      <div className="mx-auto grid min-h-[calc(100vh-80px)] w-full max-w-[1220px] overflow-hidden rounded-xl border border-[#c7cfdd] bg-white shadow-[0_24px_80px_rgba(15,35,61,0.10)] lg:grid-cols-2">
        <section
          aria-label={visualLabel}
          className={`relative hidden min-h-[660px] items-center justify-center overflow-hidden bg-white px-10 py-12 transition-[opacity,transform] duration-500 ease-out motion-reduce:transition-none lg:flex ${visualPanelOrder} ${visualPanelMotion}`}
          data-testid="auth-visual-panel"
        >
          <div className="relative h-full min-h-[560px] w-full max-w-[520px]">
            <Image
              alt=""
              className="object-contain"
              data-testid="auth-illustration"
              fill
              priority
              sizes="(min-width: 1024px) 520px, 100vw"
              src={AUTH_ILLUSTRATION_IMAGE}
            />
          </div>
        </section>

        <section
          className={`flex min-h-[660px] items-center justify-center px-5 py-10 transition-[opacity,transform] duration-500 ease-out motion-reduce:transition-none sm:px-10 ${formPanelOrder} ${formPanelMotion}`}
          data-testid="auth-form-panel"
        >
          <div className="w-full max-w-[470px]">{children}</div>
        </section>
      </div>
    </main>
  );
};
