import { Sparkles } from "lucide-react";

type AppShellBrandProps = {
  compact?: boolean;
};

export const AppShellBrand = ({ compact = false }: AppShellBrandProps) => {
  return (
    <div aria-label="AI Tutor Learning Platform" className="flex min-w-0 items-center gap-2.5">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary text-on-primary">
        <Sparkles aria-hidden="true" className="h-[18px] w-[18px]" />
      </div>
      {!compact && (
        <div className="min-w-0 leading-tight">
          <p className="truncate text-label-md font-semibold text-on-surface">AI Tutor</p>
          <p className="font-mono text-label-sm uppercase tracking-wide text-on-surface-variant">Source Desk</p>
        </div>
      )}
      {compact && <p className="truncate text-label-md font-semibold text-on-surface">AI Tutor</p>}
    </div>
  );
};
