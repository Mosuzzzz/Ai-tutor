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
  chatHistoryApiPath,
  chatHistoryResponseSchema
} from "./aiChatContract";
import {
  isAiChatSummaryEmpty,
  selectChatDocumentForHistory,
  toAiChatSummaryViewModel
} from "./aiChatMapper";
import type { AiChatSummaryStatus, AiChatSummaryViewModel } from "./types";

export type AiChatBackendRequest = <TResponse>(
  options: BackendJsonRequestOptions<TResponse>
) => Promise<TResponse>;

type ServerCookieStore = {
  get: (name: string) => { value: string } | undefined;
};

type LoadAiChatSummaryOptions = {
  backendRequest?: AiChatBackendRequest;
  cookieStore?: ServerCookieStore;
  historyLimit?: number;
  historySkip?: number;
  selectedDocumentId?: string;
  session: AuthSession;
};

export type AiChatSummaryLoadResult =
  | {
      chat: AiChatSummaryViewModel;
      status: Exclude<AiChatSummaryStatus, "error" | "loading">;
    }
  | {
      errorMessage: string;
      status: "error";
    };

export const loadAiChatSummaryForSession = async ({
  backendRequest = backendJsonRequest,
  cookieStore,
  historyLimit = 30,
  historySkip = 0,
  selectedDocumentId,
  session
}: LoadAiChatSummaryOptions): Promise<AiChatSummaryLoadResult> => {
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

    if (isAiChatSummaryEmpty(documentsResponse)) {
      return {
        chat: toAiChatSummaryViewModel({
          documentsResponse,
          history: [],
          selectedDocumentId,
          session
        }),
        status: "empty"
      };
    }

    const selectedDocument = selectChatDocumentForHistory(documentsResponse, selectedDocumentId);
    const history = await backendRequest({
      accessToken,
      path: chatHistoryApiPath({
        fileId: selectedDocument?.id,
        limit: historyLimit,
        skip: historySkip
      }),
      schema: chatHistoryResponseSchema
    });

    return {
      chat: toAiChatSummaryViewModel({
        documentsResponse,
        history,
        selectedDocumentId,
        session
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
