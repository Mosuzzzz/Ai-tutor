import Image from "next/image";
import Link from "next/link";

export const ProductBrand = () => (
  <Link aria-label="AI Tutor home" className="product-brand" href="/home">
    <Image alt="" height={120} priority sizes="112px" src="/brand/ai-tutor-wordmark-green.png" width={360} />
  </Link>
);
