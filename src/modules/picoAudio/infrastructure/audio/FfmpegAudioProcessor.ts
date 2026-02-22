import fs from "fs-extra";
import path from "path";
import { spawn } from "child_process";
import { AudioProcessor } from "@modules/picoAudio/domain/interfaces/AudioProcessor";

export class FfmpegAudioProcessor implements AudioProcessor {
  private recordingsDir = "recordings";

  constructor() {
    fs.ensureDirSync(this.recordingsDir);
  }

  async generateSpectrogram(wavPath: string, device?: string): Promise<string> {
    const timestamp = Date.now();

    const finalWav = path.join(
      this.recordingsDir,
      `pico_${device || "unknown"}_${timestamp}.wav`,
    );

    const pngFile = finalWav.replace(".wav", ".png");

    await fs.move(wavPath, finalWav, { overwrite: true });

    await this.runFfmpeg(finalWav, pngFile);

    return pngFile;
  }

  private runFfmpeg(wav: string, png: string) {
    return new Promise<void>((resolve, reject) => {
      const ffmpeg = spawn("ffmpeg", [
        "-y",
        "-i",
        wav,
        "-lavfi",
        "showspectrumpic=s=1024x512:legend=1:scale=log:fscale=lin:win_func=hann:drange=120",
        png,
      ]);

      ffmpeg.on("close", (code) =>
        code === 0 ? resolve() : reject(new Error(`ffmpeg exit ${code}`)),
      );
    });
  }
}
