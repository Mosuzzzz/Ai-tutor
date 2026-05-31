export type TeacherClassStatus = "active" | "upcoming" | "archived";

export type TeacherQuizStatus = "published" | "draft" | "review";

export type TeacherActivityType = "quiz" | "document" | "student";

export type TeacherMetric = {
  id: string;
  label: string;
  value: string;
  helper: string;
  tone: "blue" | "gold" | "green" | "rose";
};

export type TeacherClassSummary = {
  id: string;
  title: string;
  subject: string;
  studentCount: number;
  completionRate: number;
  averageScore: number;
  status: TeacherClassStatus;
};

export type TeacherQuizSummary = {
  id: string;
  title: string;
  source: string;
  status: TeacherQuizStatus;
  submissionCount: number;
  averageScore: number;
};

export type TeacherActivity = {
  id: string;
  type: TeacherActivityType;
  title: string;
  description: string;
  occurredAt: string;
  count: number;
};

export type TeacherDashboardApiResponse = {
  total_students: number;
  generated_quizzes: number;
  reviewed_documents: number;
  completion_rate: number;
  classes: TeacherClassSummary[];
  quizzes: TeacherQuizSummary[];
  activities: TeacherActivity[];
};

export type TeacherDashboardViewModel = {
  teacherName: string;
  generatedAtLabel: string;
  apiEndpoint: string;
  apiResponse: TeacherDashboardApiResponse;
};
