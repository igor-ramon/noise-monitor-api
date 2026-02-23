import fs from "fs-extra";
import path from "path";
import { spawn } from "child_process";
import { AudioProcessor } from "@modules/picoAudio/domain/interfaces/AudioProcessor";
import { Logger } from "@shared/logger/Logger";

export class FfmpegAudioProcessor implements AudioProcessor {
  private recordingsDir = "recordings";

  constructor() {
    fs.ensureDirSync(this.recordingsDir);
    Logger.info(`[AudioProcessor] recordings dir ready: ${this.recordingsDir}`);
  }

  async generateSpectrogram(wavPath: string, device?: string): Promise<string> {
    const start = Date.now();
    const timestamp = Date.now();

    Logger.info(`[AudioProcessor] Starting spectrogram generation`);
    Logger.info(`Input WAV: ${wavPath}`);
    Logger.info(`Device: ${device ?? "unknown"}`);

    const finalWav = path.join(
      this.recordingsDir,
      `pico_${device || "unknown"}_${timestamp}.wav`
    );

    const pngFile = finalWav.replace(".wav", ".png");

    Logger.info(`Moving file -> ${finalWav}`);
    await fs.move(wavPath, finalWav, { overwrite: true });

    await this.runFfmpeg(finalWav, pngFile);

    Logger.info(`📊 Spectrum generated: ${pngFile}`);
    Logger.info(
      `[AudioProcessor] Done in ${Date.now() - start}ms`
    );

    return pngFile;
  }

  private runFfmpeg(wav: string, png: string) {
    return new Promise<void>((resolve, reject) => {
      Logger.info(`[FFmpeg] Running spectrogram`);
      Logger.info(`Input: ${wav}`);
      Logger.info(`Output: ${png}`);

      const ffmpeg = spawn("ffmpeg", [
        "-y",
        "-i",
        wav,
        "-lavfi",
        "showspectrumpic=s=1024x512:legend=1:scale=log:fscale=lin:win_func=hann:drange=120",
        png,
      ]);

      ffmpeg.stdout.on("data", (data) => {
        Logger.info(`[FFmpeg stdout] ${data}`);
      });

      ffmpeg.stderr.on("data", (data) => {
        Logger.info(`[FFmpeg stderr] ${data}`);
      });

      ffmpeg.on("error", (err) => {
        Logger.error("[FFmpeg] Process error", err);
        reject(err);
      });

      ffmpeg.on("close", (code) => {
        Logger.info(`[FFmpeg] Exit code: ${code}`);
        code === 0
          ? resolve()
          : reject(new Error(`ffmpeg exit ${code}`));
      });
    });
  }
}