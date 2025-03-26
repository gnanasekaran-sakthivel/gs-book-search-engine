import express from "express";
import db from "./config/connection.js";
import { getTimestamp } from "./utils/helpers.js";
import { Request } from "express"; // Import Request type

import path from "node:path";

import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { typeDefs, resolvers } from "./schemas/index.js";
import { authenticateToken } from "./utils/auth.js";

import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

//import { ApolloServerPlugin, BaseContext } from "@apollo/server";

/*
export interface Context extends BaseContext {
  user?: {
    id: string;
    username: string;
    email: string;
  };
}

const myPlugin: ApolloServerPlugin<Context> = {
  async serverWillStart(_service) {
    console.log("Server starting...");
    return {
      async drainServer() {
        console.log("Server draining...");
      },
    };
  },
};
*/

const apolloConfig = {
  typeDefs,
  resolvers,
  //plugins: [myPlugin],
  context: ({ req }: { req: Request }) => {
    console.log(
      `[${getTimestamp()}] GraphQL request: ${req.method} ${req.url}`
    );
    return {};
  },
};

const apolloServer = new ApolloServer(apolloConfig);

const startServer = async () => {
  await apolloServer.start();

  await db();

  const PORT = process.env.PORT || 3001;
  const expressApplication = express();

  expressApplication.use(express.urlencoded({ extended: true }));
  expressApplication.use(express.json());

  expressApplication.use((req, _res, next) => {
    console.log(
      `[${getTimestamp()}] Incoming request: ${req.method} ${req.url}`
    );
    console.log(`Headers:`, req.headers);
    console.log(`Body:`, JSON.stringify(req.body));
    next();
  });

  expressApplication.use(
    "/graphql",
    expressMiddleware(apolloServer as any, {
      context: authenticateToken as any,
    })
  );

  // if we're in production, serve client/build as static assets
  if (process.env.NODE_ENV === "production") {
    expressApplication.use(
      express.static(path.join(__dirname, "../client/build"))
    );

    expressApplication.get("*", (_req, res) => {
      res.sendFile(path.join(__dirname, "../client/dist/index.html"));
    });
  }

  expressApplication.listen(PORT, () => {
    console.log(`API server running on port ${PORT}!`);
    console.log(`Use GraphQL at http://localhost:${PORT}/graphql`);
  });
};

await startServer();
