"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const common_1 = require("@nestjs/common");
const redis_service_1 = require("../redis/redis.service");
const notification_repository_1 = require("./notification.repository");
const email_service_1 = require("./email.service");
const events_gateway_1 = require("./events.gateway");
const jwt_1 = require("@nestjs/jwt");
let NotificationService = class NotificationService {
    constructor(redisService, notificationRepository, emailService, eventsGateway, jwtService) {
        this.redisService = redisService;
        this.notificationRepository = notificationRepository;
        this.emailService = emailService;
        this.eventsGateway = eventsGateway;
        this.jwtService = jwtService;
    }
    async onModuleInit() {
        await this.redisService.waitUntilReady();
        const redis = this.redisService.getClient();
        await redis.pSubscribe('*', async (message, channel) => {
            console.log(`📨 Event received on channel "${channel}":`, message);
            const eventData = JSON.parse(message);
            switch (channel) {
                case 'user.registration':
                    await this.sendEmailVerification(eventData);
                    break;
                default:
                    await this.handleNotification(eventData, channel);
            }
        });
        console.log('✅ Notification Service subscribed to Redis channels');
    }
    async sendEmailVerification(data) {
        console.log('Sending email verification for user data  ::: ', data);
        const { userId, userEmail } = data;
        console.log('is email valid ::: ', userEmail);
        const subject = 'Verify your email';
        const token = await this.generateEmailVerificationToken(userId, userEmail);
        await this.emailService.sendEmailVerification(userEmail, subject, token);
    }
    async handleNotification(event, channel) {
        const { userId, userEmail, type = channel || 'general', message, subject, payload = {}, } = event;
        if (!userId)
            return;
        const prefs = await this.notificationRepository.getUserPrefs(userId);
        const usePrefs = prefs || { email: true, inApp: true, push: false };
        const finalMessage = message || `You have a new notification: ${type}`;
        if (usePrefs.inApp) {
            const notification = await this.notificationRepository.createNotification({
                userId,
                type,
                message: finalMessage,
                payload,
            });
            console.log("emmiting to user :: ", userId);
            this.eventsGateway.sendToUser(userId, {
                id: notification.id,
                type,
                message: finalMessage,
                payload,
                createdAt: notification.createdAt,
            });
        }
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
            }
            catch (e) {
                console.error('❌ Email send failed:', e);
            }
        }
        if (usePrefs.push) {
        }
        console.log(`✅ Notification processed for user ${userId}`);
    }
    async generateEmailVerificationToken(userId, email) {
        if (!process.env.JWT_SECRET) {
            throw new Error('JWT_SECRET is not set in environment variables!');
        }
        return this.jwtService.sign({ userId, email }, { expiresIn: 1 * 24 * 60 * 60 });
    }
};
exports.NotificationService = NotificationService;
exports.NotificationService = NotificationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [redis_service_1.RedisService,
        notification_repository_1.NotificationRepository,
        email_service_1.EmailService,
        events_gateway_1.EventsGateway,
        jwt_1.JwtService])
], NotificationService);
//# sourceMappingURL=notification.service.js.map