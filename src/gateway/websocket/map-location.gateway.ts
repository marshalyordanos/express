import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { DriverLocationService } from '../../fulfillment/maps/driver-location.service';

@WebSocketGateway({ cors: { origin: '*' } })
export class MapLocationGateway {
  @WebSocketServer() server: Server;

  constructor(private readonly driverLocationService: DriverLocationService) {
    // Pass a callback to driverLocationService to emit online events
    // this.driverLocationService.setOnlineEmitter((driverId: string) => {
    //   this.server.emit('driver:status:online', { driverId, status: 'ONLINE' });
    // });
    this.driverLocationService.setOnlineEmitter(
      (driverId: string, status?: 'ONLINE' | 'OFFLINE') => {
        this.server.emit('driver:status', {
          driverId,
          status: status ?? 'ONLINE',
        });
      },
    );
  }
  private socketDriverMap = new Map<string, string>();

  /**
   * When driver sends location updates
   */
  @SubscribeMessage('driver:location:update')
  async handleDriverLocationUpdate(
    @MessageBody()
    payload: {
      driverId: string;
      lat: number;
      lon: number;
      speed?: number;
      heading?: number;
    },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      // 1️⃣ Update in Redis & DB

      // store the mapping
      this.socketDriverMap.set(client.id, payload.driverId);
      await this.driverLocationService.updateDriverLocation(payload);

      // Notify all clients (real-time updates)
      // 2️⃣ Broadcast location to all subscribers (optional filtering)

      this.server.emit('driver:location:updated', {
        driverId: payload.driverId,
        lat: payload.lat,
        lon: payload.lon,
        speed: payload.speed,
        heading: payload.heading,
        updatedAt: new Date().toISOString(),
      });

      // 3️⃣ Send acknowledgment back to driver
      client.emit('location:ack', { status: 'ok' });
    } catch (err) {
      console.error('Location update error:', err);
      client.emit('location:ack', { status: 'error', message: err.message });
    }
  }

  /**
   * When clients (e.g. dispatch dashboard) request nearby drivers
   */
  @SubscribeMessage('drivers:nearby')
  async handleNearbyDriversRequest(
    @MessageBody() data: { lat: number; lon: number; radiusKm: number },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const nearby = await this.driverLocationService.findNearbyDrivers(
        data.lat,
        data.lon,
        data.radiusKm,
      );
      console.log("Near by drivers for pickup : ", nearby);
      
      client.emit('drivers:nearby:result', nearby);
    } catch (err) {
      console.error('Nearby driver search error:', err);
      client.emit('drivers:nearby:result', { error: err.message });
    }
  }

  handleConnection(client: Socket) {
    console.log(`✅ Driver connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    const driverId = this.socketDriverMap.get(client.id);
    if (driverId) {
      this.driverLocationService.markOfflineByDriverId(driverId);
      this.socketDriverMap.delete(client.id);
    }
    console.log(`❌ Driver disconnected: ${client.id}, driverId: ${driverId}`);
  }
}
