import { Injectable, OnModuleInit } from '@nestjs/common';
import * as seata from 'seata-nodejs-sdk';

@Injectable()
export class SeataService implements OnModuleInit {
  private seataClient: any;
  
  async onModuleInit() {
    await this.initSeataClient();
  }

  private async initSeataClient() {
    try {
      this.seataClient = await seata.init({
        applicationId: 'mall-eco-api',
        txServiceGroup: 'mall_tx_group',
        registry: {
          type: 'nacos',
          serverAddr: process.env.NACOS_SERVER_ADDR || 'localhost:8848',
          namespace: process.env.NACOS_NAMESPACE || '',
        },
        config: {
          type: 'nacos',
          serverAddr: process.env.NACOS_SERVER_ADDR || 'localhost:8848',
          namespace: process.env.NACOS_NAMESPACE || '',
        },
      });
      
      console.log('Seata client initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Seata client:', error);
    }
  }

  // 开启全局事务
  async beginTransaction(name: string, timeout: number = 60000): Promise<string> {
    if (!this.seataClient) {
      throw new Error('Seata client not initialized');
    }

    try {
      const xid = await this.seataClient.begin(name, timeout);
      console.log(`Global transaction started: ${xid}`);
      return xid;
    } catch (error) {
      console.error('Failed to begin global transaction:', error);
      throw error;
    }
  }

  // 提交全局事务
  async commitTransaction(xid: string): Promise<void> {
    if (!this.seataClient) {
      throw new Error('Seata client not initialized');
    }

    try {
      await this.seataClient.commit(xid);
      console.log(`Global transaction committed: ${xid}`);
    } catch (error) {
      console.error('Failed to commit global transaction:', error);
      throw error;
    }
  }

  // 回滚全局事务
  async rollbackTransaction(xid: string): Promise<void> {
    if (!this.seataClient) {
      throw new Error('Seata client not initialized');
    }

    try {
      await this.seataClient.rollback(xid);
      console.log(`Global transaction rolled back: ${xid}`);
    } catch (error) {
      console.error('Failed to rollback global transaction:', error);
      throw error;
    }
  }

  // 获取当前事务ID
  getCurrentXid(): string | null {
    if (!this.seataClient) {
      return null;
    }
    return this.seataClient.getXID();
  }

  // 检查是否在全局事务中
  isInGlobalTransaction(): boolean {
    return this.getCurrentXid() !== null;
  }

  // 注册分支事务
  async registerBranchTransaction(
    xid: string,
    resourceId: string,
    branchType: string,
    applicationData: any
  ): Promise<number> {
    if (!this.seataClient) {
      throw new Error('Seata client not initialized');
    }

    try {
      const branchId = await this.seataClient.registerBranch(
        xid,
        resourceId,
        branchType,
        applicationData
      );
      return branchId;
    } catch (error) {
      console.error('Failed to register branch transaction:', error);
      throw error;
    }
  }

  // 报告分支事务状态
  async reportBranchStatus(
    xid: string,
    branchId: number,
    status: number,
    applicationData: any
  ): Promise<void> {
    if (!this.seataClient) {
      throw new Error('Seata client not initialized');
    }

    try {
      await this.seataClient.reportBranchStatus(
        xid,
        branchId,
        status,
        applicationData
      );
    } catch (error) {
      console.error('Failed to report branch status:', error);
      throw error;
    }
  }
}