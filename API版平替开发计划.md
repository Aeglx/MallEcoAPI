# MallEcoAPI 平替开发计划

**最后更新时间：2025年12月10日**
**文档版本：v2.0**
**项目状态：按计划进行中**

## 1. 项目目标

### 1.1 核心目标
- **完全平替Java版后端API**，确保前端无需修改即可无缝切换
- **实现192个剩余的API端点**，目前已完成73个端点（钱包支付、直播系统、搜索系统）
- **保持API接口格式完全兼容**，确保前端调用方式不变
- **建立企业级系统架构**，支持高并发和高可用

### 1.2 技术目标
- 保持NestJS + TypeScript技术栈
- 实现微服务架构演进
- 建立完善的测试和监控体系
- 达到生产环境性能标准

## 2. 开发范围分析

### 2.1 缺失功能统计

| 模块 | 缺失端点数 | 优先级 | 预估工作量(人日) | 状态 |
|------|-----------|--------|----------------|------|
| 分销系统 | 35 | 高 | 105 | 待开发 |
| 促销营销 | 42 | 高 | 126 | 待开发 |
| 钱包支付 | 0 | 高 | 75 | ✅ 已完成 |
| 直播系统 | 0 | 中 | 45 | ✅ 已完成 |
| 搜索系统 | 0 | 中 | 30 | ✅ 已完成 |
| 内容管理 | 30 | 中 | 90 | 待开发 |
| 权限管理 | 40 | 中 | 120 | 待开发 |
| 统计报表 | 20 | 低 | 105 | 部分完成 |
| 系统管理 | 25 | 低 | 75 | 待开发 |
| **总计** | **192** | - | **766** | - |

### 2.2 数据模型开发

**缺失实体数量**: 约100个
**预估工作量**: 200人日

### 2.3 业务逻辑开发

**服务类数量**: 约150个
**预估工作量**: 300人日

### 2.4 测试开发

**测试覆盖率目标**: 80%+
**预估工作量**: 150人日

### 2.5 总工作量估算

**开发总工作量**: 1391人日
**建议团队配置**: 6-8人
**预估开发周期**: 12-18个月

## 3. 分阶段实施计划

### 3.1 第一阶段：核心业务补充 (已完成)

#### 阶段目标
- ✅ 完成核心电商功能
- ✅ 实现钱包支付模块
- ✅ 达到基础生产可用状态

#### 完成情况

**已完成模块：**
- ✅ 钱包支付系统 (25个端点)
  - Week 19-24: 完成钱包核心功能、充值提现功能和积分商城功能
- ✅ 直播系统 (15个端点)
  - Week 25-28: 完成直播间管理和直播商品互动功能
- ✅ 搜索系统 (10个端点)
  - 基于Elasticsearch的商品搜索功能

**待开发模块：**

**第1-2月：分销系统开发 (35个端点)**
```
Week 1-2: 数据模型设计和开发
├── Distribution - 分销员表
├── DistributionCash - 分销提现表
├── DistributionGoods - 分销商品表
├── DistributionOrder - 分销订单表
└── DistributionLevel - 分销等级表

Week 3-4: 分销员管理模块 (10个端点)
├── 分销员申请接口
├── 分销员审核接口
├── 分销员信息查询
├── 分销员等级管理
├── 分销员佣金查询
├── 分销员排行榜
├── 分销员推广链接
├── 分销员推广统计
├── 分销员二维码生成
└── 分销员推广效果分析

Week 5-6: 分销商品管理模块 (8个端点)
├── 分销商品设置接口
├── 分销商品查询接口
├── 分销比例配置接口
├── 分销商品审核接口
├── 分销商品上下架
├── 分销商品统计接口
├── 分销商品推荐接口
└── 分销商品搜索接口

Week 7-8: 分销订单管理模块 (10个端点)
├── 分销订单创建接口
├── 分销订单查询接口
├── 分销订单状态更新
├── 分销订单取消接口
├── 分销订单退款处理
├── 分销订单统计接口
├── 分销订单导出接口
├── 分销订单详情查询
├── 分销订单物流查询
└── 分销订单评价接口

Week 9-10: 分销财务模块 (7个端点)
├── 佣金计算接口
├── 佣金结算接口
├── 分销提现申请接口
├── 分销提现审核接口
├── 分销账单查询接口
├── 分销财务统计接口
└── 分销税务处理接口
```

**第3-4月：促销营销系统开发 (42个端点)**
```
Week 11-12: 优惠券系统 (15个端点)
├── 优惠券创建接口
├── 优惠券发放接口
├── 优惠券领取接口
├── 优惠券使用接口
├── 优惠券查询接口
├── 优惠券核销接口
├── 优惠券统计接口
├── 优惠券模板管理
├── 优惠券规则配置
├── 优惠券有效期管理
├── 优惠券使用限制
├── 优惠券分享接口
├── 优惠券批量操作
├── 优惠券活动管理
└── 优惠券效果分析

Week 13-14: 秒杀活动系统 (12个端点)
├── 秒杀活动创建接口
├── 秒杀商品设置接口
├── 秒杀活动报名接口
├── 秒杀订单创建接口
├── 秒杀库存管理接口
├── 秒杀排队机制
├── 秒杀活动查询接口
├── 秒杀商品搜索接口
├── 秒杀统计接口
├── 秒杀活动配置
├── 秒杀时间管理
└── 秒杀风控接口

Week 15-16: 拼团活动系统 (8个端点)
├── 拼团活动创建接口
├── 拼团商品设置接口
├── 拼团订单创建接口
├── 拼团参与接口
├── 拼团状态管理接口
├── 拼团统计接口
├── 拼团配置管理
└── 拼团分享接口

Week 17-18: 砍价活动系统 (7个端点)
├── 砍价活动创建接口
├── 砍价商品设置接口
├── 砍价发起接口
├── 砍价参与接口
├── 砍价进度查询接口
├── 砍价成功处理接口
└── 砍价统计接口
```

### 3.2 第二阶段：增值功能开发 (7-10个月)

#### 阶段目标
- ✅ 完成直播系统
- ✅ 完成搜索系统
- 完成内容管理
- 实现权限管理系统
- 建立统计报表体系

#### 详细计划

**第7-8月：直播系统开发 (15个端点) ✅ 已完成**
```
Week 25-26: 直播间管理 (8个端点) ✅
├── 直播间创建接口 ✅
├── 直播间配置接口 ✅
├── 直播间状态管理接口 ✅
├── 直播间查询接口 ✅
├── 直播间列表接口 ✅
├── 直播间统计接口 ✅
├── 直播间权限管理 ✅
└── 直播间推荐接口 ✅

Week 27-28: 直播商品和互动 (7个端点) ✅
├── 直播商品关联接口 ✅
├── 直播商品查询接口 ✅
├── 直播下单接口 ✅
├── 直播聊天接口 ✅
├── 直播点赞接口 ✅
├── 直播观看统计接口 ✅
└── 直播回放管理接口 ✅
```

**搜索系统开发 (10个端点) ✅ 已完成**
```
├── 商品搜索接口 ✅
├── 搜索条件过滤接口 ✅
├── 搜索排序接口 ✅
├── 搜索联想接口 ✅
├── 热门搜索接口 ✅
├── 搜索历史记录接口 ✅
├── 搜索统计接口 ✅
├── 搜索配置管理接口 ✅
├── 搜索索引管理接口 ✅
└── 搜索回退机制 ✅
```

**第9-10月：内容管理系统 (30个端点)**
```
Week 29-32: 文章管理系统 (15个端点)
├── 文章创建接口
├── 文章编辑接口
├── 文章发布接口
├── 文章查询接口
├── 文章分类管理接口
├── 文章标签管理接口
├── 文章评论接口
├── 文章点赞接口
├── 文章分享接口
├── 文章搜索接口
├── 文章统计接口
├── 文章审核接口
├── 文章置顶接口
├── 文章推荐接口
└── 文章配置管理接口

Week 33-36: 专题页面管理 (15个端点)
├── 专题创建接口
├── 专题编辑接口
├── 专题发布接口
├── 专题查询接口
├── 专题分类管理接口
├── 专题模板管理接口
├── 页面配置接口
├── 页面预览接口
├── 页面发布接口
├── 页面统计接口
├── 反馈管理接口
├── 反馈处理接口
├── 反馈统计接口
├── 配置管理接口
└── 内容审核接口
```

**第11-12月：权限管理系统 (40个端点)**
```
Week 37-40: RBAC核心功能 (20个端点)
├── 部门管理接口 (5个端点)
├── 角色管理接口 (5个端点)
├── 用户角色分配接口 (5个端点)
├── 权限验证接口 (5个端点)

Week 41-44: 菜单和配置 (20个端点)
├── 菜单管理接口 (8个端点)
├── 权限配置接口 (6个端点)
├── 角色权限关联接口 (6个端点)
```

### 3.3 第三阶段：系统完善 (13-18个月)

#### 阶段目标
- 完成统计报表系统
- 实现系统管理功能
- 建立完善监控体系
- 性能优化和架构升级

#### 详细计划

**第13-14月：统计报表系统 (35个端点)**
```
Week 45-48: 业务统计 (20个端点)
├── 商品销售统计接口 (5个端点)
├── 订单统计接口 (5个端点)
├── 会员统计接口 (5个端点)
├── 财务统计接口 (5个端点)

Week 49-52: 运营报表 (15个端点)
├── 运营指标统计接口 (5个端点)
├── 营销效果统计接口 (5个端点)
├── 用户行为统计接口 (5个端点)
```

**第15-16月：系统管理功能 (25个端点)**
```
Week 53-56: 系统配置管理 (15个端点)
├── 系统参数配置接口 (5个端点)
├── 日志管理接口 (5个端点)
├── 监控配置接口 (5个端点)

Week 57-60: 运维功能 (10个端点)
├── 备份恢复接口 (3个端点)
├── 版本管理接口 (3个端点)
├── 性能监控接口 (4个端点)
```

**第17-18月：架构优化和部署**
```
Week 61-64: 性能优化
├── 数据库优化
├── 缓存优化
├── 搜索引擎优化
├── 接口性能优化

Week 65-68: 架构升级
├── 微服务架构迁移
├── 负载均衡配置
├── 容器编排优化
├── 监控体系完善

Week 69-72: 测试和上线
├── 压力测试
├── 安全测试
├── 兼容性测试
├── 生产环境部署
```

## 4. 技术实现方案

### 4.1 API接口兼容性保证

#### 4.1.1 请求格式标准化
```typescript
// 统一请求格式
interface RequestModel<T> {
  data?: T;
  params?: any;
  query?: any;
}

// 响应格式标准化
interface ResponseModel<T> {
  code: number;
  message: string;
  data: T;
  timestamp: number;
  traceId: string;
}
```

#### 4.1.2 状态码映射
```typescript
// HTTP状态码与业务状态码映射
const STATUS_CODE_MAPPING = {
  SUCCESS: { http: 200, business: 200 },
  INVALID_PARAMS: { http: 400, business: 400 },
  UNAUTHORIZED: { http: 401, business: 401 },
  FORBIDDEN: { http: 403, business: 403 },
  NOT_FOUND: { http: 404, business: 404 },
  SERVER_ERROR: { http: 500, business: 500 }
};
```

#### 4.1.3 数据模型适配
```typescript
// Java实体到TypeScript实体的映射策略
@Entity()
export class Distribution {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 64 })
  memberName: string; // 对应Java的memberName

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  commissionAmount: number; // 对应Java的BigDecimal

  @CreateDateColumn()
  createTime: Date; // 对应Java的createTime

  @UpdateDateColumn()
  updateTime: Date; // 对应Java的updateTime
}
```

### 4.2 数据库设计策略

#### 4.2.1 表结构设计原则
- **保持字段命名一致**: 与Java版完全一致
- **数据类型映射**: Java类型到TypeScript类型的精确映射
- **索引策略**: 复制Java版的索引设计
- **约束规则**: 保持相同的业务约束

#### 4.2.2 数据类型映射表
| Java类型 | TypeScript类型 | 说明 |
|----------|----------------|------|
| Long | number | 64位整数 |
| BigDecimal | number | 精确小数 |
| String | string | 文本 |
| Date | Date | 日期时间 |
| Boolean | boolean | 布尔值 |
| Integer | number | 32位整数 |

### 4.3 业务逻辑实现

#### 4.3.1 分销系统核心算法
```typescript
// 分销佣金计算算法
@Injectable()
export class DistributionService {
  calculateCommission(orderAmount: number, level: number): number {
    // 分销佣金计算规则
    const commissionRates = [0.1, 0.05, 0.02]; // 三级分销比例
    const baseCommission = orderAmount * commissionRates[level - 1];
    return this.applyCommissionRules(baseCommission, level);
  }

  private applyCommissionRules(baseCommission: number, level: number): number {
    // 应用佣金规则：最低佣金、最高佣金、特殊商品等
    const minCommission = 0.01;
    const maxCommission = 1000;
    return Math.max(minCommission, Math.min(maxCommission, baseCommission));
  }
}
```

#### 4.3.2 促销营销引擎
```typescript
// 促销规则引擎
@Injectable()
export class PromotionEngine {
  async calculatePrice(productId: string, quantity: number, userId: string): Promise<PriceResult> {
    const promotions = await this.getAvailablePromotions(productId, userId);
    let finalPrice = await this.getBasePrice(productId);
    
    // 应用促销规则
    for (const promotion of promotions) {
      finalPrice = await this.applyPromotion(finalPrice, promotion, quantity);
    }
    
    return {
      originalPrice: finalPrice,
      discountAmount: await this.getBasePrice(productId) - finalPrice,
      finalPrice,
      appliedPromotions: promotions
    };
  }
}
```

### 4.4 性能优化策略

#### 4.4.1 数据库优化
```typescript
// 查询优化示例
@Injectable()
export class OrderRepository {
  // 使用索引优化查询
  async findOrdersByMember(memberId: string, pagination: PaginationDto) {
    return this.createQueryBuilder('order')
      .where('order.memberId = :memberId', { memberId })
      .orderBy('order.createTime', 'DESC')
      .skip(pagination.offset)
      .take(pagination.limit)
      .leftJoinAndSelect('order.items', 'items')
      .getManyAndCount();
  }

  // 批量操作优化
  async batchUpdateOrderStatus(orderIds: string[], status: string) {
    return this.createQueryBuilder()
      .update(Order)
      .set({ status })
      .where('id IN (:...orderIds)', { orderIds })
      .execute();
  }
}
```

#### 4.4.2 缓存策略
```typescript
@Injectable()
export class CacheService {
  // 多级缓存策略
  async getProduct(productId: string): Promise<Product> {
    // L1: 内存缓存
    let product = this.memoryCache.get(productId);
    
    if (!product) {
      // L2: Redis缓存
      product = await this.redisCache.get(productId);
      
      if (!product) {
        // L3: 数据库
        product = await this.productRepository.findOne(productId);
        await this.redisCache.set(productId, product, 3600);
      }
      
      this.memoryCache.set(productId, product, 300);
    }
    
    return product;
  }
}
```

## 5. 质量保证体系

### 5.1 测试策略

#### 5.1.1 单元测试
```typescript
// 单元测试示例
describe('DistributionService', () => {
  let service: DistributionService;
  
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [DistributionService],
    }).compile();
    
    service = module.get<DistributionService>(DistributionService);
  });

  describe('calculateCommission', () => {
    it('should calculate commission correctly for level 1', () => {
      const result = service.calculateCommission(100, 1);
      expect(result).toBe(10); // 100 * 0.1
    });
  });
});
```

#### 5.1.2 集成测试
```typescript
// API集成测试示例
describe('DistributionController', () => {
  let app: INestApplication;
  
  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    
    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('POST /distribution/apply', async () => {
    const response = await request(app.getHttpServer())
      .post('/distribution/apply')
      .send({
        memberId: 'test-member-id',
        distributionCode: 'TEST123'
      })
      .expect(201);
    
    expect(response.body.code).toBe(200);
  });
});
```

#### 5.1.3 性能测试
```typescript
// 性能测试示例
describe('Performance Tests', () => {
  it('should handle 1000 concurrent distribution calculations', async () => {
    const promises = Array(1000).fill(null).map(() => 
      distributionService.calculateCommission(100, 1)
    );
    
    const startTime = Date.now();
    const results = await Promise.all(promises);
    const endTime = Date.now();
    
    expect(endTime - startTime).toBeLessThan(1000); // 1秒内完成
    expect(results.every(r => r === 10)).toBe(true);
  });
});
```

### 5.2 代码质量保证

#### 5.2.1 代码规范检查
```json
// .eslintrc.json
{
  "extends": [
    "@typescript-eslint/recommended",
    "prettier"
  ],
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "prefer-const": "error",
    "no-var": "error"
  }
}
```

#### 5.2.2 代码覆盖率要求
```json
// jest.config.js
module.exports = {
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
```

## 6. 团队配置与管理

### 6.1 团队角色配置

**建议团队配置 (6-8人):**

| 角色 | 人数 | 主要职责 |
|------|------|----------|
| 技术负责人 | 1 | 架构设计、技术决策、代码审查 |
| 后端开发工程师 | 3-4 | API开发、业务逻辑实现 |
| 前端对接工程师 | 1 | API联调、前端兼容性测试 |
| 测试工程师 | 1 | 测试用例编写、自动化测试 |
| DevOps工程师 | 1 | 部署、监控、运维 |

### 6.2 开发流程

#### 6.2.1 Git工作流
```
main (生产分支)
├── develop (开发分支)
│   ├── feature/distribution (功能分支)
│   ├── feature/promotion (功能分支)
│   └── feature/wallet (功能分支)
├── release/v1.0 (发布分支)
└── hotfix/bug-fix (热修复分支)
```

#### 6.2.2 代码审查流程
1. **Feature分支开发**
2. **单元测试编写**
3. **代码提交和PR创建**
4. **Code Review (至少2人审查)**
5. **自动化测试通过**
6. **合并到develop分支**
7. **集成测试**
8. **发布到测试环境**
9. **UAT测试**
10. **发布到生产环境**

### 6.3 项目管理

#### 6.3.1 迭代管理
- **迭代周期**: 2周
- **需求管理**: 使用Jira或类似工具
- **进度跟踪**: 每周进度汇报
- **风险管理**: 风险识别和应对措施

#### 6.3.2 质量门禁
- **代码质量**: SonarQube扫描通过
- **测试覆盖率**: 最低80%
- **性能基准**: 接口响应时间<500ms
- **安全扫描**: 无高危漏洞

## 7. 风险管理

### 7.1 技术风险及应对

| 风险项 | 风险等级 | 应对措施 |
|--------|----------|----------|
| API兼容性问题 | 高 | 建立完整的API测试套件，定期对比验证 |
| 性能瓶颈 | 中 | 早期性能测试，持续优化 |
| 数据迁移复杂性 | 中 | 制定详细迁移方案，充分测试 |
| 团队技能不足 | 中 | 技术培训，代码审查，外部支持 |

### 7.2 进度风险及应对

| 风险项 | 风险等级 | 应对措施 |
|--------|----------|----------|
| 需求变更 | 高 | 需求冻结机制，变更影响评估 |
| 人员流失 | 中 | 知识文档化，交叉培训 |
| 技术难点 | 中 | 技术预研，专家咨询 |
| 集成问题 | 中 | 早期集成测试，持续集成 |

## 8. 成功指标

### 8.1 功能完整性指标
- **API端点完成率**: 29.5% (73/247) - 剩余174个端点待开发
- **功能模块完成率**: 37.5% (3/8)
- **数据模型完成率**: 约35% (35+/100+)

### 8.2 质量指标
- **代码覆盖率**: ≥80%
- **API响应时间**: ≤500ms (95%的请求)
- **系统可用性**: ≥99.9%
- **错误率**: ≤0.1%

### 8.3 兼容性指标
- **API接口兼容性**: 100% (前端无需修改)
- **数据格式兼容性**: 100%
- **业务逻辑一致性**: 100%

## 9. 总结

本开发计划旨在通过系统化的分阶段实施，确保MallEcoAPI能够完全平替Java版本后端，实现以下核心价值：

### 9.1 技术价值
- 保持现代化技术栈优势
- 建立企业级系统架构
- 实现高性能和高可用

### 9.2 业务价值
- 完整的电商功能体系
- 优秀的用户体验
- 强大的扩展能力

### 9.3 团队价值
- 技术能力提升
- 开发流程规范化
- 质量体系建立

通过严格执行此开发计划，预期在12-18个月内完成完整的系统平替，为业务发展提供强有力的技术支撑。