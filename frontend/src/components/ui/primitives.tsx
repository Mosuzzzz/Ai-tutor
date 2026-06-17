import type { LucideIcon } from "lucide-react";
import { Quote } from "lucide-react";
import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "../../lib/cn";

/**
 * Shared primitives for "The Source Desk" — Linear/Vercel-clean surfaces.
 * Hairlines over shadows, calm neutrals, mono for data. All presentational
 * (no hooks) so they stay server-component safe.
 */

/* ── PageHeader ─────────────────────────────────────────────────────────── */
type PageHeaderProps = {
  title: string;
  description?: string;
  eyebrow?: string;
  actions?: ReactNode;
};

export const PageHeader = ({ title, description, eyebrow, actions }: PageHeaderProps) => (
  <div className="flex flex-col gap-4 border-b border-outline-variant pb-5 sm:flex-row sm:items-end sm:justify-between">
    <div className="min-w-0">
      {eyebrow ? (
        <p className="mb-1 font-mono text-label-sm uppercase tracking-wide text-on-surface-variant">{eyebrow}</p>
      ) : null}
      <h1 className="text-headline-lg-mobile text-on-surface md:text-headline-lg">{title}</h1>
      {description ? (
        <p className="mt-1.5 max-w-2xl text-body-md text-on-surface-variant">{description}</p>
      ) : null}
    </div>
    {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
  </div>
);

/* ── Badge ──────────────────────────────────────────────────────────────── */
type BadgeTone = "neutral" | "iris" | "success" | "warning" | "danger" | "info";

const badgeToneClassNames: Record<BadgeTone, string> = {
  neutral: "border-outline-variant bg-surface-container text-on-surface-variant",
  iris: "border-primary-fixed-dim bg-primary-container text-on-primary-container",
  success: "border-success/30 bg-success-container text-on-success-container",
  warning: "border-warning/30 bg-warning-container text-on-warning-container",
  danger: "border-error/30 bg-error-container text-on-error-container",
  info: "border-info/30 bg-info-container text-on-info-container"
};

type BadgeProps = {
  children: ReactNode;
  tone?: BadgeTone;
  className?: string;
};

export const Badge = ({ children, tone = "neutral", className }: BadgeProps) => (
  <span
    className={cn(
      "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-label-sm font-medium",
      badgeToneClassNames[tone],
      className
    )}
  >
    {children}
  </span>
);

/* ── StatusPill ─ file pipeline state (pending|processing|ready|error) ────── */
const fileStatusConfig: Record<string, { tone: BadgeTone; label: string; pulse?: boolean }> = {
  pending: { tone: "neutral", label: "รอประมวลผล" },
  processing: { tone: "info", label: "กำลังประมวลผล", pulse: true },
  ready: { tone: "success", label: "พร้อมใช้งาน" },
  error: { tone: "danger", label: "ผิดพลาด" }
};

export const StatusPill = ({ status }: { status: string }) => {
  const config = fileStatusConfig[status] ?? { tone: "neutral" as BadgeTone, label: status };
  return (
    <Badge tone={config.tone}>
      <span
        aria-hidden="true"
        className={cn("h-1.5 w-1.5 rounded-full bg-current", config.pulse && "animate-pulse")}
      />
      {config.label}
    </Badge>
  );
};

/* ── Stat ─ a single metric, value set in mono for the "data" texture ─────── */
type StatProps = {
  label: string;
  value: string;
  helper?: string;
  icon?: LucideIcon;
};

export const Stat = ({ label, value, helper, icon: Icon }: StatProps) => (
  <div className="rounded-lg border border-outline-variant bg-surface-container-lowest p-4">
    <div className="flex items-center justify-between gap-3">
      <p className="text-label-sm font-medium text-on-surface-variant">{label}</p>
      {Icon ? <Icon aria-hidden="true" className="h-4 w-4 text-on-surface-variant" /> : null}
    </div>
    <p className="mt-3 font-mono text-display-lg font-semibold tracking-tight text-on-surface" data-mono>
      {value}
    </p>
    {helper ? <p className="mt-1 text-label-sm text-on-surface-variant">{helper}</p> : null}
  </div>
);

/* ── EmptyState ───────────────────────────────────────────────────────────── */
type EmptyStateProps = {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
};

export const EmptyState = ({ icon: Icon, title, description, action, className }: EmptyStateProps) => (
  <div
    className={cn(
      "flex flex-col items-center justify-center rounded-lg border border-dashed border-outline px-6 py-14 text-center",
      className
    )}
  >
    {Icon ? (
      <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface-variant">
        <Icon aria-hidden="true" className="h-5 w-5" />
      </span>
    ) : null}
    <h3 className="text-headline-md text-on-surface">{title}</h3>
    {description ? (
      <p className="mt-1.5 max-w-md text-body-md text-on-surface-variant">{description}</p>
    ) : null}
    {action ? <div className="mt-5">{action}</div> : null}
  </div>
);

/* ── Skeleton ─────────────────────────────────────────────────────────────── */
export const Skeleton = ({ className }: { className?: string }) => (
  <div
    aria-hidden="true"
    className={cn("animate-pulse rounded-md bg-surface-container-high", className)}
  />
);

/* ── SectionCard ─ titled hairline panel used across feature pages ────────── */
type SectionCardProps = HTMLAttributes<HTMLElement> & {
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  bodyClassName?: string;
};

export const SectionCard = ({
  title,
  description,
  actions,
  children,
  className,
  bodyClassName,
  ...props
}: SectionCardProps) => (
  <section
    className={cn("rounded-lg border border-outline-variant bg-surface-container-lowest", className)}
    {...props}
  >
    {title || actions ? (
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-outline-variant px-5 py-4">
        <div className="min-w-0">
          {title ? <h2 className="text-headline-md text-on-surface">{title}</h2> : null}
          {description ? (
            <p className="mt-0.5 text-label-md text-on-surface-variant">{description}</p>
          ) : null}
        </div>
        {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
      </div>
    ) : null}
    <div className={cn("p-5", bodyClassName)}>{children}</div>
  </section>
);

/* ── SourceRef ─ THE SIGNATURE ────────────────────────────────────────────
 * Every AI output in this product is grounded in the user's own documents.
 * This chip surfaces that citation with the highlighter "mark" motif — the one
 * place warmth is spent. Grounded in real data (exam.questions[].citation,
 * chat answer sources). */
type SourceRefProps = {
  label: string;
  className?: string;
};

export const SourceRef = ({ label, className }: SourceRefProps) => (
  <span
    className={cn(
      "inline-flex max-w-full items-center gap-1.5 rounded border border-accent-warm-container bg-accent-warm-container/40 px-2 py-0.5 align-middle text-label-sm font-medium text-on-accent-warm-container",
      className
    )}
  >
    <Quote aria-hidden="true" className="h-3 w-3 shrink-0 text-accent-warm" />
    <span className="source-mark truncate">{label}</span>
  </span>
);
