import { buildApp } from "./app";
import { registerRoutes } from "./routes";

async function start() {
  const app = await buildApp();

  await registerRoutes(app);

  await app.listen({ port: 3000, host: "0.0.0.0" });
}

start();
