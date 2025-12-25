import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThan, MoreThan } from 'typeorm';
import { ServiceRegistryEntity } from '../entities/service-registry.entity';
import { ServiceConfigEntity } from '../entities/service-config.entity';
import { ServiceMetricsEntity } from '../entities/service-metrics.entity';
import { ServiceDiscoveryEntity } from '../entities/service-discovery.entity';
import { LoadBalancerEntity } from '../entities/load-balancer.entity';
import { CircuitBreakerEntity } from '../entities/circuit-breaker.entity';

@Injectable()
export class MicroservicesService {
  constructor(
    @InjectRepository(ServiceRegistryEntity)
    private readonly serviceRegistryRepository: Repository<ServiceRegistryEntity>,
    @InjectRepository(ServiceConfigEntity)
    private readonly serviceConfigRepository: Repository<ServiceConfigEntity>,
    @InjectRepository(ServiceMetricsEntity)
    private readonly serviceMetricsRepository: Repository<ServiceMetricsEntity>,
    @InjectRepository(ServiceDiscoveryEntity)
    private readonly serviceDiscoveryRepository: Repository<ServiceDiscoveryEntity>,
    @InjectRepository(LoadBalancerEntity)
    private readonly loadBalancerRepository: Repository<LoadBalancerEntity>,
    @InjectRepository(CircuitBreakerEntity)
    private readonly circuitBreakerRepository: Repository<CircuitBreakerEntity>,
  ) {}

  // 服务注册管理
  async registerService(serviceData: Partial<ServiceRegistryEntity>) {
    const service = this.serviceRegistryRepository.create(serviceData);
    service.registrationTime = new Date();
    service.lastHealthCheck = new Date();
    return await this.serviceRegistryRepository.save(service);
  }

  async unregisterService(serviceId: string) {
    return await this.serviceRegistryRepository.delete(serviceId);
  }

  async getRegisteredServices() {
    return await this.serviceRegistryRepository.find({
      where: { state: 'active' },
      order: { serviceName: 'ASC' },
    });
  }

  async getServiceByName(serviceName: string) {
    return await this.serviceRegistryRepository.find({
      where: { serviceName, state: 'active' },
    });
  }

  async updateServiceStatus(serviceId: string, status: string) {
    await this.serviceRegistryRepository.update(serviceId, {
      status,
      lastHealthCheck: new Date(),
    });
  }

  // 服务配置管理
  async createServiceConfig(configData: Partial<ServiceConfigEntity>) {
    const config = this.serviceConfigRepository.create(configData);
    return await this.serviceConfigRepository.save(config);
  }

  async getServiceConfigs(serviceName?: string) {
    const where = serviceName ? { serviceName, isActive: true } : { isActive: true };
    return await this.serviceConfigRepository.find({
      where,
      order: { serviceName: 'ASC', configKey: 'ASC' },
    });
  }

  async updateServiceConfig(configId: string, configValue: string) {
    return await this.serviceConfigRepository.update(configId, { configValue });
  }

  // 服务监控和指标
  async recordServiceMetrics(metricsData: Partial<ServiceMetricsEntity>) {
    const metrics = this.serviceMetricsRepository.create(metricsData);
    return await this.serviceMetricsRepository.save(metrics);
  }

  async getServiceMetrics(serviceName: string, timeRange?: { start: Date; end: Date }) {
    const where: any = { serviceName };
    if (timeRange) {
      where.timestamp = Between(timeRange.start, timeRange.end);
    }
    return await this.serviceMetricsRepository.find({
      where,
      order: { timestamp: 'DESC' },
      take: 1000,
    });
  }

  async getLatestMetrics(serviceName: string) {
    return await this.serviceMetricsRepository.findOne({
      where: { serviceName },
      order: { timestamp: 'DESC' },
    });
  }

  // 服务发现
  async createServiceDiscovery(discoveryData: Partial<ServiceDiscoveryEntity>) {
    const discovery = this.serviceDiscoveryRepository.create(discoveryData);
    return await this.serviceDiscoveryRepository.save(discovery);
  }

  async getServiceDiscoveries() {
    return await this.serviceDiscoveryRepository.find({
      order: { serviceName: 'ASC' },
    });
  }

  async syncServiceDiscovery(discoveryId: string) {
    const discovery = await this.serviceDiscoveryRepository.findOne({ where: { id: discoveryId } });
    if (!discovery) {
      throw new Error('Service discovery not found');
    }

    // 模拟服务发现同步逻辑
    const services = await this.performServiceDiscovery(discovery);
    discovery.lastSyncTime = new Date();
    await this.serviceDiscoveryRepository.save(discovery);

    return services;
  }

  private async performServiceDiscovery(discovery: ServiceDiscoveryEntity) {
    // 实际实现会根据discoveryType调用相应的服务发现协议
    // 这里返回模拟数据
    return [
      {
        serviceName: discovery.serviceName,
        instances: [
          { host: 'localhost', port: 9000, status: 'healthy' },
          { host: 'localhost', port: 9001, status: 'healthy' },
        ],
      },
    ];
  }

  // 负载均衡
  async createLoadBalancer(loadBalancerData: Partial<LoadBalancerEntity>) {
    const loadBalancer = this.loadBalancerRepository.create(loadBalancerData);
    return await this.loadBalancerRepository.save(loadBalancer);
  }

  async getLoadBalancers(serviceName?: string) {
    const where = serviceName ? { serviceName, isActive: true } : { isActive: true };
    return await this.loadBalancerRepository.find({
      where,
      order: { serviceName: 'ASC' },
    });
  }

  async updateLoadBalancerMetrics(loadBalancerId: string, metrics: { failedRequests: number; totalRequests: number }) {
    const loadBalancer = await this.loadBalancerRepository.findOne({ where: { id: loadBalancerId } });
    if (!loadBalancer) {
      throw new Error('Load balancer not found');
    }

    loadBalancer.failedRequests += metrics.failedRequests;
    loadBalancer.totalRequests += metrics.totalRequests;
    loadBalancer.failureRate = loadBalancer.totalRequests > 0 
      ? (loadBalancer.failedRequests / loadBalancer.totalRequests) * 100 
      : 0;

    return await this.loadBalancerRepository.save(loadBalancer);
  }

  // 熔断器管理
  async createCircuitBreaker(circuitBreakerData: Partial<CircuitBreakerEntity>) {
    const circuitBreaker = this.circuitBreakerRepository.create(circuitBreakerData);
    return await this.circuitBreakerRepository.save(circuitBreaker);
  }

  async getCircuitBreakers(serviceName?: string) {
    const where = serviceName ? { serviceName, isActive: true } : { isActive: true };
    return await this.circuitBreakerRepository.find({
      where,
      order: { serviceName: 'ASC', endpoint: 'ASC' },
    });
  }

  async updateCircuitBreakerState(circuitBreakerId: string, newState: string, isSuccess: boolean = false) {
    const circuitBreaker = await this.circuitBreakerRepository.findOne({ where: { id: circuitBreakerId } });
    if (!circuitBreaker) {
      throw new Error('Circuit breaker not found');
    }

    circuitBreaker.state = newState as any;
    circuitBreaker.lastStateChangeTime = new Date();
    
    if (isSuccess) {
      circuitBreaker.successCount++;
    } else {
      circuitBreaker.failureCount++;
      circuitBreaker.lastFailureTime = new Date();
    }

    circuitBreaker.requestCount++;
    circuitBreaker.failurePercentage = circuitBreaker.requestCount > 0 
      ? (circuitBreaker.failureCount / circuitBreaker.requestCount) * 100 
      : 0;

    return await this.circuitBreakerRepository.save(circuitBreaker);
  }

  // 服务健康检查
  async performHealthCheck(serviceId: string) {
    const service = await this.serviceRegistryRepository.findOne({ where: { id: serviceId } });
    if (!service) {
      throw new Error('Service not found');
    }

    try {
      // 模拟健康检查逻辑
      const isHealthy = await this.checkServiceHealth(service);
      const status = isHealthy ? 'healthy' : 'unhealthy';
      
      await this.updateServiceStatus(serviceId, status);
      return { serviceId: service.serviceName, status, lastCheck: new Date() };
    } catch (error) {
      await this.updateServiceStatus(serviceId, 'unhealthy');
      throw error;
    }
  }

  private async checkServiceHealth(service: ServiceRegistryEntity): Promise<boolean> {
    // 实际实现会发送HTTP请求到服务的健康检查端点
    // 这里返回模拟结果
    return Math.random() > 0.1; // 90% 概率健康
  }

  // 服务统计和报表
  async getServiceStatistics() {
    const totalServices = await this.serviceRegistryRepository.count({ where: { state: 'active' } });
    const healthyServices = await this.serviceRegistryRepository.count({ where: { state: 'active', status: 'healthy' } });
    const unhealthyServices = totalServices - healthyServices;
    
    const totalConfigs = await this.serviceConfigRepository.count({ where: { isActive: true } });
    const activeLoadBalancers = await this.loadBalancerRepository.count({ where: { isActive: true } });
    const activeCircuitBreakers = await this.circuitBreakerRepository.count({ where: { isActive: true } });

    return {
      totalServices,
      healthyServices,
      unhealthyServices,
      healthRate: totalServices > 0 ? (healthyServices / totalServices) * 100 : 0,
      totalConfigs,
      activeLoadBalancers,
      activeCircuitBreakers,
    };
  }

  async getServicePerformanceReport(timeRange: { start: Date; end: Date }) {
    const services = await this.serviceRegistryRepository.find({ where: { state: 'active' } });
    const report = [];

    for (const service of services) {
      const metrics = await this.getServiceMetrics(service.serviceName, timeRange);
      if (metrics.length > 0) {
        const avgResponseTime = metrics.reduce((sum, m) => sum + Number(m.responseTime), 0) / metrics.length;
        const avgCpuUsage = metrics.reduce((sum, m) => sum + Number(m.cpuUsage), 0) / metrics.length;
        const avgMemoryUsage = metrics.reduce((sum, m) => sum + Number(m.memoryUsage), 0) / metrics.length;
        const totalRequests = metrics.reduce((sum, m) => sum + m.requestCount, 0);
        const totalErrors = metrics.reduce((sum, m) => sum + m.errorCount, 0);
        const errorRate = totalRequests > 0 ? (totalErrors / totalRequests) * 100 : 0;

        report.push({
          serviceName: service.serviceName,
          instanceCount: metrics.length,
          avgResponseTime: Math.round(avgResponseTime * 100) / 100,
          avgCpuUsage: Math.round(avgCpuUsage * 100) / 100,
          avgMemoryUsage: Math.round(avgMemoryUsage * 100) / 100,
          totalRequests,
          totalErrors,
          errorRate: Math.round(errorRate * 100) / 100,
          status: service.status,
        });
      }
    }

    return report;
  }
}