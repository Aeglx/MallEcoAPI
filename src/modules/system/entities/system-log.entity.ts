import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('system_log')
@Index(['logType', 'createdAt'])
@Index(['userId', 'createdAt'])
@Index(['module', 'createdAt'])
export class SystemLogEntity {
  @ApiProperty({ description: '日志ID' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: '日志类型' })
  @Column({ length: 50 })
  logType: string;

  @ApiProperty({ description: '日志级别' })
  @Column({ length: 20, default: 'info' })
  level: string;

  @ApiProperty({ description: '模块名称' })
  @Column({ length: 100 })
  module: string;

  @ApiProperty({ description: '操作描述' })
  @Column({ length: 500 })
  description: string;

  @ApiProperty({ description: '操作详情' })
  @Column({ type: 'text', nullable: true })
  details: string;

  @ApiProperty({ description: '用户ID' })
  @Column({ nullable: true })
  userId: number;

  @ApiProperty({ description: '用户名' })
  @Column({ length: 100, nullable: true })
  username: string;

  @ApiProperty({ description: '用户IP地址' })
  @Column({ length: 50, nullable: true })
  ipAddress: string;

  @ApiProperty({ description: '用户代理' })
  @Column({ length: 500, nullable: true })
  userAgent: string;

  @ApiProperty({ description: '请求方法' })
  @Column({ length: 10, nullable: true })
  requestMethod: string;

  @ApiProperty({ description: '请求URL' })
  @Column({ length: 500, nullable: true })
  requestUrl: string;

  @ApiProperty({ description: '请求参数' })
  @Column({ type: 'text', nullable: true })
  requestParams: string;

  @ApiProperty({ description: '响应状态码' })
  @Column({ nullable: true })
  responseStatus: number;

  @ApiProperty({ description: '响应时间(毫秒)' })
  @Column({ nullable: true })
  responseTime: number;

  @ApiProperty({ description: '错误信息' })
  @Column({ type: 'text', nullable: true })
  errorMessage: string;

  @ApiProperty({ description: '错误堆栈' })
  @Column({ type: 'text', nullable: true })
  errorStack: string;

  @ApiProperty({ description: '创建时间' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: '业务ID' })
  @Column({ nullable: true })
  businessId: number;

  @ApiProperty({ description: '业务类型' })
  @Column({ length: 100, nullable: true })
  businessType: string;
}