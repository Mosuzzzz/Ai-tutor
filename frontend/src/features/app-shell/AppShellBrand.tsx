import { Sparkles } from "lucide-react";

type AppShellBrandProps = {
  compact?: boolean;
};

export const AppShellBrand = ({ compact = false }: AppShellBrandProps) => {
  return (
    <div aria-label="AI Tutor Learning Platform" className="flex min-w-0 items-center gap-3">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary text-on-primary shadow-control">
        <Sparkles aria-hidden="true" className="h-5 w-5" />
      </div>
      {!compact && (
        <div className="min-w-0">
          <p className="truncate text-headline-md font-bold leading-tight text-primary">AI Tutor</p>
          <p className="text-label-sm text-on-surface-variant">Learning Platform</p>
        </div>
      )}
      {compact && <p className="truncate text-headline-md font-bold leading-tight text-primary">AI Tutor</p>}
    </div>
  );
};
