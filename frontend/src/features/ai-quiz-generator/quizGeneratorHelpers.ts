import type {
  QuizCitationPreview,
  QuizDifficulty,
  QuizDraftStatus,
  QuizSource,
  QuizSourceStatus,
  QuizSourceType
} from "./types";

const sourceStatusPriority: Record<QuizSourceStatus, number> = {
  ready: 0,
  processing: 1,
  error: 2
};

const difficultyLabels: Record<QuizDifficulty, string> = {
  easy: "ง่าย",
  hard: "ยาก",
  medium: "ปานกลาง"
};

const sourceTypeLabels: Record<QuizSourceType, string> = {
  course: "คอร์สเรียน",
  document: "เอกสาร",
  manual: "กำหนดเอง"
};

const sourceStatusLabels: Record<QuizSourceStatus, string> = {
  error: "มีปัญหา",
  processing: "กำลังประมวลผล",
  ready: "พร้อมสร้างควิซ"
};

const draftStatusLabels: Record<QuizDraftStatus, string> = {
  draft: "แบบร่าง",
  published: "เผยแพร่แล้ว",
  ready_to_publish: "พร้อมเผยแพร่"
};

export const formatDifficulty = (difficulty: QuizDifficulty) => {
  return difficultyLabels[difficulty];
};

export const formatQuizSourceType = (type: QuizSourceType) => {
  return sourceTypeLabels[type];
};

export const formatQuizSourceStatus = (status: QuizSourceStatus) => {
  return sourceStatusLabels[status];
};

export const formatQuizDraftStatus = (status: QuizDraftStatus) => {
  return draftStatusLabels[status];
};

export const clampQuestionCount = (count: number) => {
  return Math.min(20, Math.max(5, count));
};

export const sortQuizSourcesByReadiness = (sources: QuizSource[]) => {
  return [...sources].sort((left, right) => {
    const priorityDifference = sourceStatusPriority[left.status] - sourceStatusPriority[right.status];

    if (priorityDifference !== 0) {
      return priorityDifference;
    }

    return new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime();
  });
};

export const getSelectedQuizSource = (sources: QuizSource[], selectedSourceId: string) => {
  const sortedSources = sortQuizSourcesByReadiness(sources);
  const selectedSource = sortedSources.find((source) => source.id === selectedSourceId && source.status === "ready");

  if (selectedSource) {
    return selectedSource;
  }

  return sortedSources.find((source) => source.status === "ready");
};

export const countReadyQuizSources = (sources: QuizSource[]) => {
  return sources.filter((source) => source.status === "ready").length;
};

export const estimateQuizDuration = (questionCount: number) => {
  return `${Math.ceil(clampQuestionCount(questionCount) * 1.5)} นาที`;
};

export const buildQuizCitationLabel = (citation: QuizCitationPreview) => {
  return `${citation.filename} · ส่วนที่ ${citation.chunk_index + 1}`;
};
