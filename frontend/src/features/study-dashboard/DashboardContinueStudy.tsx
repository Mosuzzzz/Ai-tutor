import { ArrowRight, BookOpen, FileClock, FileWarning, MessageCircleMore, Sparkles } from "lucide-react";
import Link from "next/link";

import { DashboardLocalizedDate, DashboardLocalizedText } from "./DashboardLocalizedText.client";
import styles from "./studyDashboard.module.css";
import type { StudyDashboardContinuation } from "./types";

export const DashboardContinueStudy = ({ continuation }: { continuation: StudyDashboardContinuation }) => {
  const StatusIcon = continuation.kind === "failed-document"
    ? FileWarning
    : continuation.kind === "processing-document"
      ? FileClock
      : Sparkles;
  const copy = getContinuationCopy(continuation);

  return (
    <section aria-labelledby="dashboard-continue-title">
      <p className="text-label-sm font-bold uppercase tracking-[0.16em] text-foundation-brand"><DashboardLocalizedText en="Study focus" th="จุดเริ่มเรียนต่อ" /></p>
      <h2 className="mt-2 text-headline-md text-foundation-ink" id="dashboard-continue-title"><DashboardLocalizedText en="Continue learning" th="เรียนอะไรต่อดี" /></h2>

      <div className={`${styles.continuationSurface} mt-5 rounded-foundation-md border border-transparent bg-foundation-brand-soft/65 p-5 sm:p-6`}>
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            {continuation.statusLabel ? (
              <p className="inline-flex items-center gap-2 text-label-sm font-bold text-foundation-brand">
                <StatusIcon aria-hidden="true" className="h-4 w-4" />
                <DashboardLocalizedText en={copy.status.en} th={copy.status.th} />
              </p>
            ) : null}
            <h3 className="mt-2 break-words text-headline-lg-mobile font-bold text-foundation-ink">
              {continuation.kind === "documents-unavailable"
                ? <DashboardLocalizedText en="Document information is not ready" th="ข้อมูลเอกสารยังไม่พร้อม" />
                : continuation.title}
            </h3>
            <p className="mt-2 max-w-2xl text-body-md text-foundation-ink-secondary"><DashboardLocalizedText en={copy.description.en} th={copy.description.th} /></p>
            {continuation.uploadedAt ? (
              <p className="mt-3 text-label-sm text-foundation-ink-muted"><DashboardLocalizedDate date={continuation.uploadedAt} enPrefix="Uploaded" thPrefix="อัปโหลด" /></p>
            ) : null}
          </div>
          <BookOpen aria-hidden="true" className="hidden h-10 w-10 shrink-0 text-foundation-brand/45 sm:block" />
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Link
            className={`${styles.primaryAction} group inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-foundation-md bg-foundation-brand px-4 py-2.5 text-label-md font-bold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foundation-focus focus-visible:ring-offset-2 sm:w-auto`}
            href={continuation.primaryAction.href}
          >
            <DashboardLocalizedText en={copy.primary.en} th={copy.primary.th} />
            <span className="sr-only"> {continuation.title}</span>
            <ArrowRight aria-hidden="true" className={`${styles.actionArrow} h-4 w-4`} />
          </Link>
          {continuation.secondaryActions.map((action) => (
            <Link
              className={`${styles.secondaryAction} inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-foundation-md border border-foundation-brand/25 bg-foundation-surface-elevated px-4 py-2.5 text-label-md font-bold text-foundation-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foundation-focus focus-visible:ring-offset-2 sm:w-auto`}
              href={action.href}
              key={action.href}
            >
              <MessageCircleMore aria-hidden="true" className="h-4 w-4" />
              <DashboardLocalizedText
                en={action.href.startsWith("/chat") ? "Ask about this document" : "Take a quiz"}
                th={action.href.startsWith("/chat") ? "ถามจากเอกสาร" : "ทำควิซ"}
              />
              <span className="sr-only"> {continuation.title}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

const getContinuationCopy = (continuation: StudyDashboardContinuation) => {
  switch (continuation.kind) {
    case "documents-unavailable":
      return {
        description: { en: "Open Documents to view and manage your study material.", th: "เปิดพื้นที่เอกสารเพื่อดูและจัดการเนื้อหาการเรียนของคุณ" },
        primary: { en: "Go to my documents", th: "ไปที่เอกสารของฉัน" },
        status: { en: "", th: "" }
      };
    case "ready-summary":
      return {
        description: { en: "Your summary is ready. Open the document or continue with chat and a quiz.", th: "สรุปพร้อมแล้ว คุณสามารถเปิดเอกสารหรือทบทวนต่อด้วยแชทและควิซ" },
        primary: { en: "Open document", th: "เปิดเอกสาร" },
        status: { en: "Ready for AI study", th: "พร้อมใช้กับ AI" }
      };
    case "ready-document":
      return {
        description: { en: "The document is processed, but AI study material is not ready yet.", th: "เอกสารถูกประมวลผลแล้ว แต่เนื้อหาสำหรับการเรียนด้วย AI ยังไม่พร้อม" },
        primary: { en: "Open document", th: "เปิดเอกสาร" },
        status: { en: "Summary not ready", th: "สรุปยังไม่พร้อม" }
      };
    case "failed-document":
      return {
        description: { en: "Open Documents to review the file and choose your next step.", th: "ไปที่พื้นที่เอกสารเพื่อตรวจสอบไฟล์และเลือกขั้นตอนถัดไป" },
        primary: { en: "Manage documents", th: "จัดการเอกสาร" },
        status: { en: "Processing failed", th: "ประมวลผลไม่สำเร็จ" }
      };
    default:
      return {
        description: { en: "This document is not ready for summaries, chat, or quizzes yet.", th: "เอกสารนี้ยังไม่พร้อมสำหรับสรุป แชท หรือควิซ" },
        primary: { en: "Manage documents", th: "จัดการเอกสาร" },
        status: {
          en: continuation.documentStatus === "pending" ? "Waiting to process" : "Processing",
          th: continuation.documentStatus === "pending" ? "รอประมวลผล" : "กำลังประมวลผล"
        }
      };
  }
};
