import { Injectable, Logger } from '@nestjs/common';

interface ServerNode {
  id: string;
  host: string;
  port: number;
  weight: number;
  currentLoad: number;
  maxConnections: number;
  activeConnections: number;
  responseTime: number;
  isHealthy: boolean;
  lastHealthCheck: Date;
  metadata?: Record<string, any>;
}

interface LoadBalancingStrategy {
  name: string;
  selectNode: (nodes: ServerNode[], request: any) => ServerNode | null;
}

interface HealthCheckResult {
  nodeId: string;
  isHealthy: boolean;
  responseTime: number;
  error?: string;
  metrics?: any;
}

interface LoadBalancingMetrics {
  totalRequests: number;
  activeConnections: number;
  averageResponseTime: number;
  requestDistribution: Record<string, number>;
  failureRate: number;
  throughput: number;
}

@Injectable()
export class IntelligentLoadBalancer {
  private readonly logger = new Logger(IntelligentLoadBalancer.name);
  private readonly nodes = new Map<string, ServerNode>();
  private readonly metrics: LoadBalancingMetrics = {
    totalRequests: 0,
    activeConnections: 0,
    averageResponseTime: 0,
    requestDistribution: {},
    failureRate: 0,
    throughput: 0,
  };

  private readonly strategies: Map<string, LoadBalancingStrategy> = new Map();
  private currentStrategy = 'weighted_round_robin';
  private roundRobinIndex = 0;
  private healthCheckInterval: NodeJS.Timeout;

  constructor() {
    this.initializeStrategies();
    this.startHealthCheck();
  }

  /**
   * 添加服务器节点
   */
  addNode(node: Omit<ServerNode, 'currentLoad' | 'activeConnections' | 'responseTime' | 'isHealthy' | 'lastHealthCheck'>): void {
    const serverNode: ServerNode = {
      ...node,
      currentLoad: 0,
      activeConnections: 0,
      responseTime: 0,
      isHealthy: true,
      lastHealthCheck: new Date(),
    };

    this.nodes.set(node.id, serverNode);
    this.logger.log(`添加服务器节点: ${node.id} (${node.host}:${node.port})`);
  }

  /**
   * 移除服务器节点
   */
  removeNode(nodeId: string): void {
    if (this.nodes.delete(nodeId)) {
      this.logger.log(`移除服务器节点: ${nodeId}`);
    }
  }

  /**
   * 选择服务器节点
   */
  selectNode(request?: any): ServerNode | null {
    const healthyNodes = this.getHealthyNodes();
    
    if (healthyNodes.length === 0) {
      this.logger.error('没有可用的健康服务器节点');
      return null;
    }

    const strategy = this.strategies.get(this.currentStrategy);
    if (!strategy) {
      this.logger.error(`未知的负载均衡策略: ${this.currentStrategy}`);
      return null;
    }

    const selectedNode = strategy.selectNode(healthyNodes, request);
    
    if (selectedNode) {
      this.updateNodeMetrics(selectedNode, request);
      this.metrics.totalRequests++;
      this.metrics.requestDistribution[selectedNode.id] = 
        (this.metrics.requestDistribution[selectedNode.id] || 0) + 1;
    }

    return selectedNode;
  }

  /**
   * 设置负载均衡策略
   */
  setStrategy(strategyName: string): void {
    if (this.strategies.has(strategyName)) {
      this.currentStrategy = strategyName;
      this.logger.log(`切换负载均衡策略: ${strategyName}`);
    } else {
      this.logger.error(`未知的负载均衡策略: ${strategyName}`);
    }
  }

  /**
   * 更新节点负载信息
   */
  updateNodeLoad(nodeId: string, load: number): void {
    const node = this.nodes.get(nodeId);
    if (node) {
      node.currentLoad = load;
      node.lastHealthCheck = new Date();
    }
  }

  /**
   * 记录请求响应时间
   */
  recordResponseTime(nodeId: string, responseTime: number): void {
    const node = this.nodes.get(nodeId);
    if (node) {
      // 使用指数移动平均计算响应时间
      const alpha = 0.3; // 平滑因子
      node.responseTime = alpha * responseTime + (1 - alpha) * node.responseTime;
      
      // 更新全局平均响应时间
      this.updateGlobalResponseTime(responseTime);
    }
  }

  /**
   * 获取负载均衡指标
   */
  getMetrics(): LoadBalancingMetrics {
    this.metrics.activeConnections = this.calculateTotalActiveConnections();
    this.metrics.failureRate = this.calculateFailureRate();
    this.metrics.throughput = this.calculateThroughput();
    
    return { ...this.metrics };
  }

  /**
   * 获取所有节点状态
   */
  getNodesStatus(): ServerNode[] {
    return Array.from(this.nodes.values());
  }

  /**
   * 健康检查
   */
  async performHealthCheck(): Promise<HealthCheckResult[]> {
    const results: HealthCheckResult[] = [];
    
    for (const [nodeId, node] of this.nodes) {
      try {
        const result = await this.checkNodeHealth(node);
        results.push(result);
        
        // 更新节点健康状态
        node.isHealthy = result.isHealthy;
        node.lastHealthCheck = new Date();
        
        if (result.responseTime) {
          node.responseTime = result.responseTime;
        }
      } catch (error) {
        this.logger.error(`健康检查失败: ${nodeId}`, error);
        results.push({
          nodeId,
          isHealthy: false,
          responseTime: -1,
          error: error.message,
        });
        
        node.isHealthy = false;
      }
    }
    
    return results;
  }

  /**
   * 初始化负载均衡策略
   */
  private initializeStrategies(): void {
    // 轮询策略
    this.strategies.set('round_robin', {
      name: '轮询',
      selectNode: (nodes) => {
        if (nodes.length === 0) return null;
        
        const node = nodes[this.roundRobinIndex % nodes.length];
        this.roundRobinIndex++;
        return node;
      },
    });

    // 加权轮询策略
    this.strategies.set('weighted_round_robin', {
      name: '加权轮询',
      selectNode: (nodes) => {
        if (nodes.length === 0) return null;
        
        // 计算总权重
        const totalWeight = nodes.reduce((sum, node) => sum + node.weight, 0);
        
        // 随机选择
        let random = Math.random() * totalWeight;
        
        for (const node of nodes) {
          random -= node.weight;
          if (random <= 0) {
            return node;
          }
        }
        
        return nodes[0];
      },
    });

    // 最少连接策略
    this.strategies.set('least_connections', {
      name: '最少连接',
      selectNode: (nodes) => {
        if (nodes.length === 0) return null;
        
        return nodes.reduce((min, node) => 
          node.activeConnections < min.activeConnections ? node : min
        );
      },
    });

    // 最少负载策略
    this.strategies.set('least_load', {
      name: '最少负载',
      selectNode: (nodes) => {
        if (nodes.length === 0) return null;
        
        return nodes.reduce((min, node) => 
          node.currentLoad < min.currentLoad ? node : min
        );
      },
    });

    // 最快响应策略
    this.strategies.set('fastest_response', {
      name: '最快响应',
      selectNode: (nodes) => {
        if (nodes.length === 0) return null;
        
        return nodes.reduce((fastest, node) => 
          node.responseTime < fastest.responseTime ? node : fastest
        );
      },
    });

    // 智能策略（综合考虑多个因素）
    this.strategies.set('intelligent', {
      name: '智能均衡',
      selectNode: (nodes, request) => {
        if (nodes.length === 0) return null;
        
        return nodes
          .map(node => ({
            node,
            score: this.calculateNodeScore(node, request),
          }))
          .sort((a, b) => b.score - a.score)[0]?.node || null;
      },
    });

    this.logger.log(`初始化了 ${this.strategies.size} 种负载均衡策略`);
  }

  /**
   * 计算节点评分（用于智能策略）
   */
  private calculateNodeScore(node: ServerNode, request?: any): number {
    let score = 100; // 基础分数
    
    // 负载影响（权重30%）
    const loadScore = (1 - node.currentLoad / 100) * 30;
    score += loadScore;
    
    // 连接数影响（权重25%）
    const connectionScore = (1 - node.activeConnections / node.maxConnections) * 25;
    score += connectionScore;
    
    // 响应时间影响（权重25%）
    const responseScore = Math.max(0, (1000 - node.responseTime) / 1000) * 25;
    score += responseScore;
    
    // 健康状态影响（权重20%）
    const healthScore = node.isHealthy ? 20 : 0;
    score += healthScore;
    
    return Math.max(0, score);
  }

  /**
   * 获取健康节点
   */
  private getHealthyNodes(): ServerNode[] {
    return Array.from(this.nodes.values()).filter(node => node.isHealthy);
  }

  /**
   * 更新节点指标
   */
  private updateNodeMetrics(node: ServerNode, request?: any): void {
    node.activeConnections++;
    node.currentLoad = Math.min(100, node.currentLoad + (100 / node.maxConnections));
  }

  /**
   * 更新全局响应时间
   */
  private updateGlobalResponseTime(responseTime: number): void {
    const alpha = 0.1;
    this.metrics.averageResponseTime = 
      alpha * responseTime + (1 - alpha) * this.metrics.averageResponseTime;
  }

  /**
   * 计算总活跃连接数
   */
  private calculateTotalActiveConnections(): number {
    return Array.from(this.nodes.values())
      .reduce((total, node) => total + node.activeConnections, 0);
  }

  /**
   * 计算失败率
   */
  private calculateFailureRate(): number {
    // 简化实现，实际应该基于历史请求数据
    const unhealthyNodes = Array.from(this.nodes.values())
      .filter(node => !node.isHealthy).length;
    
    return this.nodes.size > 0 ? (unhealthyNodes / this.nodes.size) * 100 : 0;
  }

  /**
   * 计算吞吐量
   */
  private calculateThroughput(): number {
    // 简化实现：每秒请求数
    return this.metrics.totalRequests / 60; // 假设1分钟窗口
  }

  /**
   * 检查单个节点健康状态
   */
  private async checkNodeHealth(node: ServerNode): Promise<HealthCheckResult> {
    const startTime = Date.now();
    
    try {
      // 使用HTTP健康检查
      const response = await fetch(`http://${node.host}:${node.port}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000), // 5秒超时
      });
      
      const responseTime = Date.now() - startTime;
      const isHealthy = response.ok && responseTime < 5000;
      
      return {
        nodeId: node.id,
        isHealthy,
        responseTime,
        metrics: {
          status: response.status,
          load: node.currentLoad,
        },
      };
    } catch (error) {
      return {
        nodeId: node.id,
        isHealthy: false,
        responseTime: Date.now() - startTime,
        error: error.message,
      };
    }
  }

  /**
   * 启动健康检查定时器
   */
  private startHealthCheck(): void {
    this.healthCheckInterval = setInterval(async () => {
      await this.performHealthCheck();
    }, 30000); // 每30秒检查一次
    
    this.logger.log('启动了定时健康检查');
  }

  /**
   * 停止健康检查
   */
  onModuleDestroy(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
  }
}