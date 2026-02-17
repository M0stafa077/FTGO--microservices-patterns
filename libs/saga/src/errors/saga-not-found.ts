import { ResourceNotFound } from '@ftgo/common';

export class SagaNotFound extends ResourceNotFound {
  public constructor(sagaId: string) {
    super('saga.not_found', `Saga ${sagaId} does not exist.`);
  }
}
