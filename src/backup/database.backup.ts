import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import { Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface BackupConfig {
  enabled: boolean;
  schedule: string;
  retentionDays: number;
  backupPath: string;
  compression: boolean;
  encryption: boolean;
  encryptionKey?: string;
  uploadToCloud: boolean;
  cloudConfig?: any;
}

interface BackupResult {
  success: boolean;
  backupFile: string;
  size: number;
  duration: number;
  checksum: string;
  error?: string;
}

interface RestoreResult {
  success: boolean;
  restoredFile: string;
  duration: number;
  error?: string;
}

@Injectable()
export class DatabaseBackupService implements OnModuleInit {
  private readonly logger = new Logger(DatabaseBackupService.name);
  private config: BackupConfig;

  constructor(
    @InjectConnection() private readonly connection: Connection,
    private readonly configService: ConfigService,
  ) {
    this.initializeConfig();
  }

  async onModuleInit() {
    await this.initializeBackupSystem();
  }

  /**
   * 初始化备份配置
   */
  private initializeConfig() {
    this.config = {
      enabled: this.configService.get('BACKUP_ENABLED', 'true') === 'true',
      schedule: this.configService.get('BACKUP_SCHEDULE', '0 2 * * *'), // 每天凌晨2点
      retentionDays: parseInt(this.configService.get('BACKUP_RETENTION_DAYS', '30')),
      backupPath: this.configService.get('BACKUP_PATH', './backups'),
      compression: this.configService.get('BACKUP_COMPRESSION', 'true') === 'true',
      encryption: this.configService.get('BACKUP_ENCRYPTION', 'false') === 'true',
      encryptionKey: this.configService.get('BACKUP_ENCRYPTION_KEY'),
      uploadToCloud: this.configService.get('BACKUP_UPLOAD_CLOUD', 'false') === 'true',
      cloudConfig: {
        provider: this.configService.get('BACKUP_CLOUD_PROVIDER'),
        bucket: this.configService.get('BACKUP_CLOUD_BUCKET'),
        region: this.configService.get('BACKUP_CLOUD_REGION'),
      },
    };

    // 确保备份目录存在
    if (!fs.existsSync(this.config.backupPath)) {
      fs.mkdirSync(this.config.backupPath, { recursive: true });
    }
  }

  /**
   * 初始化备份系统
   */
  private async initializeBackupSystem() {
    if (!this.config.enabled) {
      this.logger.log('Database backup is disabled');
      return;
    }

    // 创建备份记录表
    await this.createBackupTable();

    this.logger.log(`Database backup system initialized. Backup path: ${this.config.backupPath}`);

    // 立即执行一次备份检查
    await this.checkBackupHealth();
  }

  /**
   * 创建备份记录表
   */
  private async createBackupTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS mall_backup_records (
        id INT AUTO_INCREMENT PRIMARY KEY,
        backup_type ENUM('full', 'incremental') NOT NULL,
        backup_file VARCHAR(500) NOT NULL,
        file_size BIGINT NOT NULL,
        checksum VARCHAR(64) NOT NULL,
        status ENUM('success', 'failed', 'in_progress') NOT NULL,
        duration_seconds INT NOT NULL,
        error_message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_backup_type (backup_type),
        INDEX idx_status (status),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    await this.connection.query(query);
  }

  /**
   * 执行完整备份
   */
  async performFullBackup(): Promise<BackupResult> {
    if (!this.config.enabled) {
      return {
        success: false,
        backupFile: '',
        size: 0,
        duration: 0,
        checksum: '',
        error: 'Backup is disabled',
      };
    }

    const startTime = Date.now();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFileName = `malleco_full_${timestamp}.sql`;
    const backupFilePath = path.join(this.config.backupPath, backupFileName);

    try {
      // 记录备份开始
      await this.recordBackupStart('full', backupFileName);

      // 获取数据库配置
      const dbConfig = this.connection.options as any;
      const { host, port, username, password, database } = dbConfig;

      // 构建mysqldump命令
      let dumpCommand = `mysqldump -h ${host} -P ${port} -u ${username}`;

      if (password) {
        dumpCommand += ` -p${password}`;
      }

      dumpCommand += ` ${database} > ${backupFilePath}`;

      // 执行备份
      await execAsync(dumpCommand);

      // 检查备份文件
      if (!fs.existsSync(backupFilePath)) {
        throw new Error('Backup file was not created');
      }

      const stats = fs.statSync(backupFilePath);
      const fileSize = stats.size;

      if (fileSize === 0) {
        throw new Error('Backup file is empty');
      }

      // 计算校验和
      const checksum = await this.calculateChecksum(backupFilePath);

      // 压缩备份文件
      let finalBackupFile = backupFilePath;
      if (this.config.compression) {
        finalBackupFile = await this.compressBackup(backupFilePath);
        fs.unlinkSync(backupFilePath); // 删除原始文件
      }

      // 加密备份文件
      if (this.config.encryption && this.config.encryptionKey) {
        finalBackupFile = await this.encryptBackup(finalBackupFile);
      }

      // 上传到云存储
      if (this.config.uploadToCloud) {
        await this.uploadToCloud(finalBackupFile);
      }

      const duration = Date.now() - startTime;

      // 记录备份成功
      await this.recordBackupSuccess('full', finalBackupFile, fileSize, checksum, duration);

      this.logger.log(
        `Full backup completed: ${finalBackupFile} (${this.formatFileSize(fileSize)})`,
      );

      return {
        success: true,
        backupFile: finalBackupFile,
        size: fileSize,
        duration,
        checksum,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      await this.recordBackupFailure('full', backupFileName, duration, error.message);

      this.logger.error(`Full backup failed: ${error.message}`);

      return {
        success: false,
        backupFile: backupFilePath,
        size: 0,
        duration,
        checksum: '',
        error: error.message,
      };
    }
  }

  /**
   * 执行增量备份
   */
  async performIncrementalBackup(): Promise<BackupResult> {
    // 增量备份实现 - 基于二进制日志
    const startTime = Date.now();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFileName = `malleco_incremental_${timestamp}.sql`;
    const backupFilePath = path.join(this.config.backupPath, backupFileName);

    try {
      await this.recordBackupStart('incremental', backupFileName);

      // 获取当前的二进制日志位置
      const masterStatus = await this.connection.query('SHOW MASTER STATUS');

      if (!masterStatus || masterStatus.length === 0) {
        throw new Error('Binary logging is not enabled');
      }

      const { File: logFile, Position: logPosition } = masterStatus[0];

      // 记录二进制日志位置
      const incrementalData = {
        logFile,
        logPosition,
        timestamp: new Date().toISOString(),
      };

      fs.writeFileSync(backupFilePath, JSON.stringify(incrementalData, null, 2));

      const stats = fs.statSync(backupFilePath);
      const checksum = await this.calculateChecksum(backupFilePath);
      const duration = Date.now() - startTime;

      await this.recordBackupSuccess('incremental', backupFilePath, stats.size, checksum, duration);

      this.logger.log(`Incremental backup completed: ${backupFilePath}`);

      return {
        success: true,
        backupFile: backupFilePath,
        size: stats.size,
        duration,
        checksum,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      await this.recordBackupFailure('incremental', backupFileName, duration, error.message);

      this.logger.error(`Incremental backup failed: ${error.message}`);

      return {
        success: false,
        backupFile: backupFilePath,
        size: 0,
        duration,
        checksum: '',
        error: error.message,
      };
    }
  }

  /**
   * 恢复数据库
   */
  async restoreDatabase(backupFile: string): Promise<RestoreResult> {
    const startTime = Date.now();

    try {
      if (!fs.existsSync(backupFile)) {
        throw new Error(`Backup file not found: ${backupFile}`);
      }

      let restoreFile = backupFile;

      // 解密备份文件
      if (this.config.encryption && this.config.encryptionKey) {
        restoreFile = await this.decryptBackup(backupFile);
      }

      // 解压缩备份文件
      if (this.config.compression && restoreFile.endsWith('.gz')) {
        restoreFile = await this.decompressBackup(restoreFile);
      }

      // 获取数据库配置
      const dbConfig = this.connection.options as any;
      const { host, port, username, password, database } = dbConfig;

      // 构建恢复命令
      let restoreCommand = `mysql -h ${host} -P ${port} -u ${username}`;

      if (password) {
        restoreCommand += ` -p${password}`;
      }

      restoreCommand += ` ${database} < ${restoreFile}`;

      // 执行恢复
      await execAsync(restoreCommand);

      const duration = Date.now() - startTime;

      // 清理临时文件
      if (restoreFile !== backupFile) {
        fs.unlinkSync(restoreFile);
      }

      this.logger.log(`Database restored successfully from: ${backupFile}`);

      return {
        success: true,
        restoredFile: backupFile,
        duration,
      };
    } catch (error) {
      const duration = Date.now() - startTime;

      this.logger.error(`Database restore failed: ${error.message}`);

      return {
        success: false,
        restoredFile: backupFile,
        duration,
        error: error.message,
      };
    }
  }

  /**
   * 定时执行完整备份
   */
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async scheduledFullBackup() {
    if (this.config.enabled) {
      await this.performFullBackup();
      await this.cleanupOldBackups();
    }
  }

  /**
   * 定时执行增量备份（每小时）
   */
  @Cron(CronExpression.EVERY_HOUR)
  async scheduledIncrementalBackup() {
    if (this.config.enabled) {
      await this.performIncrementalBackup();
    }
  }

  /**
   * 清理旧的备份文件
   */
  async cleanupOldBackups() {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - this.config.retentionDays);

      const files = fs.readdirSync(this.config.backupPath);

      for (const file of files) {
        if (file.startsWith('malleco_')) {
          const filePath = path.join(this.config.backupPath, file);
          const stats = fs.statSync(filePath);

          if (stats.mtime < cutoffDate) {
            fs.unlinkSync(filePath);
            this.logger.log(`Deleted old backup: ${file}`);
          }
        }
      }

      // 清理数据库中的旧记录
      await this.connection.query('DELETE FROM mall_backup_records WHERE created_at < ?', [
        cutoffDate,
      ]);
    } catch (error) {
      this.logger.error('Failed to cleanup old backups', error);
    }
  }

  /**
   * 检查备份健康状态
   */
  async checkBackupHealth(): Promise<any> {
    try {
      // 检查最近的成功备份
      const recentBackup = await this.connection.query(
        `SELECT * FROM mall_backup_records 
         WHERE status = 'success' 
         ORDER BY created_at DESC 
         LIMIT 1`,
      );

      const health = {
        lastSuccessfulBackup: recentBackup[0]?.created_at || null,
        backupCount: await this.getBackupCount(),
        diskUsage: await this.getBackupDiskUsage(),
        status: recentBackup.length > 0 ? 'healthy' : 'unhealthy',
      };

      return health;
    } catch (error) {
      this.logger.error('Failed to check backup health', error);
      return { status: 'error', error: error.message };
    }
  }

  /**
   * 获取备份统计信息
   */
  async getBackupStatistics(): Promise<any> {
    try {
      const stats = await this.connection.query(`
        SELECT 
          backup_type,
          COUNT(*) as count,
          AVG(duration_seconds) as avg_duration,
          AVG(file_size) as avg_size,
          MAX(created_at) as last_backup
        FROM mall_backup_records 
        WHERE status = 'success'
        GROUP BY backup_type
      `);

      return stats;
    } catch (error) {
      this.logger.error('Failed to get backup statistics', error);
      return [];
    }
  }

  // 辅助方法
  private async calculateChecksum(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const hash = crypto.createHash('sha256');
      const stream = fs.createReadStream(filePath);

      stream.on('data', data => hash.update(data));
      stream.on('end', () => resolve(hash.digest('hex')));
      stream.on('error', reject);
    });
  }

  private async compressBackup(filePath: string): Promise<string> {
    const compressedPath = filePath + '.gz';
    await execAsync(`gzip -c ${filePath} > ${compressedPath}`);
    return compressedPath;
  }

  private async decompressBackup(filePath: string): Promise<string> {
    const decompressedPath = filePath.replace('.gz', '');
    await execAsync(`gzip -d -c ${filePath} > ${decompressedPath}`);
    return decompressedPath;
  }

  private async encryptBackup(filePath: string): Promise<string> {
    // 简化的加密实现 - 实际项目中应使用更安全的加密方法
    const encryptedPath = filePath + '.enc';
    // 这里应该使用AES等加密算法
    // 暂时使用简单的文件复制作为示例
    fs.copyFileSync(filePath, encryptedPath);
    return encryptedPath;
  }

  private async decryptBackup(filePath: string): Promise<string> {
    const decryptedPath = filePath.replace('.enc', '');
    // 解密实现
    fs.copyFileSync(filePath, decryptedPath);
    return decryptedPath;
  }

  private async uploadToCloud(filePath: string): Promise<void> {
    // 云存储上传实现 - 需要根据具体云服务商实现
    this.logger.log(`Would upload to cloud: ${filePath}`);
  }

  private formatFileSize(bytes: number): string {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
  }

  private async recordBackupStart(type: 'full' | 'incremental', fileName: string) {
    await this.connection.query(
      "INSERT INTO mall_backup_records (backup_type, backup_file, file_size, checksum, status, duration_seconds) VALUES (?, ?, 0, '', 'in_progress', 0)",
      [type, fileName],
    );
  }

  private async recordBackupSuccess(
    type: 'full' | 'incremental',
    fileName: string,
    size: number,
    checksum: string,
    duration: number,
  ) {
    await this.connection.query(
      "UPDATE mall_backup_records SET status = 'success', file_size = ?, checksum = ?, duration_seconds = ? WHERE backup_file = ? AND status = 'in_progress'",
      [size, checksum, Math.round(duration / 1000), fileName],
    );
  }

  private async recordBackupFailure(
    type: 'full' | 'incremental',
    fileName: string,
    duration: number,
    error: string,
  ) {
    await this.connection.query(
      "UPDATE mall_backup_records SET status = 'failed', duration_seconds = ?, error_message = ? WHERE backup_file = ? AND status = 'in_progress'",
      [Math.round(duration / 1000), error, fileName],
    );
  }

  private async getBackupCount(): Promise<number> {
    const result = await this.connection.query(
      "SELECT COUNT(*) as count FROM mall_backup_records WHERE status = 'success'",
    );
    return parseInt(result[0]?.count || '0');
  }

  private async getBackupDiskUsage(): Promise<number> {
    let totalSize = 0;
    const files = fs.readdirSync(this.config.backupPath);

    for (const file of files) {
      if (file.startsWith('malleco_')) {
        const filePath = path.join(this.config.backupPath, file);
        const stats = fs.statSync(filePath);
        totalSize += stats.size;
      }
    }

    return totalSize;
  }
}
