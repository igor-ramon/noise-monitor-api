import { FastifyInstance } from "fastify";
import { picoAudioRoutes } from "../modules/picoAudio/presentation/http/controller/routes";

export async function registerRoutes(app: FastifyInstance) {
  await app.register(picoAudioRoutes, { prefix: "api" });
}
