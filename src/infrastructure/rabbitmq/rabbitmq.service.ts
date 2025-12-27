import { Injectable } from '@nestjs/common';
import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RabbitMQService {
  private client: ClientProxy | null = null;

  constructor(private readonly configService: ConfigService) {
    // 延迟创建客户端实例，直到第一次使用时
  }

  /**
   * 获取或创建ClientProxy实例
   * @returns ClientProxy实例
   */
  private getClient(): ClientProxy | null {
    // 检查是否启用了RabbitMQ
    const isEnabled = this.configService.get<boolean>('RABBITMQ_ENABLED', false);
    if (!isEnabled) {
      return null;
    }

    if (!this.client) {
      try {
        this.client = ClientProxyFactory.create({
          transport: Transport.RMQ,
          options: {
            urls: [this.configService.get<string>('RABBITMQ_URL', 'amqp://localhost:5672')],
            queue: this.configService.get<string>('RABBITMQ_QUEUE', 'mall_eco_queue'),
            queueOptions: {
              durable: true,
            },
          },
        });
      } catch (error) {
        console.error('Failed to create RabbitMQ client:', error);
        return null;
      }
    }
    return this.client;
  }

  /**
   * 发送消息到RabbitMQ
   * @param pattern 消息模式
   * @param data 消息数据
   * @returns Promise<any>
   */
  async send<T>(pattern: string, data: any): Promise<T> {
    const client = this.getClient();
    if (!client) {
      console.warn('RabbitMQ client is not available, skipping send operation');
      return null as any;
    }

    try {
      return await client.send<T>(pattern, data).toPromise();
    } catch (error) {
      console.error('Failed to send message to RabbitMQ:', error);
      return null as any;
    }
  }

  /**
   * 发布消息到RabbitMQ
   * @param pattern 消息模式
   * @param data 消息数据
   */
  async emit(pattern: string, data: any): Promise<void> {
    const client = this.getClient();
    if (!client) {
      console.warn('RabbitMQ client is not available, skipping emit operation');
      return;
    }

    try {
      await client.emit(pattern, data).toPromise();
    } catch (error) {
      console.error('Failed to emit message to RabbitMQ:', error);
      // 记录错误并继续执行
    }
  }

  /**
   * 断开RabbitMQ连接
   */
  async close(): Promise<void> {
    if (this.client) {
      try {
        await this.client.close();
      } catch (error) {
        console.error('Failed to close RabbitMQ connection:', error);
      }
      this.client = null;
    }
  }
}
