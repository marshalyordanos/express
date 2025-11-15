// dispatch.cron.ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DispatchRepository } from './dispatch.repository';
import { AppLogger } from '../../common/app-logger.service';

@Injectable()
export class DispatchScheduler {
  constructor(
    private readonly dispatchRepo: DispatchRepository,
    private readonly logger: AppLogger,
  ) {}

  // Runs every minute — expires any PENDING + expiredAt < now
  @Cron(CronExpression.EVERY_MINUTE)
  async autoExpire() {
    this.logger.log('Running auto-expiration job...');

    try {
      const result = await this.dispatchRepo.expireAllExpiredPending();
      if (result.count > 0) {
        this.logger.warn(`Expired ${result.count} old assignment requests`);
      }
    } catch (e) {
      this.logger.error('Cron expiration failed', e.stack);
    }
  }
}
