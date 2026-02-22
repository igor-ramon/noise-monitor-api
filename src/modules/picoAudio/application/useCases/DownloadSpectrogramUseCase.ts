import { FileStorageProcessor } from "@modules/picoAudio/domain/interfaces/FileStorageProcess";

export class DownloadSpectrogramUseCase {
  constructor(private storage: FileStorageProcessor) {}

  async execute(filename: string): Promise<string> {
    const filepath = `recordings/${filename}`;

    const exists = await this.storage.exists(filepath);

    if (!exists) {
      throw new Error("File not found");
    }

    return filepath;
  }
}
