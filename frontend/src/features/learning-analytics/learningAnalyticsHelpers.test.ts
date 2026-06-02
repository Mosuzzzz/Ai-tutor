import { describe, expect, it } from "vitest";

import {
  buildAnalyticsMetricCards,
  formatAnalyticsPercent,
  formatDepartmentLabel,
  formatRiskLevel,
  getAverageTrendDelta,
  getLowestScoringSkill,
  getStrongestSkill,
  normalizeAnalyticsPercent,
  sortSkillGapsByRisk
} from "./learningAnalyticsHelpers";
import type { LearningSkillGap, LearningTrendPoint } from "./types";

const skillGaps: LearningSkillGap[] = [
  {
    description: "ตอบผิดในหัวข้อความปลอดภัยซ้ำหลายครั้ง",
    error_rate: 28.4,
    incorrect_count: 7,
    topic: "ความปลอดภัยห้องปฏิบัติการ",
    total_attempts: 25
  },
  {
    description: "ยังสับสนหลักฐานอ้างอิง",
    error_rate: 12.2,
    incorrect_count: 3,
    topic: "การอ่าน citation",
    total_attempts: 25
  },
  {
    description: "ต้องทบทวนแนวคิดหลัก",
    error_rate: 44.8,
    incorrect_count: 11,
    topic: "เวกเตอร์และแรง",
    total_attempts: 25
  }
];

const trend: LearningTrendPoint[] = [
  { average_score: 72, date: "2026-05-28" },
  { average_score: 76, date: "2026-05-29" },
  { average_score: 84, date: "2026-06-01" }
];

describe("learningAnalyticsHelpers", () => {
  it("normalizes and formats analytics percentages safely", () => {
    expect(normalizeAnalyticsPercent(-12)).toBe(0);
    expect(normalizeAnalyticsPercent(84.6)).toBe(85);
    expect(normalizeAnalyticsPercent(140)).toBe(100);
    expect(formatAnalyticsPercent(87.3)).toBe("87%");
  });

  it("labels risk levels from backend error rates", () => {
    expect(formatRiskLevel(8)).toBe("เฝ้าดู");
    expect(formatRiskLevel(24)).toBe("ควรทบทวน");
    expect(formatRiskLevel(42)).toBe("ต้องเสริมพื้นฐาน");
  });

  it("sorts skill gaps by highest learning risk first", () => {
    expect(sortSkillGapsByRisk(skillGaps).map((gap) => gap.topic)).toEqual([
      "เวกเตอร์และแรง",
      "ความปลอดภัยห้องปฏิบัติการ",
      "การอ่าน citation"
    ]);
  });

  it("finds strongest and lowest scoring skills from the same backend shape", () => {
    expect(getStrongestSkill(skillGaps)?.topic).toBe("การอ่าน citation");
    expect(getLowestScoringSkill(skillGaps)?.topic).toBe("เวกเตอร์และแรง");
  });

  it("calculates score trend delta from first and last trend points", () => {
    expect(getAverageTrendDelta(trend)).toBe(12);
    expect(getAverageTrendDelta(trend.slice(0, 1))).toBe(0);
  });

  it("formats department status labels and builds metric cards", () => {
    expect(formatDepartmentLabel("ready_documents")).toBe("เอกสารพร้อมใช้");
    expect(formatDepartmentLabel("custom_metric")).toBe("custom metric");

    expect(
      buildAnalyticsMetricCards({
        average_tenant_score: 84.2,
        department_stats: [],
        score_trend: trend,
        skill_gaps: skillGaps,
        total_employees: 156,
        total_quizzes_taken: 248
      }).map((metric) => metric.id)
    ).toEqual(["total-employees", "average-score", "completed-quizzes", "trend-delta"]);
  });
});
