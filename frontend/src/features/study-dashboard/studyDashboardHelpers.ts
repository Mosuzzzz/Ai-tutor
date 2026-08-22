import { normalizePercentValue } from "../../lib/percent";
import type { StudyDashboardResponse } from "./studyDashboardContract";

type RecentScore = StudyDashboardResponse["recent_scores"][number];

export const getProgressPercentValue = (value: number) => {
  return normalizePercentValue(value);
};

export const formatScore = (score: number) => {
  return `${getProgressPercentValue(score)}%`;
};

export const scoreToGrade = (score: number) => {
  const normalizedScore = getProgressPercentValue(score);

  if (normalizedScore >= 90) {
    return "ยอดเยี่ยม";
  }

  if (normalizedScore >= 80) {
    return "ดีมาก";
  }

  if (normalizedScore >= 70) {
    return "ดี";
  }

  return "ควรทบทวน";
};

export const getRecentScores = (scores: RecentScore[], limit = 3) => {
  return [...scores]
    .sort((first, second) => getTimestamp(second.submitted_at) - getTimestamp(first.submitted_at))
    .slice(0, Math.max(0, limit));
};

const getTimestamp = (dateValue: string) => {
  const timestamp = Date.parse(dateValue);
  return Number.isNaN(timestamp) ? 0 : timestamp;
};
