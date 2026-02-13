import type { IncomingMessage } from '../../../envelope/incoming-message.js';
import { InvalidMessageHandler } from '../../../errors/invalid-message-handler.js';

export class HandlerMethod {
  public constructor(
    private readonly instance: object,
    private readonly name: string,
  ) {}

  public async invoke(message: IncomingMessage<unknown>): Promise<unknown> {
    const method: unknown = Reflect.get(this.instance, this.name);
    if (typeof method !== 'function') {
      throw new InvalidMessageHandler(`Message handler "${this.name}" is not a method.`);
    }
    const result: unknown = await Reflect.apply(method, this.instance, [message]);
    return result;
  }

  public toString(): string {
    return `${this.instance.constructor.name}.${this.name}`;
  }
}
