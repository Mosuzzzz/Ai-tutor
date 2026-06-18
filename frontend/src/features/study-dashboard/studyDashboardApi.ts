import { cookies } from "next/headers";

import { AUTH_COOKIE_NAMES } from "../../lib/api/authCookies";
import {
  ApiClientError,
  backendJsonRequest,
  mapApiErrorToMessage,
  type BackendJsonRequestOptions
} from "../../lib/api/backendClient";
import type { AuthSession } from "../auth/types";
import { STUDY_DASHBOARD_API_PATH, studyDashboardResponseSchema } from "./studyDashboardContract";
import { isStudyDashboardResponseEmpty, toStudyDashboardViewModel } from "./studyDashboardMapper";
import type { StudyDashboardStatus, StudyDashboardViewModel } from "./types";

export type StudyDashboardBackendRequest = <TResponse>(
  options: BackendJsonRequestOptions<TResponse>
) => Promise<TResponse>;

type ServerCookieStore = {
  get: (name: string) => { value: string } | undefined;
};

type LoadStudyDashboardOptions = {
  backendRequest?: StudyDashboardBackendRequest;
  cookieStore?: ServerCookieStore;
  session: AuthSession;
  timestamp?: Date;
};

export type StudyDashboardLoadResult =
  | {
      dashboard: StudyDashboardViewModel;
      status: Exclude<StudyDashboardStatus, "error" | "loading">;
    }
  | {
      errorMessage: string;
      status: "error";
    };

export const loadStudyDashboardForSession = async ({
  backendRequest = backendJsonRequest,
  cookieStore,
  session,
  timestamp
}: LoadStudyDashboardOptions): Promise<StudyDashboardLoadResult> => {
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
      path: STUDY_DASHBOARD_API_PATH,
      schema: studyDashboardResponseSchema
    });
    const dashboard = toStudyDashboardViewModel({
      response,
      session,
      timestamp
    });

    return {
      dashboard,
      status: isStudyDashboardResponseEmpty(response) ? "empty" : "ready"
    };
  } catch (error) {
    return {
      errorMessage: mapApiErrorToMessage(error),
      status: "error"
    };
  }
};
