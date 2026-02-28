import { ClearRecordingsUseCase } from "@modules/picoAudio/application/useCases/ClearRecordingsUseCase";
import { DownloadSpectrogramUseCase } from "../../modules/picoAudio/application/useCases/DownloadSpectrogramUseCase";
import { ProcessPicoAudioUseCase } from "../../modules/picoAudio/application/useCases/ProcessPicoAudioUseCase";
import { FfmpegAudioProcessor } from "../../modules/picoAudio/infrastructure/audio/FfmpegAudioProcessor";
import { FileStorage } from "../../modules/picoAudio/infrastructure/storage/FileStorage";

const storage = new FileStorage();

export function makeProcessPicoAudioUseCase() {
  const processor = new FfmpegAudioProcessor();
  return new ProcessPicoAudioUseCase(storage, processor);
}

export function makeDownloadSpectrogramUseCase() {
  return new DownloadSpectrogramUseCase(storage);
}

export function makeClearRecordingsUseCase() {
  return new ClearRecordingsUseCase(storage);
}