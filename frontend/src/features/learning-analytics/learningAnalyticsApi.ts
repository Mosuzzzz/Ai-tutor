import { cookies } from "next/headers";

import { AUTH_COOKIE_NAMES } from "../../lib/api/authCookies";
import {
  ApiClientError,
  backendJsonRequest,
  mapApiErrorToMessage,
  type BackendJsonRequestOptions
} from "../../lib/api/backendClient";
import type { AuthSession } from "../auth/types";
import {
  ADMIN_AUDIT_LOGS_API_PATH,
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
  isLearningAnalyticsResponseEmpty,
  toLearningAnalyticsViewModel
} from "./learningAnalyticsMapper";
import type { LearningAnalyticsStatus, LearningAnalyticsViewModel } from "./types";

export type LearningAnalyticsBackendRequest = <TResponse>(
  options: BackendJsonRequestOptions<TResponse>
) => Promise<TResponse>;

type ServerCookieStore = {
  get: (name: string) => { value: string } | undefined;
};

type LoadLearningAnalyticsOptions = {
  backendRequest?: LearningAnalyticsBackendRequest;
  cookieStore?: ServerCookieStore;
  session: AuthSession;
  timestamp?: Date;
  usageDays?: number;
};

export type LearningAnalyticsLoadResult =
  | {
      analytics: LearningAnalyticsViewModel;
      status: Exclude<LearningAnalyticsStatus, "error" | "loading">;
    }
  | {
      errorMessage: string;
      status: "error";
    };

export const loadLearningAnalyticsForSession = async ({
  backendRequest = backendJsonRequest,
  cookieStore,
  session,
  timestamp,
  usageDays = 30
}: LoadLearningAnalyticsOptions): Promise<LearningAnalyticsLoadResult> => {
  const store = cookieStore ?? (await cookies());
  const accessToken = store.get(AUTH_COOKIE_NAMES.accessToken)?.value;

  if (!accessToken) {
    return {
      errorMessage: mapApiErrorToMessage(
        new ApiClientError({
          code: "unauthorized",
          message: "Missing access cookie"
        })
      ),
      status: "error"
    };
  }

  try {
    if (session.user.role === "global_admin") {
      const usage = await backendRequest({
        accessToken,
        path: adminUsageApiPath(usageDays),
        schema: adminUsageResponseSchema
      });
      const auditLogs = await backendRequest({
        accessToken,
        path: ADMIN_AUDIT_LOGS_API_PATH,
        schema: adminAuditLogsResponseSchema
      });
      const analytics = toLearningAnalyticsViewModel({
        auditLogs,
        session,
        timestamp,
        usage
      });

      return {
        analytics,
        status: isLearningAnalyticsResponseEmpty({ auditLogs, usage }) ? "empty" : "ready"
      };
    }

    if (session.user.role === "teacher" || session.user.role === "tenant_admin") {
      const trainer = await backendRequest({
        accessToken,
        path: TRAINER_ANALYTICS_API_PATH,
        schema: trainerAnalyticsResponseSchema
      });
      const students = await backendRequest({
        accessToken,
        path: TRAINER_STUDENTS_API_PATH,
        schema: trainerStudentsResponseSchema
      });
      const auditLogs =
        session.user.role === "tenant_admin"
          ? await backendRequest({
              accessToken,
              path: ADMIN_AUDIT_LOGS_API_PATH,
              schema: adminAuditLogsResponseSchema
            })
          : undefined;
      const analytics = toLearningAnalyticsViewModel({
        auditLogs,
        session,
        students,
        timestamp,
        trainer
      });

      return {
        analytics,
        status: isLearningAnalyticsResponseEmpty({ auditLogs, students, trainer }) ? "empty" : "ready"
      };
    }

    const learner = await backendRequest({
      accessToken,
      path: LEARNER_ANALYTICS_API_PATH,
      schema: learnerAnalyticsResponseSchema
    });
    const analytics = toLearningAnalyticsViewModel({
      learner,
      session,
      timestamp
    });

    return {
      analytics,
      status: isLearningAnalyticsResponseEmpty({ learner }) ? "empty" : "ready"
    };
  } catch (error) {
    return {
      errorMessage: mapApiErrorToMessage(error),
      status: "error"
    };
  }
};
