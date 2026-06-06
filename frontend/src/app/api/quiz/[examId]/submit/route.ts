import { quizRouteHandlers } from "../../_lib/quizBffHandlers";

export const runtime = "nodejs";

type QuizSubmitRouteContext = {
  params: Promise<{
    examId: string;
  }>;
};

export const POST = async (request: Request, context: QuizSubmitRouteContext) => {
  const { examId } = await context.params;
  return quizRouteHandlers.submit(request, { examId });
};
