import { AlertCircle, CheckCircle2, LoaderCircle } from "lucide-react";
import type { InputHTMLAttributes, ReactNode } from "react";

type AuthFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  description?: string;
  error?: string;
  label: string;
  trailingAction?: ReactNode;
};

export const AuthField = ({ description, error, id, label, trailingAction, ...props }: AuthFieldProps) => {
  const descriptionId = description && id ? `${id}-description` : undefined;
  const errorId = error && id ? `${id}-error` : undefined;
  const describedBy = [descriptionId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <label className="block text-label-md font-bold text-[#132238]" htmlFor={id}>
          {label}
        </label>
      </div>
      <div className="relative mt-2">
        <input
          aria-describedby={describedBy}
          aria-invalid={Boolean(error)}
          className="min-h-12 w-full rounded-md border border-foundation-border-control bg-foundation-surface px-4 py-3 text-body-md text-foundation-ink outline-none transition-[border-color,box-shadow] duration-control ease-standard placeholder:text-foundation-ink-muted focus:border-foundation-focus focus:ring-2 focus:ring-foundation-focus/25"
          id={id}
          {...props}
        />
        {trailingAction && <div className="absolute inset-y-0 right-1 flex items-center">{trailingAction}</div>}
      </div>
      {description && (
        <p className="mt-2 text-body-sm text-foundation-ink-muted" id={descriptionId}>
          {description}
        </p>
      )}
      {error && (
        <p className="mt-2 text-label-sm font-semibold text-foundation-error" id={errorId}>
          {error}
        </p>
      )}
    </div>
  );
};

export const AuthStatus = ({
  action,
  detail,
  title,
  tone = "success"
}: {
  action?: ReactNode;
  detail?: string;
  title: string;
  tone?: "error" | "info" | "success";
}) => {
  const toneClassNames = {
    error: "border-foundation-error/25 bg-red-50 text-foundation-error",
    info:
      "border-foundation-border-subtle bg-foundation-brand-soft text-foundation-ink",
    success: "border-foundation-success/25 bg-foundation-brand-soft text-foundation-success"
  } satisfies Record<"error" | "info" | "success", string>;
  const StatusIcon = tone === "error" ? AlertCircle : tone === "success" ? CheckCircle2 : LoaderCircle;

  return (
    <div
      className={`rounded-md border px-4 py-3 ${toneClassNames[tone]}`}
      data-tone={tone}
      role={tone === "error" ? "alert" : "status"}
    >
      <div className="flex items-start gap-3">
        <StatusIcon aria-hidden="true" className={`mt-0.5 h-5 w-5 shrink-0 ${tone === "info" ? "motion-safe:animate-spin" : ""}`} />
        <div className="min-w-0">
          <p className="text-label-md font-bold">{title}</p>
          {detail && <p className="mt-1 text-body-sm font-medium text-foundation-ink-secondary">{detail}</p>}
          {action && <div className="mt-3">{action}</div>}
        </div>
      </div>
    </div>
  );
};

export const PlannedGoogleAuth = () => {
  return (
    <button
      aria-label="ดำเนินการต่อด้วย Google (เร็ว ๆ นี้)"
      className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-md border border-foundation-border-control bg-foundation-elevated px-4 text-label-md font-bold text-foundation-ink-secondary opacity-70"
      disabled
      type="button"
    >
      <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24">
        <path d="M21.35 12.23c0-.71-.06-1.39-.18-2.05H12v3.88h5.24a4.48 4.48 0 0 1-1.94 2.94v2.52h3.15c1.84-1.69 2.9-4.18 2.9-7.29Z" fill="#4285F4" />
        <path d="M12 21.73c2.63 0 4.83-.87 6.45-2.21l-3.15-2.52c-.87.59-1.99.94-3.3.94-2.53 0-4.68-1.71-5.45-4.01H3.3v2.6A9.74 9.74 0 0 0 12 21.73Z" fill="#34A853" />
        <path d="M6.55 13.93a5.87 5.87 0 0 1 0-3.76v-2.6H3.3a9.74 9.74 0 0 0 0 8.96l3.25-2.6Z" fill="#FBBC05" />
        <path d="M12 6.16c1.43 0 2.71.49 3.72 1.46l2.79-2.79C16.83 3.27 14.63 2.27 12 2.27a9.74 9.74 0 0 0-8.7 5.3l3.25 2.6C7.32 7.87 9.47 6.16 12 6.16Z" fill="#EA4335" />
      </svg>
      <span>ดำเนินการต่อด้วย Google <span className="font-semibold">(เร็ว ๆ นี้)</span></span>
    </button>
  );
};
