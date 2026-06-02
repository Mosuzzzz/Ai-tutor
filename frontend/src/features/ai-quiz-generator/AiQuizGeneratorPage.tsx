import {
  ArrowRight,
  Bot,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  ListChecks,
  Settings2,
  Sparkles,
  TriangleAlert
} from "lucide-react";
import Link from "next/link";

import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { cn } from "../../lib/cn";
import { aiQuizGeneratorMock } from "./quizGeneratorData";
import {
  buildQuizCitationLabel,
  countReadyQuizSources,
  estimateQuizDuration,
  formatDifficulty,
  formatQuizDraftStatus,
  formatQuizSourceStatus,
  formatQuizSourceType,
  getSelectedQuizSource,
  sortQuizSourcesByReadiness
} from "./quizGeneratorHelpers";
import type {
  QuizGeneratorStatus,
  QuizGeneratorViewModel,
  QuizQuestionPreview,
  QuizSource,
  QuizSourceStatus
} from "./types";

type AiQuizGeneratorPageProps = {
  errorMessage?: string;
  quiz?: QuizGeneratorViewModel;
  selectedSourceId?: string;
  status?: QuizGeneratorStatus;
};

const sourceStatusToneClassNames: Record<QuizSourceStatus, string> = {
  error: "bg-[#ffe9df] text-[#9a3b18]",
  processing: "bg-[#fff3d8] text-[#8a5a00]",
  ready: "bg-[#e6f6ee] text-[#216148]"
};

const sourceModeItems = [
  {
    helper: "ต่อยอดจากสรุปและ citation",
    id: "document",
    label: "เอกสาร"
  },
  {
    helper: "สำหรับหัวข้อที่ครูกำหนด",
    id: "manual",
    label: "กำหนดเอง"
  },
  {
    helper: "ต่อจากบทเรียนในคอร์ส",
    id: "course",
    label: "คอร์สเรียน"
  }
] as const;

const actionLinkClassName =
  "inline-flex min-h-12 max-w-full items-center justify-center gap-2 rounded border border-[#3f5d2f]/15 bg-white px-4 py-2 text-left text-label-md font-bold text-[#355526] transition-colors hover:bg-[#f0f7e8] focus:outline-none focus:ring-2 focus:ring-[#8ab86f] focus:ring-offset-2";

const SourcePanel = ({
  selectedSource,
  sources
}: {
  selectedSource: QuizSource;
  sources: QuizSource[];
}) => {
  return (
    <Card className="min-w-0 overflow-hidden p-5" data-testid="ai-quiz-source-panel">
      <div className="flex items-center gap-2 text-label-sm font-semibold text-[#355526]">
        <FileText aria-hidden="true" className="h-4 w-4" />
        แหล่งข้อมูล
      </div>
      <div className="mt-4 grid gap-3">
        {sources.map((source) => {
          const isSelected = source.id === selectedSource.id;

          return (
            <article
              aria-label={`แหล่งข้อมูลที่${isSelected ? "เลือก" : "มี"} ${source.title}`}
              className={cn(
                "min-w-0 overflow-hidden rounded border p-4 transition-colors",
                isSelected
                  ? "border-[#4f7d3a] bg-[#f0f7e8]"
                  : "border-outline-variant/40 bg-surface-container-lowest"
              )}
              key={source.id}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <p className="break-words text-body-md font-bold text-on-surface">{source.title}</p>
                  <p className="mt-1 text-label-sm text-on-surface-variant">{formatQuizSourceType(source.type)}</p>
                </div>
                <span className={cn("max-w-full shrink-0 rounded px-3 py-1 text-label-sm font-bold", sourceStatusToneClassNames[source.status])}>
                  {formatQuizSourceStatus(source.status)}
                </span>
              </div>
              <p className="mt-3 break-words text-body-md text-on-surface-variant">{source.summary}</p>
              <p className="mt-2 text-label-sm font-semibold text-on-surface-variant">
                {source.updatedAtLabel} · แนะนำ {source.questionCountRecommendation} ข้อ
              </p>
            </article>
          );
        })}
      </div>
    </Card>
  );
};

const SettingsPanel = ({
  quiz,
  selectedSource
}: {
  quiz: QuizGeneratorViewModel;
  selectedSource: QuizSource;
}) => {
  return (
    <Card className="min-w-0 overflow-hidden p-5">
      <div className="flex items-center gap-2 text-label-sm font-semibold text-[#355526]">
        <Settings2 aria-hidden="true" className="h-4 w-4" />
        <h3 className="text-headline-md text-on-surface">ตั้งค่าควิซ</h3>
      </div>
      <div className="mt-4 grid gap-3">
        <div className="grid gap-3 sm:grid-cols-3">
          {sourceModeItems.map((mode) => (
            <div className="rounded border border-outline-variant/40 bg-[#fbfcff] p-3" key={mode.id}>
              <p className="text-label-sm font-bold text-on-surface">{mode.label}</p>
              <p className="mt-1 break-words text-label-sm text-on-surface-variant">{mode.helper}</p>
            </div>
          ))}
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded bg-surface-container-low p-4">
            <p className="text-label-sm font-bold text-on-surface-variant">จำนวนข้อ</p>
            <p className="mt-2 text-headline-md font-bold text-on-surface">{quiz.request.num_questions} ข้อ</p>
          </div>
          <div className="rounded bg-surface-container-low p-4">
            <p className="text-label-sm font-bold text-on-surface-variant">ความยาก</p>
            <p className="mt-2 text-headline-md font-bold text-on-surface">{formatDifficulty(quiz.request.difficulty)}</p>
          </div>
          <div className="rounded bg-surface-container-low p-4">
            <p className="text-label-sm font-bold text-on-surface-variant">เวลาโดยประมาณ</p>
            <p className="mt-2 text-headline-md font-bold text-on-surface">
              {estimateQuizDuration(quiz.request.num_questions)}
            </p>
          </div>
        </div>
        <div className="rounded border border-outline-variant/40 bg-[#fbfcff] p-4">
          <p className="text-label-sm font-bold text-on-surface-variant">คำสั่งสำหรับ AI</p>
          <ul className="mt-3 grid gap-2">
            {quiz.instructions.map((instruction) => (
              <li className="flex min-w-0 gap-2 text-body-md text-on-surface-variant" key={instruction}>
                <CheckCircle2 aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-[#4f7d3a]" />
                <span className="break-words">{instruction}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button disabled>
            สร้างควิซ
            <Bot aria-hidden="true" className="h-4 w-4" />
          </Button>
          <span className="text-label-sm font-semibold text-on-surface-variant">
            ใช้แหล่งข้อมูล: {selectedSource.title}
          </span>
        </div>
      </div>
    </Card>
  );
};

const QuestionPreviewCard = ({ index, question }: { index: number; question: QuizQuestionPreview }) => {
  return (
    <article className="min-w-0 overflow-hidden rounded border border-outline-variant/40 bg-[#fbfcff] p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-label-sm font-bold text-[#355526]">ข้อที่ {index + 1}</p>
          <h4 className="mt-2 break-words text-body-lg font-bold text-on-surface">{question.question_text}</h4>
        </div>
        <span className="rounded bg-[#e6f6ee] px-3 py-1 text-label-sm font-bold text-[#216148]">อ้างอิงเอกสาร</span>
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {question.options.map((option) => (
          <div className="min-w-0 rounded border border-[#d8e5f5] bg-white p-3 text-body-md text-on-surface-variant" key={option.id}>
            <span className="break-words">{option.label}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 rounded border border-[#d8e5f5] bg-white p-3 text-label-sm text-on-surface-variant">
        <p className="break-words font-bold text-[#355526]">{buildQuizCitationLabel(question.citation)}</p>
        <p className="mt-1 break-words">{question.citation.matched_text}</p>
      </div>
    </article>
  );
};

const PreviewPanel = ({ quiz }: { quiz: QuizGeneratorViewModel }) => {
  return (
    <section
      aria-label="แบบร่างคำถาม"
      className="grid min-w-0 gap-4 overflow-hidden"
      data-testid="ai-quiz-preview-panel"
    >
      <Card className="min-w-0 overflow-hidden p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-label-sm font-semibold text-[#355526]">{quiz.draft.generatedAtLabel}</p>
            <h3 className="mt-1 break-words text-headline-md text-on-surface">แบบร่างคำถาม</h3>
          </div>
          <span className="rounded bg-[#fff3d8] px-3 py-1 text-label-sm font-bold text-[#8a5a00]">
            {formatQuizDraftStatus(quiz.draft.status)}
          </span>
        </div>
        <div className="mt-5 grid gap-4">
          {quiz.draft.questions.map((question, index) => (
            <QuestionPreviewCard index={index} key={question.id} question={question} />
          ))}
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <Button disabled variant="secondary">
            เผยแพร่แบบทดสอบ
            <ClipboardCheck aria-hidden="true" className="h-4 w-4" />
          </Button>
          <Link className={actionLinkClassName} href="/documents">
            ดูสรุปเอกสาร
            <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        </div>
      </Card>
    </section>
  );
};

export const AiQuizGeneratorPage = ({
  errorMessage = "ไม่สามารถโหลดตัวสร้างควิซได้",
  quiz = aiQuizGeneratorMock,
  selectedSourceId,
  status = "ready"
}: AiQuizGeneratorPageProps) => {
  if (status === "loading") {
    return (
      <Card className="text-body-md text-on-surface-variant" role="status">
        กำลังโหลดตัวสร้างควิซ
      </Card>
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

  const sortedSources = sortQuizSourcesByReadiness(quiz.sources);
  const selectedSource = getSelectedQuizSource(sortedSources, selectedSourceId ?? quiz.selectedSourceId);

  if (!selectedSource) {
    return (
      <div className="space-y-6" data-source="api-ready-mock" data-testid="ai-quiz-generator">
        <Card className="text-center" role="status">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded bg-surface-container text-primary">
            <TriangleAlert aria-hidden="true" className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-headline-md text-on-surface">ยังไม่มีแหล่งข้อมูลที่พร้อมสร้างควิซ</h2>
          <p className="mt-2 text-body-md text-on-surface-variant">
            รอเอกสารหรือคอร์สเรียนที่ประมวลผลเสร็จก่อนสร้างแบบทดสอบ
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-source="api-ready-mock" data-testid="ai-quiz-generator">
      <section className="overflow-hidden rounded border border-[#4f7d3a]/15 bg-[#213719] text-white shadow-ambient">
        <div className="p-5 md:p-7">
          <div className="inline-flex items-center gap-2 rounded bg-white/10 px-3 py-1.5 text-label-sm font-semibold text-[#f6cf67]">
            <Sparkles aria-hidden="true" className="h-4 w-4" />
            {quiz.workspaceName}
          </div>
          <h2 className="mt-5 text-headline-lg-mobile font-bold md:text-headline-lg">สร้างควิซด้วย AI</h2>
          <p className="mt-3 max-w-3xl text-body-md text-white/80 md:text-body-lg">
            เลือกแหล่งข้อมูล กำหนดจำนวนข้อและความยาก แล้วดูแบบร่างคำถามพร้อม citation ก่อนเผยแพร่
          </p>
        </div>
      </section>

      <section aria-label="ตัวชี้วัดตัวสร้างควิซ" className="grid gap-4 md:grid-cols-3">
        {quiz.metrics.map((metric) => (
          <Card key={metric.id}>
            <p className="text-label-sm font-semibold uppercase text-on-surface-variant">{metric.label}</p>
            <p className="mt-2 text-display-lg font-bold text-on-surface">{metric.value}</p>
            <p className="mt-3 break-words text-body-md text-on-surface-variant">{metric.helper}</p>
          </Card>
        ))}
      </section>

      <section
        className="grid items-start gap-4 xl:grid-cols-[minmax(0,360px)_minmax(0,1fr)]"
        data-testid="ai-quiz-workspace-grid"
      >
        <div className="grid min-w-0 gap-4 overflow-hidden">
          <SourcePanel selectedSource={selectedSource} sources={sortedSources} />
          <Card className="min-w-0 overflow-hidden p-5">
            <div className="flex items-center gap-2 text-label-sm font-semibold text-[#355526]">
              <ListChecks aria-hidden="true" className="h-4 w-4" />
              แหล่งข้อมูลพร้อมใช้
            </div>
            <p className="mt-3 text-display-lg font-bold text-on-surface">{countReadyQuizSources(sortedSources)}</p>
            <p className="mt-2 text-body-md text-on-surface-variant">จากรายการทั้งหมด {sortedSources.length} แหล่ง</p>
          </Card>
        </div>
        <div className="grid min-w-0 gap-4 overflow-hidden">
          <SettingsPanel quiz={quiz} selectedSource={selectedSource} />
          <PreviewPanel quiz={quiz} />
        </div>
      </section>
    </div>
  );
};
