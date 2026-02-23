import { InvalidInput } from '@ftgo/common';

export class InvalidPageToken extends InvalidInput {
  public constructor(options?: ErrorOptions) {
    super(
      'order_history.invalid_page_token',
      'The page token is not valid. Use the nextPageToken of the previous page.',
      [],
      options,
    );
  }
}
