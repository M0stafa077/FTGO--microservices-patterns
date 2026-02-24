import { MissingHeader } from '../errors/missing-header.js';

import { HeaderName } from './header-name.js';

export class MessageHeaders {
  private constructor(private readonly values: ReadonlyMap<HeaderName, string>) {}

  public static empty(): MessageHeaders {
    return new MessageHeaders(new Map());
  }

  public static from(record: Readonly<Record<string, string>>): MessageHeaders {
    return new MessageHeaders(
      new Map(
        Object.values(HeaderName).flatMap((name): [HeaderName, string][] => {
          const value = record[name];
          return value === undefined ? [] : [[name, value]];
        }),
      ),
    );
  }

  public with(name: HeaderName, value: string): MessageHeaders {
    return new MessageHeaders(new Map([...this.values, [name, value]]));
  }

  public including(other: MessageHeaders): MessageHeaders {
    return new MessageHeaders(new Map([...this.values, ...other.values]));
  }

  public find(name: HeaderName): string | undefined {
    return this.values.get(name);
  }

  public get(name: HeaderName): string {
    const value = this.values.get(name);
    if (value === undefined) {
      throw new MissingHeader(name);
    }
    return value;
  }

  public toRecord(): Readonly<Record<string, string>> {
    return Object.fromEntries(this.values);
  }
}
