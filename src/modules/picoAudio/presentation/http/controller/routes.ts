import { FastifyInstance } from "fastify";

import { picoAudioController } from "./picoAudio.controller";
import { downloadSpectrogramController } from "./downloadSpectrogram.controller";

export async function picoAudioRoutes(app: FastifyInstance) {
  app.get("/pico-alert/download/:filename", downloadSpectrogramController);
  app.post("/pico-alert", picoAudioController);
}
