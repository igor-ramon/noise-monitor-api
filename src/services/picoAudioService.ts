import fs from "fs-extra";
import path from "path";
import { spawn } from "child_process";
import { Logger } from "../utils/Logger";

export class PicoAudioService {
  private recordingsDir = "recordings";

  constructor() {
    fs.ensureDirSync(this.recordingsDir);
  }

  async processWav(wavPath: string, device?: string) {
    try {
      const timestamp = Date.now();

      const finalWav = path.join(
        this.recordingsDir,
        `pico_${device || "unknown"}_${timestamp}.wav`,
      );

      const pngFile = finalWav.replace(".wav", ".png");
      await fs.move(wavPath, finalWav, { overwrite: true });

      await this.generateSpectrogram(finalWav, pngFile);

      Logger.info(`📊 Spectrum generated: ${pngFile}`);

      return pngFile;
    } catch (err) {
      Logger.error("Error processing WAV", err);
    }
  }

  private generateSpectrogram(wav: string, png: string) {
    return new Promise<void>((resolve, reject) => {
      
      const ffmpeg = spawn("ffmpeg", [
        "-y",
        "-i", wav,
        "-lavfi",
        "highpass=f=80,showspectrumpic=s=1024x512:legend=1:scale=log:fscale=lin:win_func=hann:drange=120",
        png,
      ]);

      ffmpeg.stderr.on("data", (d) => console.log("ffmpeg:", d.toString()));

      ffmpeg.on("close", (code) =>
        code === 0 ? resolve() : reject(new Error(`ffmpeg exit ${code}`)),
      );
    });
  }
}
