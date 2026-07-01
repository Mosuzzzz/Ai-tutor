import { CheckCircle2, Clock3, type LucideIcon } from "lucide-react";

import type { DocumentSummaryDetail } from "./types";

type DocumentAiReadinessInput = Pick<
  DocumentSummaryDetail,
  "canUseAiActions" | "summaryNotice"
>;

export type DocumentAiReadinessUi = {
  Icon: LucideIcon;
  actionHelper: string;
  detailHelper: string;
  disabledChatLabel: string;
  disabledQuizLabel: string;
  label: string;
  panelClassName: string;
  pillClassName: string;
};

export const getDocumentAiReadinessUi = (
  detail: DocumentAiReadinessInput
): DocumentAiReadinessUi => {
  if (detail.canUseAiActions) {
    return {
      Icon: CheckCircle2,
      actionHelper: "สามารถถาม AI หรือสร้างควิซจากเอกสารนี้ได้แล้ว",
      detailHelper: "สรุปนี้มาจากเนื้อหาเอกสารที่ backend ส่งมา",
      disabledChatLabel: "ถาม AI จากเอกสารนี้",
      disabledQuizLabel: "สร้างควิซจากสรุปนี้",
      label: "พร้อมใช้งานกับ AI",
      panelClassName: "border-emerald-200 bg-emerald-50 text-emerald-950",
      pillClassName: "bg-emerald-100 text-emerald-800"
    };
  }

  return {
    Icon: Clock3,
    actionHelper:
      detail.summaryNotice ??
      "รอ backend ส่งสรุปที่สร้างจากเนื้อหาเอกสารจริงก่อน",
    detailHelper:
      "ตอนนี้ระบบแสดงสถานะรอประมวลผล เพื่อป้องกันการใช้ข้อความตัวอย่างเป็นเนื้อหาจริง",
    disabledChatLabel: "รอสรุปจริงก่อนถาม AI",
    disabledQuizLabel: "รอสรุปจริงก่อนสร้างควิซ",
    label: "รอสรุปจริงจาก backend",
    panelClassName: "border-amber-200 bg-amber-50 text-amber-950",
    pillClassName: "bg-amber-100 text-amber-800"
  };
};
