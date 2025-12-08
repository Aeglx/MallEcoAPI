import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { MemberMessageService } from '../../modules/message/services/member-message.service';
import { StoreMessageService } from '../../modules/message/services/store-message.service';

@Controller()
export class MessageMessageHandler {
  constructor(
    private readonly memberMessageService: MemberMessageService,
    private readonly storeMessageService: StoreMessageService
  ) {}

  // 会员消息事件处理
  @EventPattern('member.message.created')
  async handleMemberMessageCreated(@Payload() data: any) {
    console.log('Received member.message.created event:', data);
    // 这里可以添加消息创建后的额外逻辑，比如发送通知、更新统计数据等
  }

  @EventPattern('member.message.batch.created')
  async handleMemberMessageBatchCreated(@Payload() data: any) {
    console.log('Received member.message.batch.created event:', data);
    // 批量消息创建后的处理逻辑
  }

  @EventPattern('member.message.broadcast')
  async handleMemberMessageBroadcast(@Payload() data: any) {
    console.log('Received member.message.broadcast event:', data);
    // 广播消息的处理逻辑
  }

  @EventPattern('member.message.status.updated')
  async handleMemberMessageStatusUpdated(@Payload() data: any) {
    console.log('Received member.message.status.updated event:', data);
    // 消息状态更新后的处理逻辑
  }

  @EventPattern('member.message.all.read')
  async handleMemberMessageAllRead(@Payload() data: any) {
    console.log('Received member.message.all.read event:', data);
    // 标记全部已读后的处理逻辑
  }

  // 店铺消息事件处理
  @EventPattern('store.message.created')
  async handleStoreMessageCreated(@Payload() data: any) {
    console.log('Received store.message.created event:', data);
    // 店铺消息创建后的处理逻辑
  }

  @EventPattern('store.message.batch.created')
  async handleStoreMessageBatchCreated(@Payload() data: any) {
    console.log('Received store.message.batch.created event:', data);
    // 店铺批量消息创建后的处理逻辑
  }

  @EventPattern('store.message.broadcast')
  async handleStoreMessageBroadcast(@Payload() data: any) {
    console.log('Received store.message.broadcast event:', data);
    // 店铺广播消息的处理逻辑
  }

  @EventPattern('store.message.status.updated')
  async handleStoreMessageStatusUpdated(@Payload() data: any) {
    console.log('Received store.message.status.updated event:', data);
    // 店铺消息状态更新后的处理逻辑
  }

  @EventPattern('store.message.all.read')
  async handleStoreMessageAllRead(@Payload() data: any) {
    console.log('Received store.message.all.read event:', data);
    // 店铺标记全部已读后的处理逻辑
  }
}