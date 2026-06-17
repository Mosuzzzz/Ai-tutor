import {
  ArrowRight,
  BarChart3,
  BookOpenCheck,
  FileText,
  MessageSquareText,
  Sparkles,
  Target,
  TriangleAlert
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";

import { Card } from "../../components/ui/Card";
import {
  buildAnalyticsMetricCards,
  formatAnalyticsPercent,
  formatDepartmentLabel,
  formatRiskLevel,
  getLowestScoringSkill,
  getStrongestSkill,
  normalizeAnalyticsPercent,
  sortDepartmentStats,
  sortSkillGapsByRisk
} from "./learningAnalyticsHelpers";
import { learningAnalyticsMock } from "./learningAnalyticsData";
import type {
  LearningActivity,
  LearningActivityType,
  LearningAnalyticsDataSource,
  LearningAnalyticsMetric,
  LearningRecentScore,
  LearningAnalyticsStatus,
  LearningAnalyticsViewModel,
  LearningSkillGap,
  LearningTrendPoint
} from "./types";

type LearningAnalyticsPageProps = {
  analytics?: LearningAnalyticsViewModel;
  dataSource?: LearningAnalyticsDataSource;
  errorMessage?: string;
  status?: LearningAnalyticsStatus;
};

const metricToneClassNames: Record<LearningAnalyticsMetric["tone"], string> = {
  amber: "bg-[#f6f7f9] text-[#5c636e]",
  blue: "bg-[#f6f7f9] text-[#1e3a8a]",
  green: "bg-[#e5f6ef] text-[#0a5c42]",
  rose: "bg-[#f6f7f9] text-[#5c636e]"
};

const activityIconMap: Record<LearningActivityType, LucideIcon> = {
  chat: MessageSquareText,
  document: FileText,
  quiz: BookOpenCheck
};

const actionLinkClassName =
  "inline-flex min-h-12 max-w-full items-center justify-center gap-2 rounded border border-[#2b3038]/15 bg-white px-4 py-2 text-left text-label-md font-bold text-[#2b3038] transition-colors hover:bg-[#e5f6ef] focus:outline-none focus:ring-2 focus:ring-[#c7c3f5] focus:ring-offset-2";

const emptyPanelClassName =
  "mt-4 rounded border border-outline-variant/40 bg-[#ffffff] p-4 text-body-md text-on-surface-variant";

const formatTrendDateLabel = (date: string) => {
  return new Intl.DateTimeFormat("th-TH", {
    day: "numeric",
    month: "short"
  }).format(new Date(date));
};

const MetricCard = ({ metric }: { metric: LearningAnalyticsMetric }) => {
  return (
    <Card className="min-w-0 overflow-hidden" data-testid="dashboard-metric-card">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="break-words text-label-sm font-semibold uppercase text-on-surface-variant">
            {metric.label}
          </p>
          <p className="mt-2 text-display-lg font-bold text-on-surface">{metric.value}</p>
        </div>
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded ${metricToneClassNames[metric.tone]}`}>
          <BarChart3 aria-hidden="true" className="h-5 w-5" />
        </div>
      </div>
      <p className="mt-3 break-words text-body-md text-on-surface-variant">{metric.helper}</p>
    </Card>
  );
};

const ScoreTrendChart = ({ trend }: { trend: LearningTrendPoint[] }) => {
  if (trend.length === 0) {
    return (
      <Card className="min-w-0 overflow-hidden p-5">
        <p className="text-label-sm font-semibold text-[#2b3038]">แนวโน้มคะแนน</p>
        <h3 className="mt-1 break-words text-headline-md text-on-surface">แนวโน้มคะแนนเฉลี่ย</h3>
        <div className={emptyPanelClassName} data-testid="learning-score-trend-empty" role="status">
          ยังไม่มีข้อมูลแนวโน้มคะแนนจาก API
        </div>
      </Card>
    );
  }

  return (
    <Card className="min-w-0 overflow-hidden p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-label-sm font-semibold text-[#2b3038]">แนวโน้มคะแนน</p>
          <h3 className="mt-1 break-words text-headline-md text-on-surface">แนวโน้มคะแนนเฉลี่ย</h3>
        </div>
        <span className="rounded bg-[#e5f6ef] px-3 py-1 text-label-sm font-bold text-[#0a5c42]">
          {trend.length} จุดข้อมูล
        </span>
      </div>
      <div
        aria-label="แนวโน้มคะแนนเฉลี่ย 7 วันล่าสุด"
        className="mt-5 flex h-56 min-w-0 items-end gap-3 overflow-hidden rounded border border-outline-variant/40 bg-[#ffffff] px-4 py-5"
        role="img"
      >
        {trend.map((point) => {
          const percent = normalizeAnalyticsPercent(point.average_score);

          return (
            <div className="flex min-w-0 flex-1 flex-col items-center gap-2" key={point.date}>
              <div className="flex h-36 w-full items-end rounded bg-surface-container-low">
                <div
                  aria-hidden="true"
                  className="w-full rounded bg-[#2b3038]"
                  style={{ height: `${percent}%` }}
                />
              </div>
              <span className="text-label-sm font-bold text-on-surface">{percent}%</span>
              <span className="max-w-full truncate text-label-sm text-on-surface-variant">
                {formatTrendDateLabel(point.date)}
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

const SkillGapCard = ({ gap }: { gap: LearningSkillGap }) => {
  const riskPercent = normalizeAnalyticsPercent(gap.error_rate);

  return (
    <article
      aria-label={`ทักษะ ${gap.topic}`}
      className="min-w-0 overflow-hidden rounded border border-outline-variant/40 bg-[#ffffff] p-4"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h4 className="break-words text-body-lg font-bold text-on-surface">{gap.topic}</h4>
          <p className="mt-1 break-words text-body-md text-on-surface-variant">{gap.description}</p>
        </div>
        <span className="rounded bg-[#f6f7f9] px-3 py-1 text-label-sm font-bold text-[#5c636e]">
          {formatRiskLevel(gap.error_rate)}
        </span>
      </div>
      <div className="mt-4">
        <div className="flex items-center justify-between gap-3 text-label-sm">
          <span className="font-semibold text-on-surface-variant">อัตราตอบผิด</span>
          <span className="font-bold text-on-surface">{formatAnalyticsPercent(gap.error_rate)}</span>
        </div>
        <div
          aria-label={`${gap.topic} ความเสี่ยง ${riskPercent}%`}
          aria-valuemax={100}
          aria-valuemin={0}
          aria-valuenow={riskPercent}
          className="mt-2 h-2 overflow-hidden rounded-full bg-surface-container"
          role="progressbar"
        >
          <div
            aria-hidden="true"
            className="h-full rounded-full bg-[#5c636e]"
            style={{ width: `${riskPercent}%` }}
          />
        </div>
        <p className="mt-3 text-label-sm text-on-surface-variant">
          ผิด {gap.incorrect_count} จาก {gap.total_attempts} ครั้ง
        </p>
      </div>
    </article>
  );
};

const SkillRadarPanel = ({ skillGaps }: { skillGaps: LearningSkillGap[] }) => {
  const sortedSkillGaps = sortSkillGapsByRisk(skillGaps);

  return (
    <Card
      aria-label="เรดาร์ทักษะที่ควรทบทวน"
      className="min-w-0 overflow-hidden p-5"
      role="region"
    >
      <div className="flex items-center gap-2 text-label-sm font-semibold text-[#2b3038]">
        <Target aria-hidden="true" className="h-4 w-4" />
        วิเคราะห์จุดอ่อน
      </div>
      <h3 className="mt-2 text-headline-md text-on-surface">เรดาร์ทักษะที่ควรทบทวน</h3>
      {sortedSkillGaps.length > 0 ? (
        <div className="mt-5 grid gap-3">
          {sortedSkillGaps.map((gap) => (
            <SkillGapCard gap={gap} key={gap.topic} />
          ))}
        </div>
      ) : (
        <div className={emptyPanelClassName} data-testid="learning-skill-gaps-empty" role="status">
          ยังไม่มีข้อมูลจุดอ่อนรายทักษะจาก API
        </div>
      )}
    </Card>
  );
};

const DepartmentStatsPanel = ({ analytics }: { analytics: LearningAnalyticsViewModel }) => {
  const sortedStats = sortDepartmentStats(analytics.apiResponse.department_stats);

  return (
    <Card className="min-w-0 overflow-hidden p-5">
      <h3 className="text-headline-md text-on-surface">สถานะเอกสารประกอบการเรียน</h3>
      {sortedStats.length > 0 ? (
        <div className="mt-4 grid gap-3">
          {sortedStats.map((stat) => (
            <div
              className="flex min-w-0 items-center justify-between gap-3 rounded border border-outline-variant/40 bg-[#ffffff] p-3"
              key={stat.label}
            >
              <span className="break-words text-body-md font-semibold text-on-surface-variant">
                {formatDepartmentLabel(stat.label)}
              </span>
              <span className="text-headline-sm font-bold text-on-surface">{stat.value}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className={emptyPanelClassName} data-testid="learning-department-empty" role="status">
          ยังไม่มีข้อมูลสถานะเอกสารประกอบการเรียนจาก API
        </div>
      )}
    </Card>
  );
};

const RecentScoresPanel = ({ recentScores }: { recentScores: LearningRecentScore[] }) => {
  return (
    <Card className="min-w-0 overflow-hidden p-5">
      <h3 className="text-headline-md text-on-surface">คะแนนควิซล่าสุด</h3>
      <p className="mt-1 break-words text-body-md text-on-surface-variant">
        ผลจากการส่งคำตอบจริงที่ถูกบันทึกกลับเข้า analytics
      </p>
      {recentScores.length > 0 ? (
        <div className="mt-4 grid gap-3">
          {recentScores.map((score) => (
            <article
              className="min-w-0 overflow-hidden rounded border border-outline-variant/40 bg-[#ffffff] p-4"
              key={score.id}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h4 className="break-words text-body-lg font-bold text-on-surface">{score.filename}</h4>
                  <p className="mt-1 text-label-sm font-semibold text-on-surface-variant">
                    {score.submittedAtLabel}
                  </p>
                </div>
                <span className="rounded bg-[#e5f6ef] px-3 py-1 text-label-sm font-bold text-[#0a5c42]">
                  {formatAnalyticsPercent(score.scorePercent)}
                </span>
              </div>
              <Link className={`${actionLinkClassName} mt-3`} href={score.examHref}>
                ดูควิซและคะแนน
                <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </Link>
            </article>
          ))}
        </div>
      ) : (
        <div className={emptyPanelClassName} data-testid="learning-recent-scores-empty" role="status">
          ยังไม่มีคะแนนควิซล่าสุดจาก API
        </div>
      )}
    </Card>
  );
};

const LearningActivityTable = ({ activities }: { activities: LearningActivity[] }) => {
  if (activities.length === 0) {
    return (
      <Card className="min-w-0 overflow-hidden p-5">
        <h3 className="text-headline-md text-on-surface">กิจกรรมการเรียนล่าสุด</h3>
        <div className={emptyPanelClassName} data-testid="learning-activity-empty" role="status">
          ยังไม่มีกิจกรรมล่าสุดจาก API
        </div>
      </Card>
    );
  }

  return (
    <Card className="min-w-0 overflow-hidden p-5">
      <h3 className="text-headline-md text-on-surface">กิจกรรมการเรียนล่าสุด</h3>
      <div className="mt-4 overflow-x-auto">
        <table aria-label="กิจกรรมการเรียนล่าสุด" className="min-w-full border-separate border-spacing-y-2 text-left">
          <thead>
            <tr className="text-label-sm text-on-surface-variant">
              <th className="px-3 py-2" scope="col">กิจกรรม</th>
              <th className="px-3 py-2" scope="col">ผู้เกี่ยวข้อง</th>
              <th className="px-3 py-2" scope="col">เวลา</th>
              <th className="px-3 py-2" scope="col">ผลลัพธ์</th>
            </tr>
          </thead>
          <tbody>
            {activities.map((activity) => {
              const Icon = activityIconMap[activity.type];

              return (
                <tr className="rounded bg-[#ffffff] text-body-md text-on-surface" key={activity.id}>
                  <td className="min-w-64 rounded-l border-y border-l border-outline-variant/40 px-3 py-3">
                    <div className="flex min-w-0 gap-3">
                      <Icon aria-hidden="true" className="mt-1 h-4 w-4 shrink-0 text-[#2b3038]" />
                      <div className="min-w-0">
                        <p className="break-words font-bold">{activity.title}</p>
                        <p className="mt-1 break-words text-label-sm text-on-surface-variant">
                          {activity.description}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="border-y border-outline-variant/40 px-3 py-3 text-on-surface-variant">
                    {activity.actorLabel}
                  </td>
                  <td className="border-y border-outline-variant/40 px-3 py-3 text-on-surface-variant">
                    {activity.occurredAtLabel}
                  </td>
                  <td className="rounded-r border-y border-r border-outline-variant/40 px-3 py-3 font-bold text-on-surface">
                    {activity.scorePercent === undefined ? "พร้อมวิเคราะห์" : formatAnalyticsPercent(activity.scorePercent)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export const LearningAnalyticsPage = ({
  analytics = learningAnalyticsMock,
  dataSource = "api-ready-mock",
  errorMessage = "ไม่สามารถโหลดสถิติการเรียนได้",
  status = "ready"
}: LearningAnalyticsPageProps) => {
  if (status === "loading") {
    return (
      <Card className="text-body-md text-on-surface-variant" role="status">
        กำลังโหลดสถิติการเรียน
      </Card>
    );
  }

  if (status === "error") {
    return (
      <div
        className="rounded border border-[#f5c6c6] bg-[#fce9e9] p-6 text-body-md font-semibold text-[#a11d21] shadow-ambient"
        role="alert"
      >
        {errorMessage}
      </div>
    );
  }

  const hasAnalyticsData =
    analytics.apiResponse.average_tenant_score > 0 ||
    analytics.apiResponse.department_stats.length > 0 ||
    analytics.apiResponse.score_trend.length > 0 ||
    analytics.apiResponse.skill_gaps.length > 0 ||
    analytics.activities.length > 0 ||
    analytics.recentScores.length > 0 ||
    analytics.apiResponse.total_employees > 0 ||
    analytics.apiResponse.total_quizzes_taken > 0;

  if (!hasAnalyticsData) {
    return (
      <div className="space-y-6" data-source={dataSource} data-testid="learning-analytics">
        <Card className="text-center" role="status">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded bg-surface-container text-primary">
            <TriangleAlert aria-hidden="true" className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-headline-md text-on-surface">ยังไม่มีข้อมูลสถิติจากควิซ</h2>
          <p className="mt-2 text-body-md text-on-surface-variant">
            เมื่อผู้เรียนทำควิซหรือใช้เอกสารแล้ว ระบบจะแสดงแนวโน้มคะแนนและจุดที่ควรทบทวน
          </p>
          <div className="mx-auto mt-6 grid max-w-3xl gap-3 sm:grid-cols-2">
            <Link
              className="inline-flex min-h-12 items-center justify-between gap-2 rounded bg-[#5a4fe0] px-4 py-2 text-label-md font-bold text-[#15181d] transition-colors hover:bg-[#c7c3f5] focus:outline-none focus:ring-2 focus:ring-[#c7c3f5] focus:ring-offset-2"
              href="/quiz"
            >
              สร้างควิซแรกเพื่อเก็บคะแนน
              <BookOpenCheck aria-hidden="true" className="h-5 w-5" />
            </Link>
            <Link
              className="inline-flex min-h-12 items-center justify-between gap-2 rounded border border-outline-variant/50 bg-white px-4 py-2 text-label-md font-bold text-primary transition-colors hover:bg-surface-container-low focus:outline-none focus:ring-2 focus:ring-primary-fixed-dim focus:ring-offset-2"
              href="/documents"
            >
              เปิดเอกสารที่พร้อมทบทวน
              <FileText aria-hidden="true" className="h-5 w-5" />
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const metrics = buildAnalyticsMetricCards(analytics.apiResponse);
  const strongestSkill = getStrongestSkill(analytics.apiResponse.skill_gaps);
  const lowestScoringSkill = getLowestScoringSkill(analytics.apiResponse.skill_gaps);

  return (
    <div className="space-y-6" data-source={dataSource} data-testid="learning-analytics">
      <section
        className="overflow-hidden rounded border border-[#2b3038]/15 bg-[#15181d] text-white shadow-ambient"
        data-dashboard-surface="analytics"
        data-testid="dashboard-hero"
      >
        <div className="p-5 md:p-7">
          <div className="inline-flex items-center gap-2 rounded bg-white/10 px-3 py-1.5 text-label-sm font-semibold text-[#c7c3f5]">
            <Sparkles aria-hidden="true" className="h-4 w-4" />
            พื้นที่วิเคราะห์การเรียน
          </div>
          <p className="mt-3 text-label-sm font-semibold text-white/70">{analytics.workspaceName}</p>
          <h2 className="mt-5 text-headline-lg-mobile font-bold md:text-headline-lg">สถิติการเรียน</h2>
          <p className="mt-3 max-w-3xl break-words text-body-md text-white/80 md:text-body-lg">
            ดูแนวโน้มคะแนน จุดอ่อนรายทักษะ และกิจกรรมล่าสุด เพื่อวางแผนทบทวนจากข้อมูลควิซและเอกสาร
          </p>
          <p className="mt-4 text-label-sm font-semibold text-white/70">{analytics.generatedAtLabel}</p>
        </div>
      </section>

      <section aria-label="ตัวชี้วัดสถิติการเรียน" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.id} metric={metric} />
        ))}
      </section>

      <section
        className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,380px)]"
        data-testid="learning-analytics-grid"
      >
        <div className="grid min-w-0 gap-4 overflow-hidden" data-testid="learning-analytics-main-panel">
          <ScoreTrendChart trend={analytics.apiResponse.score_trend} />
          <SkillRadarPanel skillGaps={analytics.apiResponse.skill_gaps} />
          <LearningActivityTable activities={analytics.activities} />
        </div>

        <aside className="grid min-w-0 gap-4 overflow-hidden" data-testid="learning-analytics-side-panel">
          <RecentScoresPanel recentScores={analytics.recentScores} />

          <Card className="min-w-0 overflow-hidden p-5">
            <h3 className="text-headline-md text-on-surface">คำแนะนำถัดไป</h3>
            <div className="mt-4 grid gap-3">
              <div className="rounded border border-outline-variant/40 bg-[#ffffff] p-4">
                <p className="text-label-sm font-bold text-[#0a5c42]">แข็งแรงที่สุด</p>
                <p className="mt-2 break-words text-body-lg font-bold text-on-surface">
                  {strongestSkill?.topic ?? "ยังไม่มีข้อมูล"}
                </p>
              </div>
              <div className="rounded border border-outline-variant/40 bg-[#ffffff] p-4">
                <p className="text-label-sm font-bold text-[#5c636e]">ควรทบทวนก่อน</p>
                <p className="mt-2 break-words text-body-lg font-bold text-on-surface">
                  {lowestScoringSkill?.topic ?? "ยังไม่มีข้อมูล"}
                </p>
              </div>
            </div>
            <div className="mt-5 grid gap-3">
              <Link className={actionLinkClassName} href="/quiz">
                สร้างควิซจากจุดอ่อน
                <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </Link>
              <Link className={actionLinkClassName} href="/documents">
                ดูเอกสารที่เกี่ยวข้อง
                <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </Link>
            </div>
          </Card>

          <DepartmentStatsPanel analytics={analytics} />
        </aside>
      </section>
    </div>
  );
};
