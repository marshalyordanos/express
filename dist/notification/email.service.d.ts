export declare class EmailService {
    private oAuth2Client;
    constructor();
    private createTransporter;
    private sendWithRetry;
    sendEmailVerification(to: string, subject: string, token: string): Promise<void>;
    sendPasswordReset(to: string, token: string): Promise<void>;
    sendEmail(to: string, subject: string, html: string, text?: string): Promise<void>;
}
