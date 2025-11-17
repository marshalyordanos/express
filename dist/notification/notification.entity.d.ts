export declare class NotificationDto {
    receiverId: string;
    roleId: string;
    message: string;
    type: string;
    payload: Record<string, any>;
}
export declare class SendEmailDto {
    emails: string[];
    subject: string;
    message: string;
    buttonText?: string;
    actionUrl?: string;
}
