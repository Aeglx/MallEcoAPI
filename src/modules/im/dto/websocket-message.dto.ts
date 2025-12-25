import { MessageTypeEnum } from '../enums/message-type.enum';

/**
 * 消息操作类型
 */
export enum OperationType {
  PING = 'PING',
  MESSAGE = 'MESSAGE',
  READ = 'READ',
  UNREAD = 'UNREAD',
  HISTORY = 'HISTORY',
}

/**
 * 消息结果类型
 */
export enum MessageResultType {
  MESSAGE = 'MESSAGE',
  UN_READ = 'UN_READ',
  HISTORY = 'HISTORY',
  OFFLINE = 'OFFLINE',
  ERROR = 'ERROR',
}

/**
 * 消息操作DTO
 */
export class MessageOperationDto {
  operationType: OperationType;
  from?: string;
  to?: string;
  talkId?: string;
  context?: string;
  messageType?: MessageTypeEnum;
}

/**
 * 消息响应DTO
 */
export class MessageResponseDto {
  messageResultType: MessageResultType;
  data?: any;
  result?: string;
  error?: string;
}

