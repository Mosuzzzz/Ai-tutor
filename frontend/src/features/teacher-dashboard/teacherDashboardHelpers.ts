import type {
  TeacherActivity,
  TeacherActivityType,
  TeacherClassStatus,
  TeacherClassSummary,
  TeacherQuizStatus
} from "./types";

const classStatusOrder: Record<TeacherClassStatus, number> = {
  active: 0,
  upcoming: 1,
  archived: 2
};

export const getCompletionPercentValue = (rate: number) => {
  const normalizedRate = rate <= 1 ? rate * 100 : rate;

  return Math.min(100, Math.max(0, Math.round(normalizedRate)));
};

export const formatCompletionRate = (rate: number) => {
  return `${getCompletionPercentValue(rate)}%`;
};

export const sortTeacherClasses = (classes: TeacherClassSummary[]) => {
  return [...classes].sort((first, second) => {
    const statusDelta = classStatusOrder[first.status] - classStatusOrder[second.status];

    if (statusDelta !== 0) {
      return statusDelta;
    }

    return first.title.localeCompare(second.title, "th");
  });
};

export const getQuizStatusLabel = (status: TeacherQuizStatus) => {
  const labels: Record<TeacherQuizStatus, string> = {
    draft: "แบบร่าง",
    published: "เผยแพร่แล้ว",
    review: "รอตรวจ"
  };

  return labels[status];
};

export const getActivityLabel = (type: TeacherActivityType) => {
  const labels: Record<TeacherActivityType, string> = {
    document: "เอกสาร",
    quiz: "ควิซ",
    student: "ผู้เรียน"
  };

  return labels[type];
};

export const getTopActivity = (activities: TeacherActivity[]) => {
  return activities.reduce<TeacherActivity | undefined>((currentTop, activity) => {
    if (!currentTop || activity.count > currentTop.count) {
      return activity;
    }

    return currentTop;
  }, undefined);
};

export const getTeacherGreeting = (teacherName: string) => {
  return `สวัสดีครับ ${teacherName}`;
};
