import { Clock, Transactions } from '@ftgo/common';
import { Inject, Injectable } from '@nestjs/common';

import { Couriers } from './couriers.js';
import type { CourierId } from './entities/courier-id.js';
import { Courier } from './entities/courier.entity.js';

@Injectable()
export class CouriersService {
  public constructor(
    @Inject(Couriers) private readonly couriers: Couriers,
    @Inject(Transactions) private readonly transactions: Transactions,
    @Inject(Clock) private readonly clock: Clock,
  ) {}

  public async updateAvailability(id: CourierId, isAvailable: boolean): Promise<Courier> {
    return this.transactions.run(async () => {
      const courier = await this.findOrJoin(id);
      const now = this.clock.now();
      if (isAvailable) {
        courier.noteAvailable(now);
      } else {
        courier.noteUnavailable(now);
      }
      await this.couriers.update(courier);
      return courier;
    });
  }

  private async findOrJoin(id: CourierId): Promise<Courier> {
    const courier = await this.couriers.findById(id);
    if (courier !== undefined) {
      return courier;
    }
    await this.couriers.addIfAbsent(Courier.join(id, this.clock.now()));
    return this.couriers.getById(id);
  }
}
