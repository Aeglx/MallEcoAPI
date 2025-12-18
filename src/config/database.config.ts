/**
 * 数据库配置
 * 支持自动检测和初始化功能
 */

import { Injectable } from '@nestjs/common';
import { DatabaseChecker } from '../../DB/database-check';

@Injectable()
export class DatabaseConfig {
    private readonly dbChecker: DatabaseChecker;

    constructor() {
        this.dbChecker = new DatabaseChecker();
    }

    /**
     * 应用启动时自动检测数据库
     */
    async autoCheckDatabase(): Promise<void> {
        console.log('🔍 MallEco API 启动中...');
        
        try {
            // 检测数据库状态
            const result = await this.dbChecker.check();
            
            if (result) {
                console.log('✅ 数据库检测完成，API服务正常启动');
            } else {
                console.error('❌ 数据库检测失败，请检查数据库配置');
                process.exit(1);
            }
            
        } catch (error) {
            console.error('数据库检测过程中发生错误:', error.message);
            
            // 开发环境下可以选择继续运行
            if (process.env.NODE_ENV === 'development') {
                console.warn('⚠️  开发环境：忽略数据库错误，继续启动');
                return;
            }
            
            process.exit(1);
        }
    }

    /**
     * 获取数据库连接配置
     */
    getConnectionConfig() {
        return {
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT) || 3306,
            username: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'malleco',
            charset: 'utf8mb4',
            timezone: '+08:00',
            acquireTimeout: 60000,
            timeout: 60000,
            reconnect: true,
            connectionLimit: 10
        };
    }

    /**
     * 获取数据库健康状态
     */
    async getHealthStatus() {
        return await this.dbChecker.healthCheck();
    }

    /**
     * 获取数据库信息
     */
    async getDatabaseInfo() {
        return await this.dbChecker.getDatabaseInfo();
    }
}

// 导出配置实例
export const databaseConfig = new DatabaseConfig();