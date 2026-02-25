import { AudioProcessor } from "@modules/picoAudio/domain/interfaces/AudioProcessor";
import { FileStorageProcessor } from "@modules/picoAudio/domain/interfaces/FileStorageProcess";
import { ProcessPicoAudioDTO } from "../dto/ProcessPicoAudioDTO";
import { ProcessPicoAudioOutputDTO } from "../dto/ProcessPicoAudioOutputDTO";

export class ProcessPicoAudioUseCase {
  constructor(
    private storage: FileStorageProcessor,
    private audioProcessor: AudioProcessor,
  ) {}

  async execute(input: ProcessPicoAudioDTO): Promise<ProcessPicoAudioOutputDTO> {
    const filepath = await this.storage.save(input.buffer, input.filename);

    const spectrogramPath =
      await this.audioProcessor.generateSpectrogram(
        filepath,
        input.device,
      );

    return {
      spectrogramPath,
    };
  }
}
