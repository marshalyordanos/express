
// import { Injectable, InternalServerErrorException } from '@nestjs/common';
// import * as nodemailer from 'nodemailer';
// import { google } from 'googleapis';

// @Injectable()
// export class EmailService {
//   // private oAuth2Client = new google.auth.OAuth2(
//   //   process.env.EMAIL_CLIENT_ID,
//   //   process.env.EMAIL_CLIENT_SECRET,
//   //   'https://developers.google.com/oauthplayground', // redirect URI
//   // );

//   // constructor() {
//   //   // Set refresh token once
//   //   this.oAuth2Client.setCredentials({
//   //     refresh_token: process.env.EMAIL_REFRESH_TOKEN,
//   //   });
//   // }

//   // /**
//   //  * Create transporter with fresh access token
//   //  */
//   // private async createTransporter(): Promise<nodemailer.Transporter> {
//   //   try {
//   //     const accessTokenResponse = await this.oAuth2Client.getAccessToken();
//   //     const accessToken = accessTokenResponse?.token;

//   //     if (!accessToken) {
//   //       throw new Error('Failed to get access token from Google OAuth2');
//   //     }

//   //     return nodemailer.createTransport({
//   //       service: 'gmail',
//   //       auth: {
//   //         type: 'OAuth2',
//   //         user: process.env.EMAIL_USER,
//   //         clientId: process.env.EMAIL_CLIENT_ID,
//   //         clientSecret: process.env.EMAIL_CLIENT_SECRET,
//   //         refreshToken: process.env.EMAIL_REFRESH_TOKEN,
//   //         accessToken,
//   //       },
//   //       connectionTimeout: 20000, // 20s
//   //       greetingTimeout: 20000,
//   //       socketTimeout: 20000,
//   //     });
//   //   } catch (err) {
//   //     console.error('Error creating transporter:', err);
//   //     throw new InternalServerErrorException(
//   //       'Failed to create email transporter',
//   //     );
//   //   }
//   // }
//    private oAuth2Client: any;

//     constructor() {
//     // ✅ Create OAuth2 client inside constructor (Render fix)
//     this.oAuth2Client = new google.auth.OAuth2(
//       process.env.EMAIL_CLIENT_ID,
//       process.env.EMAIL_CLIENT_SECRET,
//       'https://developers.google.com/oauthplayground',
//     );

//     // ✅ Set credentials AFTER env variables are loaded
//     this.oAuth2Client.setCredentials({
//       refresh_token: process.env.EMAIL_REFRESH_TOKEN,
//     });

//     // ✅ Debug (enable during deployment)
//     console.log('Email Refresh Token Length:', process.env.EMAIL_REFRESH_TOKEN?.length);
//     if (!process.env.EMAIL_REFRESH_TOKEN) {
//       console.error('❌ EMAIL_REFRESH_TOKEN is MISSING in Render!');
//     }
//   }

//   /**
//    * Create transporter with fresh access token
//    */
//   private async createTransporter(): Promise<nodemailer.Transporter> {
//     try {
//       // ✅ Get fresh access token
//       const { token: accessToken } = await this.oAuth2Client.getAccessToken();

//       if (!accessToken) {
//         throw new Error('Failed to get access token from Google OAuth2');
//       }

//       return nodemailer.createTransport({
//         service: 'gmail',
//         auth: {
//           type: 'OAuth2',
//           user: process.env.EMAIL_USER,
//           clientId: process.env.EMAIL_CLIENT_ID,
//           clientSecret: process.env.EMAIL_CLIENT_SECRET,
//           refreshToken: process.env.EMAIL_REFRESH_TOKEN,
//           accessToken,
//         },
//         connectionTimeout: 20000,
//         greetingTimeout: 20000,
//         socketTimeout: 20000,
//       });
//     } catch (err) {
//       console.error('❌ Error creating transporter:', err);
//       throw new InternalServerErrorException('Failed to create email transporter');
//     }
//   }
//   /**
//    * Retry sending email up to 3 times
//    */
//   private async sendWithRetry(mailOptions: any, retries = 3) {
//     for (let i = 0; i < retries; i++) {
//       try {
//         const transporter = await this.createTransporter();
//         return await transporter.sendMail(mailOptions);
//       } catch (err) {
//         console.warn(`Send attempt ${i + 1} failed:`);
//         if (i === retries - 1) throw err;
//         await new Promise((res) => setTimeout(res, 1000)); // wait 1s
//       }
//     }
//   }

//   async sendEmailVerification(to: string, subject: string, token: string) {
//     try {
//       const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
//       console.log(`Sending email verification to: ${to}`);

//       await this.sendWithRetry({
//         from: process.env.EMAIL_USER,
//         to,
//         subject,
//         html: `<html>
//   <div style="
//     font-family: Arial, sans-serif;
//     background-color: #f4f4f7;
//     padding: 20px;
//     color: #333;
//   ">
//     <div style="
//       max-width: 600px;
//       margin: 0 auto;
//       background: #ffffff;
//       border-radius: 10px;
//       box-shadow: 0 4px 12px rgba(0,0,0,0.1);
//       padding: 30px;
//       text-align: center;
//     ">
//       <h1 style="
//         color: #1a73e8;
//         font-size: 28px;
//         margin-bottom: 20px;
//       ">Horizon</h1>

//       <p style="font-size: 16px; line-height: 1.5; margin-bottom: 20px;">
//         Welcome! Please verify your email address by clicking the button below:
//       </p>

//       <a href="${verificationUrl}" style="
//         display: inline-block;
//         padding: 12px 25px;
//         font-size: 16px;
//         font-weight: bold;
//         color: #ffffff;
//         background-color: #1a73e8;
//         border-radius: 6px;
//         text-decoration: none;
//         margin-bottom: 20px;
//       ">Verify Email</a>

//       <p style="font-size: 14px; color: #888; margin-top: 20px;">
//         If you did not create an account, you can safely ignore this email.
//       </p>
//     </div>
//   </div> </html>
// `,
//       });

//       console.log('Email verification sent successfully');
//     } catch (err) {
//       console.error('Failed to send email verification:', err);
//       throw new InternalServerErrorException('Failed to send email');
//     }
//   }

//   async sendPasswordReset(to: string, token: string) {
//     try {
//       const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
//       console.log(`Sending password reset email to: ${to}`);

//       await this.sendWithRetry({
//         from: process.env.EMAIL_USER,
//         to,
//         subject: 'Reset your password',
//         html: `<p>Click the link below to reset your password:</p>
//                <p><a href="${resetUrl}">${resetUrl}</a></p>`,
//       });

//       console.log('Password reset email sent successfully');
//     } catch (err) {
//       console.error('Failed to send password reset email:', err);
//       throw new InternalServerErrorException('Failed to send email');
//     }
//   }

//   /**
//    * Generic sendEmail method for notifications
//    */
//   async sendEmail(to: string, subject: string, html: string, text?: string) {
//     try {
//       await this.sendWithRetry({
//         from: process.env.EMAIL_USER,
//         to,
//         subject,
//         html,
//         text: html.replace(/<[^>]+>/g, ''), // cleaner fallback
//       });
//       console.log(`✅ Email sent to ${to} with subject "${subject}"`);
//     } catch (err) {
//       console.error(`❌ Failed to send email to ${to}:`, err);
//       throw new InternalServerErrorException('Failed to send email');
//     }
//   }
// }
