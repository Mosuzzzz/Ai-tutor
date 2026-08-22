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
  DOCUMENTS_DASHBOARD_API_PATH,
  documentLibraryResponseSchema,
  type DocumentLibraryResponse
} from "../document-summary/documentSummaryContract";
import {
  STUDY_DASHBOARD_API_PATH,
  studyDashboardResponseSchema,
  type StudyDashboardResponse
} from "./studyDashboardContract";
import { isStudyDashboardDataEmpty, toStudyDashboardViewModel } from "./studyDashboardMapper";
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
      status: Exclude<StudyDashboardStatus, "error">;
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
        new ApiClientError({ code: "unauthorized", message: "Missing access cookie" })
      ),
      status: "error"
    };
  }

  const [analyticsResult, documentsResult] = await Promise.allSettled([
    Promise.resolve().then(() => backendRequest<StudyDashboardResponse>({
      accessToken,
      path: STUDY_DASHBOARD_API_PATH,
      schema: studyDashboardResponseSchema
    })),
    Promise.resolve().then(() => backendRequest<DocumentLibraryResponse>({
      accessToken,
      path: DOCUMENTS_DASHBOARD_API_PATH,
      schema: documentLibraryResponseSchema
    }))
  ]);

  if (analyticsResult.status === "rejected" && documentsResult.status === "rejected") {
    return {
      errorMessage: "ไม่สามารถโหลดแดชบอร์ดได้ในขณะนี้",
      status: "error"
    };
  }

  const analytics = analyticsResult.status === "fulfilled" ? analyticsResult.value : undefined;
  const documents = documentsResult.status === "fulfilled" ? documentsResult.value : undefined;
  const dashboard = toStudyDashboardViewModel({ analytics, documents, session, timestamp });

  return {
    dashboard,
    status:
      analytics && documents
        ? isStudyDashboardDataEmpty({ analytics, documents })
          ? "empty"
          : "ready"
        : "partial"
  };
};
