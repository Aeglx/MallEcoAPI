import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between, MoreThanOrEqual, LessThanOrEqual, In } from 'typeorm';
import { SystemDiagnosis } from '../entities/system-diagnosis.entity';
import { CreateSystemDiagnosisDto } from '../dto/create-system-diagnosis.dto';
import { SystemDiagnosisSearchDto } from '../dto/system-diagnosis-search.dto';
import * as os from 'os';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class SystemDiagnosisService {
  constructor(
    @InjectRepository(SystemDiagnosis)
    private readonly diagnosisRepository: Repository<SystemDiagnosis>,
  ) {}

  async create(createDiagnosisDto: CreateSystemDiagnosisDto): Promise<SystemDiagnosis> {
    const diagnosis = this.diagnosisRepository.create(createDiagnosisDto);
    return await this.diagnosisRepository.save(diagnosis);
  }

  async findAll(searchDto: SystemDiagnosisSearchDto) {
    const {
      type,
      category,
      status,
      severity,
      isResolved,
      requiresAttention,
      isAutoDiagnosis,
      titleKeyword,
      createdAtStart,
      createdAtEnd,
      resolvedAtStart,
      resolvedAtEnd,
      tag,
      resolvedBy,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = searchDto;

    const where: any = {};

    if (type) {
      where.type = type;
    }

    if (category) {
      where.category = category;
    }

    if (status) {
      where.status = status;
    }

    if (severity) {
      where.severity = severity;
    }

    if (typeof isResolved === 'boolean') {
      where.isResolved = isResolved;
    }

    if (typeof requiresAttention === 'boolean') {
      where.requiresAttention = requiresAttention;
    }

    if (typeof isAutoDiagnosis === 'boolean') {
      where.isAutoDiagnosis = isAutoDiagnosis;
    }

    if (titleKeyword) {
      where.title = Like(`%${titleKeyword}%`);
    }

    if (createdAtStart && createdAtEnd) {
      where.createdAt = Between(
        new Date(createdAtStart),
        new Date(createdAtEnd)
      );
    } else if (createdAtStart) {
      where.createdAt = MoreThanOrEqual(new Date(createdAtStart));
    } else if (createdAtEnd) {
      where.createdAt = LessThanOrEqual(new Date(createdAtEnd));
    }

    if (resolvedAtStart && resolvedAtEnd) {
      where.resolvedAt = Between(
        new Date(resolvedAtStart),
        new Date(resolvedAtEnd)
      );
    } else if (resolvedAtStart) {
      where.resolvedAt = MoreThanOrEqual(new Date(resolvedAtStart));
    } else if (resolvedAtEnd) {
      where.resolvedAt = LessThanOrEqual(new Date(resolvedAtEnd));
    }

    if (resolvedBy) {
      where.resolvedBy = Like(`%${resolvedBy}%`);
    }

    if (tag) {
      // JSON查询标签字段
      where.tags = Like(`%${tag}%`);
    }

    const [items, total] = await this.diagnosisRepository.findAndCount({
      where,
      order: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number): Promise<SystemDiagnosis> {
    const diagnosis = await this.diagnosisRepository.findOne({ where: { id } });
    if (!diagnosis) {
      throw new NotFoundException(`诊断记录ID ${id} 不存在`);
    }
    return diagnosis;
  }

  async update(id: number, updateData: Partial<SystemDiagnosis>): Promise<SystemDiagnosis> {
    const diagnosis = await this.findOne(id);
    Object.assign(diagnosis, updateData);
    return await this.diagnosisRepository.save(diagnosis);
  }

  async remove(id: number): Promise<void> {
    const diagnosis = await this.findOne(id);
    await this.diagnosisRepository.remove(diagnosis);
  }

  async resolveIssue(id: number, resolution: string, resolvedBy: string): Promise<SystemDiagnosis> {
    const diagnosis = await this.findOne(id);
    diagnosis.isResolved = true;
    diagnosis.resolution = resolution;
    diagnosis.resolvedAt = new Date();
    diagnosis.resolvedBy = resolvedBy;
    diagnosis.status = 'normal';
    
    return await this.diagnosisRepository.save(diagnosis);
  }

  async runFullDiagnosis(): Promise<any> {
    const results = {
      timestamp: new Date(),
      system: await this.diagnoseSystem(),
      database: await this.diagnoseDatabase(),
      cache: await this.diagnoseCache(),
      disk: await this.diagnoseDisk(),
      memory: await this.diagnoseMemory(),
      cpu: await this.diagnoseCPU(),
      network: await this.diagnoseNetwork(),
      api: await this.diagnoseAPI(),
    };

    // 保存诊断结果
    const diagnoses: SystemDiagnosis[] = [];

    Object.entries(results).forEach(([category, result]) => {
      if (Array.isArray(result)) {
        result.forEach(issue => {
          const diagnosis = this.diagnosisRepository.create({
            type: issue.type || 'health',
            category: category,
            status: issue.status,
            title: issue.title,
            description: issue.description,
            details: issue.details,
            metrics: issue.metrics,
            suggestion: issue.suggestion,
            severity: issue.severity || 'medium',
            isAutoDiagnosis: true,
            requiresAttention: issue.status !== 'normal',
          });
          diagnoses.push(diagnosis);
        });
      }
    });

    if (diagnoses.length > 0) {
      await this.diagnosisRepository.save(diagnoses);
    }

    return results;
  }

  async runCategoryDiagnosis(category: string): Promise<any> {
    switch (category) {
      case 'system':
        return await this.diagnoseSystem();
      case 'database':
        return await this.diagnoseDatabase();
      case 'cache':
        return await this.diagnoseCache();
      case 'disk':
        return await this.diagnoseDisk();
      case 'memory':
        return await this.diagnoseMemory();
      case 'cpu':
        return await this.diagnoseCPU();
      case 'network':
        return await this.diagnoseNetwork();
      case 'api':
        return await this.diagnoseAPI();
      default:
        throw new BadRequestException(`不支持的诊断类别: ${category}`);
    }
  }

  private async diagnoseSystem(): Promise<any[]> {
    const issues = [];
    const uptime = os.uptime();
    const loadAvg = os.loadavg();

    // 检查系统运行时间
    if (uptime < 300) { // 5分钟内
      issues.push({
        title: '系统刚启动',
        description: '系统运行时间较短，可能存在不稳定情况',
        status: 'warning',
        severity: 'low',
        type: 'health',
        metrics: { uptime },
        suggestion: '观察系统运行状态，确保服务正常启动'
      });
    }

    // 检查负载
    if (loadAvg[0] > os.cpus().length * 2) {
      issues.push({
        title: '系统负载过高',
        description: `当前系统负载: ${loadAvg[0].toFixed(2)}`,
        status: 'error',
        severity: 'high',
        type: 'performance',
        metrics: { loadAvg },
        suggestion: '检查CPU密集型进程，考虑扩容或优化'
      });
    }

    return issues;
  }

  private async diagnoseDatabase(): Promise<any[]> {
    const issues = [];
    
    try {
      // 这里应该实现实际的数据库连接检查
      // 示例：检查连接池状态、查询响应时间等
      
      // 模拟数据库连接测试
      const connectionTest = true; // 实际应该是测试结果
      const queryTime = Math.random() * 1000; // 模拟查询时间

      if (!connectionTest) {
        issues.push({
          title: '数据库连接失败',
          description: '无法连接到数据库',
          status: 'critical',
          severity: 'critical',
          type: 'connectivity',
          metrics: { connected: false },
          suggestion: '检查数据库服务状态和网络连接'
        });
      }

      if (queryTime > 500) {
        issues.push({
          title: '数据库查询响应慢',
          description: `平均查询时间: ${queryTime.toFixed(2)}ms`,
          status: 'warning',
          severity: 'medium',
          type: 'performance',
          metrics: { queryTime },
          suggestion: '优化查询语句，检查数据库索引'
        });
      }

    } catch (error) {
      issues.push({
        title: '数据库诊断失败',
        description: error.message,
        status: 'error',
        severity: 'high',
        type: 'health',
        suggestion: '检查数据库配置和服务状态'
      });
    }

    return issues;
  }

  private async diagnoseCache(): Promise<any[]> {
    const issues = [];
    
    try {
      // 这里应该实现实际的缓存检查
      // 模拟缓存状态检查
      const cacheConnected = true;
      const hitRate = Math.random() * 100;
      const memoryUsage = Math.random() * 100;

      if (!cacheConnected) {
        issues.push({
          title: '缓存服务连接失败',
          description: '无法连接到Redis缓存服务',
          status: 'error',
          severity: 'high',
          type: 'connectivity',
          suggestion: '检查Redis服务状态和配置'
        });
      }

      if (hitRate < 80) {
        issues.push({
          title: '缓存命中率低',
          description: `当前命中率: ${hitRate.toFixed(2)}%`,
          status: 'warning',
          severity: 'medium',
          type: 'performance',
          metrics: { hitRate },
          suggestion: '优化缓存策略，调整缓存过期时间'
        });
      }

    } catch (error) {
      issues.push({
        title: '缓存诊断失败',
        description: error.message,
        status: 'error',
        severity: 'high',
        type: 'health',
        suggestion: '检查缓存服务配置'
      });
    }

    return issues;
  }

  private async diagnoseDisk(): Promise<any[]> {
    const issues = [];
    
    try {
      const stats = fs.statSync(process.cwd());
      const freeSpace = os.freemem(); // 简化示例
      const totalSpace = os.totalmem();
      const usagePercent = ((totalSpace - freeSpace) / totalSpace) * 100;

      if (usagePercent > 90) {
        issues.push({
          title: '磁盘空间不足',
          description: `磁盘使用率: ${usagePercent.toFixed(2)}%`,
          status: 'critical',
          severity: 'critical',
          type: 'health',
          metrics: { usagePercent, freeSpace, totalSpace },
          suggestion: '清理无用文件，扩展存储空间'
        });
      } else if (usagePercent > 80) {
        issues.push({
          title: '磁盘空间告警',
          description: `磁盘使用率: ${usagePercent.toFixed(2)}%`,
          status: 'warning',
          severity: 'medium',
          type: 'health',
          metrics: { usagePercent, freeSpace, totalSpace },
          suggestion: '关注磁盘使用情况，准备清理方案'
        });
      }

    } catch (error) {
      issues.push({
        title: '磁盘诊断失败',
        description: error.message,
        status: 'error',
        severity: 'high',
        type: 'health',
        suggestion: '检查磁盘权限和状态'
      });
    }

    return issues;
  }

  private async diagnoseMemory(): Promise<any[]> {
    const issues = [];
    
    try {
      const totalMem = os.totalmem();
      const freeMem = os.freemem();
      const usedMem = totalMem - freeMem;
      const usagePercent = (usedMem / totalMem) * 100;

      if (usagePercent > 90) {
        issues.push({
          title: '内存使用率过高',
          description: `内存使用率: ${usagePercent.toFixed(2)}%`,
          status: 'critical',
          severity: 'critical',
          type: 'performance',
          metrics: { totalMem, freeMem, usedMem, usagePercent },
          suggestion: '检查内存泄漏，考虑扩容'
        });
      } else if (usagePercent > 80) {
        issues.push({
          title: '内存使用率告警',
          description: `内存使用率: ${usagePercent.toFixed(2)}%`,
          status: 'warning',
          severity: 'medium',
          type: 'performance',
          metrics: { totalMem, freeMem, usedMem, usagePercent },
          suggestion: '监控内存使用趋势，优化内存使用'
        });
      }

    } catch (error) {
      issues.push({
        title: '内存诊断失败',
        description: error.message,
        status: 'error',
        severity: 'high',
        type: 'health',
        suggestion: '检查系统状态'
      });
    }

    return issues;
  }

  private async diagnoseCPU(): Promise<any[]> {
    const issues = [];
    
    try {
      const cpus = os.cpus();
      const loadAvg = os.loadavg();
      const cpuCount = cpus.length;
      const loadPercent = (loadAvg[0] / cpuCount) * 100;

      if (loadPercent > 90) {
        issues.push({
          title: 'CPU使用率过高',
          description: `CPU负载: ${loadPercent.toFixed(2)}%`,
          status: 'critical',
          severity: 'critical',
          type: 'performance',
          metrics: { loadAvg, cpuCount, loadPercent },
          suggestion: '检查CPU密集型进程，考虑负载均衡'
        });
      } else if (loadPercent > 70) {
        issues.push({
          title: 'CPU使用率告警',
          description: `CPU负载: ${loadPercent.toFixed(2)}%`,
          status: 'warning',
          severity: 'medium',
          type: 'performance',
          metrics: { loadAvg, cpuCount, loadPercent },
          suggestion: '监控CPU使用趋势，优化计算逻辑'
        });
      }

    } catch (error) {
      issues.push({
        title: 'CPU诊断失败',
        description: error.message,
        status: 'error',
        severity: 'high',
        type: 'health',
        suggestion: '检查系统状态'
      });
    }

    return issues;
  }

  private async diagnoseNetwork(): Promise<any[]> {
    const issues = [];
    
    try {
      // 模拟网络连接检查
      const networkInterfaces = os.networkInterfaces();
      const hasActiveInterface = Object.values(networkInterfaces).some(
        interfaces => interfaces.some(iface => !iface.internal && iface.family === 'IPv4')
      );

      if (!hasActiveInterface) {
        issues.push({
          title: '网络接口异常',
          description: '没有可用的活动网络接口',
          status: 'error',
          severity: 'high',
          type: 'connectivity',
          suggestion: '检查网络配置和硬件连接'
        });
      }

      // 可以添加更多网络检查，如：DNS解析、外网连通性等

    } catch (error) {
      issues.push({
        title: '网络诊断失败',
        description: error.message,
        status: 'error',
        severity: 'high',
        type: 'health',
        suggestion: '检查网络配置'
      });
    }

    return issues;
  }

  private async diagnoseAPI(): Promise<any[]> {
    const issues = [];
    
    try {
      // 模拟API健康检查
      const responseTime = Math.random() * 1000;
      const errorRate = Math.random() * 5;

      if (responseTime > 1000) {
        issues.push({
          title: 'API响应时间过长',
          description: `平均响应时间: ${responseTime.toFixed(2)}ms`,
          status: 'warning',
          severity: 'medium',
          type: 'performance',
          metrics: { responseTime },
          suggestion: '优化API逻辑，添加缓存机制'
        });
      }

      if (errorRate > 1) {
        issues.push({
          title: 'API错误率过高',
          description: `错误率: ${errorRate.toFixed(2)}%`,
          status: 'error',
          severity: 'high',
          type: 'health',
          metrics: { errorRate },
          suggestion: '检查API日志，修复异常问题'
        });
      }

    } catch (error) {
      issues.push({
        title: 'API诊断失败',
        description: error.message,
        status: 'error',
        severity: 'high',
        type: 'health',
        suggestion: '检查API服务状态'
      });
    }

    return issues;
  }

  async getStatistics(): Promise<any> {
    const [
      total,
      resolved,
      unresolved,
      byType,
      byCategory,
      bySeverity,
      recent
    ] = await Promise.all([
      this.diagnosisRepository.count(),
      this.diagnosisRepository.count({ where: { isResolved: true } }),
      this.diagnosisRepository.count({ where: { isResolved: false } }),
      this.diagnosisRepository
        .createQueryBuilder('diagnosis')
        .select('diagnosis.type', 'type')
        .addSelect('COUNT(*)', 'count')
        .groupBy('diagnosis.type')
        .getRawMany(),
      this.diagnosisRepository
        .createQueryBuilder('diagnosis')
        .select('diagnosis.category', 'category')
        .addSelect('COUNT(*)', 'count')
        .groupBy('diagnosis.category')
        .getRawMany(),
      this.diagnosisRepository
        .createQueryBuilder('diagnosis')
        .select('diagnosis.severity', 'severity')
        .addSelect('COUNT(*)', 'count')
        .groupBy('diagnosis.severity')
        .getRawMany(),
      this.diagnosisRepository.find({
        where: { requiresAttention: true, isResolved: false },
        order: { createdAt: 'DESC' },
        take: 10,
      }),
    ]);

    return {
      total,
      resolved,
      unresolved,
      resolutionRate: total > 0 ? (resolved / total) * 100 : 0,
      byType,
      byCategory,
      bySeverity,
      recentIssues: recent,
    };
  }
}