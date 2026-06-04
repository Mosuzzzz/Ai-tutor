import { AiChatSummaryPage } from "../../features/ai-chat/AiChatSummaryPage";
import { AppShell } from "../AppShell";
import { requirePageSession } from "@/features/auth/authGuard";

export const dynamic = "force-dynamic";

const ChatPage = async () => {
  const session = await requirePageSession("/chat");

  return (
    <AppShell session={session}>
      <AiChatSummaryPage />
    </AppShell>
  );
};

export default ChatPage;
