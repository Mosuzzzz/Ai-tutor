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

import { studentDashboardMock } from "./studentDashboardData";
import type { ContinueLearningItem, StudentDashboardViewModel } from "./studentDashboardData";

type StudentDashboardPageProps = {
  dashboard?: StudentDashboardViewModel;
};

type MetricCard = {
  id: string;
  label: string;
  value: string;
  helper: string;
  icon: LucideIcon;
  tone: string;
};

const progressTypeIcon: Record<ContinueLearningItem["type"], LucideIcon> = {
  document: FileText,
  lesson: BookOpenCheck,
  quiz: Bot
};

export const StudentDashboardPage = ({ dashboard = studentDashboardMock }: StudentDashboardPageProps) => {
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
      value: `${dashboard.apiResponse.average_score}%`,
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

  return (
    <div
      data-api-endpoint={dashboard.apiEndpoint}
      data-source="api-ready-mock"
      data-testid="student-dashboard"
      className="space-y-6"
    >
      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.55fr)]">
        <div className="overflow-hidden rounded border border-[#0e2d4f]/10 bg-[#10233f] text-white shadow-ambient">
          <div className="grid gap-6 p-5 md:p-7 lg:grid-cols-[minmax(0,1fr)_260px]">
            <div>
              <div className="inline-flex items-center gap-2 rounded bg-white/10 px-3 py-1.5 text-label-sm font-semibold text-[#ffd37a]">
                <ShieldCheck aria-hidden="true" className="h-4 w-4" />
                พื้นที่เรียนของ{dashboard.roleLabel}
              </div>
              <h2 className="mt-5 text-headline-lg-mobile font-bold md:text-headline-lg">
                แดชบอร์ดผู้เรียน
              </h2>
              <p className="mt-3 max-w-2xl text-body-md text-white/80 md:text-body-lg">
                ยินดีต้อนรับกลับมา {dashboard.learnerName} พื้นที่นี้รวมบทเรียน เอกสาร และความคืบหน้าควิซ
                ไว้ให้ติดตามได้ในหน้าเดียว
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

      <section aria-label="Learning metrics" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;

          return (
            <div
              className="rounded border border-outline-variant/40 bg-surface-container-lowest p-5 shadow-ambient"
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
        <div className="rounded border border-outline-variant/40 bg-surface-container-lowest p-5 shadow-ambient md:p-6">
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
                        <span>{item.progressPercent}%</span>
                      </div>
                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-container">
                        <div className="h-full rounded-full bg-[#2f7c57]" style={{ width: `${item.progressPercent}%` }} />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="rounded border border-outline-variant/40 bg-surface-container-lowest p-5 shadow-ambient md:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-headline-md text-on-surface">คะแนนล่าสุด</h3>
              <p className="mt-1 text-body-md text-on-surface-variant">ผลควิซล่าสุดจากภาพรวมการเรียน</p>
            </div>
            <LineChart aria-hidden="true" className="h-6 w-6 text-[#2f7c57]" />
          </div>

          <div className="mt-5 space-y-4">
            {dashboard.apiResponse.recent_scores.map((score) => (
              <div className="flex items-center justify-between gap-4" key={score.id}>
                <div className="min-w-0">
                  <p className="truncate text-body-md font-bold text-on-surface">{score.filename}</p>
                  <p className="mt-1 text-label-sm text-on-surface-variant">{score.submitted_at}</p>
                </div>
                <div className="rounded bg-[#e6f6ee] px-3 py-1.5 text-label-md font-bold text-[#216148]">
                  {score.score}%
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <p className="text-label-sm font-semibold uppercase text-on-surface-variant">แนวโน้มคะแนน</p>
            <div className="mt-3 flex h-28 items-end gap-2 rounded bg-surface-container-low p-3">
              {dashboard.apiResponse.score_trend.map((point) => (
                <div className="flex min-w-0 flex-1 flex-col items-center gap-2" key={point.id}>
                  <div
                    aria-label={`${point.date} คะแนนเฉลี่ย ${point.average_score}%`}
                    className="w-full rounded-t bg-[#2f7c57]"
                    style={{ height: `${point.average_score}%` }}
                  />
                  <span className="text-label-sm text-on-surface-variant">{point.date}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
