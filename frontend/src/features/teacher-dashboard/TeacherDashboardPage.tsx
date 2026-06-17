import {
  ArrowRight,
  BarChart3,
  ClipboardCheck,
  FileText,
  GraduationCap,
  MessageSquareText,
  PenLine,
  ShieldCheck,
  Sparkles,
  Users
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";

import { teacherDashboardMock } from "./teacherDashboardData";
import {
  formatCompletionRate,
  getActivityLabel,
  getCompletionPercentValue,
  getQuizStatusLabel,
  getTeacherGreeting,
  getTopActivity,
  sortTeacherClasses
} from "./teacherDashboardHelpers";
import type {
  TeacherActivityType,
  TeacherDashboardDataSource,
  TeacherDashboardStatus,
  TeacherDashboardViewModel,
  TeacherMetric
} from "./types";

type TeacherDashboardPageProps = {
  dataSource?: TeacherDashboardDataSource;
  dashboard?: TeacherDashboardViewModel;
  errorMessage?: string;
  status?: TeacherDashboardStatus;
};

type TeacherAction = {
  id: string;
  href: string;
  label: string;
  helper: string;
  icon: LucideIcon;
};

const metricIconMap: Record<TeacherMetric["tone"], LucideIcon> = {
  blue: Users,
  gold: ClipboardCheck,
  green: FileText,
  rose: BarChart3
};

const metricToneClassName: Record<TeacherMetric["tone"], string> = {
  blue: "bg-[#f6f7f9] text-[#1e3a8a]",
  gold: "bg-[#f6f7f9] text-[#5c636e]",
  green: "bg-[#e5f6ef] text-[#0a5c42]",
  rose: "bg-[#f6f7f9] text-[#5c636e]"
};

const activityIconMap: Record<TeacherActivityType, LucideIcon> = {
  document: FileText,
  quiz: ClipboardCheck,
  student: GraduationCap
};

const actions: TeacherAction[] = [
  {
    id: "create-quiz",
    href: "/quiz",
    label: "สร้างควิซใหม่",
    helper: "ต่อยอดจากบทเรียนหรือเอกสาร",
    icon: PenLine
  },
  {
    id: "document-summary",
    href: "/documents",
    label: "ดูสรุปเอกสาร",
    helper: "ตรวจสรุปก่อนส่งให้นักเรียน",
    icon: FileText
  },
  {
    id: "open-analytics",
    href: "/analytics",
    label: "เปิดสถิติการเรียน",
    helper: "ดูจุดแข็งและจุดที่ต้องช่วยเพิ่ม",
    icon: BarChart3
  }
];

export const TeacherDashboardPage = ({
  dataSource = "api-ready-mock",
  dashboard = teacherDashboardMock,
  errorMessage = "ไม่สามารถโหลดแดชบอร์ดครูได้",
  status = "ready"
}: TeacherDashboardPageProps) => {
  if (status === "loading") {
    return (
      <section
        aria-live="polite"
        className="rounded border border-outline-variant/40 bg-surface-container-lowest p-6 shadow-ambient"
        role="status"
      >
        กำลังโหลดแดชบอร์ดครู
      </section>
    );
  }

  if (status === "error") {
    return (
      <section className="rounded border border-error/30 bg-error-container p-6 text-on-error-container" role="alert">
        {errorMessage}
      </section>
    );
  }

  if (status === "empty") {
    return (
      <div data-source={dataSource} data-testid="teacher-dashboard" className="space-y-6">
        <section className="rounded border border-outline-variant/40 bg-surface-container-lowest p-6 shadow-ambient">
          <div role="status">
            <p className="text-label-sm font-semibold text-on-surface-variant">แดชบอร์ดครู</p>
            <h2 className="mt-2 text-headline-lg-mobile font-bold text-on-surface md:text-headline-lg">
              ยังไม่มีข้อมูลผู้เรียน
            </h2>
            <p className="mt-3 max-w-2xl text-body-md text-on-surface-variant">
              {dashboard.teacherName} ยังไม่มีข้อมูลผู้เรียน ควิซ หรือเอกสารพร้อมสรุปในระบบ
              เริ่มจากเพิ่มคอร์สหรือสร้างควิซแรกเพื่อให้ AI Tutor สร้างสถิติสำหรับครู
            </p>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <Link
              className="inline-flex min-h-12 items-center justify-between gap-2 rounded bg-[#5a4fe0] px-4 py-2 text-label-md font-bold text-[#15181d] transition-colors hover:bg-[#c7c3f5] focus:outline-none focus:ring-2 focus:ring-[#c7c3f5] focus:ring-offset-2"
              href="/courses"
            >
              เปิดคอร์สเรียน
              <ArrowRight aria-hidden="true" className="h-5 w-5" />
            </Link>
            <Link
              className="inline-flex min-h-12 items-center justify-between gap-2 rounded border border-outline-variant/50 bg-white px-4 py-2 text-label-md font-bold text-primary transition-colors hover:bg-surface-container-low focus:outline-none focus:ring-2 focus:ring-primary-fixed-dim focus:ring-offset-2"
              href="/quiz"
            >
              สร้างควิซแรก
              <PenLine aria-hidden="true" className="h-5 w-5" />
            </Link>
            <Link
              className="inline-flex min-h-12 items-center justify-between gap-2 rounded border border-outline-variant/50 bg-white px-4 py-2 text-label-md font-bold text-primary transition-colors hover:bg-surface-container-low focus:outline-none focus:ring-2 focus:ring-primary-fixed-dim focus:ring-offset-2"
              href="/documents"
            >
              เตรียมเอกสารสอน
              <FileText aria-hidden="true" className="h-5 w-5" />
            </Link>
            <Link
              className="inline-flex min-h-12 items-center justify-between gap-2 rounded border border-outline-variant/50 bg-white px-4 py-2 text-label-md font-bold text-primary transition-colors hover:bg-surface-container-low focus:outline-none focus:ring-2 focus:ring-primary-fixed-dim focus:ring-offset-2 sm:col-span-3"
              href="/analytics"
            >
              ดูสถิติหลังมีผู้เรียน
              <BarChart3 aria-hidden="true" className="h-5 w-5" />
            </Link>
          </div>
        </section>
      </div>
    );
  }

  const metrics: TeacherMetric[] = [
    {
      id: "students",
      label: "นักเรียนทั้งหมด",
      value: String(dashboard.apiResponse.total_students),
      helper: "จากห้องเรียนที่ดูแล",
      tone: "blue"
    },
    {
      id: "quizzes",
      label: "ควิซที่สร้างแล้ว",
      value: String(dashboard.apiResponse.generated_quizzes),
      helper: "พร้อมใช้และแบบร่าง",
      tone: "gold"
    },
    {
      id: "documents",
      label: "เอกสารที่ตรวจแล้ว",
      value: String(dashboard.apiResponse.reviewed_documents),
      helper: "สรุปที่พร้อมใช้สอน",
      tone: "green"
    },
    {
      id: "completion",
      label: "อัตราทำสำเร็จ",
      value: formatCompletionRate(dashboard.apiResponse.completion_rate),
      helper: "เฉลี่ยทุกห้องเรียน",
      tone: "rose"
    }
  ];

  const sortedClasses = sortTeacherClasses(dashboard.apiResponse.classes);
  const topActivity = getTopActivity(dashboard.apiResponse.activities);

  return (
    <div data-source={dataSource} data-testid="teacher-dashboard" className="space-y-6">
      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
        <div
          className="overflow-hidden rounded border border-[#15181d]/10 bg-[#15181d] text-white shadow-ambient"
          data-dashboard-surface="teacher"
          data-testid="dashboard-hero"
        >
          <div className="p-5 md:p-7">
            <div className="inline-flex items-center gap-2 rounded bg-white/10 px-3 py-1.5 text-label-sm font-semibold text-[#c7c3f5]">
              <ShieldCheck aria-hidden="true" className="h-4 w-4" />
              พื้นที่จัดการชั้นเรียน
            </div>
            <h2 className="mt-5 text-headline-lg-mobile font-bold md:text-headline-lg">แดชบอร์ดครู</h2>
            <p className="mt-3 max-w-3xl text-body-md text-white/80 md:text-body-lg">
              <span className="block font-semibold text-white">{getTeacherGreeting(dashboard.teacherName)}</span>
              <span className="mt-1 block">ติดตามภาพรวมห้องเรียน ควิซ เอกสาร และกิจกรรมล่าสุดได้ในหน้าเดียว</span>
            </p>

            <nav aria-label="คำสั่งหลักของครู" className="mt-6 grid gap-3 md:grid-cols-3">
              {actions.map((action) => {
                const Icon = action.icon;

                return (
                  <Link
                    className="group rounded border border-white/15 bg-white/10 p-4 transition-colors hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-[#c7c3f5] focus:ring-offset-2 focus:ring-offset-[#15181d]"
                    href={action.href}
                    key={action.id}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <Icon aria-hidden="true" className="h-5 w-5 text-[#c7c3f5]" />
                      <ArrowRight
                        aria-hidden="true"
                        className="h-4 w-4 text-white/70 transition-transform group-hover:translate-x-1"
                      />
                    </div>
                    <p className="mt-3 text-body-md font-bold text-white">{action.label}</p>
                    <p className="mt-1 text-label-sm text-white/70">{action.helper}</p>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        <div className="rounded border border-outline-variant/40 bg-surface-container-lowest p-5 shadow-ambient md:p-6">
          <div className="flex items-center gap-2 text-label-sm font-semibold text-[#0a5c42]">
            <Sparkles aria-hidden="true" className="h-4 w-4" />
            ภาพรวมล่าสุด
          </div>
          <p className="mt-3 text-body-md text-on-surface-variant">{dashboard.generatedAtLabel}</p>
          <p className="mt-4 text-headline-md text-on-surface">
            มี {topActivity?.count ?? 0} กิจกรรมสำคัญที่ควรติดตามต่อวันนี้
          </p>
        </div>
      </section>

      <section aria-label="สรุปตัวเลขของครู" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metricIconMap[metric.tone];

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
                <div className={`flex h-11 w-11 items-center justify-center rounded ${metricToneClassName[metric.tone]}`}>
                  <Icon aria-hidden="true" className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-3 text-body-md text-on-surface-variant">{metric.helper}</p>
            </div>
          );
        })}
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
        <section
          aria-label="ภาพรวมห้องเรียน"
          className="rounded border border-outline-variant/40 bg-surface-container-lowest p-5 shadow-ambient md:p-6"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-headline-md text-on-surface">ภาพรวมห้องเรียน</h3>
              <p className="mt-1 text-body-md text-on-surface-variant">เรียงตามห้องที่กำลังใช้งานก่อน</p>
            </div>
            <Link className="text-label-md font-bold text-primary hover:text-on-primary-fixed-variant" href="/courses">
              ดูคอร์สทั้งหมด
            </Link>
          </div>

          <div className="mt-5 grid gap-3">
            {sortedClasses.map((classroom) => {
              const completionLabel = formatCompletionRate(classroom.completionRate);
              const completionPercent = getCompletionPercentValue(classroom.completionRate);

              return (
                <article className="rounded border border-outline-variant/40 bg-[#ffffff] p-4" key={classroom.id}>
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="min-w-0">
                      <h4 className="truncate text-body-lg font-bold text-on-surface">{classroom.title}</h4>
                      <p className="mt-1 text-body-md text-on-surface-variant">
                        {classroom.subject} - {classroom.studentCount} คน - เฉลี่ย {classroom.averageScore}%
                      </p>
                    </div>
                    <div className="min-w-44">
                      <div className="flex items-center justify-between text-label-sm text-on-surface-variant">
                        <span>ทำสำเร็จ</span>
                        <span>{completionLabel}</span>
                      </div>
                      <div
                        aria-label={`${classroom.title} ทำสำเร็จ ${completionLabel}`}
                        aria-valuemax={100}
                        aria-valuemin={0}
                        aria-valuenow={completionPercent}
                        className="mt-2 h-2 overflow-hidden rounded-full bg-surface-container"
                        role="progressbar"
                      >
                        <div className="h-full rounded-full bg-[#0a5c42]" style={{ width: `${completionPercent}%` }} />
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section
          aria-label="ควิซล่าสุด"
          className="rounded border border-outline-variant/40 bg-surface-container-lowest p-5 shadow-ambient md:p-6"
        >
          <div>
            <h3 className="text-headline-md text-on-surface">ควิซล่าสุด</h3>
            <p className="mt-1 text-body-md text-on-surface-variant">ติดตามสถานะและคะแนนเฉลี่ยของควิซ</p>
          </div>

          <div className="mt-5 grid gap-3">
            {dashboard.apiResponse.quizzes.map((quiz) => (
              <article className="rounded border border-outline-variant/40 bg-[#ffffff] p-4" key={quiz.id}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h4 className="truncate text-body-md font-bold text-on-surface">{quiz.title}</h4>
                    <p className="mt-1 truncate text-label-sm text-on-surface-variant">{quiz.source}</p>
                  </div>
                  <span className="rounded bg-[#f6f7f9] px-3 py-1 text-label-sm font-bold text-[#5c636e]">
                    {getQuizStatusLabel(quiz.status)}
                  </span>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 text-label-sm">
                  <div className="rounded bg-surface-container-low p-3">
                    <p className="text-on-surface-variant">ส่งแล้ว</p>
                    <p className="mt-1 text-body-md font-bold text-on-surface">{quiz.submissionCount} คน</p>
                  </div>
                  <div className="rounded bg-surface-container-low p-3">
                    <p className="text-on-surface-variant">คะแนนเฉลี่ย</p>
                    <p className="mt-1 text-body-md font-bold text-on-surface">{quiz.averageScore}%</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </section>

      <section
        aria-label="กิจกรรมล่าสุด"
        className="rounded border border-outline-variant/40 bg-surface-container-lowest p-5 shadow-ambient md:p-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-headline-md text-on-surface">กิจกรรมล่าสุด</h3>
            <p className="mt-1 text-body-md text-on-surface-variant">รายการที่ช่วยให้ครูรู้ว่าควรจัดการอะไรก่อน</p>
          </div>
          <MessageSquareText aria-hidden="true" className="h-6 w-6 text-[#0a5c42]" />
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {dashboard.apiResponse.activities.map((activity) => {
            const Icon = activityIconMap[activity.type];

            return (
              <article className="rounded border border-outline-variant/40 bg-[#ffffff] p-4" key={activity.id}>
                <div className="flex items-center gap-2 text-label-sm font-semibold text-[#0a5c42]">
                  <Icon aria-hidden="true" className="h-4 w-4" />
                  {getActivityLabel(activity.type)}
                </div>
                <h4 className="mt-3 text-body-lg font-bold text-on-surface">{activity.title}</h4>
                <p className="mt-1 text-body-md text-on-surface-variant">{activity.description}</p>
                <p className="mt-4 text-label-sm text-on-surface-variant">{activity.occurredAt}</p>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
};
