import { describe, expect, it } from "vitest";

import {
  buildCitationLabel,
  countGroundedAssistantMessages,
  formatChatDocumentStatus,
  getLatestAssistantMessage,
  getMessageTone,
  getSelectedChatDocument,
  sortChatDocumentsByAvailability
} from "./aiChatHelpers";
import type { ChatDocument, ChatMessage } from "./types";

const documents: ChatDocument[] = [
  {
    filename: "เอกสารที่ยังประมวลผล.pdf",
    id: "processing-doc",
    ownerLabel: "อาจารย์มนัส",
    status: "processing",
    summary: "",
    summaryAvailable: false,
    topicCount: 0,
    updatedAt: "2026-05-31T10:00:00.000Z",
    updatedAtLabel: "31 พ.ค. 2026"
  },
  {
    filename: "คู่มือความปลอดภัย.pdf",
    id: "safety-doc",
    ownerLabel: "อาจารย์ปภาวี",
    status: "ready",
    summary: "สรุปขั้นตอนความปลอดภัย",
    summaryAvailable: true,
    topicCount: 4,
    updatedAt: "2026-05-30T10:00:00.000Z",
    updatedAtLabel: "30 พ.ค. 2026"
  },
  {
    filename: "แนวทางจริยธรรม AI.pdf",
    id: "ethics-doc",
    ownerLabel: "อาจารย์ธนา",
    status: "ready",
    summary: "สรุปหลักจริยธรรม AI",
    summaryAvailable: true,
    topicCount: 5,
    updatedAt: "2026-06-01T10:00:00.000Z",
    updatedAtLabel: "1 มิ.ย. 2026"
  },
  {
    filename: "ไฟล์อ่านไม่ได้.pdf",
    id: "error-doc",
    ownerLabel: "อาจารย์ปภาวี",
    status: "error",
    summary: "",
    summaryAvailable: false,
    topicCount: 0,
    updatedAt: "2026-06-02T10:00:00.000Z",
    updatedAtLabel: "2 มิ.ย. 2026"
  }
];

const messages: ChatMessage[] = [
  {
    body: "ควรถามเรื่องใดก่อน",
    citations: [],
    createdAtLabel: "09:10",
    id: "learner-1",
    role: "learner"
  },
  {
    body: "เริ่มจาก checklist ก่อนเข้าห้องทดลอง",
    citations: [
      {
        chunk_index: 2,
        file_id: "safety-doc",
        filename: "คู่มือความปลอดภัย.pdf",
        matched_text: "ตรวจอุปกรณ์ป้องกันก่อนเริ่มทดลอง"
      }
    ],
    createdAtLabel: "09:11",
    id: "assistant-1",
    role: "assistant"
  },
  {
    body: "ขยายเรื่องการอ้างอิงหลักฐาน",
    citations: [],
    createdAtLabel: "09:12",
    id: "assistant-2",
    role: "assistant"
  }
];

describe("aiChatHelpers", () => {
  it("formats chat document statuses in Thai", () => {
    expect(formatChatDocumentStatus("ready")).toBe("พร้อมถาม AI");
    expect(formatChatDocumentStatus("processing")).toBe("กำลังประมวลผล");
    expect(formatChatDocumentStatus("error")).toBe("มีปัญหา");
  });

  it("sorts ready documents first and then newest updated date", () => {
    expect(sortChatDocumentsByAvailability(documents).map((document) => document.id)).toEqual([
      "ethics-doc",
      "safety-doc",
      "processing-doc",
      "error-doc"
    ]);
  });

  it("selects a ready document and falls back to the first ready document", () => {
    expect(getSelectedChatDocument(documents, "safety-doc")?.id).toBe("safety-doc");
    expect(getSelectedChatDocument(documents, "processing-doc")?.id).toBe("ethics-doc");
    expect(getSelectedChatDocument(documents, "missing-doc")?.id).toBe("ethics-doc");
  });

  it("returns undefined when no document is ready for grounded chat", () => {
    expect(getSelectedChatDocument(documents.filter((document) => document.status !== "ready"), "missing")).toBeUndefined();
  });

  it("counts only assistant messages that include citations", () => {
    expect(countGroundedAssistantMessages(messages)).toBe(1);
  });

  it("builds safe citation labels without leaking API fields", () => {
    expect(buildCitationLabel(messages[1].citations[0])).toBe("คู่มือความปลอดภัย.pdf · ส่วนที่ 3");
  });

  it("finds the latest assistant response and maps message tones", () => {
    expect(getLatestAssistantMessage(messages)?.id).toBe("assistant-2");
    expect(getMessageTone("assistant")).toBe("assistant");
    expect(getMessageTone("learner")).toBe("learner");
  });
});
