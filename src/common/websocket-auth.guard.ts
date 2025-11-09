// guards/websocket-auth.guard.ts
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import * as jwt from 'jsonwebtoken';
import { Socket } from 'socket.io';
import { WS_PUBLIC_KEY } from './decorator/public.decorator';

@Injectable()
export class WsJwtAuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(WS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const client: Socket = context.switchToWs().getClient();

    if (isPublic) return true;

    try {
      const token =
        client.handshake.auth?.token?.replace('Bearer ', '') ||
        client.handshake.headers['authorization']?.replace('Bearer ', '');

      if (!token) {
        this.handleUnauthorized(client, 'Missing auth token');
        return false;
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'yourSecret');
      (client as any).user = decoded;
      return true;
    } catch (err) {
      this.handleUnauthorized(client, 'Invalid or expired token');
      return false;
    }
  }

  private async handleUnauthorized(client: Socket, message: string) {
    try {
      // Send event and wait a moment before disconnecting
      client.emit('unauthorized', { status: 'error', message });

      // Option 1: Wait for an acknowledgement from client (if implemented)
      client.emit('unauthorized', { status: 'error', message }, () => {
        client.disconnect(true);
      });

      // Option 2: Give time for message to be transmitted
      await new Promise((resolve) => setTimeout(resolve, 1000));

    //   client.disconnect(true);
    } catch (e) {
      console.error('Error emitting unauthorized event:', e);
      client.disconnect(true);
    }
  }
}
