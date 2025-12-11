import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AdvancedCacheService } from '../cache/advanced-cache.service';

interface RateLimitConfig {
  windowMs: number; // 时间窗口（毫秒）
  maxRequests: number; // 最大请求数
  message?: string;
  statusCode?: number;
}

interface SecurityRule {
  pattern: RegExp;
  action: 'block' | 'warn' | 'replace';
  replacement?: string;
  level: 'low' | 'medium' | 'high';
}

@Injectable()
export class AdvancedSecurityService implements OnModuleInit {
  private rateLimitConfigs = new Map<string, RateLimitConfig>();
  private sensitiveWords: Set<string> = new Set();
  private securityRules: SecurityRule[] = [];

  constructor(
    private configService: ConfigService,
    private cacheService: AdvancedCacheService
  ) {
    this.initSecurityRules();
    this.loadSensitiveWords();
  }

  async onModuleInit() {
    console.log('Advanced security service initialized');
  }

  private initSecurityRules() {
    // SQL注入防护规则
    this.securityRules.push({
      pattern: /(union\s+select|drop\s+table|insert\s+into|delete\s+from|update\s+set|exec\s*\(|xp_cmdshell)/gi,
      action: 'block',
      level: 'high'
    });

    // XSS攻击防护规则
    this.securityRules.push({
      pattern: /(<script|<iframe|<object|<embed|<form|javascript:|onload=|onerror=|onclick=)/gi,
      action: 'block',
      level: 'high'
    });

    // 路径遍历防护规则
    this.securityRules.push({
      pattern: /(\.\.\\|\.\.\/|\/etc\/passwd|\/etc\/shadow)/gi,
      action: 'block',
      level: 'high'
    });

    // 命令注入防护规则
    this.securityRules.push({
      pattern: /(\|\||\&\&|;|`|\$\()/gi,
      action: 'block',
      level: 'medium'
    });
  }

  private async loadSensitiveWords() {
    // 这里可以从数据库或文件加载敏感词
    const defaultSensitiveWords = [
      '赌博', '毒品', '色情', '暴力', '恐怖', '诈骗', '传销',
      '法轮功', '台独', '藏独', '疆独', '港独',
      '习近平', '共产党', '政府', '领导人'
    ];

    defaultSensitiveWords.forEach(word => this.sensitiveWords.add(word));
    
    // 可以加载动态敏感词
    try {
      const dynamicWords = await this.loadDynamicSensitiveWords();
      dynamicWords.forEach(word => this.sensitiveWords.add(word));
    } catch (error) {
      console.warn('Failed to load dynamic sensitive words:', error);
    }
  }

  private async loadDynamicSensitiveWords(): Promise<string[]> {
    // 这里可以实现从数据库或API加载动态敏感词
    return [];
  }

  // ==================== 限流防护 ====================

  /**
   * 配置限流规则
   */
  setRateLimit(key: string, config: RateLimitConfig) {
    this.rateLimitConfigs.set(key, config);
  }

  /**
   * 检查限流
   */
  async checkRateLimit(
    identifier: string,
    key: string = 'global'
  ): Promise<{
    allowed: boolean;
    remaining: number;
    resetTime: number;
    message?: string;
  }> {
    const config = this.rateLimitConfigs.get(key);
    if (!config) {
      return { allowed: true, remaining: Infinity, resetTime: Date.now() };
    }

    const cacheKey = `rate_limit:${key}:${identifier}`;
    const windowStart = Date.now() - config.windowMs;

    try {
      // 获取当前窗口内的请求记录
      const requests = await this.cacheService.executeWithLock(
        cacheKey,
        async () => {
          const existing = await this.cacheService.getWithLock(
            cacheKey,
            async () => [] as number[]
          );
          
          // 过滤掉过期请求
          const validRequests = existing.filter(time => time > windowStart);
          
          // 添加当前请求
          validRequests.push(Date.now());
          
          // 更新缓存
          await this.cacheService.mset(new Map([[cacheKey, validRequests]]), config.windowMs / 1000);
          
          return validRequests;
        }
      );

      const remaining = Math.max(0, config.maxRequests - requests.length);
      const resetTime = Date.now() + config.windowMs;

      return {
        allowed: remaining > 0,
        remaining,
        resetTime,
        message: remaining > 0 ? undefined : config.message
      };
    } catch (error) {
      console.error('Rate limit check failed:', error);
      // 限流检查失败时默认允许通过
      return { allowed: true, remaining: Infinity, resetTime: Date.now() };
    }
  }

  /**
   * IP限流
   */
  async checkIpRateLimit(ip: string): Promise<{
    allowed: boolean;
    remaining: number;
    resetTime: number;
  }> {
    return this.checkRateLimit(ip, 'ip');
  }

  /**
   * 用户ID限流
   */
  async checkUserRateLimit(userId: string): Promise<{
    allowed: boolean;
    remaining: number;
    resetTime: number;
  }> {
    return this.checkRateLimit(userId, 'user');
  }

  /**
   * API端点限流
   */
  async checkApiRateLimit(apiPath: string, identifier: string): Promise<{
    allowed: boolean;
    remaining: number;
    resetTime: number;
  }> {
    return this.checkRateLimit(identifier, `api:${apiPath}`);
  }

  // ==================== 敏感词过滤 ====================

  /**
   * 检查文本是否包含敏感词
   */
  containsSensitiveWords(text: string): {
    contains: boolean;
    words: string[];
    level: 'low' | 'medium' | 'high';
  } {
    const foundWords: string[] = [];
    let maxLevel: 'low' | 'medium' | 'high' = 'low';

    // 检查敏感词
    for (const word of this.sensitiveWords) {
      if (text.includes(word)) {
        foundWords.push(word);
        maxLevel = this.getSensitiveWordLevel(word);
      }
    }

    // 检查安全规则
    for (const rule of this.securityRules) {
      if (rule.pattern.test(text)) {
        foundWords.push(rule.pattern.source);
        if (this.compareSecurityLevels(rule.level, maxLevel) > 0) {
          maxLevel = rule.level;
        }
      }
    }

    return {
      contains: foundWords.length > 0,
      words: foundWords,
      level: maxLevel
    };
  }

  /**
   * 过滤敏感词
   */
  filterSensitiveWords(text: string, replacement: string = '***'): {
    filteredText: string;
    replacedWords: string[];
  } {
    let filteredText = text;
    const replacedWords: string[] = [];

    // 过滤敏感词
    for (const word of this.sensitiveWords) {
      if (filteredText.includes(word)) {
        const regex = new RegExp(word, 'gi');
        filteredText = filteredText.replace(regex, replacement);
        replacedWords.push(word);
      }
    }

    // 应用安全规则
    for (const rule of this.securityRules) {
      if (rule.action === 'replace' && rule.replacement) {
        filteredText = filteredText.replace(rule.pattern, rule.replacement);
      } else if (rule.action === 'block') {
        // 阻塞内容会在检查阶段处理
      }
    }

    return {
      filteredText,
      replacedWords
    };
  }

  /**
   * 添加敏感词
   */
  addSensitiveWord(word: string): void {
    this.sensitiveWords.add(word);
  }

  /**
   * 移除敏感词
   */
  removeSensitiveWord(word: string): boolean {
    return this.sensitiveWords.delete(word);
  }

  /**
   * 获取所有敏感词
   */
  getSensitiveWords(): string[] {
    return Array.from(this.sensitiveWords);
  }

  // ==================== 安全规则管理 ====================

  /**
   * 添加安全规则
   */
  addSecurityRule(rule: SecurityRule): void {
    this.securityRules.push(rule);
  }

  /**
   * 移除安全规则
   */
  removeSecurityRule(pattern: string): boolean {
    const index = this.securityRules.findIndex(rule => 
      rule.pattern.source === pattern
    );
    
    if (index > -1) {
      this.securityRules.splice(index, 1);
      return true;
    }
    
    return false;
  }

  /**
   * 获取所有安全规则
   */
  getSecurityRules(): SecurityRule[] {
    return [...this.securityRules];
  }

  // ==================== 工具方法 ====================

  private getSensitiveWordLevel(word: string): 'low' | 'medium' | 'high' {
    // 可以根据敏感词的严重程度返回不同级别
    const highLevelWords = ['法轮功', '台独', '藏独', '疆独', '港独'];
    const mediumLevelWords = ['赌博', '毒品', '色情', '暴力'];
    
    if (highLevelWords.includes(word)) return 'high';
    if (mediumLevelWords.includes(word)) return 'medium';
    return 'low';
  }

  private compareSecurityLevels(
    level1: 'low' | 'medium' | 'high',
    level2: 'low' | 'medium' | 'high'
  ): number {
    const levels = { low: 0, medium: 1, high: 2 };
    return levels[level1] - levels[level2];
  }

  /**
   * 安全评估
   */
  securityAssessment(input: string): {
    score: number; // 0-100，分数越低越安全
    threats: string[];
    recommendations: string[];
  } {
    const threats: string[] = [];
    let score = 0;

    // 检查敏感词
    const sensitiveResult = this.containsSensitiveWords(input);
    if (sensitiveResult.contains) {
      threats.push(`包含敏感词: ${sensitiveResult.words.join(', ')}`);
      score += sensitiveResult.level === 'high' ? 40 : 
               sensitiveResult.level === 'medium' ? 20 : 10;
    }

    // 检查安全规则
    for (const rule of this.securityRules) {
      if (rule.pattern.test(input)) {
        threats.push(`触发安全规则: ${rule.pattern.source}`);
        score += rule.level === 'high' ? 30 : 
                 rule.level === 'medium' ? 15 : 5;
      }
    }

    // 检查输入长度（防止缓冲区溢出）
    if (input.length > 10000) {
      threats.push('输入长度过长，可能存在缓冲区溢出风险');
      score += 10;
    }

    const recommendations = threats.map(threat => `处理: ${threat}`);
    
    return {
      score: Math.min(score, 100),
      threats,
      recommendations
    };
  }

  /**
   * 健康检查
   */
  async healthCheck(): Promise<{
    status: string;
    message?: string;
    details?: any;
  }> {
    try {
      const stats = {
        sensitiveWordsCount: this.sensitiveWords.size,
        securityRulesCount: this.securityRules.length,
        rateLimitConfigsCount: this.rateLimitConfigs.size
      };

      return {
        status: 'healthy',
        details: stats
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        message: error.message,
        details: { error: error.message }
      };
    }
  }
}