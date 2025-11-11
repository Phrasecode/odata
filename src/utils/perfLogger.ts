import { Logger } from './logger';

const MILLISECONDS_TO_SECONDS = 1000;
const NANOSECONDS_TO_MILLISECONDS = 1000000;

export class PerfLogger {
  private startTime: [number, number] | undefined;

  public end(): number {
    if (!this.startTime) {
      Logger.getLogger().error('PerfLogger not started');
      return 0;
    }
    const elapsed: number =
      process.hrtime(this.startTime)[0] * MILLISECONDS_TO_SECONDS +
      process.hrtime(this.startTime)[1] / NANOSECONDS_TO_MILLISECONDS;
    return elapsed;
  }

  public start(): void {
    this.startTime = process.hrtime();
  }
}
