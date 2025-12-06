// src/notification/events.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  // Track connected clients
  private connectedUsers: Map<string, string> = new Map(); // userId -> socket.id
  private connectedDrivers: Map<string, string> = new Map(); // Drivers

  handleConnection(client: Socket) {
    console.log(`🟢 Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`🔴 Client disconnected: ${client.id}`);
    // Remove user from map if exists
    for (const [userId, socketId] of this.connectedUsers.entries()) {
      if (socketId === client.id) {
        this.connectedUsers.delete(userId);
        break;
      }
    }

    // Remove from drivers map
    for (const [driverId, socketId] of this.connectedDrivers.entries()) {
      if (socketId === client.id) {
        this.connectedDrivers.delete(driverId);
        console.log(`❌ Removed DRIVER ${driverId} from active drivers`);
      }
    }
  }

  /**
   * Client sends this event to "subscribe" to their user notifications
   * Payload example: { userId: '123' }
   */
  @SubscribeMessage('subscribe:notification')
  handleSubscribe(
    @MessageBody() data: { userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { userId } = data;
    if (!userId) return;

    // Join a "room" for that user
    client.join(userId);
    this.connectedUsers.set(userId, client.id);

    // console.log(`📡 User ${userId} subscribed to WebSocket notifications`);

    // client.join(`user:${userId}`);
    // this.connectedUsers.set(data.userId, client.id);

    console.log(`👤 User ${userId} subscribed to user notifications`);
  }

  /**
   * DRIVER subscription
   * Client emits:  socket.emit("subscribe:driver.notification", { driverId: "driver123" })
   */
  @SubscribeMessage('subscribe:driver.notification')
  handleDriverSubscribe(
    @MessageBody() data: { userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { userId } = data;
    if (!userId) return;

    // Join a "room" for that user
    // client.join(userId);
    // this.connectedUsers.set(userId, client.id);
    client.join(`driver:${userId}`);
    this.connectedDrivers.set(userId, client.id);

    console.log(`🚚 Driver ${userId} subscribed to driver notifications`);
  }

  /**
   * Send notification to a specific user
   */
  sendToUser(userId: string, payload: any) {
    // Emit only to sockets in that "room"
    this.server.to(userId).emit('notification', payload);
    console.log(`📨 Notification sent to user ${userId}:`, payload);
  }

  /**
   * Send notification to DRIVER
   */
  sendToDriver(driverId: string, payload: any) {
    console.log(`📨 Sending notification to DRIVER ${driverId}`, payload);
    // this.server.to(`driver:${driverId}`).emit('notification:driver', payload);
    this.server.to(driverId).emit('notification.driver', payload);

  }

  /**
   * Optional: broadcast to all users
   */
  broadcast(payload: any) {
    this.server.emit('notification', payload);
  }
}
