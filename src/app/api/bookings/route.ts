import { defaultDeps } from "@/lib/booking/deps";
import { createBookingHandlers } from "@/lib/booking/handlers";

// The handlers are built from their dependencies so the tests can run them with an
// in-memory store and a fixed clock; here they are bound to the live services.
const handlers = createBookingHandlers(defaultDeps());

export const GET = handlers.GET;
export const POST = handlers.POST;
