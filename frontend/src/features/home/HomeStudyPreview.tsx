import { FileText } from "lucide-react";

import type { HomeStudyPreviewContent } from "./types";

type HomeStudyPreviewProps = {
  content: HomeStudyPreviewContent;
};

export const HomeStudyPreview = ({ content }: HomeStudyPreviewProps) => {
  return (
    <figure aria-label={content.ariaLabel} className="home-study-preview">
      <div className="home-study-paper">
        <div className="home-study-paper-heading">
          <span className="home-study-paper-icon">
            <FileText aria-hidden="true" size={18} strokeWidth={1.8} />
          </span>
          <span>{content.documentLabel}</span>
        </div>
        <div aria-hidden="true" className="home-study-paper-lines">
          <span />
          <span className="home-study-paper-highlight" />
          <span />
          <span />
        </div>
        <div aria-hidden="true" className="home-study-summary-card">
          <span />
          <span />
          <span />
        </div>
      </div>
      <ol className="home-study-steps">
        {content.steps.map((step, index) => (
          <li className="home-study-step" key={step}>
            <span aria-hidden="true" className="home-study-step-number">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span>{step}</span>
          </li>
        ))}
      </ol>
    </figure>
  );
};
