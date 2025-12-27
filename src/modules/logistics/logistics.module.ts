import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MallLogistics } from './entities/logistics.entity';
import { LogisticsController } from './controllers/logistics.controller';
import { LogisticsService } from './services/logistics.service';
import { Kuaidi100Plugin } from './plugins/kuaidi100.plugin';

@Module({
  imports: [TypeOrmModule.forFeature([MallLogistics])],
  controllers: [LogisticsController],
  providers: [
    LogisticsService,
    Kuaidi100Plugin,
    {
      provide: 'LOGISTICS_PLUGINS',
      useFactory: (logisticsService: LogisticsService, kuaidi100Plugin: Kuaidi100Plugin) => {
        // 注册所有物流插件
        logisticsService.registerPlugin(kuaidi100Plugin);
        return [];
      },
      inject: [LogisticsService, Kuaidi100Plugin],
    },
  ],
  exports: [LogisticsService],
})
export class LogisticsModule {}
