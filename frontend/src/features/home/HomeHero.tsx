import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";

import type { AuthSession } from "../auth/types";
import { HOME_CONTENT } from "./homeContent";
import { HomeStudyPreview } from "./HomeStudyPreview";
import type { HomeLanguage } from "./types";

type HomeHeroProps = {
  language: HomeLanguage;
  session?: AuthSession | null;
};

export const HomeHero = ({ language, session = null }: HomeHeroProps) => {
  const hero = HOME_CONTENT[language].hero;
  const studyPreview = HOME_CONTENT[language].studyPreview;
  const isAuthenticated = session !== null;

  return (
    <section aria-labelledby="home-hero-heading" className="home-hero">
      <div className="home-hero-copy">
        <p className="home-eyebrow">{hero.eyebrow}</p>
        <h1 id="home-hero-heading">{hero.heading}</h1>
        <p className="home-hero-body">{hero.body}</p>
        <div className="home-hero-actions">
          <Link className="home-primary-action" href={isAuthenticated ? "/documents" : "/register"}>
            {isAuthenticated ? hero.authenticatedCta : hero.guestCta}
            <ArrowRight aria-hidden="true" size={18} />
          </Link>
          <Link className="home-secondary-action" href={isAuthenticated ? "/dashboard" : "/login"}>
            {isAuthenticated ? hero.authenticatedSecondaryCta : hero.guestSecondaryCta}
          </Link>
        </div>
        <p className="home-supporting-line"><CheckCircle2 aria-hidden="true" size={17} />{hero.supportingLine}</p>
      </div>
      <HomeStudyPreview content={studyPreview} />
    </section>
  );
};
