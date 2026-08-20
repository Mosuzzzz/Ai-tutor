import { ChevronDown } from "lucide-react";

import { HOME_CONTENT } from "./homeContent";
import { HomeSectionHeading } from "./HomeSectionHeading";
import type { HomeLanguage } from "./types";

export const HomeFaq = ({ language }: { language: HomeLanguage }) => {
  const content = HOME_CONTENT[language].faq;
  return <section className="home-section home-faq-section" id="faq"><HomeSectionHeading content={content} /><div className="home-faq-list">{content.items.map((item) => <details key={item.question}><summary>{item.question}<ChevronDown aria-hidden="true" size={19} /></summary><p>{item.answer}</p></details>)}</div></section>;
};
