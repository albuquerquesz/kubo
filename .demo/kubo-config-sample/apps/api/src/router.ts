import { publicProcedure, router } from "../index";
import { healthModule } from "./modules/health";

export const appRouter = router({
  healthCheck: healthModule,
});
export type AppRouter = typeof appRouter;
