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
  STUDENT_DASHBOARD_API_PATH,
  studentDashboardResponseSchema
} from "./studentDashboardContract";
import {
  isStudentDashboardResponseEmpty,
  toStudentDashboardViewModel
} from "./studentDashboardMapper";
import type { StudentDashboardStatus, StudentDashboardViewModel } from "./types";

export type StudentDashboardBackendRequest = <TResponse>(
  options: BackendJsonRequestOptions<TResponse>
) => Promise<TResponse>;

type ServerCookieStore = {
  get: (name: string) => { value: string } | undefined;
};

type LoadStudentDashboardOptions = {
  backendRequest?: StudentDashboardBackendRequest;
  cookieStore?: ServerCookieStore;
  session: AuthSession;
  timestamp?: Date;
};

export type StudentDashboardLoadResult =
  | {
      dashboard: StudentDashboardViewModel;
      status: Exclude<StudentDashboardStatus, "error" | "loading">;
    }
  | {
      errorMessage: string;
      status: "error";
    };

export const loadStudentDashboardForSession = async ({
  backendRequest = backendJsonRequest,
  cookieStore,
  session,
  timestamp
}: LoadStudentDashboardOptions): Promise<StudentDashboardLoadResult> => {
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
    const response = await backendRequest({
      accessToken,
      path: STUDENT_DASHBOARD_API_PATH,
      schema: studentDashboardResponseSchema
    });
    const dashboard = toStudentDashboardViewModel({
      response,
      session,
      timestamp
    });

    return {
      dashboard,
      status: isStudentDashboardResponseEmpty(response) ? "empty" : "ready"
    };
  } catch (error) {
    return {
      errorMessage: mapApiErrorToMessage(error),
      status: "error"
    };
  }
};
