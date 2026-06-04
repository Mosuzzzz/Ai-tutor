import { AppShell } from "../AppShell";
import { requirePageSession } from "@/features/auth/authGuard";
import { DocumentSummaryPage } from "../../features/document-summary/DocumentSummaryPage";

export const dynamic = "force-dynamic";

const DocumentsPage = async () => {
  const session = await requirePageSession("/documents");

  return (
    <AppShell session={session}>
      <DocumentSummaryPage />
    </AppShell>
  );
};

export default DocumentsPage;
