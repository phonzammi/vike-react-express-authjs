import { User } from "@auth/core/types";

declare global {
  namespace Express {
    interface Request {
      user?: User | null;
    }
  }
  namespace Vike {
    interface PageContext {
      user?: User | null;
    }
  }
}

// Tell TypeScript that this file isn't an ambient module
export {};
