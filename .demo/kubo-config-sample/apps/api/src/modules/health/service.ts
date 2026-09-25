import type { HealthModel } from "./model";

export abstract class HealthService {
  static status(): HealthModel.Status {
    return "OK";
  }
}
