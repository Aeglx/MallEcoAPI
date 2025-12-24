import { Module, Global } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { SocialService } from './social.service';
import { SocialController } from './social.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SocialAuthEntity } from './entities/social-auth.entity';
import { UsersModule } from '../modules/users/users.module';
import { JwtModule } from '@nestjs/jwt';

@Global()
@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([SocialAuthEntity]),
    UsersModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '24h' },
    }),
  ],
  controllers: [SocialController],
  providers: [SocialService],
  exports: [SocialService],
})
export class SocialModule {}
