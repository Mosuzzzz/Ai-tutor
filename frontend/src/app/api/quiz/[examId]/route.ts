import { quizRouteHandlers } from "../_lib/quizBffHandlers";

export const runtime = "nodejs";

type QuizExamRouteContext = {
  params: Promise<{
    examId: string;
  }>;
};

export const GET = async (request: Request, context: QuizExamRouteContext) => {
  const { examId } = await context.params;
  return quizRouteHandlers.detail(request, { examId });
};

export const PUT = async (request: Request, context: QuizExamRouteContext) => {
  const { examId } = await context.params;
  return quizRouteHandlers.update(request, { examId });
};
