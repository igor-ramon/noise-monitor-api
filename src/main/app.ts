import Fastify from "fastify";
import cors from "@fastify/cors";
import cookie from "@fastify/cookie";
import multipart from "@fastify/multipart";

export async function buildApp() {
  const app = Fastify({ logger: true });

  const isDev = process.env.NODE_ENV !== "production";

  await app.register(cors, {
    origin: isDev ? true : process.env.CORS_ORIGIN?.split(","),
    credentials: true,
  });

  await app.register(cookie);

  await app.register(multipart, {
    limits: { fileSize: 5 * 1024 * 1024 },
  });

  app.get("/health", async () => ({ status: "ok" }));

  return app;
}
