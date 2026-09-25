import type { Context } from "../../context";
import type { AuthModel } from "./model";

export abstract class AuthService {
  static privateData(ctx: Context): AuthModel.PrivateData {
    return {
      message: "This is private",
      user: ctx.session?.user,
    };
  }
}
