// 简单的RabbitMQ测试脚本
const amqp = require('amqplib');

async function testRabbitMQConnection() {
  try {
    // 连接到RabbitMQ服务器
    const connection = await amqp.connect('amqp://localhost:5672');
    
    // 创建通道
    const channel = await connection.createChannel();
    
    // 声明队列
    const queue = 'mall_eco_queue';
    await channel.assertQueue(queue, { durable: true });
    
    // 发送测试消息
    const message = JSON.stringify({ 
      test: 'Hello from RabbitMQ test script',
      timestamp: new Date().toISOString() 
    });
    
    channel.sendToQueue(queue, Buffer.from(message), { 
      persistent: true,
      type: 'test.message'
    });
    
    console.log('✓ 成功连接到RabbitMQ');
    console.log('✓ 成功发送测试消息');
    
    // 消费测试消息
    console.log('等待接收测试消息...');
    channel.consume(queue, (msg) => {
      if (msg) {
        console.log('✓ 成功接收测试消息:');
        console.log(JSON.parse(msg.content.toString()));
        channel.ack(msg);
        
        // 关闭连接
        setTimeout(() => {
          connection.close();
          console.log('\n测试完成，连接已关闭');
        }, 1000);
      }
    }, { noAck: false });
    
  } catch (error) {
    console.error('✗ RabbitMQ测试失败:', error.message);
    console.error('确保RabbitMQ服务器正在运行，并且配置正确');
    
    // 尝试连接到默认RabbitMQ服务器
    console.log('\n尝试连接到默认RabbitMQ服务器...');
    try {
      const connection = await amqp.connect('amqp://localhost:5672');
      console.log('✓ 成功连接到默认RabbitMQ服务器');
      await connection.close();
    } catch (defaultError) {
      console.error('✗ 无法连接到默认RabbitMQ服务器:', defaultError.message);
      console.error('请确保RabbitMQ服务器正在运行，并且配置正确');
    }
  }
}

testRabbitMQConnection();