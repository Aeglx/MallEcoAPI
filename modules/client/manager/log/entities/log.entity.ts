import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export enum LogType {
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  DEBUG = 'debug',
  HTTP_REQUEST = 'http_request',
  SYSTEM_EVENT = 'system_event',
  USER_OPERATION = 'user_operation',
}

export enum LogOperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  QUERY = 'query',
  LOGIN = 'login',
  LOGOUT = 'logout',
  OTHER = 'other',
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  PATCH = 'PATCH',
}

export enum LogResult {
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}

@Entity('system_log')
export class Log {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: LogType, default: LogType.INFO, comment: '日志类型' })
  logType: LogType;

  @Column({ type: 'enum', enum: LogOperationType, comment: '操作类型' })
  operationType: LogOperationType;

  @Column({ type: 'varchar', length: 50, nullable: true, comment: '操作人ID' })
  operatorId: string;

  @Column({ type: 'varchar', length: 50, nullable: true, comment: '操作人名称' })
  operatorName: string;

  @Column({ type: 'varchar', length: 200, nullable: true, comment: '操作内容' })
  content: string;

  @Column({ type: 'varchar', length: 50, nullable: true, comment: 'IP地址' })
  ipAddress: string;

  @Column({ type: 'varchar', length: 20, nullable: true, comment: '请求方法' })
  requestMethod: string;

  @Column({ type: 'varchar', length: 200, nullable: true, comment: '请求路径' })
  requestUrl: string;

  @Column({ type: 'int', nullable: true, comment: '响应状态' })
  responseCode: number;

  @Column({ type: 'text', nullable: true, comment: '请求参数' })
  requestParams: string;

  @Column({ type: 'text', nullable: true, comment: '请求体' })
  requestBody: string;

  @Column({ type: 'text', nullable: true, comment: '响应数据' })
  responseData: string;

  @Column({ type: 'int', nullable: true, comment: '执行时间(ms)' })
  responseTime: number;

  @Column({ type: 'enum', enum: LogResult, nullable: true, comment: '操作结果' })
  result: LogResult;

  @Column({ type: 'varchar', length: 500, nullable: true, comment: '用户代理' })
  userAgent: string;

  @Column({ type: 'text', nullable: true, comment: '详情信息' })
  details: string;

  @CreateDateColumn({ type: 'timestamp', comment: '操作时间' })
  operationTime: Date;
}
