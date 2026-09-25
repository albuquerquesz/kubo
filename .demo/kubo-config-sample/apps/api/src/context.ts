import type { Context as HonoContext } from "hono";

export type CreateContextOptions = {
  context: HonoContext;
};

export async function createContext(_options: CreateContextOptions) {
  return {
    auth: null,
    session: null,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
