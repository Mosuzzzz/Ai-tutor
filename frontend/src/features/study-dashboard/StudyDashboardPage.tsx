import { CircleAlert } from "lucide-react";

import { DashboardActivity } from "./DashboardActivity";
import { DashboardContinueStudy } from "./DashboardContinueStudy";
import { DashboardEmptyState } from "./DashboardEmptyState";
import { DashboardGreeting, DashboardLocalizedDate, DashboardLocalizedText } from "./DashboardLocalizedText.client";
import { DashboardNextActions } from "./DashboardNextActions";
import { DashboardProgressSummary } from "./DashboardProgressSummary";
import { DashboardRecentDocuments } from "./DashboardRecentDocuments";
import { DashboardRecentReviews } from "./DashboardRecentReviews";
import styles from "./studyDashboard.module.css";
import type { DashboardDataSourceId, StudyDashboardDataSource, StudyDashboardStatus, StudyDashboardViewModel } from "./types";

type StudyDashboardPageProps = {
  dashboard?: StudyDashboardViewModel;
  dataSource?: StudyDashboardDataSource;
  errorMessage?: string;
  status: StudyDashboardStatus;
};

export const StudyDashboardPage = ({
  dashboard,
  dataSource = "api",
  errorMessage = "ไม่สามารถโหลดแดชบอร์ดได้ในขณะนี้",
  status
}: StudyDashboardPageProps) => {
  if (status === "error" || !dashboard) {
    return (
      <div className="space-y-6 pb-8" data-source={dataSource} data-testid="study-dashboard">
        <DashboardHeader
          displayName={null}
          generatedAt={null}
          isError
        />
        <div className="flex gap-3 rounded-foundation-md border border-foundation-error/25 bg-foundation-surface p-5 text-body-md text-foundation-error" role="alert">
          <CircleAlert aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0" />
          <p><DashboardLocalizedText
            en={errorMessage === "กรุณาเข้าสู่ระบบอีกครั้ง" ? "Please sign in again." : "The Dashboard is unavailable right now."}
            th={errorMessage}
          /></p>
        </div>
      </div>
    );
  }

  const documentsIssue = dashboard.sectionIssues.find((issue) => issue.id === "documents");
  const analyticsIssue = dashboard.sectionIssues.find((issue) => issue.id === "analytics");
  const nextActions = dashboard.nextActions ?? [];
  const scoreTrend = dashboard.scoreTrend ?? [];
  const quizAction = nextActions.find((action) => action.id === "quiz");

  return (
    <div className={`${styles.dashboard} pb-8`} data-source={dataSource} data-testid="study-dashboard">
      <section
        aria-labelledby="dashboard-page-title"
        className={`${styles.heroFrame} rounded-foundation-lg border border-foundation-brand/15 bg-foundation-surface-elevated p-5 shadow-foundation-surface sm:p-7 lg:p-8`}
        data-testid="dashboard-study-focus"
      >
        <div className="grid gap-7 xl:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)] xl:items-stretch xl:gap-9">
          <DashboardHeader
            displayName={dashboard.displayName}
            generatedAt={dashboard.generatedAt}
          />

          <div className={`${styles.heroPanel} min-w-0`}>
            {status === "empty" ? (
              <DashboardEmptyState continuation={dashboard.continuation} />
            ) : (
              <div className="border-t border-foundation-border-subtle pt-6 xl:border-l xl:border-t-0 xl:pl-9 xl:pt-0">
                {documentsIssue ? <SectionIssue id={documentsIssue.id} /> : null}
                <DashboardContinueStudy continuation={dashboard.continuation} />
              </div>
            )}
          </div>
        </div>
      </section>

      <div className={`${styles.reveal} ${styles.delayOverview} mt-7`}>
        {analyticsIssue ? <SectionIssue id={analyticsIssue.id} /> : null}
        <DashboardProgressSummary metrics={dashboard.progressMetrics} />
      </div>

      <div className={`${styles.reveal} ${styles.delayActivity} mt-9`}>
        <DashboardActivity
          isUnavailable={dashboard.availability.analytics === "unavailable"}
          trend={scoreTrend}
        />
      </div>

      <div className="mt-10 grid gap-10 xl:grid-cols-[minmax(0,1.65fr)_minmax(19rem,0.75fr)] xl:gap-10">
        <div className={`${styles.reveal} ${styles.delayDocuments} min-w-0`}>
          <DashboardRecentDocuments
            documents={dashboard.recentDocuments}
            isUnavailable={dashboard.availability.documents === "unavailable"}
          />
        </div>

        <aside className={`${styles.reveal} ${styles.delayReviews}`}>
          <DashboardRecentReviews
            isUnavailable={dashboard.availability.analytics === "unavailable"}
            quizAction={quizAction}
            reviews={dashboard.recentReviews}
          />
        </aside>
      </div>

      <div className={`${styles.reveal} ${styles.delayActions} mt-10`}>
        <DashboardNextActions actions={nextActions} />
      </div>
    </div>
  );
};

const DashboardHeader = ({
  displayName,
  generatedAt,
  isError = false
}: {
  displayName: string | null;
  generatedAt: string | null;
  isError?: boolean;
}) => {
  return (
    <header className={`${styles.greetingBlock} max-w-2xl self-center`}>
      <p className="text-label-sm font-bold uppercase tracking-[0.18em] text-foundation-brand">
        <DashboardLocalizedText en="My study space" th="พื้นที่เรียนของฉัน" />
      </p>
      <h1 className={`${styles.greetingTitle} mt-2 font-bold text-foundation-ink`} id="dashboard-page-title">
        {isError
          ? <DashboardLocalizedText en="My Dashboard" th="แดชบอร์ดของฉัน" />
          : <DashboardGreeting displayName={displayName} leadClassName={styles.greetingLead} nameClassName={styles.greetingName} />}
      </h1>
      <p className="mt-3 max-w-xl text-body-md text-foundation-ink-secondary sm:text-body-lg">
        <DashboardLocalizedText
          en={isError ? "Please return later to check your study space." : "Choose what to continue and settle back into your review rhythm."}
          th={isError ? "กลับมาตรวจสอบพื้นที่เรียนของคุณอีกครั้งในภายหลัง" : "เลือกสิ่งที่ควรเรียนต่อ แล้วกลับเข้าสู่จังหวะการทบทวนของคุณ"}
        />
      </p>
      {generatedAt ? <p className="mt-3 text-label-sm text-foundation-ink-muted">
        <DashboardLocalizedDate date={generatedAt} enPrefix="Updated" includeTime thPrefix="แสดงข้อมูล ณ" />
      </p> : null}
    </header>
  );
};

const SectionIssue = ({ id }: { id: DashboardDataSourceId }) => (
  <div className="mb-5 flex gap-2.5 border-l-2 border-foundation-border-control px-3 py-2 text-label-md text-foundation-ink-secondary" role="status">
    <CircleAlert aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
    <p><DashboardLocalizedText
      en={id === "documents" ? "Document information is unavailable right now." : "Progress information is unavailable right now."}
      th={id === "documents" ? "ยังไม่สามารถโหลดข้อมูลเอกสารได้ในขณะนี้" : "ยังไม่สามารถโหลดข้อมูลความคืบหน้าได้ในขณะนี้"}
    /></p>
  </div>
);
