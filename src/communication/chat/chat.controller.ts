import { Injectable, UseGuards } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CheckPermission } from '../../common/decorator/check-permission.decorator';
import { PermissionGuard } from '../../common/permission.guard';
import { RateLimitGuard } from '../../common/rate-limit.guard';
import { PATTERNS } from '../../contracts';
import { PermissionActions } from '../../contracts/permission-actions.enum';
import { ChatUseCaseImpl } from './chat.usecase.impl';
import {
  CreateConversationDto,
  CreateMessageDto,
  MarkReadDto,
  ReplyMessageDto,
  SendFileMessageDto,
} from './chat.entity';
import { IResponse } from '../../common/types';

@Injectable()
export class ChatMessageController {
  constructor(private readonly chatService: ChatUseCaseImpl) {}

  //conversation
  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Chat', PermissionActions.READ)
  @MessagePattern(PATTERNS.CHAT_SEND_MESSAGE)
  async sendMessage(@Payload() payload: { data: CreateMessageDto; user: any }) {
    const userId = payload.user.sub;
    const result= await this.chatService.sendTextMessage(payload.data, userId);
    return IResponse.success('Message sent successfully', result);
  }

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Chat', PermissionActions.READ)
  @MessagePattern(PATTERNS.CHAT_REPLY_MESSAGE)
  async replyMessage(@Payload() payload: { data: ReplyMessageDto; user: any }) {
    const userId = payload.user.sub;
    const result = await this.chatService.replyToMessage(payload.data, userId);
    return IResponse.success('Reply Message sent successfully', result);
  }

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Chat', PermissionActions.READ)
  @MessagePattern(PATTERNS.CHAT_SEND_FILE)
  async sendFile(@Payload() payload: { data: SendFileMessageDto; user: any }) {
    const userId = payload.user.sub;
    const result = await this.chatService.sendMedia(payload.data, userId);
    return IResponse.success('File Message sent successfully', result);
  }

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Chat', PermissionActions.READ)
  @MessagePattern(PATTERNS.CHAT_MARK_AS_READ)
  async markRead(@Payload() payload: { data: MarkReadDto; user: any }) {
    const userId = payload.user.sub;
    const result = await this.chatService.markRead(payload.data.messageId, userId);
    return IResponse.success('Message marked as read successfully', result);
  }

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Chat', PermissionActions.READ)
  @MessagePattern(PATTERNS.CHAT_GET_MESSAGES)
  async getMessages(
    @Payload()
    payload: {
      conversationId: string;
      limit?: string;
      cursor?: string;
      user: any;
    },
  ) {
    const userId = payload.user.sub;
    const take = payload.limit ? parseInt(payload.limit) : 50;
    const result = await this.chatService.getConversationMessages(
      payload.conversationId,
      take,
      payload.cursor,
    );
    return IResponse.success('Messages fetched successfully', result);
  }

  //chat

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Chat', PermissionActions.READ)
  @MessagePattern(PATTERNS.CHAT_START_CONVERSATION)
  async createConversation(
    @Payload() payload: { data: CreateConversationDto; user: any },
  ) {
    
    const userId = payload.user.sub;
    console.log("Creating conversation with data ::: ", payload.data, " and user Id :: ", userId);
    const result = await this.chatService.createConversation(payload.data, userId);
    return IResponse.success('Conversation created successfully', result);
  }

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Chat', PermissionActions.READ)
  @MessagePattern(PATTERNS.CHAT_GET_USER_CONVERSATIONS)
  async getUserConversations(@Payload() payload: { user: any }) {
    const userId = payload.user.sub;
    const result = await this.chatService.getUserConversations(userId);
    return IResponse.success('Conversations fetched successfully', result);
  }

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Chat', PermissionActions.READ)
  @MessagePattern(PATTERNS.CHAT_GET_CONVERSATION)
  async getConversation(@Payload() payload: { conversationId: string }) {
    const result = await this.chatService.getConversationDetails(payload.conversationId);
    return IResponse.success('Conversation fetched successfully', result);
  }
}
