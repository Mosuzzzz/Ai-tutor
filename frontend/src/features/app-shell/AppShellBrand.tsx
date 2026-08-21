import Image from "next/image";

type AppShellBrandProps = {
  compact?: boolean;
};

export const AppShellBrand = ({ compact = false }: AppShellBrandProps) => {
  return (
    <Image
      alt="AI Tutor"
      className={compact ? "h-auto w-[108px] shrink-0" : "h-auto w-[176px] shrink-0"}
      height={96}
      priority
      sizes={compact ? "108px" : "176px"}
      src="/brand/ai-tutor-wordmark-green.png"
      width={440}
    />
  );
};
