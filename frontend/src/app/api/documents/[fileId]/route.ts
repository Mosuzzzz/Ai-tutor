import { documentRouteHandlers } from "../_lib/documentBffHandlers";

export const runtime = "nodejs";

type DocumentRouteContext = {
  params: Promise<{
    fileId: string;
  }>;
};

export const DELETE = async (request: Request, context: DocumentRouteContext) => {
  const { fileId } = await context.params;

  return documentRouteHandlers.delete(request, { fileId });
};
