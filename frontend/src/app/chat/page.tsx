import { AiChatSummaryPage } from "../../features/ai-chat/AiChatSummaryPage";
import { AppShell } from "../AppShell";
import { requirePageSession } from "@/features/auth/authGuard";
import { loadAiChatSummaryForSession } from "@/features/ai-chat/aiChatApi";

export const dynamic = "force-dynamic";

const ChatPage = async () => {
  const session = await requirePageSession("/chat");
  const chatResult = await loadAiChatSummaryForSession({
    session
  });

  return (
    <AppShell session={session}>
      <AiChatSummaryPage
        chat={"chat" in chatResult ? chatResult.chat : undefined}
        dataSource="api"
        errorMessage={"errorMessage" in chatResult ? chatResult.errorMessage : undefined}
        status={chatResult.status}
      />
    </AppShell>
  );
};

export default ChatPage;
