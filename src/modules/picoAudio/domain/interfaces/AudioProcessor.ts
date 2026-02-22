export interface AudioProcessor {
  generateSpectrogram(wavPath: string, device?: string): Promise<string>;
}
