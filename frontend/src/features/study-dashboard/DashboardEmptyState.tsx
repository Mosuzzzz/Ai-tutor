import { ArrowRight, FilePlus2 } from "lucide-react";
import Link from "next/link";

import { DashboardLocalizedText } from "./DashboardLocalizedText.client";
import styles from "./studyDashboard.module.css";
import type { StudyDashboardContinuation } from "./types";

export const DashboardEmptyState = ({ continuation }: { continuation: StudyDashboardContinuation }) => (
  <section aria-labelledby="dashboard-empty-title" className="border-t border-foundation-border-subtle pt-6 xl:border-l xl:border-t-0 xl:pl-9 xl:pt-0">
    <div className="rounded-foundation-md bg-foundation-brand-soft/65 p-5 sm:p-6">
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-foundation-surface-elevated text-foundation-brand shadow-foundation-surface">
        <FilePlus2 aria-hidden="true" className="h-5 w-5" />
      </span>
      <h2 className="mt-4 text-headline-lg-mobile font-bold text-foundation-ink" id="dashboard-empty-title">
        <DashboardLocalizedText en="Start with your documents" th="เริ่มจากเอกสารของคุณ" />
      </h2>
      <p className="mt-3 text-body-lg text-foundation-ink-secondary"><DashboardLocalizedText en="Upload a document so AI Tutor can prepare summaries, chat, and quizzes." th="อัปโหลดเอกสารเพื่อให้ AI Tutor เตรียมสรุป แชท และควิซ" /></p>
      <p className="sr-only" id="dashboard-first-use-steps-label"><DashboardLocalizedText en="Getting started with AI Tutor" th="ขั้นตอนเริ่มต้นใช้งาน AI Tutor" /></p>
      <ol aria-labelledby="dashboard-first-use-steps-label" className="mt-5 grid gap-3 sm:grid-cols-3">
        {[
          { en: "Upload a document", th: "อัปโหลดเอกสาร" },
          { en: "Let AI prepare your material", th: "รอ AI เตรียมเนื้อหา" },
          { en: "Start with summaries, chat, and quizzes", th: "เริ่มสรุป แชท และควิซ" }
        ].map((step, index) => (
          <li className={`${styles.firstUseStep} flex items-center gap-2.5 text-label-md font-bold text-foundation-ink`} key={step.en}>
            <span aria-hidden="true" className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-foundation-brand/20 bg-foundation-surface-elevated text-label-sm text-foundation-brand">
              {index + 1}
            </span>
            <span><DashboardLocalizedText en={step.en} th={step.th} /></span>
          </li>
        ))}
      </ol>
      <Link
        className={`${styles.primaryAction} group mt-6 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-foundation-md bg-foundation-brand px-4 py-2.5 text-label-md font-bold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foundation-focus focus-visible:ring-offset-2 sm:w-auto`}
        href={continuation.primaryAction.href}
      >
        <DashboardLocalizedText en="Go to my documents" th="ไปที่เอกสารของฉัน" />
        <ArrowRight aria-hidden="true" className={`${styles.actionArrow} h-4 w-4`} />
      </Link>
    </div>
  </section>
);
