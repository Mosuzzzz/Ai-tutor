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
  documentLibraryResponseSchema
} from "../document-summary/documentSummaryContract";
import {
  examDetailApiPath,
  examResponseSchema
} from "./quizGeneratorContract";
import {
  isQuizGeneratorEmpty,
  toQuizGeneratorViewModel
} from "./quizGeneratorMapper";
import type { QuizGeneratorStatus, QuizGeneratorViewModel } from "./types";

export type QuizGeneratorBackendRequest = <TResponse>(
  options: BackendJsonRequestOptions<TResponse>
) => Promise<TResponse>;

type ServerCookieStore = {
  get: (name: string) => { value: string } | undefined;
};

type LoadQuizGeneratorOptions = {
  backendRequest?: QuizGeneratorBackendRequest;
  cookieStore?: ServerCookieStore;
  selectedDocumentId?: string;
  selectedExamId?: string;
  session: AuthSession;
  timestamp?: Date;
};

export type QuizGeneratorLoadResult =
  | {
      quiz: QuizGeneratorViewModel;
      status: Exclude<QuizGeneratorStatus, "error" | "loading">;
    }
  | {
      errorMessage: string;
      status: "error";
    };

export const loadQuizGeneratorForSession = async ({
  backendRequest = backendJsonRequest,
  cookieStore,
  selectedDocumentId,
  selectedExamId,
  session,
  timestamp
}: LoadQuizGeneratorOptions): Promise<QuizGeneratorLoadResult> => {
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
    const documentsResponse = await backendRequest({
      accessToken,
      path: DOCUMENTS_DASHBOARD_API_PATH,
      schema: documentLibraryResponseSchema
    });

    if (isQuizGeneratorEmpty(documentsResponse)) {
      return {
        quiz: toQuizGeneratorViewModel({
          documentsResponse,
          selectedDocumentId,
          session,
          timestamp
        }),
        status: "empty"
      };
    }

    const examResponse = selectedExamId
      ? await backendRequest({
          accessToken,
          path: examDetailApiPath(selectedExamId),
          schema: examResponseSchema
        })
      : undefined;

    return {
      quiz: toQuizGeneratorViewModel({
        documentsResponse,
        examResponse,
        selectedDocumentId,
        session,
        timestamp
      }),
      status: "ready"
    };
  } catch (error) {
    return {
      errorMessage: mapApiErrorToMessage(error),
      status: "error"
    };
  }
};
