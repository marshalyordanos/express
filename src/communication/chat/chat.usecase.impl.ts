import {
  Injectable,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import {
  CreateConversationDto,
  CreateMessageDto,
  ReplyMessageDto,
  SendFileMessageDto,
} from './chat.entity';
import { ChatRepository } from './chat.repository';
import { handleCatch } from '../../common/handleCatch';
import { CloudinaryUploaderService } from '../../common/cloudinary/cloudinary-uploader.service';

@Injectable()
export class ChatUseCaseImpl {
  constructor(
    private chatRepo: ChatRepository,
    private readonly cloudinaryUploader: CloudinaryUploaderService,
  ) {}

  //conversation
  async createConversation(dto: CreateConversationDto, userId: string) {
    try {

      if (dto.type === 'DIRECT' && !dto.memberIds.length) {
        throw new BadRequestException('Direct chats must have members.');
      }

      dto.memberIds.push(userId);
      return this.chatRepo.createConversation({
        type: dto.type,
        title: dto.title || null,
        createdById: userId,
        members: {
          create: dto.memberIds.map((id) => ({
            userId: id,
            role: userId === id ? 'ADMIN' : 'MEMBER',
          })),
        },
      });
    } catch (error) {
      handleCatch(error);
    }
  }

  async getUserConversations(userId: string) {
    try {
      return this.chatRepo.getUserConversations(userId);
    } catch (error) {
      handleCatch(error);
    }
  }

  async getConversationDetails(conversationId: string) {
    try {
      return this.chatRepo.getConversationById(conversationId);
    } catch (error) {
      handleCatch(error);
    }
  }

  //message
  private async validateUserInRoom(conversationId: string, userId: string) {
    const exists = await this.chatRepo.validateUserRoom(conversationId, userId);
    if (!exists)
      throw new ForbiddenException('You are not in this conversation');
  }

  async sendTextMessage(dto: CreateMessageDto, userId: string) {
    try {
      await this.validateUserInRoom(dto.conversationId, userId);

      return this.chatRepo.createMessage({
        type: 'TEXT',
        conversationId: dto.conversationId,
        senderId: userId,
        content: dto.content,
      });
    } catch (error) {
      handleCatch(error);
    }
  }

  async replyToMessage(dto: ReplyMessageDto, userId: string) {
    try {

      await this.validateUserInRoom(dto.conversationId, userId);

      return this.chatRepo.createMessage({
        type: 'TEXT',
        conversationId: dto.conversationId,
        senderId: userId,
        content: dto.content,
        replyToMessageId: dto.replyToMessageId ?? null,
      });
    } catch (error) {
      handleCatch(error);
    }
  }

  async sendMedia(dto: SendFileMessageDto, userId: string) {
    try {
      await this.validateUserInRoom(dto.conversationId, userId);

      // -------------------------------------------------------------------
      // 1. 🔥 Upload images to Cloudinary
      // -------------------------------------------------------------------
      let imageData = null;

      let imageBuffer: Buffer | null = null;

      if (dto.image) {
        // Convert plain object to Buffer
        if (dto.image.type === 'Buffer' && Array.isArray(dto.image.data)) {
          imageBuffer = Buffer.from(dto.image.data);
        } else if (Buffer.isBuffer(dto.image)) {
          imageBuffer = dto.image;
        }
      }

      if (dto.image) {
        imageData = await this.cloudinaryUploader.uploadFile(
          imageBuffer,
          `chat/${dto.conversationId}/images`,
        );
      }
      const url = imageData?.url;

      return this.chatRepo.createMessage({
        type: 'FILE',
        conversationId: dto.conversationId,
        senderId: userId,
        mediaUrl: url,
        content: dto.content ?? null,
        // mediaMimeType: dto.mediaMimeType,
        // mediaSize: dto.mediaSize,
      });
    } catch (error) {
      handleCatch(error);
    }
  }

  async markRead(messageId: string, userId: string) {
    try {
      return this.chatRepo.markMessageRead(messageId, userId);
    } catch (error) {
      handleCatch(error);
    }
  }

  async getConversationMessages(
    conversationId: string,
    limit: number,
    cursor?: string,
  ) {
    try {
      return this.chatRepo.getMessages(conversationId, limit, cursor);
    } catch (error) {
      handleCatch(error);
    }
  }
}
