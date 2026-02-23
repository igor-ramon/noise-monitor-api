import { makeProcessPicoAudioUseCase } from "@main/container/picoAudio.container";
import { FastifyReply, FastifyRequest } from "fastify";

export async function picoAudioController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    let buffer: Buffer | null = null;
    let filename = `iot_${Date.now()}.wav`;
    let device: string | undefined;

    if (request.isMultipart?.()) {
      const parts = request.parts();

      for await (const part of parts) {
        if (part.type === "file") {
          buffer = await part.toBuffer();
          filename = part.filename;
        }

        if (part.type === "field" && part.fieldname === "device") {
          device = part.value as string;
        }
      }
    }

    else {
      buffer = request.body as Buffer;
      device = request.headers["x-device-id"] as string | undefined;
    }

    if (!buffer) {
      return reply.code(400).send({ error: "File missing" });
    }

    const useCase = makeProcessPicoAudioUseCase();

    const result = await useCase.execute({
      buffer,
      filename,
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