# MallEcoAPI 开发指南

## 📋 目录

- [项目概述](#项目概述)
- [环境搭建](#环境搭建)
- [项目结构](#项目结构)
- [开发规范](#开发规范)
- [模块开发](#模块开发)
- [测试指南](#测试指南)
- [调试技巧](#调试技巧)
- [常见问题](#常见问题)

---

## 项目概述

MallEcoAPI 是一个基于 NestJS 的企业级商城系统后端API，采用 TypeScript 开发，支持微服务架构。

### 技术栈

- **框架**: NestJS 11.x
- **语言**: TypeScript 5.x
- **数据库**: MySQL 8.0+ (TypeORM)
- **缓存**: Redis (可选)
- **消息队列**: RabbitMQ (可选)
- **认证**: JWT (Passport)
- **文档**: Swagger/OpenAPI

---

## 环境搭建

### 前置要求

- Node.js 18.x 或更高版本
- npm 9.x 或更高版本
- MySQL 8.0+ (可选，开发环境)
- Redis (可选，用于缓存和限流)

### 安装步骤

1. **克隆项目**
```bash
git clone <repository-url>
cd MallEcoAPI
```

2. **安装依赖**
```bash
npm install
```

3. **配置环境变量**
```bash
cp config/.env.example config/.env
# 编辑 config/.env 文件，配置数据库、Redis等
```

4. **初始化数据库** (可选)
```bash
npm run db:init
npm run db:setup
```

5. **启动开发服务器**
```bash
npm run start:dev
```

6. **访问API文档**
```
http://localhost:3001/api-docs
```

---

## 项目结构

```
MallEcoAPI/
├── src/
│   ├── modules/              # 业务模块
│   │   ├── auth/            # 认证模块
│   │   ├── users/           # 用户模块
│   │   ├── goods/           # 商品模块
│   │   ├── orders/          # 订单模块
│   │   └── ...
│   ├── shared/              # 共享模块
│   │   ├── aop/            # AOP模块（防重复提交、限流）
│   │   ├── decorators/     # 装饰器
│   │   ├── filters/        # 过滤器
│   │   ├── guards/         # 守卫
│   │   ├── interceptors/   # 拦截器
│   │   ├── utils/         # 工具类
│   │   └── events/         # 事件系统
│   ├── infrastructure/     # 基础设施
│   │   ├── cache/          # 缓存服务
│   │   ├── database/       # 数据库服务
│   │   └── monitoring/     # 监控服务
│   ├── config/             # 配置文件
│   └── main.ts             # 应用入口
├── test/                    # 测试文件
├── docs/                    # 文档
├── config/                 # 配置文件目录
└── package.json
```

---

## 开发规范

### 代码风格

1. **命名规范**
   - 文件名：kebab-case (如: `user.service.ts`)
   - 类名：PascalCase (如: `UserService`)
   - 函数/变量：camelCase (如: `getUserById`)
   - 常量：UPPER_SNAKE_CASE (如: `MAX_RETRY_COUNT`)

2. **TypeScript规范**
   - 使用严格模式
   - 避免使用 `any` 类型
   - 使用接口定义数据结构
   - 使用枚举定义常量

3. **代码格式化**
   - 使用 Prettier 自动格式化
   - 使用 ESLint 进行代码检查
   - 提交前自动运行 lint-staged

### Git规范

**提交信息格式**:
```
type(scope): description

[optional body]

[optional footer]
```

**Type类型**:
- `feat`: 新功能
- `fix`: 修复bug
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 代码重构
- `test`: 测试相关
- `chore`: 构建或工具相关
- `perf`: 性能优化

**示例**:
```bash
git commit -m "feat(orders): 添加订单创建接口"
git commit -m "fix(auth): 修复JWT token过期问题"
```

---

## 模块开发

### 创建新模块

1. **使用NestJS CLI**
```bash
nest generate module modules/example
nest generate controller modules/example
nest generate service modules/example
```

2. **手动创建** (推荐)
```
modules/example/
├── dto/
│   ├── create-example.dto.ts
│   └── update-example.dto.ts
├── entities/
│   └── example.entity.ts
├── example.controller.ts
├── example.service.ts
└── example.module.ts
```

### 模块结构示例

**example.module.ts**
```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExampleController } from './example.controller';
import { ExampleService } from './example.service';
import { ExampleEntity } from './entities/example.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ExampleEntity])],
  controllers: [ExampleController],
  providers: [ExampleService],
  exports: [ExampleService],
})
export class ExampleModule {}
```

**example.service.ts**
```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExampleEntity } from './entities/example.entity';

@Injectable()
export class ExampleService {
  constructor(
    @InjectRepository(ExampleEntity)
    private readonly exampleRepo: Repository<ExampleEntity>,
  ) {}

  async findAll(): Promise<ExampleEntity[]> {
    return this.exampleRepo.find();
  }
}
```

**example.controller.ts**
```typescript
import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ExampleService } from './example.service';

@ApiTags('示例模块')
@Controller('example')
export class ExampleController {
  constructor(private readonly exampleService: ExampleService) {}

  @Get()
  @ApiOperation({ summary: '获取示例列表' })
  async findAll() {
    return this.exampleService.findAll();
  }
}
```

### 使用AOP装饰器

**防重复提交**
```typescript
import { PreventDuplicateSubmissions } from '@shared/aop/decorators/prevent-duplicate-submissions.decorator';

@Post()
@PreventDuplicateSubmissions({ expire: 5 }) // 5秒内防重复
async create(@Body() dto: CreateDto) {
  // ...
}
```

**限流点**
```typescript
import { LimitPoint, LimitTypeEnum } from '@shared/aop/decorators/limit-point.decorator';

@Get()
@LimitPoint({ limit: 100, period: 60, limitType: LimitTypeEnum.IP })
async findAll() {
  // ...
}
```

---

## 测试指南

### 单元测试

**运行测试**
```bash
# 运行所有测试
npm test

# 运行测试并生成覆盖率报告
npm run test:cov

# 监听模式
npm run test:watch

# 运行特定测试文件
npm test -- example.service.spec.ts
```

**测试示例**
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExampleService } from './example.service';
import { ExampleEntity } from './entities/example.entity';

describe('ExampleService', () => {
  let service: ExampleService;
  let repository: Repository<ExampleEntity>;

  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExampleService,
        {
          provide: getRepositoryToken(ExampleEntity),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ExampleService>(ExampleService);
    repository = module.get<Repository<ExampleEntity>>(
      getRepositoryToken(ExampleEntity),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return all examples', async () => {
    const mockData = [{ id: 1, name: 'test' }];
    mockRepository.find.mockResolvedValue(mockData);

    const result = await service.findAll();

    expect(result).toEqual(mockData);
    expect(mockRepository.find).toHaveBeenCalled();
  });
});
```

### 集成测试

**运行集成测试**
```bash
npm run test:e2e
```

---

## 调试技巧

### VS Code调试配置

创建 `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug NestJS",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "start:debug"],
      "console": "integratedTerminal",
      "sourceMaps": true,
      "restart": true,
      "protocol": "inspector"
    }
  ]
}
```

### 日志调试

```typescript
import { Logger } from '@nestjs/common';

export class ExampleService {
  private readonly logger = new Logger(ExampleService.name);

  async someMethod() {
    this.logger.log('Info message');
    this.logger.warn('Warning message');
    this.logger.error('Error message', error.stack);
    this.logger.debug('Debug message');
  }
}
```

---

## 常见问题

### 1. 数据库连接失败

**问题**: 无法连接到MySQL数据库

**解决方案**:
- 检查 `config/.env` 中的数据库配置
- 确认MySQL服务已启动
- 检查防火墙设置
- 验证数据库用户权限

### 2. 端口被占用

**问题**: 端口3001已被占用

**解决方案**:
```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3001 | xargs kill -9
```

### 3. 依赖安装失败

**问题**: npm install 失败

**解决方案**:
```bash
# 清除缓存
npm cache clean --force

# 删除node_modules和package-lock.json
rm -rf node_modules package-lock.json

# 重新安装
npm install
```

### 4. TypeScript编译错误

**问题**: 类型错误

**解决方案**:
- 检查 `tsconfig.json` 配置
- 确保所有类型定义正确
- 运行 `npm run type-check` 检查类型

---

## 性能优化建议

1. **数据库查询优化**
   - 使用索引
   - 避免N+1查询
   - 使用批量查询
   - 合理使用分页

2. **缓存策略**
   - 热点数据缓存
   - 使用缓存保护服务
   - 设置合理的TTL

3. **API优化**
   - 使用防重复提交
   - 合理使用限流
   - 异步处理耗时操作

---

## 相关文档

- [API文档指南](./API_DOCUMENTATION_GUIDE.md)
- [Swagger最佳实践](./SWAGGER_BEST_PRACTICES.md)
- [AOP使用指南](./AOP_USAGE_GUIDE.md)
- [工具类使用指南](./UTILS_USAGE_GUIDE.md)
- [架构文档](./ARCHITECTURE.md)

---

**最后更新**: 2024-12-19

