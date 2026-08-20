import { BookOpenCheck, BrainCircuit, ChartNoAxesCombined, FileQuestion } from "lucide-react";

import { HOME_CONTENT } from "./homeContent";
import { HomeSectionHeading } from "./HomeSectionHeading";
import type { HomeLanguage } from "./types";

type HomeFeatureGridProps = {
  language: HomeLanguage;
};

const featureIcons = [BookOpenCheck, BrainCircuit, FileQuestion, ChartNoAxesCombined];

const featureSectionLabels: Record<HomeLanguage, string> = {
  en: "Learning features",
  th: "ฟีเจอร์การเรียนรู้"
};

export const HomeFeatureGrid = ({ language }: HomeFeatureGridProps) => {
  const content = HOME_CONTENT[language];

  return (
    <section aria-label={featureSectionLabels[language]} className="home-feature-grid" data-home-reveal>
      <HomeSectionHeading content={content.promise} />
      <div className="home-promise-capabilities">
      {content.features.map((feature, index) => {
        const Icon = featureIcons[index];
        return (
          <article className="home-feature-card" data-reveal-item key={feature.title}>
            <div className="home-feature-icon"><Icon aria-hidden="true" size={21} /></div>
            <h2>{feature.title}</h2>
            <p>{feature.description}</p>
          </article>
        );
      })}
      </div>
    </section>
  );
};
