import { Value } from 'typebox/value';

import { OrderId } from './entities/order-id.js';
import { InvalidPageToken } from './errors/invalid-page-token.js';
import { PagePosition } from './page-position.js';
import { PageTokenContent } from './schemas/page-token-content.schema.js';

export class PageToken {
  private constructor(public readonly position: PagePosition) {}

  public static of(position: PagePosition): PageToken {
    return new PageToken(position);
  }

  public static parse(text: string): PageToken {
    const content = PageToken.decode(text);
    if (!Value.Check(PageTokenContent, content)) {
      throw new InvalidPageToken();
    }
    return new PageToken(PagePosition.of(new Date(content.createdAt), OrderId.of(content.orderId)));
  }

  private static decode(text: string): unknown {
    try {
      const content: unknown = JSON.parse(Buffer.from(text, 'base64url').toString('utf8'));
      return content;
    } catch (error) {
      throw new InvalidPageToken({ cause: error });
    }
  }

  public toString(): string {
    const content: PageTokenContent = {
      createdAt: this.position.createdAt.toISOString(),
      orderId: this.position.orderId.toString(),
    };
    return Buffer.from(JSON.stringify(content)).toString('base64url');
  }
}
