import type { SessionId } from '../entities/session-id.js';
import type { Session } from '../entities/session.entity.js';

export interface Sessions {
  findById(id: SessionId): Promise<Session | undefined>;

  add(session: Session): Promise<void>;

  update(session: Session): Promise<void>;
}
export const Sessions = Symbol('Sessions');
