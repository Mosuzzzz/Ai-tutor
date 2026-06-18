import Image from "next/image";

import { cn } from "../../lib/cn";

type AiTutorLogoProps = {
  className?: string;
  imageClassName?: string;
  priority?: boolean;
  sizes?: string;
};

export const AI_TUTOR_LOGO_ALT = "AI Tutor Learning Platform";

export const AiTutorLogo = ({
  className,
  imageClassName,
  priority = false,
  sizes = "(max-width: 768px) 180px, 240px"
}: AiTutorLogoProps) => {
  return (
    <div className={cn("flex items-center justify-center overflow-hidden bg-white", className)}>
      <Image
        alt={AI_TUTOR_LOGO_ALT}
        className={cn("h-full w-full object-contain", imageClassName)}
        height={401}
        priority={priority}
        sizes={sizes}
        src="/brand/ai-tutor-logo-fit.png"
        width={909}
      />
    </div>
  );
};
