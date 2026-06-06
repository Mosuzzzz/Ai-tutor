import { quizRouteHandlers } from "../../_lib/quizBffHandlers";

export const runtime = "nodejs";

type QuizPublishRouteContext = {
  params: Promise<{
    examId: string;
  }>;
};

export const POST = async (request: Request, context: QuizPublishRouteContext) => {
  const { examId } = await context.params;
  return quizRouteHandlers.publish(request, { examId });
};
