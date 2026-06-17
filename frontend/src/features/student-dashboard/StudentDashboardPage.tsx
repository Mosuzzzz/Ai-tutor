import {
  ArrowRight,
  BookOpenCheck,
  Bot,
  FileText,
  Flame,
  LineChart,
  MessageSquareText,
  Sparkles,
  Target
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";

import {
  formatScore,
  getHeroSummary,
  getProgressPercentValue,
  getRelativeTimeLabel,
  getStudentGreeting,
  getTopScores,
  scoreToGrade
} from "./dashboardHelpers";
import { studentDashboardMock } from "./mockData";
import type {
  ContinueLearningItem,
  StudentDashboardDataSource,
  StudentDashboardStatus,
  StudentDashboardViewModel
} from "./types";

type StudentDashboardPageProps = {
  dataSource?: StudentDashboardDataSource;
  dashboard?: StudentDashboardViewModel;
  errorMessage?: string;
  status?: StudentDashboardStatus;
};

type MetricCard = {
  id: string;
  label: string;
  value: string;
  helper: string;
  icon: LucideIcon;
};

type EmptyOnboardingStep = {
  description: string;
  step: string;
  title: string;
};

const progressTypeIcon: Record<ContinueLearningItem["type"], LucideIcon> = {
  document: FileText,
  lesson: BookOpenCheck,
  quiz: Bot
};

const emptyOnboardingSteps: EmptyOnboardingStep[] = [
  {
    description: "อัปโหลดไฟล์ที่ต้องการสรุปหรือใช้สร้างควิซ",
    step: "01",
    title: "เพิ่มเอกสารเรียน"
  },
  {
    description: "ให้ AI Tutor เปลี่ยนเนื้อหาเป็นคำถามฝึกซ้อม",
    step: "02",
    title: "ทบทวนด้วยควิซ"
  },
  {
    description: "ติดตามคะแนน จุดแข็ง และหัวข้อที่ควรทบทวน",
    step: "03",
    title: "ดูสถิติส่วนตัว"
  }
];

const emptyMetricCards: MetricCard[] = [
  {
    helper: "จะเริ่มนับหลังอัปโหลดและประมวลผลเสร็จ",
    icon: FileText,
    id: "ready-documents",
    label: "เอกสารพร้อมอ่าน",
    value: "0"
  },
  {
    helper: "คะแนนแรกจะปรากฏหลังส่งคำตอบ",
    icon: BookOpenCheck,
    id: "completed-quizzes",
    label: "ควิซที่ทำแล้ว",
    value: "0"
  },
  {
    helper: "เริ่มต่อเนื่องเมื่อกลับมาทบทวนทุกวัน",
    icon: Flame,
    id: "learning-streak",
    label: "สตรีกการเรียน",
    value: "0 วัน"
  },
  {
    helper: "ระบบจะสรุปจากผลควิซและกิจกรรมจริง",
    icon: Target,
    id: "review-topics",
    label: "หัวข้อที่ควรทบทวน",
    value: "0"
  }
];

const emptyPreviewPanels: { description: string; title: string }[] = [
  { description: "รายการเอกสารและบทเรียนล่าสุด", title: "เรียนต่อจากเดิม" },
  { description: "ผลควิซและแนวโน้มคะแนนส่วนตัว", title: "คะแนนล่าสุด" },
  { description: "หัวข้อที่ควรทบทวนจากกิจกรรมจริง", title: "คำแนะนำจาก AI" }
];

const MetricCardView = ({ metric }: { metric: MetricCard }) => {
  const Icon = metric.icon;
  return (
    <div
      className="rounded-lg border border-outline-variant bg-surface-container-lowest p-4"
      data-testid="dashboard-metric-card"
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-label-sm font-medium text-on-surface-variant">{metric.label}</p>
        <Icon aria-hidden="true" className="h-4 w-4 text-on-surface-variant" />
      </div>
      <p className="mt-3 font-mono text-display-lg font-semibold tracking-tight text-on-surface" data-mono>
        {metric.value}
      </p>
      <p className="mt-1 text-label-sm text-on-surface-variant">{metric.helper}</p>
    </div>
  );
};

export const StudentDashboardPage = ({
  dataSource = "api-ready-mock",
  dashboard = studentDashboardMock,
  errorMessage = "ไม่สามารถโหลดข้อมูลผู้เรียนได้",
  status = "ready"
}: StudentDashboardPageProps) => {
  if (status === "loading") {
    return (
      <div
        className="rounded-lg border border-outline-variant bg-surface-container-lowest p-6 text-body-md text-on-surface-variant"
        role="status"
      >
        กำลังโหลดแดชบอร์ดผู้เรียน
      </div>
    );
  }

  if (status === "error") {
    return (
      <div
        className="rounded-lg border border-error/30 bg-error-container p-6 text-body-md font-medium text-on-error-container"
        role="alert"
      >
        {errorMessage}
      </div>
    );
  }

  if (status === "empty") {
    return (
      <div data-source={dataSource} data-testid="student-dashboard" className="space-y-6">
        <section
          className="rounded-lg border border-outline-variant bg-surface-container-lowest p-6 md:p-8"
          data-dashboard-surface="student"
          data-testid="dashboard-hero"
        >
          <div className="inline-flex items-center gap-1.5 rounded-full border border-primary-fixed-dim bg-primary-container px-2.5 py-0.5 text-label-sm font-medium text-on-primary-container">
            <Sparkles aria-hidden="true" className="h-3.5 w-3.5" />
            พื้นที่เรียนรู้ส่วนตัว
          </div>
          <div className="mt-4" role="status">
            <p className="font-mono text-label-sm uppercase tracking-wide text-on-surface-variant">แดชบอร์ดผู้เรียน</p>
            <h2 className="mt-1.5 text-headline-lg-mobile text-on-surface md:text-headline-lg">ยังไม่มีข้อมูลการเรียน</h2>
            <p className="mt-2 max-w-2xl text-body-md text-on-surface-variant">
              {dashboard.learnerName} ยังไม่มีผลควิซหรือเอกสารพร้อมอ่านในระบบ เริ่มจากอัปโหลดเอกสารหรือสร้างควิซฝึกซ้อม เพื่อให้ AI Tutor สร้างเส้นทางทบทวนของคุณ
            </p>
          </div>

          <nav aria-label="เริ่มต้นแดชบอร์ดผู้เรียน" className="mt-6 grid gap-3 md:grid-cols-3">
            <Link
              className="group rounded-lg border border-primary bg-primary p-4 text-on-primary transition-colors hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary-fixed-dim focus:ring-offset-2"
              href="/documents"
            >
              <div className="flex items-center justify-between gap-3">
                <FileText aria-hidden="true" className="h-5 w-5" />
                <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </div>
              <p className="mt-3 text-body-md font-semibold">อัปโหลดเอกสารแรก</p>
              <p className="mt-1 text-label-sm text-on-primary/80">ให้ระบบสรุปและเตรียมเนื้อหา</p>
            </Link>
            <Link
              className="group rounded-lg border border-outline-variant bg-surface-container-lowest p-4 transition-colors hover:border-primary hover:bg-surface-container-low focus:outline-none focus:ring-2 focus:ring-primary-fixed-dim focus:ring-offset-2"
              href="/quiz"
            >
              <div className="flex items-center justify-between gap-3">
                <Bot aria-hidden="true" className="h-5 w-5 text-primary" />
                <ArrowRight aria-hidden="true" className="h-4 w-4 text-on-surface-variant transition-transform group-hover:translate-x-0.5" />
              </div>
              <p className="mt-3 text-body-md font-semibold text-on-surface">สร้างควิซฝึกซ้อม</p>
              <p className="mt-1 text-label-sm text-on-surface-variant">ฝึกจากเอกสารที่พร้อมใช้งาน</p>
            </Link>
            <Link
              className="group rounded-lg border border-outline-variant bg-surface-container-lowest p-4 transition-colors hover:border-primary hover:bg-surface-container-low focus:outline-none focus:ring-2 focus:ring-primary-fixed-dim focus:ring-offset-2"
              href="/analytics"
            >
              <div className="flex items-center justify-between gap-3">
                <LineChart aria-hidden="true" className="h-5 w-5 text-primary" />
                <ArrowRight aria-hidden="true" className="h-4 w-4 text-on-surface-variant transition-transform group-hover:translate-x-0.5" />
              </div>
              <p className="mt-3 text-body-md font-semibold text-on-surface">ดูสถิติหลังทำควิซ</p>
              <p className="mt-1 text-label-sm text-on-surface-variant">คะแนนและจุดที่ควรทบทวนจะอยู่ที่นี่</p>
            </Link>
          </nav>
        </section>

        <section aria-label="แผนเริ่มต้นวันนี้" className="rounded-lg border border-outline-variant bg-surface-container-lowest p-5 md:p-6">
          <h3 className="text-headline-md text-on-surface">เริ่มจาก 3 ขั้นตอนสั้น ๆ</h3>
          <div className="mt-5 grid gap-5 md:grid-cols-3">
            {emptyOnboardingSteps.map(({ description, step, title }) => (
              <div className="flex gap-3" key={step}>
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-outline-variant bg-surface-container-low font-mono text-label-sm font-semibold text-primary">
                  {step}
                </span>
                <div>
                  <p className="text-body-md font-semibold text-on-surface">{title}</p>
                  <p className="mt-0.5 text-label-md text-on-surface-variant">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section aria-label="สรุปสถานะเริ่มต้น" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {emptyMetricCards.map((metric) => (
            <MetricCardView key={metric.id} metric={metric} />
          ))}
        </section>

        <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
          <section className="rounded-lg border border-outline-variant bg-surface-container-lowest p-5 md:p-6">
            <h3 className="text-headline-md text-on-surface">พื้นที่เรียนรู้จะเติมข้อมูลเองหลังเริ่มใช้งาน</h3>
            <p className="mt-2 max-w-2xl text-body-md text-on-surface-variant">
              แดชบอร์ดนี้จะไม่แสดงข้อมูลจำลอง เมื่อมีเอกสาร ควิซ หรือผลคะแนนจาก backend จริง ระบบจะเติมเนื้อหาต่อไปนี้ให้อัตโนมัติ
            </p>
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              {emptyPreviewPanels.map(({ description, title }) => (
                <div className="rounded-md border border-outline-variant bg-surface-container-low p-4" key={title}>
                  <p className="text-body-md font-semibold text-on-surface">{title}</p>
                  <p className="mt-1.5 text-label-md text-on-surface-variant">{description}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-outline-variant bg-surface-container-lowest p-5 md:p-6">
            <div className="flex items-center gap-2 text-label-sm font-medium text-primary">
              <MessageSquareText aria-hidden="true" className="h-4 w-4" />
              พร้อมช่วยทบทวน
            </div>
            <h3 className="mt-3 text-headline-md text-on-surface">ถาม AI ได้หลังมีเอกสาร</h3>
            <p className="mt-2 text-body-md text-on-surface-variant">
              เมื่อมีเอกสารที่สรุปเสร็จแล้ว AI Tutor จะตอบพร้อม citation และช่วยต่อยอดเป็นควิซได้
            </p>
            <Link
              className="mt-5 inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-outline-variant bg-surface-container-lowest px-3.5 py-2 text-label-md font-semibold text-on-surface transition-colors hover:bg-surface-container-low focus:outline-none focus:ring-2 focus:ring-primary-fixed-dim focus:ring-offset-2"
              href="/chat"
            >
              เปิดหน้าแชต AI
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          </section>
        </section>
      </div>
    );
  }

  const metrics: MetricCard[] = [
    {
      id: "completed-quizzes",
      label: "แบบทดสอบที่ทำแล้ว",
      value: String(dashboard.apiResponse.completed_quizzes),
      helper: "ชุดฝึกที่เสร็จสิ้น",
      icon: BookOpenCheck
    },
    {
      id: "average-score",
      label: "คะแนนเฉลี่ย",
      value: formatScore(dashboard.apiResponse.average_score),
      helper: "จากการทำแบบทดสอบล่าสุด",
      icon: Target
    },
    {
      id: "streak-days",
      label: "สตรีกการเรียน",
      value: `${dashboard.apiResponse.streak_days} วัน`,
      helper: "รักษาจังหวะการเรียนต่อเนื่อง",
      icon: Flame
    },
    {
      id: "documents-read",
      label: "เอกสารที่อ่านแล้ว",
      value: String(dashboard.apiResponse.read_documents_count),
      helper: "สรุปที่ทบทวนแล้ว",
      icon: FileText
    }
  ];
  const topScores = getTopScores(dashboard.apiResponse.recent_scores);
  const greeting = getStudentGreeting(dashboard.learnerName);

  return (
    <div data-source={dataSource} data-testid="student-dashboard" className="space-y-6">
      <section
        className="flex flex-col gap-5 border-b border-outline-variant pb-6 lg:flex-row lg:items-end lg:justify-between"
        data-dashboard-surface="student"
        data-testid="dashboard-hero"
      >
        <div className="min-w-0">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-primary-fixed-dim bg-primary-container px-2.5 py-0.5 text-label-sm font-medium text-on-primary-container">
            <Sparkles aria-hidden="true" className="h-3.5 w-3.5" />
            พื้นที่เรียนรู้ส่วนตัว
          </div>
          <h2 className="mt-3 text-headline-lg-mobile text-on-surface md:text-headline-lg">แดชบอร์ดผู้เรียน</h2>
          <p className="mt-1.5 max-w-2xl text-body-md text-on-surface-variant">
            <span className="font-medium text-on-surface">{greeting}</span>{" "}
            {getHeroSummary(dashboard.learnerName).replace(`${greeting} `, "")}
          </p>
          <p className="mt-3 font-mono text-label-sm text-on-surface-variant">
            {dashboard.generatedAtLabel} · {dashboard.nextMilestone}
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Link
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-primary px-3.5 py-2 text-label-md font-semibold text-on-primary transition-colors hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary-fixed-dim focus:ring-offset-2"
            href="/courses"
          >
            เรียนต่อ
            <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </Link>
          <Link
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-outline-variant bg-surface-container-lowest px-3.5 py-2 text-label-md font-semibold text-on-surface transition-colors hover:bg-surface-container-low focus:outline-none focus:ring-2 focus:ring-primary-fixed-dim focus:ring-offset-2"
            href="/chat"
          >
            ถาม AI Tutor
            <MessageSquareText aria-hidden="true" className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <section aria-label="สรุปตัวเลขผู้เรียน" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCardView key={metric.id} metric={metric} />
        ))}
      </section>

      <section aria-label="คำแนะนำจาก AI" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {dashboard.assistantPrompts.map((prompt) => (
          <Link
            className="group rounded-lg border border-outline-variant bg-surface-container-lowest p-4 transition-colors hover:border-primary hover:bg-surface-container-low focus:outline-none focus:ring-2 focus:ring-primary-fixed-dim focus:ring-offset-2"
            href={prompt.href}
            key={prompt.id}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-body-lg font-semibold text-on-surface">{prompt.title}</h3>
                <p className="mt-1 text-label-md text-on-surface-variant">{prompt.description}</p>
              </div>
              <ArrowRight
                aria-hidden="true"
                className="mt-0.5 h-4 w-4 shrink-0 text-on-surface-variant transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
              />
            </div>
          </Link>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section
          aria-label="เรียนต่อจากเดิม"
          className="rounded-lg border border-outline-variant bg-surface-container-lowest"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-outline-variant px-5 py-4">
            <div>
              <h3 className="text-headline-md text-on-surface">เรียนต่อจากเดิม</h3>
              <p className="mt-0.5 text-label-md text-on-surface-variant">กลับไปยังบทเรียนและเอกสารล่าสุดของคุณ</p>
            </div>
            <Link className="text-label-md font-semibold text-primary hover:text-primary-hover" href="/courses">
              ดูคอร์สทั้งหมด
            </Link>
          </div>

          <div className="divide-y divide-outline-variant">
            {dashboard.continueLearning.map((item) => {
              const Icon = progressTypeIcon[item.type];
              const progressPercent = getProgressPercentValue(item.progressPercent);

              return (
                <Link
                  className="flex flex-col gap-4 px-5 py-4 transition-colors hover:bg-surface-container-low focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-fixed-dim md:flex-row md:items-center md:justify-between"
                  href={item.href}
                  key={item.id}
                >
                  <div className="flex min-w-0 gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-outline-variant bg-surface-container-low text-primary">
                      <Icon aria-hidden="true" className="h-[18px] w-[18px]" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="truncate text-body-md font-semibold text-on-surface">{item.title}</h4>
                      <p className="mt-0.5 text-label-md text-on-surface-variant">
                        {item.source} · เหลือ {item.minutesRemaining} นาที
                      </p>
                    </div>
                  </div>
                  <div className="min-w-36">
                    <div className="flex items-center justify-between font-mono text-label-sm text-on-surface-variant">
                      <span>ความคืบหน้า</span>
                      <span data-mono>{progressPercent}%</span>
                    </div>
                    <div
                      aria-label={`${item.title} ความคืบหน้า ${progressPercent}%`}
                      aria-valuemax={100}
                      aria-valuemin={0}
                      aria-valuenow={progressPercent}
                      className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-container-high"
                      role="progressbar"
                    >
                      <div className="h-full rounded-full bg-primary" style={{ width: `${progressPercent}%` }} />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        <section
          aria-label="คะแนนล่าสุด"
          className="rounded-lg border border-outline-variant bg-surface-container-lowest"
        >
          <div className="flex items-center justify-between gap-3 border-b border-outline-variant px-5 py-4">
            <div>
              <h3 className="text-headline-md text-on-surface">คะแนนล่าสุด</h3>
              <p className="mt-0.5 text-label-md text-on-surface-variant">ผลควิซล่าสุดจากภาพรวมการเรียน</p>
            </div>
            <LineChart aria-hidden="true" className="h-5 w-5 text-on-surface-variant" />
          </div>

          <div className="space-y-4 p-5">
            <div className="space-y-3">
              {topScores.map((score) => (
                <div className="flex items-center justify-between gap-4" key={score.id}>
                  <div className="min-w-0">
                    <p className="truncate text-body-md font-medium text-on-surface">{score.filename}</p>
                    <p className="mt-0.5 font-mono text-label-sm text-on-surface-variant">
                      {getRelativeTimeLabel(score.submitted_at)}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="inline-flex rounded-md border border-success/30 bg-success-container px-2 py-0.5 font-mono text-label-md font-semibold text-on-success-container" data-mono>
                      {formatScore(score.score)}
                    </div>
                    <p className="mt-0.5 text-label-sm text-on-surface-variant">{scoreToGrade(score.score)}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-outline-variant pt-4">
              <p className="font-mono text-label-sm uppercase tracking-wide text-on-surface-variant">แนวโน้มคะแนน</p>
              <div
                aria-label="แนวโน้มคะแนนเฉลี่ย 7 วันล่าสุด"
                className="mt-3 flex h-24 items-end gap-1.5"
                role="img"
              >
                {dashboard.apiResponse.score_trend.map((point) => (
                  <div className="flex min-w-0 flex-1 flex-col items-center gap-1.5" key={point.id}>
                    <div
                      aria-hidden="true"
                      className="w-full rounded-sm bg-primary/80"
                      style={{ height: formatScore(point.average_score) }}
                    />
                    <span className="font-mono text-label-sm text-on-surface-variant">{point.date}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </section>
    </div>
  );
};
