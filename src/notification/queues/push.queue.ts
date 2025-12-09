import { Queue, Worker } from 'bullmq';
import { Expo } from 'expo-server-sdk';

const redisConnection = {
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT, 10),
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,
};

export const pushQueue = new Queue('pushQueue', { connection: redisConnection });

new Worker(
  'pushQueue',
  async (job) => {
    const expo = new Expo();
    const { token, title, body, data } = job.data;

    if (!Expo.isExpoPushToken(token)) return;

    try {
      const tickets = await expo.sendPushNotificationsAsync([
        { to: token, sound: 'default', title, body, data },
      ]);
      console.log('Expo push tickets:', tickets);
    } catch (err) {
      console.error('Push notification error:', err);
    }
  },
  { connection: redisConnection }
);
