import { FileCheck2, Focus, ShieldCheck } from "lucide-react";

import { HOME_CONTENT } from "./homeContent";
import { HomeSectionHeading } from "./HomeSectionHeading";
import type { HomeLanguage } from "./types";

const icons = [Focus, FileCheck2, ShieldCheck];
export const HomeTrust = ({ language }: { language: HomeLanguage }) => {
  const content = HOME_CONTENT[language].trust;
  return <section className="home-section home-trust-section"><HomeSectionHeading content={content} /><div className="home-trust-grid">{content.items.map((item, index) => { const Icon = icons[index]; return <article key={item.title}><Icon aria-hidden="true" /><h3>{item.title}</h3><p>{item.description}</p></article>; })}</div></section>;
};
