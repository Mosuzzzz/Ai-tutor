import { AiQuizGeneratorPage } from "../../features/ai-quiz-generator/AiQuizGeneratorPage";
import { AppShell } from "../AppShell";
import { requirePageSession } from "@/features/auth/authGuard";
import { loadQuizGeneratorForSession } from "@/features/ai-quiz-generator/quizGeneratorApi";

export const dynamic = "force-dynamic";

type QuizPageProps = {
  searchParams?:
    | Promise<{
        documentId?: string | string[];
        examId?: string | string[];
      }>
    | {
        documentId?: string | string[];
        examId?: string | string[];
      };
};

const QuizPage = async ({ searchParams }: QuizPageProps = {}) => {
  const session = await requirePageSession("/quiz");
  const { selectedDocumentId, selectedExamId } = await resolveQuizSearchParams(searchParams);
  const quizResult = await loadQuizGeneratorForSession({
    ...(selectedDocumentId ? { selectedDocumentId } : {}),
    ...(selectedExamId ? { selectedExamId } : {}),
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

const resolveQuizSearchParams = async (searchParams: QuizPageProps["searchParams"]) => {
  const params = await searchParams;
  const documentId = Array.isArray(params?.documentId) ? params.documentId[0] : params?.documentId;
  const examId = Array.isArray(params?.examId) ? params.examId[0] : params?.examId;
  const normalizedDocumentId = documentId?.trim();
  const normalizedExamId = examId?.trim();

  return {
    selectedDocumentId: normalizedDocumentId || undefined,
    selectedExamId: normalizedExamId || undefined
  };
};
