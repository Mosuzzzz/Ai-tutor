import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { HOME_LANGUAGE_STORAGE_KEY, HOME_THEME_STORAGE_KEY } from "./homePreferences";
import { HomeLandingPage } from "./HomeLandingPage";

const matchMedia = vi.fn();

describe("HomeLandingPage preferences", () => {
  afterEach(() => {
    localStorage.clear();
    matchMedia.mockReset();
    Object.defineProperty(window, "matchMedia", { configurable: true, value: undefined });
  });

  it("defaults to English and changes the visible copy while persisting a language choice", async () => {
    matchMedia.mockReturnValue({ matches: false });
    Object.defineProperty(window, "matchMedia", { configurable: true, value: matchMedia });
    render(<HomeLandingPage initialSession={null} />);

    expect(await screen.findByRole("heading", { name: "Learn smarter. Understand more." })).toBeInTheDocument();
    expect(screen.getByRole("main").parentElement).toHaveAttribute("lang", "en");
    fireEvent.click(screen.getByRole("button", { name: "Language: EN" }));

    expect(screen.getByRole("heading", { name: "เรียนได้ฉลาดขึ้น เข้าใจได้มากกว่า" })).toBeInTheDocument();
    expect(screen.getByRole("main").parentElement).toHaveAttribute("lang", "th");
    expect(localStorage.getItem(HOME_LANGUAGE_STORAGE_KEY)).toBe("th");
  });

  it("restores Thai from storage", async () => {
    localStorage.setItem(HOME_LANGUAGE_STORAGE_KEY, "th");
    matchMedia.mockReturnValue({ matches: false });
    Object.defineProperty(window, "matchMedia", { configurable: true, value: matchMedia });
    render(<HomeLandingPage initialSession={null} />);

    expect(await screen.findByRole("heading", { name: "เรียนได้ฉลาดขึ้น เข้าใจได้มากกว่า" })).toBeInTheDocument();
  });

  it("persists English when toggling back from Thai", async () => {
    localStorage.setItem(HOME_LANGUAGE_STORAGE_KEY, "th");
    matchMedia.mockReturnValue({ matches: false });
    Object.defineProperty(window, "matchMedia", { configurable: true, value: matchMedia });
    render(<HomeLandingPage initialSession={null} />);

    const languageButton = await screen.findByRole("button", { name: "ภาษา: TH" });
    fireEvent.click(languageButton);

    expect(screen.getByRole("heading", { name: "Learn smarter. Understand more." })).toBeInTheDocument();
    expect(localStorage.getItem(HOME_LANGUAGE_STORAGE_KEY)).toBe("en");
  });

  it("uses the system Dark theme until an explicit stored Light preference wins", async () => {
    matchMedia.mockReturnValue({ matches: true });
    Object.defineProperty(window, "matchMedia", { configurable: true, value: matchMedia });
    const { container, unmount } = render(<HomeLandingPage initialSession={null} />);

    await waitFor(() => expect(container.firstElementChild).toHaveAttribute("data-home-theme", "dark"));
    unmount();
    localStorage.setItem(HOME_THEME_STORAGE_KEY, "light");
    render(<HomeLandingPage initialSession={null} />);

    await waitFor(() => expect(screen.getByRole("main").parentElement).toHaveAttribute("data-home-theme", "light"));
  });

  it("toggles the theme icon, pressed state, root attribute, and persisted preference", async () => {
    matchMedia.mockReturnValue({ matches: false });
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
});
