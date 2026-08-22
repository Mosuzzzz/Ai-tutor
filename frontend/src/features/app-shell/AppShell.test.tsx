import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { AuthSession } from "../auth/types";
import type { DocumentLibraryResponse } from "../document-summary/documentSummaryContract";
import { HOME_LANGUAGE_STORAGE_KEY, HOME_THEME_STORAGE_KEY } from "../home/homePreferences";
import type { StudyDashboardResponse } from "../study-dashboard/studyDashboardContract";
import { toStudyDashboardViewModel } from "../study-dashboard/studyDashboardMapper";
import { StudyDashboardPage } from "../study-dashboard/StudyDashboardPage";
import { AppShell } from "./AppShell";

const routerRefresh = vi.hoisted(() => vi.fn());
const routerReplace = vi.hoisted(() => vi.fn());
let pathname = "/documents/summary-1";

vi.mock("next/navigation", () => ({
  usePathname: () => pathname,
  useRouter: () => ({ refresh: routerRefresh, replace: routerReplace })
}));

const jsonResponse = (body: unknown, init: ResponseInit = {}) =>
  new Response(JSON.stringify(body), {
    headers: { "content-type": "application/json" },
    status: init.status ?? 200
  });

const learnerSession: AuthSession = {
  mode: "http-only-cookie",
  storesTokenInClient: false,
  user: {
    displayName: "Learner",
    email: "a-very-long-learning-account@example.com",
    role: "user"
  }
};

const emptyAnalytics: StudyDashboardResponse = {
  average_score: 0,
  completed_quizzes: 0,
  read_documents_count: 0,
  recent_scores: [],
  score_trend: [],
  streak_days: 0
};

const emptyDocuments: DocumentLibraryResponse = {
  documents: [],
  status_counts: { error: 0, pending: 0, processing: 0, ready: 0 },
  total_documents: 0
};

const populatedAnalytics: StudyDashboardResponse = {
  ...emptyAnalytics,
  average_score: 88,
  completed_quizzes: 2,
  recent_scores: [{ exam_id: "exam-1", filename: "ชีววิทยา.pdf", id: "review-1", score: 88, submitted_at: "2026-08-21T10:00:00.000Z" }],
  score_trend: [
    { average_score: 82, date: "2026-08-20" },
    { average_score: 88, date: "2026-08-21" }
  ]
};

const populatedDocuments: DocumentLibraryResponse = {
  documents: [{
    created_at: "2026-08-21T09:00:00.000Z",
    filename: "ชีววิทยา.pdf",
    id: "document-1",
    related_exams_count: 1,
    status: "ready",
    summary_available: true,
    summary_markdown: null
  }],
  status_counts: { error: 0, pending: 0, processing: 0, ready: 1 },
  total_documents: 1
};

describe("AppShell", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
    routerRefresh.mockReset();
    routerReplace.mockReset();
    pathname = "/documents/summary-1";
    document.body.style.overflow = "";
  });

  afterEach(() => vi.unstubAllGlobals());

  it("keeps the protected content landmark under the shared horizontal product header", () => {
    render(<AppShell session={learnerSession}><p>Route content</p></AppShell>);

    expect(screen.getByRole("link", { name: "ข้ามไปยังเนื้อหาหลัก" })).toHaveAttribute("href", "#main-content");
    expect(screen.getByRole("banner", { name: "Product header" })).toBeInTheDocument();
    expect(screen.queryByRole("complementary", { name: "แถบนำทางหลัก" })).not.toBeInTheDocument();
    expect(screen.queryByRole("banner", { name: "แถบบนของแอป" })).not.toBeInTheDocument();
    expect(screen.getByRole("main", { name: "พื้นที่เนื้อหาหลัก" })).toHaveAttribute("id", "main-content");
  });

  it("provides direct product routes and preserves nested active navigation", () => {
    render(<AppShell session={learnerSession}><p>Route content</p></AppShell>);

    expect(screen.getByRole("link", { name: "Dashboard" })).toHaveAttribute("href", "/dashboard");
    expect(screen.getByRole("link", { name: "Documents" })).toHaveAttribute("href", "/documents");
    expect(screen.getByRole("link", { name: "Chat" })).toHaveAttribute("href", "/chat");
    expect(screen.getByRole("link", { name: "Quiz" })).toHaveAttribute("href", "/quiz");
    expect(screen.getByRole("link", { name: "Analytics" })).toHaveAttribute("href", "/analytics");
    expect(screen.getByRole("link", { name: "Documents" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Dashboard" })).not.toHaveAttribute("aria-current");
  });

  it("uses the approved shared wordmark and omits retired or unsupported navigation", () => {
    render(<AppShell session={learnerSession}><p>Route content</p></AppShell>);

    expect(screen.getByRole("link", { name: "AI Tutor home" })).toHaveAttribute("href", "/home");
    expect(screen.getByRole("link", { name: "AI Tutor home" }).querySelector("img")).toHaveAttribute("src", expect.stringContaining("ai-tutor-wordmark-green.png"));
    expect(screen.queryByRole("link", { name: /Courses|คอร์สเรียน/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /My workspace|พื้นที่เรียนของฉัน/ })).not.toBeInTheDocument();
  });

  it("restores the shared language preference for App navigation chrome", async () => {
    localStorage.setItem(HOME_LANGUAGE_STORAGE_KEY, "th");
    render(<AppShell session={learnerSession}><p>Route content</p></AppShell>);

    expect(await screen.findByRole("link", { name: "เอกสารของฉัน" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("button", { name: "ภาษา: TH" })).toBeInTheDocument();
  });

  it("keeps an empty Dashboard in the same active language as the product navigation", async () => {
    const dashboard = toStudyDashboardViewModel({ analytics: emptyAnalytics, documents: emptyDocuments, session: learnerSession });
    render(<AppShell session={learnerSession}><StudyDashboardPage dashboard={dashboard} status="empty" /></AppShell>);

    expect(screen.getByRole("button", { name: "Language: EN" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "Start with your documents" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "Learning overview" })).toBeInTheDocument();
    expect(screen.queryByText("เริ่มจากเอกสารของคุณ")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Language: EN" }));

    expect(await screen.findByRole("button", { name: "ภาษา: TH" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "เริ่มจากเอกสารของคุณ" })).toBeInTheDocument();
    expect(screen.queryByText("Start with your documents")).not.toBeInTheDocument();
  });

  it("localizes populated Dashboard copy, dates, and accessibility text without translating user data", async () => {
    const dashboard = toStudyDashboardViewModel({
      analytics: populatedAnalytics,
      documents: populatedDocuments,
      session: learnerSession,
      timestamp: new Date("2026-08-22T10:00:00.000Z")
    });
    render(<AppShell session={learnerSession}><StudyDashboardPage dashboard={dashboard} status="ready" /></AppShell>);

    const page = screen.getByTestId("study-dashboard");
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Welcome back, Learner");
    expect(screen.getByRole("heading", { level: 2, name: "Continue learning" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "Quiz score trend" })).toBeInTheDocument();
    expect(screen.getAllByText("ชีววิทยา.pdf").length).toBeGreaterThan(0);
    expect(screen.getByText(/Quiz score trend from 2 data points: 82%, 88%/)).toBeInTheDocument();
    expect(screen.getAllByText(/Uploaded Aug 21, 2026/).length).toBeGreaterThan(0);
    expect(page).not.toHaveTextContent(/แนวโน้มคะแนนควิซ|เอกสารล่าสุด|การทบทวนล่าสุด|ทำอะไรต่อได้บ้าง/);

    fireEvent.click(screen.getByRole("button", { name: "Language: EN" }));

    expect(await screen.findByRole("heading", { level: 1 })).toHaveTextContent("กลับมาเรียนต่อกันเถอะ, Learner");
    expect(screen.getByRole("heading", { level: 2, name: "แนวโน้มคะแนนควิซ" })).toBeInTheDocument();
    expect(screen.getByText(/แนวโน้มคะแนนควิซจาก 2 จุดข้อมูล: 82%, 88%/)).toBeInTheDocument();
    expect(screen.getAllByText("ชีววิทยา.pdf").length).toBeGreaterThan(0);
    expect(screen.getAllByText(/อัปโหลด 21 ส.ค. 2569/).length).toBeGreaterThan(0);
    expect(page).not.toHaveTextContent(/Quiz score trend|Recent documents|Recent reviews|What you can do next/);
  });

  it("themes only the shared frame while keeping the transitional feature body on its stable canvas", async () => {
    localStorage.setItem(HOME_THEME_STORAGE_KEY, "dark");
    const { container } = render(<AppShell session={learnerSession}><p>Route content</p></AppShell>);

    await waitFor(() => expect(container.firstElementChild).toHaveAttribute("data-product-theme", "dark"));
    expect(screen.getByRole("main", { name: "พื้นที่เนื้อหาหลัก" })).toHaveClass("bg-foundation-canvas");
  });

  it("does not serialize session implementation details into protected chrome", () => {
    render(<AppShell session={learnerSession}><p>Route content</p></AppShell>);

    expect(screen.queryByText("http-only-cookie")).not.toBeInTheDocument();
    expect(screen.queryByText("storesTokenInClient")).not.toBeInTheDocument();
    expect(screen.queryByRole("searchbox")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /notification|help|การแจ้งเตือน|ช่วยเหลือ/i })).not.toBeInTheDocument();
  });

  it("keeps the account trigger compact and Settings inside the account menu", () => {
    render(<AppShell session={learnerSession}><p>Route content</p></AppShell>);
    const trigger = screen.getByRole("button", { name: /Open account menu Learner/ });

    expect(trigger).not.toHaveTextContent(learnerSession.user.email);
    expect(screen.queryByRole("link", { name: "Settings" })).not.toBeInTheDocument();
    fireEvent.click(trigger);

    const menu = screen.getByRole("menu", { name: "Account menu" });
    expect(menu).toHaveTextContent(learnerSession.user.email);
    expect(within(menu).getByRole("menuitem", { name: "Settings" })).toHaveAttribute("href", "/settings");
  });

  it("preserves mobile focus, Escape, restoration, and body locking", async () => {
    render(<AppShell session={learnerSession}><p>Route content</p></AppShell>);
    const menuButton = screen.getByRole("button", { name: "Open navigation menu" });
    menuButton.focus();
    fireEvent.click(menuButton);

    expect(screen.getByRole("dialog", { name: "Product navigation" })).toBeInTheDocument();
    expect(document.body.style.overflow).toBe("hidden");
    expect(screen.getByRole("button", { name: "Close navigation menu" })).toHaveFocus();
    fireEvent.keyDown(document, { key: "Escape" });

    await waitFor(() => expect(screen.queryByRole("dialog", { name: "Product navigation" })).not.toBeInTheDocument());
    expect(document.body.style.overflow).toBe("");
    expect(menuButton).toHaveFocus();
  });

  it("preserves protected-App logout through the same-origin BFF and redirects to /login", async () => {
    const fetcher = vi.spyOn(globalThis, "fetch").mockResolvedValue(jsonResponse({ message: "Logged out", ok: true }));
    render(<AppShell session={learnerSession}><p>Route content</p></AppShell>);
    fireEvent.click(screen.getByRole("button", { name: /Open account menu Learner/ }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Log out" }));

    await waitFor(() => expect(fetcher).toHaveBeenCalledWith("/api/auth/logout", expect.objectContaining({ credentials: "same-origin", method: "POST" })));
    expect(routerReplace).toHaveBeenCalledWith("/login");
    expect(routerRefresh).toHaveBeenCalledTimes(1);
  });
});
