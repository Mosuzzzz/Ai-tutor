import { describe, expect, it } from "vitest";

import {
  ADMIN_AUDIT_LOGS_API_PATH,
  ADMIN_USAGE_API_PATH,
  LEARNER_ANALYTICS_API_PATH,
  TRAINER_ANALYTICS_API_PATH,
  TRAINER_STUDENTS_API_PATH,
  adminAuditLogsResponseSchema,
  adminUsageApiPath,
  adminUsageResponseSchema,
  learnerAnalyticsResponseSchema,
  trainerAnalyticsResponseSchema,
  trainerStudentsResponseSchema
} from "./learningAnalyticsContract";
import {
  backendAdminUsageResponse,
  backendAuditLogsResponse,
  backendLearnerAnalyticsResponse,
  backendTrainerAnalyticsResponse,
  backendTrainerStudentsResponse
} from "./learningAnalyticsTestData";

describe("learning analytics Backend contract", () => {
  it("keeps analytics endpoint paths aligned with the FastAPI routes", () => {
    expect(LEARNER_ANALYTICS_API_PATH).toBe("/api/analytics/dashboard");
    expect(TRAINER_ANALYTICS_API_PATH).toBe("/api/analytics/trainer");
    expect(TRAINER_STUDENTS_API_PATH).toBe("/api/analytics/trainer/students");
    expect(ADMIN_USAGE_API_PATH).toBe("/api/analytics/usage");
    expect(ADMIN_AUDIT_LOGS_API_PATH).toBe("/api/analytics/audit-logs");
    expect(adminUsageApiPath(14)).toBe("/api/analytics/usage?days=14");
  });

  it("validates learner, trainer, student list, usage, and audit responses", () => {
    expect(learnerAnalyticsResponseSchema.parse(backendLearnerAnalyticsResponse).completed_quizzes).toBe(8);
    expect(trainerAnalyticsResponseSchema.parse(backendTrainerAnalyticsResponse).total_employees).toBe(42);
    expect(trainerStudentsResponseSchema.parse(backendTrainerStudentsResponse)).toHaveLength(2);
    expect(adminUsageResponseSchema.parse(backendAdminUsageResponse).total_logins).toBe(128);
    expect(adminAuditLogsResponseSchema.parse(backendAuditLogsResponse)[1]?.email).toBeNull();
  });

  it("rejects unsafe or incomplete analytics response shapes", () => {
    expect(() =>
      learnerAnalyticsResponseSchema.parse({
        ...backendLearnerAnalyticsResponse,
        skill_breakdown: [
          {
            attempts: 3,
            average_score: 91,
            file_id: "file-safe"
          }
        ]
      })
    ).toThrow();

    expect(() =>
      trainerAnalyticsResponseSchema.parse({
        ...backendTrainerAnalyticsResponse,
        skill_gaps: [
          {
            error_rate: 38,
            topic: "Missing counts"
          }
        ]
      })
    ).toThrow();
  });
});
