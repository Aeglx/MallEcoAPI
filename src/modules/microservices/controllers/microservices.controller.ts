import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { MicroservicesService } from '../services/microservices.service';
import { ServiceRegistryEntity } from '../entities/service-registry.entity';
import { ServiceConfigEntity } from '../entities/service-config.entity';
import { ServiceMetricsEntity } from '../entities/service-metrics.entity';
import { ServiceDiscoveryEntity } from '../entities/service-discovery.entity';
import { LoadBalancerEntity } from '../entities/load-balancer.entity';
import { CircuitBreakerEntity } from '../entities/circuit-breaker.entity';

@ApiTags('微服务管理')
@Controller('microservices')
export class MicroservicesController {
  constructor(private readonly microservicesService: MicroservicesService) {}

  // 服务注册管理
  @Post('services/register')
  @ApiOperation({ summary: '注册服务' })
  @ApiResponse({ status: 200, description: '服务注册成功', type: ServiceRegistryEntity })
  async registerService(@Body() serviceData: Partial<ServiceRegistryEntity>) {
    return await this.microservicesService.registerService(serviceData);
  }

  @Delete('services/:serviceId')
  @ApiOperation({ summary: '注销服务' })
  @ApiParam({ name: 'serviceId', description: '服务ID' })
  @ApiResponse({ status: 200, description: '服务注销成功' })
  async unregisterService(@Param('serviceId') serviceId: string) {
    return await this.microservicesService.unregisterService(serviceId);
  }

  @Get('services')
  @ApiOperation({ summary: '获取已注册服务列表' })
  @ApiResponse({ status: 200, description: '获取成功', type: [ServiceRegistryEntity] })
  async getRegisteredServices() {
    return await this.microservicesService.getRegisteredServices();
  }

  @Get('services/:serviceName')
  @ApiOperation({ summary: '根据服务名获取服务实例' })
  @ApiParam({ name: 'serviceName', description: '服务名称' })
  @ApiResponse({ status: 200, description: '获取成功', type: [ServiceRegistryEntity] })
  async getServiceByName(@Param('serviceName') serviceName: string) {
    return await this.microservicesService.getServiceByName(serviceName);
  }

  @Put('services/:serviceId/status')
  @ApiOperation({ summary: '更新服务状态' })
  @ApiParam({ name: 'serviceId', description: '服务ID' })
  @ApiResponse({ status: 200, description: '更新成功' })
  async updateServiceStatus(@Param('serviceId') serviceId: string, @Body('status') status: string) {
    return await this.microservicesService.updateServiceStatus(serviceId, status);
  }

  // 服务配置管理
  @Post('configs')
  @ApiOperation({ summary: '创建服务配置' })
  @ApiResponse({ status: 200, description: '创建成功', type: ServiceConfigEntity })
  async createServiceConfig(@Body() configData: Partial<ServiceConfigEntity>) {
    return await this.microservicesService.createServiceConfig(configData);
  }

  @Get('configs')
  @ApiOperation({ summary: '获取服务配置列表' })
  @ApiQuery({ name: 'serviceName', required: false, description: '服务名称' })
  @ApiResponse({ status: 200, description: '获取成功', type: [ServiceConfigEntity] })
  async getServiceConfigs(@Query('serviceName') serviceName?: string) {
    return await this.microservicesService.getServiceConfigs(serviceName);
  }

  @Put('configs/:configId')
  @ApiOperation({ summary: '更新服务配置' })
  @ApiParam({ name: 'configId', description: '配置ID' })
  @ApiResponse({ status: 200, description: '更新成功' })
  async updateServiceConfig(
    @Param('configId') configId: string,
    @Body('configValue') configValue: string,
  ) {
    return await this.microservicesService.updateServiceConfig(configId, configValue);
  }

  // 服务监控和指标
  @Post('metrics')
  @ApiOperation({ summary: '记录服务指标' })
  @ApiResponse({ status: 200, description: '记录成功', type: ServiceMetricsEntity })
  async recordServiceMetrics(@Body() metricsData: Partial<ServiceMetricsEntity>) {
    return await this.microservicesService.recordServiceMetrics(metricsData);
  }

  @Get('metrics/:serviceName')
  @ApiOperation({ summary: '获取服务指标' })
  @ApiParam({ name: 'serviceName', description: '服务名称' })
  @ApiQuery({ name: 'startTime', required: false, description: '开始时间' })
  @ApiQuery({ name: 'endTime', required: false, description: '结束时间' })
  @ApiResponse({ status: 200, description: '获取成功', type: [ServiceMetricsEntity] })
  async getServiceMetrics(
    @Param('serviceName') serviceName: string,
    @Query('startTime') startTime?: string,
    @Query('endTime') endTime?: string,
  ) {
    const timeRange =
      startTime && endTime
        ? {
            start: new Date(startTime),
            end: new Date(endTime),
          }
        : undefined;

    return await this.microservicesService.getServiceMetrics(serviceName, timeRange);
  }

  @Get('metrics/:serviceName/latest')
  @ApiOperation({ summary: '获取服务最新指标' })
  @ApiParam({ name: 'serviceName', description: '服务名称' })
  @ApiResponse({ status: 200, description: '获取成功', type: ServiceMetricsEntity })
  async getLatestMetrics(@Param('serviceName') serviceName: string) {
    return await this.microservicesService.getLatestMetrics(serviceName);
  }

  // 服务发现
  @Post('discovery')
  @ApiOperation({ summary: '创建服务发现配置' })
  @ApiResponse({ status: 200, description: '创建成功', type: ServiceDiscoveryEntity })
  async createServiceDiscovery(@Body() discoveryData: Partial<ServiceDiscoveryEntity>) {
    return await this.microservicesService.createServiceDiscovery(discoveryData);
  }

  @Get('discovery')
  @ApiOperation({ summary: '获取服务发现配置列表' })
  @ApiResponse({ status: 200, description: '获取成功', type: [ServiceDiscoveryEntity] })
  async getServiceDiscoveries() {
    return await this.microservicesService.getServiceDiscoveries();
  }

  @Post('discovery/:discoveryId/sync')
  @ApiOperation({ summary: '同步服务发现' })
  @ApiParam({ name: 'discoveryId', description: '服务发现ID' })
  @ApiResponse({ status: 200, description: '同步成功' })
  async syncServiceDiscovery(@Param('discoveryId') discoveryId: string) {
    return await this.microservicesService.syncServiceDiscovery(discoveryId);
  }

  // 负载均衡
  @Post('load-balancers')
  @ApiOperation({ summary: '创建负载均衡配置' })
  @ApiResponse({ status: 200, description: '创建成功', type: LoadBalancerEntity })
  async createLoadBalancer(@Body() loadBalancerData: Partial<LoadBalancerEntity>) {
    return await this.microservicesService.createLoadBalancer(loadBalancerData);
  }

  @Get('load-balancers')
  @ApiOperation({ summary: '获取负载均衡配置列表' })
  @ApiQuery({ name: 'serviceName', required: false, description: '服务名称' })
  @ApiResponse({ status: 200, description: '获取成功', type: [LoadBalancerEntity] })
  async getLoadBalancers(@Query('serviceName') serviceName?: string) {
    return await this.microservicesService.getLoadBalancers(serviceName);
  }

  @Put('load-balancers/:loadBalancerId/metrics')
  @ApiOperation({ summary: '更新负载均衡指标' })
  @ApiParam({ name: 'loadBalancerId', description: '负载均衡ID' })
  @ApiResponse({ status: 200, description: '更新成功' })
  async updateLoadBalancerMetrics(
    @Param('loadBalancerId') loadBalancerId: string,
    @Body() metrics: { failedRequests: number; totalRequests: number },
  ) {
    return await this.microservicesService.updateLoadBalancerMetrics(loadBalancerId, metrics);
  }

  // 熔断器管理
  @Post('circuit-breakers')
  @ApiOperation({ summary: '创建熔断器配置' })
  @ApiResponse({ status: 200, description: '创建成功', type: CircuitBreakerEntity })
  async createCircuitBreaker(@Body() circuitBreakerData: Partial<CircuitBreakerEntity>) {
    return await this.microservicesService.createCircuitBreaker(circuitBreakerData);
  }

  @Get('circuit-breakers')
  @ApiOperation({ summary: '获取熔断器配置列表' })
  @ApiQuery({ name: 'serviceName', required: false, description: '服务名称' })
  @ApiResponse({ status: 200, description: '获取成功', type: [CircuitBreakerEntity] })
  async getCircuitBreakers(@Query('serviceName') serviceName?: string) {
    return await this.microservicesService.getCircuitBreakers(serviceName);
  }

  @Put('circuit-breakers/:circuitBreakerId/state')
  @ApiOperation({ summary: '更新熔断器状态' })
  @ApiParam({ name: 'circuitBreakerId', description: '熔断器ID' })
  @ApiResponse({ status: 200, description: '更新成功' })
  async updateCircuitBreakerState(
    @Param('circuitBreakerId') circuitBreakerId: string,
    @Body() data: { newState: string; isSuccess?: boolean },
  ) {
    return await this.microservicesService.updateCircuitBreakerState(
      circuitBreakerId,
      data.newState,
      data.isSuccess,
    );
  }

  // 服务健康检查
  @Post('health-check/:serviceId')
  @ApiOperation({ summary: '执行服务健康检查' })
  @ApiParam({ name: 'serviceId', description: '服务ID' })
  @ApiResponse({ status: 200, description: '检查完成' })
  async performHealthCheck(@Param('serviceId') serviceId: string) {
    return await this.microservicesService.performHealthCheck(serviceId);
  }

  // 服务统计和报表
  @Get('statistics')
  @ApiOperation({ summary: '获取微服务统计信息' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getServiceStatistics() {
    return await this.microservicesService.getServiceStatistics();
  }

  @Get('performance-report')
  @ApiOperation({ summary: '获取服务性能报告' })
  @ApiQuery({ name: 'startTime', description: '开始时间' })
  @ApiQuery({ name: 'endTime', description: '结束时间' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getServicePerformanceReport(
    @Query('startTime') startTime: string,
    @Query('endTime') endTime: string,
  ) {
    const timeRange = {
      start: new Date(startTime),
      end: new Date(endTime),
    };

    return await this.microservicesService.getServicePerformanceReport(timeRange);
  }
}
