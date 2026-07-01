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
  documentDetailApiPath,
  documentDetailResponseSchema,
  documentLibraryResponseSchema,
  fileStatusApiPath,
  fileStatusResponseSchema,
  recapApiPath,
  recapResponseSchema,
  type DocumentDetailResponse,
  type RecapResponse
} from "./documentSummaryContract";
import {
  isDocumentLibraryEmpty,
  selectDocumentForDetail,
  toDocumentSummaryViewModel
} from "./documentSummaryMapper";
import type { DocumentSummaryStatus, DocumentSummaryViewModel } from "./types";

export type DocumentSummaryBackendRequest = <TResponse>(
  options: BackendJsonRequestOptions<TResponse>
) => Promise<TResponse>;

type ServerCookieStore = {
  get: (name: string) => { value: string } | undefined;
};

type LoadDocumentSummaryOptions = {
  backendRequest?: DocumentSummaryBackendRequest;
  cookieStore?: ServerCookieStore;
  selectedDocumentId?: string;
  session: AuthSession;
  strictSelectedDocument?: boolean;
  timestamp?: Date;
};

export type DocumentSummaryLoadResult =
  | {
      dashboard: DocumentSummaryViewModel;
      status: Exclude<DocumentSummaryStatus, "error" | "loading">;
    }
  | {
      errorMessage: string;
      status: "error";
    };

export const loadDocumentSummaryForSession = async ({
  backendRequest = backendJsonRequest,
  cookieStore,
  selectedDocumentId,
  session,
  strictSelectedDocument = false,
  timestamp
}: LoadDocumentSummaryOptions): Promise<DocumentSummaryLoadResult> => {
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
      path: DOCUMENTS_DASHBOARD_API_PATH,
      schema: documentLibraryResponseSchema
    });

    if (isDocumentLibraryEmpty(dashboard)) {
      return {
        dashboard: toDocumentSummaryViewModel({
          dashboard,
          selectedDocumentId,
          session,
          timestamp
        }),
        status: "empty"
      };
    }

    if (
      strictSelectedDocument &&
      selectedDocumentId &&
      !dashboard.documents.some((document) => document.id === selectedDocumentId)
    ) {
      return {
        errorMessage: "ไม่พบเอกสารหรือคุณไม่มีสิทธิ์เข้าถึง",
        status: "error"
      };
    }

    const selectedDocument = selectDocumentForDetail(dashboard, selectedDocumentId);
    const details: DocumentDetailResponse[] = [];
    const recaps: RecapResponse[] = [];

    if (selectedDocument) {
      const detail = await backendRequest({
        accessToken,
        path: documentDetailApiPath(selectedDocument.id),
        schema: documentDetailResponseSchema
      });

      await backendRequest({
        accessToken,
        path: fileStatusApiPath(selectedDocument.id),
        schema: fileStatusResponseSchema
      });

      details.push(detail);

      if (detail.status === "ready" && !detail.summary_markdown) {
        const recap = await loadOrGenerateRecap({
          accessToken,
          backendRequest,
          fileId: selectedDocument.id
        });

        if (recap) {
          recaps.push(recap);
        }
      }
    }

    return {
      dashboard: toDocumentSummaryViewModel({
        dashboard,
        details,
        recaps,
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

export const loadDocumentSummaryDetailForSession = async (
  options: Omit<LoadDocumentSummaryOptions, "strictSelectedDocument"> & {
    selectedDocumentId: string;
  }
) => {
  return loadDocumentSummaryForSession({
    ...options,
    strictSelectedDocument: true
  });
};

const loadOrGenerateRecap = async ({
  accessToken,
  backendRequest,
  fileId
}: {
  accessToken: string;
  backendRequest: DocumentSummaryBackendRequest;
  fileId: string;
}) => {
  try {
    return await backendRequest({
      accessToken,
      path: recapApiPath(fileId),
      schema: recapResponseSchema
    });
  } catch (error) {
    if (!(error instanceof ApiClientError && error.code === "not_found")) {
      throw error;
    }
  }

  return backendRequest({
    accessToken,
    body: { detail_level: "executive" },
    method: "POST",
    path: recapApiPath(fileId),
    schema: recapResponseSchema
  });
};
