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

@WebSocketGateway({ cors: {origin: "*"} })
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  // Track connected clients
  private connectedUsers: Map<string, string> = new Map(); // userId -> socket.id

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

    console.log(`📡 User ${userId} subscribed to WebSocket notifications`);
  }

  /**
   * Send notification to a specific user
   */
  sendToUser(userId: string, payload: any) {
    // Emit only to sockets in that "room"
    console.log("accepting prepared to send ::: ", userId);
    console.log("accepting prepared to send payload ::: ", payload);
    
    this.server.to(userId).emit('notification', payload);
    console.log(`📨 Notification sent to user ${userId}:`, payload);
  }

  /**
   * Optional: broadcast to all users
   */
  broadcast(payload: any) {
    this.server.emit('notification', payload);
  }
}
