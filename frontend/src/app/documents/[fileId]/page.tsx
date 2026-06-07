import { notFound } from "next/navigation";

import { AppShell } from "../../AppShell";
import { requirePageSession } from "@/features/auth/authGuard";
import { loadDocumentSummaryDetailForSession } from "@/features/document-summary/documentSummaryApi";
import { DocumentSummaryDetailPage } from "@/features/document-summary/DocumentSummaryDetailPage";
import { normalizeDocumentRouteId } from "@/features/document-summary/documentSummaryHelpers";

export const dynamic = "force-dynamic";

type DocumentSummaryDetailRouteProps = {
  params: Promise<{
    fileId?: string;
  }>;
};

const DocumentSummaryDetailRoute = async ({ params }: DocumentSummaryDetailRouteProps) => {
  const { fileId } = await params;
  const selectedDocumentId = normalizeDocumentRouteId(fileId);

  if (!selectedDocumentId) {
    notFound();
  }

  const session = await requirePageSession("/documents");
  const detailResult = await loadDocumentSummaryDetailForSession({
    selectedDocumentId,
    session
  });

  return (
    <AppShell session={session}>
      <DocumentSummaryDetailPage
        dashboard={"dashboard" in detailResult ? detailResult.dashboard : undefined}
        dataSource="api"
        errorMessage={"errorMessage" in detailResult ? detailResult.errorMessage : undefined}
        status={detailResult.status}
      />
    </AppShell>
  );
};

export default DocumentSummaryDetailRoute;
