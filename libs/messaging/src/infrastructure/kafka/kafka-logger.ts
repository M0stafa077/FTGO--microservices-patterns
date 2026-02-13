import { KafkaJS } from '@confluentinc/kafka-javascript';
import { Logger } from '@nestjs/common';

export class KafkaLogger implements KafkaJS.Logger {
  private readonly logger = new Logger('Kafka');
  private level = KafkaJS.logLevel.WARN;

  public info(message: string, extra?: object): void {
    if (this.level >= KafkaJS.logLevel.INFO) {
      this.logger.log({ ...extra }, message);
    }
  }

  public error(message: string, extra?: object): void {
    if (this.level >= KafkaJS.logLevel.ERROR) {
      this.logger.error({ ...extra }, message);
    }
  }

  public warn(message: string, extra?: object): void {
    if (this.level >= KafkaJS.logLevel.WARN) {
      this.logger.warn({ ...extra }, message);
    }
  }

  public debug(message: string, extra?: object): void {
    if (this.level >= KafkaJS.logLevel.DEBUG) {
      this.logger.debug({ ...extra }, message);
    }
  }

  public namespace(): KafkaJS.Logger {
    return this;
  }

  public setLogLevel(level: KafkaJS.logLevel): void {
    this.level = level;
  }
}
