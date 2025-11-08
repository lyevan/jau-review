/* PLUGINS */
import { setupServer } from "msw/node";
/* UTILITIES */
import { handlers } from "@/app/_tests/handlers";

export const server = setupServer(...handlers);
