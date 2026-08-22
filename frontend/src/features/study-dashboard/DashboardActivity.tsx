import { ChartNoAxesColumnIncreasing } from "lucide-react";

import { DashboardLocalizedDate, DashboardLocalizedText } from "./DashboardLocalizedText.client";
import styles from "./studyDashboard.module.css";
import type { StudyDashboardScoreTrendPoint } from "./types";

type DashboardActivityProps = {
  isUnavailable?: boolean;
  trend: StudyDashboardScoreTrendPoint[];
};

const VIEWBOX_WIDTH = 720;
const VIEWBOX_HEIGHT = 220;
const CHART_PADDING_X = 28;
const CHART_PADDING_Y = 24;

export const DashboardActivity = ({ isUnavailable = false, trend }: DashboardActivityProps) => {
  const hasTrend = trend.length >= 2;

  return (
    <section
      aria-labelledby="dashboard-activity-title"
      className="overflow-hidden rounded-foundation-lg border border-foundation-brand/15 bg-foundation-surface-elevated p-5 shadow-foundation-surface sm:p-7"
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="inline-flex items-center gap-2 text-label-sm font-bold uppercase tracking-[0.16em] text-foundation-brand">
            <ChartNoAxesColumnIncreasing aria-hidden="true" className="h-4 w-4" />
            <DashboardLocalizedText en="Quiz activity" th="กิจกรรมจากควิซ" />
          </p>
          <h2 className="mt-2 text-headline-md text-foundation-ink" id="dashboard-activity-title"><DashboardLocalizedText en="Quiz score trend" th="แนวโน้มคะแนนควิซ" /></h2>
          <p className="mt-1.5 text-body-md text-foundation-ink-secondary"><DashboardLocalizedText en="Average scores by date from your completed quizzes." th="คะแนนเฉลี่ยตามวันที่จากผลควิซที่มีอยู่จริง" /></p>
        </div>
        {hasTrend ? (
          <p className="rounded-full bg-foundation-brand-soft px-3 py-1.5 text-label-sm font-bold text-foundation-brand">
            <DashboardLocalizedText en={`${trend.length} data points`} th={`${trend.length} จุดข้อมูล`} />
          </p>
        ) : null}
      </div>

      {hasTrend ? <ScoreTrendFigure trend={trend} /> : <EmptyTrend isUnavailable={isUnavailable} />}
    </section>
  );
};

const ScoreTrendFigure = ({ trend }: { trend: StudyDashboardScoreTrendPoint[] }) => {
  const coordinates = trend.map((point, index) => {
    const usableWidth = VIEWBOX_WIDTH - CHART_PADDING_X * 2;
    const usableHeight = VIEWBOX_HEIGHT - CHART_PADDING_Y * 2;
    const x = CHART_PADDING_X + (index / (trend.length - 1)) * usableWidth;
    const scoreForGeometry = Math.min(100, Math.max(0, point.score));
    const y = CHART_PADDING_Y + ((100 - scoreForGeometry) / 100) * usableHeight;
    return { ...point, x, y };
  });
  const path = coordinates.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
  const scores = trend.map((point) => point.scoreLabel).join(", ");
  const latest = trend.at(-1);

  return (
    <figure className="mt-6" aria-describedby="dashboard-score-trend-summary">
      <div className="rounded-foundation-md border border-foundation-border-subtle bg-foundation-brand-soft/35 px-3 py-4 sm:px-5">
        <svg aria-labelledby="dashboard-score-trend-summary" className="h-auto w-full overflow-visible" role="img" viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}>
          {[0.25, 0.5, 0.75].map((position) => (
            <line
              aria-hidden="true"
              className="stroke-foundation-border-subtle"
              key={position}
              strokeDasharray="4 8"
              x1={CHART_PADDING_X}
              x2={VIEWBOX_WIDTH - CHART_PADDING_X}
              y1={CHART_PADDING_Y + position * (VIEWBOX_HEIGHT - CHART_PADDING_Y * 2)}
              y2={CHART_PADDING_Y + position * (VIEWBOX_HEIGHT - CHART_PADDING_Y * 2)}
            />
          ))}
          <path
            aria-hidden="true"
            className={`${styles.chartLine} fill-none stroke-foundation-brand`}
            d={path}
            pathLength="1"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="4"
          />
          {coordinates.map((point, index) => (
            <g
              aria-hidden="true"
              className={styles.chartPoint}
              key={`${point.date}-${index}`}
              style={{ animationDelay: `${700 + index * 55}ms` }}
            >
              <circle className="fill-foundation-surface stroke-foundation-brand" cx={point.x} cy={point.y} r="6" strokeWidth="3" />
            </g>
          ))}
        </svg>
        <div className="mt-2 flex items-center justify-between gap-4 text-label-sm text-foundation-ink-muted">
          <span><DashboardLocalizedDate date={trend[0].date} /></span>
          {latest ? <span className="font-bold text-foundation-brand"><DashboardLocalizedText en={`Latest ${latest.scoreLabel}`} th={`ล่าสุด ${latest.scoreLabel}`} /></span> : null}
          <span>{latest ? <DashboardLocalizedDate date={latest.date} /> : null}</span>
        </div>
      </div>
      <figcaption className="sr-only" id="dashboard-score-trend-summary">
        <DashboardLocalizedText
          en={`Quiz score trend from ${trend.length} data points: ${scores}. ${trend.map((point) => `${point.date} ${point.scoreLabel}`).join(", ")}`}
          th={`แนวโน้มคะแนนควิซจาก ${trend.length} จุดข้อมูล: ${scores}. ${trend.map((point) => `${point.date} ${point.scoreLabel}`).join(", ")}`}
        />
      </figcaption>
    </figure>
  );
};

const EmptyTrend = ({ isUnavailable }: { isUnavailable: boolean }) => (
  <div className="mt-6 rounded-foundation-md border border-dashed border-foundation-border-control bg-foundation-brand-soft/25 p-5 sm:p-6" role="status">
    <svg aria-hidden="true" className="h-24 w-full text-foundation-border-control" viewBox="0 0 720 120">
      <path d="M28 15V100H692" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M28 42H692M28 71H692" fill="none" opacity="0.55" stroke="currentColor" strokeDasharray="4 10" />
    </svg>
    <p className="mt-3 text-body-md font-bold text-foundation-ink">
      <DashboardLocalizedText
        en={isUnavailable ? "Quiz trend data is unavailable right now." : "There is not enough data to show a trend yet."}
        th={isUnavailable ? "ยังไม่สามารถโหลดข้อมูลแนวโน้มได้ในขณะนี้" : "ยังไม่มีข้อมูลมากพอสำหรับแสดงแนวโน้ม"}
      />
    </p>
    <p className="mt-1 text-body-md text-foundation-ink-secondary">
      <DashboardLocalizedText
        en={isUnavailable
          ? "Other Dashboard sections remain available from the data that loaded successfully."
          : "Complete more quizzes and your score trend will appear here."}
        th={isUnavailable
          ? "ส่วนอื่นของแดชบอร์ดยังคงใช้งานได้ตามข้อมูลที่โหลดสำเร็จ"
          : "ทำควิซเพิ่มเติม แล้วแนวโน้มคะแนนของคุณจะปรากฏที่นี่"}
      />
    </p>
  </div>
);
