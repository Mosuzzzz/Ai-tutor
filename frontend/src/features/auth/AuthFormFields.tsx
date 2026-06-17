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
        <label className="block text-label-md font-bold text-[#15181d]" htmlFor={id}>
          {label}
        </label>
        {action}
      </div>
      <input
        aria-describedby={errorId}
        aria-invalid={Boolean(error)}
        className="mt-2 min-h-12 w-full rounded-lg border border-[#e4e7eb] bg-[#f6f7f9] px-4 text-body-md text-[#15181d] outline-none transition-colors placeholder:text-[#5c636e] focus:border-[#5a4fe0] focus:ring-2 focus:ring-[#5a4fe0]/30"
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
    <div className="my-7 flex items-center gap-4 text-label-sm font-semibold text-[#5c636e]">
      <span className="h-px flex-1 bg-[#e4e7eb]" />
      <span>{children}</span>
      <span className="h-px flex-1 bg-[#e4e7eb]" />
    </div>
  );
};

export const MockSocialButton = ({ provider }: { provider: "Facebook" | "Google" }) => {
  return (
    <button
      aria-label={`${provider} ${AUTH_COPY.socialUnavailableSuffix}`}
      className="inline-flex min-h-12 items-center justify-center gap-3 rounded-lg border border-[#e4e7eb] bg-[#f6f7f9] px-4 text-label-md font-bold text-[#15181d] opacity-70"
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
  tone?: "error" | "info" | "success";
}) => {
  const toneClassNames = {
    error: "rounded-lg border border-[#f5c6c6] bg-[#fce9e9] px-4 py-3 text-label-md font-bold text-[#a11d21]",
    info: "rounded-lg border border-[#e4e7eb] bg-[#f6f7f9] px-4 py-3 text-label-md font-bold text-[#15181d]",
    success:
      "rounded-lg border border-[#5a4fe0]/40 bg-[#f6f7f9] px-4 py-3 text-label-md font-bold text-[#5c636e]"
  } satisfies Record<"error" | "info" | "success", string>;

  return (
    <p
      className={toneClassNames[tone]}
      data-tone={tone}
      role="status"
    >
      {children}
    </p>
  );
};
