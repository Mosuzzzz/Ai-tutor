import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import AnalyticsPage from "./analytics/page";
import ChatPage from "./chat/page";
import CoursesPage from "./courses/page";
import DocumentsPage from "./documents/page";
import QuizPage from "./quiz/page";
import SettingsPage from "./settings/page";

const routePages = [
  { Component: CoursesPage, title: "คอร์สเรียน" },
  { Component: DocumentsPage, title: "สรุปเอกสาร" },
  { Component: ChatPage, title: "แชท AI" },
  { Component: QuizPage, title: "สร้างควิซ" },
  { Component: AnalyticsPage, title: "สถิติการเรียน" },
  { Component: SettingsPage, title: "การตั้งค่า" }
];

describe("placeholder routes", () => {
  it.each(routePages)("renders $title route inside the app shell", ({ Component, title }) => {
    render(<Component />);

    expect(screen.getByRole("main")).toHaveTextContent(title);
    expect(screen.getByRole("banner")).toHaveTextContent("AI Tutor");
  });
});
