import { AiChatSummaryPage } from "../../features/ai-chat/AiChatSummaryPage";
import { AppShell } from "../AppShell";
import { requirePageSession } from "@/features/auth/authGuard";
import { loadAiChatSummaryForSession } from "@/features/ai-chat/aiChatApi";

export const dynamic = "force-dynamic";

type ChatPageProps = {
  searchParams?:
    | Promise<{
        documentId?: string | string[];
      }>
    | {
        documentId?: string | string[];
      };
};

const ChatPage = async ({ searchParams }: ChatPageProps = {}) => {
  const session = await requirePageSession("/chat");
  const selectedDocumentId = await resolveSelectedDocumentId(searchParams);
  const chatResult = await loadAiChatSummaryForSession({
    ...(selectedDocumentId ? { selectedDocumentId } : {}),
    session
  });

  return (
    <AppShell session={session}>
      <AiChatSummaryPage
        chat={"chat" in chatResult ? chatResult.chat : undefined}
        dataSource="api"
        errorMessage={"errorMessage" in chatResult ? chatResult.errorMessage : undefined}
        selectedDocumentId={selectedDocumentId}
        status={chatResult.status}
      />
    </AppShell>
  );
};

export default ChatPage;

const resolveSelectedDocumentId = async (searchParams: ChatPageProps["searchParams"]) => {
  const params = await searchParams;
  const documentId = Array.isArray(params?.documentId) ? params.documentId[0] : params?.documentId;
  const normalizedDocumentId = documentId?.trim();

  return normalizedDocumentId || undefined;
};
