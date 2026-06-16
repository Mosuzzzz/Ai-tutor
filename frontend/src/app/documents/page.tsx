import { AppShell } from "../AppShell";
import { requirePageSession } from "@/features/auth/authGuard";
import { loadDocumentSummaryForSession } from "@/features/document-summary/documentSummaryApi";
import { DocumentSummaryPage } from "../../features/document-summary/DocumentSummaryPage";

export const dynamic = "force-dynamic";

const DOCUMENT_UPLOAD_ROLES = new Set(["user", "admin"]);

const DocumentsPage = async () => {
  const session = await requirePageSession("/documents");
  const dashboardResult = await loadDocumentSummaryForSession({
    session
  });

  return (
    <AppShell session={session}>
      <DocumentSummaryPage
        canUploadDocuments={DOCUMENT_UPLOAD_ROLES.has(session.user.role)}
        dashboard={"dashboard" in dashboardResult ? dashboardResult.dashboard : undefined}
        dataSource="api"
        errorMessage={"errorMessage" in dashboardResult ? dashboardResult.errorMessage : undefined}
        status={dashboardResult.status}
      />
    </AppShell>
  );
};

export default DocumentsPage;
