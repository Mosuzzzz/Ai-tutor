import {
  ArrowRight,
  BarChart3,
  BookOpenCheck,
  FileText,
  Flame,
  LineChart,
  MessageSquareText,
  ShieldCheck,
  Target
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";

import { formatScore, getRelativeTimeLabel, getTopScores, scoreToGrade } from "./studyDashboardHelpers";
import { studyDashboardMock } from "./studyDashboardData";
import type { StudyDashboardDataSource, StudyDashboardStatus, StudyDashboardViewModel } from "./types";

type StudyDashboardPageProps = {
  dashboard?: StudyDashboardViewModel;
  dataSource?: StudyDashboardDataSource;
  errorMessage?: string;
  status?: StudyDashboardStatus;
};

const metricIcons: Record<string, LucideIcon> = {
  "completed-quizzes": BookOpenCheck,
  "learning-streak": Flame,
  "ready-documents": FileText,
  "review-topics": Target
};

const metricTones: Record<string, string> = {
  "completed-quizzes": "bg-[#fff3d8] text-[#8a5a00]",
  "learning-streak": "bg-[#ffe9df] text-[#9a3b18]",
  "ready-documents": "bg-[#eaf3ff] text-[#24527a]",
  "review-topics": "bg-[#e6f6ee] text-[#216148]"
};

export const StudyDashboardPage = ({
  dashboard = studyDashboardMock,
  dataSource = "api-ready-mock",
  errorMessage = "ไม่สามารถโหลดแดชบอร์ดได้",
  status = "ready"
}: StudyDashboardPageProps) => {
  if (status === "loading") {
    return (
      <div
        className="rounded border border-outline-variant/40 bg-surface-container-lowest p-6 text-body-md text-on-surface-variant shadow-ambient"
        role="status"
      >
        กำลังโหลดแดชบอร์ดของฉัน
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

  const isEmpty = status === "empty";
  const topScores = getTopScores(dashboard.apiResponse.recent_scores);

  return (
    <div data-source={dataSource} data-testid="study-dashboard" className="space-y-6">
      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
        <header className="overflow-hidden rounded border border-[#0e2d4f]/10 bg-[#10233f] text-white shadow-ambient">
          <div className="p-5 md:p-7">
            <div className="inline-flex items-center gap-2 rounded bg-white/10 px-3 py-1.5 text-label-sm font-semibold text-[#ffd37a]">
              <ShieldCheck aria-hidden="true" className="h-4 w-4" />
              พื้นที่เรียนรู้ส่วนตัว
            </div>
            <p className="mt-6 text-label-sm font-semibold text-white/70">แดชบอร์ดของฉัน</p>
            <h1 className="mt-2 text-headline-lg-mobile font-bold md:text-headline-lg">{dashboard.headline}</h1>
            <p className="mt-3 max-w-3xl text-body-md text-white/80 md:text-body-lg">{dashboard.summary}</p>

            <nav aria-label="คำสั่งเริ่มต้นของแดชบอร์ด" className="mt-6 grid gap-3 md:grid-cols-3">
              <DashboardActionLink
                description={dashboard.primaryAction.description}
                href={dashboard.primaryAction.href}
                icon={FileText}
                title={dashboard.primaryAction.title}
                tone={dashboard.primaryAction.tone}
              />
              {dashboard.secondaryActions.map((action) => (
                <DashboardActionLink
                  description={action.description}
                  href={action.href}
                  icon={action.id === "practice-quiz" ? BookOpenCheck : LineChart}
                  key={action.id}
                  title={action.title}
                  tone={action.tone}
                />
              ))}
            </nav>
          </div>
        </header>

        <section className="rounded border border-outline-variant/40 bg-surface-container-lowest p-5 shadow-ambient md:p-6">
          <div className="flex items-center gap-2 text-label-sm font-semibold text-[#24527a]">
            <BarChart3 aria-hidden="true" className="h-4 w-4" />
            เส้นทางทบทวนวันนี้
          </div>
          <h2 className="mt-4 text-headline-md text-on-surface">{dashboard.nextMilestone}</h2>
          <div className="mt-5 space-y-4">
            {dashboard.onboardingSteps.map((step, index) => (
              <div className="flex gap-3" key={step.id}>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded bg-surface-container text-label-sm font-bold text-primary">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <p className="text-body-md font-bold text-on-surface">{step.title}</p>
                  <p className="mt-1 text-label-sm text-on-surface-variant">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </section>

      <section aria-label="สรุปตัวเลขการเรียน" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {dashboard.metrics.map((metric) => {
          const Icon = metricIcons[metric.id] ?? Target;

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
                <div className={`flex h-11 w-11 items-center justify-center rounded ${metricTones[metric.id]}`}>
                  <Icon aria-hidden="true" className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-3 text-body-md text-on-surface-variant">{metric.helper}</p>
            </div>
          );
        })}
      </section>

      {isEmpty ? <EmptyStudyState /> : <ReadyStudyState dashboard={dashboard} topScores={topScores} />}
    </div>
  );
};

type DashboardActionLinkProps = {
  description: string;
  href: string;
  icon: LucideIcon;
  title: string;
  tone: "primary" | "secondary";
};

const DashboardActionLink = ({ description, href, icon: Icon, title, tone }: DashboardActionLinkProps) => {
  const className =
    tone === "primary"
      ? "group rounded border border-[#f5b94f]/40 bg-[#f5b94f] p-4 text-[#16233a] transition-colors hover:bg-[#ffd37a] focus:outline-none focus:ring-2 focus:ring-[#ffd37a] focus:ring-offset-2 focus:ring-offset-[#10233f]"
      : "group rounded border border-white/15 bg-white/10 p-4 text-white transition-colors hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/60 focus:ring-offset-2 focus:ring-offset-[#10233f]";

  return (
    <Link className={className} href={href}>
      <div className="flex items-center justify-between gap-3">
        <Icon aria-hidden="true" className="h-5 w-5" />
        <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </div>
      <p className="mt-3 text-body-md font-bold">{title}</p>
      <p className={tone === "primary" ? "mt-1 text-label-sm font-semibold text-[#3d2d10]" : "mt-1 text-label-sm text-white/70"}>
        {description}
      </p>
    </Link>
  );
};

const EmptyStudyState = () => (
  <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
    <section className="rounded border border-outline-variant/40 bg-surface-container-lowest p-5 shadow-ambient md:p-6">
      <h2 className="text-headline-md text-on-surface">พื้นที่เรียนรู้จะเติมข้อมูลเองหลังเริ่มใช้งาน</h2>
      <p className="mt-2 max-w-3xl text-body-md text-on-surface-variant">
        แดชบอร์ดนี้จะไม่แสดงข้อมูลจำลอง เมื่อมีเอกสาร ควิซ หรือคะแนนจาก backend จริง ระบบจะเติมเนื้อหาต่อไปนี้ให้อัตโนมัติ
      </p>
      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {["เอกสารล่าสุด", "คะแนนล่าสุด", "คำแนะนำจาก AI"].map((title) => (
          <div className="rounded border border-outline-variant/40 bg-[#fbfcff] p-4" key={title}>
            <p className="text-body-md font-bold text-on-surface">{title}</p>
            <p className="mt-2 text-label-sm text-on-surface-variant">รอข้อมูลจริงจากกิจกรรมของคุณ</p>
          </div>
        ))}
      </div>
    </section>

    <section className="rounded border border-outline-variant/40 bg-surface-container-lowest p-5 shadow-ambient md:p-6">
      <div className="flex items-center gap-2 text-label-sm font-semibold text-[#216148]">
        <MessageSquareText aria-hidden="true" className="h-4 w-4" />
        พร้อมช่วยทบทวน
      </div>
      <h2 className="mt-4 text-headline-md text-on-surface">ถาม AI ได้หลังมีเอกสาร</h2>
      <p className="mt-2 text-body-md text-on-surface-variant">
        เมื่อเอกสารที่สรุปเสร็จแล้วพร้อมใช้งาน AI Tutor จะตอบพร้อม citation และช่วยต่อยอดเป็นควิซได้
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
);

type ReadyStudyStateProps = {
  dashboard: StudyDashboardViewModel;
  topScores: StudyDashboardViewModel["apiResponse"]["recent_scores"];
};

const ReadyStudyState = ({ dashboard, topScores }: ReadyStudyStateProps) => (
  <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
    <section className="rounded border border-outline-variant/40 bg-surface-container-lowest p-5 shadow-ambient md:p-6">
      <h2 className="text-headline-md text-on-surface">ภาพรวมการทบทวนล่าสุด</h2>
      <div className="mt-5 grid gap-3">
        {topScores.length > 0 ? (
          topScores.map((score) => (
            <div className="rounded border border-outline-variant/40 bg-[#fbfcff] p-4" key={score.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="break-words text-body-lg font-bold text-on-surface">{score.filename}</p>
                  <p className="mt-1 text-label-sm text-on-surface-variant">{getRelativeTimeLabel(score.submitted_at)}</p>
                </div>
                <div className="rounded bg-[#e6f6ee] px-3 py-1.5 text-label-md font-bold text-[#216148]">
                  {formatScore(score.score)} · {scoreToGrade(score.score)}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded border border-outline-variant/40 bg-[#fbfcff] p-4 text-body-md text-on-surface-variant">
            ยังไม่มีคะแนนควิซล่าสุดจาก API
          </div>
        )}
      </div>
    </section>

    <section className="rounded border border-outline-variant/40 bg-surface-container-lowest p-5 shadow-ambient md:p-6">
      <h2 className="text-headline-md text-on-surface">ทำอะไรต่อดี</h2>
      <p className="mt-2 text-body-md text-on-surface-variant">ใช้ข้อมูลล่าสุดเพื่อเลือกขั้นตอนต่อไปอย่างตั้งใจ</p>
      <div className="mt-5 grid gap-3">
        <Link
          className="group rounded border border-outline-variant/40 bg-[#fbfcff] p-4 transition-colors hover:border-primary-fixed-dim"
          href="/documents"
        >
          <span className="flex items-center justify-between gap-3 text-body-md font-bold text-on-surface">
            เปิดเอกสารของฉัน
            <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </span>
        </Link>
        <Link
          className="group rounded border border-outline-variant/40 bg-[#fbfcff] p-4 transition-colors hover:border-primary-fixed-dim"
          href="/quiz"
        >
          <span className="flex items-center justify-between gap-3 text-body-md font-bold text-on-surface">
            สร้างควิซจากเอกสาร
            <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </span>
        </Link>
      </div>
    </section>
  </section>
);
