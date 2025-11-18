// src/notification/notification.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import { NotificationRepository } from './notification.repository';
import { EmailService } from './email.service';
import { EventsGateway } from './events.gateway';
import { JwtService } from '@nestjs/jwt';
import { log } from 'node:console';

interface UserNotificationPreferences {
  email: boolean;
  inApp: boolean;
  push: boolean;
}

@Injectable()
export class NotificationService implements OnModuleInit {
  constructor(
    private readonly redisService: RedisService,
    private readonly notificationRepository: NotificationRepository,
    private readonly emailService: EmailService,
    private readonly eventsGateway: EventsGateway,
    private readonly jwtService: JwtService,
  ) {}

  async onModuleInit() {
    await this.redisService.waitUntilReady();

    const redis = this.redisService.getClient();

    // Listen for all events dynamically
    await redis.pSubscribe('*', async (message, channel) => {
      console.log(`📨 Event received on channel "${channel}":`, message);
      const eventData = JSON.parse(message);

      // Route events based on channel
      switch (channel) {
        case 'user.registration':
          await this.sendEmailVerification(eventData);
          break;

        // more cases can be added as needed
        default:
          await this.handleNotification(eventData, channel);
      }
    });

    console.log('✅ Notification Service subscribed to Redis channels');
  }

  // -------------------------
  // Email verification handler
  // -------------------------
  private async sendEmailVerification(data: any) {
    console.log('Sending email verification for user data  ::: ', data);

    const { userId, userEmail } = data;
    console.log('is email valid ::: ', userEmail);

    const subject = 'Verify your email';
    const token = await this.generateEmailVerificationToken(userId, userEmail);
    await this.emailService.sendEmailVerification(userEmail, subject, token);
  }

  // -------------------------
  // Core Notification Handler
  // -------------------------
  private async handleNotification(event: any, channel?: string) {
    const {
      userId,
      userEmail,
      type = channel || 'general',
      message,
      subject,
      payload = {},
    } = event;

    if (!userId) return;

    // -------------------------
    // Get user notification preferences
    // -------------------------
    const prefs: UserNotificationPreferences | null =
      await this.notificationRepository.getUserPrefs(userId);

    // If no prefs found, default to email + in-app
    const usePrefs = prefs || { email: true, inApp: true, push: false };

    // Final message
    const finalMessage = message || `You have a new notification: ${type}`;

    // -------------------------
    // Save In-App Notification
    // -------------------------
    if (usePrefs.inApp) {
      const notification = await this.notificationRepository.createNotification(
        {
          userId,
          type,
          message: finalMessage,
          payload,
        },
      );

      console.log("emmiting to user :: ", userId);
      
      // Emit via WebSocket
      this.eventsGateway.sendToUser(userId, {
        id: notification.id,
        type,
        message: finalMessage,
        payload,
        createdAt: notification.createdAt,
      });
      // this.eventsGateway.broadcast({
      //   id: notification.id,
      //   type,
      //   message: finalMessage,
      //   payload,
      //   createdAt: notification.createdAt,
      // });
    }


    // -------------------------
    // Send Email Notification
    // -------------------------
    if (usePrefs.email && userEmail) {
      const actionUrl = `${process.env.FRONTEND_URL}/notifications`;
      const buttonText = 'View Message';
      const html = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Email</title>
  </head>

  <body style="margin:0; padding:0; background:#f5f7fa; font-family: Arial, Helvetica, sans-serif;">

    <!-- Wrapper -->
    <table width="100%" cellspacing="0" cellpadding="0" style="background:#f5f7fa; padding: 40px 0;">
      <tr>
        <td align="center">

          <!-- Card -->
          <table width="600" cellspacing="0" cellpadding="0" style="background:white; border-radius:12px; padding:30px; box-shadow:0 6px 20px rgba(0,0,0,0.08);">

            <!-- Logo -->
            <tr>
              <td align="center" style="padding-bottom:20px;">
                <img src="https://your-logo-url.com/logo.png" alt="Logo" width="120" style="display:block;">
              </td>
            </tr>

            <!-- Title -->
            <tr>
              <td style="font-size:22px; font-weight:600; color:#333; padding-bottom:10px; text-align:center;">
                ${subject}
              </td>
            </tr>

            <!-- Message -->
            <tr>
              <td style="font-size:16px; line-height:26px; color:#555; padding-bottom:25px;">
                ${finalMessage}
              </td>
            </tr>

            <!-- Button -->
            <tr>
              <td align="center" style="padding-bottom:30px;">
                <a href="${actionUrl || '#'}"
                  style="
                    background:#4CAF50;
                    color:white;
                    padding:14px 28px;
                    font-size:16px; 
                    text-decoration:none;
                    border-radius:8px;
                    display:inline-block;
                  ">
                  ${buttonText || 'Open'}
                </a>
              </td>
            </tr>

            <!-- Divider -->
            <tr>
              <td style="border-bottom:1px solid #eaeaea; padding-bottom:20px;"></td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="color:#888; font-size:13px; text-align:center; padding-top:20px; line-height:20px;">
                You’re receiving this email because you use Horizon notifications.<br>
                If this wasn’t you, please ignore this email.
                <br><br>
                © 2025 Horizon — All rights reserved.
              </td>
            </tr>

          </table>
          <!-- End Card -->

        </td>
      </tr>
    </table>
    <!-- End Wrapper -->

  </body>
  </html>
  `;

      try {
        await this.emailService.sendEmail(userEmail, subject, html);
      } catch (e) {
        console.error('❌ Email send failed:', e);
      }
    }

    // -------------------------
    // Push Notification (Optional)
    // -------------------------
    if (usePrefs.push) {
      // Add your FCM / APNs push logic here
    }

    console.log(`✅ Notification processed for user ${userId}`);
  }

  /**
   * Generates a signed JWT token for email verification
   * @param userId User ID to include in the token
   * @param email User Email to include in the token
   * @param expiresIn Token expiration time (default 1 day)
   */
  private async generateEmailVerificationToken(
    userId: string,
    email: string,
  ): Promise<string> {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not set in environment variables!');
    }

    return this.jwtService.sign(
      { userId, email },
      { expiresIn: 1 * 24 * 60 * 60 },
    );
  }
}
