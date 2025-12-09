// 测试即时通讯模块功能
import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { ChatMessageService } from './modules/im/services/chat-message.service';
import { ImTalkService } from './modules/im/services/im-talk.service';

async function testImModule() {
  const app = await NestFactory.create(AppModule);
  
  // 获取服务实例
  const chatMessageService = app.get(ChatMessageService);
  const imTalkService = app.get(ImTalkService);
  
  try {
    console.log('开始测试即时通讯模块...');
    
    // 测试1: 创建或获取会话
    console.log('测试1: 创建或获取会话');
    const userId1 = 'user-001';
    const userId2 = 'user-002';
    
    let talk = await imTalkService.getTalkByUser(userId1, userId2);
    console.log('当前会话:', talk ? '存在' : '不存在');
    
    if (!talk) {
      talk = await imTalkService.createOrGetTalk(
        userId1, 
        userId2,
        { name: '用户1', avatar: 'avatar1.jpg', isStore: false },
        { name: '用户2', avatar: 'avatar2.jpg', isStore: true }
      );
      console.log('创建新会话:', talk.id);
    }
    
    // 测试2: 创建聊天消息
    console.log('\n测试2: 创建聊天消息');
    const chatMessage = await chatMessageService.createChatMessage({
      chatRoomId: 'room-001',
      senderId: userId1,
      receiverId: userId2,
      content: '你好，这是一条测试消息！',
      type: 'text'
    });
    console.log('创建消息成功:', chatMessage.id);
    
    // 测试3: 验证会话最后一条消息是否更新
    console.log('\n测试3: 验证会话最后一条消息是否更新');
    const updatedTalk = await imTalkService.getTalkByUser(userId1, userId2);
    if (updatedTalk) {
      console.log('会话最后一条消息:', updatedTalk.lastTalkMessage);
      console.log('最后消息类型:', updatedTalk.lastMessageType);
      console.log('最后聊天时间:', updatedTalk.lastTalkTime);
      
      if (updatedTalk.lastTalkMessage === chatMessage.content && 
          updatedTalk.lastMessageType === chatMessage.type) {
        console.log('✅ 会话最后一条消息更新成功！');
      } else {
        console.log('❌ 会话最后一条消息更新失败！');
      }
    }
    
    // 测试4: 再发送一条消息
    console.log('\n测试4: 再发送一条消息');
    const chatMessage2 = await chatMessageService.createChatMessage({
      chatRoomId: 'room-001',
      senderId: userId2,
      receiverId: userId1,
      content: '收到了，谢谢！',
      type: 'text'
    });
    console.log('创建消息成功:', chatMessage2.id);
    
    // 测试5: 再次验证会话最后一条消息
    console.log('\n测试5: 再次验证会话最后一条消息');
    const updatedTalk2 = await imTalkService.getTalkByUser(userId1, userId2);
    if (updatedTalk2) {
      console.log('会话最后一条消息:', updatedTalk2.lastTalkMessage);
      if (updatedTalk2.lastTalkMessage === chatMessage2.content) {
        console.log('✅ 会话最后一条消息再次更新成功！');
      } else {
        console.log('❌ 会话最后一条消息再次更新失败！');
      }
    }
    
    console.log('\n🎉 即时通讯模块测试完成！');
    
  } catch (error) {
    console.error('测试失败:', error);
  } finally {
    await app.close();
  }
}

testImModule();
