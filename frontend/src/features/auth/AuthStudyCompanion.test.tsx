import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  AMBIENT_LIFE,
  AuthStudyCompanion,
  COMPANION_LIFE,
  COMPANION_MOTION,
  normalizeViewportPointer
} from "./AuthStudyCompanion";

const stubMotionPreferences = ({ reducedMotion = false }: { reducedMotion?: boolean } = {}) => {
  vi.stubGlobal("matchMedia", vi.fn((query: string) => ({
    addEventListener: vi.fn(),
    matches: query.includes("prefers-reduced-motion") ? reducedMotion : query.includes("pointer: fine"),
    media: query,
    onchange: null,
    removeEventListener: vi.fn()
  })));
};

describe("AuthStudyCompanion", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    sessionStorage.clear();
  });

  it("renders exactly four distinct decorative study-team characters", () => {
    render(<AuthStudyCompanion mode="login" state="idle" />);

    const team = screen.getByTestId("auth-companion-team");
    const characters = within(team).getAllByTestId("auth-companion-character");

    expect(team).toHaveAttribute("aria-hidden", "true");
    expect(characters).toHaveLength(4);
    expect(characters.map((character) => character.getAttribute("data-character"))).toEqual([
      "moss",
      "matcha",
      "sage",
      "fern"
    ]);
    expect(screen.getByTestId("auth-companion-status-chip")).toHaveAttribute("aria-hidden", "true");
  });

  it.each([
    ["login", "ยินดีต้อนรับกลับ"],
    ["register", "พร้อมเรียนต่อแล้ว"]
  ] as const)("shows truthful %s success copy only for a success state", (mode, expectedCopy) => {
    const { rerender } = render(<AuthStudyCompanion mode={mode} state="submitting" />);

    expect(screen.queryByText(expectedCopy)).not.toBeInTheDocument();

    rerender(<AuthStudyCompanion mode={mode} state="success" />);

    expect(screen.getByText(expectedCopy)).toBeInTheDocument();
  });

  it.each([
    ["login", "กำลังตรวจสอบ"],
    ["register", "กำลังสร้างพื้นที่เรียน"]
  ] as const)("uses mode-specific %s submitting copy", (mode, expectedCopy) => {
    render(<AuthStudyCompanion mode={mode} state="submitting" />);

    expect(screen.getByText(expectedCopy)).toBeInTheDocument();
  });

  it("keeps server errors out of the decorative companion copy", () => {
    const { rerender } = render(<AuthStudyCompanion mode="login" state="submitting" />);

    expect(screen.queryByText("ลองใหม่ได้เสมอ")).not.toBeInTheDocument();

    rerender(<AuthStudyCompanion mode="login" state="error" />);

    expect(screen.queryByText("ลองใหม่ได้เสมอ")).not.toBeInTheDocument();
    expect(screen.queryByTestId("auth-companion-status-chip")).not.toBeInTheDocument();
  });

  it("settles each rolling form in order before morphing the complete team", () => {
    vi.useFakeTimers();
    stubMotionPreferences();
    render(<AuthStudyCompanion mode="login" state="idle" />);
    const stage = screen.getByTestId("auth-study-companion");
    const character = (name: string) => within(screen.getByTestId("auth-companion-team"))
      .getAllByTestId("auth-companion-character")
      .find((element) => element.getAttribute("data-character") === name);

    const phases = () => ["moss", "matcha", "sage", "fern"]
      .map((name) => character(name)?.getAttribute("data-intro-phase"));

    expect(stage).toHaveAttribute("data-intro", "moss");
    expect(phases()).toEqual(["rolling", "waiting", "waiting", "waiting"]);

    act(() => vi.advanceTimersByTime(700));
    expect(stage).toHaveAttribute("data-intro", "matcha");
    expect(phases()).toEqual(["settled", "rolling", "waiting", "waiting"]);

    act(() => vi.advanceTimersByTime(660));
    expect(stage).toHaveAttribute("data-intro", "sage");
    expect(phases()).toEqual(["settled", "settled", "rolling", "waiting"]);

    act(() => vi.advanceTimersByTime(620));
    expect(stage).toHaveAttribute("data-intro", "fern");
    expect(phases()).toEqual(["settled", "settled", "settled", "rolling"]);

    act(() => vi.advanceTimersByTime(580));
    expect(stage).toHaveAttribute("data-intro", "settled");
    expect(phases()).toEqual(["settled", "settled", "settled", "settled"]);

    act(() => vi.advanceTimersByTime(160));
    expect(stage).toHaveAttribute("data-intro", "morph");
    expect(phases()).toEqual(["morph", "morph", "morph", "morph"]);

    act(() => vi.advanceTimersByTime(520));
    expect(stage).toHaveAttribute("data-intro", "ready");
    expect(phases()).toEqual(["ready", "ready", "ready", "ready"]);
  });

  it("skips the rolling intro for a later auth route in the same tab using only a visual marker", () => {
    sessionStorage.setItem("ai-tutor-auth-intro-seen", "1");
    stubMotionPreferences();
    render(<AuthStudyCompanion mode="register" state="idle" />);

    const stage = screen.getByTestId("auth-study-companion");
    expect(stage).toHaveAttribute("data-intro", "ready");
    expect(sessionStorage.getItem("ai-tutor-auth-intro-seen")).toBe("1");
    expect(sessionStorage.getItem("ai-tutor-auth-intro-seen")).not.toMatch(/token|email|name|password|session/i);
  });

  it("plays the first auth intro once, then starts a switched login/register route ready", () => {
    vi.useFakeTimers();
    stubMotionPreferences();
    const firstEntry = render(<AuthStudyCompanion mode="login" state="idle" />);

    expect(screen.getByTestId("auth-study-companion")).toHaveAttribute("data-intro", "moss");
    act(() => vi.advanceTimersByTime(3240));
    expect(sessionStorage.getItem("ai-tutor-auth-intro-seen")).toBe("1");
    firstEntry.unmount();

    render(<AuthStudyCompanion mode="register" state="idle" />);
    expect(screen.getByTestId("auth-study-companion")).toHaveAttribute("data-intro", "ready");
  });

  it("keeps Moss strongest in body motion while clamping each pupil inside its socket", () => {
    render(<AuthStudyCompanion mode="login" state="idle" />);
    const characters = within(screen.getByTestId("auth-companion-team"))
      .getAllByTestId("auth-companion-character");
    const character = (name: string) => characters
      .find((element) => element.getAttribute("data-character") === name);

    expect([
      COMPANION_MOTION.moss.bodyX,
      COMPANION_MOTION.matcha.bodyX,
      COMPANION_MOTION.fern.bodyX,
      COMPANION_MOTION.sage.bodyX
    ]).toEqual([9, 5, 4, 2.5]);
    expect(COMPANION_MOTION.moss).toMatchObject({ bodyY: 5, eyeX: 3.2, eyeY: 2.2, rotate: 3.5 });
    expect(COMPANION_MOTION.matcha).toMatchObject({ bodyY: 3, eyeX: 3.5, eyeY: 2.4, rotate: 2 });
    expect(COMPANION_MOTION.fern).toMatchObject({ bodyY: 2.5, eyeX: 2.6, eyeY: 1.8, rotate: 1.5 });
    expect(COMPANION_MOTION.sage).toMatchObject({ bodyY: 1.5, eyeX: 2, eyeY: 1.5, rotate: 0.8 });

    Object.values(COMPANION_MOTION).forEach(({ eyeX, eyeY }) => {
      expect(eyeX).toBeLessThanOrEqual(3.5);
      expect(eyeY).toBeLessThanOrEqual(2.4);
    });
    expect(character("moss")?.style.getPropertyValue("--auth-body-x")).toBe("9px");
    expect(character("moss")?.style.getPropertyValue("--auth-eye-x")).toBe("3.2px");
    expect(character("sage")?.style.getPropertyValue("--auth-body-x")).toBe("2.5px");
  });

  it("bypasses the rolling intro when reduced motion is requested", () => {
    vi.useFakeTimers();
    stubMotionPreferences({ reducedMotion: true });
    render(<AuthStudyCompanion mode="login" state="idle" />);

    act(() => vi.advanceTimersByTime(1));

    expect(screen.getByTestId("auth-study-companion")).toHaveAttribute("data-intro", "ready");
  });

  it("activates one ambient-life system after the ready handoff and preserves it through field focus", () => {
    vi.useFakeTimers();
    stubMotionPreferences();
    const { rerender } = render(<AuthStudyCompanion mode="login" state="idle" />);
    const stage = screen.getByTestId("auth-study-companion");

    act(() => vi.advanceTimersByTime(3240));
    expect(stage).toHaveAttribute("data-life", "handoff");

    act(() => vi.advanceTimersByTime(349));
    expect(stage).toHaveAttribute("data-life", "handoff");

    act(() => vi.advanceTimersByTime(1));
    expect(stage).toHaveAttribute("data-life", "ambient");

    rerender(<AuthStudyCompanion mode="login" state="email" />);
    expect(stage).toHaveAttribute("data-life", "ambient");
    expect(stage).toHaveAttribute("data-state", "email");

    rerender(<AuthStudyCompanion mode="login" state="password" />);
    expect(stage).toHaveAttribute("data-life", "ambient");
    expect(stage).toHaveAttribute("data-state", "password");
  });

  it("uses distinct deterministic personality ranges for blink and body life", () => {
    expect(AMBIENT_LIFE).toMatchObject({
      ambientHandoffMs: 350,
      ambientTransitionMs: 450,
      pointerDominanceMs: 750,
      schedulerTickMs: 900
    });
    expect(COMPANION_LIFE.matcha.blinkMin).toBeLessThan(COMPANION_LIFE.moss.blinkMin);
    expect(COMPANION_LIFE.fern.blinkMin).toBeLessThan(COMPANION_LIFE.sage.blinkMin);
    expect(COMPANION_LIFE.matcha.doubleBlinkChance).toBeGreaterThan(COMPANION_LIFE.sage.doubleBlinkChance);
    expect(COMPANION_LIFE.moss.breathY).toBeGreaterThan(COMPANION_LIFE.sage.breathY);
    expect(COMPANION_LIFE.matcha.peek).toBe(true);
    expect(COMPANION_LIFE.fern.peek).toBe(true);
    expect(COMPANION_LIFE.moss.peek).toBe(false);
    expect(COMPANION_LIFE.sage.peek).toBe(false);
  });

  it("keeps blink life active while a fine pointer owns attention", () => {
    vi.useFakeTimers();
    stubMotionPreferences();
    vi.spyOn(Math, "random").mockReturnValue(0);
    vi.stubGlobal("requestAnimationFrame", vi.fn(() => 17));
    vi.stubGlobal("cancelAnimationFrame", vi.fn());
    vi.stubGlobal("innerWidth", 400);
    vi.stubGlobal("innerHeight", 300);
    render(<AuthStudyCompanion mode="login" state="idle" />);
    const stage = screen.getByTestId("auth-study-companion");
    const matcha = within(screen.getByTestId("auth-companion-team"))
      .getAllByTestId("auth-companion-character")
      .find((character) => character.getAttribute("data-character") === "matcha");

    act(() => vi.advanceTimersByTime(3240));
    act(() => vi.advanceTimersByTime(350));
    act(() => vi.advanceTimersByTime(2410));
    const pointerMove = new Event("pointermove");
    Object.defineProperty(pointerMove, "clientX", { value: 300 });
    Object.defineProperty(pointerMove, "clientY", { value: 100 });
    Object.defineProperty(pointerMove, "pointerType", { value: "mouse" });
    fireEvent(window, pointerMove);

    act(() => vi.advanceTimersByTime(290));

    expect(stage).toHaveAttribute("data-attention", "pointer");
    expect(matcha).toHaveAttribute("data-blink");
  });

  it("does not schedule ambient work when reduced motion is requested", () => {
    vi.useFakeTimers();
    stubMotionPreferences({ reducedMotion: true });
    render(<AuthStudyCompanion mode="login" state="email" />);
    const stage = screen.getByTestId("auth-study-companion");

    act(() => vi.advanceTimersByTime(0));

    expect(stage).toHaveAttribute("data-intro", "ready");
    expect(stage).toHaveAttribute("data-life", "reduced");
    expect(vi.getTimerCount()).toBe(0);
  });

  it("finishes error recoil once while continuing lower-frequency error ambient life", () => {
    vi.useFakeTimers();
    stubMotionPreferences();
    vi.spyOn(Math, "random").mockReturnValue(0);
    const { rerender } = render(<AuthStudyCompanion mode="login" state="idle" />);
    const stage = screen.getByTestId("auth-study-companion");

    act(() => vi.advanceTimersByTime(3240));
    act(() => vi.advanceTimersByTime(350));
    rerender(<AuthStudyCompanion mode="login" state="error" />);
    expect(stage).toHaveAttribute("data-reaction", "error");

    act(() => vi.advanceTimersByTime(280));
    expect(stage).not.toHaveAttribute("data-reaction");
    expect(stage).toHaveAttribute("data-life", "ambient");

    act(() => vi.advanceTimersByTime(1600));
    const ambientEvents = within(screen.getByTestId("auth-companion-team"))
      .getAllByTestId("auth-companion-character")
      .filter((character) => character.hasAttribute("data-life-event"));
    expect(ambientEvents.length).toBeGreaterThan(0);
    expect(ambientEvents.every((character) => character.getAttribute("data-life-event")?.startsWith("glance"))).toBe(true);
  });

  it("lets the password-visible reaction override pointer briefly before resuming password ambient life", () => {
    vi.useFakeTimers();
    stubMotionPreferences();
    vi.stubGlobal("requestAnimationFrame", vi.fn(() => 17));
    vi.stubGlobal("cancelAnimationFrame", vi.fn());
    vi.stubGlobal("innerWidth", 400);
    vi.stubGlobal("innerHeight", 300);
    const { rerender } = render(<AuthStudyCompanion mode="login" state="password" />);
    const stage = screen.getByTestId("auth-study-companion");
    const pointerMove = new Event("pointermove");
    Object.defineProperty(pointerMove, "clientX", { value: 300 });
    Object.defineProperty(pointerMove, "clientY", { value: 100 });
    Object.defineProperty(pointerMove, "pointerType", { value: "mouse" });

    act(() => vi.advanceTimersByTime(3240));
    act(() => vi.advanceTimersByTime(350));
    fireEvent(window, pointerMove);
    expect(stage).toHaveAttribute("data-attention", "pointer");

    rerender(<AuthStudyCompanion mode="login" state="password-visible" />);
    expect(stage).toHaveAttribute("data-reaction", "password-visible");
    expect(stage).toHaveAttribute("data-attention", "ambient");
    expect(stage).toHaveAttribute("data-life", "ambient");

    fireEvent(window, pointerMove);
    expect(stage).toHaveAttribute("data-attention", "ambient");

    act(() => vi.advanceTimersByTime(620));
    expect(stage).not.toHaveAttribute("data-reaction");
    expect(stage).toHaveAttribute("data-state", "password-visible");
    expect(stage).toHaveAttribute("data-life", "ambient");

    fireEvent(window, pointerMove);
    expect(stage).toHaveAttribute("data-attention", "pointer");
  });

  it("normalizes viewport coordinates to a clamped attention range", () => {
    expect(normalizeViewportPointer({ clientX: 200, clientY: 150, viewportHeight: 300, viewportWidth: 400 })).toEqual({
      x: 0,
      y: 0
    });
    expect(normalizeViewportPointer({ clientX: 1200, clientY: -500, viewportHeight: 300, viewportWidth: 400 })).toEqual({
      x: 1,
      y: -1
    });
  });

  it("interrupts autonomous gestures for pointer tracking, then transitions into ambient life", () => {
    vi.useFakeTimers();
    stubMotionPreferences();
    const animationFrames: FrameRequestCallback[] = [];
    const flushAnimationFrames = () => {
      while (animationFrames.length > 0) {
        animationFrames.shift()?.(0);
      }
    };
    vi.stubGlobal("requestAnimationFrame", vi.fn((callback: FrameRequestCallback) => {
      animationFrames.push(callback);
      return animationFrames.length;
    }));
    vi.stubGlobal("cancelAnimationFrame", vi.fn());
    vi.stubGlobal("innerWidth", 400);
    vi.stubGlobal("innerHeight", 300);
    render(<AuthStudyCompanion mode="login" state="idle" />);
    const stage = screen.getByTestId("auth-study-companion");

    vi.spyOn(Math, "random").mockReturnValue(0);
    act(() => vi.advanceTimersByTime(3240));
    act(() => vi.advanceTimersByTime(350));
    act(() => vi.advanceTimersByTime(3610));
    expect(stage).toHaveAttribute("data-life", "ambient");
    expect(within(screen.getByTestId("auth-companion-team"))
      .getAllByTestId("auth-companion-character")
      .some((character) => character.hasAttribute("data-life-event"))).toBe(true);

    const pointerMove = new Event("pointermove");
    Object.defineProperty(pointerMove, "clientX", { value: 1200 });
    Object.defineProperty(pointerMove, "clientY", { value: -500 });
    Object.defineProperty(pointerMove, "pointerType", { value: "mouse" });
    fireEvent(window, pointerMove);
    act(flushAnimationFrames);

    expect(stage.style.getPropertyValue("--auth-look-x")).toBe("1");
    expect(stage.style.getPropertyValue("--auth-look-y")).toBe("-1");
    expect(stage).toHaveAttribute("data-attention", "pointer");
    expect(stage).toHaveAttribute("data-life", "pointer");
    expect(within(screen.getByTestId("auth-companion-team"))
      .getAllByTestId("auth-companion-character")
      .some((character) => character.hasAttribute("data-life-event"))).toBe(false);

    act(() => vi.advanceTimersByTime(749));
    expect(stage).toHaveAttribute("data-attention", "pointer");

    act(() => vi.advanceTimersByTime(1));
    expect(stage).toHaveAttribute("data-attention", "settling");
    expect(stage).toHaveAttribute("data-life", "handoff");

    act(() => vi.advanceTimersByTime(450));
    act(flushAnimationFrames);
    expect(stage).toHaveAttribute("data-attention", "ambient");
    expect(stage).toHaveAttribute("data-life", "ambient");
    expect(stage.style.getPropertyValue("--auth-look-x")).toBe("0");
    expect(stage.style.getPropertyValue("--auth-look-y")).toBe("0");

    fireEvent(window, pointerMove);
    act(flushAnimationFrames);

    fireEvent.blur(window);
    act(flushAnimationFrames);
    expect(stage).toHaveAttribute("data-attention", "settling");

    act(() => vi.advanceTimersByTime(300));

    expect(stage).toHaveAttribute("data-attention", "ambient");
    expect(stage).toHaveAttribute("data-life", "ambient");
    expect(stage.style.getPropertyValue("--auth-look-x")).toBe("0");
    expect(stage.style.getPropertyValue("--auth-look-y")).toBe("0");
  });

  it("cleans viewport listeners, idle timers, and pending animation frames on unmount", () => {
    vi.useFakeTimers();
    stubMotionPreferences();
    const removeEventListener = vi.spyOn(window, "removeEventListener");
    vi.stubGlobal("requestAnimationFrame", vi.fn(() => 17));
    const cancelAnimationFrame = vi.fn();
    vi.stubGlobal("cancelAnimationFrame", cancelAnimationFrame);
    vi.stubGlobal("innerWidth", 400);
    vi.stubGlobal("innerHeight", 300);
    const { unmount } = render(<AuthStudyCompanion mode="login" state="idle" />);

    act(() => vi.advanceTimersByTime(3240));
    act(() => vi.advanceTimersByTime(1));

    const pointerMove = new Event("pointermove");
    Object.defineProperty(pointerMove, "clientX", { value: 300 });
    Object.defineProperty(pointerMove, "clientY", { value: 100 });
    Object.defineProperty(pointerMove, "pointerType", { value: "mouse" });
    fireEvent(window, pointerMove);

    expect(vi.getTimerCount()).toBeGreaterThan(0);
    unmount();

    expect(vi.getTimerCount()).toBe(0);
    expect(cancelAnimationFrame).toHaveBeenCalledWith(17);
    expect(removeEventListener).toHaveBeenCalledWith("pointermove", expect.any(Function));
    expect(removeEventListener).toHaveBeenCalledWith("pointerout", expect.any(Function));
    expect(removeEventListener).toHaveBeenCalledWith("blur", expect.any(Function));
  });
});
