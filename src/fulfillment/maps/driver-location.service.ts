import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../../redis/redis.service';
import { PrismaService } from '../../prisma/prisma.service';
import { WebSocketEventService } from '../../websocket/services/websocket-event.service';
import { LogOutput } from 'concurrently';
import { ideahub } from 'googleapis/build/src/apis/ideahub';

export interface NearbyDriver {
  driverId: string;
  user: any;
  distanceKm: number;
  coordinates: { lat: number; lon: number };
}

export interface RankedDriver {
  driverId: string; // actual Driver PK
  userId: string; // userId
  user: any;
  distanceKm: number;
  currentLat: number;
  currentLon: number;
  activeOrders: number;
  lastUpdated: Date;
  score: number; // computed rank
  rank?: number;
  suggestedForOrders?: string[]; // order IDs driver is most suitable for
}

@Injectable()
export class DriverLocationService {
  private readonly GEO_KEY = 'drivers:locations';
  private readonly LOCATION_TTL_SECONDS = 300; // expire after 5 min if no updates
  private readonly STATUS_PERSIST_MINUTES = 3; // persist driver status every 3 min
  private readonly LOCATION_LOG_INTERVAL_SECONDS = 120; // 2 minutes for location logs
  private readonly logger = new Logger(DriverLocationService.name);

  /**
   * Constructor for DriverLocationService.
   * @param {RedisService} redisService
   * @param {PrismaService} prisma
   * @param {WebSocketEventService} websocketEventService
   * @description
   * This service is responsible for managing driver locations.
   * It uses Redis for storing the driver locations and Prisma for persisting the driver status.
   * It also uses WebSocketEventService for emitting driver status updates to connected clients.
   */
  constructor(
    private readonly redisService: RedisService,
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => WebSocketEventService)) //temporary fix only
    private websocketEventService: WebSocketEventService,
  ) {
    this.onlineEmitter = this.websocketEventService.emitDriverStatus.bind(
      //temporary fix only
      this.websocketEventService,
    );
  }

  // -------------------------------
  // DRIVER LOCATION UPDATE
  // -------------------------------
  async updateDriverLocation(data: {
    driverId: string;
    lon: number;
    lat: number;
    speed?: number;
    heading?: number;
  }): Promise<void> {
    const client = this.redisService.getClient();

    try {
      // Check if driver was already online in Redis
      const isOnlineAlready = await client.exists(
        `driver:${data.driverId}:online`,
      );

      console.log('IS DRVIER ONLINE ALREADY ::: ', isOnlineAlready);

      // Pipeline for atomic operations (GEO + HSET + TTL)
      const pipeline = client.multi();

      // 1️⃣ Update driver location in Redis GEO set
      pipeline.geoAdd(this.GEO_KEY, {
        longitude: data.lon,
        latitude: data.lat,
        member: data.driverId,
      });

      // 2️⃣ Store additional location info as hash
      pipeline.hSet(`driver:${data.driverId}:location`, {
        lon: data.lon.toString(),
        lat: data.lat.toString(),
        speed: data.speed?.toString() ?? '',
        heading: data.heading?.toString() ?? '',
        updatedAt: new Date().toISOString(),
        status: 'ONLINE',
      });

      // 3️⃣ Expire location info after LOCATION_TTL_SECONDS
      pipeline.expire(
        `driver:${data.driverId}:location`,
        this.LOCATION_TTL_SECONDS,
      );

      // 4️⃣ Set online key with TTL for offline detection
      pipeline.set(`driver:${data.driverId}:online`, '1', {
        EX: this.STATUS_PERSIST_MINUTES * 60,
      });

      await pipeline.exec();

      // Emit online WebSocket event
      if (this.onlineEmitter) this.onlineEmitter(data.driverId, 'ONLINE');

      // ✅ Persist in DB only when driver just came online
      if (!isOnlineAlready) {
        await this.prisma.driver.update({
          where: { userId: data.driverId },
          data: {
            status: 'ONLINE',
            updatedAt: new Date(),
            currentLat: data.lat,
            currentLon: data.lon,
          },
        });
        this.logger.log(`Driver ${data.driverId} came ONLINE — saved in DB.`);
      }

      // Notify subscribed clients (always) //temporary fix
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

  // Callback setter for WebSocket event emitter
  onlineEmitter: (driverId: string, status?: 'ONLINE' | 'OFFLINE') => void;
  setOnlineEmitter(fn: (driverId: string) => void) {
    this.onlineEmitter = fn;
  }

  // -------------------------------
  // ADVANCED FIND NEARBY DRIVERS
  // -------------------------------
  /**
   * Find nearby drivers for given orders.
   * - Handles PICKUP vs DROPOFF differently
   * - Considers batch weight, active orders, ETA, distance
   * - Returns ranked list + suggested orders per driver
   */
  // async findNearbyDrivers(
  //   orderIds: string[],
  //   radiusKm: number,
  // ): Promise<RankedDriver[]> {
  //   const client = this.redisService.getClient();

  //   // 1️⃣ Fetch orders and their coordinates
  //   const orders = await this.prisma.order.findMany({
  //     where: { id: { in: orderIds } },
  //     select: {
  //       id: true,
  //       weight: true,
  //       serviceType: true,
  //       fulfillmentType: true,
  //       pickupAddress: { select: { lat: true, long: true } },
  //       deliveryAddress: { select: { lat: true, long: true } },
  //       pickupDate: true,
  //       deliveryDate: true,
  //     },
  //   });
  //   if (!orders.length) return [];

  //   console.log('Orders fetched :::: ', orders);

  //   // 2️⃣ Compute batch weight
  //   const batchWeightKg = orders.reduce((sum, o) => sum + (o.weight || 0), 0);
  //   console.log('Orders weight kg ::: ', batchWeightKg);

  //   // 3️⃣ Determine all relevant coordinates for distance calculations
  //   const coordsForDistance: { lat: number; lon: number }[] = [];
  //   console.log('Orders coords :: ', coordsForDistance);

  //   for (const o of orders) {
  //     const pickup = o.pickupAddress
  //       ? {
  //           lat: Number(o.pickupAddress.lat),
  //           lon: Number(o.pickupAddress.long),
  //         }
  //       : null;
  //     const delivery = o.deliveryAddress
  //       ? {
  //           lat: Number(o.deliveryAddress.lat),
  //           lon: Number(o.deliveryAddress.long),
  //         }
  //       : null;

  //     if (o.fulfillmentType === 'PICKUP') {
  //       if (pickup) coordsForDistance.push(pickup);
  //       if (delivery) coordsForDistance.push(delivery);
  //     } else {
  //       if (delivery) coordsForDistance.push(delivery);
  //     }
  //   }

  //   // If no coordinates found, fallback to (0,0)
  //   if (!coordsForDistance.length) coordsForDistance.push({ lat: 0, lon: 0 });

  //   // 4️⃣ Compute centroid of points for Redis GEO search
  //   const centroid = (points: { lat: number; lon: number }[]) => {
  //     const sum = points.reduce(
  //       (acc, p) => ((acc.lat += p.lat), (acc.lon += p.lon), acc),
  //       { lat: 0, lon: 0 },
  //     );
  //     return { lat: sum.lat / points.length, lon: sum.lon / points.length };
  //   };
  //   console.log('centroids  :: ', centroid);

  //   const target = centroid(coordsForDistance);

  //   console.log('target order :: ', target);

  //   // 5️⃣ Determine earliest scheduled time for SAME_DAY orders
  //   const sameDayOrders = orders.filter((o) => o.serviceType === 'SAME_DAY');
  //   console.log('same day orders ::: ', sameDayOrders);

  //   let earliestScheduledTimeMs: number | null = null;
  //   if (sameDayOrders.length) {
  //     for (const o of sameDayOrders) {
  //       const times: (Date | null)[] = [];
  //       if (o.pickupDate) times.push(o.pickupDate);
  //       if (o.deliveryDate) times.push(o.deliveryDate);
  //       const validTs = times.filter(Boolean) as Date[];
  //       if (!validTs.length) continue;
  //       const minTime = Math.min(...validTs.map((d) => d.getTime()));
  //       earliestScheduledTimeMs =
  //         earliestScheduledTimeMs == null
  //           ? minTime
  //           : Math.min(earliestScheduledTimeMs, minTime);
  //     }
  //   }

  //   console.log('Earliest sechdule time ms :: ', earliestScheduledTimeMs);

  //   // 6️⃣ Redis GEO search for nearby drivers
  //   const rawDrivers = (await client.sendCommand([
  //     'GEOSEARCH',
  //     this.GEO_KEY,
  //     'FROMLONLAT',
  //     target.lon.toString(),
  //     target.lat.toString(),
  //     'BYRADIUS',
  //     radiusKm.toString(),
  //     'km',
  //     'WITHDIST',
  //     'WITHCOORD',
  //   ])) as any[];
  //   console.log('drivers from goe locations ::: ', rawDrivers.length);

  //   if (!rawDrivers?.length) return [];

  //   // Map Redis response
  //   const nearbyMap = new Map<
  //     string,
  //     { distanceKm: number; lon: number; lat: number }
  //   >();
  //   const userIds: string[] = [];
  //   for (const d of rawDrivers) {
  //     const member = d[0];
  //     const distanceKm = parseFloat(d[1]);
  //     const coord = d[2];
  //     const lon = parseFloat(coord[0]);
  //     const lat = parseFloat(coord[1]);
  //     nearbyMap.set(member, { distanceKm, lon, lat });
  //     userIds.push(member);
  //   }

  //   console.log('nearby map ::: ', nearbyMap);

  //   console.log('ffffeef  ', userIds);

  //   // 7️⃣ Fetch driver records with active orders and vehicle info
  //   const driverRecords = await this.prisma.driver.findMany({
  //     where: { userId: { in: userIds }, status: 'ONLINE' },
  //     include: {
  //       user: {
  //         include: {
  //           pickupOrders: {
  //             where: {
  //               status: {
  //                 in: [
  //                   'ASSIGNED',
  //                   'OUT_FOR_DELIVERY',
  //                   'PICKED_UP',
  //                   'IN_TRANSIT',
  //                 ],
  //               },
  //             },
  //             select: { id: true, weight: true },
  //           },
  //           deliveryOrders: {
  //             where: {
  //               status: {
  //                 in: [
  //                   'ASSIGNED',
  //                   'OUT_FOR_DELIVERY',
  //                   'PICKED_UP',
  //                   'IN_TRANSIT',
  //                 ],
  //               },
  //             },
  //             select: { id: true, weight: true },
  //           },
  //         },
  //       },
  //       vehicles: true,
  //     },
  //   });

  //   console.log('driver records ::: ', driverRecords);

  //   const results: RankedDriver[] = [];
  //   const nowMs = Date.now();
  //   const WEIGHTS = {
  //     distance: 0.35,
  //     capacity: 0.25,
  //     eta: 0.2,
  //     freshness: 0.1,
  //     online: 0.1,
  //   };

  //   const DEFAULT_TRAVEL_BUFFER_MIN = 5; // buffer for early ETA

  //   // 8️⃣ Evaluate each driver
  //   for (const drv of driverRecords) {
  //     const geo = nearbyMap.get(drv.userId);
  //     if (!geo) continue;

  //     // Calculate current load
  //     const pickupLoad = (drv.user?.pickupOrders || []).reduce(
  //       (s, o) => s + (o.weight || 0),
  //       0,
  //     );
  //     console.log('Pick loAad :: ', pickupLoad);

  //     const deliveryLoad = (drv.user?.deliveryOrders || []).reduce(
  //       (s, o) => s + (o.weight || 0),
  //       0,
  //     );
  //     console.log('delivery load ::: ', deliveryLoad);

  //     const currentLoadKg = pickupLoad + deliveryLoad;

  //     console.log('cureent loaddksg :: ', currentLoadKg);

  //     const vehicle = drv.vehicles?.[0];
  //     console.log('vehicle ::: ', vehicle);

  //     if (!vehicle?.maxLoad) continue;
  //     const vehicleMaxLoadKg = Number(vehicle.maxLoad);
  //     console.log('Vehicle load ::: ', vehicleMaxLoadKg);

  //     // Skip if batch cannot fit
  //     if (currentLoadKg + batchWeightKg > vehicleMaxLoadKg) continue;

  //     // Check route finish vs earliest SAME_DAY order
  //     const routeFinishKey = `driver:${drv.userId}:routeFinish`;
  //     let routeFinishMs = 0;
  //     try {
  //       const routeFinishStr = (await client.get(routeFinishKey)) as string;
  //       console.log('Route finished :: ', routeFinishStr);

  //       if (routeFinishStr) routeFinishMs = new Date(routeFinishStr).getTime();
  //     } catch {}

  //     if (
  //       earliestScheduledTimeMs != null &&
  //       routeFinishMs >
  //         earliestScheduledTimeMs - DEFAULT_TRAVEL_BUFFER_MIN * 60000
  //     )
  //       continue;

  //     // Compute distance score (inverse distance)
  //     let distanceScore = 0;
  //     console.log('distance score :: ', distanceScore);

  //     for (const o of orders) {
  //       const orderPickup = o.pickupAddress
  //         ? {
  //             lat: Number(o.pickupAddress.lat),
  //             lon: Number(o.pickupAddress.long),
  //           }
  //         : null;
  //       const orderDelivery = o.deliveryAddress
  //         ? {
  //             lat: Number(o.deliveryAddress.lat),
  //             lon: Number(o.deliveryAddress.long),
  //           }
  //         : null;
  //       let dist = 0;
  //       if (o.fulfillmentType === 'PICKUP') {
  //         if (orderPickup && orderDelivery)
  //           dist = Math.min(
  //             this.calcDistanceKm(
  //               geo.lat,
  //               geo.lon,
  //               orderPickup.lat,
  //               orderPickup.lon,
  //             ),
  //             this.calcDistanceKm(
  //               geo.lat,
  //               geo.lon,
  //               orderDelivery.lat,
  //               orderDelivery.lon,
  //             ),
  //           );
  //         else if (orderPickup)
  //           dist = this.calcDistanceKm(
  //             geo.lat,
  //             geo.lon,
  //             orderPickup.lat,
  //             orderPickup.lon,
  //           );
  //         else if (orderDelivery)
  //           dist = this.calcDistanceKm(
  //             geo.lat,
  //             geo.lon,
  //             orderDelivery.lat,
  //             orderDelivery.lon,
  //           );
  //       } else {
  //         if (orderDelivery)
  //           dist = this.calcDistanceKm(
  //             geo.lat,
  //             geo.lon,
  //             orderDelivery.lat,
  //             orderDelivery.lon,
  //           );
  //       }
  //       distanceScore += 1 / (dist + 0.1);
  //     }
  //     distanceScore /= orders.length;

  //     console.log('distance  ', distanceScore);

  //     // Capacity score
  //     const capacityScore =
  //       1 - (currentLoadKg + batchWeightKg) / vehicleMaxLoadKg;

  //     // ETA score
  //     let etaScore = 1;
  //     if (earliestScheduledTimeMs) {
  //       const timeUntilEarliestMin = Math.max(
  //         0,
  //         (earliestScheduledTimeMs - nowMs) / 60000,
  //       );
  //       const availableInMin = Math.max(0, (routeFinishMs - nowMs) / 60000);
  //       etaScore =
  //         availableInMin <= 0 || availableInMin <= timeUntilEarliestMin
  //           ? 1
  //           : Math.max(
  //               0,
  //               (timeUntilEarliestMin - availableInMin) /
  //                 Math.max(1, timeUntilEarliestMin),
  //             );
  //     } else {
  //       const availableInMin = Math.max(0, (routeFinishMs - nowMs) / 60000);
  //       etaScore = Math.max(0, 1 - availableInMin / 120);
  //     }

  //     // Freshness score
  //     const lastUpdatedScore =
  //       drv.updatedAt && nowMs - drv.updatedAt.getTime() < 5 * 60 * 1000
  //         ? 1
  //         : 0.5;

  //     // Online status score
  //     const onlineScore = drv.status === 'ONLINE' ? 1 : 0;

  //     const finalScore =
  //       distanceScore * WEIGHTS.distance +
  //       capacityScore * WEIGHTS.capacity +
  //       etaScore * WEIGHTS.eta +
  //       lastUpdatedScore * WEIGHTS.freshness +
  //       onlineScore * WEIGHTS.online;

  //     // Suggested orders for this driver (closest within radius)
  //     const suggestedForOrders = orders
  //       .filter((o) => {
  //         const orderPickup = o.pickupAddress
  //           ? {
  //               lat: Number(o.pickupAddress.lat),
  //               lon: Number(o.pickupAddress.long),
  //             }
  //           : null;
  //         const orderDelivery = o.deliveryAddress
  //           ? {
  //               lat: Number(o.deliveryAddress.lat),
  //               lon: Number(o.deliveryAddress.long),
  //             }
  //           : null;
  //         let dist = 0;
  //         if (o.fulfillmentType === 'PICKUP') {
  //           if (orderPickup && orderDelivery)
  //             dist = Math.min(
  //               this.calcDistanceKm(
  //                 geo.lat,
  //                 geo.lon,
  //                 orderPickup.lat,
  //                 orderPickup.lon,
  //               ),
  //               this.calcDistanceKm(
  //                 geo.lat,
  //                 geo.lon,
  //                 orderDelivery.lat,
  //                 orderDelivery.lon,
  //               ),
  //             );
  //           else if (orderPickup)
  //             dist = this.calcDistanceKm(
  //               geo.lat,
  //               geo.lon,
  //               orderPickup.lat,
  //               orderPickup.lon,
  //             );
  //           else if (orderDelivery)
  //             dist = this.calcDistanceKm(
  //               geo.lat,
  //               geo.lon,
  //               orderDelivery.lat,
  //               orderDelivery.lon,
  //             );
  //         } else {
  //           if (orderDelivery)
  //             dist = this.calcDistanceKm(
  //               geo.lat,
  //               geo.lon,
  //               orderDelivery.lat,
  //               orderDelivery.lon,
  //             );
  //         }
  //         return dist <= radiusKm;
  //       })
  //       .map((o) => o.id);

  //     results.push({
  //       driverId: drv.id,
  //       userId: drv.userId,
  //       distanceKm: geo.distanceKm,
  //       currentLat: geo.lat,
  //       currentLon: geo.lon,
  //       activeOrders:
  //         (drv.user?.pickupOrders?.length || 0) +
  //         (drv.user?.deliveryOrders?.length || 0),
  //       lastUpdated: drv.updatedAt!,
  //       score: finalScore,
  //       suggestedForOrders,
  //     });
  //   }

  //   // 9️⃣ Sort by score descending and assign rank
  //   results.sort((a, b) => b.score - a.score);
  //   results.forEach((r, idx) => (r.rank = idx + 1));
  //   return results;
  // }

  async findNearbyDrivers(
    orderIds: string[],
    radiusKm: number,
  ): Promise<RankedDriver[]> {
    const client = this.redisService.getClient();

    // 1️⃣ Fetch orders and their relevant coordinates
    const orders = await this.prisma.order.findMany({
      where: { id: { in: orderIds } },
      select: {
        id: true,
        weight: true,
        serviceType: true,
        fulfillmentType: true,
        shippingScope: true, // <-- use this for in-town logic
        pickupAddress: { select: { lat: true, long: true } },
        deliveryAddress: { select: { lat: true, long: true } },
        pickupDate: true,
        deliveryDate: true,
      },
    });
    if (!orders.length) return [];

    console.log('Orders fetched :::: ', orders);

    // 2️⃣ Compute total batch weight
    const batchWeightKg = orders.reduce((sum, o) => sum + (o.weight || 0), 0);
    console.log('Orders weight kg ::: ', batchWeightKg);

    // 3️⃣ Gather coordinates for centroid calculation
    const coordsForDistance: { lat: number; lon: number }[] = [];

    for (const o of orders) {
      const pickup = o.pickupAddress
        ? {
            lat: Number(o.pickupAddress.lat),
            lon: Number(o.pickupAddress.long),
          }
        : null;
      const delivery = o.deliveryAddress
        ? {
            lat: Number(o.deliveryAddress.lat),
            lon: Number(o.deliveryAddress.long),
          }
        : null;

      // PICKUP orders: include pickup always, include delivery if in-town
      if (o.fulfillmentType === 'PICKUP') {
        if (pickup) coordsForDistance.push(pickup);
        if (o.shippingScope === 'TOWN' && delivery)
          coordsForDistance.push(delivery);
      }
      // DROPOFF orders: only delivery
      else if (o.fulfillmentType === 'DROPOFF') {
        if (delivery) coordsForDistance.push(delivery);
      }
    }

    // Fallback centroid if no coordinates found
    if (!coordsForDistance.length) coordsForDistance.push({ lat: 0, lon: 0 });

    // 4️⃣ Compute centroid of coordinates for GEOSEARCH
    const centroid = (points: { lat: number; lon: number }[]) => {
      const sum = points.reduce(
        (acc, p) => ((acc.lat += p.lat), (acc.lon += p.lon), acc),
        { lat: 0, lon: 0 },
      );
      return { lat: sum.lat / points.length, lon: sum.lon / points.length };
    };
    const target = centroid(coordsForDistance);
    console.log('target order :: ', target);

    // 5️⃣ Determine earliest scheduled time for SAME_DAY orders
    const sameDayOrders = orders.filter((o) => o.serviceType === 'SAME_DAY');
    let earliestScheduledTimeMs: number | null = null;
    if (sameDayOrders.length) {
      for (const o of sameDayOrders) {
        const times: (Date | null)[] = [];
        if (o.pickupDate) times.push(o.pickupDate);
        if (o.deliveryDate) times.push(o.deliveryDate);
        const validTs = times.filter(Boolean) as Date[];
        if (!validTs.length) continue;
        const minTime = Math.min(...validTs.map((d) => d.getTime()));
        earliestScheduledTimeMs =
          earliestScheduledTimeMs == null
            ? minTime
            : Math.min(earliestScheduledTimeMs, minTime);
      }
    }

    console.log('Earliest schedule time ms :: ', earliestScheduledTimeMs);

    // 6️⃣ Redis GEO search for nearby drivers
    const rawDrivers = (await client.sendCommand([
      'GEOSEARCH',
      this.GEO_KEY,
      'FROMLONLAT',
      target.lon.toString(),
      target.lat.toString(),
      'BYRADIUS',
      radiusKm.toString(),
      'km',
      'WITHDIST',
      'WITHCOORD',
    ])) as any[];

    if (!rawDrivers?.length) return [];

    // Map Redis results
    const nearbyMap = new Map<
      string,
      { distanceKm: number; lon: number; lat: number }
    >();
    const userIds: string[] = [];
    for (const d of rawDrivers) {
      const member = d[0];
      const distanceKm = parseFloat(d[1]);
      const coord = d[2];
      nearbyMap.set(member, {
        distanceKm,
        lon: parseFloat(coord[0]),
        lat: parseFloat(coord[1]),
      });
      userIds.push(member);
    }

    // 7️⃣ Fetch driver records and active orders
    const driverRecords = await this.prisma.driver.findMany({
      where: { userId: { in: userIds }, status: 'ONLINE', type: 'INTERNAL' },
      include: {
        user: {
          include: {
            pickupOrders: {
              where: {
                status: {
                  in: [
                    'ASSIGNED',
                    'OUT_FOR_DELIVERY',
                    'PICKED_UP',
                    'IN_TRANSIT',
                  ],
                },
              },
              select: { id: true, weight: true },
            },
            deliveryOrders: {
              where: {
                status: {
                  in: [
                    'ASSIGNED',
                    'OUT_FOR_DELIVERY',
                    'PICKED_UP',
                    'IN_TRANSIT',
                  ],
                },
              },
              select: { id: true, weight: true },
            },
          },
        },
        vehicles: true,
      },
    });

    const results: RankedDriver[] = [];
    const nowMs = Date.now();
    const WEIGHTS = {
      distance: 0.35,
      capacity: 0.25,
      eta: 0.2,
      freshness: 0.1,
      online: 0.1,
    };
    const DEFAULT_TRAVEL_BUFFER_MIN = 5;

    // 8️⃣ Evaluate each driver
    for (const drv of driverRecords) {
      const geo = nearbyMap.get(drv.userId);
      if (!geo) continue;

      // Compute current load
      const pickupLoad = (drv.user?.pickupOrders || []).reduce(
        (s, o) => s + (o.weight || 0),
        0,
      );
      const deliveryLoad = (drv.user?.deliveryOrders || []).reduce(
        (s, o) => s + (o.weight || 0),
        0,
      );
      const currentLoadKg = pickupLoad + deliveryLoad;

      const vehicle = drv.vehicles?.[0];
      if (!vehicle?.maxLoad) continue;
      const vehicleMaxLoadKg = Number(vehicle.maxLoad);

      // Skip if batch cannot fit
      if (currentLoadKg + batchWeightKg > vehicleMaxLoadKg) continue;

      // Check route finish vs earliest SAME_DAY order
      const routeFinishKey = `driver:${drv.userId}:routeFinish`;
      let routeFinishMs = 0;
      try {
        const routeFinishStr = (await client.get(routeFinishKey)) as string;
        if (routeFinishStr) routeFinishMs = new Date(routeFinishStr).getTime();
      } catch {}

      if (
        earliestScheduledTimeMs != null &&
        routeFinishMs >
          earliestScheduledTimeMs - DEFAULT_TRAVEL_BUFFER_MIN * 60000
      )
        continue;

      // Compute distance score
      let distanceScore = 0;
      for (const o of orders) {
        const pickup = o.pickupAddress
          ? {
              lat: Number(o.pickupAddress.lat),
              lon: Number(o.pickupAddress.long),
            }
          : null;
        const delivery = o.deliveryAddress
          ? {
              lat: Number(o.deliveryAddress.lat),
              lon: Number(o.deliveryAddress.long),
            }
          : null;
        let dist = 0;

        if (o.fulfillmentType === 'PICKUP') {
          if (pickup && delivery && o.shippingScope === 'TOWN')
            dist = Math.min(
              this.calcDistanceKm(geo.lat, geo.lon, pickup.lat, pickup.lon),
              this.calcDistanceKm(geo.lat, geo.lon, delivery.lat, delivery.lon),
            );
          else if (pickup)
            dist = this.calcDistanceKm(
              geo.lat,
              geo.lon,
              pickup.lat,
              pickup.lon,
            );
          else if (delivery)
            dist = this.calcDistanceKm(
              geo.lat,
              geo.lon,
              delivery.lat,
              delivery.lon,
            );
        } else if (o.fulfillmentType === 'DROPOFF') {
          if (delivery)
            dist = this.calcDistanceKm(
              geo.lat,
              geo.lon,
              delivery.lat,
              delivery.lon,
            );
        }

        distanceScore += 1 / (dist + 0.1);
      }
      distanceScore /= orders.length;

      // Capacity score
      const capacityScore =
        1 - (currentLoadKg + batchWeightKg) / vehicleMaxLoadKg;

      // ETA score
      let etaScore = 1;
      if (earliestScheduledTimeMs) {
        const timeUntilEarliestMin = Math.max(
          0,
          (earliestScheduledTimeMs - nowMs) / 60000,
        );
        const availableInMin = Math.max(0, (routeFinishMs - nowMs) / 60000);
        etaScore =
          availableInMin <= 0 || availableInMin <= timeUntilEarliestMin
            ? 1
            : Math.max(
                0,
                (timeUntilEarliestMin - availableInMin) /
                  Math.max(1, timeUntilEarliestMin),
              );
      }

      // Freshness and online score
      const lastUpdatedScore =
        drv.updatedAt && nowMs - drv.updatedAt.getTime() < 5 * 60 * 1000
          ? 1
          : 0.5;
      const onlineScore = drv.status === 'ONLINE' ? 1 : 0;

      // Compute final score
      const finalScore =
        distanceScore * WEIGHTS.distance +
        capacityScore * WEIGHTS.capacity +
        etaScore * WEIGHTS.eta +
        lastUpdatedScore * WEIGHTS.freshness +
        onlineScore * WEIGHTS.online;

      // Suggested orders for this driver
      const suggestedForOrders = orders
        .filter((o) => {
          const pickup = o.pickupAddress
            ? {
                lat: Number(o.pickupAddress.lat),
                lon: Number(o.pickupAddress.long),
              }
            : null;
          const delivery = o.deliveryAddress
            ? {
                lat: Number(o.deliveryAddress.lat),
                lon: Number(o.deliveryAddress.long),
              }
            : null;
          let dist = 0;

          if (o.fulfillmentType === 'PICKUP') {
            if (pickup && delivery && o.shippingScope === 'TOWN')
              dist = Math.min(
                this.calcDistanceKm(geo.lat, geo.lon, pickup.lat, pickup.lon),
                this.calcDistanceKm(
                  geo.lat,
                  geo.lon,
                  delivery.lat,
                  delivery.lon,
                ),
              );
            else if (pickup)
              dist = this.calcDistanceKm(
                geo.lat,
                geo.lon,
                pickup.lat,
                pickup.lon,
              );
            else if (delivery)
              dist = this.calcDistanceKm(
                geo.lat,
                geo.lon,
                delivery.lat,
                delivery.lon,
              );
          } else if (o.fulfillmentType === 'DROPOFF') {
            if (delivery)
              dist = this.calcDistanceKm(
                geo.lat,
                geo.lon,
                delivery.lat,
                delivery.lon,
              );
          }

          return dist <= radiusKm;
        })
        .map((o) => o.id);

      results.push({
        driverId: drv.id,
        userId: drv.userId,
        user: {
          id: drv.userId,
          name: drv.user?.name,
          email: drv.user?.email,
          phone: drv.user?.phone,
          driver: {
            type: drv.type,
            status: drv.status,
          },
        },
        distanceKm: geo.distanceKm,
        currentLat: geo.lat,
        currentLon: geo.lon,
        activeOrders:
          (drv.user?.pickupOrders?.length || 0) +
          (drv.user?.deliveryOrders?.length || 0),
        lastUpdated: drv.updatedAt!,
        score: finalScore,
        suggestedForOrders,
      });
    }

    // 9️⃣ Sort by final score descending
    results.sort((a, b) => b.score - a.score);
    results.forEach((r, idx) => (r.rank = idx + 1));

    return results;
  }

  /**
   * Find nearby external drivers (simpler than internal drivers)
   * - Only online drivers
   * - Only location/distance checked
   * - No scoring or order checks
   * @param lon longitude of target
   * @param lat latitude of target
   * @param radiusKm search radius in km
   */
  // async findNearbyExternalDrivers(
  //   lon: number,
  //   lat: number,
  //   radiusKm: number,
  // ): Promise<NearbyDriver[]> {
  //   const client = this.redisService.getClient();

  //   // 1️⃣ Redis GEO search within radius
  //   const rawDrivers = (await client.sendCommand([
  //     'GEOSEARCH',
  //     this.GEO_KEY,
  //     'FROMLONLAT',
  //     lon.toString(),
  //     lat.toString(),
  //     'BYRADIUS',
  //     radiusKm.toString(),
  //     'km',
  //     'WITHDIST',
  //     'WITHCOORD',
  //   ])) as any[];

  //   if (!rawDrivers?.length) return [];

  //   const driversDetails = await this.prisma.user.findMany({

  //   })

  //   // 2️⃣ Filter only online external drivers
  //   const drivers: NearbyDriver[] = [];
  //   for (const d of rawDrivers) {
  //     const driverId = d[0];
  //     const isOnline = await client.exists(`driver:${driverId}:online`);
  //     if (!isOnline) continue;

  //     const distanceKm = parseFloat(d[1]);
  //     const coord = d[2];

  //     drivers.push({
  //       driverId,
  //       distanceKm,
  //       coordinates: {
  //         lon: parseFloat(coord[0]),
  //         lat: parseFloat(coord[1]),
  //       },
  //     });
  //   }

  //   return drivers;
  // }

  async findNearbyExternalDrivers(
    lon: number,
    lat: number,
    radiusKm: number,
  ): Promise<NearbyDriver[]> {
    const client = this.redisService.getClient();

    // 1️⃣ Redis GEO search within radius
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

    if (!rawDrivers?.length) return [];

    // Extract driver IDs from redis result
    const driverIds = rawDrivers.map((d) => d[0]);
    console.log('DRIVER IDS IN EXTERNAL ::: ', driverIds);

    // 2️⃣ Fetch user details from DB
    const driverProfiles = await this.prisma.user.findMany({
      where: { id: { in: driverIds }, driver: { type: 'EXTERNAL' } },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        driver: {
          select: {
            type: true,
            status: true,
          },
        },
      },
    });

    console.log('DRIVER PROFILES IN EXTERNAL   ::: ', driverProfiles);

    // Create a quick lookup map
    const driverProfileMap = new Map(driverProfiles.map((p) => [p.id, p]));

    // 3️⃣ Filter only online & merge data
    const drivers: NearbyDriver[] = [];

    for (const d of rawDrivers) {
      const driverId = d[0];

      // Check if online
      const isOnline = await client.exists(`driver:${driverId}:online`);
      if (!isOnline) continue;

      const distanceKm = parseFloat(d[1]);
      const coord = d[2];

      // Get user detail
      const profile = driverProfileMap.get(driverId);

      if (!profile) continue;

      drivers.push({
        driverId,
        distanceKm,
        user: profile, // 👈 attaching user details
        coordinates: {
          lon: parseFloat(coord[0]),
          lat: parseFloat(coord[1]),
        },
      });
    }

    console.log('DRIVER FINAL RESULT :: ', drivers);

    return drivers;
  }

  // -------------------------------
  // HELPER: Haversine distance
  // -------------------------------
  private calcDistanceKm(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const R = 6371; // Earth radius km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  // -------------------------------
  // SYNC DRIVER LOCATION TO DB
  // -------------------------------
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

      const driver = await this.prisma.driver.findUnique({
        where: { userId },
        select: { id: true, updatedAt: true, status: true },
      });
      if (!driver) continue;

      const now = new Date();
      if (
        !driver.updatedAt ||
        (now.getTime() - driver.updatedAt.getTime()) / 1000 >
          this.STATUS_PERSIST_MINUTES * 60
      ) {
        await this.prisma.driver.update({
          where: { userId },
          data: { currentLat: lat, currentLon: lon, updatedAt: now, status },
        });
      }

      // Persist location log every LOCATION_LOG_INTERVAL_SECONDS
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
  }

  // -------------------------------
  // OFFLINE DRIVER DETECTION
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

      if (!offlineDriverIds.length) return;

      await this.prisma.driver.updateMany({
        where: { userId: { in: offlineDriverIds } },
        data: { status: 'OFFLINE', updatedAt: new Date() },
      });

      offlineDriverIds.forEach((driverId) => {
        if (this.onlineEmitter) this.onlineEmitter(driverId, 'OFFLINE');
      });

      this.logger.log(`✅ Marked ${offlineDriverIds.length} drivers OFFLINE`);
    } catch (err) {
      this.logger.error('Error updating offline drivers:', err);
    }
  }

  async markOfflineByDriverId(driverId: string) {
    const client = this.redisService.getClient();
    await client.del(`driver:${driverId}:online`);

    await this.prisma.driver.updateMany({
      where: { userId: driverId },
      data: { status: 'OFFLINE', updatedAt: new Date() },
    });

    if (this.onlineEmitter) this.onlineEmitter(driverId, 'OFFLINE');
  }
}
