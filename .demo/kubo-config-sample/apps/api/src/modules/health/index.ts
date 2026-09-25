import { publicProcedure } from "../../index";
import { HealthService } from "./service";

export const healthModule = publicProcedure.query(() => HealthService.status());
