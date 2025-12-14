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
import { SystemVersionController } from './controllers/system-version.controller';
import { SystemVersionService } from './services/system-version.service';
import { SystemVersion } from './entities/system-version.entity';
import { SystemDiagnosisController } from './controllers/system-diagnosis.controller';
import { SystemDiagnosisService } from './services/system-diagnosis.service';
import { SystemDiagnosis } from './entities/system-diagnosis.entity';
import { PerformanceMonitorController } from './controllers/performance-monitor.controller';
import { PerformanceMonitorService } from './services/performance-monitor.service';
import { AuditLogService } from './services/audit-log.service';
import { DatabaseManagementController } from './controllers/database-management.controller';

@Module({
  imports: [TypeOrmModule.forFeature([
    SystemConfigEntity,
    SystemLogEntity,
    SystemVersion,
    SystemDiagnosis
  ])],
  controllers: [
    SystemConfigController,
    SystemLogController,
    SystemMonitorController,
    SystemBackupController,
    SystemVersionController,
    SystemDiagnosisController,
    PerformanceMonitorController,
    DatabaseManagementController
  ],
  providers: [
    SystemConfigService,
    SystemLogService,
    SystemMonitorService,
    SystemBackupService,
    SystemVersionService,
    SystemDiagnosisService,
    PerformanceMonitorService,
    AuditLogService
  ],
  exports: [SystemConfigService, SystemVersionService, SystemDiagnosisService, PerformanceMonitorService, AuditLogService]
})
export class SystemModule {}