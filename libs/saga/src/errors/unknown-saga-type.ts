import { ResourceNotFound } from '@ftgo/common';

export class UnknownSagaType extends ResourceNotFound {
  public constructor(sagaType: string) {
    super('saga.unknown_type', `No saga definition has the type "${sagaType}".`);
  }
}
