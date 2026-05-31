import type { RecentScore } from "./types";

export const getProgressPercentValue = (value: number) => {
  return Math.min(100, Math.max(0, Math.round(value)));
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

export const sortRecentScoresByScore = (scores: RecentScore[]) => {
  return [...scores].sort((first, second) => second.score - first.score);
};

export const getTopScores = (scores: RecentScore[], limit = 3) => {
  return sortRecentScoresByScore(scores).slice(0, limit);
};

export const getRelativeTimeLabel = (dateValue: string, now = new Date()) => {
  const date = new Date(dateValue);
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.max(0, Math.round(diffMs / 60000));

  if (diffMinutes < 60) {
    return `${diffMinutes} นาทีที่แล้ว`;
  }

  const diffHours = Math.round(diffMinutes / 60);

  if (diffHours < 24) {
    return `${diffHours} ชั่วโมงที่แล้ว`;
  }

  return `${Math.round(diffHours / 24)} วันที่แล้ว`;
};

export const getStudentGreeting = (learnerName: string) => {
  return `ยินดีต้อนรับกลับมา ${learnerName}`;
};

export const getHeroSummary = (learnerName: string) => {
  return `${getStudentGreeting(learnerName)} พื้นที่นี้รวมบทเรียน เอกสาร และความคืบหน้าควิซไว้ให้ติดตามได้ในหน้าเดียว`;
};
