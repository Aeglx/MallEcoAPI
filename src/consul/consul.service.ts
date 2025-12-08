import { Injectable, OnModuleInit, OnModuleDestroy, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ConsulService implements OnModuleInit, OnModuleDestroy {
  private serviceId: string;

  constructor(
    @Inject('CONSUL_CLIENT') private readonly consulClient: any,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    await this.registerService();
  }

  async onModuleDestroy() {
    await this.deregisterService();
  }

  private async registerService() {
    const serviceName = this.configService.get('SERVICE_NAME', 'malleco-api');
    const servicePort = this.configService.get('PORT', 3001);
    const serviceAddress = this.configService.get('SERVICE_ADDRESS', 'localhost');
    
    this.serviceId = `${serviceName}-${serviceAddress}-${servicePort}`;

    try {
      await this.consulClient.agent.service.register({
        id: this.serviceId,
        name: serviceName,
        address: serviceAddress,
        port: servicePort,
        check: {
          http: `http://${serviceAddress}:${servicePort}/health`,
          interval: '10s',
          timeout: '5s',
        },
        tags: ['api', 'malleco', 'nestjs'],
      });
      console.log(`Service registered with Consul: ${this.serviceId}`);
    } catch (error) {
      console.error('Failed to register service with Consul:', error.message);
    }
  }

  private async deregisterService() {
    if (this.serviceId) {
      try {
        await this.consulClient.agent.service.deregister(this.serviceId);
        console.log(`Service deregistered from Consul: ${this.serviceId}`);
      } catch (error) {
        console.error('Failed to deregister service from Consul:', error.message);
      }
    }
  }

  async getService(serviceName: string) {
    try {
      const services = await this.consulClient.catalog.service.nodes(serviceName);
      return services;
    } catch (error) {
      console.error(`Failed to get service ${serviceName}:`, error.message);
      return [];
    }
  }
}
