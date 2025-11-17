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
exports.EmailService = void 0;
const common_1 = require("@nestjs/common");
const nodemailer = require("nodemailer");
const googleapis_1 = require("googleapis");
let EmailService = class EmailService {
    constructor() {
        this.oAuth2Client = new googleapis_1.google.auth.OAuth2(process.env.EMAIL_CLIENT_ID, process.env.EMAIL_CLIENT_SECRET, 'https://developers.google.com/oauthplayground');
        this.oAuth2Client.setCredentials({
            refresh_token: process.env.EMAIL_REFRESH_TOKEN,
        });
        console.log('Email Refresh Token Length:', process.env.EMAIL_REFRESH_TOKEN?.length);
        if (!process.env.EMAIL_REFRESH_TOKEN) {
            console.error('❌ EMAIL_REFRESH_TOKEN is MISSING in Render!');
        }
    }
    async createTransporter() {
        try {
            const { token: accessToken } = await this.oAuth2Client.getAccessToken();
            if (!accessToken) {
                throw new Error('Failed to get access token from Google OAuth2');
            }
            return nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    type: 'OAuth2',
                    user: process.env.EMAIL_USER,
                    clientId: process.env.EMAIL_CLIENT_ID,
                    clientSecret: process.env.EMAIL_CLIENT_SECRET,
                    refreshToken: process.env.EMAIL_REFRESH_TOKEN,
                    accessToken,
                },
                connectionTimeout: 20000,
                greetingTimeout: 20000,
                socketTimeout: 20000,
            });
        }
        catch (err) {
            console.error('❌ Error creating transporter:', err);
            throw new common_1.InternalServerErrorException('Failed to create email transporter');
        }
    }
    async sendWithRetry(mailOptions, retries = 3) {
        for (let i = 0; i < retries; i++) {
            try {
                const transporter = await this.createTransporter();
                return await transporter.sendMail(mailOptions);
            }
            catch (err) {
                console.warn(`Send attempt ${i + 1} failed:`);
                if (i === retries - 1)
                    throw err;
                await new Promise((res) => setTimeout(res, 1000));
            }
        }
    }
    async sendEmailVerification(to, subject, token) {
        try {
            const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
            console.log(`Sending email verification to: ${to}`);
            await this.sendWithRetry({
                from: process.env.EMAIL_USER,
                to,
                subject,
                html: `<html>
  <div style="
    font-family: Arial, sans-serif;
    background-color: #f4f4f7;
    padding: 20px;
    color: #333;
  ">
    <div style="
      max-width: 600px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 10px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      padding: 30px;
      text-align: center;
    ">
      <h1 style="
        color: #1a73e8;
        font-size: 28px;
        margin-bottom: 20px;
      ">Horizon</h1>

      <p style="font-size: 16px; line-height: 1.5; margin-bottom: 20px;">
        Welcome! Please verify your email address by clicking the button below:
      </p>

      <a href="${verificationUrl}" style="
        display: inline-block;
        padding: 12px 25px;
        font-size: 16px;
        font-weight: bold;
        color: #ffffff;
        background-color: #1a73e8;
        border-radius: 6px;
        text-decoration: none;
        margin-bottom: 20px;
      ">Verify Email</a>

      <p style="font-size: 14px; color: #888; margin-top: 20px;">
        If you did not create an account, you can safely ignore this email.
      </p>
    </div>
  </div> </html>
`,
            });
            console.log('Email verification sent successfully');
        }
        catch (err) {
            console.error('Failed to send email verification:', err);
            throw new common_1.InternalServerErrorException('Failed to send email');
        }
    }
    async sendPasswordReset(to, token) {
        try {
            const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
            console.log(`Sending password reset email to: ${to}`);
            await this.sendWithRetry({
                from: process.env.EMAIL_USER,
                to,
                subject: 'Reset your password',
                html: `<p>Click the link below to reset your password:</p>
               <p><a href="${resetUrl}">${resetUrl}</a></p>`,
            });
            console.log('Password reset email sent successfully');
        }
        catch (err) {
            console.error('Failed to send password reset email:', err);
            throw new common_1.InternalServerErrorException('Failed to send email');
        }
    }
    async sendEmail(to, subject, html, text) {
        try {
            await this.sendWithRetry({
                from: process.env.EMAIL_USER,
                to,
                subject,
                html,
                text: html.replace(/<[^>]+>/g, ''),
            });
            console.log(`✅ Email sent to ${to} with subject "${subject}"`);
        }
        catch (err) {
            console.error(`❌ Failed to send email to ${to}:`, err);
            throw new common_1.InternalServerErrorException('Failed to send email');
        }
    }
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], EmailService);
//# sourceMappingURL=email.service.js.map