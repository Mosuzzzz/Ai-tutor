import { documentRouteHandlers } from "../../_lib/documentBffHandlers";

export const runtime = "nodejs";

type DocumentStatusRouteContext = {
  params: Promise<{
    fileId: string;
  }>;
};

export const GET = async (request: Request, context: DocumentStatusRouteContext) => {
  const { fileId } = await context.params;
  return documentRouteHandlers.status(request, { fileId });
};
