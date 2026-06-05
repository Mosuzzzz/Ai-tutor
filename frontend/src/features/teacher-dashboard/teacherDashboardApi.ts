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
  TEACHER_DASHBOARD_API_PATH,
  TEACHER_STUDENTS_API_PATH,
  teacherDashboardResponseSchema,
  teacherStudentsResponseSchema
} from "./teacherDashboardContract";
import {
  isTeacherDashboardResponseEmpty,
  toTeacherDashboardViewModel
} from "./teacherDashboardMapper";
import type { TeacherDashboardStatus, TeacherDashboardViewModel } from "./types";

export type TeacherDashboardBackendRequest = <TResponse>(
  options: BackendJsonRequestOptions<TResponse>
) => Promise<TResponse>;

type ServerCookieStore = {
  get: (name: string) => { value: string } | undefined;
};

type LoadTeacherDashboardOptions = {
  backendRequest?: TeacherDashboardBackendRequest;
  cookieStore?: ServerCookieStore;
  session: AuthSession;
  timestamp?: Date;
};

export type TeacherDashboardLoadResult =
  | {
      dashboard: TeacherDashboardViewModel;
      status: Exclude<TeacherDashboardStatus, "error" | "loading">;
    }
  | {
      errorMessage: string;
      status: "error";
    };

export const loadTeacherDashboardForSession = async ({
  backendRequest = backendJsonRequest,
  cookieStore,
  session,
  timestamp
}: LoadTeacherDashboardOptions): Promise<TeacherDashboardLoadResult> => {
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
    const dashboard = await backendRequest({
      accessToken,
      path: TEACHER_DASHBOARD_API_PATH,
      schema: teacherDashboardResponseSchema
    });
    const students = await backendRequest({
      accessToken,
      path: TEACHER_STUDENTS_API_PATH,
      schema: teacherStudentsResponseSchema
    });
    const viewModel = toTeacherDashboardViewModel({
      dashboard,
      session,
      students,
      timestamp
    });

    return {
      dashboard: viewModel,
      status: isTeacherDashboardResponseEmpty({ dashboard, students }) ? "empty" : "ready"
    };
  } catch (error) {
    return {
      errorMessage: mapApiErrorToMessage(error),
      status: "error"
    };
  }
};
