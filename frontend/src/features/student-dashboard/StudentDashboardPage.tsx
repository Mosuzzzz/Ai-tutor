import {
  ArrowRight,
  BookOpenCheck,
  Bot,
  CalendarDays,
  FileText,
  Flame,
  LineChart,
  MessageSquareText,
  ShieldCheck,
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
  tone: string;
};

type EmptyMetricCard = MetricCard;

type EmptyOnboardingStep = {
  description: string;
  step: string;
  title: string;
};

type EmptyPreviewPanel = {
  description: string;
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

const emptyMetricCards: EmptyMetricCard[] = [
  {
    helper: "จะเริ่มนับหลังอัปโหลดและประมวลผลเสร็จ",
    icon: FileText,
    id: "ready-documents",
    label: "เอกสารพร้อมอ่าน",
    tone: "bg-[#eaf3ff] text-[#24527a]",
    value: "0"
  },
  {
    helper: "คะแนนแรกจะปรากฏหลังส่งคำตอบ",
    icon: BookOpenCheck,
    id: "completed-quizzes",
    label: "ควิซที่ทำแล้ว",
    tone: "bg-[#fff3d8] text-[#8a5a00]",
    value: "0"
  },
  {
    helper: "เริ่มต่อเนื่องเมื่อกลับมาทบทวนทุกวัน",
    icon: Flame,
    id: "learning-streak",
    label: "สตรีกการเรียน",
    tone: "bg-[#ffe9df] text-[#9a3b18]",
    value: "0 วัน"
  },
  {
    helper: "ระบบจะสรุปจากผลควิซและกิจกรรมจริง",
    icon: Target,
    id: "review-topics",
    label: "หัวข้อที่ควรทบทวน",
    tone: "bg-[#e6f6ee] text-[#216148]",
    value: "0"
  }
];

const emptyPreviewPanels: EmptyPreviewPanel[] = [
  {
    description: "รายการเอกสารและบทเรียนล่าสุด",
    title: "เรียนต่อจากเดิม"
  },
  {
    description: "ผลควิซและแนวโน้มคะแนนส่วนตัว",
    title: "คะแนนล่าสุด"
  },
  {
    description: "หัวข้อที่ควรทบทวนจากกิจกรรมจริง",
    title: "คำแนะนำจาก AI"
  }
];

export const StudentDashboardPage = ({
  dataSource = "api-ready-mock",
  dashboard = studentDashboardMock,
  errorMessage = "ไม่สามารถโหลดข้อมูลผู้เรียนได้",
  status = "ready"
}: StudentDashboardPageProps) => {
  if (status === "loading") {
    return (
      <div
        className="rounded border border-outline-variant/40 bg-surface-container-lowest p-6 text-body-md text-on-surface-variant shadow-ambient"
        role="status"
      >
        กำลังโหลดแดชบอร์ดผู้เรียน
      </div>
    );
  }

  if (status === "error") {
    return (
      <div
        className="rounded border border-[#f2b8b5] bg-[#fff8f7] p-6 text-body-md font-semibold text-[#8c1d18] shadow-ambient"
        role="alert"
      >
        {errorMessage}
      </div>
    );
  }

  if (status === "empty") {
    return (
      <div data-source={dataSource} data-testid="student-dashboard" className="space-y-6">
        <section className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
          <div
            className="overflow-hidden rounded border border-[#0e2d4f]/10 bg-[#10233f] text-white shadow-ambient"
            data-dashboard-surface="student"
            data-testid="dashboard-hero"
          >
            <div className="p-5 md:p-7">
              <div className="inline-flex items-center gap-2 rounded bg-white/10 px-3 py-1.5 text-label-sm font-semibold text-[#ffd37a]">
                <ShieldCheck aria-hidden="true" className="h-4 w-4" />
                พื้นที่เรียนรู้ส่วนตัว
              </div>
              <div className="mt-5" role="status">
                <p className="text-label-sm font-semibold text-white/70">แดชบอร์ดผู้เรียน</p>
                <h2 className="mt-2 text-headline-lg-mobile font-bold md:text-headline-lg">
                  ยังไม่มีข้อมูลการเรียน
                </h2>
                <p className="mt-3 max-w-3xl text-body-md text-white/80 md:text-body-lg">
                  {dashboard.learnerName} ยังไม่มีผลควิซหรือเอกสารพร้อมอ่านในระบบ เริ่มจากอัปโหลดเอกสารหรือสร้างควิซฝึกซ้อม เพื่อให้ AI Tutor สร้างเส้นทางทบทวนของคุณ
                </p>
              </div>

              <nav aria-label="เริ่มต้นแดชบอร์ดผู้เรียน" className="mt-6 grid gap-3 md:grid-cols-3">
                <Link
                  className="group rounded border border-[#f5b94f]/40 bg-[#f5b94f] p-4 text-[#16233a] transition-colors hover:bg-[#ffd37a] focus:outline-none focus:ring-2 focus:ring-[#ffd37a] focus:ring-offset-2 focus:ring-offset-[#10233f]"
                  href="/documents"
                >
                  <div className="flex items-center justify-between gap-3">
                    <FileText aria-hidden="true" className="h-5 w-5" />
                    <ArrowRight
                      aria-hidden="true"
                      className="h-4 w-4 transition-transform group-hover:translate-x-1"
                    />
                  </div>
                  <p className="mt-3 text-body-md font-bold">อัปโหลดเอกสารแรก</p>
                  <p className="mt-1 text-label-sm font-semibold text-[#3d2d10]">ให้ระบบสรุปและเตรียมเนื้อหา</p>
                </Link>
                <Link
                  className="group rounded border border-white/15 bg-white/10 p-4 transition-colors hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/60 focus:ring-offset-2 focus:ring-offset-[#10233f]"
                  href="/quiz"
                >
                  <div className="flex items-center justify-between gap-3">
                    <Bot aria-hidden="true" className="h-5 w-5 text-[#ffd37a]" />
                    <ArrowRight
                      aria-hidden="true"
                      className="h-4 w-4 text-white/70 transition-transform group-hover:translate-x-1"
                    />
                  </div>
                  <p className="mt-3 text-body-md font-bold text-white">สร้างควิซฝึกซ้อม</p>
                  <p className="mt-1 text-label-sm text-white/70">ฝึกจากเอกสารที่พร้อมใช้งาน</p>
                </Link>
                <Link
                  className="group rounded border border-white/15 bg-white/10 p-4 transition-colors hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/60 focus:ring-offset-2 focus:ring-offset-[#10233f]"
                  href="/analytics"
                >
                  <div className="flex items-center justify-between gap-3">
                    <LineChart aria-hidden="true" className="h-5 w-5 text-[#ffd37a]" />
                    <ArrowRight
                      aria-hidden="true"
                      className="h-4 w-4 text-white/70 transition-transform group-hover:translate-x-1"
                    />
                  </div>
                  <p className="mt-3 text-body-md font-bold text-white">ดูสถิติหลังทำควิซ</p>
                  <p className="mt-1 text-label-sm text-white/70">คะแนนและจุดที่ควรทบทวนจะอยู่ที่นี่</p>
                </Link>
              </nav>
            </div>
          </div>

          <section className="rounded border border-outline-variant/40 bg-surface-container-lowest p-5 shadow-ambient md:p-6">
            <div className="flex items-center gap-2 text-label-sm font-semibold text-[#24527a]">
              <CalendarDays aria-hidden="true" className="h-4 w-4" />
              แผนเริ่มต้นวันนี้
            </div>
            <h3 className="mt-4 text-headline-md text-on-surface">เริ่มจาก 3 ขั้นตอนสั้น ๆ</h3>
            <div className="mt-5 space-y-4">
              {emptyOnboardingSteps.map(({ description, step, title }) => (
                <div className="flex gap-3" key={step}>
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded bg-surface-container text-label-sm font-bold text-primary">
                    {step}
                  </span>
                  <div>
                    <p className="text-body-md font-bold text-on-surface">{title}</p>
                    <p className="mt-1 text-label-sm text-on-surface-variant">{description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </section>

        <section aria-label="สรุปสถานะเริ่มต้น" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {emptyMetricCards.map((metric) => {
            const MetricIcon = metric.icon;
            return (
              <div
                className="rounded border border-outline-variant/40 bg-surface-container-lowest p-5 shadow-ambient"
                data-testid="dashboard-metric-card"
                key={metric.id}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-label-sm font-semibold text-on-surface-variant">{metric.label}</p>
                    <p className="mt-2 text-display-lg font-bold text-on-surface">{metric.value}</p>
                  </div>
                  <div className={`flex h-11 w-11 items-center justify-center rounded ${metric.tone}`}>
                    <MetricIcon aria-hidden="true" className="h-5 w-5" />
                  </div>
                </div>
                <p className="mt-3 text-body-md text-on-surface-variant">{metric.helper}</p>
              </div>
            );
          })}
        </section>

        <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
          <section className="rounded border border-outline-variant/40 bg-surface-container-lowest p-5 shadow-ambient md:p-6">
            <h3 className="text-headline-md text-on-surface">พื้นที่เรียนรู้จะเติมข้อมูลเองหลังเริ่มใช้งาน</h3>
            <p className="mt-2 max-w-3xl text-body-md text-on-surface-variant">
              แดชบอร์ดนี้จะไม่แสดงข้อมูลจำลอง เมื่อมีเอกสาร ควิซ หรือผลคะแนนจาก backend จริง ระบบจะเติมเนื้อหาต่อไปนี้ให้อัตโนมัติ
            </p>
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              {emptyPreviewPanels.map(({ description, title }) => (
                <div className="rounded border border-outline-variant/40 bg-[#fbfcff] p-4" key={title}>
                  <p className="text-body-md font-bold text-on-surface">{title}</p>
                  <p className="mt-2 text-label-sm text-on-surface-variant">{description}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded border border-outline-variant/40 bg-surface-container-lowest p-5 shadow-ambient md:p-6">
            <div className="flex items-center gap-2 text-label-sm font-semibold text-[#216148]">
              <MessageSquareText aria-hidden="true" className="h-4 w-4" />
              พร้อมช่วยทบทวน
            </div>
            <h3 className="mt-4 text-headline-md text-on-surface">ถาม AI ได้หลังมีเอกสาร</h3>
            <p className="mt-2 text-body-md text-on-surface-variant">
              เมื่อมีเอกสารที่สรุปเสร็จแล้ว AI Tutor จะตอบพร้อม citation และช่วยต่อยอดเป็นควิซได้
            </p>
            <Link
              className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded border border-outline-variant/50 bg-white px-4 py-2 text-label-md font-bold text-primary transition-colors hover:bg-surface-container-low focus:outline-none focus:ring-2 focus:ring-primary-fixed-dim focus:ring-offset-2"
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
      icon: BookOpenCheck,
      tone: "bg-[#eaf3ff] text-[#24527a]"
    },
    {
      id: "average-score",
      label: "คะแนนเฉลี่ย",
      value: formatScore(dashboard.apiResponse.average_score),
      helper: "จากการทำแบบทดสอบล่าสุด",
      icon: Target,
      tone: "bg-[#fff3d8] text-[#8a5a00]"
    },
    {
      id: "streak-days",
      label: "สตรีกการเรียน",
      value: `${dashboard.apiResponse.streak_days} วัน`,
      helper: "รักษาจังหวะการเรียนต่อเนื่อง",
      icon: Flame,
      tone: "bg-[#ffe9df] text-[#9a3b18]"
    },
    {
      id: "documents-read",
      label: "เอกสารที่อ่านแล้ว",
      value: String(dashboard.apiResponse.read_documents_count),
      helper: "สรุปที่ทบทวนแล้ว",
      icon: FileText,
      tone: "bg-[#e6f6ee] text-[#216148]"
    }
  ];
  const topScores = getTopScores(dashboard.apiResponse.recent_scores);

  return (
    <div data-source={dataSource} data-testid="student-dashboard" className="space-y-6">
      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.55fr)]">
        <div
          className="overflow-hidden rounded border border-[#0e2d4f]/10 bg-[#10233f] text-white shadow-ambient"
          data-dashboard-surface="student"
          data-testid="dashboard-hero"
        >
          <div className="grid gap-6 p-5 md:p-7 lg:grid-cols-[minmax(0,1fr)_260px]">
            <div>
              <div className="inline-flex items-center gap-2 rounded bg-white/10 px-3 py-1.5 text-label-sm font-semibold text-[#ffd37a]">
                <ShieldCheck aria-hidden="true" className="h-4 w-4" />
                พื้นที่เรียนรู้ส่วนตัว
              </div>
              <h2 className="mt-5 text-headline-lg-mobile font-bold md:text-headline-lg">
                แดชบอร์ดผู้เรียน
              </h2>
              <p className="mt-3 max-w-2xl text-body-md text-white/80 md:text-body-lg">
                <span className="block font-semibold text-white">{getStudentGreeting(dashboard.learnerName)}</span>
                <span className="mt-1 block">{getHeroSummary(dashboard.learnerName).replace(`${getStudentGreeting(dashboard.learnerName)} `, "")}</span>
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded bg-[#f5b94f] px-4 py-2 text-label-md font-bold text-[#16233a] transition-colors hover:bg-[#ffd37a] focus:outline-none focus:ring-2 focus:ring-[#ffd37a] focus:ring-offset-2 focus:ring-offset-[#10233f]"
                  href="/courses"
                >
                  เรียนต่อ
                  <ArrowRight aria-hidden="true" className="h-5 w-5" />
                </Link>
                <Link
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded border border-white/25 bg-white/10 px-4 py-2 text-label-md font-bold text-white transition-colors hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/60 focus:ring-offset-2 focus:ring-offset-[#10233f]"
                  href="/chat"
                >
                  ถาม AI Tutor
                  <MessageSquareText aria-hidden="true" className="h-5 w-5" />
                </Link>
              </div>
            </div>

            <div className="rounded border border-white/10 bg-white/10 p-4">
              <div className="flex items-center gap-2 text-label-sm font-semibold text-[#ffd37a]">
                <CalendarDays aria-hidden="true" className="h-4 w-4" />
                ภาพรวมวันนี้
              </div>
              <p className="mt-3 text-body-md text-white/80">{dashboard.generatedAtLabel}</p>
              <p className="mt-4 text-headline-md text-white">{dashboard.nextMilestone}</p>
              <p className="mt-5 rounded bg-black/20 p-3 text-label-sm text-white/70">
                บทเรียนถัดไปพร้อมให้เริ่มแล้ว
              </p>
            </div>
          </div>
        </div>

        <section aria-label="AI learning prompts" className="grid gap-3">
          {dashboard.assistantPrompts.map((prompt) => (
            <Link
              className="group rounded border border-outline-variant/40 bg-surface-container-lowest p-5 shadow-ambient transition-colors hover:border-[#d39b31] hover:bg-[#fffaf0]"
              href={prompt.href}
              key={prompt.id}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-body-lg font-bold text-on-surface">{prompt.title}</h3>
                  <p className="mt-2 text-body-md text-on-surface-variant">{prompt.description}</p>
                </div>
                <ArrowRight
                  aria-hidden="true"
                  className="mt-1 h-5 w-5 shrink-0 text-[#a66e00] transition-transform group-hover:translate-x-1"
                />
              </div>
            </Link>
          ))}
        </section>
      </section>

      <section aria-label="สรุปตัวเลขผู้เรียน" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;

          return (
            <div
              className="rounded border border-outline-variant/40 bg-surface-container-lowest p-5 shadow-ambient"
              data-testid="dashboard-metric-card"
              key={metric.id}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-label-sm font-semibold uppercase text-on-surface-variant">{metric.label}</p>
                  <p className="mt-2 text-display-lg font-bold text-on-surface">{metric.value}</p>
                </div>
                <div className={`flex h-11 w-11 items-center justify-center rounded ${metric.tone}`}>
                  <Icon aria-hidden="true" className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-3 text-body-md text-on-surface-variant">{metric.helper}</p>
            </div>
          );
        })}
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
        <section
          aria-label="เรียนต่อจากเดิม"
          className="rounded border border-outline-variant/40 bg-surface-container-lowest p-5 shadow-ambient md:p-6"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-headline-md text-on-surface">เรียนต่อจากเดิม</h3>
              <p className="mt-1 text-body-md text-on-surface-variant">กลับไปยังบทเรียนและเอกสารล่าสุดของคุณ</p>
            </div>
            <Link className="text-label-md font-bold text-primary hover:text-on-primary-fixed-variant" href="/courses">
              ดูคอร์สทั้งหมด
            </Link>
          </div>

          <div className="mt-5 grid gap-3">
            {dashboard.continueLearning.map((item) => {
              const Icon = progressTypeIcon[item.type];
              const progressPercent = getProgressPercentValue(item.progressPercent);

              return (
                <Link
                  className="rounded border border-outline-variant/40 bg-[#fbfcff] p-4 transition-colors hover:border-primary-fixed-dim hover:bg-surface-container-lowest"
                  href={item.href}
                  key={item.id}
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex min-w-0 gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded bg-surface-container text-primary">
                        <Icon aria-hidden="true" className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="truncate text-body-lg font-bold text-on-surface">{item.title}</h4>
                        <p className="mt-1 text-body-md text-on-surface-variant">
                          {item.source} - เหลือ {item.minutesRemaining} นาที
                        </p>
                      </div>
                    </div>
                    <div className="min-w-36">
                      <div className="flex items-center justify-between text-label-sm text-on-surface-variant">
                        <span>ความคืบหน้า</span>
                        <span>{progressPercent}%</span>
                      </div>
                      <div
                        aria-label={`${item.title} ความคืบหน้า ${progressPercent}%`}
                        aria-valuemax={100}
                        aria-valuemin={0}
                        aria-valuenow={progressPercent}
                        className="mt-2 h-2 overflow-hidden rounded-full bg-surface-container"
                        role="progressbar"
                      >
                        <div className="h-full rounded-full bg-[#2f7c57]" style={{ width: `${progressPercent}%` }} />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        <section
          aria-label="คะแนนล่าสุด"
          className="rounded border border-outline-variant/40 bg-surface-container-lowest p-5 shadow-ambient md:p-6"
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-headline-md text-on-surface">คะแนนล่าสุด</h3>
              <p className="mt-1 text-body-md text-on-surface-variant">ผลควิซล่าสุดจากภาพรวมการเรียน</p>
            </div>
            <LineChart aria-hidden="true" className="h-6 w-6 text-[#2f7c57]" />
          </div>

          <div className="mt-5 space-y-4">
            {topScores.map((score) => (
              <div className="flex items-center justify-between gap-4" key={score.id}>
                <div className="min-w-0">
                  <p className="truncate text-body-md font-bold text-on-surface">{score.filename}</p>
                  <p className="mt-1 text-label-sm text-on-surface-variant">{getRelativeTimeLabel(score.submitted_at)}</p>
                </div>
                <div className="text-right">
                  <div className="rounded bg-[#e6f6ee] px-3 py-1.5 text-label-md font-bold text-[#216148]">
                    {formatScore(score.score)}
                  </div>
                  <p className="mt-1 text-label-sm text-on-surface-variant">{scoreToGrade(score.score)}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <p className="text-label-sm font-semibold uppercase text-on-surface-variant">แนวโน้มคะแนน</p>
            <div
              aria-label="แนวโน้มคะแนนเฉลี่ย 7 วันล่าสุด"
              className="mt-3 flex h-28 items-end gap-2 rounded bg-surface-container-low p-3"
              role="img"
            >
              {dashboard.apiResponse.score_trend.map((point) => (
                <div className="flex min-w-0 flex-1 flex-col items-center gap-2" key={point.id}>
                  <div
                    aria-hidden="true"
                    className="w-full rounded-t bg-[#2f7c57]"
                    style={{ height: formatScore(point.average_score) }}
                  />
                  <span className="text-label-sm text-on-surface-variant">{point.date}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </section>
    </div>
  );
};
