import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqplib';

interface QueueMessage {
  id: string;
  topic: string;
  data: any;
  timestamp: number;
  headers?: Record<string, any>;
  retryCount?: number;
  maxRetries?: number;
}

interface TransactionMessage extends QueueMessage {
  transactionId: string;
  prepareStatus: 'prepared' | 'committed' | 'rollbacked';
}

@Injectable()
export class AdvancedQueueService implements OnModuleInit, OnModuleDestroy {
  private connection: amqp.Connection;
  private channel: amqp.Channel;
  private transactionChannel: amqp.Channel;
  
  // 消息队列配置
  private readonly EXCHANGE_TYPE = 'topic';
  private readonly DELAYED_EXCHANGE_TYPE = 'x-delayed-message';
  
  // 事务消息存储
  private transactionMessages = new Map<string, TransactionMessage>();

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    await this.initConnection();
    await this.setupExchangesAndQueues();
    console.log('Advanced message queue service initialized');
  }

  async onModuleDestroy() {
    if (this.channel) {
      await this.channel.close();
    }
    if (this.connection) {
      await this.connection.close();
    }
  }

  private async initConnection() {
    try {
      const rabbitmqUrl = this.configService.get('RABBITMQ_URL') || 'amqp://localhost:5672';
      this.connection = await amqp.connect(rabbitmqUrl);
      
      // 创建普通通道
      this.channel = await this.connection.createChannel();
      
      // 创建事务通道
      this.transactionChannel = await this.connection.createChannel();
      await this.transactionChannel.assertExchange('transaction_log', 'fanout', { durable: true });
      
      console.log('RabbitMQ connection established');
    } catch (error) {
      console.error('Failed to connect to RabbitMQ:', error);
      throw error;
    }
  }

  private async setupExchangesAndQueues() {
    // 主业务交换器
    await this.channel.assertExchange('mall_eco_exchange', this.EXCHANGE_TYPE, {
      durable: true,
      autoDelete: false,
    });

    // 延迟消息交换器
    await this.channel.assertExchange('mall_eco_delayed_exchange', this.DELAYED_EXCHANGE_TYPE, {
      durable: true,
      autoDelete: false,
      arguments: { 'x-delayed-type': 'topic' }
    });

    // 事务消息交换器
    await this.channel.assertExchange('mall_eco_transaction_exchange', 'fanout', {
      durable: true,
      autoDelete: false,
    });

    // 定义业务队列
    const queues = [
      { name: 'order_queue', routingKey: 'order.*' },
      { name: 'payment_queue', routingKey: 'payment.*' },
      { name: 'user_queue', routingKey: 'user.*' },
      { name: 'promotion_queue', routingKey: 'promotion.*' },
      { name: 'notification_queue', routingKey: 'notification.*' },
    ];

    for (const queue of queues) {
      await this.channel.assertQueue(queue.name, {
        durable: true,
        deadLetterExchange: 'mall_eco_dlx',
        deadLetterRoutingKey: queue.name,
      });
      
      await this.channel.bindQueue(queue.name, 'mall_eco_exchange', queue.routingKey);
    }

    // 死信队列
    await this.channel.assertExchange('mall_eco_dlx', 'direct', { durable: true });
    await this.channel.assertQueue('mall_eco_dlq', { durable: true });
    await this.channel.bindQueue('mall_eco_dlq', 'mall_eco_dlx', 'dead_letter');
  }

  // ==================== 基础消息发送 ====================

  async sendMessage(topic: string, data: any, options: {
    headers?: Record<string, any>;
    priority?: number;
    persistent?: boolean;
  } = {}) {
    const message: QueueMessage = {
      id: this.generateMessageId(),
      topic,
      data,
      timestamp: Date.now(),
      headers: options.headers || {},
    };

    const messageBuffer = Buffer.from(JSON.stringify(message));
    
    return this.channel.publish('mall_eco_exchange', topic, messageBuffer, {
      persistent: options.persistent ?? true,
      priority: options.priority || 0,
      headers: options.headers,
    });
  }

  // ==================== 事务消息支持 ====================

  async sendTransactionalMessage(
    transactionId: string,
    topic: string,
    data: any
  ): Promise<string> {
    const message: TransactionMessage = {
      id: this.generateMessageId(),
      transactionId,
      topic,
      data,
      timestamp: Date.now(),
      prepareStatus: 'prepared',
    };

    // 存储事务消息
    this.transactionMessages.set(message.id, message);

    // 发送准备消息到事务日志
    const prepareBuffer = Buffer.from(JSON.stringify({
      ...message,
      action: 'prepare'
    }));
    
    await this.transactionChannel.publish('transaction_log', '', prepareBuffer, {
      persistent: true
    });

    return message.id;
  }

  async commitTransaction(transactionId: string): Promise<void> {
    const messages = Array.from(this.transactionMessages.values())
      .filter(msg => msg.transactionId === transactionId && msg.prepareStatus === 'prepared');

    for (const message of messages) {
      // 发送实际业务消息
      await this.sendMessage(message.topic, message.data);
      
      // 更新消息状态
      message.prepareStatus = 'committed';
      
      // 发送提交日志
      const commitBuffer = Buffer.from(JSON.stringify({
        ...message,
        action: 'commit'
      }));
      
      await this.transactionChannel.publish('transaction_log', '', commitBuffer, {
        persistent: true
      });

      // 从存储中移除
      this.transactionMessages.delete(message.id);
    }
  }

  async rollbackTransaction(transactionId: string): Promise<void> {
    const messages = Array.from(this.transactionMessages.values())
      .filter(msg => msg.transactionId === transactionId);

    for (const message of messages) {
      // 更新消息状态
      message.prepareStatus = 'rollbacked';
      
      // 发送回滚日志
      const rollbackBuffer = Buffer.from(JSON.stringify({
        ...message,
        action: 'rollback'
      }));
      
      await this.transactionChannel.publish('transaction_log', '', rollbackBuffer, {
        persistent: true
      });

      // 从存储中移除
      this.transactionMessages.delete(message.id);
    }
  }

  // ==================== 延迟消息支持 ====================

  async sendDelayedMessage(
    topic: string,
    data: any,
    delayMs: number,
    options: {
      headers?: Record<string, any>;
      priority?: number;
    } = {}
  ): Promise<void> {
    const message: QueueMessage = {
      id: this.generateMessageId(),
      topic,
      data,
      timestamp: Date.now(),
      headers: {
        ...options.headers,
        'x-delay': delayMs
      },
    };

    const messageBuffer = Buffer.from(JSON.stringify(message));
    
    await this.channel.publish('mall_eco_delayed_exchange', topic, messageBuffer, {
      persistent: true,
      priority: options.priority || 0,
      headers: message.headers,
    });
  }

  // ==================== 消息消费 ====================

  async consumeMessages(
    queueName: string,
    handler: (message: QueueMessage) => Promise<void>,
    options: {
      prefetch?: number;
      retryEnabled?: boolean;
      maxRetries?: number;
    } = {}
  ): Promise<void> {
    // 设置预取数量
    await this.channel.prefetch(options.prefetch || 1);

    await this.channel.consume(queueName, async (msg) => {
      if (!msg) return;

      try {
        const message: QueueMessage = JSON.parse(msg.content.toString());
        
        // 设置重试计数
        message.retryCount = (message.retryCount || 0) + 1;
        message.maxRetries = options.maxRetries || 3;

        await handler(message);
        
        // 确认消息
        this.channel.ack(msg);
      } catch (error) {
        console.error(`Error processing message from ${queueName}:`, error);
        
        // 检查是否达到最大重试次数
        const message: QueueMessage = JSON.parse(msg.content.toString());
        
        if (message.retryCount >= message.maxRetries) {
          // 达到最大重试次数，发送到死信队列
          console.warn(`Message ${message.id} reached max retries, sending to DLQ`);
          this.channel.reject(msg, false);
        } else {
          // 重新入队进行重试
          this.channel.nack(msg, false, true);
        }
      }
    }, {
      noAck: false,
    });
  }

  // ==================== 优先级消息 ====================

  async sendPriorityMessage(
    topic: string,
    data: any,
    priority: number
  ): Promise<void> {
    await this.sendMessage(topic, data, {
      priority: Math.min(Math.max(priority, 0), 9), // 0-9优先级范围
      persistent: true,
    });
  }

  // ==================== 工具方法 ====================

  private generateMessageId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // 获取队列状态
  async getQueueStats(queueName: string): Promise<{
    messageCount: number;
    consumerCount: number;
    state: string;
  }> {
    try {
      const queueInfo = await this.channel.checkQueue(queueName);
      return {
        messageCount: queueInfo.messageCount,
        consumerCount: queueInfo.consumerCount,
        state: 'ok'
      };
    } catch (error) {
      return {
        messageCount: 0,
        consumerCount: 0,
        state: 'error'
      };
    }
  }

  // 健康检查
  async healthCheck(): Promise<{
    status: string;
    message?: string;
    details?: any;
  }> {
    try {
      if (!this.connection || this.connection.closed) {
        return {
          status: 'unhealthy',
          message: 'Connection closed'
        };
      }

      // 测试连接
      await this.channel.checkQueue('order_queue');
      
      return {
        status: 'healthy',
        details: {
          connection: 'connected',
          transactionMessages: this.transactionMessages.size
        }
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        message: error.message,
        details: { error: error.message }
      };
    }
  }
}