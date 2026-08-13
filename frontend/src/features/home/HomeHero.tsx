import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";

import type { AuthSession } from "../auth/types";
import { HOME_CONTENT } from "./homeContent";
import type { HomeLanguage } from "./types";

type HomeHeroProps = {
  language: HomeLanguage;
  session?: AuthSession | null;
};

export const HomeHero = ({ language, session = null }: HomeHeroProps) => {
  const hero = HOME_CONTENT[language].hero;
  const isAuthenticated = session !== null;

  return (
    <section aria-labelledby="home-hero-heading" className="home-hero">
      <div className="home-hero-copy">
        <p className="home-eyebrow">{hero.eyebrow}</p>
        <h1 id="home-hero-heading">{hero.heading}</h1>
        <p className="home-hero-body">{hero.body}</p>
        <Link className="home-primary-action" href={isAuthenticated ? "/documents" : "/register"}>
          {isAuthenticated ? hero.authenticatedCta : hero.guestCta}
          <ArrowRight aria-hidden="true" size={18} />
        </Link>
        <p className="home-supporting-line"><CheckCircle2 aria-hidden="true" size={17} />{hero.supportingLine}</p>
      </div>
      <div className="home-hero-image-wrap">
        <Image
          alt="Learner studying with an AI Tutor"
          className="home-hero-image"
          height={1080}
          priority
          sizes="(max-width: 1023px) calc(100vw - 2rem), 50vw"
          src="/home/ChatGPT Image 13 ส.ค. 2569 22_15_52.png"
          width={1440}
        />
      </div>
    </section>
  );
};
