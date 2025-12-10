import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SystemConfigController } from './controllers/system-config.controller';
import { SystemConfigService } from './services/system-config.service';
import { SystemConfigEntity } from './entities/system-config.entity';
import { SystemLogController } from './controllers/system-log.controller';
import { SystemLogService } from './services/system-log.service';
import { SystemLogEntity } from './entities/system-log.entity';
import { SystemMonitorController } from './controllers/system-monitor.controller';
import { SystemMonitorService } from './services/system-monitor.service';
import { SystemBackupController } from './controllers/system-backup.controller';
import { SystemBackupService } from './services/system-backup.service';
import { SystemDiagnosisController } from './controllers/system-diagnosis.controller';
import { SystemDiagnosisService } from './services/system-diagnosis.service';

@Module({
  imports: [TypeOrmModule.forFeature([
    SystemConfigEntity,
    SystemLogEntity
  ])],
  controllers: [
    SystemConfigController,
    SystemLogController,
    SystemMonitorController,
    SystemBackupController,
    SystemDiagnosisController
  ],
  providers: [
    SystemConfigService,
    SystemLogService,
    SystemMonitorService,
    SystemBackupService,
    SystemDiagnosisService
  ],
  exports: [SystemConfigService]
})
export class SystemModule {}