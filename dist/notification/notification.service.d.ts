import { OnModuleInit } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import { NotificationRepository } from './notification.repository';
import { EmailService } from './email.service';
import { EventsGateway } from './events.gateway';
import { JwtService } from '@nestjs/jwt';
export declare class NotificationService implements OnModuleInit {
    private readonly redisService;
    private readonly notificationRepository;
    private readonly emailService;
    private readonly eventsGateway;
    private readonly jwtService;
    constructor(redisService: RedisService, notificationRepository: NotificationRepository, emailService: EmailService, eventsGateway: EventsGateway, jwtService: JwtService);
    onModuleInit(): Promise<void>;
    private sendEmailVerification;
    private handleNotification;
    private generateEmailVerificationToken;
}
