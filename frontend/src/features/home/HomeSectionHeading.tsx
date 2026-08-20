import type { HomeSectionContent } from "./types";

export const HomeSectionHeading = ({ content }: { content: HomeSectionContent }) => (
  <div className="home-section-heading">
    <p className="home-eyebrow">{content.eyebrow}</p>
    <h2>{content.title}</h2>
    <p>{content.body}</p>
  </div>
);
