"use client";

import { useState } from "react";
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
import { submitQuizAttempt } from "./quizAttemptClient";
import { generateQuizDraft } from "./quizGenerationClient";
import { publishQuizDraft } from "./quizPublishClient";
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
  getSafeQuizDraftQuestions,
  sortQuizSourcesByReadiness
} from "./quizGeneratorHelpers";
import { toGeneratedQuizDraft, toQuizAttemptResult } from "./quizGeneratorMapper";
import type {
  QuizAttemptAnswerMap,
  QuizAttemptResult,
  QuizGeneratorStatus,
  QuizGeneratorViewModel,
  QuizQuestionPreview,
  QuizSource,
  QuizSourceStatus
} from "./types";

type AiQuizGeneratorPageProps = {
  dataSource?: "api" | "api-ready-mock";
  errorMessage?: string;
  quiz?: QuizGeneratorViewModel;
  selectedSourceId?: string;
  status?: QuizGeneratorStatus;
};

type AsyncActionStatus = "idle" | "submitting" | "success" | "error";

const sourceStatusToneClassNames: Record<QuizSourceStatus, string> = {
  error: "bg-[#ffe9df] text-[#9a3b18]",
  processing: "bg-[#fff3d8] text-[#8a5a00]",
  ready: "bg-[#e6f6ee] text-[#216148]"
};

const sourceModeItems = [
  {
    helper: "ต่อยอดจากสรุปและอ้างอิง",
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
              <div className="mt-4">
                <Link
                  className="inline-flex min-h-11 max-w-full items-center justify-center gap-2 rounded border border-[#3f5d2f]/15 bg-white px-3 py-2 text-label-sm font-bold text-[#355526] transition-colors hover:bg-[#f0f7e8] focus:outline-none focus:ring-2 focus:ring-[#8ab86f] focus:ring-offset-2"
                  href={`/quiz?documentId=${encodeURIComponent(source.id)}`}
                >
                  {isSelected ? "กำลังใช้แหล่งนี้" : "เลือกแหล่งนี้"}
                  <ArrowRight aria-hidden="true" className="h-4 w-4" />
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </Card>
  );
};

const SettingsPanel = ({
  generationError,
  generationStatus,
  onGenerate,
  quiz,
  selectedSource
}: {
  generationError?: string;
  generationStatus: AsyncActionStatus;
  onGenerate: () => void;
  quiz: QuizGeneratorViewModel;
  selectedSource: QuizSource;
}) => {
  const isGenerating = generationStatus === "submitting";

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
          <Button disabled={isGenerating} onClick={onGenerate}>
            {isGenerating ? "กำลังสร้างควิซ" : "สร้างควิซ"}
            <Bot aria-hidden="true" className="h-4 w-4" />
          </Button>
          <span className="text-label-sm font-semibold text-on-surface-variant">
            ใช้แหล่งข้อมูล: {selectedSource.title}
          </span>
        </div>
        {generationStatus === "success" ? (
          <div
            className="rounded border border-[#b8dfc8] bg-[#effaf3] p-3 text-body-md font-semibold text-[#216148]"
            role="status"
          >
            สร้างแบบร่างควิซสำเร็จ
          </div>
        ) : null}
        {generationStatus === "error" && generationError ? (
          <div
            className="rounded border border-[#f2b8b5] bg-[#fff8f7] p-3 text-body-md font-semibold text-[#8c1d18]"
            role="alert"
          >
            {generationError}
          </div>
        ) : null}
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

const AttemptPanel = ({
  answers,
  attemptError,
  attemptResult,
  attemptStatus,
  onAnswerChange,
  onSubmit,
  questions
}: {
  answers: QuizAttemptAnswerMap;
  attemptError?: string;
  attemptResult?: QuizAttemptResult;
  attemptStatus: AsyncActionStatus;
  onAnswerChange: (questionId: string, optionIndex: number) => void;
  onSubmit: () => void;
  questions: QuizQuestionPreview[];
}) => {
  const isSubmitting = attemptStatus === "submitting";
  const isComplete = questions.length > 0 && questions.every((question) => answers[question.id] !== undefined);

  return (
    <section aria-label="ทำควิซ" className="grid min-w-0 gap-4 overflow-hidden">
      <Card className="min-w-0 overflow-hidden p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-label-sm font-semibold text-[#355526]">ทำควิซ</p>
            <h3 className="mt-1 break-words text-headline-md text-on-surface">ทำควิซและบันทึกคะแนน</h3>
            <p className="mt-2 break-words text-body-md text-on-surface-variant">
              เลือกคำตอบให้ครบทุกข้อ แล้วระบบจะบันทึกคะแนนกลับไปยังสถิติการเรียน
            </p>
          </div>
          {attemptResult ? (
            <span className="rounded bg-[#e6f6ee] px-3 py-1 text-label-sm font-bold text-[#216148]">
              {attemptResult.passedLabel}
            </span>
          ) : null}
        </div>

        <div className="mt-5 grid gap-4">
          {questions.map((question, questionIndex) => (
            <fieldset
              className="min-w-0 rounded border border-outline-variant/40 bg-[#fbfcff] p-4"
              key={question.id}
            >
              <legend className="break-words text-body-lg font-bold text-on-surface">
                ข้อที่ {questionIndex + 1}: {question.question_text}
              </legend>
              <div className="mt-4 grid gap-2">
                {question.options.map((option, optionIndex) => (
                  <label
                    className="flex min-w-0 cursor-pointer items-start gap-3 rounded border border-[#d8e5f5] bg-white p-3 text-body-md text-on-surface-variant transition-colors hover:bg-[#f6f9ff]"
                    key={option.id}
                  >
                    <input
                      checked={answers[question.id] === optionIndex}
                      className="mt-1 h-4 w-4 shrink-0 accent-primary"
                      name={`quiz-question-${question.id}`}
                      onChange={() => onAnswerChange(question.id, optionIndex)}
                      type="radio"
                    />
                    <span className="break-words">{option.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Button disabled={!isComplete || isSubmitting || Boolean(attemptResult)} onClick={onSubmit}>
            {isSubmitting ? "กำลังส่งคำตอบ" : "ส่งคำตอบ"}
            <ClipboardCheck aria-hidden="true" className="h-4 w-4" />
          </Button>
          <span className="text-label-sm font-semibold text-on-surface-variant">
            {isComplete ? "พร้อมส่งคำตอบ" : "ตอบให้ครบทุกข้อก่อนส่ง"}
          </span>
        </div>

        {attemptError ? (
          <div
            className="mt-4 rounded border border-[#f2b8b5] bg-[#fff8f7] p-3 text-body-md font-semibold text-[#8c1d18]"
            role="alert"
          >
            {attemptError}
          </div>
        ) : null}

        {attemptResult ? (
          <div className="mt-5 rounded border border-[#b8dfc8] bg-[#effaf3] p-4" role="status">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-headline-md font-bold text-[#216148]">คะแนน {attemptResult.scoreLabel}</p>
              <p className="text-body-md font-semibold text-[#216148]">ถูก {attemptResult.correctAnswersLabel}</p>
            </div>
            <Link
              className="mt-4 inline-flex min-h-12 max-w-full items-center justify-center gap-2 rounded border border-[#216148]/20 bg-white px-4 py-2 text-label-md font-bold text-[#216148] transition-colors hover:bg-[#effaf3] focus:outline-none focus:ring-2 focus:ring-[#216148]/30 focus:ring-offset-2"
              href="/analytics"
            >
              ดูสถิติการเรียน
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
            <div className="mt-4 grid gap-3">
              {attemptResult.items.map((item) => (
                <article className="rounded border border-[#b8dfc8] bg-white p-3" key={item.questionId}>
                  <p className="break-words text-body-md font-bold text-on-surface">{item.questionText}</p>
                  <p className="mt-2 break-words text-body-md text-on-surface-variant">
                    คำตอบของคุณ: {item.chosenOptionLabel}
                  </p>
                  <p className="mt-1 break-words text-body-md text-on-surface-variant">
                    คำตอบที่ถูกต้อง: {item.correctOptionLabel}
                  </p>
                  {item.explanation ? (
                    <p className="mt-2 break-words text-body-md text-on-surface-variant">{item.explanation}</p>
                  ) : null}
                  {item.citation ? (
                    <p className="mt-2 break-words text-label-sm font-semibold text-[#355526]">{item.citation}</p>
                  ) : null}
                </article>
              ))}
            </div>
          </div>
        ) : null}
      </Card>
    </section>
  );
};

const PreviewPanel = ({ quiz }: { quiz: QuizGeneratorViewModel }) => {
  const questions = getSafeQuizDraftQuestions(quiz.draft.questions);

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
        {questions.length > 0 ? (
          <div className="mt-5 grid gap-4">
            {questions.map((question, index) => (
              <QuestionPreviewCard index={index} key={question.id} question={question} />
            ))}
          </div>
        ) : (
          <div
            className="mt-5 rounded border border-outline-variant/40 bg-[#fbfcff] p-5 text-body-md text-on-surface-variant"
            data-testid="ai-quiz-empty-draft"
            role="status"
          >
            ยังไม่มีคำถามในแบบร่าง รอผลลัพธ์จาก AI หรือลองเลือกแหล่งข้อมูลใหม่
          </div>
        )}
      </Card>
    </section>
  );
};

const PublishPanel = ({
  onPublish,
  publishError,
  publishStatus,
  quiz
}: {
  onPublish: () => void;
  publishError?: string;
  publishStatus: AsyncActionStatus;
  quiz: QuizGeneratorViewModel;
}) => {
  const questions = getSafeQuizDraftQuestions(quiz.draft.questions);
  const hasDraftReady = Boolean(quiz.draft.id) && questions.length > 0;
  const isPublished = quiz.draft.status === "published";
  const isPublishing = publishStatus === "submitting";

  return (
    <Card className="min-w-0 overflow-hidden p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-label-sm font-semibold text-[#355526]">ขั้นตอนถัดไป</p>
          <h3 className="mt-1 break-words text-headline-md text-on-surface">
            {isPublished ? "ควิซพร้อมให้ทำแล้ว" : "ตรวจแบบร่างก่อนเผยแพร่"}
          </h3>
          <p className="mt-2 break-words text-body-md text-on-surface-variant">
            {isPublished
              ? "ผู้เรียนสามารถทำควิซและส่งคะแนนกลับไปยังสถิติการเรียนได้"
              : "ตรวจคำถามและอ้างอิงให้เรียบร้อยก่อนเปิดให้ผู้เรียนทำควิซ"}
          </p>
        </div>
        <span
          className={cn(
            "rounded px-3 py-1 text-label-sm font-bold",
            isPublished ? "bg-[#e6f6ee] text-[#216148]" : "bg-[#fff3d8] text-[#8a5a00]"
          )}
        >
          {formatQuizDraftStatus(quiz.draft.status)}
        </span>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <Button disabled={!hasDraftReady || isPublished || isPublishing} onClick={onPublish} variant="secondary">
          {isPublishing ? "กำลังเผยแพร่ควิซ" : isPublished ? "เผยแพร่แล้ว" : "เผยแพร่ควิซ"}
          <ClipboardCheck aria-hidden="true" className="h-4 w-4" />
        </Button>
        <Link className={actionLinkClassName} href="/documents">
          ดูสรุปเอกสาร
          <ArrowRight aria-hidden="true" className="h-4 w-4" />
        </Link>
      </div>

      {!hasDraftReady ? (
        <div className="mt-4 rounded border border-outline-variant/40 bg-[#fbfcff] p-3 text-body-md text-on-surface-variant" role="status">
          สร้างแบบร่างควิซจากเอกสารก่อน จึงจะเผยแพร่ให้ผู้เรียนทำได้
        </div>
      ) : null}
      {publishStatus === "success" ? (
        <div
          className="mt-4 rounded border border-[#b8dfc8] bg-[#effaf3] p-3 text-body-md font-semibold text-[#216148]"
          role="status"
        >
          เผยแพร่ควิซสำเร็จ ตอนนี้สามารถลองทำควิซและบันทึกคะแนนได้แล้ว
        </div>
      ) : null}
      {publishStatus === "error" && publishError ? (
        <div
          className="mt-4 rounded border border-[#f2b8b5] bg-[#fff8f7] p-3 text-body-md font-semibold text-[#8c1d18]"
          role="alert"
        >
          {publishError}
        </div>
      ) : null}
    </Card>
  );
};

export const AiQuizGeneratorPage = ({
  dataSource = "api-ready-mock",
  errorMessage = "ไม่สามารถโหลดตัวสร้างควิซได้",
  quiz = aiQuizGeneratorMock,
  selectedSourceId,
  status = "ready"
}: AiQuizGeneratorPageProps) => {
  const [draft, setDraft] = useState(quiz.draft);
  const [attemptAnswers, setAttemptAnswers] = useState<QuizAttemptAnswerMap>({});
  const [attemptError, setAttemptError] = useState<string>();
  const [attemptResult, setAttemptResult] = useState<QuizAttemptResult>();
  const [attemptStatus, setAttemptStatus] = useState<AsyncActionStatus>("idle");
  const [generationError, setGenerationError] = useState<string>();
  const [generationStatus, setGenerationStatus] = useState<AsyncActionStatus>("idle");
  const [publishError, setPublishError] = useState<string>();
  const [publishStatus, setPublishStatus] = useState<AsyncActionStatus>("idle");

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
      <div className="space-y-6" data-source={dataSource} data-testid="ai-quiz-generator">
        <Card className="text-center" role="status">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded bg-surface-container text-primary">
            <TriangleAlert aria-hidden="true" className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-headline-md text-on-surface">ยังไม่มีแหล่งข้อมูลที่พร้อมสร้างควิซ</h2>
          <p className="mt-2 text-body-md text-on-surface-variant">
            รอเอกสารหรือคอร์สเรียนที่ประมวลผลเสร็จก่อนสร้างแบบทดสอบ หากเพิ่งอัปโหลดเอกสาร ให้กลับไปคลังเอกสารเพื่อตรวจสถานะก่อน
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Link className={actionLinkClassName} href="/documents">
              ไปคลังเอกสาร
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
            <Link className={actionLinkClassName} href="/courses">
              ดูคอร์สเรียน
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const activeQuiz: QuizGeneratorViewModel = {
    ...quiz,
    draft
  };
  const activeQuestions = getSafeQuizDraftQuestions(activeQuiz.draft.questions);
  const canAttemptQuiz =
    activeQuiz.capabilities.canSubmitAttempt && activeQuiz.draft.status === "published" && activeQuestions.length > 0;

  const handleGenerateQuiz = async () => {
    setGenerationError(undefined);
    setGenerationStatus("submitting");

    const result = await generateQuizDraft({
      difficulty: quiz.request.difficulty,
      fileId: selectedSource.id,
      instructions: quiz.request.instructions,
      numQuestions: quiz.request.num_questions
    });

    if (!result.ok) {
      setGenerationError(result.message);
      setGenerationStatus("error");
      return;
    }

    setDraft({
      ...toGeneratedQuizDraft({
        examResponse: result.exam,
        source: {
          filename: selectedSource.title,
          id: selectedSource.id
        }
      }),
      status: "ready_to_publish"
    });
    setAttemptAnswers({});
    setAttemptError(undefined);
    setAttemptResult(undefined);
    setAttemptStatus("idle");
    setPublishError(undefined);
    setPublishStatus("idle");
    setGenerationStatus("success");
  };

  const handlePublishQuiz = async () => {
    setPublishError(undefined);
    setPublishStatus("submitting");

    const result = await publishQuizDraft(activeQuiz.draft.id);

    if (!result.ok) {
      setPublishError(result.message);
      setPublishStatus("error");
      return;
    }

    setDraft((currentDraft) => ({
      ...currentDraft,
      status: result.status
    }));
    setAttemptAnswers({});
    setAttemptError(undefined);
    setAttemptResult(undefined);
    setAttemptStatus("idle");
    setPublishStatus("success");
  };

  const handleAttemptAnswerChange = (questionId: string, optionIndex: number) => {
    setAttemptAnswers((currentAnswers) => ({
      ...currentAnswers,
      [questionId]: optionIndex
    }));
    setAttemptError(undefined);
  };

  const handleSubmitAttempt = async () => {
    const answers = Object.fromEntries(
      activeQuestions
        .filter((question) => attemptAnswers[question.id] !== undefined)
        .map((question) => [question.id, attemptAnswers[question.id]])
    ) as QuizAttemptAnswerMap;

    setAttemptError(undefined);
    setAttemptStatus("submitting");

    const result = await submitQuizAttempt({
      answers,
      examId: activeQuiz.draft.id
    });

    if (!result.ok) {
      setAttemptError(result.message);
      setAttemptStatus("error");
      return;
    }

    setAttemptResult(
      toQuizAttemptResult({
        questions: activeQuestions,
        submitResponse: result.submitResult
      })
    );
    setAttemptStatus("success");
  };

  return (
    <div className="space-y-6" data-source={dataSource} data-testid="ai-quiz-generator">
      <section className="overflow-hidden rounded border border-[#4f7d3a]/15 bg-[#213719] text-white shadow-ambient">
        <div className="p-5 md:p-7">
          <div className="inline-flex items-center gap-2 rounded bg-white/10 px-3 py-1.5 text-label-sm font-semibold text-[#f6cf67]">
            <Sparkles aria-hidden="true" className="h-4 w-4" />
            {quiz.workspaceName}
          </div>
          <h2 className="mt-5 text-headline-lg-mobile font-bold md:text-headline-lg">สร้างควิซด้วย AI</h2>
          <p className="mt-3 max-w-3xl text-body-md text-white/80 md:text-body-lg">
            เลือกแหล่งข้อมูล กำหนดจำนวนข้อและความยาก แล้วดูแบบร่างคำถามพร้อมอ้างอิงก่อนเผยแพร่
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
          {activeQuiz.capabilities.canGenerateQuiz ? (
            <SettingsPanel
              generationError={generationError}
              generationStatus={generationStatus}
              onGenerate={handleGenerateQuiz}
              quiz={activeQuiz}
              selectedSource={selectedSource}
            />
          ) : null}
          <PreviewPanel quiz={activeQuiz} />
          <PublishPanel
            onPublish={handlePublishQuiz}
            publishError={publishError}
            publishStatus={publishStatus}
            quiz={activeQuiz}
          />
          {canAttemptQuiz ? (
            <AttemptPanel
              answers={attemptAnswers}
              attemptError={attemptError}
              attemptResult={attemptResult}
              attemptStatus={attemptStatus}
              onAnswerChange={handleAttemptAnswerChange}
              onSubmit={handleSubmitAttempt}
              questions={activeQuestions}
            />
          ) : null}
        </div>
      </section>
    </div>
  );
};
