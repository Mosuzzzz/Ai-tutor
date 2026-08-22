import { ArrowRight, CircleCheck, ListChecks } from "lucide-react";
import Link from "next/link";

import { DashboardLocalizedDate, DashboardLocalizedText } from "./DashboardLocalizedText.client";
import styles from "./studyDashboard.module.css";
import type { StudyDashboardRecentReview, StudyDashboardSupportingAction } from "./types";

export const DashboardRecentReviews = ({
  isUnavailable = false,
  quizAction,
  reviews
}: {
  isUnavailable?: boolean;
  quizAction?: StudyDashboardSupportingAction;
  reviews: StudyDashboardRecentReview[];
}) => {
  const visibleReviews = reviews.slice(0, 3);

  return (
    <section aria-labelledby="dashboard-reviews-title" className="rounded-foundation-lg bg-foundation-surface-elevated p-5 sm:p-6">
      <p className="text-label-sm font-bold uppercase tracking-[0.16em] text-foundation-ink-muted"><DashboardLocalizedText en="Quiz activity" th="กิจกรรมควิซ" /></p>
      <h2 className="mt-1.5 text-headline-md text-foundation-ink" id="dashboard-reviews-title"><DashboardLocalizedText en="Recent reviews" th="การทบทวนล่าสุด" /></h2>
      {visibleReviews.length > 0 ? (
        <div className="mt-4 divide-y divide-foundation-border-subtle">
          {visibleReviews.map((review) => (
          <article className={`${styles.reviewItem} group py-4 first:pt-0 last:pb-0`} key={review.id}>
            <div className="flex items-start gap-3">
              <CircleCheck aria-hidden="true" className="mt-1 h-4 w-4 shrink-0 text-foundation-brand" />
              <div className="min-w-0 flex-1">
                <h3 className="break-words text-body-md font-bold text-foundation-ink">{review.filename}</h3>
                <p className="mt-1 text-label-sm text-foundation-ink-muted">
                  {review.scoreLabel} · <DashboardLocalizedText {...getGradeCopy(review.score)} /> · <DashboardLocalizedDate date={review.submittedAt} enPrefix="Submitted" thPrefix="ส่งเมื่อ" />
                </p>
              </div>
              <Link
                className="flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-foundation-md text-foundation-brand transition hover:bg-foundation-brand-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foundation-focus"
                href={review.href}
              >
                <span className="sr-only"><DashboardLocalizedText en={`View quiz result ${review.filename}, score ${review.scoreLabel}`} th={`ดูผลควิซ ${review.filename} คะแนน ${review.scoreLabel}`} /></span>
                <ArrowRight aria-hidden="true" className={`${styles.actionArrow} h-4 w-4`} />
              </Link>
            </div>
          </article>
          ))}
        </div>
      ) : (
        <div className="mt-5 border-t border-foundation-border-subtle pt-5">
          <ListChecks aria-hidden="true" className="h-6 w-6 text-foundation-brand" />
          <p className="mt-3 text-body-md font-bold text-foundation-ink">
            <DashboardLocalizedText
              en={isUnavailable ? "Recent reviews are unavailable right now." : "No review history yet"}
              th={isUnavailable ? "ยังไม่สามารถโหลดประวัติการทบทวนได้ในขณะนี้" : "ยังไม่มีประวัติการทบทวน"}
            />
          </p>
          <p className="mt-1 text-body-md text-foundation-ink-secondary">
            <DashboardLocalizedText
              en={isUnavailable ? "Other Dashboard sections remain available from the data that loaded successfully." : "Take a quiz from one of your documents and your results will appear here."}
              th={isUnavailable ? "ส่วนอื่นของแดชบอร์ดยังคงใช้งานได้ตามข้อมูลที่โหลดสำเร็จ" : "เริ่มทำควิซจากเอกสาร แล้วผลการทบทวนจะปรากฏที่นี่"}
            />
          </p>
          {quizAction ? (
            <Link
              className={`${styles.secondaryAction} group mt-4 inline-flex min-h-11 items-center gap-2 text-label-md font-bold text-foundation-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foundation-focus`}
              href={quizAction.href}
            >
              <DashboardLocalizedText en="Take a quiz" th="ทำควิซ" />
              <ArrowRight aria-hidden="true" className={`${styles.actionArrow} h-4 w-4`} />
            </Link>
          ) : null}
        </div>
      )}
    </section>
  );
};

const getGradeCopy = (score: number) => {
  if (score >= 90) return { en: "Excellent", th: "ยอดเยี่ยม" };
  if (score >= 80) return { en: "Very good", th: "ดีมาก" };
  if (score >= 70) return { en: "Good", th: "ดี" };
  return { en: "Review recommended", th: "ควรทบทวน" };
};
