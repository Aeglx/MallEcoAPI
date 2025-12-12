import { registerAs } from '@nestjs/config';

export default registerAs('xxljob', () => ({
  // 定时任务服务配置
  server: {
    port: parseInt(process.env.XXL_JOB_SERVER_PORT, 10) || 9999,
  },
  // 执行器配置
  executor: {
    appName: process.env.XXL_JOB_EXECUTOR_APP_NAME || 'mall-eco-executor',
    ip: process.env.XXL_JOB_EXECUTOR_IP || '127.0.0.1',
    port: parseInt(process.env.XXL_JOB_EXECUTOR_PORT, 10) || 9998,
  },
}));
