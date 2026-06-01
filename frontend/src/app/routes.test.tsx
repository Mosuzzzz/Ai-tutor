import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import AnalyticsPage from "./analytics/page";
import ChatPage from "./chat/page";
import CoursesPage from "./courses/page";
import DocumentsPage from "./documents/page";
import QuizPage from "./quiz/page";
import SettingsPage from "./settings/page";
import { placeholderModules } from "../features/foundation/placeholderContent";

const routePages = [
  { Component: CoursesPage, placeholder: placeholderModules.courses },
  { Component: DocumentsPage, placeholder: placeholderModules.documents },
  { Component: ChatPage, placeholder: placeholderModules.chat },
  { Component: QuizPage, placeholder: placeholderModules.quiz },
  { Component: AnalyticsPage, placeholder: placeholderModules.analytics },
  { Component: SettingsPage, placeholder: placeholderModules.settings }
];

describe("placeholder routes", () => {
  it.each(routePages)(
    "renders $placeholder.title route inside the app shell",
    ({ Component, placeholder }) => {
      render(<Component />);

      expect(screen.getByRole("main")).toHaveTextContent(placeholder.title);
      expect(screen.getByRole("main")).toHaveTextContent(placeholder.statusLabel);
      expect(screen.getByRole("main")).toHaveTextContent(placeholder.handoffNote);
      expect(screen.getByRole("banner")).toHaveTextContent("AI Tutor");
    }
  );
});
