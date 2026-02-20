export class Logger {
  static info(msg: string) {
    console.log(`\x1b[34mℹ️ [INFO]\x1b[0m ${msg}`);
  }
  static warn(msg: string) {
    console.log(`\x1b[33m⚠️ [WARN]\x1b[0m ${msg}`);
  }
  static error(msg: string, err?: any) {
    console.log(`\x1b[31m❌ [ERROR]\x1b[0m ${msg}`);
    if (err) console.error(err);
  }
}
