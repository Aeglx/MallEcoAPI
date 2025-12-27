import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { WebSocketJwtGuard } from '../guards/websocket-jwt.guard';
import {
  MessageOperationDto,
  MessageResultType,
  OperationType,
} from '../dto/websocket-message.dto';
import { MessageTypeEnum } from '../enums/message-type.enum';
import { ImMessageService } from '../services/im-message.service';
import { ImTalkService } from '../services/im-talk.service';

/**
 * IM WebSocket网关
 */
@Injectable()
@WebSocketGateway({
  namespace: '/im',
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  },
  transports: ['websocket', 'polling'],
})
@UseGuards(WebSocketJwtGuard)
export class ImWebSocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(ImWebSocketGateway.name);
  private readonly sessionPools = new Map<string, Socket>();

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly imMessageService: ImMessageService,
    private readonly imTalkService: ImTalkService,
  ) {}

  handleConnection(client: Socket) {
    // JWT认证已在WebSocketJwtGuard中完成
    const user = (client as any).user;
    if (!user || !user.id) {
      this.logger.warn('Connection rejected: no user info');
      client.disconnect();
      return;
    }

    const userId = user.id;

    // 如果已有会话，则进行下线提醒
    if (this.sessionPools.has(userId)) {
      this.logger.log(`User duplicate login, old user offline: ${userId}`);
      const oldSocket = this.sessionPools.get(userId);
      if (oldSocket) {
        oldSocket.emit('message', {
          messageResultType: MessageResultType.OFFLINE,
          result: '用户异地登陆',
        });
        oldSocket.disconnect();
      }
    }

    this.sessionPools.set(userId, client);
    this.logger.log(`User connected: ${userId}`);

    // 发送连接成功消息
    client.emit('message', {
      messageResultType: MessageResultType.MESSAGE,
      data: {
        type: 'connected',
        userId,
        timestamp: new Date().toISOString(),
      },
    });
  }

  handleDisconnect(client: Socket) {
    const user = (client as any).user;
    if (user && user.id) {
      const userId = user.id;
      this.sessionPools.delete(userId);
      this.logger.log(`User disconnected: ${userId}`);
    }
  }

  @SubscribeMessage('message')
  async handleMessage(@MessageBody() data: MessageOperationDto, @ConnectedSocket() client: Socket) {
    const user = (client as any).user;
    const userId = user?.id;

    this.logger.log(`Received message: ${JSON.stringify(data)}`);

    try {
      switch (data.operationType) {
        case OperationType.PING:
          // 心跳检测
          client.emit('message', {
            messageResultType: MessageResultType.MESSAGE,
            data: { type: 'pong', timestamp: new Date().toISOString() },
          });
          break;

        case OperationType.MESSAGE:
          if (userId && data.to && data.context) {
            await this.handleSendMessage(data, userId);
          } else {
            client.emit('message', {
              messageResultType: MessageResultType.ERROR,
              error: '消息参数不完整',
            });
          }
          break;

        case OperationType.READ:
          if (data.talkId && userId) {
            await this.imMessageService.read(data.talkId, userId);
            client.emit('message', {
              messageResultType: MessageResultType.MESSAGE,
              data: { type: 'read', talkId: data.talkId, success: true },
            });
          }
          break;

        case OperationType.UNREAD:
          if (userId) {
            const unreadMessages = await this.imMessageService.unReadMessages(userId);
            this.sendMessage(userId, {
              messageResultType: MessageResultType.UN_READ,
              data: unreadMessages,
            });
          }
          break;

        case OperationType.HISTORY:
          if (data.to && userId) {
            const historyMessages = await this.imMessageService.historyMessage(userId, data.to);
            this.sendMessage(userId, {
              messageResultType: MessageResultType.HISTORY,
              data: historyMessages,
            });
          }
          break;

        default:
          client.emit('message', {
            messageResultType: MessageResultType.ERROR,
            error: '不支持的操作类型',
          });
      }
    } catch (error) {
      this.logger.error('Handle message error:', error);
      client.emit('message', {
        messageResultType: MessageResultType.ERROR,
        error: error instanceof Error ? error.message : '处理消息时发生错误',
      });
    }
  }

  /**
   * 处理发送消息
   */
  private async handleSendMessage(data: MessageOperationDto, fromUserId: string) {
    if (!data.to || !data.context) {
      return;
    }

    // 获取或创建聊天会话
    const talk = await this.imTalkService.getTalkByUser(fromUserId, data.to);
    if (!talk) {
      this.logger.error(`Failed to get or create talk for users: ${fromUserId} and ${data.to}`);
      return;
    }

    const talkId = data.talkId || talk.id.toString();

    // 保存消息到数据库
    const message = await this.imMessageService.sendMessage({
      fromUser: fromUserId,
      toUser: data.to,
      talkId,
      text: data.context,
      messageType: data.messageType || MessageTypeEnum.MESSAGE,
      isRead: false,
    });

    // 更新聊天最后消息
    await this.imTalkService.updateLastMessage(
      talkId,
      data.context,
      data.messageType || MessageTypeEnum.MESSAGE,
    );

    this.logger.log(`Send message from ${fromUserId} to ${data.to}: ${data.context}`);

    // 发送消息给接收者
    if (data.to) {
      this.sendMessage(data.to, {
        messageResultType: MessageResultType.MESSAGE,
        data: message,
      });
    }

    // 同时发送确认消息给发送者
    this.sendMessage(fromUserId, {
      messageResultType: MessageResultType.MESSAGE,
      data: { ...message, status: 'sent' },
    });
  }

  /**
   * 发送消息给指定用户
   */
  private sendMessage(userId: string, message: any) {
    const socket = this.sessionPools.get(userId);
    if (socket) {
      socket.emit('message', message);
    } else {
      this.logger.warn(`User ${userId} is not online, message not sent`);
    }
  }

  /**
   * 广播消息给所有在线用户
   */
  broadcast(message: any) {
    this.server.emit('message', message);
  }

  /**
   * 获取在线用户数
   */
  getOnlineCount(): number {
    return this.sessionPools.size;
  }

  /**
   * 检查用户是否在线
   */
  isUserOnline(userId: string): boolean {
    return this.sessionPools.has(userId);
  }
}
