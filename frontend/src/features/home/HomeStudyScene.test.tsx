import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { HOME_CONTENT } from "./homeContent";
import { HomeStudyScene } from "./HomeStudyScene.client";

type TimelineConfig = {
  onComplete?: () => void;
  paused?: boolean;
  repeat?: number;
  yoyo?: boolean;
};

type TimelineOperation = {
  position?: number | string;
  target: string;
  vars: Record<string, unknown>;
};

type TestTimeline = {
  config: TimelineConfig;
  kill: ReturnType<typeof vi.fn>;
  pause: ReturnType<typeof vi.fn>;
  play: ReturnType<typeof vi.fn>;
  set: (target: string, vars: Record<string, unknown>) => TestTimeline;
  sets: TimelineOperation[];
  to: (target: string, vars: Record<string, unknown>, position?: number | string) => TestTimeline;
  tos: TimelineOperation[];
};

const motionHarness = vi.hoisted(() => ({
  conditions: { coarsePointer: false, finePointer: true, reduceMotion: false },
  mediaCleanup: undefined as (() => void) | undefined,
  mediaRevert: vi.fn(),
  sets: [] as Array<{ target: string; vars: Record<string, unknown> }>,
  timelines: [] as TestTimeline[]
}));

const applyStyles = (target: string, vars: Record<string, unknown>) => {
  document.querySelectorAll<HTMLElement>(target).forEach((element) => {
    if (typeof vars.autoAlpha === "number") {
      element.style.opacity = String(vars.autoAlpha);
      element.style.visibility = vars.autoAlpha === 0 ? "hidden" : "visible";
    }
  });
};

vi.mock("@gsap/react", async () => {
  const React = await vi.importActual<typeof import("react")>("react");
  return {
    useGSAP: (setup: () => void | (() => void)) => {
      const setupRef = React.useRef(setup);
      setupRef.current = setup;
      React.useLayoutEffect(() => setupRef.current(), []);
    }
  };
});

vi.mock("gsap", () => ({
  default: {
    matchMedia: () => ({
      add: (
        _queries: Record<string, string>,
        setup: (context: { conditions: typeof motionHarness.conditions }) => void | (() => void)
      ) => {
        const cleanup = setup({ conditions: { ...motionHarness.conditions } });
        motionHarness.mediaCleanup = typeof cleanup === "function" ? cleanup : undefined;
      },
      revert: () => {
        motionHarness.mediaCleanup?.();
        motionHarness.mediaRevert();
      }
    }),
    registerPlugin: vi.fn(),
    set: (target: string, vars: Record<string, unknown>) => {
      motionHarness.sets.push({ target, vars });
      applyStyles(target, vars);
    },
    timeline: (config: TimelineConfig = {}) => {
      const timeline: TestTimeline = {
        config,
        kill: vi.fn(),
        pause: vi.fn(),
        play: vi.fn(),
        sets: [],
        tos: [],
        set(target, vars) {
          timeline.sets.push({ target, vars });
          return timeline;
        },
        to(target, vars, position) {
          timeline.tos.push({ position, target, vars });
          return timeline;
        }
      };
      motionHarness.timelines.push(timeline);
      return timeline;
    }
  }
}));

let intersectionCallback: IntersectionObserverCallback | undefined;
let observerDisconnect: () => void;

const scenePart = (part: string) => document.querySelector<HTMLElement>(`[data-scene-part='${part}']`);

const expectMeaningfulFinalFrame = () => {
  ["document", "summary", "quiz", "result"].forEach((part) => {
    expect(scenePart(part)).toHaveStyle({ opacity: "1", visibility: "visible" });
  });
  ["question", "answer"].forEach((part) => {
    expect(scenePart(part)).toHaveStyle({ opacity: "0", visibility: "hidden" });
  });
};

describe("HomeStudyScene responsive motion", () => {
  beforeEach(() => {
    motionHarness.conditions = { coarsePointer: false, finePointer: true, reduceMotion: false };
    motionHarness.mediaCleanup = undefined;
    motionHarness.mediaRevert.mockClear();
    motionHarness.sets.length = 0;
    motionHarness.timelines.length = 0;
    intersectionCallback = undefined;
    observerDisconnect = vi.fn();

    class TestIntersectionObserver implements IntersectionObserver {
      readonly root = null;
      readonly rootMargin = "0px";
      readonly thresholds = [0.15];
      disconnect = () => observerDisconnect();
      observe = vi.fn();
      takeRecords = vi.fn(() => []);
      unobserve = vi.fn();

      constructor(callback: IntersectionObserverCallback) {
        intersectionCallback = callback;
      }
    }

    Object.defineProperty(window, "IntersectionObserver", {
      configurable: true,
      value: TestIntersectionObserver
    });
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: vi.fn()
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("uses a deterministic meaningful final state without creating timelines for reduced motion", () => {
    motionHarness.conditions = { coarsePointer: false, finePointer: false, reduceMotion: true };

    render(<HomeStudyScene content={HOME_CONTENT.en.studyScene} />);

    expect(motionHarness.timelines).toHaveLength(0);
    expectMeaningfulFinalFrame();
  });

  it("plays the explanatory story once on coarse pointers, then uses only a restrained result emphasis", () => {
    motionHarness.conditions = { coarsePointer: true, finePointer: false, reduceMotion: false };
    render(<HomeStudyScene content={HOME_CONTENT.en.studyScene} />);

    const explanatory = motionHarness.timelines[0];
    expect(explanatory.config.repeat).toBe(0);

    act(() => explanatory.config.onComplete?.());

    expect(motionHarness.timelines).toHaveLength(2);
    expectMeaningfulFinalFrame();
    const ambient = motionHarness.timelines[1];
    expect(ambient.config).toMatchObject({ repeat: -1, yoyo: true });
    expect(ambient.tos).toHaveLength(1);
    expect(ambient.tos[0].target).toBe("[data-scene-part='result']");
    expect(ambient.tos[0].vars.duration).toBeGreaterThanOrEqual(7);
    expect(ambient.tos[0].vars.duration).toBeLessThanOrEqual(8);
  });

  it("plays the explanatory story once on fine pointers, then starts tiny asynchronous ambient motion", () => {
    render(<HomeStudyScene content={HOME_CONTENT.en.studyScene} />);

    const explanatory = motionHarness.timelines[0];
    expect(explanatory.config.repeat).toBe(0);
    act(() => explanatory.config.onComplete?.());

    const ambient = motionHarness.timelines[1];
    expect(ambient.config).toMatchObject({ repeat: -1, yoyo: true });
    expect(ambient.tos.map(({ target }) => target)).toEqual([
      "[data-scene-part='summary']",
      "[data-scene-part='quiz']",
      "[data-scene-part='result']"
    ]);
    ambient.tos.forEach(({ vars }) => {
      expect(vars.duration).toBeGreaterThanOrEqual(5);
      expect(vars.duration).toBeLessThanOrEqual(8);
    });
    expectMeaningfulFinalFrame();
  });

  it("pauses and resumes both timelines for viewport visibility and the user control", () => {
    render(<HomeStudyScene content={HOME_CONTENT.en.studyScene} />);
    const explanatory = motionHarness.timelines[0];
    act(() => explanatory.config.onComplete?.());
    const ambient = motionHarness.timelines[1];
    const figure = screen.getByRole("figure", { name: HOME_CONTENT.en.studyScene.ariaLabel });

    act(() => intersectionCallback?.([{
      boundingClientRect: figure.getBoundingClientRect(),
      intersectionRatio: 0,
      intersectionRect: figure.getBoundingClientRect(),
      isIntersecting: false,
      rootBounds: null,
      target: figure,
      time: 0
    }], {} as IntersectionObserver));
    expect(explanatory.pause).toHaveBeenCalled();
    expect(ambient.pause).toHaveBeenCalled();
    explanatory.play.mockClear();
    ambient.play.mockClear();

    fireEvent.click(screen.getByRole("button", { name: HOME_CONTENT.en.studyScene.pauseLabel }));
    act(() => intersectionCallback?.([{
      boundingClientRect: figure.getBoundingClientRect(),
      intersectionRatio: 1,
      intersectionRect: figure.getBoundingClientRect(),
      isIntersecting: true,
      rootBounds: null,
      target: figure,
      time: 1
    }], {} as IntersectionObserver));
    expect(ambient.play).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: HOME_CONTENT.en.studyScene.playLabel }));
    expect(explanatory.play).toHaveBeenCalled();
    expect(ambient.play).toHaveBeenCalled();
  });

  it("pauses and resumes both timelines when document visibility changes", () => {
    render(<HomeStudyScene content={HOME_CONTENT.en.studyScene} />);
    const explanatory = motionHarness.timelines[0];
    act(() => explanatory.config.onComplete?.());
    const ambient = motionHarness.timelines[1];
    explanatory.pause.mockClear();
    explanatory.play.mockClear();
    ambient.pause.mockClear();
    ambient.play.mockClear();

    Object.defineProperty(document, "visibilityState", { configurable: true, value: "hidden" });
    fireEvent(document, new Event("visibilitychange"));
    expect(explanatory.pause).toHaveBeenCalledOnce();
    expect(ambient.pause).toHaveBeenCalledOnce();

    Object.defineProperty(document, "visibilityState", { configurable: true, value: "visible" });
    fireEvent(document, new Event("visibilitychange"));
    expect(explanatory.play).toHaveBeenCalledOnce();
    expect(ambient.play).toHaveBeenCalledOnce();
  });

  it("cleans up both timelines, the observer, and media resources", () => {
    const removeEventListener = vi.spyOn(document, "removeEventListener");
    const { unmount } = render(<HomeStudyScene content={HOME_CONTENT.en.studyScene} />);
    const explanatory = motionHarness.timelines[0];
    act(() => explanatory.config.onComplete?.());
    const ambient = motionHarness.timelines[1];

    unmount();

    expect(explanatory.kill).toHaveBeenCalled();
    expect(ambient.kill).toHaveBeenCalled();
    expect(observerDisconnect).toHaveBeenCalled();
    expect(removeEventListener).toHaveBeenCalledWith("visibilitychange", expect.any(Function));
    expect(motionHarness.mediaRevert).toHaveBeenCalledOnce();
  });
});
