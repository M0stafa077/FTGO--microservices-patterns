import { InvalidInput } from '@ftgo/common';

import type { HeaderName } from '../envelope/header-name.js';

export class MissingHeader extends InvalidInput {
  public constructor(name: HeaderName) {
    super('message.missing_header', `The message has no "${name}" header.`);
  }
}
