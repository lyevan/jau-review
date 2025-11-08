/* HANDLERS */
import { auth_handlers } from "@/app/_tests/handlers/auth.handlers";
import { user_handlers } from "@/app/_tests/handlers/user.handler";

export const handlers = [...auth_handlers, ...user_handlers];
