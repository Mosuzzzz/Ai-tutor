import { AiQuizGeneratorPage } from "../../features/ai-quiz-generator/AiQuizGeneratorPage";
import { AppShell } from "../AppShell";
import { requirePageSession } from "@/features/auth/authGuard";

export const dynamic = "force-dynamic";

const QuizPage = async () => {
  const session = await requirePageSession("/quiz");

  return (
    <AppShell session={session}>
      <AiQuizGeneratorPage />
    </AppShell>
  );
};

export default QuizPage;
