import { BrainCircuit, ChartNoAxesCombined, FileQuestion } from "lucide-react";

import { HOME_CONTENT } from "./homeContent";
import type { HomeLanguage } from "./types";

type HomeFeatureGridProps = {
  language: HomeLanguage;
};

const featureIcons = [BrainCircuit, FileQuestion, ChartNoAxesCombined];

export const HomeFeatureGrid = ({ language }: HomeFeatureGridProps) => {
  const features = HOME_CONTENT[language].features;

  return (
    <section aria-label="Learning features" className="home-feature-grid">
      {features.map((feature, index) => {
        const Icon = featureIcons[index];
        return (
          <article className="home-feature-card" key={feature.title}>
            <div className="home-feature-icon"><Icon aria-hidden="true" size={21} /></div>
            <h2>{feature.title}</h2>
            <p>{feature.description}</p>
          </article>
        );
      })}
    </section>
  );
};
