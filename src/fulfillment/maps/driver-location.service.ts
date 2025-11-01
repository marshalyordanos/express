import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../../redis/redis.service';
import { PrismaService } from '../../prisma/prisma.service';
import { WebSocketEventService } from '../../websocket/services/websocket-event.service';

export interface NearbyDriver {
  driverId: string;
  distanceKm: number;
  coordinates: { lat: number; lon: number };
}

interface RankedDriver {
  driverId: string; // actual Driver PK
  userId: string; // userId
  distanceKm: number;
  currentLat: number;
  currentLon: number;
  activeOrders: number;
  lastUpdated: Date;
  score: number; // computed rank
}

@Injectable()
export class DriverLocationService {
  private readonly GEO_KEY = 'drivers:locations';
  private readonly LOCATION_TTL_SECONDS = 300; // expire after 5 min if no updates
  private readonly STATUS_PERSIST_MINUTES = 3; // persist driver status every 3 min
  private readonly LOCATION_LOG_INTERVAL_SECONDS = 120; // 2 minutes for location logs
  private readonly logger = new Logger(DriverLocationService.name);

  constructor(
    private readonly redisService: RedisService,
    private readonly prisma: PrismaService,
    // private readonly mapGateway: MapLocationGateway,
    @Inject(forwardRef(() => WebSocketEventService))
    private websocketEventService: WebSocketEventService,
  ) {
    this.onlineEmitter = this.websocketEventService.emitDriverStatus.bind(this.websocketEventService);
  }
 
  // -------------------------------
  // CRON: Sync location and offline detection
  // -------------------------------
  // @Cron('*/2 * * * *') // every 2 minutes
  // async handleCron() {
  //   try {
  //     await this.syncToDatabase();
  //     await this.updateOfflineDrivers();
  //   } catch (err) {
  //     this.logger.error('Cron job failed:', err);
  //   }
  // }

  /**
   * Update driver location in Redis + store log in DB
   */
  async updateDriverLocation(data: {
    driverId: string;
    lon: number;
    lat: number;
    speed?: number;
    heading?: number;
  }): Promise<void> {
    const client = this.redisService.getClient();

    try {
      // Pipeline for better performance
      const pipeline = client.multi();

      // GEO + HSET (atomic)
      pipeline.geoAdd(this.GEO_KEY, {
        longitude: data.lon,
        latitude: data.lat,
        member: data.driverId,
      });

      pipeline.hSet(`driver:${data.driverId}:location`, {
        lon: data.lon.toString(),
        lat: data.lat.toString(),
        speed: data.speed?.toString() ?? '',
        heading: data.heading?.toString() ?? '',
        updatedAt: new Date().toISOString(),
        status: 'ONLINE', // mark online in Redis
      });

      pipeline.expire(
        `driver:${data.driverId}:location`,
        this.LOCATION_TTL_SECONDS,
      );

      // Mark driver online key with TTL (for offline detection)
      pipeline.set(`driver:${data.driverId}:online`, '1', {
        EX: this.STATUS_PERSIST_MINUTES * 60,
      });

      await pipeline.exec();
      // ✅ Emit online event to gateway if available
      if (this.onlineEmitter) {
        this.onlineEmitter(data.driverId, 'ONLINE');
      }

      // ✅ New: notify subscribed customers
      this.websocketEventService.emitDriverLocationToSubscribers({
        driverId: data.driverId,
        lat: data.lat,
        lon: data.lon,
        speed: data.speed,
        heading: data.heading,
      });
    } catch (err) {
      this.logger.error(
        `Failed to update location for driver ${data.driverId}`,
        err,
      );
    }
  }

  // provide a setter for the gateway to pass a callback
  onlineEmitter: (driverId: string, status?: 'ONLINE' | 'OFFLINE') => void;

  setOnlineEmitter(fn: (driverId: string) => void) {
    this.onlineEmitter = fn;
  }
  /**
   * Find drivers near a coordinate (uses GEOSEARCH)
   */
  async findNearbyDrivers(
    lon: number,
    lat: number,
    radiusKm: number,
  ): Promise<any[]> {
    const client = this.redisService.getClient();
    const rawDrivers = (await client.sendCommand([
      'GEOSEARCH',
      this.GEO_KEY,
      'FROMLONLAT',
      lon.toString(),
      lat.toString(),
      'BYRADIUS',
      radiusKm.toString(),
      'km',
      'WITHDIST',
      'WITHCOORD',
    ])) as any[];

    if (!Array.isArray(rawDrivers) || rawDrivers.length === 0) return [];

    // Map Redis response
    const drivers: NearbyDriver[] = rawDrivers.map((d: any) => ({
      driverId: d[0], // Redis driverId is actually User ID
      distanceKm: parseFloat(d[1]),
      coordinates: {
        lon: parseFloat(d[2][0]),
        lat: parseFloat(d[2][1]),
      },
    }));

    // ✅ Fetch real Driver records using userId
    const driverRecords = await this.prisma.driver.findMany({
      where: {
        userId: { in: drivers.map((d) => d.driverId) },
        status: 'ONLINE',
      },
      include: {
        user: {
          include: {
            pickupOrders: {
              where: { status: { in: ['ASSIGNED', 'OUT_FOR_DELIVERY'] } },
              select: { id: true },
            },
            deliveryOrders: {
              where: { status: { in: ['ASSIGNED', 'OUT_FOR_DELIVERY'] } },
              select: { id: true },
            },
          },
        },
      },
    });

    const rankedDrivers: RankedDriver[] = driverRecords.map((d) => {
      const geo = drivers.find((g) => g.driverId === d.userId)!;
      const activeOrders =
        (d.user?.pickupOrders?.length || 0) +
        (d.user?.deliveryOrders?.length || 0);

      const distanceScore = 1 / (geo.distanceKm + 0.1);
      const workloadScore = 1 / (activeOrders + 1);
      const lastUpdatedScore =
        d.updatedAt &&
        new Date().getTime() - d.updatedAt.getTime() < 5 * 60 * 1000
          ? 1
          : 0.5;

      return {
        driverId: d.id,
        userId: d.userId,
        distanceKm: geo.distanceKm,
        currentLat: geo.coordinates.lat,
        currentLon: geo.coordinates.lon,
        activeOrders,
        lastUpdated: d.updatedAt,
        score:
          distanceScore * 0.6 + workloadScore * 0.3 + lastUpdatedScore * 0.1,
      };
    });

    // Sort by score descending and take top N
    return rankedDrivers
      .sort((a, b) => b.score - a.score)
      .map((d) => ({
        driverId: d.driverId,
        userId: d.userId,
        distanceKm: d.distanceKm,
        currentLat: d.currentLat,
        currentLon: d.currentLon,
        activeOrders: d.activeOrders,
        lastUpdated: d.lastUpdated,
        score: d.score,
      }));
  }

  async syncToDatabase() {
    const client = this.redisService.getClient();
    const driverUserIds = await client.zRange(this.GEO_KEY, 0, -1);

    for (const userId of driverUserIds) {
      const data = await client.hGetAll(`driver:${userId}:location`);
      if (Object.keys(data).length === 0) continue;

      const lat = parseFloat(data.lat);
      const lon = parseFloat(data.lon);
      const speed = data.speed ? parseFloat(data.speed) : 0;
      const heading = data.heading ? parseFloat(data.heading) : 0;
      const status = (data.status as 'ONLINE' | 'OFFLINE') || 'OFFLINE';

      // 1️⃣ Find and update the Driver using userId
      const driver = await this.prisma.driver.findUnique({
        where: { userId },
        select: { id: true, updatedAt: true, status: true },
      });

      if (!driver) {
        console.warn(`⚠️ No driver found for userId: ${userId}`);
        continue;
      }

      // Persist driver status every 3 min
      const now = new Date();
      if (
        !driver.updatedAt ||
        (now.getTime() - driver.updatedAt.getTime()) / 1000 >
          this.STATUS_PERSIST_MINUTES * 60
      ) {
        await this.prisma.driver.update({
          where: { userId },
          data: {
            currentLat: lat,
            currentLon: lon,
            updatedAt: now,
            status,
          },
        });
      }

      // Persist location log every 2 minutes

      const lastLog = await this.prisma.driverLocationLog.findFirst({
        where: { driverId: driver.id },
        orderBy: { timestamp: 'desc' },
      });

      if (
        !lastLog ||
        (now.getTime() - lastLog.timestamp.getTime()) / 1000 >
          this.LOCATION_LOG_INTERVAL_SECONDS
      ) {
        await this.prisma.driverLocationLog.create({
          data: {
            driverId: driver.id,
            latitude: lat,
            longitude: lon,
            speed,
            heading,
          },
        });
      }
    }

    // console.log(`✅ Synced ${driverUserIds.length} driver locations to DB`);
  }

  // -------------------------------
  // Check drivers that are offline (no Redis TTL)
  // -------------------------------
  async updateOfflineDrivers() {
    const client = this.redisService.getClient();

    try {
      const driverUserIds = await client.zRange(this.GEO_KEY, 0, -1);
      const offlineDriverIds: string[] = [];

      for (const userId of driverUserIds) {
        const isOnline = await client.exists(`driver:${userId}:online`);
        if (!isOnline) offlineDriverIds.push(userId);
      }

      if (offlineDriverIds.length === 0) return;

      // Bulk update in Prisma
      await this.prisma.driver.updateMany({
        where: { userId: { in: offlineDriverIds } },
        data: { status: 'OFFLINE', updatedAt: new Date() },
      });
      // Emit offline events
      offlineDriverIds.forEach((driverId) => {
        if (this.onlineEmitter) this.onlineEmitter(driverId, 'OFFLINE');
      });

      console.log('Emited offline envents : ');

      this.logger.log(`✅ Marked ${offlineDriverIds.length} drivers OFFLINE`);
    } catch (err) {
      this.logger.error('Error updating offline drivers:', err);
    }
  }

  /**
   * Marks a driver as offline in Redis and Prisma DB.
   * Also emits an offline event to the gateway callback if available.
   * @param driverId - The userId of the driver to mark as offline.
   */
  async markOfflineByDriverId(driverId: string) {
    // Update Redis
    const client = this.redisService.getClient();
    await client.del(`driver:${driverId}:online`);

    // Update DB
    await this.prisma.driver.updateMany({
      where: { userId: driverId },
      data: { status: 'OFFLINE', updatedAt: new Date() },
    });

    // Emit via gateway callback
    if (this.onlineEmitter) {
      this.onlineEmitter(driverId, 'OFFLINE'); // gateway decides offline/online
    }
  }
}
