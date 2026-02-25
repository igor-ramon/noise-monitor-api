export interface ProcessPicoAudioDTO {
  buffer: Buffer;
  filename: string;
  device?: string;
}