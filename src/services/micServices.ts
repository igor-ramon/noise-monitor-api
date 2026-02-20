import { spawn, ChildProcessWithoutNullStreams } from "child_process";
import fs from "fs";
import path from "path";
import FormData from "form-data";
import { Logger } from "../utils/Logger";
import { FFmpegUtils } from "../utils/FFmpegUtils";

export class MicService {
  private arecordProcess: ChildProcessWithoutNullStreams | null = null;
  private readonly ALERT_DB = -10; // dB threshold for peak
  private readonly RMS_THRESHOLD = 250; // ignore background noise
  private readonly SAMPLE_RATE = 48000;
  private readonly CHANNELS = 2;
  private readonly PRE_BUFFER_SEC = 1; // seconds before peak
  private readonly POST_BUFFER_SEC = 2; // seconds after peak
  private readonly PEAK_COOLDOWN = 2000;

  private buffer: Buffer[] = [];
  private lastPeakTime = 0;
  private bufferMaxChunks: number;

  constructor() {
    this.bufferMaxChunks = Math.ceil((this.PRE_BUFFER_SEC * 1000) / 50);
    fs.mkdirSync("recordings", { recursive: true });
  }

  private async sendAlert(db: number, spectrumFile?: string) {
    const url =
      "https://igorramonf.app.n8n.cloud/webhook-test/8ffb90b2-e20c-417c-b088-dd72af457eb9";

    try {
      if (spectrumFile) {
        const form: any = new FormData();
        form.append("level", db.toString());
        form.append("timestamp", new Date().toISOString());
        form.append("spectrum", fs.createReadStream(spectrumFile));

        await fetch(url, {
          method: "POST",
          body: form,
          headers: form.getHeaders(),
        });
        Logger.info(`✅ Alert sent to n8n with spectrum: ${spectrumFile}`);
      } else {
        const payload = { level: db, timestamp: new Date().toISOString() };
        await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        Logger.info("✅ Alert sent to n8n");
      }
    } catch (err) {
      Logger.error("Failed to send alert", err);
    }
  }

  private async saveClip(): Promise<string> {
    const preMs = this.PRE_BUFFER_SEC * 1000;
    const postMs = this.POST_BUFFER_SEC * 1000;

    const preChunks: Buffer[] = [];
    let collectedMs = 0;
    for (let i = this.buffer.length - 1; i >= 0 && collectedMs < preMs; i--) {
      preChunks.unshift(this.buffer[i]);
      collectedMs += 50;
    }

    const chunks: Buffer[] = [...preChunks];
    Logger.info(`🎬 Recording ${this.POST_BUFFER_SEC}s after peak...`);

    return new Promise<string>((resolve) => {
      const startTime = Date.now();
      const handler = (chunk: Buffer) => {
        chunks.push(chunk);
        const elapsed = Date.now() - startTime;
        if (elapsed >= postMs) {
          this.arecordProcess?.stdout.off("data", handler);

          const clipData = Buffer.concat(chunks);
          const now = new Date();

          const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}_${String(now.getHours()).padStart(2, "0")}-${String(now.getMinutes()).padStart(2, "0")}`;

          const base = path.join("recordings", `clip_${timestamp}`);
          const rawFile = `${base}.raw`;
          const wavFile = `${base}.wav`;
          const pngFile = `${base}.png`;

          fs.writeFileSync(rawFile, clipData);
          Logger.info(`💾 Clip saved: ${rawFile}`);

          FFmpegUtils.convertRawToWav(rawFile, wavFile)
            .then(() => FFmpegUtils.generateSpectrogram(wavFile, pngFile))
            .then(() => resolve(pngFile)) // return spectrum path
            .catch((err) => {
              Logger.error("Failed to generate files", err);
              resolve(pngFile);
            });
        }
      };

      this.arecordProcess?.stdout.on("data", handler);
    });
  }

  startMonitoring() {
    Logger.info("🎤 Starting noise monitoring...");

    const device = "plughw:1,7";
    this.arecordProcess = spawn("arecord", [
      "-f",
      "S16_LE",
      "-r",
      this.SAMPLE_RATE.toString(),
      "-c",
      this.CHANNELS.toString(),
      "-D",
      device,
    ]);

    this.arecordProcess.stdout.on("data", async (chunk: Buffer) => {
 
      this.buffer.push(chunk);
      if (this.buffer.length > this.bufferMaxChunks) this.buffer.shift();

      let sumSquares = 0;
      for (let i = 0; i < chunk.length; i += 2) {
        const val = chunk.readInt16LE(i);
        sumSquares += val * val;
      }
      const rms = Math.sqrt(sumSquares / (chunk.length / 2));
      if (rms < this.RMS_THRESHOLD) return;

      const db = 20 * Math.log10(rms / 32768);
      Logger.info(`Noise level: ${db.toFixed(2)} dB`);

      if (db > this.ALERT_DB) {
        const now = Date.now();
        if (now - this.lastPeakTime < this.PEAK_COOLDOWN) {
          Logger.info("🕒 Cooldown active, ignoring duplicate peak.");
          return;
        }
        this.lastPeakTime = now;

        Logger.warn(`🚨 Peak detected! (${db.toFixed(2)} dB)`);
        const spectrumFile = await this.saveClip();
        await this.sendAlert(db, spectrumFile);
      }
    });

    this.arecordProcess.stderr.on("data", (data) => {
      const msg = data.toString();
      if (
        !msg.includes("Recording WAVE") &&
        !msg.includes("rate is not accurate")
      ) {
        Logger.error("arecord stderr:", msg);
      }
    });

    this.arecordProcess.on("exit", (code) => {
      Logger.warn(`arecord exited with code ${code}`);
    });

    process.stdin.resume();
  }

  stopMonitoring() {
    if (this.arecordProcess) {
      this.arecordProcess.kill();
      this.arecordProcess = null;
      Logger.warn("🛑 Noise monitoring stopped.");
    }
  }
}
