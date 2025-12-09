import { Injectable } from '@nestjs/common';
import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RabbitMQService {
  private client: ClientProxy;

  constructor(private readonly configService: ConfigService) {
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
  }

  /**
   * 发送消息到RabbitMQ
   * @param pattern 消息模式
   * @param data 消息数据
   * @returns Promise<any>
   */
  async send<T>(pattern: string, data: any): Promise<T> {
    return this.client.send<T>(pattern, data).toPromise();
  }

  /**
   * 发布消息到RabbitMQ
   * @param pattern 消息模式
   * @param data 消息数据
   */
  async emit(pattern: string, data: any): Promise<void> {
    try {
      await this.client.emit(pattern, data).toPromise();
    } catch (error) {
      console.error('Failed to emit message to RabbitMQ:', error);
      // 可以选择重新抛出或记录错误，这里选择记录错误并继续执行
    }
  }

  /**
   * 断开RabbitMQ连接
   */
  async close(): Promise<void> {
    await this.client.close();
  }
}
