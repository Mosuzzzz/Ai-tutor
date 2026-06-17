import { cn } from "../../lib/cn";
import type { AuthSession } from "../auth/types";

const accountContextLabel = "พื้นที่เรียนของฉัน";

type AppShellUserSummaryProps = {
  ariaLabelPrefix?: string;
  avatarClassName?: string;
  className?: string;
  compact?: boolean;
  detailsClassName?: string;
  session: AuthSession;
};

export const AppShellUserSummary = ({
  ariaLabelPrefix = "บัญชีผู้ใช้",
  avatarClassName,
  className,
  compact = false,
  detailsClassName,
  session
}: AppShellUserSummaryProps) => {
  const displayName = session.user.displayName?.trim() || session.user.email;
  const initial = displayName.charAt(0).toLocaleUpperCase("th-TH");

  return (
    <div
      aria-label={`${ariaLabelPrefix} ${displayName}`}
      className={cn("flex min-w-0 items-center gap-3", className)}
    >
      {!compact && (
        <div className={cn("min-w-0 text-right", detailsClassName)}>
          <p className="truncate text-label-md font-semibold text-on-surface">{displayName}</p>
          <p className="truncate text-label-sm text-on-surface-variant">{accountContextLabel}</p>
        </div>
      )}
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary text-label-md font-semibold text-on-primary",
          avatarClassName
        )}
      >
        {initial}
      </div>
    </div>
  );
};
