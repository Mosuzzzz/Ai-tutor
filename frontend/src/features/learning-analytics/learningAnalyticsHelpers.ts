import type {
  LearningAnalyticsApiResponse,
  LearningAnalyticsMetric,
  LearningDepartmentStat,
  LearningSkillGap,
  LearningTrendPoint
} from "./types";
import { normalizePercentValue } from "../../lib/percent";

const departmentLabels: Record<string, string> = {
  error_documents: "เอกสารมีปัญหา",
  pending_documents: "เอกสารรอประมวลผล",
  processing_documents: "เอกสารกำลังประมวลผล",
  ready_documents: "เอกสารพร้อมใช้"
};

export const normalizeAnalyticsPercent = (value: number) => {
  return normalizePercentValue(value);
};

export const formatAnalyticsPercent = (value: number) => {
  return `${normalizeAnalyticsPercent(value)}%`;
};

export const formatRiskLevel = (errorRate: number) => {
  const normalizedErrorRate = normalizeAnalyticsPercent(errorRate);

  if (normalizedErrorRate >= 35) {
    return "ต้องเสริมพื้นฐาน";
  }

  if (normalizedErrorRate >= 15) {
    return "ควรทบทวน";
  }

  return "เฝ้าดู";
};

export const sortSkillGapsByRisk = (skillGaps: LearningSkillGap[]) => {
  return [...skillGaps].sort((left, right) => {
    const riskDelta = right.error_rate - left.error_rate;

    if (riskDelta !== 0) {
      return riskDelta;
    }

    return left.topic.localeCompare(right.topic, "th");
  });
};

export const getStrongestSkill = (skillGaps: LearningSkillGap[]) => {
  return [...skillGaps].sort((left, right) => left.error_rate - right.error_rate)[0];
};

export const getLowestScoringSkill = (skillGaps: LearningSkillGap[]) => {
  return sortSkillGapsByRisk(skillGaps)[0];
};

export const getAverageTrendDelta = (trend: LearningTrendPoint[]) => {
  if (trend.length < 2) {
    return 0;
  }

  const sortedTrend = [...trend].sort((left, right) => left.date.localeCompare(right.date));
  const firstScore = sortedTrend[0]?.average_score ?? 0;
  const lastScore = sortedTrend[sortedTrend.length - 1]?.average_score ?? firstScore;

  return Math.round(lastScore - firstScore);
};

export const formatDepartmentLabel = (label: string) => {
  return departmentLabels[label] ?? label.replaceAll("_", " ");
};

export const sortDepartmentStats = (stats: LearningDepartmentStat[]) => {
  return [...stats].sort((left, right) => right.value - left.value);
};

export const buildAnalyticsMetricCards = (
  apiResponse: LearningAnalyticsApiResponse
): LearningAnalyticsMetric[] => {
  const trendDelta = getAverageTrendDelta(apiResponse.score_trend);

  return [
    {
      helper: "ผู้เรียนในพื้นที่เดียวกันที่มีข้อมูลกิจกรรม",
      id: "total-employees",
      label: "ผู้เรียนทั้งหมด",
      tone: "blue",
      value: String(apiResponse.total_employees)
    },
    {
      helper: "ค่าเฉลี่ยจากควิซที่ส่งแล้ว",
      id: "average-score",
      label: "คะแนนเฉลี่ย",
      tone: "green",
      value: formatAnalyticsPercent(apiResponse.average_tenant_score)
    },
    {
      helper: "จำนวนควิซที่มีผลลัพธ์พร้อมวิเคราะห์",
      id: "completed-quizzes",
      label: "ควิซที่ทำแล้ว",
      tone: "amber",
      value: String(apiResponse.total_quizzes_taken)
    },
    {
      helper: "เทียบจุดเริ่มต้นกับข้อมูลล่าสุด",
      id: "trend-delta",
      label: "แนวโน้มคะแนน",
      tone: trendDelta >= 0 ? "green" : "rose",
      value: `${trendDelta >= 0 ? "+" : ""}${trendDelta}%`
    }
  ];
};
