import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { HOME_LANGUAGE_STORAGE_KEY, HOME_THEME_STORAGE_KEY } from "./homePreferences";
import { HomeLandingPage } from "./HomeLandingPage";

const matchMedia = vi.fn();
const mediaQuery = (matches: boolean) => ({
  addEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
  matches,
  media: "",
  onchange: null,
  removeEventListener: vi.fn()
});

describe("HomeLandingPage preferences", () => {
  afterEach(() => {
    localStorage.clear();
    matchMedia.mockReset();
    Object.defineProperty(window, "matchMedia", { configurable: true, value: undefined });
    Object.defineProperty(window, "IntersectionObserver", { configurable: true, value: undefined });
  });

  it("defaults to English and changes the visible copy while persisting a language choice", async () => {
    matchMedia.mockReturnValue(mediaQuery(false));
    Object.defineProperty(window, "matchMedia", { configurable: true, value: matchMedia });
    render(<HomeLandingPage initialSession={null} />);

    expect(await screen.findByRole("heading", { name: "Turn your documents into an AI study workspace." })).toBeInTheDocument();
    expect(screen.getByRole("main").parentElement).toHaveAttribute("lang", "en");
    fireEvent.click(screen.getByRole("button", { name: "Language: EN" }));

    expect(screen.getByRole("heading", { name: "เปลี่ยนเอกสารของคุณให้เป็นพื้นที่เรียนกับ AI" })).toBeInTheDocument();
    expect(screen.getByRole("main").parentElement).toHaveAttribute("lang", "th");
    expect(localStorage.getItem(HOME_LANGUAGE_STORAGE_KEY)).toBe("th");
  });

  it("restores Thai from storage", async () => {
    localStorage.setItem(HOME_LANGUAGE_STORAGE_KEY, "th");
    matchMedia.mockReturnValue(mediaQuery(false));
    Object.defineProperty(window, "matchMedia", { configurable: true, value: matchMedia });
    render(<HomeLandingPage initialSession={null} />);

    expect(await screen.findByRole("heading", { name: "เปลี่ยนเอกสารของคุณให้เป็นพื้นที่เรียนกับ AI" })).toBeInTheDocument();
  });

  it("persists English when toggling back from Thai", async () => {
    localStorage.setItem(HOME_LANGUAGE_STORAGE_KEY, "th");
    matchMedia.mockReturnValue(mediaQuery(false));
    Object.defineProperty(window, "matchMedia", { configurable: true, value: matchMedia });
    render(<HomeLandingPage initialSession={null} />);

    const languageButton = await screen.findByRole("button", { name: "ภาษา: TH" });
    fireEvent.click(languageButton);

    expect(screen.getByRole("heading", { name: "Turn your documents into an AI study workspace." })).toBeInTheDocument();
    expect(localStorage.getItem(HOME_LANGUAGE_STORAGE_KEY)).toBe("en");
  });

  it("uses the system Dark theme until an explicit stored Light preference wins", async () => {
    matchMedia.mockReturnValue(mediaQuery(true));
    Object.defineProperty(window, "matchMedia", { configurable: true, value: matchMedia });
    const { container, unmount } = render(<HomeLandingPage initialSession={null} />);

    await waitFor(() => expect(container.firstElementChild).toHaveAttribute("data-home-theme", "dark"));
    unmount();
    localStorage.setItem(HOME_THEME_STORAGE_KEY, "light");
    render(<HomeLandingPage initialSession={null} />);

    await waitFor(() => expect(screen.getByRole("main").parentElement).toHaveAttribute("data-home-theme", "light"));
  });

  it("toggles the theme icon, pressed state, root attribute, and persisted preference", async () => {
    matchMedia.mockReturnValue(mediaQuery(false));
    Object.defineProperty(window, "matchMedia", { configurable: true, value: matchMedia });
    render(<HomeLandingPage initialSession={null} />);

    const themeButton = await screen.findByRole("button", { name: "Theme: Light" });
    expect(themeButton).toHaveAttribute("aria-pressed", "false");
    expect(themeButton).toHaveTextContent("Sun");
    fireEvent.click(themeButton);

    expect(screen.getByRole("button", { name: "Theme: Dark" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Theme: Dark" })).toHaveTextContent("Moon");
    expect(screen.getByRole("main").parentElement).toHaveAttribute("data-home-theme", "dark");
    expect(localStorage.getItem(HOME_THEME_STORAGE_KEY)).toBe("dark");
  });

  it("renders the approved product story without unsupported marketing claims", async () => {
    matchMedia.mockReturnValue(mediaQuery(false));
    Object.defineProperty(window, "matchMedia", { configurable: true, value: matchMedia });
    render(<HomeLandingPage initialSession={null} />);

    expect(await screen.findByRole("heading", { name: "A study kit that grows from the same source." })).toBeInTheDocument();
    [
      "Follow one clear path from source to review.",
      "A bilingual interface for the material in front of you.",
      "Move from reading to active recall.",
      "See a useful next step, not a vanity number.",
      "Know what the interface is showing you.",
      "Start where you are.",
      "Clear answers before you begin.",
      "Bring your next document into a clearer study loop."
    ].forEach((heading) => expect(screen.getByRole("heading", { name: heading })).toBeInTheDocument());

    expect(screen.getByText("Illustrative progress preview")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Quiz / Review" })).toBeInTheDocument();
    expect(screen.queryByText(/\$0|unlimited|rating|testimonial/i)).not.toBeInTheDocument();
  });

  it("progressively reveals lower-page storytelling while keeping it visible before enhancement", async () => {
    const callbacks: IntersectionObserverCallback[] = [];
    class TestIntersectionObserver implements IntersectionObserver {
      readonly root = null;
      readonly rootMargin = "0px";
      readonly thresholds = [0];
      disconnect = vi.fn();
      observe = vi.fn();
      takeRecords = vi.fn(() => []);
      unobserve = vi.fn();
      constructor(callback: IntersectionObserverCallback) { callbacks.push(callback); }
    }
    Object.defineProperty(window, "IntersectionObserver", { configurable: true, value: TestIntersectionObserver });
    matchMedia.mockImplementation((query: string) => mediaQuery(query.includes("prefers-reduced-motion") ? false : false));
    Object.defineProperty(window, "matchMedia", { configurable: true, value: matchMedia });

    render(<HomeLandingPage initialSession={null} />);

    const promise = await screen.findByRole("region", { name: "Learning features" });
    expect(promise).toHaveAttribute("data-home-reveal");
    expect(promise).not.toHaveClass("is-revealed");
    expect(promise).toBeVisible();
    await waitFor(() => expect(screen.getByRole("main").parentElement).toHaveClass("home-motion-ready"));

    const revealCallback = callbacks.find((callback) => callback.length >= 2) ?? callbacks.at(-1);
    const bounds = promise.getBoundingClientRect();
    act(() => revealCallback?.([{
      boundingClientRect: bounds,
      intersectionRatio: 1,
      intersectionRect: bounds,
      isIntersecting: true,
      rootBounds: null,
      target: promise,
      time: 0
    }], {} as IntersectionObserver));

    expect(promise).toHaveClass("is-revealed");
  });

  it("supports keyboard walkthrough tabs and keeps one selected panel", async () => {
    matchMedia.mockReturnValue(mediaQuery(false));
    Object.defineProperty(window, "matchMedia", { configurable: true, value: matchMedia });
    render(<HomeLandingPage initialSession={null} />);

    const firstTab = await screen.findByRole("tab", { name: "01 Upload & summarize" });
    const secondTab = screen.getByRole("tab", { name: "02 Ask & clarify" });
    expect(firstTab).toHaveAttribute("aria-selected", "true");
    firstTab.focus();
    fireEvent.keyDown(firstTab, { key: "ArrowRight" });
    expect(secondTab).toHaveFocus();
    expect(secondTab).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Keep the selected document in view");
  });
});
