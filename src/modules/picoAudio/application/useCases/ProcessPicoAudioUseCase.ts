import { AudioProcessor } from "@modules/picoAudio/domain/interfaces/AudioProcessor";
import { FileStorageProcessor } from "@modules/picoAudio/domain/interfaces/FileStorageProcess";

export class ProcessPicoAudioUseCase {
  constructor(
    private storage: FileStorageProcessor,
    private audioProcessor: AudioProcessor,
  ) {}

  async execute(input: { buffer: Buffer; filename: string; device?: string }) {
    const filepath = await this.storage.save(input.buffer, input.filename);

    return this.audioProcessor.generateSpectrogram(filepath, input.device);
  }
}
