# 分销系统模块

## 模块概述

分销系统是MallEcoAPI的核心模块之一，实现了完整的多级分销功能，包括分销员管理、分销商品管理、分销订单管理和分销财务管理。

## 功能特性

### 1. 分销员管理
- ✅ 分销员申请和审核
- ✅ 分销员信息管理
- ✅ 分销员状态管理
- ✅ 分销员团队管理
- ✅ 分销员统计信息

### 2. 分销商品管理
- ✅ 分销商品设置
- ✅ 分销规则配置
- ✅ 多级佣金设置
- ✅ 分销商品统计
- ✅ 分销商品上下架

### 3. 分销订单管理
- ✅ 分销订单创建
- ✅ 多级分销链路
- ✅ 佣金计算和结算
- ✅ 订单状态同步
- ✅ 退款处理

### 4. 分销财务管理
- ✅ 提现申请和审核
- ✅ 佣金冻结和解冻
- ✅ 提现记录管理
- ✅ 财务统计报表
- ✅ 佣金历史记录

## 文件结构

```
distribution/
├── entities/                    # 实体类
│   ├── distribution.entity.ts    # 分销员实体
│   ├── distribution-cash.entity.ts # 提现记录实体
│   ├── distribution-goods.entity.ts # 分销商品实体
│   ├── distribution-order.entity.ts # 分销订单实体
│   └── distribution-level.entity.ts # 分销等级实体
├── dto/                       # 数据传输对象
│   ├── distribution-apply.ts    # 分销员申请DTO
│   ├── distribution-audit.ts    # 分销员审核DTO
│   ├── distribution-query.ts    # 分销员查询DTO
│   ├── distribution-cash-apply.ts # 提现申请DTO
│   └── distribution-goods-create.ts # 分销商品创建DTO
├── distribution.service.ts      # 分销员服务
├── distribution-cash.service.ts # 提现管理服务
├── distribution-goods.service.ts # 分销商品服务
├── distribution-order.service.ts # 分销订单服务
├── distribution.module.ts      # 分销模块定义
└── README.md                  # 模块说明文档
```

## API接口

### 买家端接口
- `POST /buyer/distribution/apply` - 申请成为分销员
- `GET /buyer/distribution/my-info` - 获取我的分销信息
- `GET /buyer/distribution/team` - 获取我的团队
- `GET /buyer/distribution/commission-summary` - 获取佣金汇总
- `GET /buyer/distribution/commission-records` - 获取佣金记录
- `POST /buyer/distribution/cash-apply` - 申请提现
- `GET /buyer/distribution/cash-records` - 获取提现记录
- `GET /buyer/distribution/share-link` - 获取分享链接
- `GET /buyer/distribution/rankings` - 获取排行榜
- `GET /buyer/distribution/statistics` - 获取统计数据

### 管理端接口
- `GET /manager/distribution/list` - 获取分销员列表
- `GET /manager/distribution/:id` - 获取分销员详情
- `POST /manager/distribution/audit` - 审核分销员申请
- `PUT /manager/distribution/:id/status` - 更新分销员状态
- `GET /manager/distribution/:id/team` - 获取分销员团队
- `GET /manager/distribution/statistics/overview` - 分销数据统计概览
- `GET /manager/distribution/statistics/rankings` - 分销员排行榜
- `GET /manager/distribution/cash/list` - 获取提现申请列表
- `POST /manager/distribution/cash/audit` - 审核提现申请
- `POST /manager/distribution/cash/process` - 处理提现
- `GET /manager/distribution/order/list` - 获取分销订单列表
- `GET /manager/distribution/order/:id` - 获取分销订单详情
- `GET /manager/distribution/commission/summary` - 佣金结算汇总
- `POST /manager/distribution/commission/settle` - 批量结算佣金

## 数据模型

### 分销员 (Distribution)
```typescript
{
  id: string;                    // 分销员ID
  memberId: string;               // 会员ID
  memberName: string;             // 会员姓名
  distributionCode: string;       // 分销码
  parentId: string;               // 上级分销员ID
  level: number;                 // 分销等级
  totalCommission: number;        // 累计佣金
  availableCommission: number;     // 可提现佣金
  frozenCommission: number;       // 冻结佣金
  status: number;                 // 状态
  // ... 其他字段
}
```

### 分销商品 (DistributionGoods)
```typescript
{
  id: string;                    // 分销商品ID
  productId: string;             // 商品ID
  distributionType: number;       // 分销类型
  distributionAmount: number;     // 分销金额
  level1Commission: number;      // 一级佣金比例
  level2Commission: number;      // 二级佣金比例
  level3Commission: number;      // 三级佣金比例
  status: number;                // 状态
  // ... 其他字段
}
```

### 分销订单 (DistributionOrder)
```typescript
{
  id: string;                    // 分销订单ID
  orderId: string;               // 订单ID
  distributionId: string;        // 分销员ID
  commissionAmount: number;      // 佣金金额
  totalCommission: number;       // 总佣金
  commissionStatus: number;      // 佣金状态
  distributionLevel: number;      // 分销层级
  // ... 其他字段
}
```

### 提现记录 (DistributionCash)
```typescript
{
  id: string;                    // 提现记录ID
  distributionId: string;        // 分销员ID
  cashNo: string;                // 提现单号
  cashAmount: number;            // 提现金额
  cashFee: number;               // 提现手续费
  actualAmount: number;          // 实际到账金额
  status: number;                // 状态
  // ... 其他字段
}
```

## 业务流程

### 分销员申请流程
1. 会员提交分销员申请
2. 系统生成分销码和分销员记录
3. 管理员审核申请
4. 审核通过后成为正式分销员

### 分销商品设置流程
1. 卖家选择商品设置为分销商品
2. 配置分销规则和佣金比例
3. 分销商品上线
4. 分销员可推广商品

### 分销订单创建流程
1. 用户通过分销链接购买商品
2. 系统识别分销码和分销员
3. 创建分销订单记录
4. 订单完成后结算佣金

### 提现申请流程
1. 分销员申请提现
2. 系统冻结相应佣金
3. 管理员审核提现申请
4. 审核通过后处理提现

## 配置说明

### 分销规则配置
- **分销等级**: 支持1-3级分销
- **佣金计算**: 支持按比例和按金额两种方式
- **最低提现金额**: 默认10元
- **提现手续费**: 默认0.3%，最低2元

### 状态定义
- **分销员状态**: 0-待审核，1-已通过，2-已拒绝，3-已禁用
- **分销商品状态**: 0-未启用，1-已启用，2-已禁用
- **提现状态**: 0-待审核，1-审核通过，2-审核拒绝，3-处理中，4-已完成，5-已取消

## 使用示例

### 申请成为分销员
```typescript
const applyDto = {
  applyReason: '我想成为分销员，推广优质商品',
  distributionCode: 'ABC123', // 推荐人分销码
};

const result = await distributionService.applyDistribution('memberId', applyDto);
```

### 设置分销商品
```typescript
const createDto = {
  productId: 'product-123',
  distributionType: 0, // 按比例
  level1Commission: 10, // 一级10%
  level2Commission: 5,  // 二级5%
  level3Commission: 2,  // 三级2%
};

const result = await distributionGoodsService.createDistributionGoods(createDto, 'storeId', 'storeName');
```

### 申请提现
```typescript
const cashApplyDto = {
  cashAmount: 100,
  cashType: 0, // 银行卡
  accountNo: '6222021234567890',
  accountName: '张三',
  bankName: '工商银行',
};

const result = await distributionCashService.applyCash('distributionId', cashApplyDto);
```

## 注意事项

1. **安全性**: 所有佣金操作都在事务中执行，确保数据一致性
2. **性能**: 大量查询使用批量操作和缓存优化
3. **扩展性**: 模块化设计，便于后续功能扩展
4. **兼容性**: API接口完全兼容Java版本

## 后续优化

1. **性能优化**: 添加缓存机制，优化复杂查询
2. **功能扩展**: 增加分销员等级、奖励机制等
3. **数据统计**: 完善统计分析功能
4. **移动端适配**: 优化移动端分销体验

## 版本信息

- **当前版本**: v1.0.0
- **开发状态**: 已完成
- **测试状态**: 待测试
- **文档状态**: 已完善

---

该模块是MallEcoAPI项目的重要组成部分，为电商平台提供了完整的分销功能支持。