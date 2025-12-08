import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateConversationDto {

  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value.trim())
  type: 'DIRECT' | 'GROUP';

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value.trim())
  title?: string;

  @IsNotEmpty()
  @IsString({ each: true })
  @Transform(({ value }) => value.map((v: string) => v.trim()))
  memberIds: string[];

  // createdBy: string;
}

export class CreateMessageDto {
  @IsNotEmpty()
  @IsString()
  conversationId: string;

  // @IsNotEmpty()
  // @IsString()
  // senderId: string;

  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value.trim())
  content: string;
}

export class ReplyMessageDto {
  @IsNotEmpty()
  @IsString()
  conversationId: string;

  // @IsNotEmpty()
  // @IsString()
  // @Transform(({ value }) => value.trim())
  // senderId: string;

  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value.trim())
  content: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value.trim())
  replyToMessageId?: string;
}

export class SendFileMessageDto {
  @IsNotEmpty()
  @IsString()
  conversationId: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value.trim())
  content: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value.trim())
  mediaUrl: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value.trim())
  mediaMimeType: string;

  @IsOptional()
  @Transform(({ value }) => value.trim())
  mediaSize: number;

  @IsOptional()
  image: any;
}

export class MarkReadDto {

  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value.trim())
  messageId: string;
  // userId: string;
}
