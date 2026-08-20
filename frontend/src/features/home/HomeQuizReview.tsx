import { Check, FileText } from "lucide-react";

import { HOME_CONTENT } from "./homeContent";
import { HomeSectionHeading } from "./HomeSectionHeading";
import type { HomeLanguage } from "./types";

export const HomeQuizReview = ({ language }: { language: HomeLanguage }) => {
  const content = HOME_CONTENT[language].quiz;
  return <section className="home-section home-quiz-section" data-home-reveal>
    <HomeSectionHeading content={content} />
    <div className="home-quiz-preview"><p className="home-example-label">{content.exampleLabel}</p><h3>{content.question}</h3>
      <ol>{content.choices.map((choice, index) => <li className={index === 0 ? "is-selected" : undefined} data-reveal-item key={choice}>{index === 0 ? <Check aria-hidden="true" size={17} /> : <span aria-hidden="true" />}{choice}</li>)}</ol>
      <div className="home-quiz-reveal" data-reveal-item><p className="home-quiz-explanation">{content.explanation}</p><p className="home-source-chip"><FileText aria-hidden="true" size={15} />{content.source}</p></div>
    </div>
  </section>;
};
