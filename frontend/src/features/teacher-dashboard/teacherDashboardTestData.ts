export const backendTeacherDashboardResponse = {
  average_tenant_score: 82.5,
  department_stats: [
    {
      label: "ready_documents",
      value: 7
    },
    {
      label: "processing_documents",
      value: 2
    }
  ],
  score_trend: [
    {
      average_score: 78.5,
      date: "2026-06-04"
    }
  ],
  skill_gaps: [
    {
      description: "Average score on this document is 62% across submitted quizzes.",
      error_rate: 38,
      incorrect_count: 6,
      topic: "AI Safety Handbook.pdf",
      total_attempts: 16
    }
  ],
  total_employees: 42,
  total_quizzes_taken: 18
};

export const backendTeacherStudentsResponse = [
  {
    average_score: 91.5,
    completed_quizzes: 8,
    email: "mai@example.com",
    full_name: "ไหม ศึกษา",
    last_active_at: "2026-06-05T08:30:00.000Z",
    user_id: "learner-1"
  },
  {
    average_score: 0,
    completed_quizzes: 0,
    email: "unknown@example.com",
    full_name: null,
    last_active_at: null,
    user_id: "learner-2"
  }
];
