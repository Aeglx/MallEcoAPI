import { Injectable, Inject } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { AxiosRequestConfig } from 'axios';

// 负载均衡算法类型
export type LoadBalancingStrategy = 'round-robin' | 'random' | 'least-connections';

@Injectable()
export class GatewayService {
  // 服务实例缓存
  private serviceInstances: Map<string, any[]> = new Map();
  // 轮询计数器
  private roundRobinCounters: Map<string, number> = new Map();
  // 连接计数器
  private connectionCounters: Map<string, Map<string, number>> = new Map();

  constructor(
    @Inject('CONSUL_CLIENT') private readonly consulClient: any,
    private readonly httpService: HttpService,
  ) {}

  /**
   * 获取服务实例列表
   */
  private async getServiceInstances(serviceName: string): Promise<any[]> {
    // 如果缓存中有实例且未过期，则使用缓存
    if (this.serviceInstances.has(serviceName)) {
      const instances = this.serviceInstances.get(serviceName);
      if (instances && instances.length > 0) {
        return instances;
      }
    }

    // 从Consul获取服务实例
    try {
      const services = await this.consulClient.catalog.service.nodes(serviceName);
      this.serviceInstances.set(serviceName, services);
      return services;
    } catch (error) {
      console.error(`Failed to get service instances for ${serviceName}:`, error);
      return [];
    }
  }

  /**
   * 根据负载均衡策略选择服务实例
   */
  private async selectServiceInstance(
    serviceName: string,
    strategy: LoadBalancingStrategy = 'round-robin',
  ): Promise<any | null> {
    const instances = await this.getServiceInstances(serviceName);
    if (!instances || instances.length === 0) {
      return null;
    }

    let selectedInstance: any;

    switch (strategy) {
      case 'round-robin':
        selectedInstance = this.selectRoundRobin(serviceName, instances);
        break;
      case 'random':
        selectedInstance = this.selectRandom(instances);
        break;
      case 'least-connections':
        selectedInstance = this.selectLeastConnections(serviceName, instances);
        break;
      default:
        selectedInstance = this.selectRoundRobin(serviceName, instances);
    }

    return selectedInstance;
  }

  /**
   * 轮询选择
   */
  private selectRoundRobin(serviceName: string, instances: any[]): any {
    const counter = this.roundRobinCounters.get(serviceName) || 0;
    const index = counter % instances.length;
    this.roundRobinCounters.set(serviceName, counter + 1);
    return instances[index];
  }

  /**
   * 随机选择
   */
  private selectRandom(instances: any[]): any {
    const index = Math.floor(Math.random() * instances.length);
    return instances[index];
  }

  /**
   * 最少连接选择
   */
  private selectLeastConnections(serviceName: string, instances: any[]): any {
    if (!this.connectionCounters.has(serviceName)) {
      this.connectionCounters.set(serviceName, new Map());
    }

    const instanceConnections = this.connectionCounters.get(serviceName);
    let minConnections = Infinity;
    let selectedInstance = instances[0];

    for (const instance of instances) {
      const instanceKey = `${instance.ServiceAddress}:${instance.ServicePort}`;
      const connections = instanceConnections.get(instanceKey) || 0;

      if (connections < minConnections) {
        minConnections = connections;
        selectedInstance = instance;
      }
    }

    return selectedInstance;
  }

  /**
   * 增加连接计数
   */
  private incrementConnection(serviceName: string, instance: any): void {
    const instanceKey = `${instance.ServiceAddress}:${instance.ServicePort}`;

    if (!this.connectionCounters.has(serviceName)) {
      this.connectionCounters.set(serviceName, new Map());
    }

    const instanceConnections = this.connectionCounters.get(serviceName);
    const currentConnections = instanceConnections.get(instanceKey) || 0;
    instanceConnections.set(instanceKey, currentConnections + 1);
  }

  /**
   * 减少连接计数
   */
  private decrementConnection(serviceName: string, instance: any): void {
    const instanceKey = `${instance.ServiceAddress}:${instance.ServicePort}`;

    if (!this.connectionCounters.has(serviceName)) {
      return;
    }

    const instanceConnections = this.connectionCounters.get(serviceName);
    const currentConnections = instanceConnections.get(instanceKey) || 1;

    if (currentConnections > 0) {
      instanceConnections.set(instanceKey, currentConnections - 1);
    }
  }

  /**
   * 向服务发送请求
   */
  async requestService(
    serviceName: string,
    path: string,
    method: string = 'GET',
    data?: any,
    config?: AxiosRequestConfig,
    strategy: LoadBalancingStrategy = 'round-robin',
  ): Promise<any> {
    // 选择服务实例
    const instance = await this.selectServiceInstance(serviceName, strategy);
    if (!instance) {
      throw new Error(`No instances available for service ${serviceName}`);
    }

    // 构建请求URL
    const baseUrl = `http://${instance.ServiceAddress}:${instance.ServicePort}`;
    const url = `${baseUrl}${path}`;

    // 增加连接计数
    this.incrementConnection(serviceName, instance);

    try {
      // 发送请求
      const response = await lastValueFrom(
        this.httpService.request({
          url,
          method,
          data,
          ...config,
        }),
      );

      return response.data;
    } finally {
      // 减少连接计数
      this.decrementConnection(serviceName, instance);
    }
  }

  /**
   * 定期刷新服务实例列表
   */
  async refreshServiceInstances(): Promise<void> {
    // 刷新所有服务实例
    for (const serviceName of this.serviceInstances.keys()) {
      await this.getServiceInstances(serviceName);
    }
  }
}
