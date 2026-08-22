import { ArrowRight, CircleCheck, Clock3, FilePlus2, FileText, TriangleAlert } from "lucide-react";
import Link from "next/link";

import { DashboardLocalizedDate, DashboardLocalizedText } from "./DashboardLocalizedText.client";
import styles from "./studyDashboard.module.css";
import type { StudyDashboardRecentDocument } from "./types";

const statusIcons = {
  error: TriangleAlert,
  pending: Clock3,
  processing: Clock3,
  ready: CircleCheck
};

export const DashboardRecentDocuments = ({
  documents,
  isUnavailable = false
}: {
  documents: StudyDashboardRecentDocument[];
  isUnavailable?: boolean;
}) => (
  <section aria-labelledby="dashboard-recent-documents-title" className="min-w-0">
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <p className="text-label-sm font-bold uppercase tracking-[0.16em] text-foundation-ink-muted"><DashboardLocalizedText en="Latest uploads" th="อัปโหลดล่าสุด" /></p>
        <h2 className="mt-2 text-headline-md text-foundation-ink" id="dashboard-recent-documents-title"><DashboardLocalizedText en="Recent documents" th="เอกสารล่าสุด" /></h2>
      </div>
      <Link
        className={`${styles.secondaryAction} group inline-flex min-h-11 items-center gap-1.5 rounded-foundation-md px-3 py-2 text-label-md font-bold text-foundation-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foundation-focus`}
        href="/documents"
      >
        <DashboardLocalizedText en="View all documents" th="ดูเอกสารทั้งหมด" />
        <ArrowRight aria-hidden="true" className={`${styles.actionArrow} h-4 w-4`} />
      </Link>
    </div>

    {documents.length > 0 ? (
      <div className="mt-4 divide-y divide-foundation-border-subtle rounded-foundation-lg border border-foundation-border-subtle bg-foundation-surface-elevated px-4 shadow-foundation-surface sm:px-5">
        {documents.slice(0, 4).map((document) => {
        const StatusIcon = statusIcons[document.status];
        return (
          <article className={`${styles.documentRow} flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-2`} key={document.id}>
            <div className="flex min-w-0 gap-3">
              <FileText aria-hidden="true" className={`${styles.documentIcon} mt-1 h-5 w-5 shrink-0 text-foundation-brand`} />
              <div className="min-w-0">
                <h3 className="break-words text-body-md font-bold text-foundation-ink">{document.filename}</h3>
                <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-label-sm text-foundation-ink-muted">
                  <span className="inline-flex items-center gap-1.5 font-semibold">
                    <StatusIcon aria-hidden="true" className="h-3.5 w-3.5" />
                    <DashboardLocalizedText {...getDocumentStatusCopy(document)} />
                  </span>
                  <span><DashboardLocalizedDate date={document.uploadedAt} enPrefix="Uploaded" thPrefix="อัปโหลด" /></span>
                  {document.relatedQuizCount ? <span><DashboardLocalizedText en={`${document.relatedQuizCount} related quizzes`} th={`ควิซที่เกี่ยวข้อง ${document.relatedQuizCount} ชุด`} /></span> : null}
                </div>
              </div>
            </div>
            <Link
              className={`${styles.secondaryAction} group inline-flex min-h-11 w-full shrink-0 items-center justify-center gap-1.5 self-start rounded-foundation-md border border-foundation-border-control px-3.5 py-2 text-label-md font-bold text-foundation-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foundation-focus sm:w-auto sm:self-auto`}
              href={document.action.href}
            >
              <DashboardLocalizedText {...getDocumentActionCopy(document)} />
              <span className="sr-only"> {document.filename}</span>
              <ArrowRight aria-hidden="true" className={`${styles.actionArrow} h-4 w-4`} />
            </Link>
          </article>
        );
        })}
      </div>
    ) : (
      <div className="mt-4 flex min-h-44 flex-col items-start justify-center rounded-foundation-lg border border-dashed border-foundation-border-control bg-foundation-surface-elevated p-5 sm:p-6">
        <FilePlus2 aria-hidden="true" className="h-6 w-6 text-foundation-brand" />
        <p className="mt-3 text-body-md font-bold text-foundation-ink">
          <DashboardLocalizedText
            en={isUnavailable ? "Recent documents are unavailable right now." : "No recent documents yet"}
            th={isUnavailable ? "ยังไม่สามารถโหลดรายการเอกสารได้ในขณะนี้" : "ยังไม่มีเอกสารล่าสุด"}
          />
        </p>
        <p className="mt-1 text-body-md text-foundation-ink-secondary">
          <DashboardLocalizedText
            en={isUnavailable ? "Please check again later." : "Your latest uploads will appear here once you add a document."}
            th={isUnavailable ? "ลองกลับมาตรวจสอบอีกครั้งในภายหลัง" : "เมื่อคุณอัปโหลดเอกสาร รายการที่เพิ่มล่าสุดจะปรากฏที่นี่"}
          />
        </p>
        <Link
          className={`${styles.secondaryAction} group mt-4 inline-flex min-h-11 items-center gap-2 rounded-foundation-md text-label-md font-bold text-foundation-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foundation-focus`}
          href="/documents"
        >
          <DashboardLocalizedText en="Go to my documents" th="ไปที่เอกสารของฉัน" />
          <ArrowRight aria-hidden="true" className={`${styles.actionArrow} h-4 w-4`} />
        </Link>
      </div>
    )}
  </section>
);

const getDocumentStatusCopy = (document: StudyDashboardRecentDocument) => {
  if (document.status === "ready" && !document.summaryAvailable) return { en: "Summary not ready", th: "สรุปยังไม่พร้อม" };
  return {
    error: { en: "Processing failed", th: "ประมวลผลไม่สำเร็จ" },
    pending: { en: "Waiting to process", th: "รอประมวลผล" },
    processing: { en: "Processing", th: "กำลังประมวลผล" },
    ready: { en: "Ready for AI study", th: "พร้อมใช้กับ AI" }
  }[document.status];
};

const getDocumentActionCopy = (document: StudyDashboardRecentDocument) => {
  if (document.status !== "ready") return { en: "Manage document", th: "จัดการเอกสาร" };
  return document.summaryAvailable
    ? { en: "Continue learning", th: "เรียนต่อ" }
    : { en: "Open document", th: "เปิดเอกสาร" };
};
