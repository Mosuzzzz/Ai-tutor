import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AiQuizGeneratorPage } from "./AiQuizGeneratorPage";
import { aiQuizGeneratorMock } from "./quizGeneratorData";
import type { QuizGeneratorViewModel } from "./types";

const emptyQuizMock: QuizGeneratorViewModel = {
  ...aiQuizGeneratorMock,
  selectedSourceId: "",
  sources: []
};

describe("AiQuizGeneratorPage", () => {
  it("renders an API-ready Thai quiz generator workspace", () => {
    render(<AiQuizGeneratorPage />);

    expect(screen.getByTestId("ai-quiz-generator")).toHaveAttribute("data-source", "api-ready-mock");
    expect(screen.getByRole("heading", { name: "สร้างควิซด้วย AI" })).toBeInTheDocument();
    expect(screen.getByText("คู่มือความปลอดภัยห้องปฏิบัติการ.pdf")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "ตั้งค่าควิซ" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "แบบร่างคำถาม" })).toBeInTheDocument();
  });

  it("renders source selection, backend-shaped request settings, and disabled mock actions", () => {
    render(<AiQuizGeneratorPage />);

    const selectedSource = screen.getByRole("article", {
      name: "แหล่งข้อมูลที่เลือก คู่มือความปลอดภัยห้องปฏิบัติการ.pdf"
    });

    expect(within(selectedSource).getByText("พร้อมสร้างควิซ")).toBeInTheDocument();
    expect(screen.getByText("จำนวนข้อ")).toBeInTheDocument();
    expect(screen.getByText("5 ข้อ")).toBeInTheDocument();
    expect(screen.getByText("ความยาก")).toBeInTheDocument();
    expect(screen.getByText("ปานกลาง")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "สร้างควิซ" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "เผยแพร่แบบทดสอบ" })).toBeDisabled();
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

  it("supports swapping selected source data without changing UI structure", () => {
    render(<AiQuizGeneratorPage quiz={aiQuizGeneratorMock} selectedSourceId="doc-ai-ethics" />);

    const selectedSource = screen.getByRole("article", {
      name: "แหล่งข้อมูลที่เลือก แนวทางจริยธรรม AI สำหรับห้องเรียน.pdf"
    });

    expect(within(selectedSource).getByText("แนวทางจริยธรรม AI สำหรับห้องเรียน.pdf")).toBeInTheDocument();
    expect(within(selectedSource).getByText("สร้างควิซจากหลักการใช้ AI อย่างรับผิดชอบ")).toBeInTheDocument();
  });
});
