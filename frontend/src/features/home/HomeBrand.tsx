import Image from "next/image";
import Link from "next/link";

const HOME_LOGO_SOURCE = "/brand/ai-tutor-wordmark-green.png";

export const HomeBrand = () => (
  <Link aria-label="AI Tutor home" className="home-brand" href="/home">
    <Image alt="" height={120} priority sizes="(max-width: 640px) 112px, 144px" src={HOME_LOGO_SOURCE} width={360} />
  </Link>
);
