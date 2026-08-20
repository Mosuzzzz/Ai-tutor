"use client";

import { useId, useRef, useState } from "react";
import { CheckCircle2, FileText, MessageSquareText } from "lucide-react";

import { HOME_CONTENT } from "./homeContent";
import { HomeSectionHeading } from "./HomeSectionHeading";
import type { HomeLanguage } from "./types";

export const HomeWalkthrough = ({ language }: { language: HomeLanguage }) => {
  const content = HOME_CONTENT[language].walkthrough;
  const [selectedIndex, setSelectedIndex] = useState(0);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const id = useId();
  const selected = content.items[selectedIndex];

  const selectAndFocus = (index: number) => {
    const next = (index + content.items.length) % content.items.length;
    setSelectedIndex(next);
    tabRefs.current[next]?.focus();
  };

  return (
    <section className="home-section home-walkthrough" id="how-it-works">
      <HomeSectionHeading content={content} />
      <div className="home-walkthrough-layout">
        <div aria-label={content.title} className="home-walkthrough-tabs" role="tablist">
          {content.items.map((item, index) => <button
            aria-controls={`${id}-panel`}
            aria-selected={selectedIndex === index}
            id={`${id}-tab-${index}`}
            key={item.label}
            onClick={() => setSelectedIndex(index)}
            onKeyDown={(event) => {
              if (event.key === "ArrowRight" || event.key === "ArrowDown") { event.preventDefault(); selectAndFocus(selectedIndex + 1); }
              if (event.key === "ArrowLeft" || event.key === "ArrowUp") { event.preventDefault(); selectAndFocus(selectedIndex - 1); }
              if (event.key === "Home") { event.preventDefault(); selectAndFocus(0); }
              if (event.key === "End") { event.preventDefault(); selectAndFocus(content.items.length - 1); }
            }}
            ref={(element) => { tabRefs.current[index] = element; }}
            role="tab"
            tabIndex={selectedIndex === index ? 0 : -1}
            type="button"
          >{item.label}</button>)}
        </div>
        <div aria-labelledby={`${id}-tab-${selectedIndex}`} className="home-walkthrough-panel" id={`${id}-panel`} role="tabpanel">
          <div className="home-walkthrough-panel-content" key={selectedIndex}>
            <div className="home-walkthrough-document" aria-hidden="true"><FileText size={28} /><span /><span /><span /></div>
            <div><p className="home-panel-kicker"><MessageSquareText aria-hidden="true" size={17} />{selected.label}</p><h3>{selected.title}</h3><p>{selected.description}</p><p className="home-panel-detail"><CheckCircle2 aria-hidden="true" size={17} />{selected.detail}</p></div>
          </div>
        </div>
      </div>
    </section>
  );
};
