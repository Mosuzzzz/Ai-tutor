import { authRouteHandlers } from "../_lib/authBffHandlers";

export const runtime = "nodejs";

export const GET = authRouteHandlers.session;
