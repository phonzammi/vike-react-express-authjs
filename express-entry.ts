import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import CredentialsProvider from "@auth/core/providers/credentials";
import { createMiddleware } from "@hattip/adapter-node";
import express, { type Request } from "express";
import { VikeAuth, VikeAuthConfig, getSession } from "vike-authjs";
import { renderPage } from "vike/server";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const isProduction = process.env.NODE_ENV === "production";
const root = __dirname;
const port = process.env.PORT ? parseInt(process.env.PORT) : 3000

const config: VikeAuthConfig = {
  basePath: "/api/auth", // needed to set if the auth route we use is other than "/auth" (default "/api/auth" in "next-auth", "/auth" with all other frameworks) 
  secret: "MY_SECRET",
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text", placeholder: "jsmith" },
        password: { label: "Password", type: "password" },
      },
      async authorize() {
        // Add logic here to look up the user from the credentials supplied
        const user = {
          id: "1",
          name: "J Smith",
          email: "jsmith@example.com",
        };

        // Any object returned will be saved in `user` property of the JWT
        // If you return null then an error will be displayed advising the user to check their details.
        // You can also Reject this callback with an Error thus the user will be sent to the error page with the error message as a query parameter
        return user ?? null;
      },
    }),
  ],
}

startServer();

async function startServer() {
  const app = express();

  if (isProduction) {
    app.use(express.static(`${root}/dist/client`));
  } else {
    // Instantiate Vite's development server and integrate its middleware to our server.
    // ⚠️ We should instantiate it *only* in development. (It isn't needed in production
    // and would unnecessarily bloat our server in production.)
    const vite = await import("vite");
    const viteDevMiddleware = (
      await vite.createServer({
        root,
        server: { middlewareMode: true },
      })
    ).middlewares;
    app.use(viteDevMiddleware);
  }

  app.use(async function (req: Request, _, next) {
    // Converting Express req headers to Fetch API's Headers
    // const headers = new Headers();
    // for (const headerName in req.headers) {
    //   const headerValue: string = req.headers[headerName]?.toString() ?? "";
    //   if (Array.isArray(headerValue)) {
    //     for (const value of headerValue) {
    //       headers.append(headerName, value);
    //     }
    //   } else {
    //     headers.append(headerName, headerValue);
    //   }
    // }

    // // Creating Fetch API's Request object from Express' req
    const request = new Request('http://localhost:3000', {
      method: req.method,
      headers: req.headers as HeadersInit, // Not sure if this is good or bad
      body: req.body
    });

    const session = await getSession(request, config)

    req.user = session?.user

    next()
  })

  const Auth = VikeAuth(config);

  app.all(
    "/api/auth/*",
    createMiddleware(Auth, {
      alwaysCallNext: false,
    }),
  );

  /**
   * Vike route
   *
   * @link {@see https://vike.dev}
   **/
  app.all("*", async (req: Request, res, next) => {
    const pageContextInit = { urlOriginal: req.originalUrl, user: req.user };

    const pageContext = await renderPage(pageContextInit);
    const { httpResponse } = pageContext;

    if (!httpResponse) {
      return next();
    } else {
      const { statusCode, headers } = httpResponse;
      headers.forEach(([name, value]) => res.setHeader(name, value));
      res.status(statusCode);
      httpResponse.pipe(res);
    }
  });

  app.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
  });
}
