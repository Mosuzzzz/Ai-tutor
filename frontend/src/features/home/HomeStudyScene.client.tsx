"use client";

import { useRef, useState } from "react";
import { Check, CirclePause, CirclePlay, FileText, Sparkles } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

import type { HomeStudySceneContent } from "./types";

gsap.registerPlugin(useGSAP);

export const HomeStudyScene = ({ content }: { content: HomeStudySceneContent }) => {
  const sceneRef = useRef<HTMLElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const manuallyPausedRef = useRef(false);
  const visibleRef = useRef(true);
  const [isPlaying, setIsPlaying] = useState(true);

  useGSAP(() => {
    if (typeof window.matchMedia !== "function") return;
    const media = gsap.matchMedia();
    media.add({
      reduceMotion: "(prefers-reduced-motion: reduce)",
      mobile: "(max-width: 767px)",
      fullMotion: "(min-width: 768px) and (prefers-reduced-motion: no-preference)"
    }, (context) => {
      const conditions = context.conditions as { reduceMotion: boolean; mobile: boolean; fullMotion: boolean };
      if (conditions.reduceMotion) {
        gsap.set("[data-scene-part]", { clearProps: "all" });
        timelineRef.current = null;
        return;
      }

      const timeline = gsap.timeline({ defaults: { ease: "power2.out" }, paused: false, repeat: conditions.mobile ? 0 : -1, repeatDelay: 1.1 });
      timeline
        .set("[data-scene-part='document']", { autoAlpha: 0, y: 24 })
        .set("[data-scene-part='highlight']", { scaleX: 0, transformOrigin: "left center" })
        .set("[data-scene-part='summary'], [data-scene-part='question'], [data-scene-part='answer'], [data-scene-part='quiz'], [data-scene-part='result']", { autoAlpha: 0, y: 16 })
        .to("[data-scene-part='document']", { autoAlpha: 1, duration: 0.65, y: 0 })
        .to("[data-scene-part='highlight']", { duration: 0.7, scaleX: 1 }, ">-0.1")
        .to("[data-scene-part='summary']", { autoAlpha: 1, duration: 0.65, y: 0 }, ">-0.15")
        .to("[data-scene-part='question']", { autoAlpha: 1, duration: 0.55, y: 0 }, ">+0.3")
        .to("[data-scene-part='answer']", { autoAlpha: 1, duration: 0.65, y: 0 }, ">+0.35")
        .to("[data-scene-part='quiz']", { autoAlpha: 1, duration: 0.65, y: 0 }, ">+0.45")
        .to("[data-scene-part='result']", { autoAlpha: 1, duration: 0.55, y: 0 }, ">+0.25")
        .to("[data-scene-part='summary'], [data-scene-part='question'], [data-scene-part='answer'], [data-scene-part='quiz'], [data-scene-part='result']", { autoAlpha: 0, duration: 0.55, y: -10 }, ">+1.2")
        .to("[data-scene-part='highlight']", { duration: 0.35, scaleX: 0 }, "<")
        .to("[data-scene-part='document']", { autoAlpha: 0, duration: 0.4, y: -12 }, "<+0.1");
      timelineRef.current = timeline;

      const syncPlayback = () => {
        const shouldPlay = visibleRef.current && !manuallyPausedRef.current && document.visibilityState !== "hidden";
        if (shouldPlay) timeline.play(); else timeline.pause();
      };
      const onVisibilityChange = () => syncPlayback();
      document.addEventListener("visibilitychange", onVisibilityChange);
      const observer = typeof IntersectionObserver === "undefined" ? null : new IntersectionObserver(([entry]) => {
        visibleRef.current = entry?.isIntersecting ?? true;
        syncPlayback();
      }, { threshold: 0.15 });
      if (sceneRef.current) observer?.observe(sceneRef.current);

      return () => {
        document.removeEventListener("visibilitychange", onVisibilityChange);
        observer?.disconnect();
        timelineRef.current = null;
      };
    }, sceneRef);
    return () => media.revert();
  }, { scope: sceneRef, dependencies: [content], revertOnUpdate: true });

  const togglePlayback = () => {
    manuallyPausedRef.current = isPlaying;
    if (isPlaying) timelineRef.current?.pause(); else if (visibleRef.current) timelineRef.current?.play();
    setIsPlaying((playing) => !playing);
  };

  return (
    <figure aria-label={content.ariaLabel} className="home-study-scene" ref={sceneRef}>
      <figcaption className="sr-only">{content.ariaLabel}</figcaption>
      <div aria-hidden="true" className="home-scene-canvas">
        <article className="home-scene-document" data-scene-part="document">
          <div className="home-scene-title"><span><FileText size={17} /></span><div><strong>{content.documentLabel}</strong><small>{content.documentMeta}</small></div></div>
          <div className="home-scene-lines"><i /><i data-scene-part="highlight" /><i /><i /></div>
        </article>
        <article className="home-scene-summary" data-scene-part="summary"><span><Sparkles size={16} /></span><div><strong>{content.summaryLabel}</strong><p>{content.summaryText}</p><small>{content.sourceLabel}</small></div></article>
        <div className="home-scene-chat">
          <article className="home-scene-question" data-scene-part="question"><small>{content.questionLabel}</small><p>{content.questionText}</p></article>
          <article className="home-scene-answer" data-scene-part="answer"><small>{content.answerLabel}</small><p>{content.answerText}</p><span>{content.sourceLabel}</span></article>
        </div>
        <article className="home-scene-quiz" data-scene-part="quiz"><small>{content.quizLabel}</small><strong>{content.quizQuestion}</strong><span><Check size={15} />{content.quizChoice}</span></article>
        <div className="home-scene-result" data-scene-part="result"><Check size={16} />{content.resultLabel}</div>
      </div>
      <button aria-label={isPlaying ? content.pauseLabel : content.playLabel} className="home-scene-toggle" onClick={togglePlayback} type="button">
        {isPlaying ? <CirclePause aria-hidden="true" size={20} /> : <CirclePlay aria-hidden="true" size={20} />}
      </button>
    </figure>
  );
};
