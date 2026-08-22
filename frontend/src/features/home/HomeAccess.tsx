import Link from "next/link";
import { ArrowRight, LogIn } from "lucide-react";

import type { AuthSession } from "../auth/types";
import { HOME_CONTENT } from "./homeContent";
import { HomeSectionHeading } from "./HomeSectionHeading";
import type { HomeLanguage } from "./types";

export const HomeAccess = ({ language, session }: { language: HomeLanguage; session: AuthSession | null }) => {
  const content = HOME_CONTENT[language].access;
  const hero = HOME_CONTENT[language].hero;
  return <section className="home-section home-access-section"><HomeSectionHeading content={content} /><div className="home-access-grid">
    <article><span className="home-access-icon"><ArrowRight aria-hidden="true" /></span><h3>{content.guestTitle}</h3><p>{content.guestBody}</p><Link href={session ? "/documents" : "/register"}>{session ? hero.authenticatedCta : content.guestCta}<ArrowRight aria-hidden="true" size={17} /></Link></article>
    <article><span className="home-access-icon"><LogIn aria-hidden="true" /></span><h3>{content.memberTitle}</h3><p>{content.memberBody}</p><Link href={session ? "/dashboard" : "/login"}>{session ? hero.authenticatedSecondaryCta : HOME_CONTENT[language].navbar.loginLabel}<ArrowRight aria-hidden="true" size={17} /></Link></article>
  </div></section>;
};
