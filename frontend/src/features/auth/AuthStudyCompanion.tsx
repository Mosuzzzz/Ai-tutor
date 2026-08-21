"use client";

import { Check, FileText, LockKeyhole, Sparkles } from "lucide-react";
import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";

export type AuthVisualState = "document" | "email" | "error" | "idle" | "password" | "password-visible" | "submitting" | "success";

type AuthStudyCompanionProps = {
  mode: "login" | "register";
  state: AuthVisualState;
};

type CharacterName = "fern" | "matcha" | "moss" | "sage";
type CharacterIntroPhase = "morph" | "ready" | "rolling" | "settled" | "waiting";
type IntroState = CharacterName | "morph" | "ready" | "settled";

type ViewportPointerInput = {
  clientX: number;
  clientY: number;
  viewportHeight: number;
  viewportWidth: number;
};

type AttentionPoint = { x: number; y: number };

type CharacterLife = {
  blinkMax: number;
  blinkMin: number;
  breathDuration: number;
  breathScale: number;
  breathY: number;
  doubleBlinkChance: number;
  peek: boolean;
  slowBlinkChance: number;
  swayX: number;
};

type AmbientDeadlines = {
  blink: Record<CharacterName, number>;
  body: number;
  eyebrow: number;
  glance: number;
};

export const COMPANION_MOTION = {
  moss: {
    arrivalDuration: 700,
    bodyX: 9,
    bodyY: 5,
    collisionShift: -1.8,
    eyeX: 3.2,
    eyeY: 2.2,
    overshoot: -5,
    rebound: 2,
    responseDuration: 175,
    rollRotation: -480,
    rotate: 3.5
  },
  matcha: {
    arrivalDuration: 660,
    bodyX: 5,
    bodyY: 3,
    collisionShift: -1.4,
    eyeX: 3.5,
    eyeY: 2.4,
    overshoot: -4,
    rebound: 2,
    responseDuration: 145,
    rollRotation: -400,
    rotate: 2
  },
  sage: {
    arrivalDuration: 620,
    bodyX: 2.5,
    bodyY: 1.5,
    collisionShift: -0.9,
    eyeX: 2,
    eyeY: 1.5,
    overshoot: -3.5,
    rebound: 1.5,
    responseDuration: 220,
    rollRotation: -360,
    rotate: 0.8
  },
  fern: {
    arrivalDuration: 580,
    bodyX: 4,
    bodyY: 2.5,
    collisionShift: 0,
    eyeX: 2.6,
    eyeY: 1.8,
    overshoot: -3,
    rebound: 1.5,
    responseDuration: 190,
    rollRotation: -320,
    rotate: 1.5
  }
} as const;

export const COMPANION_LIFE: Record<CharacterName, CharacterLife> = {
  moss: {
    blinkMax: 6200,
    blinkMin: 3800,
    breathDuration: 6800,
    breathScale: 1.006,
    breathY: 1.2,
    doubleBlinkChance: 0.22,
    peek: false,
    slowBlinkChance: 0.12,
    swayX: 3
  },
  matcha: {
    blinkMax: 4600,
    blinkMin: 2600,
    breathDuration: 5600,
    breathScale: 1.008,
    breathY: 1,
    doubleBlinkChance: 0.29,
    peek: true,
    slowBlinkChance: 0.05,
    swayX: 2
  },
  sage: {
    blinkMax: 7500,
    blinkMin: 4800,
    breathDuration: 8500,
    breathScale: 1.003,
    breathY: 0.65,
    doubleBlinkChance: 0.1,
    peek: false,
    slowBlinkChance: 0.15,
    swayX: 1.5
  },
  fern: {
    blinkMax: 5000,
    blinkMin: 3000,
    breathDuration: 6400,
    breathScale: 1.006,
    breathY: 1.2,
    doubleBlinkChance: 0.24,
    peek: true,
    slowBlinkChance: 0.14,
    swayX: 2.5
  }
};

export const AMBIENT_LIFE = {
  ambientGraceMs: 350,
  ambientHandoffMs: 350,
  ambientTransitionMs: 450,
  bodyEventMaxMs: 6000,
  bodyEventMinMs: 3000,
  eyebrowMaxMs: 8000,
  eyebrowMinMs: 4000,
  glanceMaxMs: 7500,
  glanceMinMs: 3500,
  pointerDominanceMs: 750,
  schedulerTickMs: 900
} as const;

export const AUTH_INTRO_SESSION_KEY = "ai-tutor-auth-intro-seen";

const CHARACTER_NAMES: readonly CharacterName[] = ["moss", "matcha", "sage", "fern"];
const randomBetween = (minimum: number, maximum: number) => minimum + Math.random() * (maximum - minimum);

const clampAttention = (value: number) => Math.max(-1, Math.min(1, value));
const CHARACTER_INTRO_ORDER = ["moss", "matcha", "sage", "fern"] as const;
const INTRO_TIMELINE: ReadonlyArray<{ at: number; state: IntroState }> = [
  { at: 700, state: "matcha" },
  { at: 1360, state: "sage" },
  { at: 1980, state: "fern" },
  { at: 2560, state: "settled" },
  { at: 2720, state: "morph" },
  { at: 3240, state: "ready" }
];

const hasSeenAuthIntro = () => {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    return window.sessionStorage.getItem(AUTH_INTRO_SESSION_KEY) === "1";
  } catch {
    return false;
  }
};

const prefersReducedMotion = () => typeof window !== "undefined"
  && typeof window.matchMedia === "function"
  && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const getInitialIntroState = (): IntroState => hasSeenAuthIntro() || prefersReducedMotion() ? "ready" : "moss";

const markAuthIntroSeen = () => {
  try {
    window.sessionStorage.setItem(AUTH_INTRO_SESSION_KEY, "1");
  } catch {
    // Visual state persistence is progressive enhancement only.
  }
};

export const normalizeViewportPointer = ({
  clientX,
  clientY,
  viewportHeight,
  viewportWidth
}: ViewportPointerInput) => {
  if (viewportWidth <= 0 || viewportHeight <= 0) {
    return { x: 0, y: 0 };
  }

  return {
    x: Math.round(clampAttention((clientX / viewportWidth) * 2 - 1) * 100) / 100,
    y: Math.round(clampAttention((clientY / viewportHeight) * 2 - 1) * 100) / 100
  };
};

const getCharacterIntroPhase = (name: CharacterName, introState: IntroState): CharacterIntroPhase => {
  if (introState === "ready" || introState === "morph" || introState === "settled") {
    return introState;
  }

  const activeIndex = CHARACTER_INTRO_ORDER.indexOf(introState);
  const characterIndex = CHARACTER_INTRO_ORDER.indexOf(name);
  if (characterIndex < activeIndex) {
    return "settled";
  }

  return characterIndex === activeIndex ? "rolling" : "waiting";
};

const ShapeCharacter = ({ introState, name }: { introState: IntroState; name: CharacterName }) => {
  const motion = COMPANION_MOTION[name];
  const life = COMPANION_LIFE[name];
  const motionStyle = {
    "--auth-arrival-duration": `${motion.arrivalDuration}ms`,
    "--auth-arrival-overshoot": `${motion.overshoot}px`,
    "--auth-arrival-rebound": `${motion.rebound}px`,
    "--auth-body-rotate": `${motion.rotate}deg`,
    "--auth-body-x": `${motion.bodyX}px`,
    "--auth-body-y": `${motion.bodyY}px`,
    "--auth-breath-duration": `${life.breathDuration}ms`,
    "--auth-breath-scale": `${life.breathScale}`,
    "--auth-breath-y": `${life.breathY}px`,
    "--auth-collision-shift": `${motion.collisionShift}px`,
    "--auth-eye-x": `${motion.eyeX}px`,
    "--auth-eye-y": `${motion.eyeY}px`,
    "--auth-response-duration": `${motion.responseDuration}ms`,
    "--auth-roll-rotation": `${motion.rollRotation}deg`,
    "--auth-submitting-body-rotate": `${motion.rotate * 0.55}deg`,
    "--auth-submitting-body-x": `${motion.bodyX * 0.55}px`,
    "--auth-submitting-body-y": `${motion.bodyY * 0.55}px`,
    "--auth-submitting-eye-x": `${motion.eyeX * 0.55}px`,
    "--auth-submitting-eye-y": `${motion.eyeY * 0.55}px`,
    "--auth-sway-x": `${life.swayX}px`
  } as CSSProperties;

  return (
    <div
      className={`auth-shape-character auth-character-${name}`}
      data-character={name}
      data-intro-phase={getCharacterIntroPhase(name, introState)}
      data-testid="auth-companion-character"
      style={motionStyle}
    >
      <span className="auth-shape-face">
        <span className="auth-shape-brow auth-shape-brow-left" />
        <span className="auth-shape-brow auth-shape-brow-right" />
        <span className="auth-shape-eye auth-shape-eye-left"><i /></span>
        <span className="auth-shape-eye auth-shape-eye-right"><i /></span>
        <span className="auth-shape-mouth" />
      </span>
    </div>
  );
};

export const AuthStudyCompanion = ({ mode, state }: AuthStudyCompanionProps) => {
  const stageRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const ambientDeadlinesRef = useRef<AmbientDeadlines | null>(null);
  const ambientHandoffTimerRef = useRef<number | null>(null);
  const ambientSchedulerTimerRef = useRef<number | null>(null);
  const ambientSuppressedUntilRef = useRef(0);
  const attentionIdleTimerRef = useRef<number | null>(null);
  const attentionTransitionTimerRef = useRef<number | null>(null);
  const attentionCurrentRef = useRef<AttentionPoint>({ x: 0, y: 0 });
  const attentionSmoothingRef = useRef(0.17);
  const attentionTargetRef = useRef<AttentionPoint>({ x: 0, y: 0 });
  const blinkTimerRefs = useRef<Set<number>>(new Set());
  const majorEventTimerRefs = useRef<Set<number>>(new Set());
  const pointerActiveRef = useRef(false);
  const reactionTimerRef = useRef<number | null>(null);
  const visualStateRef = useRef(state);
  const [introState, setIntroState] = useState<IntroState>(getInitialIntroState);
  const introWasSkippedRef = useRef(introState === "ready");

  useEffect(() => {
    visualStateRef.current = state;
  }, [state]);

  useEffect(() => () => {
    if (reactionTimerRef.current !== null) {
      window.clearTimeout(reactionTimerRef.current);
      reactionTimerRef.current = null;
    }
  }, []);

  const scheduleAttention = (x: number, y: number, smoothing = 0.17) => {
    attentionTargetRef.current = { x, y };
    attentionSmoothingRef.current = smoothing;

    if (animationFrameRef.current !== null) {
      return;
    }

    const updateAttention = () => {
      const current = attentionCurrentRef.current;
      const target = attentionTargetRef.current;
      const smoothingFactor = attentionSmoothingRef.current;
      const next = {
        x: current.x + (target.x - current.x) * smoothingFactor,
        y: current.y + (target.y - current.y) * smoothingFactor
      };
      const settled = Math.abs(target.x - next.x) < 0.005 && Math.abs(target.y - next.y) < 0.005;
      attentionCurrentRef.current = settled ? target : next;
      stageRef.current?.style.setProperty("--auth-look-x", `${attentionCurrentRef.current.x}`);
      stageRef.current?.style.setProperty("--auth-look-y", `${attentionCurrentRef.current.y}`);
      animationFrameRef.current = settled ? null : requestAnimationFrame(updateAttention);
    };

    animationFrameRef.current = requestAnimationFrame(updateAttention);
  };

  useEffect(() => {
    const reducedMotion = prefersReducedMotion();

    if (reducedMotion || introWasSkippedRef.current) {
      return;
    }

    const introTimers = INTRO_TIMELINE.map(({ at, state: nextState }) => window.setTimeout(() => {
      setIntroState(nextState);
      if (nextState === "ready") {
        markAuthIntroSeen();
      }
    }, at));

    return () => {
      introTimers.forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  useEffect(() => {
    if (introState !== "ready" || typeof window.matchMedia !== "function") {
      return;
    }

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    const stage = stageRef.current;
    if (!stage) {
      return;
    }

    if (reducedMotion) {
      stage.dataset.attention = "ambient";
      stage.dataset.life = "reduced";
      return;
    }

    const blinkTimers = blinkTimerRefs.current;
    const majorEventTimers = majorEventTimerRefs.current;

    const getCharacter = (name: CharacterName) => stage.querySelector<HTMLElement>(`[data-character="${name}"]`);
    const clearTimerSet = (timers: Set<number>) => {
      timers.forEach((timer) => window.clearTimeout(timer));
      timers.clear();
    };
    const clearMajorEvents = () => {
      clearTimerSet(majorEventTimers);
      CHARACTER_NAMES.forEach((name) => getCharacter(name)?.removeAttribute("data-life-event"));
    };
    const scheduleAttributeClear = (
      element: HTMLElement,
      attribute: "data-blink" | "data-life-event",
      duration: number,
      timers: Set<number>
    ) => {
      const timer = window.setTimeout(() => {
        element.removeAttribute(attribute);
        timers.delete(timer);
      }, duration);
      timers.add(timer);
    };
    const blinkInterval = (name: CharacterName) => {
      const personality = COMPANION_LIFE[name];
      const submittingMultiplier = visualStateRef.current === "submitting" ? 1.45 : 1;
      return randomBetween(personality.blinkMin, personality.blinkMax) * submittingMultiplier;
    };
    const initializeDeadlines = (now: number): AmbientDeadlines => ({
      blink: {
        fern: now + blinkInterval("fern"),
        matcha: now + blinkInterval("matcha"),
        moss: now + blinkInterval("moss"),
        sage: now + blinkInterval("sage")
      },
      body: now + randomBetween(AMBIENT_LIFE.bodyEventMinMs, AMBIENT_LIFE.bodyEventMaxMs),
      eyebrow: now + randomBetween(AMBIENT_LIFE.eyebrowMinMs, AMBIENT_LIFE.eyebrowMaxMs),
      glance: now + randomBetween(AMBIENT_LIFE.glanceMinMs, AMBIENT_LIFE.glanceMaxMs)
    });
    const triggerBlink = (now: number) => {
      const deadlines = ambientDeadlinesRef.current;
      if (!deadlines || now < ambientSuppressedUntilRef.current) {
        return;
      }

      const dueCharacter = CHARACTER_NAMES
        .filter((name) => deadlines.blink[name] <= now)
        .sort((first, second) => deadlines.blink[first] - deadlines.blink[second])[0];
      if (!dueCharacter) {
        return;
      }

      const character = getCharacter(dueCharacter);
      if (!character || character.hasAttribute("data-blink") || character.hasAttribute("data-life-event")) {
        return;
      }

      const personality = COMPANION_LIFE[dueCharacter];
      const blinkRoll = Math.random();
      const blink = blinkRoll < personality.slowBlinkChance
        ? "slow"
        : blinkRoll < personality.slowBlinkChance + personality.doubleBlinkChance
          ? "double"
          : "single";
      character.dataset.blink = blink;
      scheduleAttributeClear(character, "data-blink", blink === "double" ? 430 : blink === "slow" ? 240 : 140, blinkTimerRefs.current);
      deadlines.blink[dueCharacter] = now + blinkInterval(dueCharacter);
    };
    const chooseCharacter = (names: readonly CharacterName[]) => names[Math.floor(Math.random() * names.length)] ?? names[0];
    const glanceEventFor = (name: CharacterName) => {
      const currentState = visualStateRef.current;
      if (currentState === "error") {
        return name === "fern" ? "glance-right" : "glance-left";
      }
      if (currentState === "email" && (name === "matcha" || name === "fern") && Math.random() < 0.7) {
        return "glance-form";
      }
      if ((currentState === "password" || currentState === "password-visible")
        && (name === "moss" || name === "sage") && Math.random() < 0.6) {
        return "glance-form";
      }
      return name === "sage" ? "glance-card" : name === "fern" ? "glance-left" : "glance-right";
    };
    const triggerMajorEvent = (now: number) => {
      const deadlines = ambientDeadlinesRef.current;
      const currentState = visualStateRef.current;
      if (!deadlines || now < ambientSuppressedUntilRef.current
        || currentState === "submitting" || currentState === "success") {
        return;
      }

      const eventRate = currentState === "error" ? 1.65 : 1;
      const dueEvents = [
        { at: deadlines.body, kind: "body" as const },
        { at: deadlines.eyebrow, kind: "eyebrow" as const },
        { at: deadlines.glance, kind: "glance" as const }
      ].filter(({ at, kind }) => at <= now
        && (currentState !== "error" || kind === "glance")
        && (!pointerActiveRef.current || kind === "eyebrow"))
        .sort((first, second) => first.at - second.at);
      const dueEvent = dueEvents[0];
      if (!dueEvent || (pointerActiveRef.current && Math.random() >= 0.55)) {
        return;
      }

      let participants: readonly CharacterName[] = ["matcha", "fern", "moss", "sage"];
      if (currentState === "email") {
        participants = ["matcha", "fern", "moss", "sage"];
      } else if (currentState === "password" || currentState === "password-visible") {
        participants = ["sage", "moss", "matcha", "fern"];
      } else if (currentState === "error") {
        participants = ["fern", "matcha", "moss", "sage"];
      }
      const name = chooseCharacter(participants);
      const character = getCharacter(name);
      if (!character || character.hasAttribute("data-life-event") || character.hasAttribute("data-blink")) {
        return;
      }

      let eventName: string;
      let duration: number;
      if (dueEvent.kind === "glance") {
        eventName = currentState !== "error" && (name === "matcha" || name === "fern") && Math.random() < 0.22
          ? "dart"
          : glanceEventFor(name);
        duration = eventName === "dart" ? 420 : 700;
        deadlines.glance = now + randomBetween(AMBIENT_LIFE.glanceMinMs, AMBIENT_LIFE.glanceMaxMs) * eventRate;
      } else if (dueEvent.kind === "eyebrow") {
        eventName = "eyebrow";
        duration = 380;
        deadlines.eyebrow = now + randomBetween(AMBIENT_LIFE.eyebrowMinMs, AMBIENT_LIFE.eyebrowMaxMs);
      } else {
        eventName = COMPANION_LIFE[name].peek && Math.random() < 0.45 ? "peek" : "sway";
        duration = eventName === "peek" ? 850 : 680;
        deadlines.body = now + randomBetween(AMBIENT_LIFE.bodyEventMinMs, AMBIENT_LIFE.bodyEventMaxMs);
      }

      character.dataset.lifeEvent = eventName;
      scheduleAttributeClear(character, "data-life-event", duration, majorEventTimerRefs.current);

      if (eventName.startsWith("glance") && name !== "sage" && Math.random() < 0.45) {
        const responseName: CharacterName = name === "matcha" ? "sage" : name === "fern" ? "moss" : "fern";
        const responseTimer = window.setTimeout(() => {
          majorEventTimerRefs.current.delete(responseTimer);
          if (pointerActiveRef.current) {
            return;
          }
          const responder = getCharacter(responseName);
          if (!responder || responder.hasAttribute("data-life-event") || responder.hasAttribute("data-blink")) {
            return;
          }
          responder.dataset.lifeEvent = "glance-response";
          scheduleAttributeClear(responder, "data-life-event", 480, majorEventTimerRefs.current);
        }, 260);
        majorEventTimerRefs.current.add(responseTimer);
      }
    };
    const runAmbientScheduler = () => {
      const now = Date.now();
      triggerBlink(now);
      triggerMajorEvent(now);
      ambientSchedulerTimerRef.current = window.setTimeout(runAmbientScheduler, AMBIENT_LIFE.schedulerTickMs);
    };
    const enableAmbientLife = () => {
      const now = Date.now();
      ambientDeadlinesRef.current = initializeDeadlines(now);
      stage.dataset.attention = pointerActiveRef.current ? "pointer" : "ambient";
      stage.dataset.life = pointerActiveRef.current ? "pointer" : "ambient";
      ambientSchedulerTimerRef.current = window.setTimeout(runAmbientScheduler, AMBIENT_LIFE.schedulerTickMs);
      ambientHandoffTimerRef.current = null;
    };

    const clearAttentionIdleTimer = () => {
      if (attentionIdleTimerRef.current !== null) {
        window.clearTimeout(attentionIdleTimerRef.current);
        attentionIdleTimerRef.current = null;
      }
    };
    const clearAttentionTransitionTimer = () => {
      if (attentionTransitionTimerRef.current !== null) {
        window.clearTimeout(attentionTransitionTimerRef.current);
        attentionTransitionTimerRef.current = null;
      }
    };
    const transitionToAmbient = (duration: number) => {
      clearAttentionIdleTimer();
      clearAttentionTransitionTimer();
      stage.dataset.attention = "settling";
      stage.dataset.life = "handoff";
      scheduleAttention(0, 0, duration < AMBIENT_LIFE.ambientTransitionMs ? 0.3 : 0.14);
      attentionTransitionTimerRef.current = window.setTimeout(() => {
        pointerActiveRef.current = false;
        stage.dataset.attention = "ambient";
        stage.dataset.life = "ambient";
        ambientSuppressedUntilRef.current = Date.now() + AMBIENT_LIFE.ambientGraceMs;
        attentionTransitionTimerRef.current = null;
      }, duration);
    };
    const handlePointerMove = (event: globalThis.PointerEvent) => {
      if (event.pointerType !== "mouse" || stage.hasAttribute("data-reaction")
        || visualStateRef.current === "submitting") {
        return;
      }

      const attention = normalizeViewportPointer({
        clientX: event.clientX,
        clientY: event.clientY,
        viewportHeight: window.innerHeight,
        viewportWidth: window.innerWidth
      });
      pointerActiveRef.current = true;
      clearMajorEvents();
      clearAttentionTransitionTimer();
      stage.dataset.attention = "pointer";
      stage.dataset.life = "pointer";
      scheduleAttention(attention.x, attention.y);
      clearAttentionIdleTimer();
      attentionIdleTimerRef.current = window.setTimeout(
        () => transitionToAmbient(AMBIENT_LIFE.ambientTransitionMs),
        AMBIENT_LIFE.pointerDominanceMs
      );
    };
    const handlePointerOut = (event: globalThis.PointerEvent) => {
      if (event.relatedTarget === null) {
        transitionToAmbient(300);
      }
    };

    const handleBlur = () => transitionToAmbient(300);

    stage.dataset.attention = "ambient";
    stage.dataset.life = "handoff";
    ambientHandoffTimerRef.current = window.setTimeout(enableAmbientLife, AMBIENT_LIFE.ambientHandoffMs);

    if (finePointer) {
      window.addEventListener("blur", handleBlur);
      window.addEventListener("pointermove", handlePointerMove, { passive: true });
      window.addEventListener("pointerout", handlePointerOut);
    }

    return () => {
      if (finePointer) {
        window.removeEventListener("blur", handleBlur);
        window.removeEventListener("pointermove", handlePointerMove);
        window.removeEventListener("pointerout", handlePointerOut);
      }
      pointerActiveRef.current = false;
      clearAttentionIdleTimer();
      clearAttentionTransitionTimer();
      clearMajorEvents();
      clearTimerSet(blinkTimers);
      if (ambientHandoffTimerRef.current !== null) {
        window.clearTimeout(ambientHandoffTimerRef.current);
        ambientHandoffTimerRef.current = null;
      }
      if (ambientSchedulerTimerRef.current !== null) {
        window.clearTimeout(ambientSchedulerTimerRef.current);
        ambientSchedulerTimerRef.current = null;
      }
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [introState]);

  useEffect(() => {
    const stage = stageRef.current;
    if (introState !== "ready" || !stage || typeof window.matchMedia !== "function"
      || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    if (reactionTimerRef.current !== null) {
      window.clearTimeout(reactionTimerRef.current);
      reactionTimerRef.current = null;
    }

    if (state === "submitting" || state === "success" || state === "error" || state === "password-visible") {
      majorEventTimerRefs.current.forEach((timer) => window.clearTimeout(timer));
      majorEventTimerRefs.current.clear();
      stage.querySelectorAll<HTMLElement>("[data-life-event]").forEach((character) => character.removeAttribute("data-life-event"));
    }

    const reactionDuration = state === "error" ? 280 : state === "success" ? 420 : state === "password-visible" ? 620 : 0;
    if (reactionDuration === 0) {
      stage.removeAttribute("data-reaction");
      return;
    }

    blinkTimerRefs.current.forEach((timer) => window.clearTimeout(timer));
    blinkTimerRefs.current.clear();
    stage.querySelectorAll<HTMLElement>("[data-blink]").forEach((character) => character.removeAttribute("data-blink"));
    if (attentionIdleTimerRef.current !== null) {
      window.clearTimeout(attentionIdleTimerRef.current);
      attentionIdleTimerRef.current = null;
    }
    if (attentionTransitionTimerRef.current !== null) {
      window.clearTimeout(attentionTransitionTimerRef.current);
      attentionTransitionTimerRef.current = null;
    }
    pointerActiveRef.current = false;
    stage.dataset.attention = "ambient";
    stage.dataset.life = "ambient";
    scheduleAttention(0, 0, 0.3);
    stage.dataset.reaction = state;
    ambientSuppressedUntilRef.current = Date.now() + reactionDuration;
    if (state === "error" && ambientDeadlinesRef.current) {
      ambientDeadlinesRef.current.glance = Date.now() + 1800;
    }
    reactionTimerRef.current = window.setTimeout(() => {
      stage.removeAttribute("data-reaction");
      reactionTimerRef.current = null;
    }, reactionDuration);

    return () => {
      if (reactionTimerRef.current !== null) {
        window.clearTimeout(reactionTimerRef.current);
        reactionTimerRef.current = null;
      }
      stage.removeAttribute("data-reaction");
    };
  }, [introState, state]);

  const statusCopy = state === "submitting"
    ? mode === "login" ? "กำลังตรวจสอบ" : "กำลังสร้างพื้นที่เรียน"
    : state === "success"
      ? mode === "login" ? "ยินดีต้อนรับกลับ" : "พร้อมเรียนต่อแล้ว"
      : "พื้นที่เรียนของคุณ";

  return (
    <div
      className="auth-study-companion"
      data-intro={introState}
      data-state={state}
      data-testid="auth-study-companion"
      ref={stageRef}
    >
      <div className="auth-companion-orbit auth-companion-orbit-one" aria-hidden="true" />
      <div className="auth-companion-orbit auth-companion-orbit-two" aria-hidden="true" />

      <div className="auth-companion-document" aria-hidden="true">
        <span className="auth-companion-document-icon"><FileText className="h-5 w-5" /></span>
        <span className="auth-companion-document-lines"><i /><i /><i /></span>
      </div>

      <div aria-hidden="true" className="auth-companion-team" data-testid="auth-companion-team">
        <span className="auth-team-success-spark"><Sparkles className="h-4 w-4" /></span>
        <ShapeCharacter introState={introState} name="moss" />
        <ShapeCharacter introState={introState} name="matcha" />
        <ShapeCharacter introState={introState} name="sage" />
        <ShapeCharacter introState={introState} name="fern" />
      </div>

      {state !== "error" && (
        <div
          aria-hidden="true"
          className="auth-companion-status auth-companion-status-chip"
          data-testid="auth-companion-status-chip"
        >
          <span className="auth-companion-status-icon">
            {state === "password" || state === "password-visible" ? <LockKeyhole className="h-4 w-4" /> : <Check className="h-4 w-4" />}
          </span>
          <span>{statusCopy}</span>
        </div>
      )}

      <div className="auth-companion-prompt" aria-hidden="true">
        <span className="auth-companion-prompt-dot" />
        <span>{state === "email" ? "กำลังเชื่อมต่อเอกสารของคุณ" : state === "password-visible" ? "ตรวจสอบรหัสผ่านอย่างปลอดภัย" : "สรุป · ถาม · ทบทวน"}</span>
      </div>
    </div>
  );
};
