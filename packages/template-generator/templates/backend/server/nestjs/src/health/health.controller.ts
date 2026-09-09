import { Controller, Get } from "@nestjs/common";

@Controller("api")
export class HealthController {
  @Get("health")
  getHealth(): { status: "ok" } {
    return { status: "ok" };
  }
}
