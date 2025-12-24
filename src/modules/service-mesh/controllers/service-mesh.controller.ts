import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ServiceMeshService } from '../services/service-mesh.service';
import { 
  MeshConfigEntity, 
  MeshGatewayEntity, 
  MeshPolicyEntity,
  MeshTelemetryEntity,
  MeshSecurityEntity,
  MeshTrafficEntity
} from '../entities/index';

@ApiTags('服务网格管理')
@Controller('service-mesh')
export class ServiceMeshController {
  constructor(private readonly serviceMeshService: ServiceMeshService) {}

  // 服务网格配置管理
  @Post('configs')
  @ApiOperation({ summary: '创建服务网格配置' })
  @ApiResponse({ status: 200, description: '创建成功', type: MeshConfigEntity })
  async createMeshConfig(@Body() configData: Partial<MeshConfigEntity>) {
    return await this.serviceMeshService.createMeshConfig(configData);
  }

  @Get('configs')
  @ApiOperation({ summary: '获取服务网格配置列表' })
  @ApiResponse({ status: 200, description: '获取成功', type: [MeshConfigEntity] })
  async getMeshConfigs() {
    return await this.serviceMeshService.getMeshConfigs();
  }

  @Get('configs/:configId')
  @ApiOperation({ summary: '获取服务网格配置详情' })
  @ApiParam({ name: 'configId', description: '配置ID' })
  @ApiResponse({ status: 200, description: '获取成功', type: MeshConfigEntity })
  async getMeshConfigById(@Param('configId') configId: string) {
    return await this.serviceMeshService.getMeshConfigById(configId);
  }

  @Put('configs/:configId')
  @ApiOperation({ summary: '更新服务网格配置' })
  @ApiParam({ name: 'configId', description: '配置ID' })
  @ApiResponse({ status: 200, description: '更新成功' })
  async updateMeshConfig(
    @Param('configId') configId: string,
    @Body() updateData: Partial<MeshConfigEntity>
  ) {
    return await this.serviceMeshService.updateMeshConfig(configId, updateData);
  }

  @Post('configs/:configId/deploy')
  @ApiOperation({ summary: '部署服务网格配置' })
  @ApiParam({ name: 'configId', description: '配置ID' })
  @ApiResponse({ status: 200, description: '部署成功' })
  async deployMeshConfig(@Param('configId') configId: string) {
    return await this.serviceMeshService.deployMeshConfig(configId);
  }

  // 网关管理
  @Post('gateways')
  @ApiOperation({ summary: '创建网关配置' })
  @ApiResponse({ status: 200, description: '创建成功', type: MeshGatewayEntity })
  async createGateway(@Body() gatewayData: Partial<MeshGatewayEntity>) {
    return await this.serviceMeshService.createGateway(gatewayData);
  }

  @Get('gateways')
  @ApiOperation({ summary: '获取网关配置列表' })
  @ApiResponse({ status: 200, description: '获取成功', type: [MeshGatewayEntity] })
  async getGateways() {
    return await this.serviceMeshService.getGateways();
  }

  @Get('gateways/:gatewayName')
  @ApiOperation({ summary: '根据名称获取网关配置' })
  @ApiParam({ name: 'gatewayName', description: '网关名称' })
  @ApiResponse({ status: 200, description: '获取成功', type: MeshGatewayEntity })
  async getGatewayByName(@Param('gatewayName') gatewayName: string) {
    return await this.serviceMeshService.getGatewayByName(gatewayName);
  }

  @Put('gateways/:gatewayId')
  @ApiOperation({ summary: '更新网关配置' })
  @ApiParam({ name: 'gatewayId', description: '网关ID' })
  @ApiResponse({ status: 200, description: '更新成功' })
  async updateGateway(
    @Param('gatewayId') gatewayId: string,
    @Body() updateData: Partial<MeshGatewayEntity>
  ) {
    return await this.serviceMeshService.updateGateway(gatewayId, updateData);
  }

  // 策略管理
  @Post('policies')
  @ApiOperation({ summary: '创建策略配置' })
  @ApiResponse({ status: 200, description: '创建成功', type: MeshPolicyEntity })
  async createPolicy(@Body() policyData: Partial<MeshPolicyEntity>) {
    return await this.serviceMeshService.createPolicy(policyData);
  }

  @Get('policies')
  @ApiOperation({ summary: '获取策略配置列表' })
  @ApiQuery({ name: 'serviceName', required: false, description: '服务名称' })
  @ApiResponse({ status: 200, description: '获取成功', type: [MeshPolicyEntity] })
  async getPolicies(@Query('serviceName') serviceName?: string) {
    return await this.serviceMeshService.getPolicies(serviceName);
  }

  @Put('policies/:policyId')
  @ApiOperation({ summary: '更新策略配置' })
  @ApiParam({ name: 'policyId', description: '策略ID' })
  @ApiResponse({ status: 200, description: '更新成功' })
  async updatePolicy(
    @Param('policyId') policyId: string,
    @Body() updateData: Partial<MeshPolicyEntity>
  ) {
    return await this.serviceMeshService.updatePolicy(policyId, updateData);
  }

  @Post('policies/evaluate')
  @ApiOperation({ summary: '评估策略' })
  @ApiResponse({ status: 200, description: '评估完成' })
  async evaluatePolicy(@Body() data: { serviceName: string; context: Record<string, any> }) {
    return await this.serviceMeshService.evaluatePolicy(data.serviceName, data.context);
  }

  // 遥测数据管理
  @Post('telemetry')
  @ApiOperation({ summary: '记录遥测数据' })
  @ApiResponse({ status: 200, description: '记录成功', type: MeshTelemetryEntity })
  async recordTelemetry(@Body() telemetryData: Partial<MeshTelemetryEntity>) {
    return await this.serviceMeshService.recordTelemetry(telemetryData);
  }

  @Get('telemetry')
  @ApiOperation({ summary: '获取遥测数据' })
  @ApiQuery({ name: 'serviceName', required: false, description: '服务名称' })
  @ApiQuery({ name: 'startTime', required: false, description: '开始时间' })
  @ApiQuery({ name: 'endTime', required: false, description: '结束时间' })
  @ApiResponse({ status: 200, description: '获取成功', type: [MeshTelemetryEntity] })
  async getTelemetryData(
    @Query('serviceName') serviceName?: string,
    @Query('startTime') startTime?: string,
    @Query('endTime') endTime?: string
  ) {
    const timeRange = startTime && endTime ? {
      start: new Date(startTime),
      end: new Date(endTime)
    } : undefined;
    
    return await this.serviceMeshService.getTelemetryData(serviceName, timeRange);
  }

  @Get('telemetry/traces/:traceId')
  @ApiOperation({ summary: '获取追踪数据' })
  @ApiParam({ name: 'traceId', description: '追踪ID' })
  @ApiResponse({ status: 200, description: '获取成功', type: [MeshTelemetryEntity] })
  async getTraces(@Param('traceId') traceId: string) {
    return await this.serviceMeshService.getTraces(traceId);
  }

  @Get('telemetry/metrics/:serviceName')
  @ApiOperation({ summary: '获取服务指标' })
  @ApiParam({ name: 'serviceName', description: '服务名称' })
  @ApiQuery({ name: 'startTime', description: '开始时间' })
  @ApiQuery({ name: 'endTime', description: '结束时间' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getServiceMetrics(
    @Param('serviceName') serviceName: string,
    @Query('startTime') startTime: string,
    @Query('endTime') endTime: string
  ) {
    const timeRange = {
      start: new Date(startTime),
      end: new Date(endTime)
    };
    
    return await this.serviceMeshService.getServiceMetrics(serviceName, timeRange);
  }

  // 安全策略管理
  @Post('security')
  @ApiOperation({ summary: '创建安全策略' })
  @ApiResponse({ status: 200, description: '创建成功', type: MeshSecurityEntity })
  async createSecurityPolicy(@Body() securityData: Partial<MeshSecurityEntity>) {
    return await this.serviceMeshService.createSecurityPolicy(securityData);
  }

  @Get('security')
  @ApiOperation({ summary: '获取安全策略列表' })
  @ApiQuery({ name: 'serviceName', required: false, description: '服务名称' })
  @ApiResponse({ status: 200, description: '获取成功', type: [MeshSecurityEntity] })
  async getSecurityPolicies(@Query('serviceName') serviceName?: string) {
    return await this.serviceMeshService.getSecurityPolicies(serviceName);
  }

  @Post('security/evaluate')
  @ApiOperation({ summary: '评估安全策略' })
  @ApiResponse({ status: 200, description: '评估完成' })
  async evaluateSecurityPolicy(@Body() data: { serviceName: string; context: Record<string, any> }) {
    return await this.serviceMeshService.evaluateSecurityPolicy(data.serviceName, data.context);
  }

  @Put('security/:policyId/hit')
  @ApiOperation({ summary: '更新安全策略命中次数' })
  @ApiParam({ name: 'policyId', description: '策略ID' })
  @ApiResponse({ status: 200, description: '更新成功' })
  async updateSecurityPolicyHitCount(@Param('policyId') policyId: string) {
    return await this.serviceMeshService.updateSecurityPolicyHitCount(policyId);
  }

  // 流量管理
  @Post('traffic')
  @ApiOperation({ summary: '记录流量数据' })
  @ApiResponse({ status: 200, description: '记录成功', type: MeshTrafficEntity })
  async recordTraffic(@Body() trafficData: Partial<MeshTrafficEntity>) {
    return await this.serviceMeshService.recordTraffic(trafficData);
  }

  @Get('traffic')
  @ApiOperation({ summary: '获取流量数据' })
  @ApiQuery({ name: 'serviceName', required: false, description: '服务名称' })
  @ApiQuery({ name: 'startTime', required: false, description: '开始时间' })
  @ApiQuery({ name: 'endTime', required: false, description: '结束时间' })
  @ApiResponse({ status: 200, description: '获取成功', type: [MeshTrafficEntity] })
  async getTrafficData(
    @Query('serviceName') serviceName?: string,
    @Query('startTime') startTime?: string,
    @Query('endTime') endTime?: string
  ) {
    const timeRange = startTime && endTime ? {
      start: new Date(startTime),
      end: new Date(endTime)
    } : undefined;
    
    return await this.serviceMeshService.getTrafficData(serviceName, timeRange);
  }

  @Get('traffic/statistics/:serviceName')
  @ApiOperation({ summary: '获取流量统计' })
  @ApiParam({ name: 'serviceName', description: '服务名称' })
  @ApiQuery({ name: 'startTime', description: '开始时间' })
  @ApiQuery({ name: 'endTime', description: '结束时间' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getTrafficStatistics(
    @Param('serviceName') serviceName: string,
    @Query('startTime') startTime: string,
    @Query('endTime') endTime: string
  ) {
    const timeRange = {
      start: new Date(startTime),
      end: new Date(endTime)
    };
    
    return await this.serviceMeshService.getTrafficStatistics(serviceName, timeRange);
  }

  // 服务网格整体统计
  @Get('statistics')
  @ApiOperation({ summary: '获取服务网格统计信息' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getMeshStatistics() {
    return await this.serviceMeshService.getMeshStatistics();
  }

  // 健康检查
  @Get('health-check')
  @ApiOperation({ summary: '执行服务网格健康检查' })
  @ApiResponse({ status: 200, description: '检查完成' })
  async performMeshHealthCheck() {
    return await this.serviceMeshService.performMeshHealthCheck();
  }
}