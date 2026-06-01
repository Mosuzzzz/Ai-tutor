import type { InputHTMLAttributes, ReactNode } from "react";

import { AUTH_COPY } from "./authContent";

type AuthFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  action?: ReactNode;
  error?: string;
  label: string;
};

export const AuthField = ({ action, error, id, label, ...props }: AuthFieldProps) => {
  const errorId = error && id ? `${id}-error` : undefined;

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <label className="block text-label-md font-bold text-[#132238]" htmlFor={id}>
          {label}
        </label>
        {action}
      </div>
      <input
        aria-describedby={errorId}
        aria-invalid={Boolean(error)}
        className="mt-2 min-h-12 w-full rounded-lg border border-[#bcc5d6] bg-[#f8f9ff] px-4 text-body-md text-[#132238] outline-none transition-colors placeholder:text-[#6d7483] focus:border-[#f4b35b] focus:ring-2 focus:ring-[#f4b35b]/30"
        id={id}
        {...props}
      />
      {error && (
        <p className="mt-2 text-label-sm text-error" id={errorId}>
          {error}
        </p>
      )}
    </div>
  );
};

export const AuthDivider = ({ children }: { children: ReactNode }) => {
  return (
    <div className="my-7 flex items-center gap-4 text-label-sm font-semibold text-[#6d7483]">
      <span className="h-px flex-1 bg-[#d8deea]" />
      <span>{children}</span>
      <span className="h-px flex-1 bg-[#d8deea]" />
    </div>
  );
};

export const MockSocialButton = ({ provider }: { provider: "Facebook" | "Google" }) => {
  return (
    <button
      aria-label={`${provider} ${AUTH_COPY.socialUnavailableSuffix}`}
      className="inline-flex min-h-12 items-center justify-center gap-3 rounded-lg border border-[#c7cfdd] bg-[#f8f9ff] px-4 text-label-md font-bold text-[#132238] opacity-70"
      disabled
      type="button"
    >
      <span
        aria-hidden="true"
        className="flex h-6 w-6 items-center justify-center rounded bg-white text-sm shadow-sm"
      >
        {provider === "Google" ? "G" : "f"}
      </span>
      {provider}
    </button>
  );
};

export const MockStatus = ({
  children,
  tone = "success"
}: {
  children: ReactNode;
  tone?: "error" | "success";
}) => {
  return (
    <p
      className={
        tone === "error"
          ? "rounded-lg border border-[#f2b8b5] bg-[#fff8f7] px-4 py-3 text-label-md font-bold text-[#8c1d18]"
          : "rounded-lg border border-[#f4b35b]/40 bg-[#fff7e8] px-4 py-3 text-label-md font-bold text-[#704512]"
      }
      role="status"
    >
      {children}
    </p>
  );
};
