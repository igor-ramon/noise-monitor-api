export interface FileStorageProcessor {
  save(buffer: Buffer, filename: string): Promise<string>;
  exists(path: string): Promise<boolean>;
}
