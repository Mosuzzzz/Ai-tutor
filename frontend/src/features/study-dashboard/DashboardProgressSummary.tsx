import { BookOpenCheck, ChartNoAxesColumnIncreasing, ClipboardCheck } from "lucide-react";

import { DashboardLocalizedText } from "./DashboardLocalizedText.client";
import styles from "./studyDashboard.module.css";
import type { StudyDashboardMetric } from "./types";

const metricIcons = {
  "average-score": ChartNoAxesColumnIncreasing,
  "completed-quizzes": ClipboardCheck,
  "ready-documents": BookOpenCheck
};

export const DashboardProgressSummary = ({ metrics }: { metrics: StudyDashboardMetric[] }) => {
  const visibleMetrics = metrics.slice(0, 3);

  return (
    <section aria-labelledby="dashboard-progress-title" className="rounded-foundation-lg border border-foundation-border-subtle bg-foundation-surface-elevated px-5 py-5 shadow-foundation-surface sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-label-sm font-bold uppercase tracking-[0.16em] text-foundation-ink-muted"><DashboardLocalizedText en="Your real progress" th="ภาพรวมจริงจากบัญชี" /></p>
          <h2 className="mt-1.5 text-headline-md text-foundation-ink" id="dashboard-progress-title"><DashboardLocalizedText en="Learning overview" th="ภาพรวมการเรียน" /></h2>
        </div>
        <p className="text-label-sm text-foundation-ink-muted"><DashboardLocalizedText en="A concise view of your learning" th="ข้อมูลสรุปสำหรับการเรียนของคุณ" /></p>
      </div>
      {visibleMetrics.length > 0 ? (
        <dl className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {visibleMetrics.map((metric) => {
          const MetricIcon = metricIcons[metric.id];
          return (
            <div className={`${styles.overviewMetric} flex min-w-0 items-center gap-3 rounded-foundation-md border border-transparent bg-foundation-brand-soft/45 px-4 py-3.5`} key={metric.id}>
              <span className={`${styles.metricIcon} flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-foundation-brand-soft text-foundation-brand`}>
                <MetricIcon aria-hidden="true" className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <dt className="text-label-md font-bold text-foundation-ink"><DashboardLocalizedText {...metricCopy[metric.id].label} /></dt>
                <p className="mt-0.5 text-label-sm text-foundation-ink-muted"><DashboardLocalizedText {...metricCopy[metric.id].helper} /></p>
              </div>
              <dd className="shrink-0 text-headline-md font-bold text-foundation-brand">{metric.value}</dd>
            </div>
          );
          })}
        </dl>
      ) : (
        <div className="mt-4">
          <dl className="grid gap-3 sm:grid-cols-3">
            {(["ready-documents", "completed-quizzes", "average-score"] as const).map((id) => (
              <div className="rounded-foundation-md border border-dashed border-foundation-border-control px-4 py-3.5" key={id}>
                <dt className="text-label-md font-bold text-foundation-ink-secondary"><DashboardLocalizedText {...metricCopy[id].label} /></dt>
                <dd className="mt-2 text-headline-md font-bold text-foundation-ink-muted">—</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-label-md text-foundation-ink-muted"><DashboardLocalizedText en="Your overview will appear after you upload a document and complete a quiz." th="ข้อมูลจะเริ่มปรากฏหลังจากคุณอัปโหลดเอกสารและทำควิซ" /></p>
        </div>
      )}
    </section>
  );
};

const metricCopy = {
  "average-score": {
    helper: { en: "Calculated from completed quizzes", th: "คำนวณจากควิซที่ทำเสร็จ" },
    label: { en: "Average quiz score", th: "คะแนนควิซเฉลี่ย" }
  },
  "completed-quizzes": {
    helper: { en: "Quizzes you have submitted", th: "ผลควิซที่ส่งคำตอบแล้ว" },
    label: { en: "Completed quizzes", th: "ควิซที่ทำเสร็จ" }
  },
  "ready-documents": {
    helper: { en: "Processed and ready to use", th: "ประมวลผลเสร็จและพร้อมเปิดใช้งาน" },
    label: { en: "Ready documents", th: "เอกสารพร้อมใช้" }
  }
} as const;
