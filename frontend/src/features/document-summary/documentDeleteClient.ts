import { z } from "zod";

type DocumentDeleteFetch = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

export type DocumentDeleteSuccess = {
  document: {
    id: string;
  };
  message: string;
  ok: true;
};

export type DocumentDeleteFailure = {
  message: string;
  ok: false;
};

export type DocumentDeleteResult = DocumentDeleteSuccess | DocumentDeleteFailure;

const GENERIC_DELETE_ERROR = "ไม่สามารถลบเอกสารได้ในขณะนี้";

const documentDeleteSuccessSchema = z.object({
  document: z.object({
    id: z.string().min(1)
  }),
  message: z.string().min(1),
  ok: z.literal(true)
});

const documentDeleteFailureSchema = z.object({
  message: z.string().min(1),
  ok: z.literal(false)
});

const documentDeleteBffPath = (fileId: string) => `/api/documents/${encodeURIComponent(fileId)}`;

export const deleteDocumentFromLibrary = async (
  fileId: string,
  fetcher: DocumentDeleteFetch = globalThis.fetch.bind(globalThis)
): Promise<DocumentDeleteResult> => {
  const safeFileId = fileId.trim();

  if (!safeFileId) {
    return createDeleteFailure();
  }

  try {
    const response = await fetcher(documentDeleteBffPath(safeFileId), {
      credentials: "same-origin",
      headers: {
        Accept: "application/json"
      },
      method: "DELETE"
    });
    const payload = await readJsonBody(response);
    const successResult = documentDeleteSuccessSchema.safeParse(payload);

    if (response.ok && successResult.success) {
      return successResult.data;
    }

    const failureResult = documentDeleteFailureSchema.safeParse(payload);

    if (failureResult.success) {
      return failureResult.data;
    }

    return createDeleteFailure();
  } catch {
    return createDeleteFailure();
  }
};

const readJsonBody = async (response: Response) => {
  try {
    return (await response.json()) as unknown;
  } catch {
    return undefined;
  }
};

const createDeleteFailure = (): DocumentDeleteFailure => {
  return {
    message: GENERIC_DELETE_ERROR,
    ok: false
  };
};
