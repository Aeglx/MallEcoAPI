import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import {
  MeshConfigEntity,
  MeshGatewayEntity,
  MeshPolicyEntity,
  MeshTelemetryEntity,
  MeshSecurityEntity,
  MeshTrafficEntity,
} from '../entities';

@Injectable()
export class ServiceMeshService {
  constructor(
    @InjectRepository(MeshConfigEntity)
    private readonly meshConfigRepository: Repository<MeshConfigEntity>,
    @InjectRepository(MeshGatewayEntity)
    private readonly meshGatewayRepository: Repository<MeshGatewayEntity>,
    @InjectRepository(MeshPolicyEntity)
    private readonly meshPolicyRepository: Repository<MeshPolicyEntity>,
    @InjectRepository(MeshTelemetryEntity)
    private readonly meshTelemetryRepository: Repository<MeshTelemetryEntity>,
    @InjectRepository(MeshSecurityEntity)
    private readonly meshSecurityRepository: Repository<MeshSecurityEntity>,
    @InjectRepository(MeshTrafficEntity)
    private readonly meshTrafficRepository: Repository<MeshTrafficEntity>,
  ) {}

  // 服务网格配置管理
  async createMeshConfig(configData: Partial<MeshConfigEntity>) {
    const config = this.meshConfigRepository.create(configData);
    return await this.meshConfigRepository.save(config);
  }

  async getMeshConfigs() {
    return await this.meshConfigRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async getMeshConfigById(configId: string) {
    return await this.meshConfigRepository.findOne({ where: { id: configId } });
  }

  async updateMeshConfig(configId: string, updateData: Partial<MeshConfigEntity>) {
    return await this.meshConfigRepository.update(configId, updateData);
  }

  async deployMeshConfig(configId: string) {
    const config = await this.meshConfigRepository.findOne({ where: { id: configId } });
    if (!config) {
      throw new Error('Mesh config not found');
    }

    // 模拟部署逻辑
    config.status = 'active';
    config.lastDeployTime = new Date();
    
    return await this.meshConfigRepository.save(config);
  }

  // 网关管理
  async createGateway(gatewayData: Partial<MeshGatewayEntity>) {
    const gateway = this.meshGatewayRepository.create(gatewayData);
    return await this.meshGatewayRepository.save(gateway);
  }

  async getGateways() {
    return await this.meshGatewayRepository.find({
      where: { isEnabled: true },
      order: { gatewayName: 'ASC' },
    });
  }

  async updateGateway(gatewayId: string, updateData: Partial<MeshGatewayEntity>) {
    return await this.meshGatewayRepository.update(gatewayId, updateData);
  }

  async getGatewayByName(gatewayName: string) {
    return await this.meshGatewayRepository.findOne({ where: { gatewayName } });
  }

  // 策略管理
  async createPolicy(policyData: Partial<MeshPolicyEntity>) {
    const policy = this.meshPolicyRepository.create(policyData);
    return await this.meshPolicyRepository.save(policy);
  }

  async getPolicies(serviceName?: string) {
    const where = serviceName 
      ? { targetServices: { $like: `%${serviceName}%` } as any }
      : {};
    
    return await this.meshPolicyRepository.find({
      where,
      order: { priority: 'DESC', createdAt: 'DESC' },
    });
  }

  async updatePolicy(policyId: string, updateData: Partial<MeshPolicyEntity>) {
    return await this.meshPolicyRepository.update(policyId, updateData);
  }

  async evaluatePolicy(serviceName: string, context: Record<string, any>) {
    const policies = await this.meshPolicyRepository.find({
      where: { 
        status: 'enabled',
        targetServices: { $like: `%${serviceName}%` } as any
      },
      order: { priority: 'DESC' },
    });

    const results = [];
    for (const policy of policies) {
      for (const rule of policy.rules) {
        if (this.evaluateCondition(rule.condition, context)) {
          results.push({
            policyName: policy.policyName,
            ruleName: rule.name,
            action: rule.action,
            priority: policy.priority,
          });
        }
      }
    }

    return results;
  }

  private evaluateCondition(condition: Record<string, any>, context: Record<string, any>): boolean {
    // 简单的条件评估逻辑
    for (const [key, value] of Object.entries(condition)) {
      if (context[key] !== value) {
        return false;
      }
    }
    return true;
  }

  // 遥测数据管理
  async recordTelemetry(telemetryData: Partial<MeshTelemetryEntity>) {
    const telemetry = this.meshTelemetryRepository.create(telemetryData);
    return await this.meshTelemetryRepository.save(telemetry);
  }

  async getTelemetryData(serviceName?: string, timeRange?: { start: Date; end: Date }) {
    const where: any = {};
    if (serviceName) {
      where.serviceName = serviceName;
    }
    if (timeRange) {
      where.timestamp = Between(timeRange.start, timeRange.end);
    }

    return await this.meshTelemetryRepository.find({
      where,
      order: { timestamp: 'DESC' },
      take: 1000,
    });
  }

  async getTraces(traceId: string) {
    return await this.meshTelemetryRepository.find({
      where: { traceId },
      order: { createdAt: 'ASC' },
    });
  }

  async getServiceMetrics(serviceName: string, timeRange: { start: Date; end: Date }) {
    const telemetryData = await this.getTelemetryData(serviceName, timeRange);
    
    if (telemetryData.length === 0) {
      return null;
    }

    const requests = telemetryData.filter(t => t.eventType === 'request');
    const errors = telemetryData.filter(t => t.statusCode >= 400);
    
    const avgResponseTime = telemetryData.reduce((sum, t) => sum + Number(t.duration), 0) / telemetryData.length;
    const errorRate = requests.length > 0 ? (errors.length / requests.length) * 100 : 0;
    const totalRequests = requests.length;
    const avgRequestSize = telemetryData.reduce((sum, t) => sum + t.requestSize, 0) / telemetryData.length;
    const avgResponseSize = telemetryData.reduce((sum, t) => sum + t.responseSize, 0) / telemetryData.length;

    return {
      serviceName,
      totalRequests,
      errorCount: errors.length,
      errorRate: Math.round(errorRate * 100) / 100,
      avgResponseTime: Math.round(avgResponseTime * 1000) / 1000,
      avgRequestSize: Math.round(avgRequestSize),
      avgResponseSize: Math.round(avgResponseSize),
      timeRange,
    };
  }

  // 安全策略管理
  async createSecurityPolicy(securityData: Partial<MeshSecurityEntity>) {
    const security = this.meshSecurityRepository.create(securityData);
    return await this.meshSecurityRepository.save(security);
  }

  async getSecurityPolicies(serviceName?: string) {
    const where = serviceName ? { serviceName } : {};
    return await this.meshSecurityRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  async evaluateSecurityPolicy(serviceName: string, context: Record<string, any>) {
    const policies = await this.meshSecurityRepository.find({
      where: { 
        serviceName,
        status: 'active',
        isEnforced: true
      },
    });

    for (const policy of policies) {
      if (this.evaluateSecurityConditions(policy.conditions, context)) {
        return {
          action: policy.action,
          policyName: policy.policyName,
          allowed: policy.action === 'allow',
        };
      }
    }

    return { action: 'deny', policyName: 'default', allowed: false };
  }

  private evaluateSecurityConditions(conditions: Array<any>, context: Record<string, any>): boolean {
    if (!conditions || conditions.length === 0) {
      return true;
    }

    for (const condition of conditions) {
      const contextValue = context[condition.key];
      let matches = false;

      switch (condition.operator) {
        case 'equals':
          matches = contextValue === condition.value;
          break;
        case 'contains':
          matches = typeof contextValue === 'string' && contextValue.includes(condition.value);
          break;
        case 'in':
          matches = Array.isArray(condition.value) && condition.value.includes(contextValue);
          break;
        case 'regex':
          matches = new RegExp(condition.value).test(String(contextValue));
          break;
        default:
          matches = false;
      }

      if (!matches) {
        return false;
      }
    }

    return true;
  }

  async updateSecurityPolicyHitCount(policyId: string) {
    return await this.meshSecurityRepository.increment(policyId, 'hitCount', 1);
  }

  // 流量管理
  async recordTraffic(trafficData: Partial<MeshTrafficEntity>) {
    const traffic = this.meshTrafficRepository.create(trafficData);
    return await this.meshTrafficRepository.save(traffic);
  }

  async getTrafficData(serviceName?: string, timeRange?: { start: Date; end: Date }) {
    const where: any = {};
    if (serviceName) {
      where.serviceName = serviceName;
    }
    if (timeRange) {
      where.timestamp = Between(timeRange.start, timeRange.end);
    }

    return await this.meshTrafficRepository.find({
      where,
      order: { timestamp: 'DESC' },
      take: 1000,
    });
  }

  async getTrafficStatistics(serviceName: string, timeRange: { start: Date; end: Date }) {
    const trafficData = await this.getTrafficData(serviceName, timeRange);
    
    if (trafficData.length === 0) {
      return null;
    }

    const totalRequests = trafficData.length;
    const successfulRequests = trafficData.filter(t => t.statusCode < 400).length;
    const errorRequests = totalRequests - successfulRequests;
    const avgResponseTime = trafficData.reduce((sum, t) => sum + Number(t.responseTime), 0) / trafficData.length;
    const avgCpuUsage = trafficData.reduce((sum, t) => sum + Number(t.cpuUsage), 0) / trafficData.length;
    const avgMemoryUsage = trafficData.reduce((sum, t) => sum + Number(t.memoryUsage), 0) / trafficData.length;
    const totalRequestSize = trafficData.reduce((sum, t) => sum + t.requestSize, 0);
    const totalResponseSize = trafficData.reduce((sum, t) => sum + t.responseSize, 0);
    const errorRate = (errorRequests / totalRequests) * 100;

    return {
      serviceName,
      totalRequests,
      successfulRequests,
      errorRequests,
      errorRate: Math.round(errorRate * 100) / 100,
      avgResponseTime: Math.round(avgResponseTime * 1000) / 1000,
      avgCpuUsage: Math.round(avgCpuUsage * 100) / 100,
      avgMemoryUsage: Math.round(avgMemoryUsage * 100) / 100,
      totalRequestSize,
      totalResponseSize,
      timeRange,
    };
  }

  // 服务网格整体统计
  async getMeshStatistics() {
    const activeConfigs = await this.meshConfigRepository.count({ where: { status: 'active' } });
    const activeGateways = await this.meshGatewayRepository.count({ where: { status: 'active', isEnabled: true } });
    const activePolicies = await this.meshPolicyRepository.count({ where: { status: 'enabled' } });
    const activeSecurityPolicies = await this.meshSecurityRepository.count({ where: { status: 'active', isEnforced: true } });
    
    const recentTelemetry = await this.meshTelemetryRepository.count({
      where: {
        createdAt: Between(
          new Date(Date.now() - 24 * 60 * 60 * 1000), // 24小时前
          new Date()
        )
      }
    });

    const recentTraffic = await this.meshTrafficRepository.count({
      where: {
        timestamp: Between(
          new Date(Date.now() - 24 * 60 * 60 * 1000),
          new Date()
        )
      }
    });

    return {
      activeConfigs,
      activeGateways,
      activePolicies,
      activeSecurityPolicies,
      telemetryEvents24h: recentTelemetry,
      trafficRecords24h: recentTraffic,
    };
  }

  // 服务网格健康检查
  async performMeshHealthCheck() {
    const configs = await this.meshConfigRepository.find({ where: { status: 'active' } });
    const gateways = await this.meshGatewayRepository.find({ where: { status: 'active', isEnabled: true } });
    
    const healthResults = [];
    
    for (const config of configs) {
      const health = await this.checkMeshConfigHealth(config);
      healthResults.push(health);
    }

    for (const gateway of gateways) {
      const health = await this.checkGatewayHealth(gateway);
      healthResults.push(health);
    }

    const healthyCount = healthResults.filter(r => r.status === 'healthy').length;
    const totalCount = healthResults.length;
    const overallHealth = totalCount > 0 ? (healthyCount / totalCount) * 100 : 0;

    return {
      overallHealth: Math.round(overallHealth * 100) / 100,
      healthyComponents: healthyCount,
      totalComponents: totalCount,
      details: healthResults,
    };
  }

  private async checkMeshConfigHealth(config: MeshConfigEntity) {
    // 模拟健康检查逻辑
    const isHealthy = Math.random() > 0.1; // 90% 概率健康
    
    return {
      component: config.meshName,
      type: 'mesh-config',
      status: isHealthy ? 'healthy' : 'unhealthy',
      lastCheck: new Date(),
    };
  }

  private async checkGatewayHealth(gateway: MeshGatewayEntity) {
    // 模拟网关健康检查
    const isHealthy = Math.random() > 0.05; // 95% 概率健康
    
    return {
      component: gateway.gatewayName,
      type: 'gateway',
      status: isHealthy ? 'healthy' : 'unhealthy',
      lastCheck: new Date(),
    };
  }
}