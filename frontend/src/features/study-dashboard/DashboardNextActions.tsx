import { ArrowRight, BarChart3, FileText, ListChecks } from "lucide-react";
import Link from "next/link";

import { DashboardLocalizedText } from "./DashboardLocalizedText.client";
import styles from "./studyDashboard.module.css";
import type { StudyDashboardSupportingAction } from "./types";

const actionIcons = {
  analytics: BarChart3,
  documents: FileText,
  quiz: ListChecks
};

export const DashboardNextActions = ({ actions }: { actions: StudyDashboardSupportingAction[] }) => (
  <section aria-labelledby="dashboard-next-actions-title" className="border-t border-foundation-border-subtle pt-6">
    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
      <div className="max-w-xl">
        <p className="text-label-sm font-bold uppercase tracking-[0.16em] text-foundation-brand"><DashboardLocalizedText en="Next steps" th="ขั้นตอนถัดไป" /></p>
        <h2 className="mt-2 text-headline-md text-foundation-ink" id="dashboard-next-actions-title"><DashboardLocalizedText en="What you can do next" th="ทำอะไรต่อได้บ้าง" /></h2>
        <p className="mt-1.5 text-body-md text-foundation-ink-secondary"><DashboardLocalizedText en="Choose an available path based on your learning data." th="เลือกเส้นทางที่พร้อมใช้งานจากข้อมูลการเรียนของคุณ" /></p>
      </div>
      <nav aria-labelledby="dashboard-next-actions-title" className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        {actions.map((action) => {
          const ActionIcon = actionIcons[action.id];
          return (
            <Link
              className={`${styles.secondaryAction} group inline-flex min-h-11 items-center justify-between gap-3 rounded-foundation-md border border-foundation-border-subtle bg-foundation-surface-elevated px-4 py-2.5 text-label-md font-bold text-foundation-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foundation-focus sm:justify-center`}
              href={action.href}
              key={action.id}
            >
              <ActionIcon aria-hidden="true" className="h-4 w-4 text-foundation-brand" />
              <DashboardLocalizedText {...actionCopy[action.id]} />
              <ArrowRight aria-hidden="true" className={`${styles.actionArrow} h-4 w-4 text-foundation-brand`} />
            </Link>
          );
        })}
      </nav>
    </div>
  </section>
);

const actionCopy = {
  analytics: { en: "View all analytics", th: "ดูสถิติทั้งหมด" },
  documents: { en: "Manage documents", th: "จัดการเอกสาร" },
  quiz: { en: "Take a quiz", th: "ทำควิซ" }
} as const;
