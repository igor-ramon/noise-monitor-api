import fs from "fs";
import path from "path";

export class FileStorage {
  async save(buffer: Buffer, filename: string) {
    const dir = "recordings";
    await fs.promises.mkdir(dir, { recursive: true });

    const filepath = path.join(dir, filename);
    await fs.promises.writeFile(filepath, buffer);

    return filepath;
  }
  async exists(path: string): Promise<boolean> {
    try {
      await fs.promises.access(path);
      return true;
    } catch {
      return false;
    }
  }
}
