import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";

import type { AuthSession } from "../auth/types";
import { HOME_CONTENT } from "./homeContent";
import { HomeStudyScene } from "./HomeStudyScene.client";
import type { HomeLanguage } from "./types";

type HomeHeroProps = {
  language: HomeLanguage;
  session?: AuthSession | null;
};

export const HomeHero = ({ language, session = null }: HomeHeroProps) => {
  const hero = HOME_CONTENT[language].hero;
  const studyPreview = HOME_CONTENT[language].studyScene;
  const isAuthenticated = session !== null;

  return (
    <section aria-labelledby="home-hero-heading" className="home-hero">
      <div className="home-hero-copy">
        <p className="home-eyebrow" data-hero-enter="eyebrow">{hero.eyebrow}</p>
        <h1 aria-label={hero.heading} id="home-hero-heading">
          {language === "en" ? <>
            <span className="home-hero-heading-line" data-hero-enter="headline-line-1">Turn your <mark>documents</mark>{" "}</span>
            <span className="home-hero-heading-line" data-hero-enter="headline-line-2">into an <mark>AI study workspace</mark>.</span>
          </> : <>
            <span className="home-hero-heading-line" data-hero-enter="headline-line-1">เปลี่ยน<mark>เอกสารของคุณ</mark>ให้เป็น</span>
            <span className="home-hero-heading-line" data-hero-enter="headline-line-2"><mark>พื้นที่เรียนกับ AI</mark></span>
          </>}
        </h1>
        <p className="home-hero-body" data-hero-enter="body">{hero.body}</p>
        <div className="home-hero-actions">
          <Link className="home-primary-action" data-hero-enter="primary-action" href={isAuthenticated ? "/documents" : "/register"}>
            {isAuthenticated ? hero.authenticatedCta : hero.guestCta}
            <ArrowRight aria-hidden="true" size={18} />
          </Link>
          <Link className="home-secondary-action" data-hero-enter="secondary-action" href={isAuthenticated ? "/dashboard" : "/login"}>
            {isAuthenticated ? hero.authenticatedSecondaryCta : hero.guestSecondaryCta}
          </Link>
        </div>
        <p className="home-supporting-line" data-hero-enter="trust-line"><CheckCircle2 aria-hidden="true" size={17} />{hero.supportingLine}</p>
      </div>
      <HomeStudyScene content={studyPreview} />
    </section>
  );
};
