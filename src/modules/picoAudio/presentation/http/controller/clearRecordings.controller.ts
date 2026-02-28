import { FastifyReply, FastifyRequest } from "fastify";
import { makeClearRecordingsUseCase } from "@main/container/picoAudio.container";

export async function clearRecordingsController(
  _request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const useCase = makeClearRecordingsUseCase();
    const result = await useCase.execute();

    return reply.send({
      success: true,
      deletedFiles: result.deleted,
    });
  } catch (err) {
    console.error(err);
    return reply.code(500).send({
      error: "Failed to clear recordings",
    });
  }
}