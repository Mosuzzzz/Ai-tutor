import { FileImage, FileText, Languages } from "lucide-react";

import { HOME_CONTENT } from "./homeContent";
import { HomeSectionHeading } from "./HomeSectionHeading";
import type { HomeLanguage } from "./types";

export const HomeLanguageMaterial = ({ language }: { language: HomeLanguage }) => {
  const content = HOME_CONTENT[language].languageMaterial;
  return <section className="home-section home-language-section" data-home-reveal>
    <HomeSectionHeading content={content} />
    <div className="home-language-visual">
      <div className="home-language-switch" aria-label={language === "th" ? "ภาษาอินเทอร์เฟซที่รองรับ" : "Supported interface languages"} data-reveal-item><Languages aria-hidden="true" /><span>English</span><span>ไทย</span></div>
      <ul>{content.formats.map((format, index) => <li data-reveal-item key={format}>{index === 3 ? <FileImage aria-hidden="true" size={18} /> : <FileText aria-hidden="true" size={18} />}{format}</li>)}</ul>
      <p>{content.note}</p>
    </div>
  </section>;
};
