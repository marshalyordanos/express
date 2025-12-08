import { Injectable, Logger } from '@nestjs/common';
import { Expo, ExpoPushMessage, ExpoPushTicket } from 'expo-server-sdk';
import { pushQueue } from './queues/push.queue';

@Injectable()
export class PushNotificationService {
  private expo: Expo;
  private readonly logger = new Logger(PushNotificationService.name);

  constructor() {
    this.expo = new Expo();
  }

  async sendPush(pushTokens: string[], title: string, body: string, data?: any) {
    const validTokens = pushTokens.filter((t) => Expo.isExpoPushToken(t));

    if (validTokens.length === 0) {
      this.logger.warn('No valid Expo push tokens found.');
      return;
    }

    const messages: ExpoPushMessage[] = validTokens.map((token) => ({
      to: token,
      sound: 'default',
      title,
      body,
      data,
    }));

    // Chunk messages to avoid overflow
    const chunks = this.expo.chunkPushNotifications(messages);

    for (const chunk of chunks) {
      try {
        const ticket = (await this.expo.sendPushNotificationsAsync(chunk)) as ExpoPushTicket[];
        this.logger.log('Expo push ticket:', ticket);
      } catch (error) {
        this.logger.error('Push notification error:', error);
      }
    }
  }

   async sendPushWithRetry(tokens: string[], title: string, body: string, data?: any) {
    const validTokens = tokens.filter((t) => Expo.isExpoPushToken(t));

    if (!validTokens.length) {
      this.logger.warn('❌ No valid push tokens.');
      return;
    }

    for (const token of validTokens) {
      await pushQueue.add(
        'send',
        { token, title, body, data },
        {
          attempts: 5,                 // 👈 Retry up to 5 times
          backoff: {
            type: 'exponential',       // Slow down retries
            delay: 3000,               // First retry after 3s, then 6s, 12s, ...
          },
          removeOnComplete: true,
          removeOnFail: false,
        },
      );
    }
  }
}
