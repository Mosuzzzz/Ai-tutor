import { AiQuizGeneratorPage } from "../../features/ai-quiz-generator/AiQuizGeneratorPage";
import { AppShell } from "../AppShell";
import { requirePageSession } from "@/features/auth/authGuard";
import { loadQuizGeneratorForSession } from "@/features/ai-quiz-generator/quizGeneratorApi";

export const dynamic = "force-dynamic";

const QuizPage = async () => {
  const session = await requirePageSession("/quiz");
  const quizResult = await loadQuizGeneratorForSession({
    session
  });

  return (
    <AppShell session={session}>
      <AiQuizGeneratorPage
        dataSource="api"
        errorMessage={"errorMessage" in quizResult ? quizResult.errorMessage : undefined}
        quiz={"quiz" in quizResult ? quizResult.quiz : undefined}
        status={quizResult.status}
      />
    </AppShell>
  );
};

export default QuizPage;
