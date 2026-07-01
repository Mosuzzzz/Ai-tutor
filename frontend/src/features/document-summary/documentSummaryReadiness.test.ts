import { describe, expect, it } from "vitest";

import { getDocumentAiReadinessUi } from "./documentSummaryReadiness";

describe("getDocumentAiReadinessUi", () => {
  it("marks document-derived summaries as AI-ready", () => {
    const ui = getDocumentAiReadinessUi({ canUseAiActions: true });

    expect(ui.label).toBe("พร้อมใช้งานกับ AI");
    expect(ui.disabledChatLabel).toBe("ถาม AI จากเอกสารนี้");
  });

  it("keeps fallback summaries in a waiting state", () => {
    const ui = getDocumentAiReadinessUi({
      canUseAiActions: false,
      summaryNotice: "รอ backend ส่งสรุปจริง"
    });

    expect(ui.label).toBe("รอสรุปจริงจาก backend");
    expect(ui.actionHelper).toBe("รอ backend ส่งสรุปจริง");
  });
});
