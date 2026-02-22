import { makeDownloadSpectrogramUseCase } from "@main/container/picoAudio.container";
import { FastifyReply, FastifyRequest } from "fastify";

import fs from "fs";

export async function downloadSpectrogramController(
  request: FastifyRequest<{ Params: { filename: string } }>,
  reply: FastifyReply,
) {
  try {
    const { filename } = request.params;

    const useCase = makeDownloadSpectrogramUseCase();

    const filepath = await useCase.execute(filename);

    reply
      .header("Content-Disposition", `attachment; filename="${filename}"`)
      .type("image/png");

    return reply.send(fs.createReadStream(filepath));
  } catch (err) {
    return reply.code(404).send({ error: "File not found" });
  }
}
