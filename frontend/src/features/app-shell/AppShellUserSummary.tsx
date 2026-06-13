import { cn } from "../../lib/cn";
import type { AuthRouteRole, AuthSession } from "../auth/types";

const roleLabelByRole: Record<AuthRouteRole, string> = {
  global_admin: "ผู้ดูแลระบบ",
  student: "ผู้เรียน",
  teacher: "ครูผู้สอน",
  tenant_admin: "ผู้ดูแลพื้นที่"
};

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
  const roleLabel = roleLabelByRole[session.user.role];

  return (
    <div
      aria-label={`${ariaLabelPrefix} ${displayName}`}
      className={cn("flex min-w-0 items-center gap-3", className)}
    >
      {!compact && (
        <div className={cn("min-w-0 text-right", detailsClassName)}>
          <p className="truncate text-label-md font-bold text-on-surface">{displayName}</p>
          <p className="truncate text-label-sm text-on-surface-variant">{roleLabel}</p>
        </div>
      )}
      <div
        className={cn(
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-label-md font-bold text-on-primary",
          avatarClassName
        )}
      >
        {initial}
      </div>
    </div>
  );
};
