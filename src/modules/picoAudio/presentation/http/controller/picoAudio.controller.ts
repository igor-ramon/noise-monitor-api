import { makeProcessPicoAudioUseCase } from "@main/container/picoAudio.container";
import { FastifyReply, FastifyRequest } from "fastify";

export async function picoAudioController(request: FastifyRequest, reply: FastifyReply) {
  try {
    const parts = request.parts();
    // const file = await request.file();

    let buffer: Buffer | null = null;
    let filename = "";
    let device: string | undefined;

    for await (const part of parts) {
      if (part.type === "file") {
        buffer = await part.toBuffer();
        filename = part.filename;
      }

      if (part.type === "field" && part.fieldname === "device") {
        device = part.value as string;
      }
    }
// console.log(request, buffer, device, filename, file, 'file')
    if (!buffer) {
      return reply.code(400).send({ error: "File missing" });
    }

    const useCase = makeProcessPicoAudioUseCase();

    const result = await useCase.execute({
      buffer,
      filename: filename,
      device,
    });

    return reply.send({
      spectrogramPath: result,
    });
  } catch (err) {
    console.error(err);
    return reply.code(500).send({ error: "Processing failed" });
  }
}
