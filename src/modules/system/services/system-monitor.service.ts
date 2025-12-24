import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SystemLogEntity } from '../entities/system-log.entity';

@Injectable()
export class SystemMonitorService {
  constructor(
    @InjectRepository(SystemLogEntity)
    private readonly logRepository: Repository<SystemLogEntity>,
  ) {}

  /**
   * 系统健康检查
   */
  async healthCheck(): Promise<{
    status: string;
    timestamp: Date;
    uptime: number;
    memory: {
      usage: number;
      total: number;
      free: number;
    };
    database: {
      status: string;
      latency: number;
    };
    redis: {
      status: string;
      latency: number;
    };
  }> {
    // 模拟数据库连接检查
    const dbStatus = await this.checkDatabaseConnection();
    
    // 模拟Redis连接检查
    const redisStatus = await this.checkRedisConnection();
    
    // 获取系统内存信息
    const memoryUsage = process.memoryUsage();
    
    return {
      status: dbStatus.connected && redisStatus.connected ? 'healthy' : 'unhealthy',
      timestamp: new Date(),
      uptime: process.uptime(),
      memory: {
        usage: Math.round((memoryUsage.heapUsed / 1024 / 1024) * 100) / 100,
        total: Math.round((memoryUsage.heapTotal / 1024 / 1024) * 100) / 100,
        free: Math.round(((memoryUsage.heapTotal - memoryUsage.heapUsed) / 1024 / 1024) * 100) / 100
      },
      database: {
        status: dbStatus.connected ? 'connected' : 'disconnected',
        latency: dbStatus.latency
      },
      redis: {
        status: redisStatus.connected ? 'connected' : 'disconnected',
        latency: redisStatus.latency
      }
    };
  }

  /**
   * 系统性能监控
   */
  async performanceMonitor(): Promise<{
    cpu: {
      usage: number;
      loadAverage: number[];
    };
    memory: {
      usage: number;
      total: number;
      free: number;
      heapUsed: number;
      heapTotal: number;
    };
    network: {
      requestsPerSecond: number;
      responseTime: number;
    };
    database: {
      connections: number;
      queriesPerSecond: number;
    };
  }> {
    const memoryUsage = process.memoryUsage();
    
    // 模拟CPU使用率计算
    const cpuUsage = await this.calculateCPUUsage();
    
    // 模拟网络请求统计
    const networkStats = await this.getNetworkStats();
    
    // 模拟数据库连接统计
    const dbStats = await this.getDatabaseStats();
    
    return {
      cpu: {
        usage: cpuUsage,
        loadAverage: process.cpuUsage() ? [process.cpuUsage().user, process.cpuUsage().system] : [0, 0]
      },
      memory: {
        usage: Math.round((memoryUsage.heapUsed / 1024 / 1024) * 100) / 100,
        total: Math.round((memoryUsage.heapTotal / 1024 / 1024) * 100) / 100,
        free: Math.round(((memoryUsage.heapTotal - memoryUsage.heapUsed) / 1024 / 1024) * 100) / 100,
        heapUsed: memoryUsage.heapUsed,
        heapTotal: memoryUsage.heapTotal
      },
      network: {
        requestsPerSecond: networkStats.requestsPerSecond,
        responseTime: networkStats.responseTime
      },
      database: {
        connections: dbStats.connections,
        queriesPerSecond: dbStats.queriesPerSecond
      }
    };
  }

  /**
   * 获取系统指标数据
   */
  async getMetrics(): Promise<{
    timestamp: Date;
    metrics: Record<string, any>;
  }> {
    const timestamp = new Date();
    const health = await this.healthCheck();
    const performance = await this.performanceMonitor();
    
    return {
      timestamp,
      metrics: {
        health,
        performance,
        custom: await this.getCustomMetrics()
      }
    };
  }

  /**
   * 获取告警信息
   */
  async getAlerts(): Promise<Array<{
    id: string;
    level: string;
    title: string;
    message: string;
    timestamp: Date;
    resolved: boolean;
  }>> {
    // 模拟告警数据
    return [
      {
        id: 'alert-001',
        level: 'warning',
        title: '内存使用率过高',
        message: '当前内存使用率已达到85%，请及时处理',
        timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30分钟前
        resolved: false
      },
      {
        id: 'alert-002',
        level: 'info',
        title: '数据库连接数增加',
        message: '当前数据库连接数较平时增加20%',
        timestamp: new Date(Date.now() - 60 * 60 * 1000), // 1小时前
        resolved: true
      }
    ];
  }

  /**
   * 获取监控仪表盘数据
   */
  async getDashboardData(): Promise<{
    systemStatus: {
      uptime: number;
      status: string;
      version: string;
    };
    performance: {
      cpuUsage: number;
      memoryUsage: number;
      diskUsage: number;
      networkUsage: number;
    };
    businessMetrics: {
      activeUsers: number;
      requestsToday: number;
      ordersToday: number;
      revenueToday: number;
    };
    alerts: Array<{
      level: string;
      title: string;
      timestamp: Date;
    }>;
  }> {
    const health = await this.healthCheck();
    const performance = await this.performanceMonitor();
    const alerts = await this.getAlerts();
    
    return {
      systemStatus: {
        uptime: health.uptime,
        status: health.status,
        version: 'v1.0.0'
      },
      performance: {
        cpuUsage: performance.cpu.usage,
        memoryUsage: performance.memory.usage,
        diskUsage: 45.6, // 模拟磁盘使用率
        networkUsage: 12.3 // 模拟网络使用率
      },
      businessMetrics: {
        activeUsers: 1234, // 模拟活跃用户数
        requestsToday: 56789, // 模拟今日请求数
        ordersToday: 456, // 模拟今日订单数
        revenueToday: 12345.67 // 模拟今日收入
      },
      alerts: alerts.map(alert => ({
        level: alert.level,
        title: alert.title,
        timestamp: alert.timestamp
      }))
    };
  }

  /**
   * 检查数据库连接
   */
  private async checkDatabaseConnection(): Promise<{ connected: boolean; latency: number }> {
    // 模拟数据库连接检查
    try {
      const startTime = Date.now();
      // 模拟数据库查询
      await this.logRepository.count();
      const latency = Date.now() - startTime;
      
      return {
        connected: true,
        latency
      };
    } catch (error) {
      return {
        connected: false,
        latency: -1
      };
    }
  }

  /**
   * 检查Redis连接
   */
  private async checkRedisConnection(): Promise<{ connected: boolean; latency: number }> {
    // 模拟Redis连接检查
    return {
      connected: true,
      latency: Math.random() * 10 + 1 // 模拟1-11ms延迟
    };
  }

  /**
   * 计算CPU使用率
   */
  private async calculateCPUUsage(): Promise<number> {
    // 模拟CPU使用率计算
    return Math.random() * 100;
  }

  /**
   * 获取网络统计信息
   */
  private async getNetworkStats(): Promise<{ requestsPerSecond: number; responseTime: number }> {
    // 模拟网络统计
    return {
      requestsPerSecond: Math.random() * 100 + 50, // 模拟50-150请求/秒
      responseTime: Math.random() * 200 + 50 // 模拟50-250ms响应时间
    };
  }

  /**
   * 获取数据库统计信息
   */
  private async getDatabaseStats(): Promise<{ connections: number; queriesPerSecond: number }> {
    // 模拟数据库统计
    return {
      connections: Math.floor(Math.random() * 50 + 10), // 模拟10-60连接数
      queriesPerSecond: Math.random() * 500 + 100 // 模拟100-600查询/秒
    };
  }

  /**
   * 获取自定义指标
   */
  private async getCustomMetrics(): Promise<Record<string, any>> {
    // 模拟自定义指标
    return {
      errorRate: Math.random() * 0.1, // 错误率
      cacheHitRate: Math.random() * 0.8 + 0.2, // 缓存命中率
      queueLength: Math.floor(Math.random() * 100), // 队列长度
      throughput: Math.random() * 1000 + 500 // 吞吐量
    };
  }
}