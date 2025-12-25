import { registerAs } from '@nestjs/config';

/**
 * WebSocket配置
 */
export default registerAs('websocket', () => ({
  namespace: process.env.WEBSOCKET_NAMESPACE || '/im',
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: process.env.CORS_CREDENTIALS === 'true',
  },
  transports: (process.env.WEBSOCKET_TRANSPORTS || 'websocket,polling').split(','),
  pingTimeout: parseInt(process.env.WEBSOCKET_PING_TIMEOUT || '60000', 10),
  pingInterval: parseInt(process.env.WEBSOCKET_PING_INTERVAL || '25000', 10),
}));
