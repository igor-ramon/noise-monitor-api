import { exec } from "child_process";
import { Logger } from "./Logger";

export class FFmpegUtils {
  static convertRawToWav(input: string, output: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const cmd = `ffmpeg -y -f s16le -ar 48000 -ac 2 -i ${input} ${output}`;
      exec(cmd, (err) => {
        if (err) return reject(err);
        Logger.info(`🎵 WAV generated: ${output}`);
        resolve();
      });
    });
  }

  static generateSpectrogram(input: string, output: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const cmd = `ffmpeg -y -i ${input} -lavfi showspectrumpic=s=1280x720:legend=1 ${output}`;
      exec(cmd, (err) => {
        if (err) return reject(err);
        Logger.info(`🌈 Spectrogram generated: ${output}`);
        resolve();
      });
    });
  }
}
