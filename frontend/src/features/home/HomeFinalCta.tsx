import Link from "next/link";
import { ArrowRight } from "lucide-react";

import type { AuthSession } from "../auth/types";
import { HOME_CONTENT } from "./homeContent";
import type { HomeLanguage } from "./types";

export const HomeFinalCta = ({ language, session }: { language: HomeLanguage; session: AuthSession | null }) => {
  const content = HOME_CONTENT[language].finalCta;
  return <section className="home-final-cta"><div><h2>{content.title}</h2><p>{content.body}</p></div><Link href={session ? "/documents" : "/register"}>{session ? content.authenticatedCta : content.guestCta}<ArrowRight aria-hidden="true" /></Link></section>;
};
