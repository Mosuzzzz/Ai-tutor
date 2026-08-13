import Image from "next/image";
import Link from "next/link";

const HOME_LOGO_SOURCE = "/brand/ChatGPT Image 13 ส.ค. 2569 22_46_03.png";

export const HomeBrand = () => (
  <Link aria-label="AI Tutor" className="home-brand" href="/home">
    <Image alt="AI Tutor" height={72} priority sizes="(max-width: 640px) 118px, 144px" src={HOME_LOGO_SOURCE} width={270} />
  </Link>
);
