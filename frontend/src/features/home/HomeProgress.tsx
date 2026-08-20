import { ArrowUpRight, BookOpenCheck } from "lucide-react";

import { HOME_CONTENT } from "./homeContent";
import { HomeSectionHeading } from "./HomeSectionHeading";
import type { HomeLanguage } from "./types";

export const HomeProgress = ({ language }: { language: HomeLanguage }) => {
  const content = HOME_CONTENT[language].progress;
  return <section className="home-section home-progress-section" data-home-reveal id="progress">
    <HomeSectionHeading content={content} />
    <div className="home-progress-preview"><p className="home-example-label">{content.exampleLabel}</p><div className="home-score-row"><div><span>{content.scoreLabel}</span><strong>82%</strong></div><span className="home-score-change"><ArrowUpRight aria-hidden="true" size={17} />+8</span></div>
      <div aria-hidden="true" className="home-progress-chart"><svg preserveAspectRatio="none" viewBox="0 0 520 150"><path className="home-progress-guide" d="M8 128 C90 118 114 94 180 101 S286 72 340 76 S430 35 512 24" /><path className="home-progress-line" d="M8 128 C90 118 114 94 180 101 S286 72 340 76 S430 35 512 24" /></svg><span className="home-progress-end" /></div>
      <div className="home-next-review"><BookOpenCheck aria-hidden="true" /><div><span>{content.reviewLabel}</span><strong>{content.reviewTopic}</strong></div></div>
    </div>
  </section>;
};
