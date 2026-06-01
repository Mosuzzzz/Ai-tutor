import { Sparkles } from "lucide-react";

type AppShellBrandProps = {
  compact?: boolean;
};

export const AppShellBrand = ({ compact = false }: AppShellBrandProps) => {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-on-primary">
        <Sparkles aria-hidden="true" className="h-6 w-6" />
      </div>
      {!compact && (
        <div>
          <h1 className="text-headline-md font-bold text-primary">AI Tutor</h1>
          <p className="text-label-sm text-on-surface-variant">Learning Platform</p>
        </div>
      )}
      {compact && <h1 className="text-headline-md font-bold text-primary">AI Tutor</h1>}
    </div>
  );
};
