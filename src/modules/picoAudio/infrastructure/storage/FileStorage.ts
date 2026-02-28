import fs from "fs";
import path from "path";

export class FileStorage {
  private dir = "recordings";

  async save(buffer: Buffer, filename: string) {
    await fs.promises.mkdir(this.dir, { recursive: true });

    const filepath = path.join(this.dir, filename);
    await fs.promises.writeFile(filepath, buffer);

    return filepath;
  }

  async exists(filepath: string): Promise<boolean> {
    try {
      await fs.promises.access(filepath);
      return true;
    } catch {
      return false;
    }
  }

  async delete(filepath: string) {
    if (await this.exists(filepath)) {
      await fs.promises.unlink(filepath);
    }
  }

  async deleteAll() {
    try {
      const files = await fs.promises.readdir(this.dir);

      await Promise.all(
        files.map((file) =>
          fs.promises.unlink(path.join(this.dir, file))
        )
      );

      return files.length;
    } catch {
      return 0;
    }
  }
}