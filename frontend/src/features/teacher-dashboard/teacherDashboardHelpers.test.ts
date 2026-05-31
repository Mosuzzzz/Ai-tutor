import { describe, expect, it } from "vitest";

import {
  formatCompletionRate,
  getActivityLabel,
  getCompletionPercentValue,
  getQuizStatusLabel,
  getTeacherGreeting,
  getTopActivity,
  sortTeacherClasses
} from "./teacherDashboardHelpers";
import type { TeacherActivity, TeacherClassSummary } from "./types";

const classes: TeacherClassSummary[] = [
  {
    id: "class-archived",
    title: "ห้องเรียนเดิม",
    subject: "AI",
    studentCount: 20,
    completionRate: 0.9,
    averageScore: 88,
    status: "archived"
  },
  {
    id: "class-upcoming",
    title: "ห้องเรียนใหม่",
    subject: "Robotics",
    studentCount: 18,
    completionRate: 0.2,
    averageScore: 70,
    status: "upcoming"
  },
  {
    id: "class-active",
    title: "ห้องเรียนหลัก",
    subject: "Data Science",
    studentCount: 36,
    completionRate: 0.76,
    averageScore: 84,
    status: "active"
  }
];

const activities: TeacherActivity[] = [
  {
    id: "activity-low",
    type: "document",
    title: "สรุปเอกสารใหม่",
    description: "มีเอกสารใหม่รอทบทวน",
    occurredAt: "10 นาทีที่แล้ว",
    count: 4
  },
  {
    id: "activity-high",
    type: "quiz",
    title: "ส่งควิซแล้ว",
    description: "นักเรียนส่งควิซล่าสุด",
    occurredAt: "20 นาทีที่แล้ว",
    count: 22
  }
];

describe("teacher dashboard helpers", () => {
  it("formats completion rates from decimal values", () => {
    expect(formatCompletionRate(0.82)).toBe("82%");
  });

  it("formats completion rates from whole percentages", () => {
    expect(formatCompletionRate(74)).toBe("74%");
  });

  it("clamps completion rates for progressbar values", () => {
    expect(getCompletionPercentValue(120)).toBe(100);
    expect(getCompletionPercentValue(-0.1)).toBe(0);
  });

  it("sorts classes by active, upcoming, and archived status", () => {
    expect(sortTeacherClasses(classes).map((item) => item.id)).toEqual([
      "class-active",
      "class-upcoming",
      "class-archived"
    ]);
  });

  it("returns Thai quiz status labels", () => {
    expect(getQuizStatusLabel("published")).toBe("เผยแพร่แล้ว");
    expect(getQuizStatusLabel("draft")).toBe("แบบร่าง");
    expect(getQuizStatusLabel("review")).toBe("รอตรวจ");
  });

  it("returns Thai activity labels", () => {
    expect(getActivityLabel("quiz")).toBe("ควิซ");
    expect(getActivityLabel("document")).toBe("เอกสาร");
    expect(getActivityLabel("student")).toBe("ผู้เรียน");
  });

  it("finds the activity item with the highest count", () => {
    expect(getTopActivity(activities)?.id).toBe("activity-high");
  });

  it("creates a teacher greeting", () => {
    expect(getTeacherGreeting("ครูเมย์")).toBe("สวัสดีครับ ครูเมย์");
  });
});
