import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ChatRepository {
  constructor(private readonly prisma: PrismaService) {}

  //conversation
  async createConversation(data: any) {
    console.log('Creating on the repos :: ', data);

    return this.prisma.conversation.create({
      data,
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });
  }

  getConversationById(conversationId: string) {
    return this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              },
            },
          },
        },
      },
    });
  }

  addMember(conversationId: string, userId: string) {
    return this.prisma.conversationMember.create({
      data: {
        conversationId,
        userId,
      },
    });
  }

  getUserConversations(userId: string) {
    console.log('Inside repo :: ', userId);

    return this.prisma.conversationMember.findMany({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        conversation: {
          include: {
            messages: {
              orderBy: { createdAt: 'desc' },
              take: 30, // last message preview
              include:{
                statuses: {
                  select:{
                    id: true,
                    status: true,
                    timestamp: true
                  }
                }
              }
            },
            members: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  async validateUserRoom(conversationId: string, userId: string) {
    return this.prisma.conversationMember.findFirst({
      where: { conversationId, userId },
    });
  }

  //message

  createMessage(data: any) {
    return this.prisma.message.create({
      data,
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        replyToMessage: true,
        statuses: true,
      },
    });
  }

  getMessages(conversationId: string, limit = 50, cursor?: string) {
    return this.prisma.message.findMany({
      where: { conversationId },
      take: limit,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: { createdAt: 'desc' },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        replyToMessage: true,
        reactions: true,
        statuses: true,
      },
    });
  }

  markMessageRead(messageId: string, userId: string) {
    return this.prisma.messageStatus.upsert({
      where: {
        messageId_userId: { messageId, userId },
      },
      update: { status: 'SEEN', timestamp: new Date() },
      create: {
        messageId,
        userId,
        status: 'SEEN',
      },
    });
  }
}
