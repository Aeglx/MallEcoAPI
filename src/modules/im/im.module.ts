import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessageController } from './controllers/message.controller';
import { ImWebSocketGateway } from './gateways/im-websocket.gateway';
import { WebSocketJwtGuard } from './guards/websocket-jwt.guard';
import { ImMessageEntity } from './entities/im-message.entity';
import { ImTalkEntity } from './entities/im-talk.entity';
import { ImMessageService } from './services/im-message.service';
import { ImTalkService } from './services/im-talk.service';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([ImMessageEntity, ImTalkEntity]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const expiresIn = configService.get<string>('JWT_EXPIRES_IN') || '7d';
        return {
          secret: configService.get<string>('JWT_SECRET') || 'your-secret-key',
          signOptions: {
            expiresIn: expiresIn as any, // JWT accepts string like '7d', '1h', etc.
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [MessageController],
  providers: [
    ImWebSocketGateway,
    WebSocketJwtGuard,
    ImMessageService,
    ImTalkService,
  ],
  exports: [ImWebSocketGateway, ImMessageService, ImTalkService],
})
export class ImModule {}