import { IsNotEmpty, IsString, IsObject, IsOptional } from 'class-validator';

export class NotificationDto {
  @IsOptional()
  @IsString()
  receiverId: string;

  @IsOptional()
  @IsString()
  roleId: string;

  @IsNotEmpty()
  @IsString()
  message: string;

  @IsNotEmpty()
  @IsString()
  type: string;

  @IsNotEmpty()
  @IsObject()
  payload: Record<string, any>;
}

export class SendEmailDto {
  emails: string[]; // recipient emails
  subject: string;
  message: string; // plain message content
  buttonText?: string; // optional button text
  actionUrl?: string; // optional link for button
}
