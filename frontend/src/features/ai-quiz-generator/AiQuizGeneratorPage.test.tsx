import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AiQuizGeneratorPage } from "./AiQuizGeneratorPage";
import { aiQuizGeneratorMock } from "./quizGeneratorData";
import { backendGeneratedExamResponse } from "./quizGeneratorTestData";
import type { QuizGeneratorViewModel } from "./types";

const emptyQuizMock: QuizGeneratorViewModel = {
  ...aiQuizGeneratorMock,
  selectedSourceId: "",
  sources: []
};

const emptyDraftQuizMock: QuizGeneratorViewModel = {
  ...aiQuizGeneratorMock,
  draft: {
    ...aiQuizGeneratorMock.draft,
    questions: []
  }
};

const nullDraftQuizMock = {
  ...aiQuizGeneratorMock,
  draft: {
    ...aiQuizGeneratorMock.draft,
    questions: null
  }
} as unknown as QuizGeneratorViewModel;

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("AiQuizGeneratorPage", () => {
  it("renders an API-ready Thai quiz generator workspace", () => {
    render(<AiQuizGeneratorPage />);

    expect(screen.getByTestId("ai-quiz-generator")).toHaveAttribute("data-source", "api-ready-mock");
    expect(screen.getByRole("heading", { name: "สร้างควิซด้วย AI" })).toBeInTheDocument();
    expect(screen.getByText("คู่มือความปลอดภัยห้องปฏิบัติการ.pdf")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "ตั้งค่าควิซ" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "แบบร่างคำถาม" })).toBeInTheDocument();
  });

  it("renders source selection, backend-shaped request settings, and generation actions", () => {
    render(<AiQuizGeneratorPage />);

    const selectedSource = screen.getByRole("article", {
      name: "แหล่งข้อมูลที่เลือก คู่มือความปลอดภัยห้องปฏิบัติการ.pdf"
    });

    expect(within(selectedSource).getByText("พร้อมสร้างควิซ")).toBeInTheDocument();
    expect(screen.getByText("จำนวนข้อ")).toBeInTheDocument();
    expect(screen.getByText("5 ข้อ")).toBeInTheDocument();
    expect(screen.getByText("ความยาก")).toBeInTheDocument();
    expect(screen.getByText("ปานกลาง")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "สร้างควิซ" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "เผยแพร่แบบทดสอบ" })).toBeDisabled();
  });

  it("generates a quiz draft from the selected document through the BFF without exposing answer keys", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          exam: backendGeneratedExamResponse,
          ok: true
        }),
        {
          headers: {
            "Content-Type": "application/json"
          },
          status: 200
        }
      )
    );
    vi.stubGlobal("fetch", fetchMock);

    render(<AiQuizGeneratorPage quiz={emptyDraftQuizMock} />);

    fireEvent.click(screen.getByRole("button", { name: "สร้างควิซ" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith("/api/quiz/generate", {
        body: JSON.stringify({
          difficulty: "medium",
          fileId: aiQuizGeneratorMock.selectedSourceId,
          instructions: aiQuizGeneratorMock.request.instructions,
          numQuestions: 5
        }),
        credentials: "same-origin",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json"
        },
        method: "POST"
      });
    });

    expect(await screen.findByText("What should learners review before entering the lab?")).toBeInTheDocument();
    expect(screen.getByText("Review the safety checklist")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("สร้างแบบร่างควิซสำเร็จ");
    expect(screen.queryByText("correct_index")).not.toBeInTheDocument();
    expect(screen.queryByText("The safety checklist is required before lab work.")).not.toBeInTheDocument();
  });

  it("keeps the selected source visible and shows a safe error when quiz generation fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            message: "File is not ready for quiz generation.",
            ok: false
          }),
          {
            headers: {
              "Content-Type": "application/json"
            },
            status: 400
          }
        )
      )
    );

    render(<AiQuizGeneratorPage quiz={emptyDraftQuizMock} />);

    fireEvent.click(screen.getByRole("button", { name: "สร้างควิซ" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("File is not ready for quiz generation.");
    expect(screen.getByText("คู่มือความปลอดภัยห้องปฏิบัติการ.pdf")).toBeInTheDocument();
    expect(screen.queryByText("/api/quiz/generate")).not.toBeInTheDocument();
  });

  it("renders safe question preview with options and citations but no answer keys", () => {
    render(<AiQuizGeneratorPage />);

    const draft = screen.getByRole("region", { name: "แบบร่างคำถาม" });

    expect(within(draft).getByText("ก่อนเริ่มทดลองควรตรวจสอบสิ่งใดเป็นอันดับแรก")).toBeInTheDocument();
    expect(within(draft).getByText("แว่นตา ถุงมือ และพื้นที่ทำงาน")).toBeInTheDocument();
    expect(within(draft).getByText("คู่มือความปลอดภัยห้องปฏิบัติการ.pdf · ส่วนที่ 2")).toBeInTheDocument();
    expect(screen.queryByText("correct_index")).not.toBeInTheDocument();
    expect(screen.queryByText("เฉลยข้อที่ถูก")).not.toBeInTheDocument();
  });

  it("keeps the generator workspace readable with long Thai content", () => {
    render(<AiQuizGeneratorPage />);

    expect(screen.getByTestId("ai-quiz-workspace-grid")).toHaveClass("items-start", "xl:grid-cols-[minmax(0,360px)_minmax(0,1fr)]");
    expect(screen.getByTestId("ai-quiz-source-panel")).toHaveClass("min-w-0", "overflow-hidden");
    expect(screen.getByTestId("ai-quiz-preview-panel")).toHaveClass("min-w-0", "overflow-hidden");
  });

  it("does not expose backend endpoint details in the DOM", () => {
    render(<AiQuizGeneratorPage />);

    expect(screen.queryByText("/api/exams/generate")).not.toBeInTheDocument();
    expect(screen.queryByText("/api/exams/{exam_id}")).not.toBeInTheDocument();
    expect(screen.queryByText("/api/exams/{exam_id}/publish")).not.toBeInTheDocument();
    expect(screen.getByTestId("ai-quiz-generator")).not.toHaveAttribute("data-api-endpoint");
  });

  it("renders loading, error, and empty states with explicit accessible semantics", () => {
    const { rerender } = render(<AiQuizGeneratorPage status="loading" />);

    expect(screen.getByRole("status")).toHaveTextContent("กำลังโหลดตัวสร้างควิซ");

    rerender(<AiQuizGeneratorPage errorMessage="โหลดตัวสร้างควิซไม่สำเร็จ" status="error" />);

    expect(screen.getByRole("alert")).toHaveTextContent("โหลดตัวสร้างควิซไม่สำเร็จ");

    rerender(<AiQuizGeneratorPage quiz={emptyQuizMock} />);

    expect(screen.getByRole("status")).toHaveTextContent("ยังไม่มีแหล่งข้อมูลที่พร้อมสร้างควิซ");
    expect(screen.queryByRole("button", { name: "สร้างควิซ" })).not.toBeInTheDocument();
  });

  it("renders a safe empty draft state when backend returns no questions", () => {
    const { rerender } = render(<AiQuizGeneratorPage quiz={emptyDraftQuizMock} />);

    expect(screen.getByTestId("ai-quiz-empty-draft")).toHaveAttribute("role", "status");
    expect(screen.queryByText("correct_index")).not.toBeInTheDocument();

    rerender(<AiQuizGeneratorPage quiz={nullDraftQuizMock} />);

    expect(screen.getByTestId("ai-quiz-empty-draft")).toHaveAttribute("role", "status");
    expect(screen.queryByText("correct_index")).not.toBeInTheDocument();
  });

  it("supports swapping selected source data without changing UI structure", () => {
    render(<AiQuizGeneratorPage quiz={aiQuizGeneratorMock} selectedSourceId="doc-ai-ethics" />);

    const selectedSource = screen.getByRole("article", {
      name: "แหล่งข้อมูลที่เลือก แนวทางจริยธรรม AI สำหรับห้องเรียน.pdf"
    });

    expect(within(selectedSource).getByText("แนวทางจริยธรรม AI สำหรับห้องเรียน.pdf")).toBeInTheDocument();
    expect(within(selectedSource).getByText("สร้างควิซจากหลักการใช้ AI อย่างรับผิดชอบ")).toBeInTheDocument();
  });
});
