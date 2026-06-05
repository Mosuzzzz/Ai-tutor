import { describe, expect, it } from "vitest";

import {
  teacherDashboardResponseSchema,
  teacherStudentsResponseSchema
} from "./teacherDashboardContract";
import {
  backendTeacherDashboardResponse,
  backendTeacherStudentsResponse
} from "./teacherDashboardTestData";

describe("teacher dashboard Backend contract", () => {
  it("validates /api/analytics/trainer payloads from Backend", () => {
    const parsed = teacherDashboardResponseSchema.parse(backendTeacherDashboardResponse);

    expect(parsed).toMatchObject({
      average_tenant_score: 82.5,
      total_employees: 42
    });
    expect(parsed.department_stats).toContainEqual({
      label: "ready_documents",
      value: 7
    });
    expect(parsed.skill_gaps).toContainEqual(
      expect.objectContaining({
        topic: "AI Safety Handbook.pdf",
        total_attempts: 16
      })
    );
  });

  it("validates /api/analytics/trainer/students payloads with nullable names and activity", () => {
    expect(teacherStudentsResponseSchema.parse(backendTeacherStudentsResponse)).toMatchObject([
      {
        average_score: 91.5,
        full_name: "ไหม ศึกษา"
      },
      {
        full_name: null,
        last_active_at: null
      }
    ]);
  });

  it("rejects malformed teacher analytics before they reach the UI", () => {
    expect(() =>
      teacherDashboardResponseSchema.parse({
        ...backendTeacherDashboardResponse,
        skill_gaps: null
      })
    ).toThrow();
  });
});
