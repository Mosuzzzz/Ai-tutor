import { ArrowRight, FileQuestion, FileText, MessageSquareText, Sparkles } from "lucide-react";

import { HOME_CONTENT } from "./homeContent";
import { HomeSectionHeading } from "./HomeSectionHeading";
import type { HomeLanguage } from "./types";

const icons = [FileText, Sparkles, MessageSquareText, FileQuestion];

export const HomeStudyKit = ({ language }: { language: HomeLanguage }) => {
  const content = HOME_CONTENT[language].studyKit;
  return (
    <section className="home-section home-study-kit" data-home-reveal id="study-kit">
      <HomeSectionHeading content={content} />
      <div aria-hidden="true" className="home-kit-connectors">
        <svg preserveAspectRatio="none" viewBox="0 0 1000 360">
          <path d="M250 180 C360 180 350 78 500 78" />
          <path d="M250 180 C360 180 350 282 500 282" />
          <path d="M640 282 C730 282 720 180 830 180" />
        </svg>
      </div>
      <ol className="home-study-kit-flow">
        {content.steps.map((step, index) => {
          const Icon = icons[index];
          return <li className={`home-kit-node home-kit-node-${index + 1}`} data-reveal-item key={step.title}>
            <span className="home-kit-icon"><Icon aria-hidden="true" size={22} /></span>
            <span className="home-kit-step">0{index + 1}</span>
            <h3>{step.title}</h3><p>{step.description}</p>
            {index < content.steps.length - 1 ? <ArrowRight aria-hidden="true" className="home-kit-arrow" size={20} /> : null}
          </li>;
        })}
      </ol>
    </section>
  );
};
