import { FileStorageProcessor } from "@modules/picoAudio/domain/interfaces/FileStorageProcess";
export class ClearRecordingsUseCase {
  constructor(private storage: FileStorageProcessor) {}

  async execute() {
    const result = await this.storage.deleteAll();
    return {
        deleted: result
    }
  }
}