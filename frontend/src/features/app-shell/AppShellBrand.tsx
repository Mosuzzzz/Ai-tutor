import { AiTutorLogo } from "../../components/brand/AiTutorLogo";

type AppShellBrandProps = {
  compact?: boolean;
};

export const AppShellBrand = ({ compact = false }: AppShellBrandProps) => {
  return (
    <div aria-label="AI Tutor Learning Platform" className="flex w-full min-w-0 items-center justify-center">
      <span className="sr-only">AI Tutor</span>
      <span className="sr-only">Learning Platform</span>
      <AiTutorLogo
        className={compact ? "h-10 w-[124px] shrink-0" : "h-[88px] w-full max-w-[220px] shrink-0 rounded-md"}
        priority
        sizes={compact ? "124px" : "220px"}
      />
    </div>
  );
};
