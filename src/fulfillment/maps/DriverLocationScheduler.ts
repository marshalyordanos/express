import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { DriverLocationService } from './driver-location.service';
import { Logger } from '@nestjs/common';

@Injectable()
export class DriverLocationScheduler {
  private readonly logger = new Logger(DriverLocationScheduler.name);

  constructor(private readonly driverLocationService: DriverLocationService) {}

  @Cron('*/2 * * * *') // every 2 minutes
  async handleCron() {
    try {
      await this.driverLocationService.syncToDatabase();
      await this.driverLocationService.updateOfflineDrivers();
    } catch (err) {
      this.logger.error(`Cron job failed: ${err.message}`, err.stack);
    }
  }
}
