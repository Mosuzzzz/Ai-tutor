import type { AuthSession } from "../auth/types";

export const learnerAnalyticsSession: AuthSession = {
  mode: "http-only-cookie",
  storesTokenInClient: false,
  user: {
    displayName: "Learner One",
    email: "learner@example.com",
    role: "student"
  }
};

export const trainerAnalyticsSession: AuthSession = {
  mode: "http-only-cookie",
  storesTokenInClient: false,
  user: {
    displayName: "Trainer One",
    email: "trainer@example.com",
    role: "teacher"
  }
};

export const tenantAdminAnalyticsSession: AuthSession = {
  mode: "http-only-cookie",
  storesTokenInClient: false,
  user: {
    displayName: "Tenant Admin",
    email: "tenant-admin@example.com",
    role: "tenant_admin"
  }
};

export const globalAdminAnalyticsSession: AuthSession = {
  mode: "http-only-cookie",
  storesTokenInClient: false,
  user: {
    displayName: "Global Admin",
    email: "global-admin@example.com",
    role: "global_admin"
  }
};

export const backendLearnerAnalyticsResponse = {
  average_score: 86.4,
  completed_quizzes: 8,
  read_documents_count: 5,
  recent_activity: [
    {
      action: "quiz_submitted",
      created_at: "2026-06-05T08:30:00.000Z",
      details_summary: "Submitted laboratory safety quiz"
    },
    {
      action: "chat_question",
      created_at: "2026-06-04T15:00:00.000Z",
      details_summary: "Asked AI Tutor about citations"
    }
  ],
  recent_scores: [
    {
      exam_id: "exam-1",
      filename: "Laboratory Safety.pdf",
      id: "score-1",
      score: 92,
      submitted_at: "2026-06-05T08:30:00.000Z"
    }
  ],
  score_trend: [
    {
      average_score: 78,
      date: "2026-06-03"
    },
    {
      average_score: 86,
      date: "2026-06-05"
    }
  ],
  skill_breakdown: [
    {
      attempts: 3,
      average_score: 91,
      file_id: "file-safe",
      filename: "Laboratory Safety.pdf"
    },
    {
      attempts: 2,
      average_score: 74,
      file_id: "file-cite",
      filename: "Citation Practice.pdf"
    }
  ],
  streak_days: 4
};

export const backendTrainerAnalyticsResponse = {
  average_tenant_score: 81.5,
  department_stats: [
    {
      label: "ready_documents",
      value: 12
    },
    {
      label: "processing_documents",
      value: 2
    }
  ],
  score_trend: [
    {
      average_score: 77,
      date: "2026-06-01"
    },
    {
      average_score: 82,
      date: "2026-06-05"
    }
  ],
  skill_gaps: [
    {
      description: "Learners miss evidence-backed answers.",
      error_rate: 38,
      incorrect_count: 19,
      topic: "Citation reasoning",
      total_attempts: 50
    }
  ],
  total_employees: 42,
  total_quizzes_taken: 64
};

export const backendTrainerStudentsResponse = [
  {
    average_score: 91,
    completed_quizzes: 6,
    email: "learner-one@example.com",
    full_name: "Learner One",
    last_active_at: "2026-06-05T07:45:00.000Z",
    user_id: "learner-1"
  },
  {
    average_score: 73,
    completed_quizzes: 3,
    email: "learner-two@example.com",
    full_name: null,
    last_active_at: null,
    user_id: "learner-2"
  }
];

export const backendAdminUsageResponse = {
  days: 30,
  total_logins: 128,
  total_uploads: 34
};

export const backendAuditLogsResponse = [
  {
    action: "file_uploaded",
    created_at: "2026-06-05T09:00:00.000Z",
    details: "Uploaded safety handbook",
    email: "teacher@example.com",
    id: "audit-1",
    ip_address: "203.0.113.10",
    user_id: "user-1"
  },
  {
    action: "tenant_updated",
    created_at: "2026-06-04T11:20:00.000Z",
    details: null,
    email: null,
    id: "audit-2",
    ip_address: null,
    user_id: null
  }
];
