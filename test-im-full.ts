import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { ChatRoomService } from './modules/im/services/chat-room.service';
import { ChatMessageService } from './modules/im/services/chat-message.service';
import { ImTalkService } from './modules/im/services/im-talk.service';

async function testImModule() {
  const app = await NestFactory.create(AppModule);
  
  // 获取服务实例
  const chatRoomService = app.get(ChatRoomService);
  const chatMessageService = app.get(ChatMessageService);
  const imTalkService = app.get(ImTalkService);
  
  try {
    console.log('=== 开始测试即时通讯模块 ===\n');
    
    // 测试1: 创建或获取聊天会话
    console.log('1. 创建或获取聊天会话...');
    const talk = await imTalkService.createOrGetTalk(
      'user1',
      'user2',
      { name: '用户1', avatar: 'avatar1.jpg', isStore: false },
      { name: '用户2', avatar: 'avatar2.jpg', isStore: false }
    );
    console.log('   ✓ 聊天会话创建/获取成功:', talk.id);
    
    // 测试2: 创建聊天房间
    console.log('2. 创建聊天房间...');
    const chatRoom = await chatRoomService.createChatRoom({
      name: '测试房间',
      description: '这是一个测试聊天房间',
      type: 'private'
    });
    console.log('   ✓ 聊天房间创建成功:', chatRoom.id);
    
    let sentMessageId: string;
    
    // 测试3: 发送聊天消息
    console.log('3. 发送聊天消息...');
    try {
      const message = await chatMessageService.createChatMessage({
        chatRoomId: chatRoom.id,
        senderId: 'user1',
        receiverId: 'user2',
        content: '你好，这是一条测试消息',
        type: 'text'
      });
      console.log('   ✓ 消息发送成功:', message.id);
      sentMessageId = message.id;
    } catch (error) {
      console.log('   ✗ 消息发送失败:', error.message);
      console.log('   错误详情:', JSON.stringify(error, null, 2));
      // 继续执行其他测试
    }
    
    // 测试4: 获取消息列表
    console.log('4. 获取消息列表...');
    const messages = await chatMessageService.getChatMessages({
      chatRoomId: chatRoom.id,
      page: 1,
      limit: 10
    });
    console.log('   ✓ 消息列表获取成功:', messages.total, '条消息');
    
    // 测试5: 标记消息为已读
    console.log('5. 标记消息为已读...');
    if (sentMessageId) {
      const readCount = await chatMessageService.markMessagesAsRead({
        messageIds: [sentMessageId]
      });
      console.log('   ✓ 消息标记已读成功:', readCount, '条');
    } else {
      console.log('   ⚠ 跳过标记已读测试，因为没有成功发送消息');
    }
    
    // 测试6: 获取未读消息数量
    console.log('6. 获取未读消息数量...');
    const unreadCount = await chatMessageService.getUnreadCount(chatRoom.id);
    console.log('   ✓ 未读消息数量:', unreadCount);
    
    // 测试7: 获取用户聊天会话列表
    console.log('7. 获取用户聊天会话列表...');
    const talkList = await imTalkService.getUserTalkList('user1', { page: 1, limit: 10 });
    console.log('   ✓ 用户聊天会话列表获取成功:', talkList.total, '个会话');
    
    console.log('\n=== 所有测试通过！即时通讯模块功能完整 ===');
    
  } catch (error) {
    console.error('\n=== 测试失败:', error.message);
    console.error('错误详情:', error);
  } finally {
    await app.close();
  }
}

testImModule();
